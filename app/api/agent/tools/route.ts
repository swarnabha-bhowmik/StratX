import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db, AgentConfig } from "@/db";
import { eq } from "drizzle-orm";
import { getOrCreateAgentSession, APP_TO_COMPOSIO_SLUG_MAP } from "@/lib/agentSession";
import { getWhatsAppInstanceName, getWhatsAppConnectionState } from "@/lib/evolution";

const TOOL_DISPLAY_NAMES: Record<string, string> = {
    google_search: "Google Search",
    serp_search: "SERP Search",
    browserbase: "Browserbase",
    gmail: "Gmail",
    slack: "Slack",
    googlecalendar: "Google Calendar",
    googlecalender: "Google Calendar",
    google_calender: "Google Calendar",
    google_calendar: "Google Calendar",
    notion: "Notion",
    whatsapp: "WhatsApp",
    github: "GitHub",
};

const STANDARD_TOOLS = [
    "google_search",
    "serp_search",
    "browserbase",
    "gmail",
    "slack",
    "googlecalendar",
    "notion",
    "whatsapp",
    "github",
];

const formatToolName = (slug: string): string => {
    return (
        TOOL_DISPLAY_NAMES[slug] ||
        slug.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    );
};

const isCalendarSlug = (id: string): boolean =>
    ["googlecalendar", "googlecalender", "google_calendar", "google_calender"].includes(
        (id || "").toLowerCase()
    );

const isToolInList = (toolId: string, list: string[]): boolean => {
    if (list.includes(toolId)) return true;
    if (isCalendarSlug(toolId) && list.some(isCalendarSlug)) return true;
    return false;
};

export async function GET(req: NextRequest) {
    try {
        const agentId = req.nextUrl.searchParams.get("agentId");
        if (!agentId) {
            return NextResponse.json({ error: "agentId is required" }, { status: 400 });
        }

        const res = await db.select().from(AgentConfig).where(eq(AgentConfig.agentId, agentId));
        if (!res || res.length === 0) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        const agentConfig = res[0];

        const user = await currentUser().catch(() => null);
        const userEmail = user?.primaryEmailAddress?.emailAddress || agentConfig.userEmail;
        if (!userEmail) {
            return NextResponse.json({ error: "User email not found" }, { status: 400 });
        }

        let agentTools: string[] = [];
        if (Array.isArray(agentConfig?.tools)) {
            agentTools = agentConfig.tools
                .map((tool: any) => (typeof tool === "string" ? tool : tool?.slug || tool?.id || ""))
                .filter(Boolean);
        } else if (typeof agentConfig?.tools === "string") {
            try {
                const parsed = JSON.parse(agentConfig.tools);
                if (Array.isArray(parsed)) {
                    agentTools = parsed
                        .map((tool: any) => (typeof tool === "string" ? tool : tool?.slug || tool?.id || ""))
                        .filter(Boolean);
                } else if (parsed) {
                    agentTools = [String(parsed)];
                }
            } catch {
                agentTools = [agentConfig.tools];
            }
        }

        const onlySelected = req.nextUrl.searchParams.get("onlySelected") === "true";

        // Query all standard tools combined with any agent tools
        const toolsToInspect = onlySelected
            ? agentTools
            : Array.from(new Set([...STANDARD_TOOLS, ...agentTools]));

        // Fetch session toolkits defensively so any Composio issues don't crash the request
        let toolKitItems: any[] = [];
        try {
            const session = await getOrCreateAgentSession(agentConfig, userEmail);
            if (session && typeof session.toolkits === "function") {
                const toolKitRes = await session.toolkits();
                toolKitItems = Array.isArray(toolKitRes?.items) ? toolKitRes.items : [];
            }
        } catch (composioErr: any) {
            console.warn(
                "Composio session/toolkits retrieval failed, falling back to basic tool metadata:",
                composioErr?.message || composioErr
            );
        }

        const tools = await Promise.all(
            toolsToInspect.map(async (slug: string) => {
                if (slug.toLowerCase() === "whatsapp") {
                    const instanceName = getWhatsAppInstanceName(userEmail);
                    const stateData = await getWhatsAppConnectionState(instanceName);
                    const isConnected = stateData?.state === "open";
                    return {
                        slug,
                        name: "WhatsApp",
                        logo: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
                        isNoAuth: false,
                        isConnected,
                        isSelected: isToolInList(slug, agentTools),
                        connection: isConnected ? { isActive: true } : null,
                        authConfig: null,
                        connectedAccount: isConnected ? { id: instanceName } : null,
                    };
                }

                const composioSlug = APP_TO_COMPOSIO_SLUG_MAP[slug] || slug;

                const toolKit = toolKitItems.find((item: any) => {
                    const itemSlug = item?.slug?.toLowerCase();
                    const targetSlug = slug.toLowerCase();
                    const targetComposio = composioSlug.toLowerCase();
                    return (
                        itemSlug === targetSlug ||
                        itemSlug === targetComposio ||
                        itemSlug === targetSlug.replace(/[_-]/g, "") ||
                        itemSlug === targetComposio.replace(/[_-]/g, "")
                    );
                });

                const isConnected = Boolean(
                    toolKit?.connection?.isActive ?? (toolKit?.isNoAuth ?? false)
                );

                return {
                    slug,
                    name: toolKit?.name ?? formatToolName(slug),
                    logo: toolKit?.logo ?? `https://logos.composio.dev/api/${composioSlug}`,
                    isNoAuth: toolKit?.isNoAuth ?? false,
                    isConnected,
                    isSelected: isToolInList(slug, agentTools),
                    connection: toolKit?.connection ?? null,
                    authConfig: toolKit?.connection?.authConfig ?? null,
                    connectedAccount: toolKit?.connection?.connectedAccount ?? null,
                };
            })
        );

        return NextResponse.json(tools);
    } catch (error: any) {
        console.error("Error in /api/agent/tools:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to fetch tools" },
            { status: 500 }
        );
    }
}
