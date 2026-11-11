"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { useAuth } from "@clerk/nextjs"
import { CreatedAgent } from "./CreateAgent"
import AgentCard from "./AgentCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
    Search, 
    RefreshCw, 
    Bot, 
    Plus, 
    Sparkles, 
    AlertCircle, 
    Filter
} from "lucide-react"

type Props = {
    onCreateNew?: () => void
}

const MyAgents = ({ onCreateNew }: Props) => {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const [agents, setAgents] = useState<CreatedAgent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");
    const [refreshing, setRefreshing] = useState(false);

    const fetchAgents = useCallback(async (isRefresh = false) => {
        if (!isSignedIn) {
            setLoading(false);
            return;
        }

        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            setError(null);

            const token = await getToken();
            const res = await axios.get("/api/agent", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                withCredentials: true,
            });

            setAgents(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            console.error("Error fetching agents:", err);
            setError(err?.response?.data?.error || "Failed to load agents. Please try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [isSignedIn, getToken]);

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchAgents();
        } else if (isLoaded && !isSignedIn) {
            setLoading(false);
        }
    }, [isLoaded, isSignedIn, fetchAgents]);

    const handleStatusToggle = async (agentId: string, currentStatus: string) => {
        const newStatus = currentStatus === "active" ? "paused" : "active";
        
        // Optimistic update
        setAgents((prev) =>
            prev.map((a) => (a.agentId === agentId ? { ...a, status: newStatus } : a))
        );

        try {
            const token = await getToken();
            await axios.put(
                "/api/agent",
                { agentId, status: newStatus },
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true,
                }
            );
        } catch (err) {
            console.error("Failed to update agent status:", err);
            // Revert on error
            setAgents((prev) =>
                prev.map((a) => (a.agentId === agentId ? { ...a, status: currentStatus } : a))
            );
        }
    };

    const handleDelete = async (agentId: string) => {
        // Optimistic removal
        const previous = agents;
        setAgents((prev) => prev.filter((a) => a.agentId !== agentId));

        try {
            const token = await getToken();
            await axios.delete(`/api/agent?agentId=${agentId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                withCredentials: true,
            });
        } catch (err) {
            console.error("Failed to delete agent:", err);
            setAgents(previous);
        }
    };

    const handleUpdate = async (updated: CreatedAgent) => {
        // Optimistic update
        setAgents((prev) =>
            prev.map((a) => (a.agentId === updated.agentId ? { ...a, ...updated } : a))
        );

        try {
            const token = await getToken();
            const res = await axios.put("/api/agent", updated, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                withCredentials: true,
            });
            if (res.data) {
                setAgents((prev) =>
                    prev.map((a) => (a.agentId === updated.agentId ? { ...a, ...res.data } : a))
                );
            }
        } catch (err) {
            console.error("Failed to save agent edits:", err);
            fetchAgents(true);
        }
    };

    // Filter agents by search query & status
    const filteredAgents = agents.filter((agent) => {
        const matchesSearch =
            (agent.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (agent.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (Array.isArray(agent.skills) &&
                agent.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))) ||
            (Array.isArray(agent.tools) &&
                agent.tools.some((t: any) =>
                    String(typeof t === "object" ? t?.name || t?.slug : t)
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                ));

        const matchesStatus =
            statusFilter === "all" ||
            (agent.status || "active").toLowerCase() === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const activeCount = agents.filter((a) => (a.status || "active").toLowerCase() === "active").length;
    const pausedCount = agents.filter((a) => (a.status || "").toLowerCase() === "paused").length;

    return (
        <div className = "mt-6 space-y-6">
            {/* Header controls & stats */}
            <div className = "flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-2 border-b">
                <div>
                    <h2 className = "text-2xl font-bold tracking-tight flex items-center gap-2">
                        My Agents
                        <Badge variant = "secondary" className = "text-xs font-semibold px-2 py-0.5">
                            {agents.length}
                        </Badge>
                    </h2>
                    <p className = "text-sm text-muted-foreground mt-0.5">
                        Manage, monitor and configure your autonomous AI workforce
                    </p>
                </div>

                <div className = "flex gap-2 items-center w-full sm:w-auto">
                    <Button 
                        variant = "outline" 
                        size = "sm" 
                        onClick = {() => fetchAgents(true)} 
                        disabled = {refreshing || loading}
                        className = "h-9"
                    >
                        <RefreshCw className = {`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button 
                        size = "sm" 
                        onClick = {onCreateNew} 
                        className = "h-9 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        <Plus className = "w-4 h-4 mr-1.5" />
                        New Agent
                    </Button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            {agents.length > 0 && (
                <div className = "flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className = "relative flex-1 max-w-sm">
                        <Search className = "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder = "Search agents by name, skill..."
                            value = {searchQuery}
                            onChange = {(e) => setSearchQuery(e.target.value)}
                            className = "pl-9 h-9 text-xs"
                        />
                    </div>

                    <div className = "flex gap-1.5 items-center">
                        <Filter className = "w-3.5 h-3.5 text-muted-foreground mr-1" />
                        <button
                            type = "button"
                            onClick = {() => setStatusFilter("all")}
                            className = {`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                                statusFilter === "all"
                                    ? "bg-purple-600 text-white shadow-xs"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                        >
                            All ({agents.length})
                        </button>
                        <button
                            type = "button"
                            onClick = {() => setStatusFilter("active")}
                            className = {`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                                statusFilter === "active"
                                    ? "bg-green-600 text-white shadow-xs"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                        >
                            Active ({activeCount})
                        </button>
                        <button
                            type = "button"
                            onClick = {() => setStatusFilter("paused")}
                            className = {`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                                statusFilter === "paused"
                                    ? "bg-amber-600 text-white shadow-xs"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                        >
                            Paused ({pausedCount})
                        </button>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className = "p-4 border border-red-200 bg-red-50 text-red-800 rounded-xl text-sm flex items-center justify-between">
                    <div className = "flex items-center gap-2">
                        <AlertCircle className = "w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <Button variant = "outline" size = "sm" onClick = {() => fetchAgents(true)} className = "text-xs border-red-300 hover:bg-red-100">
                        Try Again
                    </Button>
                </div>
            )}

            {/* Loading Skeletons */}
            {loading && (
                <div className = "space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key = {i} className = "p-4 border rounded-2xl flex items-center justify-between space-x-4">
                            <div className = "flex items-center space-x-4 flex-1">
                                <Skeleton className = "h-16 w-16 rounded-2xl shrink-0" />
                                <div className = "space-y-2 flex-1">
                                    <Skeleton className = "h-4 w-1/3" />
                                    <Skeleton className = "h-3 w-2/3" />
                                    <Skeleton className = "h-3 w-1/4" />
                                </div>
                            </div>
                            <div className = "flex gap-2">
                                <Skeleton className = "h-8 w-16 rounded-lg" />
                                <Skeleton className = "h-8 w-8 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State - No agents created yet */}
            {!loading && agents.length === 0 && (
                <div className = "text-center py-16 border rounded-2xl bg-card border-dashed p-8 shadow-xs">
                    <div className = "w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                        <Bot className = "w-8 h-8" />
                    </div>
                    <h3 className = "text-lg font-semibold text-foreground">No agents created yet</h3>
                    <p className = "text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-6">
                        You haven’t deployed any AI agents yet. Describe a goal or choose a template to create your first autonomous agent in seconds.
                    </p>
                    <Button 
                        onClick = {onCreateNew} 
                        className = "bg-purple-600 hover:bg-purple-700 text-white font-medium px-5"
                    >
                        <Sparkles className = "w-4 h-4 mr-2" />
                        Create Your First Agent
                    </Button>
                </div>
            )}

            {/* Empty Search Results */}
            {!loading && agents.length > 0 && filteredAgents.length === 0 && (
                <div className = "text-center py-12 border rounded-2xl bg-card p-6">
                    <Search className = "w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <h4 className = "font-medium text-sm text-foreground">No agents match your criteria</h4>
                    <p className = "text-xs text-muted-foreground mt-1 mb-4">
                        Try adjusting your search terms or status filter.
                    </p>
                    <Button 
                        variant = "outline" 
                        size = "sm" 
                        onClick = {() => { setSearchQuery(""); setStatusFilter("all"); }}
                        className = "text-xs"
                    >
                        Clear Filters
                    </Button>
                </div>
            )}

            {/* Agents List */}
            {!loading && filteredAgents.length > 0 && (
                <div className = "space-y-4">
                    {filteredAgents.map((agent) => (
                        <AgentCard
                            key = {agent.agentId || agent.id}
                            createdAgent = {agent}
                            onUpdate = {handleUpdate}
                            onDelete = {handleDelete}
                            onStatusToggle = {handleStatusToggle}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyAgents
