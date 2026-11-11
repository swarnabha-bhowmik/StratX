"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import {
  CalendarClock,
  Clock,
  Play,
  RotateCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Pause,
  Bot,
  Zap,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Mail,
  Calendar,
  Layers,
  Sparkles,
  Plus,
  Loader2,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";

interface AgentScheduleConfig {
  type?: "once" | "recurring" | "manual";
  frequency?: "hourly" | "daily" | "weekly" | "monthly";
  time?: string;
  timezone?: string;
}

interface ScheduledAgent {
  id: number;
  agentId: string;
  name: string;
  agentImg: string | null;
  description: string | null;
  objective: string | null;
  tools: any;
  skills: any;
  schedule: AgentScheduleConfig | null;
  outputFormat: string | null;
  status: string;
  createdAt: string;
}

interface ScheduledRunItem {
  id: string;
  agentId: string;
  agentName: string | null;
  agentImg: string | null;
  status: string;
  scheduledFor: string;
  timezone: string;
  createdAt: string;
}

interface ScheduleStats {
  totalAgents: number;
  scheduledAgents: number;
  activeSchedules: number;
  pausedSchedules: number;
  upcomingRunsCount: number;
  nextRunTime: string | null;
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function SchedulesPage() {
  const [agents, setAgents] = useState<ScheduledAgent[]>([]);
  const [scheduledRuns, setScheduledRuns] = useState<ScheduledRunItem[]>([]);
  const [stats, setStats] = useState<ScheduleStats>({
    totalAgents: 0,
    scheduledAgents: 0,
    activeSchedules: 0,
    pausedSchedules: 0,
    upcomingRunsCount: 0,
    nextRunTime: null,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [triggeringAgentId, setTriggeringAgentId] = useState<string | null>(null);
  const [togglingAgentId, setTogglingAgentId] = useState<string | null>(null);

  // Edit schedule modal state
  const [editingAgent, setEditingAgent] = useState<ScheduledAgent | null>(null);
  const [editTime, setEditTime] = useState("09:00 AM");
  const [editFrequency, setEditFrequency] = useState<"daily" | "weekly" | "hourly">("daily");
  const [editTimezone, setEditTimezone] = useState("UTC");
  const [savingSchedule, setSavingSchedule] = useState(false);

  const fetchSchedules = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await axios.get("/api/agent/schedules");
      if (res.data?.success) {
        setAgents(res.data.agents || []);
        setScheduledRuns(res.data.scheduledRuns || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err: any) {
      console.warn("Failed to fetch schedules:", err);
      toast.add({
        type: "error",
        title: "Could not load schedules",
        description: err?.response?.data?.error || "Please try again later.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Toggle active / paused status
  const handleToggleStatus = async (agent: ScheduledAgent) => {
    setTogglingAgentId(agent.agentId);
    const newStatus = agent.status?.toLowerCase() === "active" ? "paused" : "active";

    try {
      const res = await axios.patch("/api/agent/schedules", {
        agentId: agent.agentId,
        status: newStatus,
      });

      if (res.data?.success) {
        toast.add({
          type: "success",
          title: newStatus === "active" ? "Schedule Activated" : "Schedule Paused",
          description: `${agent.name} is now ${newStatus}.`,
        });
        await fetchSchedules(true);
      }
    } catch (err: any) {
      toast.add({
        type: "error",
        title: "Update Failed",
        description: err?.response?.data?.error || "Failed to update schedule status.",
      });
    } finally {
      setTogglingAgentId(null);
    }
  };

  // Trigger manual on-demand run
  const handleRunNow = async (agentId: string, agentName: string) => {
    setTriggeringAgentId(agentId);
    try {
      const res = await axios.post("/api/agent/run", { agentId });
      if (res.data?.success || res.status === 200) {
        toast.add({
          type: "success",
          title: "Run Dispatched",
          description: `Dispatched on-demand execution for ${agentName}. Check the Runs page.`,
        });
        await fetchSchedules(true);
      }
    } catch (err: any) {
      toast.add({
        type: "error",
        title: "Execution Error",
        description: err?.response?.data?.error || "Failed to trigger run.",
      });
    } finally {
      setTriggeringAgentId(null);
    }
  };

  // Open edit schedule modal
  const handleOpenEdit = (agent: ScheduledAgent) => {
    setEditingAgent(agent);
    const s = agent.schedule;
    setEditTime(s?.time || "09:00 AM");
    setEditFrequency((s?.frequency as any) || "daily");
    setEditTimezone(s?.timezone || "UTC");
  };

  // Save updated schedule
  const handleSaveSchedule = async () => {
    if (!editingAgent) return;
    setSavingSchedule(true);

    try {
      const updatedSchedule: AgentScheduleConfig = {
        type: "recurring",
        frequency: editFrequency,
        time: editTime,
        timezone: editTimezone,
      };

      const res = await axios.patch("/api/agent/schedules", {
        agentId: editingAgent.agentId,
        status: "active",
        schedule: updatedSchedule,
      });

      if (res.data?.success) {
        toast.add({
          type: "success",
          title: "Schedule Updated",
          description: `Schedule for ${editingAgent.name} has been refreshed.`,
        });
        setEditingAgent(null);
        await fetchSchedules(true);
      }
    } catch (err: any) {
      toast.add({
        type: "error",
        title: "Save Failed",
        description: err?.response?.data?.error || "Could not save schedule.",
      });
    } finally {
      setSavingSchedule(false);
    }
  };

  // Filter agents
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const schedule = agent.schedule;
      const isRecurring =
        schedule &&
        (schedule.type === "recurring" || schedule.type === "once" || schedule.frequency);

      // Status filter
      if (statusFilter === "active" && agent.status?.toLowerCase() !== "active") return false;
      if (statusFilter === "paused" && agent.status?.toLowerCase() === "active") return false;
      if (statusFilter === "daily" && schedule?.frequency !== "daily") return false;
      if (statusFilter === "weekly" && schedule?.frequency !== "weekly") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = agent.name?.toLowerCase().includes(q);
        const matchesDesc = agent.description?.toLowerCase().includes(q);
        const matchesTime = schedule?.time?.toLowerCase().includes(q);
        const matchesTz = schedule?.timezone?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesTime && !matchesTz) return false;
      }

      return true;
    });
  }, [agents, statusFilter, searchQuery]);

  // Format destination icon
  const getDestinationBadge = (outputFormat?: string | null) => {
    const fmt = (outputFormat || "").toLowerCase();
    if (fmt.includes("whatsapp")) {
      return (
        <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px]">
          <MessageSquare className="size-3" />
          <span>WhatsApp</span>
        </Badge>
      );
    }
    if (fmt.includes("email") || fmt.includes("gmail")) {
      return (
        <Badge variant="outline" className="gap-1 border-blue-200 bg-blue-50 text-blue-700 text-[11px]">
          <Mail className="size-3" />
          <span>Email</span>
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 border-slate-200 bg-slate-50 text-slate-700 text-[11px]">
        <Bot className="size-3" />
        <span>In-App</span>
      </Badge>
    );
  };

  const formatScheduledDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Automated Schedules
            </h1>
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-900 border-none">
              Cron Hub
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Orchestrate autonomous agent recurring triggers, monitor cron execution queues, and view upcoming runs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSchedules(true)}
            disabled={refreshing}
            className="gap-2 cursor-pointer"
          >
            <RotateCw className={`size-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
            <span>{refreshing ? "Syncing..." : "Refresh"}</span>
          </Button>

          <Link href="/dashboard">
            <Button size="sm" className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
              <Plus className="size-4" />
              <span>New Scheduled Agent</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Inngest Background Daemon Banner */}
      <div className="flex items-center justify-between rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-blue-50/50 to-slate-50 p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-2xs text-indigo-600 border border-indigo-100">
            <CalendarClock className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold text-slate-900">
                Inngest Autonomous Automation Daemon
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active • 15m polling interval
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Recurring crons are processed automatically via Inngest serverless workflows without needing browser tabs open.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/runs"
          className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <span>View Execution Logs</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Active Crons */}
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Active Crons</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <CalendarClock className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-950">
            {stats.activeSchedules}
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">
            of {stats.scheduledAgents} configured agents
          </p>
        </div>

        {/* Queued Next Runs */}
        <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Upcoming In Queue</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-950">
            {stats.upcomingRunsCount}
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">
            scheduled runs awaiting trigger
          </p>
        </div>

        {/* Next Scheduled Trigger */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Next Execution</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-sm font-bold text-emerald-950 truncate">
            {stats.nextRunTime ? formatScheduledDate(stats.nextRunTime) : "None pending"}
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">
            automatic dispatch
          </p>
        </div>

        {/* Paused Automations */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Paused Automations</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <Pause className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-950">
            {stats.pausedSchedules}
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">
            manual resume available
          </p>
        </div>
      </div>

      {/* Filter & View Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scheduled agents..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Status Filters & View Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 text-xs">
            {["all", "active", "paused", "daily", "weekly"].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`rounded-md px-2.5 py-1 font-medium capitalize transition-colors cursor-pointer ${
                  statusFilter === filter
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 text-xs">
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Weekly Grid
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200">
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Loader2 className="size-6 animate-spin text-blue-600" />
            <span className="text-xs">Loading schedule configurations...</span>
          </div>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-3">
            <CalendarClock className="size-6" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">No scheduled agents found</h2>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            {searchQuery || statusFilter !== "all"
              ? "No agents match your current filters. Try resetting the search or filter options."
              : "You haven't scheduled any agents yet. Create an agent with a daily or weekly recurring schedule to automate repetitive tasks."}
          </p>
          <div className="mt-5 flex items-center gap-3">
            {searchQuery || statusFilter !== "all" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
              >
                Reset Filters
              </Button>
            ) : (
              <Link href="/dashboard">
                <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                  <Plus className="size-4 mr-1" />
                  <span>Create First Agent</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : viewMode === "list" ? (
        /* List / Timeline View */
        <div className="flex flex-col gap-3">
          {filteredAgents.map((agent) => {
            const s = agent.schedule;
            const isActive = agent.status?.toLowerCase() === "active";
            const isToggling = togglingAgentId === agent.agentId;
            const isTriggering = triggeringAgentId === agent.agentId;

            return (
              <div
                key={agent.agentId}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs md:flex-row md:items-center gap-4"
              >
                {/* Left: Agent Info */}
                <div className="flex items-start gap-4">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    {agent.agentImg ? (
                      <Image
                        src={agent.agentImg}
                        alt={agent.name}
                        width={48}
                        height={48}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-blue-50 text-blue-600">
                        <Bot className="size-6" />
                      </div>
                    )}
                    <span
                      className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-white ${
                        isActive ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {agent.name}
                      </h2>

                      {isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          Paused
                        </span>
                      )}

                      {getDestinationBadge(agent.outputFormat)}
                    </div>

                    <p className="mt-1 line-clamp-1 max-w-xl text-xs text-slate-500">
                      {agent.objective || agent.description || "No objective configured."}
                    </p>

                    {/* Schedule Badges */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50/70 border border-indigo-100 px-2.5 py-1 text-[11px] font-medium text-indigo-800">
                        <CalendarClock className="size-3 text-indigo-600" />
                        <span>
                          {s?.frequency ? s.frequency.toUpperCase() : "DAILY"} @ {s?.time || "09:00 AM"}
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200 px-2 py-1 text-[11px] text-slate-500">
                        <Clock className="size-3 text-slate-400" />
                        <span>TZ: {s?.timezone || "UTC"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(agent)}
                    disabled={isToggling}
                    className="h-8 gap-1.5 text-xs cursor-pointer"
                  >
                    {isToggling ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : isActive ? (
                      <>
                        <Pause className="size-3.5 text-amber-600" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="size-3.5 text-emerald-600" />
                        <span>Resume</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(agent)}
                    className="h-8 gap-1 text-xs cursor-pointer"
                  >
                    <SlidersHorizontal className="size-3.5 text-slate-600" />
                    <span>Adjust Time</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleRunNow(agent.agentId, agent.name)}
                    disabled={isTriggering}
                    className="h-8 gap-1.5 bg-blue-600 text-white hover:bg-blue-700 text-xs cursor-pointer"
                  >
                    {isTriggering ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Zap className="size-3.5" />
                    )}
                    <span>Run Now</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Weekly Calendar Grid View */
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {DAYS_OF_WEEK.map((day) => {
            // Find agents configured to run on this day (daily agents run on all days)
            const dayAgents = filteredAgents.filter((agent) => {
              const freq = agent.schedule?.frequency || "daily";
              return freq === "daily" || freq === "hourly";
            });

            return (
              <div
                key={day}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs min-h-[220px]"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {day}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {dayAgents.length} runs
                  </span>
                </div>

                <div className="mt-2.5 flex flex-col gap-2 flex-1">
                  {dayAgents.map((agent) => (
                    <div
                      key={agent.agentId}
                      className="group rounded-xl border border-indigo-100 bg-indigo-50/50 p-2 text-xs transition-colors hover:bg-indigo-100/70"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 truncate">
                          {agent.name}
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-indigo-700">
                          {agent.schedule?.time || "9 AM"}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
                        {agent.outputFormat || "Automated run"}
                      </p>
                    </div>
                  ))}

                  {dayAgents.length === 0 && (
                    <div className="flex flex-1 items-center justify-center text-center text-[11px] text-slate-400">
                      No crons scheduled
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upcoming Execution Queue */}
      {scheduledRuns.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Upcoming Queued Occurrences
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              {scheduledRuns.length} occurrences armed
            </span>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {scheduledRuns.slice(0, 5).map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between py-2.5 text-xs text-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="size-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-[10px]">
                    <Bot className="size-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">
                      {run.agentName || "Agent Run"}
                    </span>
                    <span className="ml-2 font-mono text-[11px] text-slate-500">
                      {run.timezone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-indigo-700">
                    {formatScheduledDate(run.scheduledFor)}
                  </span>
                  <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700 text-[10px]">
                    Armed
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {editingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in-50 duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarClock className="size-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Adjust Schedule: {editingAgent.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingAgent(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Trigger Frequency
                </label>
                <select
                  value={editFrequency}
                  onChange={(e) => setEditFrequency(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="daily">Daily (Every 24 hours)</option>
                  <option value="weekly">Weekly</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Execution Time (e.g. 09:00 AM)
                </label>
                <Input
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  placeholder="09:00 AM"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Timezone
                </label>
                <Input
                  value={editTimezone}
                  onChange={(e) => setEditTimezone(e.target.value)}
                  placeholder="UTC or America/New_York"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingAgent(null)}
                disabled={savingSchedule}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveSchedule}
                disabled={savingSchedule}
                className="bg-blue-600 text-white hover:bg-blue-700 gap-1.5"
              >
                {savingSchedule ? <Loader2 className="size-3.5 animate-spin" /> : null}
                <span>Save Schedule</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
