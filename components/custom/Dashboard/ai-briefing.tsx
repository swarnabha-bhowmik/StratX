import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DashboardStats } from "@/lib/dashboard";

// Simple deterministic summary. To make it truly "AI", swap this for
// generateText() from "ai" with @ai-sdk/groq or @ai-sdk/google, passing
// the stats (and recent run logs) as context, and cache the result.
function buildBriefing({ completed, running, scheduled, attention }: DashboardStats) {
  const parts: string[] = [];
  parts.push(`Your agents completed ${completed} task${completed === 1 ? "" : "s"} recently.`);
  parts.push(
    running === 0
      ? "No agents are running right now."
      : `${running} agent${running === 1 ? " is" : "s are"} running right now.`
  );
  parts.push(
    attention === 0
      ? "Everything looks clear."
      : `${attention} run${attention === 1 ? " needs" : "s need"} your review.`
  );
  if (scheduled > 0) {
    parts.push(`${scheduled} run${scheduled === 1 ? " is" : "s are"} scheduled next.`);
  }
  return parts.join(" ");
}

export function AiBriefing({ stats }: { stats: DashboardStats }) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* gradient accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-sky-500 via-60% to-fuchsia-500" />

      <div className="flex gap-4 p-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          <Sparkles className="size-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Your AI briefing</h2>
            <Badge variant="secondary" className="rounded-full text-xs font-normal">
              Updated just now
            </Badge>
          </div>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {buildBriefing(stats)}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge className="gap-1.5 rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 className="size-3.5" />
                {stats.completed} completed
              </Badge>
              <Badge className="gap-1.5 rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-sky-700 hover:bg-sky-50 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300">
                <Zap className="size-3.5" />
                {stats.running} running
              </Badge>
              <Badge className="gap-1.5 rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                <AlertTriangle className="size-3.5" />
                {stats.attention} needs attention
              </Badge>
            </div>

            <Link
              href="/runs"
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-700 hover:underline dark:text-indigo-400"
            >
              View all runs <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
