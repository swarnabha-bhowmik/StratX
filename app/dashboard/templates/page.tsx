"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  BriefcaseBusiness,
  Mail,
  Search,
  Calendar,
  TrendingUp,
  GitPullRequest,
  CheckSquare,
  MessageSquare,
  Globe,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

interface TemplateItem {
  id: string;
  title: string;
  category: string;
  description: string;
  prompt: string;
  schedule: string;
  tools: string[];
  icon: any;
  iconBg: string;
  iconColor: string;
  borderHover: string;
}

const TEMPLATES_CATALOG: TemplateItem[] = [
  {
    id: "ai-jobs",
    title: "AI Job Hunter & Scraper",
    category: "Career",
    description:
      "Monitors top tech career boards and startups for remote AI/ML engineering roles, filters based on skills and salary, and delivers daily openings.",
    prompt:
      "Monitor top tech job boards and career pages for remote Senior AI and Full-Stack Engineering roles with salary >$150k. Filter out duplicates and send a curated morning summary of the top 5 direct apply links to my WhatsApp.",
    schedule: "Weekdays @ 08:30 AM",
    tools: ["Browserbase", "WhatsApp"],
    icon: BriefcaseBusiness,
    iconBg: "bg-amber-100 dark:bg-amber-950/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderHover: "hover:border-amber-300",
  },
  {
    id: "inbox-digest",
    title: "Executive Daily Inbox Digest",
    category: "Productivity",
    description:
      "Reviews incoming unread Gmail messages, categorizes emails by urgency, flags critical follow-up deadlines, and drafts concise daily briefings.",
    prompt:
      "Analyze unread client emails in my Gmail inbox every morning, categorize them by priority and urgency, extract critical action items, and generate a 3-bullet executive briefing highlighting needed decisions.",
    schedule: "Every Day @ 07:30 AM",
    tools: ["Gmail", "Groq AI"],
    icon: Mail,
    iconBg: "bg-blue-100 dark:bg-blue-950/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderHover: "hover:border-blue-300",
  },
  {
    id: "topic-research",
    title: "Autonomous Topic & Market Researcher",
    category: "Research",
    description:
      "Deeply investigates any subject across top credible sources, verifies key findings, and compiles a comprehensive executive brief with citations.",
    prompt:
      "Build an autonomous research agent that searches the web for the latest developments, papers, and key perspectives on a given topic, verifies credible sources, and compiles a comprehensive, well-structured brief with key takeaways.",
    schedule: "On-demand or Weekly",
    tools: ["Google Search", "Browserbase"],
    icon: Search,
    iconBg: "bg-purple-100 dark:bg-purple-950/40",
    iconColor: "text-purple-600 dark:text-purple-400",
    borderHover: "hover:border-purple-300",
  },
  {
    id: "calendar-planner",
    title: "Smart Calendar & Day Orchestrator",
    category: "Planning",
    description:
      "Reviews Google Calendar meetings, prepares attendee context notes, and plans time-blocked deep work sessions with timely WhatsApp alerts.",
    prompt:
      "Review my Google Calendar schedule, pending tasks, and priorities each morning. Build an optimized, time-blocked daily plan with dedicated deep work sessions and message my WhatsApp schedule with 10-minute prep notes.",
    schedule: "Weekdays @ 08:00 AM",
    tools: ["Google Calendar", "WhatsApp"],
    icon: Calendar,
    iconBg: "bg-emerald-100 dark:bg-emerald-950/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderHover: "hover:border-emerald-300",
  },
  {
    id: "reddit-trends",
    title: "Reddit & HackerNews Trend Tracker",
    category: "Social & News",
    description:
      "Tracks trending discussions, rising open-source repositories, and viral breakthroughs across r/ArtificialIntelligence, r/tech, and HackerNews.",
    prompt:
      "Track trending discussions, rising posts, and community sentiment across r/ArtificialIntelligence, r/tech, and HackerNews, and send a daily summary of emerging tools and viral insights to my WhatsApp.",
    schedule: "Daily @ 06:00 PM",
    tools: ["Browserbase", "WhatsApp"],
    icon: TrendingUp,
    iconBg: "bg-rose-100 dark:bg-rose-950/40",
    iconColor: "text-rose-600 dark:text-rose-400",
    borderHover: "hover:border-rose-300",
  },
  {
    id: "linear-sprint",
    title: "Linear / Jira Sprint Blocker Sentinel",
    category: "Engineering",
    description:
      "Monitors sprint issue backlogs, detects stalled high-priority bug tickets, and delivers an automated standup briefing to Slack or WhatsApp.",
    prompt:
      "Inspect our active Linear sprint board, identify all in-progress tickets without activity in the last 48 hours, and compile an executive blocker digest categorized by engineer.",
    schedule: "Weekdays @ 09:15 AM",
    tools: ["Linear", "Slack"],
    icon: CheckSquare,
    iconBg: "bg-indigo-100 dark:bg-indigo-950/40",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    borderHover: "hover:border-indigo-300",
  },
  {
    id: "github-sentinel",
    title: "GitHub Pull Request & Review Monitor",
    category: "Engineering",
    description:
      "Tracks pull requests across team repositories, flags stale code reviews, and sends ping reminders to assignees before end of sprint.",
    prompt:
      "Monitor open pull requests across our GitHub repository. Flag any PR that has been awaiting review for more than 24 hours or has failing CI checks, and post a concise reminder digest to Slack.",
    schedule: "Twice Daily",
    tools: ["GitHub", "Slack"],
    icon: GitPullRequest,
    iconBg: "bg-slate-100 dark:bg-slate-800",
    iconColor: "text-slate-800 dark:text-slate-200",
    borderHover: "hover:border-slate-400",
  },
  {
    id: "feedback-sentiment",
    title: "Customer Support & Review Sentiment",
    category: "Productivity",
    description:
      "Monitors user reviews and support feedback tickets, classifies sentiment, and highlights high-urgency bug reports directly to your inbox.",
    prompt:
      "Scrape new customer reviews and support feedback messages. Classify each message by sentiment (Positive, Neutral, Urgent Bug, Complaint), and alert our team immediately on WhatsApp for any high-urgency complaint.",
    schedule: "Every 2 Hours",
    tools: ["Browserbase", "WhatsApp"],
    icon: MessageSquare,
    iconBg: "bg-teal-100 dark:bg-teal-950/40",
    iconColor: "text-teal-600 dark:text-teal-400",
    borderHover: "hover:border-teal-300",
  },
];

