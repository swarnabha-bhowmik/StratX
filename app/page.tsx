import { auth } from "@clerk/nextjs/server";
import { Navbar } from "@/components/custom/Landing/Navbar";
import { Hero } from "@/components/custom/Landing/Hero";
import { Integrations } from "@/components/custom/Landing/Integrations";
import { Features } from "@/components/custom/Landing/Features";
import { HowItWorks } from "@/components/custom/Landing/HowItWorks";
import { Templates } from "@/components/custom/Landing/Templates";
import { Pricing } from "@/components/custom/Landing/Pricing";
import { Faq } from "@/components/custom/Landing/Faq";
import { Footer } from "@/components/custom/Landing/Footer";

export const metadata = {
  title: "StratX — Autonomous Multi-Tool AI Agent Platform",
  description:
    "Build, schedule, and orchestrate autonomous AI agents that browse the web, organize your calendar, manage emails, and send real-time briefings to WhatsApp.",
};

export default async function HomePage() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar isSignedIn={isSignedIn} />
      <main>
        <Hero isSignedIn={isSignedIn} />
        <Integrations />
        <Features />
        <HowItWorks />
        <Templates />
        <Pricing />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
