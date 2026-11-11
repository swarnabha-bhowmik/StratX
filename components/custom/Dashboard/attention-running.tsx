import Link from "next/link";
import { AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { RunSummary } from "@/lib/dashboard";

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      {count !== undefined && (
        <Badge
          variant="secondary"
          className="rounded-full bg-amber-100 px-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300"
        >
          {count}
        </Badge>
      )}
    </div>
  );
}

function RunRow({ run }: { run: RunSummary }) {
  return (
    <Link
      href={`/runs/${run.id}`}
      className="flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
    >
      <div>
        <p className="text-sm font-medium">{run.agentName}</p>
        {run.message && (
          <p className="line-clamp-1 text-xs text-muted-foreground">{run.message}</p>
        )}
      </div>
      <span className="text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
      </span>
    </Link>
  );
}

export function NeedsAttention({ runs }: { runs: RunSummary[] }) {
  return (
    <section>
      <SectionHeader title="Needs your attention" count={runs.length} />
      {runs.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 p-4 text-sm text-muted-foreground dark:border-emerald-900 dark:bg-emerald-950/20">
          <CheckCircle2 className="size-4 text-emerald-500" />
          No runs need attention right now.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {runs.map((run) => (
            <RunRow key={run.id} run={run} />
          ))}
        </div>
      )}
    </section>
  );
}

export function RunningNow({ runs }: { runs: RunSummary[] }) {
  return (
    <section>
      <SectionHeader title="Running now" />
      {runs.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-sky-300 bg-sky-50/60 p-4 text-sm text-muted-foreground dark:border-sky-900 dark:bg-sky-950/20">
          <Zap className="size-4 text-sky-500" />
          No agents are running right now.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {runs.map((run) => (
            <RunRow key={run.id} run={run} />
          ))}
        </div>
      )}
    </section>
  );
}

// Unused here, but handy if you want a failed-run icon in rows later.
export { AlertTriangle };