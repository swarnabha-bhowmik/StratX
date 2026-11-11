import { and, eq, asc, lte } from "drizzle-orm";
import { AgentConfig, AgentRun, db } from "@/db";
import { calculateNextRun } from "../agentSchedule";
import type { CreatedAgent } from "@/components/custom/Agents/CreateAgent";
import { executeAgent } from "../executeAgent";
import { inngest } from "./client";

export const ProcessScheduledAgent = inngest.createFunction(
    { id: "process-scheduled-agent-runs" },
    { cron: "*/15 * * * *" },
    async ({ step }) => {
        const now = new Date();
        const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
        const dueRuns = await step.run("load-due-agent-runs", async () => {
            return await db
                .select({ run: AgentRun })
                .from(AgentRun)
                .where(
                    and(
                        eq(AgentRun.status, "scheduled"),
                        lte(AgentRun.scheduledFor, nextHour)
                    )
                )
                .orderBy(asc(AgentRun.scheduledFor))
                .limit(100);
        });

        const results = [];

        for (const { run } of dueRuns) {
            const queuedRun = await step.run(`queue-agent-run-${run.id}`, async () => {
                const res = await db
                    .update(AgentRun)
                    .set({ status: "queued", queuedAt: new Date() })
                    .where(
                        and(
                            eq(AgentRun.id, run.id),
                            eq(AgentRun.status, "scheduled")
                        )
                    )
                    .returning();

                return res[0] ?? null;
            });

            if (!queuedRun) {
                results.push({
                    runId: run.id,
                    agentId: run.agentid,
                    status: "skipped",
                });
                continue;
            }

            await step.sendEvent(`send-execute-agent-event-${run.id}`, {
                name: "agent/run.execute",
                data: { runId: run.id },
            });

            results.push({
                runId: run.id,
                agentId: run.agentid,
                status: "queued",
            });
        }

        return {
            queued: results.filter((result) => result.status === "queued"),
            results,
        };
    }
);

export const ExecuteScheduledAgent = inngest.createFunction(
    { id: "execute-scheduled-agent-run" },
    { event: "agent/run.execute" },
    async ({ event, step }) => {
        const runId = event.data.runId as string | undefined;
        if (!runId) {
            throw new Error("Missing runId for scheduled agent execution");
        }

        const runData = await step.run(`load-agent-run-${runId}`, async () => {
            const res = await db
                .select({ run: AgentRun, agentConfig: AgentConfig })
                .from(AgentRun)
                .innerJoin(AgentConfig, eq(AgentRun.agentid, AgentConfig.agentId))
                .where(eq(AgentRun.id, runId))
                .limit(1);

            return res[0] ?? null;
        });

        if (!runData) {
            throw new Error(`Agent run ${runId} was not found`);
        }

        const { run, agentConfig } = runData;

        if (agentConfig?.status?.toLowerCase() !== "active") {
            return { runId: run.id, agentId: run.agentid, status: "skipped" };
        }

        try {
            await step.sleepUntil(`wait-for-scheduled-time-${runId}`, run.scheduledFor);

            const startedRun = await step.run(`mark-run-started-${run.id}`, async () => {
                const res = await db
                    .update(AgentRun)
                    .set({ status: "running", startedAt: new Date() })
                    .where(
                        and(
                            eq(AgentRun.id, run.id),
                            eq(AgentRun.status, "queued")
                        )
                    )
                    .returning();

                return res[0] ?? null;
            });

            if (!startedRun) {
                return { runId: run.id, agentId: run.agentid, status: "skipped" };
            }

            const output = await step.run(`execute-agent-${run.id}`, async () => {
                const scheduledExecutionInstruction =
                    `This run was triggered by StratX AI's scheduler. Do not create, schedule, repeat, automate, or ask how to schedule this. Execute only the underlying task for this single scheduled occurrence. If the objective mentions daily, recurring, schedule, or a time, treat that as the schedule metadata and perform the primary task immediately for this single execution.`.trim();

                const executableAgentConfig: CreatedAgent = {
                    id: agentConfig.id,
                    userEmail: agentConfig.userEmail ?? run.userEmail,
                    agentId: agentConfig.agentId,
                    name: agentConfig?.name ?? "",
                    agentImg: agentConfig.agentImg ?? "",
                    description: agentConfig.description ?? "",
                    instructions: [agentConfig.instructions ?? "", scheduledExecutionInstruction]
                        .filter(Boolean)
                        .join("\n\n"),
                    objective: agentConfig?.objective ?? "",
                    tools: agentConfig.tools,
                    skills: Array.isArray(agentConfig.skills) ? (agentConfig.skills as string[]) : [],
                    schedule: (agentConfig.schedule ?? { type: "manual" }) as CreatedAgent["schedule"],
                    outputFormat: agentConfig.outputFormat ?? "",
                    status: agentConfig.status ?? "active",
                    createdAt: String(agentConfig.createdAt),
                    composioSessionId: agentConfig.composioSessionId ?? undefined,
                };

                const input = [
                    scheduledExecutionInstruction,
                    "",
                    "Task to execute now:",
                    executableAgentConfig.objective,
                ].join("\n");

                return await executeAgent(
                    executableAgentConfig,
                    run.userEmail,
                    input
                );
            });

            await step.run(`mark-run-completed-${run.id}`, async () => {
                await db
                    .update(AgentRun)
                    .set({ status: "completed", output, completedAt: new Date() })
                    .where(eq(AgentRun.id, run.id));
            });

            const schedule = agentConfig.schedule as {
                type?: string;
                frequency?: string;
                time?: string;
                timezone?: string;
            } | null;

            if (schedule?.type === "recurring" && schedule.frequency === "daily" && schedule.time) {
                await step.run(`schedule-next-run-${run.id}`, async () => {
                    const timezone = schedule.timezone ?? run.timezone;
                    const nextRun = calculateNextRun({
                        time: schedule.time!,
                        timezone,
                        after: new Date(run.scheduledFor),
                    });

                    await db
                        .insert(AgentRun)
                        .values({
                            agentid: run.agentid,
                            userEmail: run.userEmail,
                            scheduledFor: nextRun,
                            timezone,
                            status: "scheduled",
                        })
                        .onConflictDoNothing();
                });
            }

            return { runId: run.id, agentId: run.agentid, status: "completed" };
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unknown error occurred";

            await step.run(`mark-run-failed-${run.id}`, async () => {
                await db
                    .update(AgentRun)
                    .set({ status: "failed", error: msg, completedAt: new Date() })
                    .where(eq(AgentRun.id, run.id));
            });

            return { runId: run.id, agentId: run.agentid, status: "failed", error: msg };
        }
    }
);

export const processTask = ProcessScheduledAgent;
