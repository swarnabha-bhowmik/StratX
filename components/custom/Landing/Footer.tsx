import Link from "next/link";
import Image from "next/image";
import { Bot, Github, Twitter, Linkedin, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block">
              <Image
                src="/brand-logo.png"
                alt="StratX Logo"
                width={150}
                height={45}
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-slate-500">
              The autonomous multi-tool agent platform. Orchestrate web browsing, WhatsApp notifications, calendar events, and email workflows seamlessly from natural language.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-[11px] font-medium text-emerald-700">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                <span>All systems operational</span>
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Product</h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="#features" className="hover:text-slate-900 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#integrations" className="hover:text-slate-900 transition-colors">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-slate-900 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#templates" className="hover:text-slate-900 transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-slate-900 transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Integrations</h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="#integrations" className="hover:text-slate-900 transition-colors">
                  WhatsApp Companion
                </Link>
              </li>
              <li>
                <Link href="#integrations" className="hover:text-slate-900 transition-colors">
                  Browserbase Headless
                </Link>
              </li>
              <li>
                <Link href="#integrations" className="hover:text-slate-900 transition-colors">
                  Gmail & Calendar
                </Link>
              </li>
              <li>
                <Link href="#integrations" className="hover:text-slate-900 transition-colors">
                  Inngest Durable Workflows
                </Link>
              </li>
              <li>
                <Link href="#integrations" className="hover:text-slate-900 transition-colors">
                  Groq & Gemini 2.0
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Account</h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="/sign-in" className="hover:text-slate-900 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="hover:text-slate-900 transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
                  Agent Dashboard
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="hover:text-slate-900 transition-colors">
                  Security & Auth
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200/80 pt-8 text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} StratX Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#pricing" className="hover:text-slate-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#pricing" className="hover:text-slate-900 transition-colors">
              Terms of Service
            </Link>
            <Link href="#faq" className="hover:text-slate-900 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
