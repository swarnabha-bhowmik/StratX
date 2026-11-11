import Image from "next/image";
import { MessageSquare, Mail, Calendar, Globe, Github, Sparkles, Zap, Bot, Layers } from "lucide-react";

const integrations = [
  {
    name: "WhatsApp",
    category: "Communication & Alerts",
    description: "Send and receive real-time messages, briefings, and alert summaries directly to your phone.",
    badge: "Native Baileys",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: MessageSquare,
    iconColor: "text-[#25D366]",
    iconBg: "bg-emerald-50",
  },
  {
    name: "Browserbase",
    category: "Headless Web Browsing",
    description: "Enable agents to navigate web apps, bypass captchas, interact with complex UIs, and scrape dynamic data.",
    badge: "Cloud Browser",
    badgeColor: "bg-violet-50 text-violet-700 border-violet-200",
    icon: Globe,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
  },
  {
    name: "Gmail",
    category: "Email & Executive Briefs",
    description: "Search, filter, summarize, and draft replies to critical incoming messages with contextual awareness.",
    badge: "Official OAuth",
    badgeColor: "bg-red-50 text-red-700 border-red-200",
    icon: Mail,
    iconColor: "text-red-500",
    iconBg: "bg-red-50",
  },
  {
    name: "Google Calendar",
    category: "Scheduling & Time Blocking",
    description: "Review your day, schedule high-priority meetings, detect agenda conflicts, and optimize deep work slots.",
    badge: "Official OAuth",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Calendar,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
  },
  {
    name: "Slack",
    category: "Team Collaboration",
    description: "Broadcast task completions, trigger team agent workflows, and pipe customer digests to target channels.",
    badge: "Composio Auth",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Zap,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
  },
  {
    name: "GitHub",
    category: "Engineering Workflows",
    description: "Track PR activity, review commit summaries, analyze repo issues, and triage developer action items.",
    badge: "Developer Tool",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
    icon: Github,
    iconColor: "text-slate-800",
    iconBg: "bg-slate-100",
  },
  {
    name: "Notion",
    category: "Knowledge & Notes",
    description: "Append research briefs, update internal project documentation, and organize databases automatically.",
    badge: "Workspace Sync",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Layers,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
  },
  {
    name: "Groq & Gemini 2.0",
    category: "Ultra-Fast Intelligence",
    description: "Powered by leading-edge inference for blazing fast tool calling, multi-step reasoning, and zero hallucination.",
    badge: "Multi-Model LLM",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
    icon: Sparkles,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-50",
  },
];

export function Integrations() {
  return (
    <section id="integrations" className="py-20 lg:py-28 bg-slate-50/60 border-y border-slate-200/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Ecosystem & Tooling
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Integrates with your existing workspace.
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Agents on StratX are not locked in a sandbox. They securely authenticate with your favorite apps to take actions on your behalf.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {integrations.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="group relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex size-12 items-center justify-center rounded-xl ${item.iconBg}`}>
                    <Icon className={`size-6 ${item.iconColor}`} />
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                </div>

                <h3 className="mt-5 text-base font-bold text-slate-900">{item.name}</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{item.category}</p>
                <p className="mt-3 text-xs leading-relaxed text-slate-600">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