const CATEGORIES = [
  "All",
  "Career",
  "Productivity",
  "Research",
  "Planning",
  "Engineering",
  "Social & News",
];

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPrompt = (id: string, promptText: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    toast.add({
      type: "success",
      title: "Prompt Copied to Clipboard",
      timeout: 2500,
    });
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleUseTemplate = (promptText: string) => {
    router.push(`/dashboard/agents?prompt=${encodeURIComponent(promptText)}`);
  };

  const filteredTemplates = TEMPLATES_CATALOG.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.prompt.toLowerCase().includes(q) ||
      item.tools.some((t) => t.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-background pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-slate-200/80 dark:border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
                <Layers className="size-4" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">
                Agent Templates & Recipes
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-muted-foreground">
              Deploy pre-configured autonomous multi-tool blueprints with one click or customize them for your workflow.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/agents"
              className="inline-flex items-center rounded-xl bg-blue-600 px-3 py-2 text-white font-semibold text-xs shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Sparkles className="size-3.5 mr-1.5" /> Create From Scratch
            </Link>
          </div>
        </div>

        {/* Toolbar: Category Filters + Search */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white dark:bg-muted dark:text-foreground shadow-2xs"
                    : "bg-white dark:bg-card border border-slate-200 dark:border-border text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates or tools..."
              className="h-9 text-xs bg-white dark:bg-card rounded-xl border-slate-200 dark:border-border"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            const isCopied = copiedId === template.id;

            return (
              <div
                key={template.id}
                className={`flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-border bg-white dark:bg-card p-6 shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md ${template.borderHover}`}
              >
                <div>
                  {/* Top Bar: Icon + Category + Cadence */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex size-11 items-center justify-center rounded-xl ${template.iconBg} ${template.iconColor}`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <span className="rounded-full bg-slate-100 dark:bg-muted px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-muted-foreground">
                      {template.schedule}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-5 text-base font-bold text-slate-900 dark:text-foreground">
                    {template.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 dark:text-muted-foreground leading-relaxed">
                    {template.description}
                  </p>

                  {/* Prompt Preview Snippet */}
                  <div className="mt-4 rounded-xl bg-slate-50 dark:bg-muted/40 p-3 border border-slate-100 dark:border-border/60 text-[11px] text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    &ldquo;{template.prompt}&rdquo;
                  </div>
                </div>

                {/* Bottom Bar: Tools + Action Buttons */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-border">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {template.tools.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-blue-50/80 dark:bg-blue-950/40 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyPrompt(template.id, template.prompt)}
                      className="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-foreground cursor-pointer rounded-lg"
                      title="Copy prompt text"
                    >
                      {isCopied ? (
                        <>
                          <Check className="size-3.5 text-emerald-600 mr-1" />
                          <span className="text-emerald-600 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5 mr-1" />
                          Copy Prompt
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template.prompt)}
                      className="h-8 px-3.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-2xs cursor-pointer"
                    >
                      Use Template <ArrowRight className="size-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
