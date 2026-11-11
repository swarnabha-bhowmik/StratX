import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardHero } from "@/components/custom/Dashboard/dashboard-hero";
import { AiBriefing } from "@/components/custom/Dashboard/ai-briefing";
import {
  NeedsAttention,
  RunningNow,
} from "@/components/custom/Dashboard/attention-running";
import { getDashboardData } from "@/lib/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

async function DashboardContent({ userEmail, userName }: { userEmail: string; userName: string }) {
  const data = await getDashboardData(userEmail);

  return (
    <>
      <DashboardHero
        userName={userName}
        stats={data.stats}
      />

      <AiBriefing stats={data.stats} />

      <div className="grid gap-6 md:grid-cols-[1.6fr_1fr]">
        <NeedsAttention runs={data.attention} />
        <RunningNow runs={data.running} />
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl border bg-gradient-to-br from-sky-50 via-white to-violet-50 p-6 shadow-sm dark:from-sky-950/20 dark:via-background dark:to-violet-950/20">
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-4 w-80 mb-6" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
      <Skeleton className="h-28 rounded-2xl w-full" />
      <div className="grid gap-6 md:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userEmail = user.primaryEmailAddress?.emailAddress || "";
  const userName =
    user.firstName ||
    user.fullName ||
    user.username ||
    (userEmail ? userEmail.split("@")[0] : "there");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent userEmail={userEmail} userName={userName} />
      </Suspense>
    </div>
  );
}
