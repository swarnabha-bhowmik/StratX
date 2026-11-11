import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateAgentSession, SaveComposioSessionId, APP_TO_COMPOSIO_SLUG_MAP } from "@/lib/agentSession";
import { composio } from "@/lib/composio";
import { db, AgentConfig } from "@/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const { toolSlug, agentId } = body;

        if (!toolSlug) {
            return NextResponse.json(
                { error: "toolSlug is required" },
                { status: 400 }
            );
        }

        const user = await currentUser().catch(() => null);
        let userEmail = user?.primaryEmailAddress?.emailAddress || null;

        let agentConfig: any = null;
        if (agentId) {
            const agentConfigRows = await db
                .select()
                .from(AgentConfig)
                .where(eq(AgentConfig.agentId, agentId));
            if (agentConfigRows && agentConfigRows.length > 0) {
                agentConfig = agentConfigRows[0];
                if (!userEmail) userEmail = agentConfig.userEmail;
            }
        } else if (userEmail) {
            const userAgents = await db
                .select()
                .from(AgentConfig)
                .where(eq(AgentConfig.userEmail, userEmail))
                .limit(1);
            if (userAgents.length > 0) {
                agentConfig = userAgents[0];
            }
        }

        if (!userEmail) {
            return NextResponse.json({ error: "User email not found. Please log in." }, { status: 401 });
        }

        // WhatsApp is managed directly via Evolution API (QR Code) rather than Composio WABA
        if (toolSlug.toLowerCase() === "whatsapp") {
            return NextResponse.json({
                success: true,
                toolSlug: "whatsapp",
                composioSlug: "whatsapp",
                redirectUrl: "/dashboard/whatsapp-connect",
                status: "INITIATED",
                connectionId: null,
            });
        }

        let session = await getOrCreateAgentSession(agentConfig, userEmail);
        const composioSlug = APP_TO_COMPOSIO_SLUG_MAP[toolSlug.toLowerCase()] || toolSlug;

        let connectionReq: any;
        try {
            connectionReq = await session.authorize(composioSlug);
        } catch (authError: any) {
            console.warn(
                `Authorization with current session failed (${authError?.message}). Creating fresh open session for ${userEmail}...`
            );
            // If the current session had restrictions (e.g. ToolkitNotAllowed), create a fresh open session
            session = await composio.sessions.create(userEmail);
            if (session?.sessionId && agentConfig?.agentId) {
                await SaveComposioSessionId(agentConfig.agentId, session);
            }
            connectionReq = await session.authorize(composioSlug);
        }

        // Ensure the connected tool is registered in agentConfig.tools in DB
        try {
            let existingTools: string[] = [];
            if (Array.isArray(agentConfig?.tools)) {
                existingTools = agentConfig.tools
                    .map((t: any) => (typeof t === "string" ? t : t?.slug || t?.id || ""))
                    .filter(Boolean);
            } else if (typeof agentConfig?.tools === "string") {
                try {
                    const parsed = JSON.parse(agentConfig.tools);
                    if (Array.isArray(parsed)) {
                        existingTools = parsed
                            .map((t: any) => (typeof t === "string" ? t : t?.slug || t?.id || ""))
                            .filter(Boolean);
                    }
                } catch {
                    if (agentConfig.tools) existingTools = [agentConfig.tools];
                }
            }
            if (!existingTools.map((t) => t.toLowerCase()).includes(toolSlug.toLowerCase())) {
                const updatedTools = [...existingTools, toolSlug];
                await db
                    .update(AgentConfig)
                    .set({ tools: updatedTools })
                    .where(eq(AgentConfig.agentId, agentId));
            }
        } catch (dbErr) {
            console.warn("Could not auto-add connected tool to agentConfig.tools:", dbErr);
        }

        return NextResponse.json({
            success: true,
            toolSlug,
            composioSlug,
            redirectUrl: connectionReq?.redirectUrl || null,
            status: connectionReq?.status || "INITIATED",
            connectionId: connectionReq?.id || null,
        });
    } catch (error: any) {
        console.error("Error in /api/agent/tools/connect:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to initiate tool connection" },
            { status: 500 }
        );
    }
}
