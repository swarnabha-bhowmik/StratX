import { MessageSquare, Calendar, Globe, Sparkles, CheckCircle2, ArrowRight, Play, Cpu, ShieldCheck } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Define your agent with natural language",
    description:
      "Simply describe what you need done. StratX analyzes your prompt, determines the optimal reasoning steps, identifies required integrations, and asks clarifying questions if anything is ambiguous.",
    tag: "Prompt-to-Agent",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200",
    visual: (
      <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 text-xs font-mono text-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 pb-3 border-b border-slate-800 text-slate-400 text-[11px]">
          <span className="size-2.5 rounded-full bg-rose-500/80 inline-block" />
          <span className="size-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span className="size-2.5 rounded-full bg-emerald-500/80 inline-block" />
          <span className="ml-2 text-slate-500">stratx-agent-compiler</span>
        </div>
        <div className="pt-3 space-y-1.5">
          <p className="text-slate-400"># Prompt received:</p>
          <p className="text-emerald-400 font-sans text-xs">
            &ldquo;Monitor arXiv for new LLM agent papers every morning and alert me on WhatsApp.&rdquo;
          </p>
          <div className="pt-2 flex flex-wrap gap-1.5">
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] text-blue-300">Tool: Browserbase</span>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">Tool: WhatsApp</span>
            <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-300">Schedule: 08:00 AM Daily</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: "02",
    title: "Connect your workspace tools seamlessly",
    description:
      "Authorize your external accounts with zero friction. Scan a WhatsApp QR code to link your phone, grant Gmail or Calendar permissions, or let headless cloud browsers navigate authenticated portals.",
    tag: "Zero-Setup Integrations",
    tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    visual: (
      <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-xs">
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/60 p-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-[#25D366] text-white">
              <MessageSquare className="size-3.5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">WhatsApp Companion</p>
              <p className="text-[11px] text-slate-500">+1 (555) 019-2834</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="size-3.5" /> Connected
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-violet-600 text-white">
              <Globe className="size-3.5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Browserbase Cloud Browser</p>
              <p className="text-[11px] text-slate-500">Headless Chromium sandbox</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="size-3.5" /> Active
          </span>
        </div>
      </div>
    ),
  },
  {
    step: "03",
    title: "Run autonomously on reliable background infrastructure",
    description:
      "Powered by Inngest durable workflows, your agents execute reliably in the background without needing your browser open. Automatic retries, rate-limiting, error recovery, and instant audit trails are built in.",
    tag: "Durable Orchestration",
    tagColor: "bg-violet-50 text-violet-700 border-violet-200",
    visual: (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-900">Inngest Cron Runner</span>
          </div>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600">
            Every day @ 08:00
          </span>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span>Execution Status</span>
            <span className="font-semibold text-emerald-600">Completed (1.4s)</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-full bg-emerald-500 rounded-full" />
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            ✓ 3 papers extracted &rarr; Summary dispatched to WhatsApp
          </p>
        </div>
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Simple 3-Step Setup
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            How StratX powers your autonomous workflow.
          </h2>
          <p className="mt-4 text-base text-slate-600">
            You don&apos;t need to write Python scripts or manage server infrastructure. Build and deploy powerful agents in less than two minutes.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {steps.map((item) => (
            <div
              key={item.step}
              className="relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-slate-50/40 p-8 shadow-xs transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-3xl font-black text-blue-600/30">
                    {item.step}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${item.tagColor}`}
                  >
                    {item.tag}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>

              <div className="mt-8 pt-4">{item.visual}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
