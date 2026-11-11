"use client"

import { useState, useEffect, useCallback } from "react"
import { CalendarCheck2Icon, Ellipsis, Pencil, Play, Pause, Trash, Wrench, Link2, Loader2, Unlink, MessageCircle } from "lucide-react"
import { CreatedAgent } from "./CreateAgent"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import EditAgent from "./EditAgent"
import AgentChat from "./AgentChat"
import { getToolMeta } from "./ToolIcons"
import axios from "axios"
import { toast } from "@/components/ui/toast"

type Props = {
    createdAgent: CreatedAgent | null
    onUpdate?: (updated: CreatedAgent) => void
    onDelete?: (agentId: string) => void
    onStatusToggle?: (agentId: string, currentStatus: string) => void
    onRunNow?: (agent: CreatedAgent) => void
}

const AgentCard = ({ createdAgent, onUpdate, onDelete, onStatusToggle, onRunNow }: Props) => {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [runSuccess, setRunSuccess] = useState(false);
    const [toolStatuses, setToolStatuses] = useState<Record<string, boolean>>({});
    const [connectingTool, setConnectingTool] = useState<string | null>(null);
    const [disconnectingTool, setDisconnectingTool] = useState<string | null>(null);

    const fetchToolStatuses = useCallback(async () => {
        if (!createdAgent?.agentId) return;
        try {
            const res = await axios.get<any[]>(
                `/api/agent/tools?agentId=${createdAgent.agentId}&onlySelected=true`
            );
            if (Array.isArray(res.data)) {
                const map: Record<string, boolean> = {};
                res.data.forEach((t) => {
                    if (t?.slug) {
                        map[t.slug.toLowerCase()] = Boolean(t.isConnected);
                    }
                });
                setToolStatuses(map);
            }
        } catch (err) {
            console.warn("Could not fetch tool statuses for agent:", err);
        }
    }, [createdAgent?.agentId]);

    useEffect(() => {
        if (createdAgent?.agentId) {
            fetchToolStatuses();
        }
    }, [createdAgent?.agentId, fetchToolStatuses]);

    if (!createdAgent) return null;

    const isActive = createdAgent.status?.toLowerCase() === "active";

    const handleRun = () => {
        if (onRunNow) {
            onRunNow(createdAgent);
        }
        setRunSuccess(true);
        setTimeout(() => setRunSuccess(false), 3000);
    };

    const handleConnectTool = async (toolSlug: string, event?: React.MouseEvent) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const meta = getToolMeta(toolSlug);
        setConnectingTool(toolSlug);

        try {
            const res = await axios.post("/api/agent/tools/connect", {
                agentId: createdAgent.agentId,
                toolSlug,
            });

            if (res.data?.redirectUrl) {
                window.open(
                    res.data.redirectUrl,
                    "_blank",
                    "width=650,height=750,menubar=no,toolbar=no,location=yes"
                );

                toast.add({
                    type: "info",
                    title: `Connecting ${meta.name}...`,
                    description: "Complete authentication in the opened window. Status updates automatically.",
                    timeout: 5000,
                });

                // Poll for connection
                let attempts = 0;
                const interval = setInterval(async () => {
                    attempts++;
                    try {
                        const statusRes = await axios.get<any[]>(
                            `/api/agent/tools?agentId=${createdAgent.agentId}&onlySelected=true`
                        );
                        if (Array.isArray(statusRes.data)) {
                            const statusMap: Record<string, boolean> = {};
                            statusRes.data.forEach((t) => {
                                statusMap[t.slug.toLowerCase()] = Boolean(t.isConnected);
                            });
                            setToolStatuses(statusMap);
                            if (statusMap[toolSlug.toLowerCase()]) {
                                clearInterval(interval);
                                toast.add({
                                    type: "success",
                                    title: `${meta.name} Connected!`,
                                    timeout: 3500,
                                });
                            }
                        }
                    } catch {}
                    if (attempts >= 15) clearInterval(interval);
                }, 3000);
            } else {
                toast.add({
                    type: "success",
                    title: `${meta.name} is ready & connected!`,
                    timeout: 3000,
                });
                setToolStatuses((prev) => ({ ...prev, [toolSlug.toLowerCase()]: true }));
            }
        } catch (err: any) {
            toast.add({
                type: "error",
                title: err?.response?.data?.error || `Failed to connect ${meta.name}`,
                timeout: 3500,
            });
        } finally {
            setConnectingTool(null);
        }
    };

    const handleDisconnectTool = async (toolSlug: string, event?: React.MouseEvent) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (!createdAgent?.agentId) {
            toast.add({
                type: "error",
                title: "Agent ID is required to disconnect tool",
                timeout: 3000,
            });
            return;
        }

        const meta = getToolMeta(toolSlug);
        setDisconnectingTool(toolSlug);

        try {
            const res = await axios.post("/api/agent/tools/disconnect", {
                agentId: createdAgent.agentId,
                toolSlug,
            });

            if (res.data?.success) {
                toast.add({
                    type: "success",
                    title: `${meta.name} disconnected successfully`,
                    timeout: 3000,
                });
                // Optimistically mark disconnected
                setToolStatuses((prev) => ({
                    ...prev,
                    [toolSlug.toLowerCase()]: false,
                }));
                // Refresh tool statuses
                fetchToolStatuses();
            } else {
                toast.add({
                    type: "error",
                    title: res.data?.error || `Failed to disconnect ${meta.name}`,
                    timeout: 3500,
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

    const toolsList: string[] = Array.isArray(createdAgent.tools)
        ? createdAgent.tools
              .map((t: any) => (typeof t === "string" ? t : t?.slug || t?.id || ""))
              .filter(Boolean)
        : typeof createdAgent.tools === "string"
        ? (() => {
              try {
                  const parsed = JSON.parse(createdAgent.tools);
                  return Array.isArray(parsed)
                      ? parsed
                            .map((t: any) => (typeof t === "string" ? t : t?.slug || t?.id || ""))
                            .filter(Boolean)
                      : [createdAgent.tools];
              } catch {
                  return [createdAgent.tools];
              }
          })()
        : [];

    return (
        <>
            <div className = "flex flex-col sm:flex-row items-start sm:items-center justify-between border p-4 rounded-2xl bg-card shadow-sm hover:shadow-md hover:border-purple-200 transition-all gap-4">
                <div className = "flex gap-4 items-start sm:items-center min-w-0 flex-1">
                    <img 
                        src = {createdAgent.agentImg || `https://api.dicebear.com/10.x/clay/svg?tags=animation&seed=${createdAgent.agentId}`} 
                        alt = {createdAgent.name ?? "agent"} 
                        width = {64} 
                        height = {64} 
                        className = "p-2 bg-slate-100 rounded-2xl size-16 shrink-0 object-contain border" 
                    />
                    <div className = "flex flex-col gap-1 min-w-0 flex-1">
                        <div className = "flex flex-wrap gap-2 items-center">
                            <h3 className = "font-semibold text-base text-foreground truncate max-w-xs">
                                {createdAgent.name}
                            </h3>
                            <Badge 
                                variant = "outline" 
                                className = {
                                    isActive
                                        ? "border-green-300 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300"
                                        : "border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                                }
                            >
                                <span className = {`size-1.5 rounded-full mr-1 ${isActive ? "bg-green-600" : "bg-amber-500"}`} />
                                <span className = "capitalize">{createdAgent.status || "active"}</span>
                            </Badge>
                            {runSuccess && (
                                <Badge variant = "secondary" className = "bg-purple-100 text-purple-800 animate-pulse text-[10px]">
                                    Triggered!
                                </Badge>
                            )}
                        </div>

                        {createdAgent.description && (
                            <p className = "text-muted-foreground text-xs line-clamp-1">
                                {createdAgent.description}
                            </p>
                        )}

                        <div className = "flex flex-wrap gap-3 items-center text-muted-foreground text-xs mt-1">
                            {createdAgent.schedule?.time && (
                                <div className = "flex gap-1.5 items-center">
                                    <CalendarCheck2Icon className = "w-3.5 h-3.5 text-purple-600" />
                                    <span>Next Run on {createdAgent.schedule.time}</span>
                                </div>
                            )}
                            {createdAgent.schedule?.frequency && (
                                <span>Runs {createdAgent.schedule.frequency}</span>
                            )}
                            {toolsList.length > 0 && (
                                <div className = "flex gap-1 items-center">
                                    <Wrench className = "w-3 h-3 text-muted-foreground" />
                                    <span>{toolsList.length} {toolsList.length === 1 ? "tool" : "tools"}</span>
                                </div>
                            )}
                        </div>

                        {/* Tool Badges with Dedicated Connection Status & Connect/Disconnect Button */}
                        {toolsList.length > 0 && (
                            <div className = "flex flex-wrap items-center gap-2 mt-2.5">
                                {toolsList.map((toolSlug) => {
                                    const meta = getToolMeta(toolSlug);
                                    const isConnected = Boolean(toolStatuses[toolSlug.toLowerCase()]);
                                    const isConnecting = connectingTool === toolSlug;
                                    const isDisconnecting = disconnectingTool === toolSlug;

                                    return (
                                        <div
                                            key = {toolSlug}
                                            className = "inline-flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-muted/70 text-xs font-medium text-foreground border border-slate-200/80 dark:border-border hover:border-purple-300 transition-colors shadow-2xs"
                                            title = {meta.name}
                                        >
                                            <span className = "size-4 flex items-center justify-center shrink-0">
                                                {meta.icon}
                                            </span>
                                            <span className = "text-xs font-semibold leading-none">{meta.name}</span>

                                            {/* Connection Status & Dedicated Connect / Disconnect Button */}
                                            {isConnected ? (
                                                <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-300 dark:border-border">
                                                    <span
                                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60"
                                                        title="Connected & Active"
                                                    >
                                                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Connected
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleDisconnectTool(toolSlug, e)}
                                                        disabled={isDisconnecting || isConnecting}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 border border-destructive/30 hover:border-destructive/60 transition-colors cursor-pointer disabled:opacity-50"
                                                        title={`Disconnect ${meta.name}`}
                                                    >
                                                        {isDisconnecting ? (
                                                            <>
                                                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                                                <span>Disconnecting...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Unlink className="w-2.5 h-2.5" />
                                                                <span>Disconnect</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-300 dark:border-border">
                                                    <span className="size-1.5 rounded-full bg-amber-400" title="Not connected" />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleConnectTool(toolSlug, e)}
                                                        disabled={isConnecting || isDisconnecting}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-950 dark:text-purple-300 transition-colors cursor-pointer disabled:opacity-50"
                                                        title={`Connect ${meta.name}`}
                                                    >
                                                        {isConnecting ? (
                                                            <>
                                                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                                                <span>Connecting...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Link2 className="w-2.5 h-2.5" />
                                                                <span>Connect</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className = "flex gap-2 items-center text-muted-foreground shrink-0 self-end sm:self-center">
                    <Button 
                        variant = "outline" 
                        size = "sm" 
                        onClick = {handleRun}
                        className = "h-8 px-2.5 text-xs text-purple-700 hover:text-purple-800 hover:bg-purple-50 border-purple-200"
                    >
                        <Play className = "w-3 h-3 mr-1 fill-current" />
                        Run
                    </Button>

                    <Button
                        variant = "outline"
                        size = "sm" 
                        onClick = {() => setChatOpen(true)}
                        className = "h-8 px-2.5 text-xs text-purple-700 hover:text-purple-800 bg-purple-50/50 hover:bg-purple-100/70 border-purple-200 dark:border-purple-800 dark:text-purple-300 dark:bg-purple-950/20 dark:hover:bg-purple-950/40 cursor-pointer shadow-2xs"
                        title = "Chat with agent"
                    >   
                        <MessageCircle className = "w-3 h-3 mr-1 fill-current" />
                        Chat
                    </Button>

                    <EditAgent agentConfig = {createdAgent} onSave = {(updated) => {
                        fetchToolStatuses();
                        onUpdate?.(updated);
                    }}>
                        <Button variant = "ghost" size = "icon" className = "h-8 w-8">
                            <Pencil className = "w-3.5 h-3.5" />
                        </Button>
                    </EditAgent>

                    <DropdownMenu>
                        <DropdownMenuTrigger render={
                            <Button variant = "ghost" size = "icon" className = "h-8 w-8">
                                <Ellipsis className = "w-3.5 h-3.5" />
                            </Button>
                        } />
                        <DropdownMenuContent align = "end">
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick = {() => setChatOpen(true)}>
                                    <MessageCircle className = "w-3.5 h-3.5 mr-2" /> Chat with Agent
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick = {handleRun}>
                                    <Play className = "w-3.5 h-3.5 mr-2" /> Run Now
                                </DropdownMenuItem>
                                {onStatusToggle && (
                                    <DropdownMenuItem onClick = {() => onStatusToggle(createdAgent.agentId, createdAgent.status)}>
                                        {isActive ? (
                                            <>
                                                <Pause className = "w-3.5 h-3.5 mr-2" /> Pause Agent
                                            </>
                                        ) : (
                                            <>
                                                <Play className = "w-3.5 h-3.5 mr-2" /> Activate Agent
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem 
                                    variant = "destructive" 
                                    onClick = {() => setDeleteOpen(true)}
                                >
                                    <Trash className = "w-3.5 h-3.5 mr-2" /> Delete Agent
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Delete Confirmation Alert Dialog */}
            <AlertDialog open = {deleteOpen} onOpenChange = {setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Agent?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{createdAgent.name}</strong>? This action cannot be undone and will remove all scheduled tasks associated with this agent.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            className = "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick = {() => {
                                setDeleteOpen(false);
                                onDelete?.(createdAgent.agentId);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {/* Agent Chat Sheet */}
            <AgentChat
                agent={createdAgent}
                open={chatOpen}
                onOpenChange={setChatOpen}
            />
        </>
    )
}

export default AgentCard
