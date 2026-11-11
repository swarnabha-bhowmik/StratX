import { composio } from "./composio";

export interface CatalogTool {
  slug: string;
  name: string;
  description: string;
  logo: string;
  categories: string[];
  isNoAuth: boolean;
  provider: string;
}

const NATIVE_TOOLS: CatalogTool[] = [
  {
    slug: "whatsapp",
    name: "WhatsApp",
    description: "Proactive real-time briefings, alerts, and interactive messages directly to your WhatsApp.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
    categories: ["Communication", "Messaging"],
    isNoAuth: false,
    provider: "WhatsApp / Evolution",
  },
  {
    slug: "browserbase",
    name: "Browserbase",
    description: "Cloud-hosted headless Chromium browser sandbox to navigate complex web apps and scrape dynamic content.",
    logo: "https://logos.composio.dev/api/browserbase_tool",
    categories: ["Web Browsing", "Automation"],
    isNoAuth: false,
    provider: "Browserbase",
  },
  {
    slug: "google_search",
    name: "Google Search",
    description: "Live web search and news indexing powered by SerpAPI.",
    logo: "https://logos.composio.dev/api/serpapi",
    categories: ["Search", "Information"],
    isNoAuth: false,
    provider: "SerpAPI",
  },
];

// In-memory cache with 1-hour TTL
let cachedCatalog: CatalogTool[] | null = null;
let lastFetchedAt = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function getComposioCatalog(): Promise<CatalogTool[]> {
  const now = Date.now();
  if (cachedCatalog && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedCatalog;
  }

  try {
    const rawToolkits: any = await composio.toolkits.get().catch((err) => {
      console.warn("[composioCatalog] Failed to fetch toolkits from Composio API:", err?.message || err);
      return [];
    });

    const items = Array.isArray(rawToolkits)
      ? rawToolkits
      : Array.isArray(rawToolkits?.items)
      ? rawToolkits.items
      : [];

    const mappedComposio: CatalogTool[] = items
      .filter((t: any) => t && t.slug)
      .map((t: any) => {
        const categories = Array.isArray(t.meta?.categories)
          ? t.meta.categories.map((c: any) => (typeof c === "string" ? c : c?.name || "")).filter(Boolean)
          : [];

        return {
          slug: String(t.slug).toLowerCase(),
          name: t.name || t.slug,
          description: t.meta?.description || `Connect and automate ${t.name || t.slug} workflows.`,
          logo: t.meta?.logo || `https://logos.composio.dev/api/${t.slug}`,
          categories,
          isNoAuth: Boolean(t.noAuth),
          provider: "Composio",
        };
      });

    // Merge native tools first, followed by deduplicated Composio tools
    const combined: CatalogTool[] = [...NATIVE_TOOLS];
    const seenSlugs = new Set(NATIVE_TOOLS.map((t) => t.slug));

    for (const tool of mappedComposio) {
      if (!seenSlugs.has(tool.slug)) {
        seenSlugs.add(tool.slug);
        combined.push(tool);
      }
    }

    cachedCatalog = combined;
    lastFetchedAt = now;
    return combined;
  } catch (error) {
    console.error("[composioCatalog] Error compiling tool catalog:", error);
    return cachedCatalog || NATIVE_TOOLS;
  }
}

export async function searchCatalog(
  query?: string,
  category?: string,
  limit = 60
): Promise<CatalogTool[]> {
  const catalog = await getComposioCatalog();
  const q = (query || "").trim().toLowerCase();
  const cat = (category || "").trim().toLowerCase();

  return catalog
    .filter((tool) => {
      const matchesQuery =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.slug.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q);

      const matchesCat =
        !cat ||
        tool.categories.some((c) => c.toLowerCase().includes(cat)) ||
        tool.provider.toLowerCase().includes(cat);

      return matchesQuery && matchesCat;
    })
    .slice(0, limit);
}
