import Link from "next/link";
import { Briefcase, Mail, Search, Calendar, TrendingUp, Sparkles, ArrowRight, Check, Zap } from "lucide-react";

const showcaseTemplates = [
  {
    title: "AI Job Hunter & Scraper",
    description:
      "Monitors top tech career boards and startups for remote AI/ML engineering roles, extracts salary ranges and tech stacks, and delivers daily curated openings.",
    icon: Briefcase,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50 border-amber-200",
    cadence: "Daily @ 09:00 AM",
    tools: ["Browserbase", "WhatsApp"],
    promptPreview:
      "Scan remote AI job boards for Senior Full-Stack and AI Engineer positions above $150k. Filter out duplicates and send top 5 listings.",
  },
  {
    title: "Executive Daily Inbox Digest",
    description:
      "Reviews unread Gmail messages, categorizes emails by urgency, flags follow-up deadlines, and drafts concise daily executive briefings.",
    icon: Mail,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50 border-blue-200",
    cadence: "Every Morning @ 07:30 AM",
    tools: ["Gmail", "Groq AI"],
    promptPreview:
      "Analyze unread client emails, extract pending approvals and meeting invites, and summarize them into a 3-bullet morning briefing.",
  },
  {
    title: "Deep Market & Competitor Research",
    description:
      "Investigates industry news, newly launched GitHub repos, and product updates. Aggregates citations, analyzes sentiment, and outputs markdown reports.",
    icon: Search,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50 border-purple-200",
    cadence: "On-demand or Weekly",
    tools: ["Cloud Browser", "Perplexity/Groq"],
    promptPreview:
      "Research top 5 competitors in agentic AI frameworks. Compile their pricing tiers, key differentiator features, and recent launch changelogs.",
  },
  {
    title: "Smart Calendar & Day Orchestrator",
    description:
      "Inspects today's schedule, prepares context briefs for upcoming attendee meetings, and identifies open focus blocks for deep work.",
    icon: Calendar,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50 border-emerald-200",
    cadence: "Weekdays @ 08:00 AM",
    tools: ["Google Calendar", "WhatsApp"],
    promptPreview:
      "Check today's Google Calendar meetings, look up LinkedIn profiles of external guests, and message my WhatsApp schedule with 10-min prep notes.",
  },
  {
    title: "Reddit & Tech Trend Monitor",
    description:
      "Tracks trending discussions across r/ArtificialIntelligence, r/tech, and HackerNews to detect viral breakthroughs and sentiment shifts.",
    icon: TrendingUp,
    iconColor: "text-rose-600",
    iconBg: "bg-rose-50 border-rose-200",
    cadence: "Twice Daily",
    tools: ["Browserbase", "Discord / WhatsApp"],
    promptPreview:
      "Scrape top 10 rising discussions on HackerNews and r/MachineLearning. Identify new open-source models with >500 upvotes.",
  },
];

export function Templates() {
  return (
    <section id="templates" className="py-20 lg:py-28 bg-slate-50/70 border-y border-slate-200/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Ready-To-Run Recipes
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Launch proven agent blueprints in seconds.
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Pick a ready-made workflow template or customize the prompt to fit your exact business and personal routines.
            </p>
          </div>

          <div>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-xs hover:bg-slate-50 transition-colors"
            >
              Explore All Templates <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Template Cards Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {showcaseTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <div
                key={template.title}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex size-11 items-center justify-center rounded-xl border ${template.iconBg}`}
                    >
                      <Icon className={`size-5 ${template.iconColor}`} />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                      {template.cadence}
                    </span>
                  </div>

                  <h3 className="mt-5 text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {template.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {template.description}
                  </p>

                  {/* Prompt Quote */}
                  <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-100 text-[11px] text-slate-700 italic">
                    &ldquo;{template.promptPreview}&rdquo;
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {template.tools.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-blue-50/80 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-100"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <Link
                    href="/sign-in"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    Deploy <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Custom Agent Card */}
          <div className="flex flex-col justify-between rounded-2xl border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50/50 to-indigo-50/40 p-6">
            <div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Sparkles className="size-5" />
              </div>
              <h3 className="mt-5 text-base font-bold text-slate-900">Custom Autonomous Agent</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Have a unique automation in mind? Simply write your requirement in plain English and StratX will generate the agent logic on the fly.
              </p>
            </div>

            <div className="mt-6 pt-4">
              <Link
                href="/sign-in"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors"
              >
                Create Custom Agent <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
