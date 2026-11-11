"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Blocks,
  Search,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Unlink,
  Link2,
  MessageSquare,
  Globe,
  Sparkles,
  Bot,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";

interface CatalogTool {
  slug: string;
  name: string;
  description: string;
  logo: string;
  categories: string[];
  isNoAuth: boolean;
  provider: string;
}

const FEATURED_SLUGS = [
  "whatsapp",
  "browserbase",
  "google_search",
  "gmail",
  "googlecalendar",
  "slack",
  "github",
  "notion",
  "linear",
  "trello",
  "jira",
  "hubspot",
  "clickup",
  "discord",
  "airtable",
  "spotify",
  "stripe",
  "twitter",
  "asana",
];

const CATEGORIES = [
  { id: "all", label: "All Integrations" },
  { id: "communication", label: "Communication" },
  { id: "productivity", label: "Productivity" },
  { id: "developer", label: "Developer Tools" },
  { id: "web", label: "Web & Scraping" },
  { id: "ai", label: "Search & AI" },
];

export default function IntegrationsPage() {
  const router = useRouter();
  const [tools, setTools] = useState<CatalogTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [connectedMap, setConnectedMap] = useState<Record<string, boolean>>({});
  const [connectingSlug, setConnectingSlug] = useState<string | null>(null);
  const [disconnectingSlug, setDisconnectingSlug] = useState<string | null>(null);

  // Load tools from catalog API and user's connected tool statuses
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [catalogRes, userToolsRes] = await Promise.all([
        axios.get("/api/agent/tools/catalog?limit=100").catch(() => null),
        axios.get("/api/agent/tools").catch(() => null),
      ]);

      if (catalogRes?.data?.tools) {
        setTools(catalogRes.data.tools);
      }

      if (Array.isArray(userToolsRes?.data)) {
        const map: Record<string, boolean> = {};
        userToolsRes.data.forEach((t: any) => {
          if (t?.slug) {
            map[t.slug.toLowerCase()] = Boolean(t.isConnected);
          }
        });
        setConnectedMap(map);
      }
    } catch (err) {
      console.warn("Failed to load integrations data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConnect = async (tool: CatalogTool) => {
    if (tool.slug.toLowerCase() === "whatsapp") {
      router.push("/dashboard/whatsapp-connect");
      return;
    }

    setConnectingSlug(tool.slug);
    try {
      const res = await axios.post("/api/agent/tools/connect", {
        toolSlug: tool.slug,
      });

      if (res.data?.redirectUrl) {
        window.open(
          res.data.redirectUrl,
          "_blank",
          "width=650,height=750,menubar=no,toolbar=no,location=yes"
        );

        toast.add({
          type: "info",
          title: `Connecting ${tool.name}...`,
          description: "Complete authentication in the opened browser tab.",
          timeout: 5000,
        });

        // Poll for confirmation
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          try {
            const checkRes = await axios.get("/api/agent/tools");
            if (Array.isArray(checkRes.data)) {
              const matched = checkRes.data.find(
                (t: any) => t.slug?.toLowerCase() === tool.slug.toLowerCase()
              );
              if (matched?.isConnected) {
                clearInterval(interval);
                setConnectedMap((prev) => ({ ...prev, [tool.slug.toLowerCase()]: true }));
                toast.add({
                  type: "success",
                  title: `${tool.name} Connected!`,
                  description: "You can now use this tool in any autonomous agent.",
                });
              }
            }
          } catch {}
          if (attempts >= 12) clearInterval(interval);
        }, 3000);
      } else {
        setConnectedMap((prev) => ({ ...prev, [tool.slug.toLowerCase()]: true }));
        toast.add({
          type: "success",
          title: `${tool.name} is Connected`,
          timeout: 3000,
        });
      }
    } catch (err: any) {
      console.error("Connect tool failed:", err);
      toast.add({
        type: "error",
        title: `Failed to connect ${tool.name}`,
        description: err?.response?.data?.error || "Please try again.",
      });
    } finally {
      setConnectingSlug(null);
    }
  };

  const handleDisconnect = async (tool: CatalogTool) => {
    setDisconnectingSlug(tool.slug);
    try {
      const res = await axios.post("/api/agent/tools/disconnect", {
        toolSlug: tool.slug,
      });

      if (res.data?.success) {
        setConnectedMap((prev) => ({ ...prev, [tool.slug.toLowerCase()]: false }));
        toast.add({
          type: "success",
          title: `${tool.name} Disconnected`,
          timeout: 3000,
        });
      }
    } catch (err: any) {
      console.error("Disconnect tool failed:", err);
      toast.add({
        type: "error",
        title: `Failed to disconnect ${tool.name}`,
        description: err?.response?.data?.error || "Please try again.",
      });
    } finally {
      setDisconnectingSlug(null);
    }
  };

  const filteredTools = tools.filter((tool) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      tool.name.toLowerCase().includes(q) ||
      tool.slug.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q);

    let matchesCategory = true;
    if (selectedCategory !== "all") {
      const cat = selectedCategory.toLowerCase();
      matchesCategory =
        tool.categories.some((c) => c.toLowerCase().includes(cat)) ||
        tool.provider.toLowerCase().includes(cat);
    }

    return matchesSearch && matchesCategory;
  });

  const connectedCount = Object.values(connectedMap).filter(Boolean).length;

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-background pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-slate-200/80 dark:border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                <Blocks className="size-4" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">
                Workspace Integrations
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-muted-foreground">
              Connect external services, messaging companions, and 1,000+ Composio apps to your AI agents.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-muted-foreground shadow-2xs">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>{connectedCount} Connected</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="rounded-xl border-slate-200 bg-white dark:bg-muted text-xs font-semibold shadow-2xs hover:bg-slate-50 cursor-pointer"
            >
              <RotateCw className={`size-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Toolbar: Category Filters + Search */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-slate-900 text-white dark:bg-muted dark:text-foreground shadow-2xs"
                    : "bg-white dark:bg-card border border-slate-200 dark:border-border text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 1,000+ integrations..."
              className="h-9 pl-8.5 text-xs bg-white dark:bg-card rounded-xl border-slate-200 dark:border-border"
            />
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-slate-200/90 dark:border-border bg-white dark:bg-card">
              <Loader2 className="size-6 text-purple-600 animate-spin" />
              <p className="mt-3 text-xs text-slate-500 font-medium">Loading tool catalog...</p>
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 rounded-3xl border border-dashed border-slate-200 dark:border-border bg-white/70 dark:bg-card/50 text-center">
              <Blocks className="size-8 text-slate-400" />
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-foreground">
                No integrations found
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                No apps matched &ldquo;{searchQuery}&rdquo;. Try another search keyword.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map((tool) => {
                const isConnected = Boolean(connectedMap[tool.slug.toLowerCase()]);
                const isConnecting = connectingSlug === tool.slug;
                const isDisconnecting = disconnectingSlug === tool.slug;

                return (
                  <div
                    key={tool.slug}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-border bg-white dark:bg-card p-5 shadow-2xs transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
                  >
                    <div>
                      {/* Top Row: Logo + Provider Badge + Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="size-11 rounded-xl bg-slate-50 dark:bg-muted border border-slate-200/70 dark:border-border flex items-center justify-center p-2 shrink-0">
                          <img
                            src={tool.logo || `https://logos.composio.dev/api/${tool.slug}`}
                            alt={tool.name}
                            className="size-7 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                              tool.provider.includes("WhatsApp") || tool.provider.includes("Browserbase")
                                ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40"
                                : "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40"
                            }`}
                          >
                            {tool.provider}
                          </span>

                          {isConnected && (
                            <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40">
                              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Tool Name & Description */}
                      <div className="mt-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">
                          {tool.name}
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-500 dark:text-muted-foreground leading-relaxed line-clamp-2 min-h-[32px]">
                          {tool.description}
                        </p>
                      </div>

                      {/* Categories */}
                      {tool.categories.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {tool.categories.slice(0, 2).map((cat) => (
                            <span
                              key={cat}
                              className="rounded bg-slate-100 dark:bg-muted px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-muted-foreground"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-border flex items-center justify-between gap-2">
                      <Link
                        href="/dashboard/agents"
                        className="inline-flex items-center text-xs text-slate-600 hover:text-slate-900 dark:text-muted-foreground dark:hover:text-foreground h-8 px-2 transition-colors"
                      >
                        <Bot className="size-3 mr-1" /> Use in Agent
                      </Link>

                      {isConnected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isDisconnecting}
                          onClick={() => handleDisconnect(tool)}
                          className="h-8 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer"
                        >
                          {isDisconnecting ? (
                            <Loader2 className="size-3 animate-spin mr-1" />
                          ) : (
                            <Unlink className="size-3 mr-1" />
                          )}
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled={isConnecting}
                          onClick={() => handleConnect(tool)}
                          className="h-8 px-3.5 text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-2xs cursor-pointer"
                        >
                          {isConnecting ? (
                            <Loader2 className="size-3 animate-spin mr-1" />
                          ) : (
                            <Link2 className="size-3 mr-1" />
                          )}
                          Connect
                        </Button>
                      )}
                    </div>
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
