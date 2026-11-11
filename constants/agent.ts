export interface QuickSuggestion {
    label: string;
    prompt: string;
}

export interface Template {
    title: string;
    description: string;
    icon: string;
    iconBg: string;
    iconColor: string;
    border: string;
    glow: string;
}

export const quickSuggestions: QuickSuggestion[] = [
    {
        label: "Find AI Jobs",
        prompt: "Create an agent that monitors top tech job boards and company career pages for remote AI and ML engineering roles, filters them based on required skills and salary range, and delivers a daily curated list of new openings with direct apply links."
    },
    {
        label: "Inbox Summary",
        prompt: "Create an agent that connects to my email inbox, analyzes incoming unread messages every morning, categorizes them by priority and urgency, and generates a concise executive briefing highlighting critical action items."
    },
    {
        label: "Research Topic",
        prompt: "Build an autonomous research agent that searches the web for the latest developments, papers, and key perspectives on a given topic, verifies credible sources, and compiles a comprehensive, well-structured brief with key takeaways."
    },
    {
        label: "Plan My Day",
        prompt: "Create a personal productivity agent that reviews my calendar schedule, pending tasks, and priorities each morning, and builds an optimized, time-blocked daily plan with dedicated deep work sessions and timely reminders."
    },
    {
        label: "Reddit Trends",
        prompt: "Build an agent that tracks trending discussions, rising posts, and community sentiment across specified subreddits (such as r/ArtificialIntelligence, r/tech, and r/SaaS), and sends a daily summary of emerging topics and viral insights."
    }
];

export const templates: Template[] = [
    {
        title: "Find latest jobs",
        description: "Scrape and track the newest job listings matching your skills and criteria across multiple platforms.",
        icon: "BriefcaseBusiness",
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
        border: "hover:border-orange-300",
        glow: "hover:shadow-orange-100",
    },
    {
        title: "Daily inbox summary",
        description: "Automatically review incoming emails and generate an organized daily digest of key updates and action items.",
        icon: "Mail",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        border: "hover:border-blue-300",
        glow: "hover:shadow-blue-100",
    },
    {
        title: "Research a topic",
        description: "Deeply investigate any subject by gathering information from top sources and summarizing key findings.",
        icon: "Search",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
        border: "hover:border-purple-300",
        glow: "hover:shadow-purple-100",
    },
];

export const QUICK_SUGGESTIONS = quickSuggestions;
export const TEMPLATES = templates;