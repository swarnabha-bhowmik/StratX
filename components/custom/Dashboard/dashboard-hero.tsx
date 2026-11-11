"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  RefreshCw,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/lib/dashboard";

type Tone = "emerald" | "sky" | "violet" | "amber";

const toneStyles: Record<
  Tone,
  { card: string; icon: string; value: string }
> = {
  emerald: {
    card: "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900 dark:bg-emerald-950/30",
    icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400",
    value: "text-emerald-900 dark:text-emerald-200",
  },
  sky: {
    card: "border-sky-200 bg-sky-50/80 dark:border-sky-900 dark:bg-sky-950/30",
    icon: "bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400",
    value: "text-sky-900 dark:text-sky-200",
  },
  violet: {
    card: "border-violet-200 bg-violet-50/80 dark:border-violet-900 dark:bg-violet-950/30",
    icon: "bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400",
    value: "text-violet-900 dark:text-violet-200",
  },
  amber: {
    card: "border-amber-200 bg-amber-50/80 dark:border-amber-900 dark:bg-amber-950/30",
    icon: "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400",
    value: "text-amber-900 dark:text-amber-200",
  },
};

type StatConfig = {
  key: keyof DashboardStats;
  label: string;
  hint: string;
  icon: LucideIcon;
  tone: Tone;
};

const STAT_CONFIG: StatConfig[] = [
  { key: "completed", label: "Completed", hint: "finished runs", icon: CheckCircle2, tone: "emerald" },
  { key: "running", label: "Running", hint: "active agents", icon: Zap, tone: "sky" },
  { key: "scheduled", label: "Scheduled", hint: "coming up", icon: CalendarClock, tone: "violet" },
  { key: "attention", label: "Attention", hint: "need review", icon: AlertTriangle, tone: "amber" },
];

function getGreeting(date: Date) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardHero({
  userName,
  firstName,
  stats,
}: {
  userName?: string;
  firstName?: string;
  stats: DashboardStats;
}) {
  const displayName = userName || firstName || "there";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Computed on the client so it uses the viewer's own timezone
  // (and avoids a server/client hydration mismatch).
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const dateLabel = now
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(now)
    : "\u00A0";

  return (
    <section className="rounded-3xl border bg-gradient-to-br from-sky-50 via-white to-violet-50 p-6 shadow-sm dark:from-sky-950/20 dark:via-background dark:to-violet-950/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-4 text-sky-500" />
          <span>{dateLabel}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => startTransition(() => router.refresh())}
          className="rounded-lg bg-background shadow-sm"
        >
          <RefreshCw className={cn("size-4", isPending && "animate-spin")} />
          Refresh briefing
        </Button>
      </div>

      <h1 className="mt-4 text-4xl font-bold tracking-tight">
        {now ? getGreeting(now) : "Welcome"}, {displayName}
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Here&apos;s the latest pulse from your agents, runs, schedules, and
        anything that needs a closer look.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CONFIG.map(({ key, label, hint, icon: Icon, tone }) => {
          const s = toneStyles[tone];
          return (
            <div
              key={key}
              className={cn("rounded-2xl border p-4 transition-shadow hover:shadow-md", s.card)}
            >
              <div className="flex items-start justify-between">
                <div className={cn("flex size-10 items-center justify-center rounded-xl", s.icon)}>
                  <Icon className="size-5" />
                </div>
                <span className={cn("text-3xl font-bold tabular-nums", s.value)}>
                  {stats[key]}
                </span>
              </div>
              <p className={cn("mt-4 text-sm font-semibold", s.value)}>{label}</p>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
