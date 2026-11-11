import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db, AgentConfig } from "@/db";
import { eq } from "drizzle-orm";
import { executeAgent } from "@/lib/executeAgent";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser().catch(() => null);
        let { agentConfig, agentId, input } = await req.json().catch(() => ({}));

        if (!agentConfig) {
            if (!agentId) {
                return NextResponse.json({ error: "agentId or agentConfig is required" }, { status: 400 });
            }

            const res = await db.select().from(AgentConfig).where(eq(AgentConfig.agentId, agentId));
            agentConfig = res[0];
        }

        if (!agentConfig) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        const userEmail = user?.primaryEmailAddress?.emailAddress || agentConfig?.userEmail || "";
        if (!userEmail) {
            return NextResponse.json({ error: "User email is required to run the agent" }, { status: 401 });
        }

        const promptInput = typeof input === "string" ? input.trim() : input;

        const res = await executeAgent(
            agentConfig,
            userEmail,
            promptInput || ""
        );

        return NextResponse.json(res);
    } catch (err: any) {
        console.error("Error in agent run route:", err);
        return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
    }
}
