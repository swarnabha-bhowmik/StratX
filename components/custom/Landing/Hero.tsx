"use client";

import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, Clock, Play, Sparkles, Terminal, Zap, Shield, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Hero({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 bg-radial from-blue-50/70 via-white to-white">
      {/* Background glowing gradient accents */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-200/50 via-indigo-200/40 to-violet-200/40 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Announcement pill badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-xs transition-colors hover:bg-blue-100">
            <Sparkles className="size-3.5 text-blue-600 animate-pulse" />
            <span>StratX 2.0 is Live — Deploy Autonomous Multi-Tool AI Agents</span>
            <ArrowRight className="size-3 text-blue-500" />
          </div>

          {/* Headline */}
          <h1 className="mt-8 max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            Automate complex workflows with{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              autonomous AI agents.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl">
            Build, schedule, and orchestrate intelligent agents that browse the web, send WhatsApp updates, organize your calendar, and manage your inbox—all from natural language prompts.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href={isSignedIn ? "/dashboard" : "/sign-up"}
              className="inline-flex items-center justify-center gap-2 h-13 px-8 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
            >
              <span>{isSignedIn ? "Go to Dashboard" : "Start Building for Free"}</span>
              <ArrowRight className="size-5" />
            </Link>

            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 h-13 px-8 text-base font-medium rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 shadow-xs transition-colors"
            >
              <Play className="size-4 text-blue-600 fill-blue-600" />
              <span>See How It Works</span>
            </Link>
          </div>

          {/* Proof Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <span>100 free run credits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <span>Zero coding experience needed</span>
            </div>
          </div>

          {/* Interactive Agent Workflow Mockup */}
          <div className="mt-16 w-full max-w-5xl rounded-3xl border border-slate-200/90 bg-white/90 p-4 shadow-2xl shadow-blue-900/10 backdrop-blur-xl sm:p-6 lg:p-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white overflow-hidden shadow-inner">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-red-500/80" />
                  <span className="size-3 rounded-full bg-amber-500/80" />
                  <span className="size-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">stratx-agent-orchestrator // runner-01</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Autonomous Cron Active
                  </span>
                </div>
              </div>

              {/* Agent Card Mockup Content */}
              <div className="p-6 text-left font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                      <Bot className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        Executive Market & Daily Digest Agent
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px]">
                          Recurring: Daily @ 8:00 AM
                        </Badge>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Monitors industry feeds, filters high-priority emails, summarizes calendar, and alerts WhatsApp
                      </p>
                    </div>
                  </div>

                  {/* Connected Tools Strip */}
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-400" /> WhatsApp
                    </span>
                    <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-sky-300 border border-sky-500/20 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-sky-400" /> Gmail
                    </span>
                    <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-violet-300 border border-violet-500/20 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-violet-400" /> Browserbase
                    </span>
                  </div>
                </div>

                {/* Execution Stream Log */}
                <div className="mt-5 space-y-2.5 font-mono text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="text-blue-400">[08:00:01]</span>
                    <span className="text-slate-400">Triggered by scheduled Inngest cron event:</span>
                    <span className="text-amber-300 font-semibold">&quot;daily_briefing_cron&quot;</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-blue-400">[08:00:03]</span>
                    <span className="text-slate-400">Tool execution:</span>
                    <span className="text-sky-300">Gmail.getUnreadEmails(filter: &quot;is:important&quot;)</span>
                    <span className="text-emerald-400 font-semibold">✓ 4 urgent emails retrieved</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-blue-400">[08:00:07]</span>
                    <span className="text-slate-400">Tool execution:</span>
                    <span className="text-violet-300">Browserbase.scrape({'{ url: "https://news.ycombinator.com/leaders" }'})</span>
                    <span className="text-emerald-400 font-semibold">✓ Extracted 3 trending articles</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-blue-400">[08:00:10]</span>
                    <span className="text-slate-400">Tool execution:</span>
                    <span className="text-emerald-300">WhatsApp.sendMessage({'{ recipient: "+1 (555) 234-5678" }'})</span>
                    <span className="text-emerald-400 font-semibold">✓ Morning Briefing delivered</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-emerald-400 font-semibold pt-1">
                    <span>[08:00:11]</span>
                    <span>✓ Execution completed successfully in 10.4s (100% autonomous)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
