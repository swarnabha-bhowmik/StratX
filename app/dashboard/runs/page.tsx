"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import {
  Play,
  RotateCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Bot,
  Zap,
  ArrowRight,
  Code,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";

interface RunItem {
  id: string;
  agentId: string;
  agentName: string | null;
  agentImg: string | null;
  status: string;
  scheduledFor: string;
  timezone: string;
  output: any;
  error: string | null;
  queuedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  durationMs: number | null;
}

interface RunStats {
  total: number;
  completed: number;
  running: number;
  scheduled: number;
  failed: number;
}

export default function RunsPage() {
  const [runs, setRuns] = useState<RunItem[]>([]);
  const [stats, setStats] = useState<RunStats>({
    total: 0,
    completed: 0,
    running: 0,
    scheduled: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [triggeringRunId, setTriggeringRunId] = useState<string | null>(null);

  const fetchRuns = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await axios.get("/api/agent/runs");
      if (res.data?.success) {
        setRuns(res.data.runs || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err: any) {
      console.warn("Failed to fetch runs:", err);
      toast.add({
        type: "error",
        title: "Could not load runs",
        description: err?.response?.data?.error || "Please try again later.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  const handleRunNow = async (agentId: string, runId: string) => {
    setTriggeringRunId(runId);
    try {
      const res = await axios.post("/api/agent/run", { agentId });
      toast.add({
        type: "success",
        title: "Run Dispatched",
        description: "Agent execution has been initiated in background.",
      });
      setTimeout(() => fetchRuns(true), 1500);
    } catch (err: any) {
      console.error("Run trigger failed:", err);
      toast.add({
        type: "error",
        title: "Run Failed to Start",
        description: err?.response?.data?.error || "Failed to trigger run.",
      });
    } finally {
      setTriggeringRunId(null);
    }
  };

  const filteredRuns = runs.filter((run) => {
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "running"
        ? run.status === "running" || run.status === "queued"
        : run.status === statusFilter;

    const matchesSearch =
      !searchQuery.trim() ||
      (run.agentName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (run.error || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const formatDuration = (ms: number | null) => {
    if (ms === null || ms === undefined) return "--";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "--";
    try {
      return new Date(isoString).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-background pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-slate-200/80 dark:border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                <Play className="size-4 fill-red-600 dark:fill-red-400" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">
                Execution Runs
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-muted-foreground">
              Real-time audit log, step traces, and output payloads from autonomous agent executions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchRuns(true)}
              disabled={refreshing || loading}
              className="rounded-xl border-slate-200 bg-white dark:bg-muted text-xs font-semibold shadow-2xs hover:bg-slate-50 cursor-pointer"
            >
              <RotateCw className={`size-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Link
              href="/dashboard/agents"
              className="inline-flex items-center rounded-xl bg-blue-600 px-3 py-1.5 text-white font-semibold text-xs shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Bot className="size-3.5 mr-1.5" /> View Agents
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/90 dark:border-border bg-white dark:bg-card p-4 shadow-2xs">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Runs
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-foreground">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 dark:border-border bg-white dark:bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Completed
              </p>
              <CheckCircle2 className="size-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.completed}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 dark:border-border bg-white dark:bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Running / Queued
              </p>
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-blue-500"></span>
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.running}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 dark:border-border bg-white dark:bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Failed / Attention
              </p>
              <AlertTriangle className="size-4 text-rose-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
              {stats.failed}
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="inline-flex rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card p-1 shadow-2xs">
            {[
              { id: "all", label: "All Runs" },
              { id: "running", label: "Active" },
              { id: "completed", label: "Completed" },
              { id: "scheduled", label: "Scheduled" },
              { id: "failed", label: "Failed" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-slate-900 text-white dark:bg-muted dark:text-foreground shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 dark:text-muted-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by agent name, run ID..."
              className="h-9 pl-8.5 text-xs bg-white dark:bg-card rounded-xl border-slate-200 dark:border-border"
            />
          </div>
        </div>

        {/* Runs Content List */}
        <div className="mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-slate-200/90 dark:border-border bg-white dark:bg-card">
              <Loader2 className="size-6 text-blue-600 animate-spin" />
              <p className="mt-3 text-xs text-slate-500 font-medium">Loading execution traces...</p>
            </div>
          ) : filteredRuns.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 rounded-3xl border border-dashed border-slate-200 dark:border-border bg-white/70 dark:bg-card/50 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                <Bot className="size-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-foreground">
                No execution runs found
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm">
                {searchQuery || statusFilter !== "all"
                  ? "No runs match your current search or status filter. Try clearing the filters."
                  : "Agents execute runs on scheduled cron triggers or on-demand manually."}
              </p>
              <div className="mt-6 flex items-center gap-3">
                {searchQuery || statusFilter !== "all" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatusFilter("all");
                      setSearchQuery("");
                    }}
                    className="rounded-xl text-xs"
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Link
                    href="/dashboard/agents"
                    className="inline-flex items-center rounded-xl bg-blue-600 px-3.5 py-2 text-white font-semibold text-xs shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    Launch an Agent
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRuns.map((run) => {
                const isExpanded = expandedRunId === run.id;
                const isTriggering = triggeringRunId === run.id;

                return (
                  <div
                    key={run.id}
                    className="rounded-2xl border border-slate-200/90 dark:border-border bg-white dark:bg-card transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs overflow-hidden"
                  >
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Agent Info + Run ID */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Avatar */}
                        <img
                          src={
                            run.agentImg ||
                            `https://api.dicebear.com/10.x/clay/svg?tags=animation&seed=${run.agentId}`
                          }
                          alt={run.agentName || "Agent"}
                          className="size-10 rounded-xl bg-slate-100 dark:bg-muted object-contain p-1 border border-slate-200/80 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-foreground truncate max-w-xs">
                              {run.agentName || "Unnamed Agent"}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-muted px-1.5 py-0.5 rounded">
                              {run.id.slice(0, 8)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Created {formatDate(run.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Middle: Status Badge + Timing */}
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col sm:items-end gap-1">
                          {run.status === "completed" && (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 border font-semibold text-[11px] rounded-md gap-1">
                              <CheckCircle2 className="size-3" /> Completed
                            </Badge>
                          )}
                          {(run.status === "running" || run.status === "queued") && (
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 border font-semibold text-[11px] rounded-md gap-1">
                              <Loader2 className="size-3 animate-spin" /> In Progress
                            </Badge>
                          )}
                          {run.status === "scheduled" && (
                            <Badge className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 border font-semibold text-[11px] rounded-md gap-1">
                              <Clock className="size-3" /> Scheduled
                            </Badge>
                          )}
                          {run.status === "failed" && (
                            <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 border font-semibold text-[11px] rounded-md gap-1">
                              <AlertTriangle className="size-3" /> Failed
                            </Badge>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">
                            Duration: {formatDuration(run.durationMs)}
                          </span>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
                            className="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg"
                          >
                            <Terminal className="size-3.5 mr-1" />
                            {isExpanded ? "Hide Trace" : "View Output"}
                            {isExpanded ? (
                              <ChevronUp className="size-3.5 ml-1" />
                            ) : (
                              <ChevronDown className="size-3.5 ml-1" />
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isTriggering}
                            onClick={() => handleRunNow(run.agentId, run.id)}
                            className="h-8 px-2.5 text-xs font-semibold rounded-lg border-slate-200 hover:bg-slate-50 cursor-pointer"
                            title="Re-run this agent now"
                          >
                            {isTriggering ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Play className="size-3 fill-slate-700 text-slate-700 mr-1" />
                            )}
                            Re-run
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Output / Log Drawer */}
                    {isExpanded && (
                      <div className="border-t border-slate-200 dark:border-border bg-slate-950 p-4 text-xs font-mono text-slate-200">
                        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-slate-400 text-[11px]">
                          <span>Run Trace: {run.id}</span>
                          <span>Timezone: {run.timezone}</span>
                        </div>

                        {run.error && (
                          <div className="mb-3 rounded-lg border border-rose-800/60 bg-rose-950/40 p-3 text-rose-300">
                            <p className="font-semibold text-rose-400 flex items-center gap-1.5 mb-1">
                              <AlertTriangle className="size-3.5" /> Execution Error
                            </p>
                            <p className="text-[11px] whitespace-pre-wrap">{run.error}</p>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <p className="text-slate-400 text-[11px]">Output Payload:</p>
                          <pre className="max-h-60 overflow-auto rounded-lg bg-slate-900 p-3 text-[11px] text-emerald-400 leading-relaxed">
                            {run.output
                              ? typeof run.output === "string"
                                ? run.output
                                : JSON.stringify(run.output, null, 2)
                              : "No structured output returned for this execution."}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
