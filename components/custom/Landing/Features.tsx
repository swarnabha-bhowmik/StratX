import { Cpu, ShieldCheck, Repeat, Smartphone, Sparkles, Terminal, Zap, Clock, LineChart } from "lucide-react";

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Engineered For Autonomy
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Everything you need to orchestrate AI workforce.
          </h2>
          <p className="mt-4 text-base text-slate-600">
            From single-task routines to continuous recurring background workflows, StratX provides full control over how agents think, act, and communicate.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Bento Card 1: Wide */}
          <div className="group rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-8 shadow-xs md:col-span-2 transition-all hover:border-blue-300 hover:shadow-md">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 mb-6">
              <Sparkles className="size-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Prompt-to-Agent Architecture with Interactive Clarification
            </h3>
            <p className="mt-3 text-sm text-slate-600 max-w-xl">
              Type what you need done in plain English. StratX dynamically determines the required tools, formulates strict instructions, asks follow-up questions to clarify edge cases, and sets up execution boundaries.
            </p>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-inner text-xs font-mono text-slate-700">
              <p className="text-blue-600 font-semibold mb-1">&gt; User prompt:</p>
              <p className="text-slate-600 italic">
                &quot;Every weekday at 7:30 AM, scrape HackerNews and Reddit for new AI tools, summarize the top 3, and ping them to my WhatsApp.&quot;
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="text-emerald-600 font-medium">✓ Auto-selected: Browserbase + WhatsApp</span>
                <span className="text-blue-600 font-medium">✓ Schedule: Cron 30 7 * * 1-5</span>
              </div>
            </div>
          </div>

          {/* Bento Card 2: WhatsApp Native */}
          <div className="group rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-8 shadow-xs transition-all hover:border-emerald-300 hover:shadow-md">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-6">
              <Smartphone className="size-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Native WhatsApp Companion</h3>
            <p className="mt-3 text-sm text-slate-600">
              No need to log into a web app to stay updated. Your agents can proactively deliver briefings, ask for confirmation before high-stakes actions, and ping you when tasks finish.
            </p>
            <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-800 flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Direct pairing with QR code in 10 seconds</span>
            </div>
          </div>

          {/* Bento Card 3: Autonomous Cron Scheduling */}
          <div className="group rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-8 shadow-xs transition-all hover:border-indigo-300 hover:shadow-md">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mb-6">
              <Clock className="size-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Reliable Background Crons</h3>
            <p className="mt-3 text-sm text-slate-600">
              Powered by Inngest durable execution. Agents run on serverless workers on schedule—even if your laptop is closed, offline, or asleep.
            </p>
          </div>

          {/* Bento Card 4: Headless Browsing */}
          <div className="group rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-8 shadow-xs transition-all hover:border-violet-300 hover:shadow-md">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 mb-6">
              <Terminal className="size-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Cloud Browserbase Automation</h3>
            <p className="mt-3 text-sm text-slate-600">
              Access protected data and live dynamic sites. Agents utilize headless Chromium instances to click buttons, fill forms, and parse deep web pages.
            </p>
          </div>

          {/* Bento Card 5: Full Audit & Telemetry */}
          <div className="group rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-amber-50/30 p-8 shadow-xs transition-all hover:border-amber-300 hover:shadow-md">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-6">
              <LineChart className="size-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Run Logs & Safety Controls</h3>
            <p className="mt-3 text-sm text-slate-600">
              Every step is logged. Review execution outputs, inspect tool calls, pause unruly agents, and stay in total control of your agent fleet.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
