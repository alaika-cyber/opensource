import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatCents } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InviteToProjectModal } from "@/components/projects/invite-to-project-modal";
import {
  ShieldCheck,
  Star,
  Globe,
  Clock,
  Briefcase,
  Users,
  CheckCircle2,
  Mail,
  Award,
  Layers,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfessionalProfilePage({ params }: PageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  const user = await db.user.findUnique({
    where: { id },
    include: {
      profile: true,
      teamsLed: true,
      teamMemberships: {
        include: {
          team: true,
        },
      },
      reviewsReceived: {
        include: {
          author: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Fetch project contributions
  const projectContributions = await db.projectMember.findMany({
    where: { userId: user.id },
    include: {
      project: true,
    },
    orderBy: { joinedAt: "desc" },
  });

  // If viewing user is logged in, fetch their owned projects for the invite modal
  const ownedProjects = currentUser
    ? await db.product.findMany({
        where: { ownerId: currentUser.id, status: "ACTIVE" },
        select: { id: true, name: true, slug: true },
      })
    : [];

  const profile = user.profile;
  const verifiedSales = profile ? Number(profile.verifiedSalesCents) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-5">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-20 w-20 rounded-2xl object-cover border-2 border-indigo-600/30"
            />
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl">
              {user.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                {user.name}
              </h1>
              {profile?.isVerified && (
                <Badge variant="success" className="gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Professional
                </Badge>
              )}
            </div>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
              {profile?.headline || "Independent Growth Specialist"}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 mt-2">
              {profile?.country && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  {profile.country}
                </span>
              )}
              {profile?.timezone && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {profile.timezone}
                </span>
              )}
              {profile?.availability && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {profile.availability}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser && currentUser.id !== user.id && (
            <InviteToProjectModal
              professional={{
                id: user.id,
                name: user.name,
                avatarUrl: user.avatarUrl,
              }}
              ownedProjects={ownedProjects}
            />
          )}
          <Link href="/teams">
            <Button variant="outline" size="sm">Invite to Syndicate</Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <span className="text-xs text-zinc-400 block">Verified Sales</span>
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">
            {verifiedSales > 0 ? formatCents(verifiedSales) : "$0.00"}
          </span>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">Attributed by platform</span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <span className="text-xs text-zinc-400 block">Collaborations</span>
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">
            {profile?.collaborationsCount || 0}
          </span>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">Completed campaigns</span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <span className="text-xs text-zinc-400 block">Client Rating</span>
          <div className="flex items-center gap-1 text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span>{profile?.averageRating ? profile.averageRating.toFixed(1) : "5.0"}</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">From verified reviews</span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <span className="text-xs text-zinc-400 block">Active Teams</span>
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">
            {user.teamMemberships.length}
          </span>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">Syndicates & collectives</span>
        </div>
      </div>

      {/* Main Grid: Bio, Skills & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* About */}
          <Card className="p-6 space-y-3">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">About</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
              {profile?.bio || "No professional biography provided."}
            </p>
          </Card>

          {/* Active Business Projects */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-500" />
                Active Project Workspaces & Roles
              </h3>
              <Badge variant="secondary" className="text-xs">
                {projectContributions.length} Projects
              </Badge>
            </div>
            {projectContributions.length === 0 ? (
              <p className="text-sm text-zinc-500">Currently exploring new project opportunities.</p>
            ) : (
              <div className="space-y-3">
                {projectContributions.map((contribution) => (
                  <div
                    key={contribution.id}
                    className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <Link
                        href={`/products/${contribution.project.slug}`}
                        className="font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 transition-colors"
                      >
                        {contribution.project.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px]">
                          {contribution.department}
                        </Badge>
                        <span className="text-xs text-zinc-500">
                          Role: <strong>{contribution.role}</strong>
                        </span>
                      </div>
                    </div>
                    <Link href={`/products/${contribution.project.slug}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        View Project
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Active Teams */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Commercial Teams & Syndicates
            </h3>
            {user.teamMemberships.length === 0 ? (
              <p className="text-sm text-zinc-500">Currently operating independently.</p>
            ) : (
              <div className="space-y-3">
                {user.teamMemberships.map((membership) => (
                  <div
                    key={membership.id}
                    className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                        {membership.team.name}
                      </p>
                      <p className="text-xs text-zinc-500">Role: {membership.role}</p>
                    </div>
                    <Link href={`/teams/${membership.team.slug}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        View Team
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Reviews from Legitimate Completed Collaborations */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Verified Collaboration Reviews
            </h3>
            {user.reviewsReceived.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Reviews will be recorded following the completion of verified commercial collaborations.
              </p>
            ) : (
              <div className="space-y-3">
                {user.reviewsReceived.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="flex text-amber-500">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-amber-500" />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {review.title}
                        </span>
                      </div>
                      <Badge variant="success" className="text-[10px]">
                        Verified Collaboration
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {review.comment}
                    </p>
                    <span className="text-[11px] text-zinc-400 block">
                      — {review.author.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar: Skills & Languages */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 space-y-4">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Skills & Specialties
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {profile?.skills.map((s) => (
                <span
                  key={s}
                  className="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Languages
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile?.languages.map((l) => (
                <span key={l} className="bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md">
                  {l}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
