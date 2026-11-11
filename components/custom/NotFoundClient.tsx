"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CalendarClock,
  Compass,
  CreditCard,
  Cpu,
  HelpCircle,
  Home,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Radio,
  RotateCcw,
  Search,
  Sparkles,
  Terminal,
  Zap,
  Check,
  Copy,
  ExternalLink,
} from "lucide-react";

interface QuickLink {
  title: string;
  description: string;
  href: string;
  icon: typeof Bot;
  tag: string;
  category: "app" | "resources";
}

const QUICK_LINKS: QuickLink[] = [
  {
    title: "Mission Control Dashboard",
    description: "Monitor live agent runs, active schedules, and orchestrate custom workflows.",
    href: "/dashboard",
    icon: LayoutDashboard,
    tag: "Primary",
    category: "app",
  },
  {
    title: "Agent Blueprint Templates",
    description: "Launch pre-built agents for WhatsApp alerts, lead scraping, and inbox summaries.",
    href: "/dashboard/templates",
    icon: Layers,
    tag: "Templates",
    category: "app",
  },
  {
    title: "Tool & API Integrations",
    description: "Connect WhatsApp, Google Calendar, Gmail, and Browserbase headless browsers.",
    href: "/dashboard/integrations",
    icon: Zap,
    tag: "Connectors",
    category: "app",
  },
  {
    title: "WhatsApp Companion",
    description: "Configure phone numbers to receive real-time autonomous briefings directly to chat.",
    href: "/dashboard/whatsapp-connect",
    icon: MessageSquare,
    tag: "Notification",
    category: "app",
  },
  {
    title: "Automated Schedules & Crons",
    description: "Monitor recurring agent triggers, weekly calendar schedules, and upcoming execution queues.",
    href: "/dashboard/schedules",
    icon: CalendarClock,
    tag: "Automation",
    category: "app",
  },
  {
    title: "Billing & Subscriptions",
    description: "Manage your Paddle subscription plan, execution credit meters, and view invoices.",
    href: "/dashboard/billing",
    icon: CreditCard,
    tag: "Billing",
    category: "app",
  },
  {
    title: "Platform Overview & Features",
    description: "Explore agent reasoning architectures, multi-tool capabilities, and live demos.",
    href: "/#features",
    icon: Home,
    tag: "Overview",
    category: "resources",
  },
  {
    title: "Frequently Asked Questions",
    description: "Answers about credit allocations, custom tools, and agent execution policies.",
    href: "/#faq",
    icon: HelpCircle,
    tag: "Support",
    category: "resources",
  },
];

