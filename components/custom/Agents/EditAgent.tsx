"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Shuffle, Plus, X, Check, CalendarCheck2, Loader2, Link2, RefreshCw, Unlink, Search, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import Image from "next/image"
import { CreatedAgent } from "./CreateAgent"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios"
import { useAuth } from "@clerk/nextjs"
import { getToolMeta } from "./ToolIcons"

const AVAILABLE_TOOLS = [
    { id: "google_search", label: "Google Search" },
    { id: "serp_search", label: "SERP Search" },
    { id: "browserbase", label: "Browserbase" },
    { id: "gmail", label: "Gmail" },
    { id: "slack", label: "Slack" },
    { id: "googlecalendar", label: "Google Calendar" },
    { id: "notion", label: "Notion" },
    { id: "whatsapp", label: "WhatsApp" },
    { id: "github", label: "GitHub" },
]

type Props = {
    children: React.ReactNode
    agentConfig: CreatedAgent | null
    onSave?: (agent: CreatedAgent) => void
}

type EditableTool = {
    slug: string
    name: string
    logo?: string | null
    isNoAuth?: boolean
    isConnected?: boolean
}

const getToolsList = (tools: any): string[] => {
    if (Array.isArray(tools)) return tools;
    if (typeof tools === "string") {
        try {
            const parsed = JSON.parse(tools);
            return Array.isArray(parsed) ? parsed : [tools];
        } catch {
            return [tools];
        }
    }
    return [];
};

const isCalendarSlug = (id: string): boolean =>
    ["googlecalendar", "googlecalender", "google_calendar", "google_calender"].includes(
        (id || "").toLowerCase()
    );

const isToolSelected = (toolId: string, currentTools: string[]): boolean => {
    if (currentTools.includes(toolId)) return true;
    if (isCalendarSlug(toolId) && currentTools.some(isCalendarSlug)) return true;
    return false;
};

