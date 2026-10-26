import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  DollarSign,
  PlusCircle,
  Settings,
  ShieldAlert,
  Layers,
  Compass,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="h-10 w-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                {user.name}
              </p>
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">
                {user.role}
              </span>
            </div>
          </div>

          <nav className="space-y-1 text-sm font-medium">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-indigo-500" />
              Unified Overview
            </Link>

            <Link
              href="/dashboard/professional"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
            >
              <Briefcase className="h-4 w-4 text-violet-500" />
              Professional View
            </Link>

            <Link
              href="/dashboard/owner"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
            >
              <Layers className="h-4 w-4 text-emerald-500" />
              Product Owner View
            </Link>

            <Link
              href="/dashboard/teams"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
            >
              <Users className="h-4 w-4 text-amber-500" />
              Teams & Workspaces
            </Link>

            <Link
              href="/dashboard/payouts"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
            >
              <DollarSign className="h-4 w-4 text-blue-500" />
              Payouts & Ledger
            </Link>

            <Link
              href="/dashboard/products/new"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors font-semibold"
            >
              <PlusCircle className="h-4 w-4" />
              List New Product
            </Link>

            {user.role === "ADMIN" && (
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 mt-2">
                <Link
                  href="/dashboard/admin"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors font-semibold"
                >
                  <ShieldAlert className="h-4 w-4" />
                  Admin Console
                </Link>
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Dashboard Workspace Content */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