export default function NotFoundClient() {
  const router = useRouter();
  const rawPathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedLog, setCopiedLog] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [displayPath, setDisplayPath] = useState("");

  useEffect(() => {
    setMounted(true);
    // Detect window pathname if available
    if (typeof window !== "undefined") {
      setDisplayPath(window.location.pathname || rawPathname || "/unknown-route");
    } else {
      setDisplayPath(rawPathname || "/unknown-route");
    }
  }, [rawPathname]);

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const filteredLinks = useMemo(() => {
    if (!searchQuery.trim()) return QUICK_LINKS;
    const q = searchQuery.toLowerCase();
    return QUICK_LINKS.filter(
      (link) =>
        link.title.toLowerCase().includes(q) ||
        link.description.toLowerCase().includes(q) ||
        link.tag.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const diagnosticText = useMemo(() => {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] AGENT_SCAN_REPORT
TARGET_COORDINATE: ${displayPath || "/unresolved-path"}
STATUS_CODE: 404 (RESOURCE_NOT_FOUND)
ROUTER_ENGINE: Next.js App Router (Turbopack)
AUTH_STATUS: ${mounted && isLoaded ? (isSignedIn ? "AUTHENTICATED" : "GUEST") : "EVALUATING"}
FAILSAFE_ROUTING: Recommended fallback -> /dashboard or /
ORCHESTRATOR_ID: stratx-mesh-01`;
  }, [displayPath, mounted, isLoaded, isSignedIn]);

  const handleCopyDiagnostics = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(diagnosticText);
        setCopiedLog(true);
        setTimeout(() => setCopiedLog(false), 2200);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 flex flex-col justify-between overflow-x-hidden">
      {/* Background Decorative Mesh & Gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Ambient colored glowing blobs */}
        <div className="absolute -top-40 left-1/2 h-[520px] w-[950px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-300/30 via-indigo-200/30 to-violet-300/30 blur-3xl" />
        <div className="absolute top-1/2 -left-48 h-80 w-80 rounded-full bg-cyan-200/25 blur-3xl" />
        <div className="absolute bottom-12 -right-48 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <Image
              src="/brand-logo.png"
              alt="StratX Logo"
              width={150}
              height={45}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* System status beacon */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/90 px-3 py-1 text-xs font-medium text-amber-800">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
              </span>
              <span>Coordinate Unresolved (404)</span>
            </div>

            {mounted && isLoaded && (
              <>
                {isSignedIn ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
                  >
                    <LayoutDashboard className="size-3.5" />
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    href="/sign-in"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <span>Sign In</span>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center">
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/90 bg-blue-50/80 px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-2xs backdrop-blur-xs">
            <Radio className="size-3.5 text-blue-600 animate-pulse" />
            <span>Autonomous Agent Signal Lost</span>
            <span className="inline-block size-1 rounded-full bg-blue-400" />
            <span className="font-mono text-[11px] text-blue-600/80">ERROR 404</span>
          </div>

          {/* Holographic Radar / Scanner Graphic */}
          <div className="relative mt-8 mb-4 flex items-center justify-center">
            {/* Outer pulsating rings */}
            <div className="absolute size-44 sm:size-52 rounded-full border border-blue-200/70 animate-ping opacity-25" />
            <div className="absolute size-36 sm:size-44 rounded-full border border-dashed border-indigo-300/80 animate-spin [animation-duration:18s]" />
            <div className="absolute size-28 sm:size-36 rounded-full border border-blue-200/90 bg-gradient-to-tr from-blue-100/50 to-indigo-100/50 blur-xs" />

            {/* Central Holographic Agent Core */}
            <div className="relative z-10 flex size-24 sm:size-28 items-center justify-center rounded-3xl border border-white/80 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/25 ring-8 ring-blue-50">
              <Bot className="size-11 sm:size-13 animate-pulse text-white drop-shadow-md" />

              {/* Status indicator on the core */}
              <span className="absolute -top-1.5 -right-1.5 flex size-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex size-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                  !
                </span>
              </span>
            </div>

            {/* Floating Telemetry Chips */}
            <div className="hidden md:flex absolute -left-28 top-4 items-center gap-2 rounded-xl border border-slate-200/90 bg-white/95 px-3 py-1.5 text-[11px] font-mono text-slate-700 shadow-md backdrop-blur-sm animate-bounce [animation-duration:4s]">
              <Cpu className="size-3.5 text-indigo-500" />
              <span>VECTOR: [0.0, 0.0]</span>
            </div>

            <div className="hidden md:flex absolute -right-28 bottom-4 items-center gap-2 rounded-xl border border-slate-200/90 bg-white/95 px-3 py-1.5 text-[11px] font-mono text-slate-700 shadow-md backdrop-blur-sm animate-bounce [animation-duration:5s]">
              <Sparkles className="size-3.5 text-blue-500" />
              <span>STATUS: ROUTE_UNRESOLVED</span>
            </div>
          </div>

          {/* Big Typographic 404 & Heading */}
          <div className="mt-4">
            <h1 className="text-6xl font-black tracking-tight text-slate-900 sm:text-8xl">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                404
              </span>
            </h1>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Autonomous coordinate not found
            </p>
          </div>

          {/* Subtitle with dynamic path feedback */}
          <p className="mt-3 max-w-xl text-base text-slate-600 sm:text-lg">
            Our AI agents scanned the route tree and queried the vector index, but couldn&apos;t locate the requested endpoint.
          </p>

          {/* Dynamic Requested Path Tag */}
          {displayPath && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1 text-xs font-mono text-slate-600">
              <span className="text-slate-400">Target path:</span>
              <span className="font-semibold text-rose-600 underline underline-offset-2">
                {displayPath}
              </span>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={handleGoBack}
              type="button"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:text-slate-900 hover:shadow-xs active:scale-[0.98]"
            >
              <ArrowLeft className="size-4 text-slate-500" />
              <span>Go Back</span>
            </button>

            {mounted && isLoaded && isSignedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"
              >
                <LayoutDashboard className="size-4" />
                <span>Return to Mission Control</span>
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Home className="size-4" />
                <span>Return to Homepage</span>
                <ArrowRight className="size-4" />
              </Link>
            )}

            <button
              onClick={() => setShowDiagnostics((prev) => !prev)}
              type="button"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/70 px-4 py-2.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100/80 active:scale-[0.98]"
            >
              <Terminal className="size-4 text-indigo-600" />
              <span>{showDiagnostics ? "Hide Telemetry" : "Agent Telemetry"}</span>
            </button>
          </div>

          {/* Collapsible Diagnostic Terminal */}
          {showDiagnostics && (
            <div className="mt-8 w-full max-w-2xl text-left animate-in fade-in-50 duration-200">
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-200 shadow-xl">
                {/* Terminal Header */}
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-rose-500/80" />
                    <span className="size-3 rounded-full bg-amber-500/80" />
                    <span className="size-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono text-xs text-slate-400">
                      stratx-failsafe-telemetry.log
                    </span>
                  </div>
                  <button
                    onClick={handleCopyDiagnostics}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                  >
                    {copiedLog ? (
                      <>
                        <Check className="size-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Copy Log</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Terminal Output */}
                <div className="p-4 font-mono text-xs leading-relaxed text-slate-300">
                  <div className="text-slate-500">
                    // StratX Autonomous Dispatch Incident Report
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap font-mono text-emerald-400/90">
                    {diagnosticText}
                  </pre>
                  <div className="mt-3 flex items-center gap-2 text-slate-400">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Auto-reroute handler is standing by...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Navigation Section */}
        <div className="mt-16 sm:mt-20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Where would you like our agents to take you?
              </h2>
              <p className="text-xs text-slate-500">
                Select a destination or search below to quickly jump back on track.
              </p>
            </div>

            {/* Quick search input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md hover:shadow-blue-500/5 backdrop-blur-xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                        <Icon className="size-5" />
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-slate-600">
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="mt-4 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600 opacity-90 transition-transform group-hover:translate-x-0.5">
                    <span>Navigate</span>
                    <ArrowRight className="size-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>

          {filteredLinks.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
              <Bot className="mx-auto size-8 text-slate-400" />
              <p className="mt-2 text-sm font-medium text-slate-700">
                No matching destination found for &quot;{searchQuery}&quot;
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset search</span>
              </button>
            </div>
          )}
        </div>

        {/* Help & Support Banner */}
        <div className="mt-12 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50/50 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-xs text-blue-600 border border-blue-100">
              <Compass className="size-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Suspect this is a missing link or platform error?
              </h4>
              <p className="text-[11px] text-slate-600">
                Our support and engineering teams are ready to inspect broken agent webhooks or reroute configurations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/#faq"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
            >
              <span>View Docs & FAQ</span>
            </Link>
            <Link
              href="mailto:support@stratx.ai"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-slate-800"
            >
              <span>Contact Support</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200/80 bg-white/60 py-6 backdrop-blur-xs">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} StratX. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-600">
              All StratX agent nodes running normally
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
