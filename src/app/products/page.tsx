import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatCents, formatBps } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Tag,
  Users,
  Briefcase,
  Layers,
  Sparkles,
  TrendingUp,
  FolderKanban,
  Building,
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    stage?: string;
    compensation?: string;
    search?: string;
  }>;
}

export default async function ProjectsExplorePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categoryFilter = params.category || "All";
  const stageFilter = params.stage || "All";
  const compensationFilter = params.compensation || "All";
  const searchQuery = params.search || "";

  const where: Record<string, unknown> = {
    status: "ACTIVE",
    visibility: "PUBLIC",
  };

  if (categoryFilter !== "All") {
    where.category = categoryFilter;
  }

  if (stageFilter !== "All") {
    where.businessStage = stageFilter;
  }

  if (compensationFilter !== "All") {
    where.compensationModels = { has: compensationFilter };
  }

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { shortDesc: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
      { category: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const projects = await db.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          profile: true,
        },
      },
      opportunities: {
        where: { isOpen: true },
      },
      projectMembers: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      tasks: {
        select: { id: true, status: true },
      },
      milestones: {
        select: { id: true, status: true },
      },
    },
  });

  const categories = [
    "All",
    "Developer Tools",
    "AI Tools",
    "SaaS & Software",
    "Consumer Goods & Hardware",
    "B2B Services",
    "Digital Products",
  ];

  const stages = ["All", "Idea", "Prototype", "MVP", "Early Traction", "Scaling", "Established"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Business Project & Opportunity Marketplace
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Discover Business Projects & Ventures
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
            Connect with founders and product owners. Join multidisciplinary execution teams, contribute your skills, and earn via commissions, milestone agreements, and revenue sharing.
          </p>
        </div>

        <Link href="/dashboard/products/new">
          <Button variant="glow" size="default" className="shrink-0 gap-2">
            <FolderKanban className="h-4 w-4" />
            Publish a Project
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4 mb-8">
        {/* Category Pills & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const active = categoryFilter === cat;
              return (
                <Link
                  key={cat}
                  href={`/products?category=${encodeURIComponent(cat)}${
                    stageFilter !== "All" ? `&stage=${encodeURIComponent(stageFilter)}` : ""
                  }${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    active
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>

          <form action="/products" method="GET" className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Search projects, skills, goals..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {categoryFilter !== "All" && <input type="hidden" name="category" value={categoryFilter} />}
            {stageFilter !== "All" && <input type="hidden" name="stage" value={stageFilter} />}
          </form>
        </div>

        {/* Stage Filter Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-semibold text-zinc-500 whitespace-nowrap">Business Stage:</span>
          {stages.map((st) => {
            const active = stageFilter === st;
            return (
              <Link
                key={st}
                href={`/products?stage=${encodeURIComponent(st)}${
                  categoryFilter !== "All" ? `&category=${encodeURIComponent(categoryFilter)}` : ""
                }${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                  active
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold"
                    : "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
                }`}
              >
                {st}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
          <FolderKanban className="h-10 w-10 text-zinc-400 mx-auto" />
          <p className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
            No business projects match your criteria
          </p>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, stage, or category filter to discover more ventures.
          </p>
          <Link href="/products" className="inline-block mt-2">
            <Button variant="outline" size="sm">
              Clear All Filters
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 shadow-xs"
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {project.category}
                  </Badge>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                    {project.businessStage || "MVP"}
                  </span>
                </div>

                <div>
                  <CardTitle className="text-lg">
                    <Link
                      href={`/products/${project.slug}`}
                      className="hover:text-indigo-600 transition-colors"
                    >
                      {project.name}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-1 leading-relaxed">
                    {project.shortDesc}
                  </CardDescription>
                </div>

                {/* Open Positions / Roles Needed */}
                {project.openPositions && project.openPositions.length > 0 ? (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                      Recruiting Roles:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {project.openPositions.slice(0, 3).map((role) => (
                        <span
                          key={role}
                          className="text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 px-2 py-0.5 rounded-md font-medium"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                      Required Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {project.requiredSkills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardHeader>

              <CardContent className="py-2 text-xs text-zinc-500 space-y-2">
                {/* Compensation model indicators */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-zinc-400">Compensation:</span>
                  {project.compensationModels.map((cm) => (
                    <span
                      key={cm}
                      className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-[10px]"
                    >
                      {cm.replace(/_/g, " ")}
                    </span>
                  ))}
                  {project.commissionRateBps > 0 && (
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[10px]">
                      ({formatBps(project.commissionRateBps)} Pool)
                    </span>
                  )}
                </div>

                {/* Team & Founder info */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
                      {project.owner.name.charAt(0)}
                    </div>
                    <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]">
                      {project.owner.name}
                    </span>
                  </div>

                  <span className="text-zinc-400 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {project.projectMembers.length} team members
                  </span>
                </div>
              </CardContent>

              <CardFooter className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <Link href={`/products/${project.slug}`}>
                  <Button size="sm" variant="outline" className="text-xs">
                    View Opportunity
                  </Button>
                </Link>

                <Link href={`/products/${project.slug}#apply`}>
                  <Button size="sm" variant="default" className="gap-1 text-xs">
                    Apply to Join
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
