import { CreatedAgent } from "@/components/custom/Agents/CreateAgent"
import { composio } from "./composio"
import { db, AgentConfig } from "@/db"
import { eq } from "drizzle-orm"

export const APP_TO_COMPOSIO_SLUG_MAP: Record<string, string> = {
    google_search: "serpapi",
    serp_search: "serpapi",
    browserbase: "browserbase_tool",
    googlecalendar: "googlecalendar",
    googlecalender: "googlecalendar",
    google_calender: "googlecalendar",
    google_calendar: "googlecalendar",
    gmail: "gmail",
    slack: "slack",
    notion: "notion",
    github: "github",
    whatsapp: "whatsapp",
};

export const COMPOSIO_TO_APP_SLUG_MAP: Record<string, string> = {
    serpapi: "serp_search",
    browserbase_tool: "browserbase",
    googlecalendar: "googlecalendar",
};

export async function getOrCreateAgentSession(agentConfig: CreatedAgent | any, userEmail: string) {
    const config = Array.isArray(agentConfig) ? agentConfig[0] : agentConfig;

    if (config?.composioSessionId) {
        try {
            const existingSession = await composio.sessions.use(config.composioSessionId);
            // Verify if the session has open toolkits (sessions created with restrictions cannot authorize new toolkits)
            const tkRes = await existingSession.toolkits().catch(() => null);
            const items = tkRes?.items || [];
            if (items.length > 5) {
                return existingSession;
            }
            console.log(
                `Existing session ${config.composioSessionId} has only ${items.length} toolkits. Upgrading to an open session...`
            );
        } catch (error) {
            console.warn("Failed to retrieve existing Composio session, creating new one:", error);
        }
    }

    let session: any;
    try {
        // Create session without restricting toolkits so all toolkits are available for inspection and connection
        session = await composio.sessions.create(userEmail);
    } catch (createErr: any) {
        console.warn("Failed to create Composio session:", createErr?.message || createErr);
        throw createErr;
    }

    if (session?.sessionId && config?.agentId) {
        await SaveComposioSessionId(config.agentId, session);
    }

    return session;
}

export const SaveComposioSessionId = async (agentId: string, session: any) => {
    if (!agentId || !session?.sessionId) return;
    try {
        await db
            .update(AgentConfig)
            .set({
                composioSessionId: session.sessionId,
            })
            .where(eq(AgentConfig.agentId, agentId));
    } catch (err) {
        console.warn("Could not save composioSessionId to DB:", err);
    }
};
