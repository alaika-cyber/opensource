import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, HeartHandshake, FileText, HelpCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
        {/* Brand column */}
        <div className="col-span-2">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
              Open<span className="text-indigo-600 dark:text-indigo-400">Source</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
            Global collaborative commerce platform connecting ambitious product owners with independent cross-functional growth teams.
          </p>
          <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
            Build together. Sell together. Earn together.
          </p>
        </div>

        {/* Marketplace */}
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Marketplace</h4>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              <Link href="/products" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Explore Products
              </Link>
            </li>
            <li>
              <Link href="/professionals" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Explore Professionals
              </Link>
            </li>
            <li>
              <Link href="/teams" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Explore Teams
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Pricing & Monetization
              </Link>
            </li>
          </ul>
        </div>

        {/* Solutions */}
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Solutions</h4>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              <Link href="/for-product-owners" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                For Product Owners
              </Link>
            </li>
            <li>
              <Link href="/for-professionals" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                For Professionals
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                How It Works
              </Link>
            </li>
            <li>
              <Link href="/trust-and-safety" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Trust & Safety
              </Link>
            </li>
          </ul>
        </div>

        {/* Platform & Legal */}
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Company & Legal</h4>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              <Link href="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                About OpenSource
              </Link>
            </li>
            <li>
              <Link href="/help" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Help & FAQ
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Contact & Support
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Cookie Preferences
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500">
        <p>© 2026 OpenSource Platform. All rights reserved.</p>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Verified Sales Attribution
          </span>
          <span className="flex items-center gap-1">
            <HeartHandshake className="h-3.5 w-3.5 text-indigo-500" />
            Transparent Commission Pools
          </span>
        </div>
      </div>
    </footer>
  );
}
