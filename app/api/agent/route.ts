import { db, AgentConfig } from "@/db";
import { eq, desc, and } from "drizzle-orm";
import { currentUser, auth, clerkClient, verifyToken } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

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
          console.warn("Bearer token verification failed:", err);
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
      console.warn("Failed to fetch user in agent route:", e);
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

    const agents = await db
      .select()
      .from(AgentConfig)
      .where(eq(AgentConfig.userEmail, email))
      .orderBy(desc(AgentConfig.createdAt));

    return NextResponse.json(agents);
  } catch (error: any) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const email = await getAuthenticatedUserEmail(req);
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { agentId } = body;
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

    const updated = await db
      .update(AgentConfig)
      .set({
        name: body.name !== undefined ? body.name : existing[0].name,
        agentImg: body.agentImg !== undefined ? body.agentImg : existing[0].agentImg,
        description: body.description !== undefined ? body.description : existing[0].description,
        instructions: body.instructions !== undefined ? body.instructions : existing[0].instructions,
        objective: body.objective !== undefined ? body.objective : existing[0].objective,
        tools: body.tools !== undefined ? body.tools : existing[0].tools,
        skills: body.skills !== undefined ? body.skills : existing[0].skills,
        schedule: body.schedule !== undefined ? body.schedule : existing[0].schedule,
        outputFormat: body.outputFormat !== undefined ? body.outputFormat : existing[0].outputFormat,
        status: body.status !== undefined ? body.status : existing[0].status,
      })
      .where(eq(AgentConfig.agentId, agentId))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error("Error updating agent:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update agent" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const email = await getAuthenticatedUserEmail(req);
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    if (!agentId) {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 });
    }

    const deleted = await db
      .delete(AgentConfig)
      .where(and(eq(AgentConfig.agentId, agentId), eq(AgentConfig.userEmail, email)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, agentId });
  } catch (error: any) {
    console.error("Error deleting agent:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete agent" },
      { status: 500 }
    );
  }
}
