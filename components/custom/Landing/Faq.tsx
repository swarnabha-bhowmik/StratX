"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, MessageSquare } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "What is StratX and how is it different from standard AI chatbots?",
    answer:
      "Unlike traditional chatbots that only generate conversational text replies, StratX builds autonomous multi-tool agents that take real-world actions. An agent can browse dynamic websites via headless Chromium, extract key data, sync with your Google Calendar, check your email, and proactively dispatch briefings to your WhatsApp—running in the background without needing manual prompting.",
  },
  {
    question: "Do I need programming knowledge to create and schedule agents?",
    answer:
      "No coding required. StratX features an intuitive Prompt-to-Agent interface. Simply describe what you want the agent to accomplish in plain English. StratX identifies the necessary tools, formulates step-by-step instructions, and configures the execution schedule. Advanced users can also fine-tune parameters, cron expressions, and output schemas.",
  },
  {
    question: "How does the WhatsApp Companion integration work?",
    answer:
      "You connect your WhatsApp number in seconds by scanning an encrypted QR code from your dashboard. Once paired, your agents can send you real-time executive summaries, research briefs, calendar alerts, and critical notifications straight to your personal WhatsApp inbox.",
  },
  {
    question: "Does my computer need to stay powered on for scheduled agents to run?",
    answer:
      "No! All agent schedules and background triggers are orchestrated through resilient Inngest cloud infrastructure. Whether you schedule an agent to run every weekday at 7:30 AM or every hour, it executes autonomously in the cloud and notifies you when complete.",
  },
  {
    question: "How does the web browsing tool handle complex or dynamic sites?",
    answer:
      "StratX integrates directly with Browserbase, a cloud-hosted headless Chromium browser sandbox. This allows agents to navigate Single Page Applications (SPAs), wait for dynamic JavaScript rendering, interact with UI buttons and inputs, and extract structured data securely.",
  },
  {
    question: "Can I try StratX for free?",
    answer:
      "Yes! Our Starter plan is 100% free forever with no credit card required. You receive up to 3 active agents and 100 execution credits each month to automate your daily routines.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 lg:py-28 bg-slate-50/70 border-t border-slate-200/70">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Frequently Asked Questions
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Everything you need to know about StratX.
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Have questions about how autonomous agents, background execution, or integrations work? We have answers.
          </p>
        </div>

        {/* FAQ Accordion list */}
        <div className="mt-14 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-slate-50/50"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-bold text-slate-900 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`size-5 shrink-0 text-slate-500 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm leading-relaxed text-slate-600 border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Callout */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-500">
            Still have questions?{" "}
            <Link
              href="mailto:support@stratx.ai"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Reach out to our support team
            </Link>{" "}
            and we will get back to you within 24 hours.
          </p>
        </div>
      </div>
    </section>
  );
}
