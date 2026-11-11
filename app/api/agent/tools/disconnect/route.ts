import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateAgentSession, APP_TO_COMPOSIO_SLUG_MAP } from "@/lib/agentSession";
import { composio } from "@/lib/composio";
import { db, AgentConfig } from "@/db";
import { eq } from "drizzle-orm";
import { getWhatsAppInstanceName, logoutWhatsAppInstance, deleteWhatsAppInstance } from "@/lib/evolution";

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

        // WhatsApp is managed directly via Evolution API
        if (toolSlug.toLowerCase() === "whatsapp") {
            const instanceName = getWhatsAppInstanceName(userEmail);
            await deleteWhatsAppInstance(instanceName);
            return NextResponse.json({
                success: true,
                toolSlug: "whatsapp",
                message: "WhatsApp disconnected successfully",
            });
        }

        const composioSlug = APP_TO_COMPOSIO_SLUG_MAP[toolSlug.toLowerCase()] || toolSlug;
        let deletedAccountsCount = 0;

        // 1. Try to find the connected account ID via the session toolkits
        try {
            const session = await getOrCreateAgentSession(agentConfig, userEmail);
            const tkRes = await session.toolkits().catch(() => null);
            const items = tkRes?.items || [];

            const toolKit = items.find((item: any) => {
                const itemSlug = item?.slug?.toLowerCase();
                const targetSlug = toolSlug.toLowerCase();
                const targetComposio = composioSlug.toLowerCase();
                return (
                    itemSlug === targetSlug ||
                    itemSlug === targetComposio ||
                    itemSlug === targetSlug.replace(/[_-]/g, "") ||
                    itemSlug === targetComposio.replace(/[_-]/g, "")
                );
            });

            const connectedAccountId = toolKit?.connection?.connectedAccount?.id;
            if (connectedAccountId) {
                await composio.connectedAccounts.delete(connectedAccountId);
                deletedAccountsCount++;
            }
        } catch (sessionErr) {
            console.warn("Session toolkit lookup for disconnect failed:", sessionErr);
        }

        // 2. Also search directly in user's connected accounts to ensure all active accounts for this toolkit are deleted
        try {
            const list = await composio.connectedAccounts.list({ userIds: [userEmail] });
            const matchingAccounts = (list?.items || []).filter((item: any) => {
                const itemSlug = item?.toolkit?.slug?.toLowerCase();
                const targetSlug = toolSlug.toLowerCase();
                const targetComposio = composioSlug.toLowerCase();
                return (
                    (itemSlug === targetSlug ||
                        itemSlug === targetComposio ||
                        itemSlug === targetSlug.replace(/[_-]/g, "") ||
                        itemSlug === targetComposio.replace(/[_-]/g, "")) &&
                    item?.status === "ACTIVE"
                );
            });

            for (const acc of matchingAccounts) {
                try {
                    await composio.connectedAccounts.delete(acc.id);
                    deletedAccountsCount++;
                } catch (delErr) {
                    console.warn(`Failed to delete connected account ${acc.id}:`, delErr);
                }
            }
        } catch (listErr) {
            console.warn("Direct connected accounts list lookup failed:", listErr);
        }

        return NextResponse.json({
            success: true,
            toolSlug,
            composioSlug,
            deletedAccountsCount,
            message: `${toolSlug} disconnected successfully`,
        });
    } catch (error: any) {
        console.error("Error in /api/agent/tools/disconnect:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to disconnect tool" },
            { status: 500 }
        );
    }
}
