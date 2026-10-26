import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatCents } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ShieldCheck, Star, Users, Briefcase, ArrowRight } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    skill?: string;
    search?: string;
  }>;
}

export default async function ProfessionalsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const skillFilter = params.skill || "All";
  const searchQuery = params.search || "";

  const users = await db.user.findMany({
    where: {
      profile: {
        isNot: null,
      },
      name: searchQuery ? { contains: searchQuery, mode: "insensitive" } : undefined,
    },
    include: {
      profile: true,
      teamMemberships: {
        include: { team: true },
      },
    },
  });

  const skillsList = ["All", "Growth Strategy", "B2B Outbound", "Content Marketing", "Developer Relations", "SEO"];

  const filteredUsers = users.filter((u) => {
    if (skillFilter === "All") return true;
    return u.profile?.skills.some((s) => s.toLowerCase().includes(skillFilter.toLowerCase()));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Explore Growth Talent
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
          Connect with independent commercial growth specialists, strategists, and outbound closers with attributable track records.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {skillsList.map((skill) => {
            const active = skillFilter === skill;
            return (
              <Link
                key={skill}
                href={skill === "All" ? "/professionals" : `/professionals?skill=${encodeURIComponent(skill)}`}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {skill}
              </Link>
            );
          })}
        </div>

        <form action="/professionals" method="GET" className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Search by name or specialty..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => {
          const profile = user.profile;
          const verifiedSales = profile ? Number(profile.verifiedSalesCents) : 0;
          return (
            <Card key={user.id} className="flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="h-12 w-12 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-base">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Link href={`/professionals/${user.id}`} className="hover:text-indigo-600 transition-colors">
                          {user.name}
                        </Link>
                        {profile?.isVerified && (
                          <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        )}
                      </h3>
                      <p className="text-xs text-zinc-500">{profile?.country || "Global"}</p>
                    </div>
                  </div>
                  {profile && profile.averageRating && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      <Star className="h-3 w-3 fill-amber-500" />
                      <span>{profile.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {profile?.headline || "Growth Specialist"}
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                    {profile?.bio || "Available for high-impact commercial collaborations."}
                  </p>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1">
                  {profile?.skills.slice(0, 3).map((s) => (
                    <span key={s} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              </CardHeader>

              <CardFooter className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-400 block">Verified Sales</span>
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {verifiedSales > 0 ? formatCents(verifiedSales) : "Building"}
                  </span>
                </div>
                <Link href={`/professionals/${user.id}`}>
                  <Button size="sm" variant="default" className="gap-1 text-xs">
                    View Profile
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
