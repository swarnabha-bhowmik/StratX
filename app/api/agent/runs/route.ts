import { NextRequest, NextResponse } from "next/server";
import { currentUser, auth } from "@clerk/nextjs/server";
import { db, AgentRun, AgentConfig } from "@/db";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    let userEmail: string | null = null;

    try {
      const user = await currentUser().catch(() => null);
      userEmail = user?.primaryEmailAddress?.emailAddress ?? null;
    } catch {}

    if (!userEmail) {
      const authObj = await auth().catch(() => null);
      if (!authObj?.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    if (!userEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    const { searchParams } = req.nextUrl;
    const statusFilter = searchParams.get("status");
    const agentIdFilter = searchParams.get("agentId");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 50;

    // Build conditional where clauses
    const conditions = [eq(AgentRun.userEmail, userEmail)];

    if (statusFilter && statusFilter !== "all") {
      if (statusFilter === "running") {
        conditions.push(inArray(AgentRun.status, ["running", "queued"]));
      } else {
        conditions.push(eq(AgentRun.status, statusFilter));
      }
    }

    if (agentIdFilter) {
      conditions.push(eq(AgentRun.agentid, agentIdFilter));
    }

    // Run query for list + aggregate stats
    const [runsList, statsRes] = await Promise.all([
      db
        .select({
          id: AgentRun.id,
          agentId: AgentRun.agentid,
          agentName: AgentConfig.name,
          agentImg: AgentConfig.agentImg,
          status: AgentRun.status,
          scheduledFor: AgentRun.scheduledFor,
          timezone: AgentRun.timezone,
          output: AgentRun.output,
          error: AgentRun.error,
          queuedAt: AgentRun.queuedAt,
          startedAt: AgentRun.startedAt,
          completedAt: AgentRun.completedAt,
          createdAt: AgentRun.createdAt,
        })
        .from(AgentRun)
        .leftJoin(AgentConfig, eq(AgentRun.agentid, AgentConfig.agentId))
        .where(and(...conditions))
        .orderBy(desc(AgentRun.createdAt))
        .limit(limit),

      db
        .select({
          total: sql<number>`count(*)`,
          completed: sql<number>`count(*) filter (where ${AgentRun.status} = 'completed')`,
          running: sql<number>`count(*) filter (where ${AgentRun.status} in ('running', 'queued'))`,
          scheduled: sql<number>`count(*) filter (where ${AgentRun.status} = 'scheduled')`,
          failed: sql<number>`count(*) filter (where ${AgentRun.status} = 'failed')`,
        })
        .from(AgentRun)
        .where(eq(AgentRun.userEmail, userEmail)),
    ]);

    const statsRow = statsRes[0] || {};

    const formattedRuns = runsList.map((run) => {
      let durationMs: number | null = null;
      if (run.startedAt && run.completedAt) {
        durationMs = new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime();
      }

      return {
        ...run,
        durationMs,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        total: Number(statsRow.total ?? 0),
        completed: Number(statsRow.completed ?? 0),
        running: Number(statsRow.running ?? 0),
        scheduled: Number(statsRow.scheduled ?? 0),
        failed: Number(statsRow.failed ?? 0),
      },
      runs: formattedRuns,
    });
  } catch (error: any) {
    console.error("Error in /api/agent/runs:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch runs" },
      { status: 500 }
    );
  }
}
