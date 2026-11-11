"use client";

import { useState, useEffect, useCallback, useContext } from "react";
import Link from "next/link";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { UserDetailContext } from "@/context/UserDetailContext";
import { PaddleCheckoutButton } from "@/components/custom/PaddleCheckoutButton";
import {
  CreditCard,
  Zap,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  RotateCw,
  ExternalLink,
  Bot,
  HelpCircle,
  FileText,
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Layers,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";

interface UserProfileData {
  id: number;
  name: string;
  email: string;
  agentCredits: number;
  usageCredits: number;
  subscriptionStatus: string;
  subscriptionPlan: string | null;
  paddleCustomerId: string | null;
  paddleSubscriptionId: string | null;
}

export default function BillingPage() {
  const { user } = useUser();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);

  const [dbUser, setDbUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [selectedTopUp, setSelectedTopUp] = useState<string | null>(null);

  // Price IDs from env or defaults
  const PRO_PRICE_ID =
    process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID || "pri_01_pro_tier";
  const ENTERPRISE_PRICE_ID =
    process.env.NEXT_PUBLIC_PADDLE_ENTERPRISE_PRICE_ID || "pri_01_enterprise_tier";

  const fetchUserData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await axios.get("/api/users");
      if (res.data) {
        setDbUser(res.data);
        if (setUserDetail) {
          setUserDetail(res.data);
        }
      }
    } catch (err) {
      console.warn("Could not fetch user billing data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setUserDetail]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const userEmail = user?.primaryEmailAddress?.emailAddress || dbUser?.email || "";
  const currentPlan = (dbUser?.subscriptionPlan || dbUser?.subscriptionStatus || "free").toLowerCase();
  const isPro = currentPlan.includes("pro");
  const isEnterprise = currentPlan.includes("enterprise") || currentPlan.includes("team");

  // Credit calculation
  const totalAgentLimit = isEnterprise ? 999 : isPro ? 50 : 3;
  const currentAgentsCount = dbUser?.agentCredits ?? 1;
  const remainingCredits = dbUser?.usageCredits ?? 100;
  const maxUsageLimit = isEnterprise ? 10000 : isPro ? 2500 : 100;
  const usagePercentage = Math.min(100, Math.round((remainingCredits / maxUsageLimit) * 100));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Billing & Subscriptions
            </h1>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-900 border-none">
              Paddle Merchant of Record
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Manage your subscription tier, track real-time agent execution credits, and view payment receipts.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchUserData(true)}
          disabled={refreshing}
          className="gap-2 cursor-pointer self-start sm:self-auto"
        >
          <RotateCw className={`size-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
          <span>{refreshing ? "Refreshing..." : "Refresh Usage"}</span>
        </Button>
      </div>

      {/* Credit & Plan Summary Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xs lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Current Tier Badge & Info */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Tier
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold ${
                  isEnterprise
                    ? "bg-purple-100 text-purple-800"
                    : isPro
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                <Sparkles className="size-3" />
                <span>
                  {isEnterprise
                    ? "Team & Enterprise"
                    : isPro
                    ? "StratX Pro Plan"
                    : "Free Starter Plan"}
                </span>
              </span>
            </div>

            <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
              {isPro
                ? "Unlimited 24/7 Autonomous Agent Workflows"
                : isEnterprise
                ? "Enterprise Scale with Custom Webhook Concurrency"
                : "Basic AI Agent Orchestration"}
            </h2>
            <p className="mt-1 text-xs text-slate-500 max-w-lg">
              {isPro || isEnterprise
                ? "Your subscription auto-renews via Paddle. Access Browserbase cloud browsing, Inngest recurring crons, and WhatsApp briefings."
                : "Upgrade to Pro to unlock unlimited active agents, 24/7 background crons, and headless cloud browser tooling."}
            </p>
          </div>

          {/* Quick CTA */}
          <div className="flex flex-wrap items-center gap-3">
            {!isPro && !isEnterprise ? (
              <a href="#plans">
                <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm gap-2 cursor-pointer">
                  <Zap className="size-4" />
                  <span>Upgrade to Pro</span>
                </Button>
              </a>
            ) : (
              <a
                href="https://vendors.paddle.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex"
              >
                <Button variant="outline" className="gap-2 cursor-pointer">
                  <span>Manage via Paddle Portal</span>
                  <ExternalLink className="size-3.5 text-slate-500" />
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Real-time Usage Meters */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 pt-6 border-t border-slate-100">
          {/* Meter 1: Agent Capacity */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Bot className="size-4 text-blue-600" />
                <span>Active Agent Slots</span>
              </span>
              <span className="text-slate-900">
                {isPro || isEnterprise ? "Unlimited" : `${currentAgentsCount} / ${totalAgentLimit}`}
              </span>
            </div>
            <div className="mt-3">
              <Progress value={isPro || isEnterprise ? 100 : (currentAgentsCount / totalAgentLimit) * 100} />
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              {isPro || isEnterprise
                ? "You have unlimited agent capacity."
                : `${totalAgentLimit - currentAgentsCount} slot(s) remaining on Free Starter tier.`}
            </p>
          </div>

          {/* Meter 2: Execution Credits */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Zap className="size-4 text-amber-500" />
                <span>Execution Credits Remaining</span>
              </span>
              <span className="text-slate-900 font-mono">
                {remainingCredits} / {maxUsageLimit}
              </span>
            </div>
            <div className="mt-3">
              <Progress value={usagePercentage} />
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              1 credit per tool invocation (browser scraping, WhatsApp message, email dispatch).
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Plans Section */}
      <div id="plans" className="mt-4 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Subscription Plans</h2>
            <p className="text-xs text-slate-500">
              Choose the capacity that matches your automation workflow needs.
            </p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-auto rounded-xl border border-slate-200 bg-slate-100/80 p-1 text-xs">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === "annual"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Annual Billing</span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Tier 1: Free Starter */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Starter</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                  Free Forever
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Ideal for individuals experimenting with autonomous personal assistants.
              </p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">$0</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>

              <div className="mt-6 flex flex-col gap-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>Up to 3 active AI agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>100 execution credits / month</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>WhatsApp companion integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>Manual on-demand runs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>Gmail & Google Calendar access</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              {!isPro && !isEnterprise ? (
                <Button variant="outline" disabled className="w-full text-xs">
                  Current Plan
                </Button>
              ) : (
                <Button variant="outline" disabled className="w-full text-xs">
                  Included
                </Button>
              )}
            </div>
          </div>

          {/* Tier 2: Pro (Highlighted) */}
          <div className="relative flex flex-col justify-between rounded-3xl border-2 border-blue-600 bg-white p-6 shadow-md shadow-blue-500/10">
            {/* Most popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-0.5 text-[11px] font-bold text-white shadow-xs">
                <Sparkles className="size-3" />
                <span>Most Popular</span>
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Pro</h3>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                  Recommended
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                For power users requiring 24/7 autonomous agents and web browsing.
              </p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">
                  ${billingCycle === "annual" ? "15" : "19"}
                </span>
                <span className="text-xs text-slate-500">
                  / month {billingCycle === "annual" ? "(billed annually)" : ""}
                </span>
              </div>

              <div className="mt-6 flex flex-col gap-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-blue-600 shrink-0" />
                  <span className="font-semibold text-slate-900">Unlimited active AI agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-blue-600 shrink-0" />
                  <span className="font-semibold text-slate-900">2,500 execution credits / mo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-blue-600 shrink-0" />
                  <span>Autonomous 24/7 Inngest crons</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-blue-600 shrink-0" />
                  <span>Browserbase headless cloud browser</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-blue-600 shrink-0" />
                  <span>Instant WhatsApp & Email briefings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-blue-600 shrink-0" />
                  <span>Priority execution queue</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              {isPro ? (
                <Button variant="outline" disabled className="w-full text-xs">
                  Active Subscription
                </Button>
              ) : (
                <PaddleCheckoutButton
                  priceId={PRO_PRICE_ID}
                  customerEmail={userEmail}
                  className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98] cursor-pointer"
                >
                  Upgrade to Pro ($19/mo)
                </PaddleCheckoutButton>
              )}
            </div>
          </div>

          {/* Tier 3: Team & Enterprise */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Team & Enterprise</h3>
                <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700">
                  Scale
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                For agencies and teams demanding dedicated capacity and custom webhooks.
              </p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">
                  ${billingCycle === "annual" ? "39" : "49"}
                </span>
                <span className="text-xs text-slate-500">
                  / month {billingCycle === "annual" ? "(billed annually)" : ""}
                </span>
              </div>

              <div className="mt-6 flex flex-col gap-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span className="font-semibold text-slate-900">10,000 execution credits / mo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>Unlimited active AI agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>Inbound Webhook Triggers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>Multi-tool parallel execution</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>Dedicated Slack & priority SLA</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              {isEnterprise ? (
                <Button variant="outline" disabled className="w-full text-xs">
                  Active Subscription
                </Button>
              ) : (
                <PaddleCheckoutButton
                  priceId={ENTERPRISE_PRICE_ID}
                  customerEmail={userEmail}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-800 shadow-2xs transition-all hover:bg-slate-50 active:scale-[0.98] cursor-pointer"
                >
                  Get Enterprise ($49/mo)
                </PaddleCheckoutButton>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Credit Top-Up Packs */}
      <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">One-Time Credit Top-Ups</h2>
            <p className="text-xs text-slate-500">
              Need extra capacity for a heavy web scraping batch or email campaign? Top-up instantly without changing plans.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Credits never expire
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Top-up 1 */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-all hover:border-slate-300">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Micro Pack</span>
                <span className="text-sm font-extrabold text-blue-600">$5</span>
              </div>
              <p className="mt-1 text-2xl font-black text-slate-900">+500</p>
              <p className="text-[11px] text-slate-500">Execution credits</p>
            </div>
            <PaddleCheckoutButton
              priceId="pri_topup_500"
              customerEmail={userEmail}
              className="mt-4 w-full rounded-xl bg-white border border-slate-200 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
            >
              Add +500 Credits
            </PaddleCheckoutButton>
          </div>

          {/* Top-up 2 */}
          <div className="flex flex-col justify-between rounded-2xl border border-blue-200 bg-blue-50/40 p-4 transition-all hover:border-blue-300">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Power Pack</span>
                <span className="text-sm font-extrabold text-blue-600">$15</span>
              </div>
              <p className="mt-1 text-2xl font-black text-slate-900">+2,000</p>
              <p className="text-[11px] text-slate-500">Execution credits</p>
            </div>
            <PaddleCheckoutButton
              priceId="pri_topup_2000"
              customerEmail={userEmail}
              className="mt-4 w-full rounded-xl bg-blue-600 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 cursor-pointer"
            >
              Add +2,000 Credits
            </PaddleCheckoutButton>
          </div>

          {/* Top-up 3 */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-all hover:border-slate-300">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Hyper Pack</span>
                <span className="text-sm font-extrabold text-blue-600">$30</span>
              </div>
              <p className="mt-1 text-2xl font-black text-slate-900">+5,000</p>
              <p className="text-[11px] text-slate-500">Execution credits</p>
            </div>
            <PaddleCheckoutButton
              priceId="pri_topup_5000"
              customerEmail={userEmail}
              className="mt-4 w-full rounded-xl bg-white border border-slate-200 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
            >
              Add +5,000 Credits
            </PaddleCheckoutButton>
          </div>
        </div>
      </div>

      {/* Payment History & Merchant of Record Trust Guarantee */}
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Invoice History */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-slate-600" />
              <h2 className="text-sm font-bold text-slate-900">Billing History</h2>
            </div>
            <span className="text-xs text-slate-500">Automatic PDF receipts</span>
          </div>

          <div className="mt-4 divide-y divide-slate-100 text-xs">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold text-slate-900">
                  {isEnterprise ? "Team Plan Subscription" : isPro ? "Pro Plan Subscription" : "Starter Free Plan"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} • Invoice #{dbUser?.id ? `INV-${dbUser.id}-001` : "INV-FREE"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">
                  {isEnterprise ? "$49.00" : isPro ? "$19.00" : "$0.00"}
                </span>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px]">
                  Paid
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Merchant of Record Guarantee */}
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6 shadow-xs">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 mb-3">
            <ShieldCheck className="size-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">
            Paddle Merchant of Record
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            All transactions are processed by Paddle.com. Local sales tax, GST, VAT, and currency conversions are handled automatically and securely.
          </p>
          <div className="mt-4 flex flex-col gap-1.5 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3 text-emerald-500" />
              <span>256-bit encrypted checkout</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3 text-emerald-500" />
              <span>Cancel or pause in 1-click</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3 text-emerald-500" />
              <span>Worldwide payment methods</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
