"use client";

import React, { useState } from "react";
import { Wrench } from "lucide-react";

export interface ToolMeta {
  name: string;
  icon: React.ReactNode;
}

const ComposioLogo = ({ slug, alt }: { slug: string; alt: string }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <Wrench className="size-3.5 text-muted-foreground shrink-0" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://logos.composio.dev/api/${slug}`}
      alt={alt}
      className="size-3.5 shrink-0 object-contain rounded-xs"
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};

export const getToolMeta = (slug: string): ToolMeta => {
  const normalized = (slug || "").toLowerCase().trim();

  switch (normalized) {
    case "gmail":
      return {
        name: "Gmail",
        icon: (
          <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z"
              fill="#ECEFF1"
            />
            <path
              d="M20 4H16L12 8L8 4H4C2.9 4 2 4.9 2 6V7L12 14L22 7V6C22 4.9 21.1 4 20 4Z"
              fill="#EA4335"
            />
            <path d="M2 6V18C2 19.1 2.9 20 4 20H8V11L2 6Z" fill="#4285F4" />
            <path d="M22 6L16 11V20H20C21.1 20 22 19.1 22 18V6Z" fill="#34A853" />
            <path d="M16 20H8V11L12 14L16 11V20Z" fill="#FBBC05" />
          </svg>
        ),
      };

    case "google_search":
    case "composio_search":
      return {
        name: "Google Search",
        icon: (
          <svg className="size-3.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        ),
      };

    case "serp_search":
    case "serpapi":
      return {
        name: "SERP Search",
        icon: (
          <svg className="size-3.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        ),
      };

    case "browserbase":
    case "browserbase_tool":
      return {
        name: "Browserbase",
        icon: (
          <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="5" fill="#FF5A36" />
            <path
              d="M6 8h12M6 12h12M6 16h8"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        ),
      };

    case "slack":
      return {
        name: "Slack",
        icon: (
          <svg className="size-3.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#E01E5A"
              d="M5.04 14.05a2.03 2.03 0 1 1-2.03-2.03h2.03v2.03zm1.01 0a2.03 2.03 0 0 1 4.06 0v5.07a2.03 2.03 0 1 1-4.06 0v-5.07z"
            />
            <path
              fill="#36C5F0"
              d="M9.95 5.04a2.03 2.03 0 1 1 2.03-2.03v2.03H9.95zm0 1.01a2.03 2.03 0 0 1 0 4.06H4.88a2.03 2.03 0 1 1 0-4.06h5.07z"
            />
            <path
              fill="#2EB67D"
              d="M18.96 9.95a2.03 2.03 0 1 1 2.03 2.03h-2.03V9.95zm-1.01 0a2.03 2.03 0 0 1-4.06 0V4.88a2.03 2.03 0 1 1 4.06 0v5.07z"
            />
            <path
              fill="#ECB22E"
              d="M14.05 18.96a2.03 2.03 0 1 1-2.03 2.03v-2.03h2.03zm0-1.01a2.03 2.03 0 0 1 0-4.06h5.07a2.03 2.03 0 1 1 0 4.06h-5.07z"
            />
          </svg>
        ),
      };

    case "googlecalendar":
    case "googlecalender":
    case "google_calender":
    case "google_calendar":
      return {
        name: "Google Calendar",
        icon: (
          <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="5" fill="#4285F4" />
            <rect x="4" y="6" width="16" height="14" rx="2" fill="#FFFFFF" />
            <rect x="4" y="6" width="16" height="4" fill="#EA4335" />
            <circle cx="8" cy="13" r="1.2" fill="#4285F4" />
            <circle cx="12" cy="13" r="1.2" fill="#34A853" />
            <circle cx="16" cy="13" r="1.2" fill="#FBBC05" />
            <circle cx="8" cy="17" r="1.2" fill="#4285F4" />
            <circle cx="12" cy="17" r="1.2" fill="#EA4335" />
          </svg>
        ),
      };

    case "notion":
      return {
        name: "Notion",
        icon: (
          <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.97c-.466-.373-.98-.606-2.054-.513L2.686 2.67c-.42.046-.513.326-.373.56l2.146.978zm.56 3.638v13.636c0 .7.373 1.072 1.213.98l14.475-.84c.84-.046.933-.56.933-1.12V6.82c0-.56-.233-.84-.793-.793l-15.034.886c-.56.047-.794.327-.794.933zm13.771 1.072c.047.42 0 .84-.42.887l-.746.14v8.863c-.42.233-.84.373-1.26.373-.7 0-1.073-.28-1.54-.933l-5.088-7.93v7.464l1.493.327c.42.093.42.56.046.56l-3.92.233c-.093 0-.327-.373-.233-.606l.98-.233V9.764l-1.353-.14c-.374-.047-.327-.467.047-.467l4.107-.28 5.32 8.164V9.857l-1.26-.14c-.373-.047-.326-.467.047-.467l3.78-.28c.047 0 .093.373.047.933z" />
          </svg>
        ),
      };

    case "whatsapp":
      return {
        name: "WhatsApp",
        icon: (
          <svg className="size-3.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#25D366"
              d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.96.57 3.84 1.65 5.45L2 22l4.82-1.74a9.88 9.88 0 0 0 5.22 1.47h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.64-1.03-5.13-2.9-7A9.85 9.85 0 0 0 12.04 2z"
            />
            <path
              fill="#FFFFFF"
              d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.64-.93-2.25-.25-.6-.5-.52-.68-.53l-.58-.01c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.51s1.07 2.92 1.22 3.12c.15.2 2.11 3.22 5.12 4.51.72.31 1.28.49 1.71.63.72.23 1.37.2 1.88.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z"
            />
          </svg>
        ),
      };

    case "github":
      return {
        name: "GitHub",
        icon: (
          <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        ),
      };

    default: {
      const formattedName = slug
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return {
        name: formattedName,
        icon: <ComposioLogo slug={normalized} alt={formattedName} />,
      };
    }
  }
};
