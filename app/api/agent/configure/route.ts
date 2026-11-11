import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { AgentConfigSystemPrompt } from "@/constants/Prompt"
import { AgentConfigResponseSchema } from "@/constants/ResponseSchema"
import { db, tools, users, AgentConfig, AgentRun, configureAgentRequestSchema } from "@/db"
import { currentUser } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import {calculateNextRun} from "@/lib/agentSchedule"

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const validation = configureAgentRequestSchema.safeParse(body);
    if (!validation.success) {
        return NextResponse.json(
            { error: "Validation failed", details: validation.error.flatten() },
            { status: 400 }
        );
    }

    const { prompt, timezone } = validation.data;

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 })
    }

    try {
        const user = await currentUser();
        const aiTools = await db.select({
            slug: tools.slug
        }).from(tools);

        // Core tools + popular Composio toolkits
        const standardToolSlugs = [
            "serp_search",
            "google_search",
            "browserbase",
            "whatsapp",
            "gmail",
            "slack",
            "notion",
            "github",
            "googlecalendar",
            "trello",
            "linear",
            "jira",
            "clickup",
            "asana",
            "hubspot",
            "discord",
            "twitter",
            "spotify",
            "airtable",
        ];
        const availableToolSlugs = Array.from(
            new Set([...aiTools.map((t) => t.slug), ...standardToolSlugs])
        ).join(", ");
        const ai = new GoogleGenAI({ apiKey });

        const contents = AgentConfigSystemPrompt
            .replace("{USER_PROMPT}", prompt)
            .replace("{AVAILABLE_TOOLS}", availableToolSlugs);

        // Fallback cascade: prioritize available/stable models
        const candidateModels = [
            "gemini-3.5-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.8-flash",
        ];

        let res: any = null;
        let lastError: any = null;

        for (const model of candidateModels) {
            try {
                res = await ai.models.generateContent({
                    model,
                    contents,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: AgentConfigResponseSchema,
                    },
                });
                if (res && res.text) break;
            } catch (err: any) {
                lastError = err;
                console.warn(`Model ${model} failed, falling back to next model:`, err?.message || err);
            }
        }

        if (!res || !res.text) {
            throw new Error(lastError?.message || "Failed to generate agent configuration with all available models.");
        }

        let aiOutput: any;
        try {
            aiOutput = JSON.parse(res.text ?? "{}");
        } catch (jsonErr) {
            console.error("Failed to parse AI output JSON:", res.text);
            throw new Error("Invalid response format received from AI model.");
        }

        if (aiOutput.status === "ready" && aiOutput.config) {
            const userEmail = user?.primaryEmailAddress?.emailAddress;
            if (userEmail) {
                // Ensure user exists in users table to satisfy foreign key constraint
                const existingUser = await db.select().from(users).where(eq(users.email, userEmail));
                if (existingUser.length === 0) {
                    await db.insert(users).values({
                        name: user.username || user.fullName || userEmail.split("@")[0] || "User",
                        email: userEmail,
                    }).onConflictDoNothing();
                }
            }

            const agentId = crypto.randomUUID();

            // Format schedule as object with frequency, time, and timezone so AgentCard renders properly
            const rawSchedule = aiOutput.config.schedule;
            const scheduleObj = {
                type:
                    typeof rawSchedule === "object" && rawSchedule !== null && rawSchedule.type
                        ? rawSchedule.type
                        : "recurring",
                frequency:
                    typeof rawSchedule === "object" && rawSchedule !== null
                        ? rawSchedule.frequency || "daily"
                        : typeof rawSchedule === "string"
                            ? rawSchedule
                            : "daily",
                time:
                    typeof rawSchedule === "object" && rawSchedule !== null
                        ? rawSchedule.time || "09:00 AM"
                        : "09:00 AM",
                ...(timezone ? { timezone } : {}),
            };

            const dbRes = await db
                .insert(AgentConfig)
                .values({
                    name: aiOutput.config.name,
                    description: aiOutput.config.description,
                    instructions: aiOutput.config.instructions,
                    objective: aiOutput.config.objective || aiOutput.config.description || prompt,
                    skills: aiOutput.config.skills || [],
                    tools: aiOutput.config.tools || [],
                    schedule: scheduleObj,
                    outputFormat: aiOutput.config.outputFormat || aiOutput.config.outputDestination || "in_app",
                    agentImg: "https://api.dicebear.com/10.x/clay/svg?tags=animation&seed=" + agentId,
                    agentId: agentId,
                    userEmail: userEmail ?? null,
                    status: "active",
                })
                .returning();
            
            const isDailyRecurring =
                (scheduleObj.type === "recurring" || scheduleObj.type === "recuring") &&
                scheduleObj.frequency === "daily";

            const userTz = timezone || scheduleObj.timezone || "UTC";

            const firstRun = isDailyRecurring
                ? calculateNextRun(scheduleObj.time, userTz)
                : null;

            if (firstRun && userEmail) {
                try {
                    await db.insert(AgentRun).values({
                        agentid: agentId,
                        userEmail: userEmail,
                        scheduledFor: firstRun,
                        timezone: userTz,
                        status: "scheduled",
                    });
                } catch (runErr) {
                    console.warn("Failed to schedule initial agent run:", runErr);
                }
            }

            // Return with status: "ready" so the client renders AgentCard
            return NextResponse.json({ ...dbRes[0], status: "ready" });
        }

        return NextResponse.json(aiOutput);
    } catch (e: any) {
        console.error("Error generating agent configuration:", e);
        return NextResponse.json(
            { error: e?.message || "Failed to generate agent configuration" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const agentConfig = await req.json();
        if (!agentConfig?.agentId) {
            return NextResponse.json({ error: "agentId is required" }, { status: 400 });
        }

        const { id, createdAt, ...updateData } = agentConfig;
        const res = await db.update(AgentConfig).set({
            ...updateData,
        }).where(eq(AgentConfig.agentId, agentConfig.agentId)).returning();

        if (!res || res.length === 0) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        return NextResponse.json(res[0]);
    } catch (e: any) {
        console.error("Error updating agent configuration:", e);
        return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
    }
}