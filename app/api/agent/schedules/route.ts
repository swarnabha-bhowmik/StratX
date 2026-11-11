import { NextRequest, NextResponse } from "next/server";
import { currentUser, auth, clerkClient, verifyToken } from "@clerk/nextjs/server";
import { db, AgentConfig, AgentRun, users } from "@/db";
import { eq, and, asc, desc, sql } from "drizzle-orm";
import { calculateNextRun } from "@/lib/agentSchedule";

export const runtime = "nodejs";

async function getAuthenticatedUserEmail(req: NextRequest): Promise<string | null> {
  let userId: string | null = null;
  let user: any = null;

  try {
    const authObj: any = await auth().catch(() => null);
    userId = authObj?.userId ?? null;
  } catch {}

  try {
    user = await currentUser().catch(() => null);
    if (!userId && user?.id) userId = user.id;
  } catch {}

  if (!userId) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const rawToken = authHeader.replace("Bearer ", "").trim();
      if (rawToken && process.env.CLERK_SECRET_KEY) {
        try {
          const payload = await verifyToken(rawToken, {
            secretKey: process.env.CLERK_SECRET_KEY,
          });
          if (payload?.sub) {
            userId = payload.sub;
          }
        } catch (err) {
          console.warn("Bearer token verification failed in schedules:", err);
        }
      }
    }
  }

  if (!userId && !user) {
    return null;
  }

  let email = user?.primaryEmailAddress?.emailAddress;
  if (!email && userId) {
    try {
      const client = await clerkClient();
      const u = await client.users.getUser(userId);
      email =
        u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)?.emailAddress ||
        u.emailAddresses[0]?.emailAddress;
    } catch (e) {
      console.warn("Failed to fetch user in schedules route:", e);
    }
  }

  return email ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const email = await getAuthenticatedUserEmail(req);
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch all agents for this user
    const agentsList = await db
      .select()
      .from(AgentConfig)
      .where(eq(AgentConfig.userEmail, email))
      .orderBy(desc(AgentConfig.createdAt));

    // 2. Fetch all upcoming scheduled runs
    const scheduledRuns = await db
      .select({
        id: AgentRun.id,
        agentId: AgentRun.agentid,
        agentName: AgentConfig.name,
        agentImg: AgentConfig.agentImg,
        status: AgentRun.status,
        scheduledFor: AgentRun.scheduledFor,
        timezone: AgentRun.timezone,
        queuedAt: AgentRun.queuedAt,
        startedAt: AgentRun.startedAt,
        createdAt: AgentRun.createdAt,
      })
      .from(AgentRun)
      .innerJoin(AgentConfig, eq(AgentRun.agentid, AgentConfig.agentId))
      .where(and(eq(AgentRun.userEmail, email), eq(AgentRun.status, "scheduled")))
      .orderBy(asc(AgentRun.scheduledFor))
      .limit(50);

    // 3. Compute statistics
    let scheduledAgentsCount = 0;
    let activeSchedulesCount = 0;
    let pausedSchedulesCount = 0;

    for (const agent of agentsList) {
      const schedule = agent.schedule as any;
      const isScheduled =
        schedule &&
        (schedule.type === "recurring" || schedule.type === "once" || schedule.frequency);

      if (isScheduled) {
        scheduledAgentsCount++;
        const isActive = (agent.status || "active").toLowerCase() === "active";
        if (isActive) {
          activeSchedulesCount++;
        } else {
          pausedSchedulesCount++;
        }
      }
    }

    const nextRun = scheduledRuns.length > 0 ? scheduledRuns[0].scheduledFor : null;

    return NextResponse.json({
      success: true,
      agents: agentsList,
      scheduledRuns,
      stats: {
        totalAgents: agentsList.length,
        scheduledAgents: scheduledAgentsCount,
        activeSchedules: activeSchedulesCount,
        pausedSchedules: pausedSchedulesCount,
        upcomingRunsCount: scheduledRuns.length,
        nextRunTime: nextRun,
      },
    });
  } catch (error: any) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const email = await getAuthenticatedUserEmail(req);
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { agentId, status, schedule } = body;

    if (!agentId) {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(AgentConfig)
      .where(and(eq(AgentConfig.agentId, agentId), eq(AgentConfig.userEmail, email)));

    if (existing.length === 0) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const currentAgent = existing[0];
    const newStatus = status !== undefined ? status : currentAgent.status;
    const newSchedule = schedule !== undefined ? schedule : currentAgent.schedule;

    const updated = await db
      .update(AgentConfig)
      .set({
        status: newStatus,
        schedule: newSchedule,
      })
      .where(eq(AgentConfig.agentId, agentId))
      .returning();

    // If status is updated to paused/inactive, remove upcoming scheduled runs
    if (newStatus && newStatus.toLowerCase() !== "active") {
      await db
        .delete(AgentRun)
        .where(
          and(
            eq(AgentRun.agentid, agentId),
            eq(AgentRun.userEmail, email),
            eq(AgentRun.status, "scheduled")
          )
        );
    } else if (newStatus && newStatus.toLowerCase() === "active") {
      // If schedule is active and recurring, ensure next run is scheduled
      const s = newSchedule as any;
      if (s && (s.type === "recurring" || s.type === "recuring") && s.time) {
        const userTz = s.timezone || "UTC";
        const nextTime = calculateNextRun(s.time, userTz);

        // Delete any outdated scheduled entries and insert fresh next run
        await db
          .delete(AgentRun)
          .where(
            and(
              eq(AgentRun.agentid, agentId),
              eq(AgentRun.userEmail, email),
              eq(AgentRun.status, "scheduled")
            )
          );

        await db.insert(AgentRun).values({
          agentid: agentId,
          userEmail: email,
          scheduledFor: nextTime,
          timezone: userTz,
          status: "scheduled",
        });
      }
    }

    return NextResponse.json({ success: true, agent: updated[0] });
  } catch (error: any) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update schedule" },
      { status: 500 }
    );
  }
}
