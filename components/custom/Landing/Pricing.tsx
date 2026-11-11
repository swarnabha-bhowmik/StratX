"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight, Zap, HelpCircle } from "lucide-react";

const plans = [
  {
    name: "Starter",
    description: "Ideal for individuals experimenting with autonomous workflows and personal assistants.",
    monthlyPrice: 0,
    annualPrice: 0,
    popular: false,
    cta: "Start Free",
    href: "/sign-up",
    buttonVariant: "outline" as const,
    features: [
      "Up to 3 active AI agents",
      "100 execution credits / month",
      "WhatsApp companion integration",
      "Manual on-demand runs",
      "Gmail & Google Calendar access",
      "Community support",
    ],
    limitations: [
      "No recurring cron schedules",
      "Standard LLM inference queue",
    ],
  },
  {
    name: "Pro",
    description: "For professionals and power users requiring 24/7 autonomous agents and web browsing.",
    monthlyPrice: 19,
    annualPrice: 15,
    popular: true,
    badge: "Most Popular",
    cta: "Upgrade to Pro",
    href: "/sign-up",
    buttonVariant: "default" as const,
    features: [
      "Unlimited active AI agents",
      "2,500 execution credits / month",
      "Autonomous 24/7 Inngest crons",
      "Browserbase headless cloud browser",
      "Instant WhatsApp & Email briefings",
      "Fast Groq & Gemini 2.0 reasoning",
      "Full execution traces & step telemetry",
      "Priority email support",
    ],
    limitations: [],
  },
  {
    name: "Team & Enterprise",
    description: "For teams, agencies, and high-volume workloads demanding dedicated capacity and SLA.",
    monthlyPrice: 49,
    annualPrice: 39,
    popular: false,
    cta: "Get Enterprise",
    href: "/sign-up",
    buttonVariant: "outline" as const,
    features: [
      "Everything in Pro",
      "10,000+ execution credits / month",
      "Dedicated background worker concurrency",
      "Custom tool API webhooks & integrations",
      "Team workspace & shared agent library",
      "Advanced audit logs & compliance",
      "Dedicated Slack channel & 99.9% uptime SLA",
    ],
    limitations: [],
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Simple, Transparent Pricing
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Predictable plans for every stage of automation.
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Start completely free with zero credit card required. Scale up whenever your agents need more compute and round-the-clock schedules.
          </p>

          {/* Billing Toggle */}
          <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 p-1.5 shadow-inner">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                !annual
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                annual
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Annual billing</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                annual ? "bg-blue-700 text-blue-100" : "bg-emerald-100 text-emerald-700"
              }`}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3 items-stretch">
          {plans.map((plan) => {
            const price = annual ? plan.annualPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.name}
                className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all ${
                  plan.popular
                    ? "border-2 border-blue-600 bg-gradient-to-b from-blue-50/40 via-white to-white shadow-xl lg:-translate-y-2"
                    : "border border-slate-200/90 bg-white shadow-sm hover:border-slate-300"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 rounded-full bg-blue-600 px-3.5 py-1 text-xs font-bold text-white shadow-md">
                      <Sparkles className="size-3" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  </div>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                      ${price}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {price === 0 ? "forever" : "/ month"}
                    </span>
                  </div>
                  {annual && price > 0 && (
                    <p className="mt-1 text-[11px] text-emerald-600 font-medium">
                      Billed annually (${price * 12}/yr)
                    </p>
                  )}

                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
                      What&apos;s included
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <Check className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6">
                  <Link
                    href={plan.href}
                    className={`flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-semibold transition-all ${
                      plan.popular
                        ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                        : "border border-slate-300 text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {plan.cta} <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-14 rounded-2xl border border-slate-200 bg-slate-50/70 p-6 text-center max-w-2xl mx-auto">
          <p className="text-xs text-slate-600 flex items-center justify-center gap-2">
            <Zap className="size-4 text-amber-500" />
            <span>Need custom execution volume or dedicated enterprise compliance?</span>
            <Link href="mailto:support@stratx.ai" className="font-semibold text-blue-600 hover:underline">
              Contact Sales &rarr;
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
