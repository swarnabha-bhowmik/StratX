import { db, AgentRun, AgentConfig } from "@/db";
import { and, desc, eq, inArray, sql } from "drizzle-orm";

export type DashboardStats = {
  completed: number;
  running: number;
  scheduled: number;
  attention: number;
};

export type RunSummary = {
  id: string;
  agentName: string;
  status: "running" | "failed" | "needs_review";
  startedAt: Date;
  message?: string;
};

export type DashboardData = {
  stats: DashboardStats;
  attention: RunSummary[];
  running: RunSummary[];
};

export async function getDashboardData(userEmail: string): Promise<DashboardData> {
  const defaultData: DashboardData = {
    stats: { completed: 0, running: 0, scheduled: 0, attention: 0 },
    attention: [],
    running: [],
  };

  if (!userEmail) {
    return defaultData;
  }

  try {
    const [statsRes, attentionRows, runningRows] = await Promise.all([
      db
        .select({
          completed: sql<number>`count(*) filter (where ${AgentRun.status} = 'completed')`,
          running: sql<number>`count(*) filter (where ${AgentRun.status} in ('running', 'queued'))`,
          scheduled: sql<number>`count(*) filter (where ${AgentRun.status} = 'scheduled')`,
          attention: sql<number>`count(*) filter (where ${AgentRun.status} = 'failed')`,
        })
        .from(AgentRun)
        .where(eq(AgentRun.userEmail, userEmail)),

      db
        .select({
          id: AgentRun.id,
          agentName: AgentConfig.name,
          status: AgentRun.status,
          startedAt: AgentRun.startedAt,
          createdAt: AgentRun.createdAt,
          error: AgentRun.error,
        })
        .from(AgentRun)
        .leftJoin(AgentConfig, eq(AgentRun.agentid, AgentConfig.agentId))
        .where(and(eq(AgentRun.userEmail, userEmail), eq(AgentRun.status, "failed")))
        .orderBy(desc(AgentRun.createdAt))
        .limit(5),

      db
        .select({
          id: AgentRun.id,
          agentName: AgentConfig.name,
          status: AgentRun.status,
          startedAt: AgentRun.startedAt,
          queuedAt: AgentRun.queuedAt,
          createdAt: AgentRun.createdAt,
        })
        .from(AgentRun)
        .leftJoin(AgentConfig, eq(AgentRun.agentid, AgentConfig.agentId))
        .where(
          and(
            eq(AgentRun.userEmail, userEmail),
            inArray(AgentRun.status, ["running", "queued"])
          )
        )
        .orderBy(desc(AgentRun.createdAt))
        .limit(5),
    ]);

    const statsRow = statsRes[0];
    const completed = Number(statsRow?.completed ?? 0);
    const runningCount = Number(statsRow?.running ?? 0);
    const scheduled = Number(statsRow?.scheduled ?? 0);
    const attentionCount = Number(statsRow?.attention ?? 0);

    const attention: RunSummary[] = attentionRows.map((r) => ({
      id: r.id,
      agentName: r.agentName || "Agent Run",
      status: "failed",
      startedAt: r.startedAt || r.createdAt,
      message: r.error || "Execution failed or needs review",
    }));

    const running: RunSummary[] = runningRows.map((r) => ({
      id: r.id,
      agentName: r.agentName || "Agent Run",
      status: "running",
      startedAt: r.startedAt || r.queuedAt || r.createdAt,
      message: r.status === "queued" ? "Queued in runner..." : "Agent running...",
    }));

    return {
      stats: {
        completed,
        running: runningCount,
        scheduled,
        attention: attentionCount,
      },
      attention,
      running,
    };
  } catch (error) {
    console.error("[getDashboardData] Failed to fetch real-time dashboard data:", error);
    return defaultData;
  }
}
