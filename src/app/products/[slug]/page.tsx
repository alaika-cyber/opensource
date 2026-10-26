import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatCents, formatBps } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Users,
  Briefcase,
  Layers,
  ArrowRight,
  FolderKanban,
  Target,
  Calendar,
  Sparkles,
  Award,
  Lock,
} from "lucide-react";
import { ProjectOpportunityClient } from "./project-opportunity-client";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export default async function ProjectOpportunityPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const project = await db.product.findUnique({
    where: { slug },
    include: {
      owner: {
        include: {
          profile: true,
        },
      },
      opportunities: {
        where: { isOpen: true },
      },
      projectMembers: {
        include: {
          user: {
            include: { profile: true },
          },
        },
      },
      milestones: {
        orderBy: { dueDate: "asc" },
      },
      goals: {
        orderBy: { createdAt: "desc" },
      },
      agreements: {
        where: { status: "ACTIVE" },
        include: {
          team: {
            include: {
              members: {
                include: { user: true },
              },
            },
          },
        },
      },
      bookmarks: user ? { where: { userId: user.id } } : false,
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { author: true },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const isOwner = user?.id === project.ownerId;
  const isMember = project.projectMembers.some((m) => m.userId === user?.id);
  const isBookmarked = (project.bookmarks?.length ?? 0) > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
        <Link href="/products" className="hover:text-indigo-600 transition-colors">
          Projects & Opportunities
        </Link>
        <span>/</span>
        <span className="text-zinc-700 dark:text-zinc-300 font-medium">{project.category}</span>
        <span>/</span>
        <span className="truncate max-w-[200px]">{project.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Project Overview, Goals, Team & Opportunities */}
        <div className="lg:col-span-8 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="secondary">{project.category}</Badge>
              <Badge variant="default" className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200">
                Stage: {project.businessStage || "MVP"}
              </Badge>
              {project.isVerified && (
                <Badge variant="success" className="gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Venture
                </Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {project.name}
            </h1>
            <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {project.shortDesc}
            </p>
          </div>

          {/* Media / Image Display */}
          {project.images && project.images.length > 0 && (
            <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 aspect-video relative">
              <img
                src={project.images[0]}
                alt={project.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Value Proposition & Detailed Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-500" />
              Value Proposition & Overview
            </h2>
            <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {/* Target Customers & External Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {project.targetAudience && (
              <Card className="p-4 space-y-1">
                <span className="text-xs text-zinc-400 font-semibold block">Target Customers</span>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {project.targetAudience}
                </p>
              </Card>
            )}

            {project.websiteUrl && (
              <Card className="p-4 space-y-1">
                <span className="text-xs text-zinc-400 font-semibold block">Official Website</span>
                <a
                  href={project.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
                >
                  Visit External Link
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Card>
            )}
          </div>

          {/* Open Positions & Recruitment Roles */}
          <div id="apply" className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-500" />
                Open Team Positions & Collaboration Opportunities
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                The founder is recruiting specialized professionals across these roles:
              </p>
            </div>

            {project.openPositions && project.openPositions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.openPositions.map((pos) => (
                  <Card key={pos} className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{pos}</h4>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Open for Applications
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </Card>
                ))}
              </div>
            ) : project.opportunities.length > 0 ? (
              <div className="space-y-3">
                {project.opportunities.map((opp) => (
                  <Card key={opp.id} className="p-5 space-y-2">
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{opp.title}</h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">{opp.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {opp.rolesNeeded.map((role) => (
                        <span
                          key={role}
                          className="text-[11px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full font-medium"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center text-xs text-zinc-500">
                General contributor applications are welcome. Pitch your proposed role directly to the founder.
              </Card>
            )}
          </div>

          {/* Project Milestones Roadmap */}
          {project.milestones.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-500" />
                Execution Milestones & Roadmap
              </h2>
              <div className="space-y-3">
                {project.milestones.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{m.title}</h4>
                      {m.description && <p className="text-zinc-500 mt-0.5">{m.description}</p>}
                      {m.dueDate && (
                        <span className="text-[11px] text-zinc-400 mt-1 block">
                          Target: {new Date(m.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <Badge variant={m.status === "COMPLETED" ? "success" : "secondary"}>
                      {m.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Team Members */}
          <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              Project Team ({project.projectMembers.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.projectMembers.map((member) => (
                <Card key={member.id} className="p-4 flex items-center gap-3">
                  {member.user.avatarUrl ? (
                    <img
                      src={member.user.avatarUrl}
                      alt={member.user.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      {member.user.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {member.user.name}
                    </h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      {member.role}
                    </p>
                    <span className="text-[10px] text-zinc-400 block">{member.department}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Verified Collaboration Reviews */}
          {project.reviews.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Verified Team Feedback
              </h2>
              <div className="space-y-3">
                {project.reviews.map((r) => (
                  <Card key={r.id} className="p-4 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{r.title}</span>
                      <Badge variant="success" className="text-[10px]">Verified Collaboration</Badge>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400">{r.comment}</p>
                    <span className="text-[10px] text-zinc-400 block">— {r.author.name}</span>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Project Opportunity Actions & Founder Card */}
        <div className="lg:col-span-4 space-y-6">
          <ProjectOpportunityClient
            projectId={project.id}
            projectSlug={project.slug}
            projectName={project.name}
            openPositions={project.openPositions}
            requiredSkills={project.requiredSkills}
            compensationModels={project.compensationModels}
            isOwner={isOwner}
            isMember={isMember}
            isLoggedIn={!!user}
            initialBookmarked={isBookmarked}
            ownerId={project.ownerId}
          />

          {/* Project Founder Card */}
          <Card className="p-5 space-y-3">
            <span className="text-xs text-zinc-400 font-semibold block">Project Founder</span>
            <div className="flex items-center gap-3">
              {project.owner.avatarUrl ? (
                <img
                  src={project.owner.avatarUrl}
                  alt={project.owner.name}
                  className="h-12 w-12 rounded-xl object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-base">
                  {project.owner.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  {project.owner.name}
                </p>
                <p className="text-xs text-zinc-500 line-clamp-1">
                  {project.owner.profile?.headline || "Venture Founder"}
                </p>
              </div>
            </div>

            <Link href={`/professionals/${project.owner.id}`} className="block w-full">
              <Button variant="outline" size="sm" className="w-full text-xs">
                View Founder Profile
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