const EditAgent = ({ children, agentConfig, onSave }: Props) => {
    const { getToken } = useAuth();
    const [open, setOpen] = useState(false);
    const [draftAgent, setDraftAgent] = useState<CreatedAgent | null>(agentConfig);
    const [newSkill, setNewSkill] = useState<string>("");
    const [newTool, setNewTool] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [toolStatuses, setToolStatuses] = useState<EditableTool[]>([]);
    const [loadingTools, setLoadingTools] = useState(false);
    const [connectingTool, setConnectingTool] = useState<string | null>(null);
    const [disconnectingTool, setDisconnectingTool] = useState<string | null>(null);
    const [catalogSearch, setCatalogSearch] = useState("");
    const [catalogResults, setCatalogResults] = useState<any[]>([]);
    const [catalogLoading, setCatalogLoading] = useState(false);

    // Debounced catalog search against Composio API
    useEffect(() => {
        if (!catalogSearch.trim()) {
            setCatalogResults([]);
            setCatalogLoading(false);
            return;
        }

        const timer = setTimeout(async () => {
            setCatalogLoading(true);
            try {
                const res = await axios.get(
                    `/api/agent/tools/catalog?search=${encodeURIComponent(catalogSearch.trim())}&limit=8`
                );
                if (Array.isArray(res.data?.tools)) {
                    setCatalogResults(res.data.tools);
                }
            } catch (err) {
                console.warn("Failed to search tool catalog:", err);
            } finally {
                setCatalogLoading(false);
            }
        }, 220);

        return () => clearTimeout(timer);
    }, [catalogSearch]);

    // Reset draft state whenever the sheet is opened or agentConfig updates
    useEffect(() => {
        if (open) {
            setDraftAgent(agentConfig);
            setNewSkill("");
            setNewTool("");
        }
    }, [open, agentConfig]);

    const fetchToolStatuses = useCallback(async (showToast = false) => {
        if (!draftAgent?.agentId) return;
        setLoadingTools(true);
        try {
            const res = await axios.get<EditableTool[]>(`/api/agent/tools?agentId=${draftAgent.agentId}`);
            if (Array.isArray(res.data)) {
                setToolStatuses(res.data);
                if (showToast) {
                    toast.add({
                        type: "success",
                        title: "Connection Statuses Updated",
                        timeout: 2500,
                    });
                }
            }
        } catch (err) {
            console.warn("Could not fetch tool statuses:", err);
            if (showToast) {
                toast.add({
                    type: "error",
                    title: "Failed to update tool statuses",
                    timeout: 3000,
                });
            }
        } finally {
            setLoadingTools(false);
        }
    }, [draftAgent?.agentId]);

    // Fetch tool connection statuses when the sheet opens
    useEffect(() => {
        if (open && draftAgent?.agentId) {
            fetchToolStatuses();
        }
    }, [open, draftAgent?.agentId, fetchToolStatuses]);

    const fallbackImg = draftAgent?.agentId
        ? `https://api.dicebear.com/10.x/clay/svg?tags=animation&seed=${draftAgent.agentId}`
        : "https://api.dicebear.com/10.x/clay/svg?tags=animation&seed=default";

    const currentImg = draftAgent?.agentImg || fallbackImg;

    const shuffleImg = () => {
        const newImg = "https://api.dicebear.com/10.x/clay/svg?tags=animation&seed=" + crypto.randomUUID();
        setDraftAgent((prev: any) => ({
            ...prev,
            agentImg: newImg,
        }));
    };

    const updateDraft = (key: string, value: any) => {
        setDraftAgent((prev: any) => ({
            ...prev,
            [key]: value,
        }));
    };

    const updateSchedule = (key: string, value: string) => {
        setDraftAgent((prev: any) => {
            const currentSchedule =
                typeof prev?.schedule === "object" && prev?.schedule !== null
                    ? prev.schedule
                    : { type: typeof prev?.schedule === "string" ? prev.schedule : "manual" };

            return {
                ...prev,
                schedule: {
                    ...currentSchedule,
                    [key]: value,
                },
            };
        });
    };

    const addSkill = () => {
        if (!newSkill.trim()) return;
        const parts = newSkill.split(",").map((s) => s.trim()).filter(Boolean);
        const existing = Array.isArray(draftAgent?.skills) ? draftAgent.skills : [];
        updateDraft("skills", [...existing, ...parts.filter((p) => !existing.includes(p))]);
        setNewSkill("");
    };

    const removeSkill = (index: number) => {
        const existing = Array.isArray(draftAgent?.skills) ? draftAgent.skills : [];
        updateDraft("skills", existing.filter((_, i) => i !== index));
    };

    const toggleTool = (toolId: string) => {
        const currentTools = getToolsList(draftAgent?.tools);
        const isSelected = isToolSelected(toolId, currentTools);

        const nextTools = isSelected
            ? currentTools.filter((t) => (isCalendarSlug(toolId) ? !isCalendarSlug(t) : t !== toolId))
            : [...currentTools, toolId];

        updateDraft("tools", nextTools);
    };

    const addCustomTool = () => {
        if (!newTool.trim()) return;
        const trimmed = newTool.trim().toLowerCase().replace(/\s+/g, "_");
        const currentTools = getToolsList(draftAgent?.tools);

        if (!currentTools.includes(trimmed)) {
            updateDraft("tools", [...currentTools, trimmed]);
        }
        setNewTool("");
    };

    const selectCatalogTool = (slug: string) => {
        const normalized = slug.trim().toLowerCase();
        const currentTools = getToolsList(draftAgent?.tools);

        if (!currentTools.map((t) => t.toLowerCase()).includes(normalized)) {
            updateDraft("tools", [...currentTools, normalized]);
            toast.add({
                type: "success",
                title: `Added ${normalized} to agent`,
                timeout: 2500,
            });
        }
        setCatalogSearch("");
        setCatalogResults([]);
    };

    const handleConnectTool = async (toolId: string, event?: React.MouseEvent) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (!draftAgent?.agentId) {
            toast.add({
                type: "error",
                title: "Agent ID is required to connect tool",
                timeout: 3000,
            });
            return;
        }

        const meta = getToolMeta(toolId);
        setConnectingTool(toolId);

        try {
            const res = await axios.post("/api/agent/tools/connect", {
                agentId: draftAgent.agentId,
                toolSlug: toolId,
            });

            if (res.data?.redirectUrl) {
                // Open authorization window
                window.open(
                    res.data.redirectUrl,
                    "_blank",
                    "width=650,height=750,menubar=no,toolbar=no,location=yes"
                );

                toast.add({
                    type: "info",
                    title: `Connecting ${meta.name}...`,
                    description: "Complete authentication in the opened tab. Status updates automatically.",
                    timeout: 6000,
                });

                // Auto-select tool if not yet selected
                const currentTools = getToolsList(draftAgent?.tools);
                if (!isToolSelected(toolId, currentTools)) {
                    toggleTool(toolId);
                }

                // Poll periodically for connection confirmation
                let attempts = 0;
                const pollInterval = setInterval(async () => {
                    attempts++;
                    try {
                        const statusRes = await axios.get<EditableTool[]>(
                            `/api/agent/tools?agentId=${draftAgent.agentId}`
                        );
                        if (Array.isArray(statusRes.data)) {
                            setToolStatuses(statusRes.data);
                            const updated = statusRes.data.find(
                                (t) => t.slug?.toLowerCase() === toolId.toLowerCase()
                            );
                            if (updated?.isConnected) {
                                clearInterval(pollInterval);
                                toast.add({
                                    type: "success",
                                    title: `${meta.name} Connected Successfully!`,
                                    timeout: 4000,
                                });
                            }
                        }
                    } catch {}
                    if (attempts >= 15) {
                        clearInterval(pollInterval);
                    }
                }, 3000);
            } else {
                toast.add({
                    type: "success",
                    title: `${meta.name} is ready and connected!`,
                    timeout: 3000,
                });
                await fetchToolStatuses();
            }
        } catch (err: any) {
            console.error("Failed to connect tool:", err);
            toast.add({
                type: "error",
                title: err?.response?.data?.error || `Failed to connect ${meta.name}. Please try again.`,
                timeout: 4000,
            });
        } finally {
            setConnectingTool(null);
        }
    };

    const handleDisconnectTool = async (toolId: string, event?: React.MouseEvent) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (!draftAgent?.agentId) {
            toast.add({
                type: "error",
                title: "Agent ID is required to disconnect tool",
                timeout: 3000,
            });
            return;
        }

        const meta = getToolMeta(toolId);
        setDisconnectingTool(toolId);

        try {
            const res = await axios.post("/api/agent/tools/disconnect", {
                agentId: draftAgent.agentId,
                toolSlug: toolId,
            });

            if (res.data?.success) {
                toast.add({
                    type: "success",
                    title: `${meta.name} disconnected successfully`,
                    timeout: 3000,
                });

                // Optimistically update toolStatuses
                setToolStatuses((prev) =>
                    prev.map((t) =>
                        t.slug?.toLowerCase() === toolId.toLowerCase()
                            ? { ...t, isConnected: false }
                            : t
                    )
                );

                // Fetch latest tool statuses
                await fetchToolStatuses();
            } else {
                toast.add({
                    type: "error",
                    title: `Failed to disconnect ${meta.name}`,
                    timeout: 3000,
                });
            }
        } catch (err: any) {
            console.error("Failed to disconnect tool:", err);
            toast.add({
                type: "error",
                title: err?.response?.data?.error || `Failed to disconnect ${meta.name}. Please try again.`,
                timeout: 4000,
            });
        } finally {
            setDisconnectingTool(null);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!draftAgent || !draftAgent.agentId) {
            toast.add({
                type: "error",
                title: "Agent ID is required to save changes",
                timeout: 3000,
            });
            return;
        }

        setIsSaving(true);
        try {
            const token = await getToken().catch(() => null);
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            let res;
            try {
                res = await axios.put("/api/agent", draftAgent, {
                    headers,
                    withCredentials: true,
                });
            } catch {
                res = await axios.put("/api/agent/configure", draftAgent, {
                    headers,
                    withCredentials: true,
                });
            }

            if (res.data?.error) {
                toast.add({
                    type: "error",
                    title: res.data.error,
                    timeout: 3000,
                });
                return;
            }

            const updatedAgent = res.data ?? draftAgent;
            if (onSave) {
                onSave(updatedAgent);
            }

            toast.add({
                type: "success",
                title: "Agent Updated Successfully",
                timeout: 3000,
            });
            setOpen(false);
        } catch (err: any) {
            console.error("Failed to update agent:", err);
            toast.add({
                type: "error",
                title: err?.response?.data?.error || "Failed to update agent. Please try again.",
                timeout: 3000,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const currentTools = getToolsList(draftAgent?.tools);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            {React.isValidElement(children) ? (
                <SheetTrigger render={children} />
            ) : (
                <SheetTrigger>{children}</SheetTrigger>
            )}
            <SheetContent className="sm:max-w-xl md:max-w-2xl overflow-hidden flex flex-col p-0">
                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col h-full">
                    <SheetHeader className="border-b p-4">
                        <div className="flex items-center gap-2.5">
                            <div>
                                <Image src="/logo.png" alt="logo" width={40} height={40} />
                            </div>
                            <div>
                                <SheetTitle>Edit Agent</SheetTitle>
                                <SheetDescription>Update how this looks, works, connects and more</SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>
                    <ScrollArea className="flex-1 min-h-0 p-5">
                        <div className="space-y-4 pb-6">
                            {/* Agent Image */}
                            <section className="flex gap-3 items-center border rounded-2xl bg-gray-50 dark:bg-muted/40 p-3">
                                <div>
                                    <img
                                        src={currentImg}
                                        alt={draftAgent?.name ?? "agent image"}
                                        width={88}
                                        height={88}
                                        className="bg-slate-100 dark:bg-muted p-2 rounded-2xl size-20 object-contain border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <p className="font-medium text-sm">Agent Image</p>
                                    <p className="text-xs text-muted-foreground">Shuffle to generate a new avatar look</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        onClick={shuffleImg}
                                    >
                                        <Shuffle className="w-3.5 h-3.5 mr-1.5" />
                                        Shuffle Image
                                    </Button>
                                </div>
                            </section>

                            {/* Agent Name */}
                            <section className="space-y-2">
                                <Label htmlFor="agent-name">Agent Name</Label>
                                <Input
                                    id="agent-name"
                                    value={draftAgent?.name ?? ""}
                                    onChange={(event) => updateDraft("name", event.target.value)}
                                    placeholder="Give your agent a name"
                                    required
                                    className="mt-1"
                                />
                            </section>

                            {/* Description */}
                            <section className="space-y-2">
                                <Label htmlFor="agent-description">Description</Label>
                                <Textarea
                                    id="agent-description"
                                    value={draftAgent?.description ?? ""}
                                    onChange={(event) => updateDraft("description", event.target.value)}
                                    placeholder="Brief summary of what this agent does"
                                    className="min-h-20 resize"
                                />
                            </section>

                            {/* Objective */}
                            <section className="space-y-2">
                                <Label htmlFor="agent-objective">Objective</Label>
                                <Textarea
                                    id="agent-objective"
                                    value={draftAgent?.objective ?? ""}
                                    onChange={(event) => updateDraft("objective", event.target.value)}
                                    placeholder="What should the objective be?"
                                    className="min-h-24 resize"
                                />
                            </section>

                            {/* Instructions */}
                            <section className="space-y-2">
                                <Label htmlFor="agent-instructions">Instructions</Label>
                                <Textarea
                                    id="agent-instructions"
                                    value={draftAgent?.instructions ?? ""}
                                    onChange={(event) => updateDraft("instructions", event.target.value)}
                                    placeholder="Detailed instructions and workflow guidelines for the agent"
                                    className="min-h-28 resize"
                                />
                            </section>

                            {/* Skills */}
                            <section className="space-y-2">
                                <Label htmlFor="agent-skills">Skills</Label>
                                <div className="flex flex-wrap gap-1.5 min-h-6">
                                    {(Array.isArray(draftAgent?.skills) ? draftAgent.skills : []).map(
                                        (skill, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
                                            >
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() => removeSkill(index)}
                                                    className="hover:text-purple-950 dark:hover:text-purple-100 focus:outline-none cursor-pointer"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        )
                                    )}
                                </div>
                                <div className="flex gap-2 mt-1.5">
                                    <Input
                                        id="agent-skills"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addSkill();
                                            }
                                        }}
                                        placeholder="Add skill (press Enter or comma separated)..."
                                        className="text-xs"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addSkill}
                                        className="shrink-0"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Add
                                    </Button>
                                </div>
                            </section>

                            {/* Tools & Connections */}
                            <section className="space-y-3">
                                <div className="flex items-center justify-between pb-1">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Label className="text-sm font-semibold">Tools & Connections</Label>
                                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-medium">
                                                {currentTools.length} selected
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Select tools required for execution and connect accounts with dedicated buttons
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchToolStatuses(true)}
                                        disabled={loadingTools}
                                        className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                                        title="Refresh connection statuses"
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingTools ? "animate-spin text-purple-600" : ""}`} />
                                        Refresh
                                    </Button>
                                </div>

                                {/* Available Tools - Single Column (One tool per row, enlarged card) */}
                                <div className="flex flex-col gap-3 mt-2">
                                    {AVAILABLE_TOOLS.map((tool) => {
                                        const isSelected = isToolSelected(tool.id, currentTools);
                                        const statusInfo = toolStatuses.find(
                                            (t) => t.slug?.toLowerCase() === tool.id.toLowerCase()
                                        );
                                        const meta = getToolMeta(tool.id);
                                        const isConnected = Boolean(statusInfo?.isConnected);
                                        const isNoAuth = Boolean(statusInfo?.isNoAuth);
                                        const isConnecting = connectingTool === tool.id;

                                        return (
                                            <div
                                                key={tool.id}
                                                className={`p-4 rounded-2xl border transition-all flex flex-col gap-3.5 ${
                                                    isSelected
                                                        ? "bg-purple-50/70 border-purple-300 dark:bg-purple-950/30 dark:border-purple-700 shadow-xs"
                                                        : "bg-card border-border/80 hover:border-purple-200 hover:shadow-xs"
                                                }`}
                                            >
                                                {/* Tier 1 (Top): Checkbox Toggle + Tool Image Badge + Tool Name & Info */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleTool(tool.id)}
                                                    className="flex items-center gap-3.5 text-left min-w-0 w-full cursor-pointer group"
                                                >
                                                    <div
                                                        className={`size-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                            isSelected
                                                                ? "bg-purple-600 border-purple-600 text-white shadow-xs"
                                                                : "border-muted-foreground/40 bg-background group-hover:border-purple-500"
                                                        }`}
                                                    >
                                                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                    </div>

                                                    <div className="size-11 rounded-xl bg-slate-100 dark:bg-muted border border-slate-200/80 dark:border-border flex items-center justify-center shrink-0 p-2 shadow-2xs">
                                                        <span className="size-5 flex items-center justify-center shrink-0">
                                                            {meta.icon}
                                                        </span>
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-sm font-semibold text-foreground truncate">
                                                                {tool.label}
                                                            </span>
                                                            {isSelected && (
                                                                <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-md shrink-0">
                                                                    Selected
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                                            {isSelected
                                                                ? "Tool is enabled for this agent. Click to disable."
                                                                : "Click to enable this tool for the agent."}
                                                        </p>
                                                    </div>
                                                </button>

                                                {/* Tier 2 (Bottom): Status Badge on Left, Connect Button on Right */}
                                                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60 w-full">
                                                    <div className="shrink-0">
                                                        {isConnected ? (
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                                                                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                                                Connected
                                                            </span>
                                                        ) : isNoAuth ? (
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-200">
                                                                <span className="size-2 rounded-full bg-blue-500" />
                                                                No Auth
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                                                                <span className="size-2 rounded-full bg-amber-400" />
                                                                Not Connected
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {isConnecting ? (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                disabled
                                                                className="h-9 px-4 text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200 min-w-28 rounded-xl"
                                                            >
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                                                Connecting...
                                                            </Button>
                                                        ) : isConnected ? (
                                                            <>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={(e) => handleConnectTool(tool.id, e)}
                                                                    disabled={connectingTool !== null || disconnectingTool !== null}
                                                                    className="h-9 px-3 text-xs font-medium text-muted-foreground hover:text-foreground border-border hover:bg-muted/50 cursor-pointer rounded-xl"
                                                                    title="Click to reconnect or switch accounts"
                                                                >
                                                                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                                                    Reconnect
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={(e) => handleDisconnectTool(tool.id, e)}
                                                                    disabled={connectingTool !== null || disconnectingTool !== null}
                                                                    className="h-9 px-3 text-xs font-medium text-destructive hover:bg-destructive/10 border-destructive/30 hover:border-destructive/60 cursor-pointer rounded-xl"
                                                                    title="Disconnect this account"
                                                                >
                                                                    {disconnectingTool === tool.id ? (
                                                                        <>
                                                                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                                                            Disconnecting...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Unlink className="w-3.5 h-3.5 mr-1.5" />
                                                                            Disconnect
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={(e) => handleConnectTool(tool.id, e)}
                                                                disabled={connectingTool !== null || disconnectingTool !== null}
                                                                className="h-9 px-4 text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-900 border-purple-200 shadow-2xs cursor-pointer min-w-28 rounded-xl"
                                                            >
                                                                <Link2 className="w-3.5 h-3.5 mr-1.5" />
                                                                Connect
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Custom Tools Section */}
                                {currentTools.some(
                                    (t: string) =>
                                        !AVAILABLE_TOOLS.some(
                                            (at) =>
                                                at.id === t ||
                                                (isCalendarSlug(at.id) && isCalendarSlug(t))
                                        )
                                ) && (
                                    <div className="space-y-2 mt-4 pt-3 border-t">
                                        <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                                            Custom Tools
                                        </Label>
                                        <div className="flex flex-col gap-3 mt-1">
                                            {currentTools
                                                .filter(
                                                    (t: string) =>
                                                        !AVAILABLE_TOOLS.some(
                                                            (at) =>
                                                                at.id === t ||
                                                                (isCalendarSlug(at.id) && isCalendarSlug(t))
                                                        )
                                                )
                                                .map((customTool: string, idx: number) => {
                                                    const statusInfo = toolStatuses.find(
                                                        (s) => s.slug?.toLowerCase() === customTool.toLowerCase()
                                                    );
                                                    const customMeta = getToolMeta(customTool);
                                                    const isConnected = Boolean(statusInfo?.isConnected);
                                                    const isConnecting = connectingTool === customTool;

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="p-4 rounded-2xl border bg-muted/20 border-border/80 flex flex-col gap-3.5"
                                                        >
                                                            {/* Tier 1 (Top): Icon + Title + Remove */}
                                                            <div className="flex items-center justify-between gap-3 w-full">
                                                                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                                                    <div className="size-11 rounded-xl bg-slate-100 dark:bg-muted border border-slate-200/80 dark:border-border flex items-center justify-center shrink-0 p-2 shadow-2xs">
                                                                        <span className="size-5 flex items-center justify-center shrink-0">
                                                                            {customMeta.icon}
                                                                        </span>
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm font-semibold text-foreground truncate">
                                                                                {customMeta.name}
                                                                            </span>
                                                                            <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-800/50 px-2 py-0.5 rounded-md">
                                                                                Composio
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                                            Slug: {customTool}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleTool(customTool)}
                                                                    className="text-muted-foreground hover:text-destructive focus:outline-none p-1.5 rounded-lg hover:bg-destructive/10 cursor-pointer shrink-0"
                                                                    title="Remove tool"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>

                                                            {/* Tier 2 (Bottom): Status on Left, Connect on Right */}
                                                            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40 w-full">
                                                                <div className="shrink-0">
                                                                    {isConnected ? (
                                                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200">
                                                                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                                                            Connected
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200">
                                                                            <span className="size-2 rounded-full bg-amber-400" />
                                                                            Not Connected
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    {isConnecting ? (
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            disabled
                                                                            className="h-9 px-4 text-xs min-w-28 rounded-xl"
                                                                        >
                                                                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                                                            Connecting...
                                                                        </Button>
                                                                    ) : isConnected ? (
                                                                        <>
                                                                            <Button
                                                                                type="button"
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={(e) => handleConnectTool(customTool, e)}
                                                                                disabled={connectingTool !== null || disconnectingTool !== null}
                                                                                className="h-9 px-3 text-xs font-medium text-muted-foreground hover:text-foreground border-border hover:bg-muted/50 cursor-pointer rounded-xl"
                                                                                title="Click to reconnect or switch accounts"
                                                                            >
                                                                                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                                                                Reconnect
                                                                            </Button>
                                                                            <Button
                                                                                type="button"
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={(e) => handleDisconnectTool(customTool, e)}
                                                                                disabled={connectingTool !== null || disconnectingTool !== null}
                                                                                className="h-9 px-3 text-xs font-medium text-destructive hover:bg-destructive/10 border-destructive/30 hover:border-destructive/60 cursor-pointer rounded-xl"
                                                                                title="Disconnect this account"
                                                                            >
                                                                                {disconnectingTool === customTool ? (
                                                                                    <>
                                                                                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                                                                        Disconnecting...
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <Unlink className="w-3.5 h-3.5 mr-1.5" />
                                                                                        Disconnect
                                                                                    </>
                                                                                )}
                                                                            </Button>
                                                                        </>
                                                                    ) : (
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={(e) => handleConnectTool(customTool, e)}
                                                                            disabled={connectingTool !== null || disconnectingTool !== null}
                                                                            className="h-9 px-4 text-xs font-semibold text-purple-700 hover:bg-purple-50 border-purple-200 cursor-pointer min-w-28 rounded-xl"
                                                                        >
                                                                            <Link2 className="w-3.5 h-3.5 mr-1.5" />
                                                                            Connect
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                )}

                                {/* Add Composio & Custom Tools */}
                                <div className="space-y-3 mt-4 pt-3 border-t">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                            <Sparkles className="size-3 text-purple-600" />
                                            <span>Add from Composio Ecosystem</span>
                                        </Label>
                                        <span className="text-[10px] text-muted-foreground">1,000+ integrations supported</span>
                                    </div>

                                    {/* Search input with live dropdown */}
                                    <div className="relative">
                                        <div className="relative flex items-center">
                                            <Search className="absolute left-3 size-3.5 text-muted-foreground pointer-events-none" />
                                            <Input
                                                value={catalogSearch}
                                                onChange={(e) => setCatalogSearch(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        if (catalogResults.length > 0) {
                                                            selectCatalogTool(catalogResults[0].slug);
                                                        } else if (catalogSearch.trim()) {
                                                            selectCatalogTool(catalogSearch.trim());
                                                        }
                                                    }
                                                }}
                                                placeholder="Search Composio tools (e.g. Linear, Trello, Jira, HubSpot)..."
                                                className="text-xs h-9.5 pl-8.5 pr-8 bg-background border-border/80 focus-visible:ring-purple-500/20"
                                            />
                                            {catalogLoading && (
                                                <Loader2 className="absolute right-3 size-3.5 text-muted-foreground animate-spin" />
                                            )}
                                        </div>

                                        {/* Dropdown Results */}
                                        {catalogSearch.trim().length > 0 && (
                                            <div className="absolute z-20 left-0 right-0 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-border bg-popover/95 p-1.5 shadow-lg backdrop-blur-md">
                                                {catalogLoading && catalogResults.length === 0 ? (
                                                    <div className="flex items-center justify-center p-4 text-xs text-muted-foreground">
                                                        <Loader2 className="size-3.5 animate-spin mr-2" /> Searching Composio integrations...
                                                    </div>
                                                ) : catalogResults.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {catalogResults.map((tool: any) => {
                                                            const isAlreadyAdded = currentTools
                                                                .map((t) => t.toLowerCase())
                                                                .includes(tool.slug.toLowerCase());

                                                            return (
                                                                <button
                                                                    key={tool.slug}
                                                                    type="button"
                                                                    onClick={() => selectCatalogTool(tool.slug)}
                                                                    className="flex w-full items-center justify-between gap-3 rounded-lg p-2 text-left text-xs hover:bg-muted/70 transition-colors group cursor-pointer"
                                                                >
                                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                                        <img
                                                                            src={tool.logo || `https://logos.composio.dev/api/${tool.slug}`}
                                                                            alt={tool.name}
                                                                            className="size-5 rounded-sm object-contain shrink-0"
                                                                            onError={(e) => {
                                                                                e.currentTarget.style.display = "none";
                                                                            }}
                                                                        />
                                                                        <div className="min-w-0">
                                                                            <p className="font-semibold text-foreground truncate">
                                                                                {tool.name}
                                                                            </p>
                                                                            <p className="text-[11px] text-muted-foreground truncate max-w-xs">
                                                                                {tool.description || `Slug: ${tool.slug}`}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <span
                                                                        className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                                                            isAlreadyAdded
                                                                                ? "bg-slate-100 text-slate-500 dark:bg-muted"
                                                                                : "bg-purple-600 text-white group-hover:bg-purple-700"
                                                                        }`}
                                                                    >
                                                                        {isAlreadyAdded ? "Added" : "+ Add"}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="p-3 text-center text-xs text-muted-foreground">
                                                        <p>No exact tool match found for &ldquo;{catalogSearch}&rdquo;</p>
                                                        <button
                                                            type="button"
                                                            onClick={() => selectCatalogTool(catalogSearch.trim())}
                                                            className="mt-1.5 inline-flex items-center gap-1 font-semibold text-purple-600 hover:underline"
                                                        >
                                                            Add &ldquo;{catalogSearch.trim()}&rdquo; as custom Composio slug &rarr;
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Popular Quick-Add Pills */}
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                        <span className="text-[11px] text-muted-foreground font-medium mr-1">Popular:</span>
                                        {[
                                            { label: "Linear", slug: "linear" },
                                            { label: "Trello", slug: "trello" },
                                            { label: "Jira", slug: "jira" },
                                            { label: "HubSpot", slug: "hubspot" },
                                            { label: "ClickUp", slug: "clickup" },
                                            { label: "Discord", slug: "discord" },
                                            { label: "Airtable", slug: "airtable" },
                                            { label: "Spotify", slug: "spotify" },
                                        ].map((item) => {
                                            const isSelected = currentTools
                                                .map((t) => t.toLowerCase())
                                                .includes(item.slug.toLowerCase());

                                            return (
                                                <button
                                                    key={item.slug}
                                                    type="button"
                                                    disabled={isSelected}
                                                    onClick={() => selectCatalogTool(item.slug)}
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium border transition-all ${
                                                        isSelected
                                                            ? "bg-muted text-muted-foreground/60 border-border cursor-default"
                                                            : "bg-background text-foreground border-border/80 hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50/50 cursor-pointer"
                                                    }`}
                                                >
                                                    <img
                                                        src={`https://logos.composio.dev/api/${item.slug}`}
                                                        alt={item.label}
                                                        className="size-3 rounded-xs object-contain"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = "none";
                                                        }}
                                                    />
                                                    <span>{item.label}</span>
                                                    {!isSelected && <Plus className="size-2.5 ml-0.5" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </section>

                            {/* Schedule Settings */}
                            <section className="space-y-3 border rounded-2xl p-3.5 bg-gray-50/70 dark:bg-muted/30">
                                <div className="flex items-center gap-2">
                                    <CalendarCheck2 className="w-4 h-4 text-purple-600" />
                                    <Label className="font-medium text-sm">Schedule Settings</Label>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="schedule-frequency" className="text-xs text-muted-foreground">
                                            Frequency
                                        </Label>
                                        <Input
                                            id="schedule-frequency"
                                            value={
                                                typeof draftAgent?.schedule === "object" && draftAgent?.schedule !== null
                                                    ? draftAgent.schedule.frequency ?? ""
                                                    : typeof draftAgent?.schedule === "string"
                                                    ? draftAgent.schedule
                                                    : ""
                                            }
                                            onChange={(e) => updateSchedule("frequency", e.target.value)}
                                            placeholder="daily / weekly / hourly"
                                            className="h-9 text-xs bg-background"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="schedule-time" className="text-xs text-muted-foreground">
                                            Run Time
                                        </Label>
                                        <Input
                                            id="schedule-time"
                                            value={
                                                typeof draftAgent?.schedule === "object" && draftAgent?.schedule !== null
                                                    ? draftAgent.schedule.time ?? ""
                                                    : ""
                                            }
                                            onChange={(e) => updateSchedule("time", e.target.value)}
                                            placeholder="e.g. 09:00 AM"
                                            className="h-9 text-xs bg-background"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="schedule-type" className="text-xs text-muted-foreground">
                                            Type
                                        </Label>
                                        <Input
                                            id="schedule-type"
                                            value={
                                                typeof draftAgent?.schedule === "object" && draftAgent?.schedule !== null
                                                    ? draftAgent.schedule.type ?? ""
                                                    : typeof draftAgent?.schedule === "string"
                                                    ? draftAgent.schedule
                                                    : ""
                                            }
                                            onChange={(e) => updateSchedule("type", e.target.value)}
                                            placeholder="recurring / manual / once"
                                            className="h-9 text-xs bg-background"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Output Format */}
                            <section className="space-y-2">
                                <Label htmlFor="agent-output-format">Output Format</Label>
                                <Input
                                    id="agent-output-format"
                                    value={draftAgent?.outputFormat ?? ""}
                                    onChange={(event) => updateDraft("outputFormat", event.target.value)}
                                    placeholder="e.g. in_app, Markdown report, JSON, Email summary"
                                    className="mt-1"
                                />
                            </section>

                            {/* Status */}
                            <section className="space-y-2">
                                <Label>Status</Label>
                                <div className="flex gap-2">
                                    {["active", "paused", "draft"].map((st) => {
                                        const isCurrent = (draftAgent?.status || "active").toLowerCase() === st;
                                        return (
                                            <button
                                                key={st}
                                                type="button"
                                                onClick={() => updateDraft("status", st)}
                                                className={`text-xs px-3 py-1.5 rounded-full capitalize font-medium border transition-all cursor-pointer ${
                                                    isCurrent
                                                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                                        : "bg-muted/60 text-muted-foreground border-border hover:border-purple-300"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block size-1.5 rounded-full mr-1.5 ${
                                                        isCurrent ? "bg-white" : "bg-muted-foreground"
                                                    }`}
                                                />
                                                {st}
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>
                    </ScrollArea>
                    <SheetFooter className="border-t p-4">
                        <div className="flex justify-end gap-2.5">
                            <SheetClose
                                render={
                                    <Button variant="outline" type="button" disabled={isSaving}>
                                        Close
                                    </Button>
                                }
                            />
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="bg-purple-700 hover:bg-purple-800 min-w-28 text-white"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
};

export default EditAgent;
