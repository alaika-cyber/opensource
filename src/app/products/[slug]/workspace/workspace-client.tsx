"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatCents, formatBps } from "@/lib/utils";
import {
  FolderKanban,
  LayoutDashboard,
  Users,
  ListTodo,
  Calendar,
  MessageSquare,
  FileText,
  Milestone,
  Target,
  Briefcase,
  DollarSign,
  Activity,
  Settings,
  PlusCircle,
  Video,
  ExternalLink,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Trash2,
  Edit,
  Clock,
  TrendingUp,
  UserPlus,
  Compass,
} from "lucide-react";

interface WorkspaceProps {
  project: any;
  currentUserId: string;
  isOwner: boolean;
  isAdmin: boolean;
  initialTab?: string;
}

export function ProjectWorkspaceClient({
  project,
  currentUserId,
  isOwner,
  isAdmin,
  initialTab = "overview",
}: WorkspaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Task form state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [taskAssignee, setTaskAssignee] = useState(currentUserId);
  const [taskDepartment, setTaskDepartment] = useState("Marketing");
  const [taskCriteria, setTaskCriteria] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Meeting form state
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDesc, setMeetingDesc] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [meetingAgenda, setMeetingAgenda] = useState("");
  const [isSchedulingMeeting, setIsSchedulingMeeting] = useState(false);

  // Invite member form state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Growth Specialist");
  const [inviteDepartment, setInviteDepartment] = useState("Marketing");
  const [isInviting, setIsInviting] = useState(false);

  // Document form state
  const [showDocModal, setShowDocModal] = useState(false);
  const [docName, setDocName] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [docCategory, setDocCategory] = useState("Strategy");
  const [docConfidential, setDocConfidential] = useState(false);
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  // Milestone form state
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDesc, setMilestoneDesc] = useState("");
  const [milestoneDate, setMilestoneDate] = useState("");

  // Goal/KPI form state
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("0");
  const [goalUnit, setGoalUnit] = useState("users");

  // Lead / CRM form state
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadValueDollars, setLeadValueDollars] = useState(1000);
  const [leadStage, setLeadStage] = useState("PROSPECT");

  // Risk form state
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [riskDesc, setRiskDesc] = useState("");
  const [riskImpact, setRiskImpact] = useState("MEDIUM");
  const [riskMitigation, setRiskMitigation] = useState("");

  // Decision form state
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionTitle, setDecisionTitle] = useState("");
  const [decisionSummary, setDecisionSummary] = useState("");
  const [decisionRationale, setDecisionRationale] = useState("");

  // Progress update form state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateContent, setUpdateContent] = useState("");

  // Business plan template selector state
  const [planTemplate, setPlanTemplate] = useState("SaaS Launch");
  const [planSummary, setPlanSummary] = useState(
    "Targeting high-velocity developer teams with automated metrics ingestion and zero configuration overhead."
  );
  const [planMarket, setPlanMarket] = useState("B2B SaaS companies with 20-500 engineers.");
  const [planValueProp, setPlanValueProp] = useState(
    "80% cheaper than legacy observability with real-time sub-second telemetry indexing."
  );
  const [planMarketing, setPlanMarketing] = useState("Developer relations, technical blogs, and outbound SDR pipeline.");
  const [planOps, setPlanOps] = useState("Two-week engineering sprints and weekly growth syncs.");
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  // Settings state
  const [editStage, setEditStage] = useState(project.businessStage || "MVP");
  const [editVisibility, setEditVisibility] = useState(project.visibility || "PUBLIC");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Template switch handler
  const handleSelectTemplate = (templateName: string) => {
    setPlanTemplate(templateName);
    if (templateName === "SaaS Launch") {
      setPlanSummary("Launch cloud SaaS platform with frictionless self-serve tier and high-ACV enterprise pipeline.");
      setPlanMarket("Modern tech startups, software engineering departments, and cloud teams.");
      setPlanValueProp("Modern API-first workflow reducing engineering toil and boosting operational uptime.");
      setPlanMarketing("Product-led growth, open-source community advocacy, and targeted B2B outbound.");
      setPlanOps("Bi-weekly feature releases, automated CI/CD, and 24/7 uptime monitoring.");
    } else if (templateName === "Physical Consumer Brand") {
      setPlanSummary("Scale physical product through direct-to-consumer digital channels and premium retail distribution.");
      setPlanMarket("Health-conscious millennial consumers and lifestyle enthusiasts.");
      setPlanValueProp("Premium organic formulation with sustainable packaging and transparent supply chain.");
      setPlanMarketing("Creator partnerships, TikTok/Instagram video campaigns, and retail popups.");
      setPlanOps("Contract manufacturing inventory management, batch QA testing, and 3PL fulfilment.");
    } else if (templateName === "Marketing Campaign") {
      setPlanSummary("Execute multi-channel growth sprint to achieve 10,000 qualified leads in 90 days.");
      setPlanMarket("VP of Marketing and Sales leaders at mid-market enterprises.");
      setPlanValueProp("Data-backed buyer intent signals and personalized ABM playbooks.");
      setPlanMarketing("Webinar co-marketing, LinkedIn thought leadership, and sponsored newsletters.");
      setPlanOps("Daily funnel attribution tracking, weekly CAC reconciliation, and lead routing.");
    } else if (templateName === "Startup Validation") {
      setPlanSummary("Validate core problem-solution fit through 50 customer discovery interviews and landing page tests.");
      setPlanMarket("Early-stage founders and fractional CTOs.");
      setPlanValueProp("Guaranteed 10x speedup in preliminary architecture decisions.");
      setPlanMarketing("Founder communities, Product Hunt discussions, and 1-on-1 cold DMs.");
      setPlanOps("Weekly hypothesis testing log, feedback synthesis, and pivot evaluation.");
    }
  };

  // Generic Execution Tool Submitter
  const handleCreateExecutionItem = async (tool: string, payload: any) => {
    try {
      const res = await fetch(`/api/products/${project.id}/execution`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, ...payload }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: "Created Successfully", message: `New ${tool} recorded.`, type: "success" });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", message: err.message, type: "error" });
    }
  };

  // Handlers
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setIsCreatingTask(true);
    try {
      const res = await fetch(`/api/products/${project.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle.trim(),
          description: taskDesc.trim() || undefined,
          priority: taskPriority,
          assigneeId: taskAssignee,
          department: taskDepartment,
          acceptanceCriteria: taskCriteria.trim() || undefined,
          dueDate: taskDueDate || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: "Task Created", message: `"${taskTitle}" added to workspace.`, type: "success" });
      setTaskTitle("");
      setTaskDesc("");
      setShowTaskModal(false);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", message: err.message, type: "error" });
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/products/${project.id}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      toast({ title: "Status Updated", message: `Task moved to ${newStatus}`, type: "success" });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", message: err.message, type: "error" });
    }
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle || !meetingTime) return;

    setIsSchedulingMeeting(true);
    try {
      const res = await fetch(`/api/products/${project.id}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: meetingTitle.trim(),
          description: meetingDesc.trim() || undefined,
          scheduledAt: meetingTime,
          meetingUrl: meetingUrl.trim() || undefined,
          agenda: meetingAgenda.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: "Meeting Scheduled", message: `"${meetingTitle}" recorded.`, type: "success" });
      setShowMeetingModal(false);
      setMeetingTitle("");
      setMeetingTime("");
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", message: err.message, type: "error" });
    } finally {
      setIsSchedulingMeeting(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setIsInviting(true);
    try {
      const res = await fetch(`/api/products/${project.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
          department: inviteDepartment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: "Member Added", message: `${inviteEmail} joined project workspace.`, type: "success" });
      setInviteEmail("");
      setShowInviteModal(false);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Invite Error", message: err.message, type: "error" });
    } finally {
      setIsInviting(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !docUrl) return;

    setIsAddingDoc(true);
    try {
      const res = await fetch(`/api/products/${project.id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: docName.trim(),
          fileUrl: docUrl.trim(),
          category: docCategory,
          isConfidential: docConfidential,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: "Document Linked", message: `"${docName}" added to repository.`, type: "success" });
      setDocName("");
      setDocUrl("");
      setShowDocModal(false);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", message: err.message, type: "error" });
    } finally {
      setIsAddingDoc(false);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPlan(true);
    try {
      await handleCreateExecutionItem("business_plan", {
        title: `${planTemplate} Plan`,
        executiveSummary: planSummary,
        targetMarket: planMarket,
        valueProposition: planValueProp,
        marketingChannels: planMarketing,
        operationsRoadmap: planOps,
        templateName: planTemplate,
      });
      toast({ title: "Plan Saved", message: "Business execution plan recorded.", type: "success" });
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch(`/api/products/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessStage: editStage,
          visibility: editVisibility,
        }),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      toast({ title: "Settings Saved", message: "Project configuration updated.", type: "success" });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", message: err.message, type: "error" });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const navigationTabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "team", label: `Team (${project.projectMembers?.length || 1})`, icon: Users },
    { id: "tasks", label: `Tasks (${project.tasks?.length || 0})`, icon: ListTodo },
    { id: "meetings", label: `Meetings (${project.meetings?.length || 0})`, icon: Calendar },
    { id: "documents", label: `Documents (${project.documents?.length || 0})`, icon: FileText },
    { id: "milestones", label: `Roadmap (${project.milestones?.length || 0})`, icon: Milestone },
    { id: "goals", label: `KPIs (${project.goals?.length || 0})`, icon: Target },
    { id: "business_plan", label: "Business Plan", icon: Briefcase },
    { id: "pipeline", label: `Leads (${project.leads?.length || 0})`, icon: TrendingUp },
    { id: "risks", label: `Risks (${project.risks?.length || 0})`, icon: AlertTriangle },
    { id: "decisions", label: `Decisions (${project.decisions?.length || 0})`, icon: Compass },
    { id: "activity", label: `Updates (${project.updates?.length || 0})`, icon: Activity },
    { id: "compensation", label: "Compensation", icon: DollarSign },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="secondary" className="text-[10px]">
              {project.category}
            </Badge>
            <Badge variant="default" className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              {project.businessStage}
            </Badge>
            {project.isConfidential && (
              <Badge variant="destructive" className="gap-1 text-[10px]">
                <Lock className="h-2.5 w-2.5" />
                Confidential
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
            <FolderKanban className="h-7 w-7 text-indigo-600" />
            {project.name}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Founder: {project.owner.name} • {project.projectMembers?.length || 1} Team Members • {project.tasks?.length || 0} Deliverables
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/products/${project.slug}`}>
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              Public Page
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
          {isOwner && (
            <Button
              size="sm"
              variant="glow"
              onClick={() => setShowInviteModal(true)}
              className="text-xs gap-1.5"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Invite Member
            </Button>
          )}
        </div>
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold scrollbar-none">
        {navigationTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                active
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 space-y-1">
              <span className="text-[11px] text-zinc-400 block font-medium">Stage</span>
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 block">
                {project.businessStage}
              </span>
              <span className="text-[10px] text-zinc-500 block">Current development phase</span>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-[11px] text-zinc-400 block font-medium">Team Size</span>
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 block">
                {project.projectMembers?.length || 1} Members
              </span>
              <span className="text-[10px] text-zinc-500 block">Active collaborators</span>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-[11px] text-zinc-400 block font-medium">Active Tasks</span>
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 block">
                {project.tasks?.filter((t: any) => t.status !== "DONE").length || 0} Open
              </span>
              <span className="text-[10px] text-zinc-500 block">Of {project.tasks?.length || 0} total</span>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-[11px] text-zinc-400 block font-medium">Milestones</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 block">
                {project.milestones?.filter((m: any) => m.status === "COMPLETED").length || 0} /{" "}
                {project.milestones?.length || 0}
              </span>
              <span className="text-[10px] text-zinc-500 block">Completed milestones</span>
            </Card>
          </div>

          {/* Launch Checklist */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Business Execution & Launch Checklist
                </h3>
                <p className="text-xs text-zinc-500">
                  Recommended milestones for product validation, recruitment, and revenue growth.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Founder created project and commercial terms</span>
              </div>
              <div className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Recruitment opportunity opened for applications</span>
              </div>
              <div className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 flex items-center gap-2.5">
                <span className="h-4 w-4 rounded-full border border-zinc-400 flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <span>Team members assigned to departments and roles</span>
              </div>
              <div className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 flex items-center gap-2.5">
                <span className="h-4 w-4 rounded-full border border-zinc-400 flex items-center justify-center shrink-0 text-[10px]">
                  4
                </span>
                <span>Commercial compensation agreement signed by participants</span>
              </div>
              <div className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 flex items-center gap-2.5">
                <span className="h-4 w-4 rounded-full border border-zinc-400 flex items-center justify-center shrink-0 text-[10px]">
                  5
                </span>
                <span>Go-to-market campaign tasks and sprint deliverables active</span>
              </div>
              <div className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 flex items-center gap-2.5">
                <span className="h-4 w-4 rounded-full border border-zinc-400 flex items-center justify-center shrink-0 text-[10px]">
                  6
                </span>
                <span>Attributed sales verified and ledger credited</span>
              </div>
            </div>
          </Card>

          {/* Value Proposition & Goals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5 space-y-3">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Core Value Proposition
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </Card>

            <Card className="p-5 space-y-3">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Key Business Goals & KPIs
              </h3>
              {project.goals && project.goals.length > 0 ? (
                <div className="space-y-2">
                  {project.goals.map((g: any) => (
                    <div
                      key={g.id}
                      className="p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">{g.title}</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {g.currentValue} / {g.targetValue} {g.unit || ""}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic">No specific KPIs logged yet.</p>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: TEAM */}
      {activeTab === "team" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Project Team & Departments
              </h3>
              <p className="text-xs text-zinc-500">
                Department leads, contributors, and active workload assignments.
              </p>
            </div>
            {isOwner && (
              <Button size="sm" variant="default" onClick={() => setShowInviteModal(true)} className="gap-1.5 text-xs">
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.projectMembers?.map((m: any) => (
              <Card key={m.id} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {m.user.avatarUrl ? (
                    <img src={m.user.avatarUrl} alt={m.user.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      {m.user.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {m.user.name}
                    </h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{m.role}</p>
                    <span className="text-[10px] text-zinc-400 block">{m.department}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                  <span>Joined: {new Date(m.joinedAt).toLocaleDateString()}</span>
                  <Badge variant={m.status === "ACTIVE" ? "success" : "secondary"} className="text-[10px]">
                    {m.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: TASKS */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Tasks & Deliverables Board
              </h3>
              <p className="text-xs text-zinc-500">
                Track deliverables across TODO, IN PROGRESS, REVIEW, and DONE stages.
              </p>
            </div>
            <Button size="sm" variant="default" onClick={() => setShowTaskModal(true)} className="gap-1.5 text-xs">
              <PlusCircle className="h-4 w-4" />
              Add Task
            </Button>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {["TODO", "IN_PROGRESS", "REVIEW", "DONE"].map((colStatus) => {
              const colTasks = project.tasks?.filter((t: any) => t.status === colStatus) || [];
              const colNames: Record<string, string> = {
                TODO: "To Do",
                IN_PROGRESS: "In Progress",
                REVIEW: "Review",
                DONE: "Completed",
              };

              return (
                <div key={colStatus} className="space-y-3 bg-zinc-50/70 dark:bg-zinc-900/40 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 min-h-[300px]">
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      {colNames[colStatus]}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {colTasks.map((task: any) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-2xs space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-zinc-500">{task.department || "General"}</span>
                          <span className="text-[10px] font-bold text-indigo-600">{task.priority}</span>
                        </div>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{task.title}</h4>
                        {task.description && (
                          <p className="text-[11px] text-zinc-500 line-clamp-2">{task.description}</p>
                        )}
                        {task.acceptanceCriteria && (
                          <p className="text-[10px] text-zinc-400 italic">Criteria: {task.acceptanceCriteria}</p>
                        )}
                        <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-700/60">
                          <span className="text-[10px] text-zinc-400">{task.assignee?.name || "Unassigned"}</span>
                          {colStatus !== "DONE" ? (
                            <button
                              onClick={() => handleUpdateTaskStatus(task.id, "DONE")}
                              className="text-[10px] text-emerald-600 font-semibold hover:underline"
                            >
                              Done ✓
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateTaskStatus(task.id, "TODO")}
                              className="text-[10px] text-zinc-400 hover:underline"
                            >
                              Reopen
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: MEETINGS */}
      {activeTab === "meetings" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Scheduled Team Meetings
              </h3>
              <p className="text-xs text-zinc-500">
                Time-zone aware calls, video conferencing links, and action item logs.
              </p>
            </div>
            <Button size="sm" variant="default" onClick={() => setShowMeetingModal(true)} className="gap-1.5 text-xs">
              <PlusCircle className="h-4 w-4" />
              Schedule Meeting
            </Button>
          </div>

          {project.meetings?.length === 0 ? (
            <Card className="p-8 text-center text-xs text-zinc-500 border-dashed">
              No meetings scheduled yet for this project.
            </Card>
          ) : (
            <div className="space-y-3">
              {project.meetings?.map((m: any) => (
                <Card key={m.id} className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{m.title}</h4>
                    {m.meetingUrl && (
                      <a
                        href={m.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:underline"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Join Call
                      </a>
                    )}
                  </div>
                  <p className="text-zinc-500">
                    {new Date(m.scheduledAt).toLocaleString()} ({m.durationMinutes} mins)
                  </p>
                  {m.agenda && <p className="text-zinc-600 dark:text-zinc-400">Agenda: {m.agenda}</p>}
                  {m.notes && (
                    <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
                      <strong>Notes:</strong> {m.notes}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: DOCUMENTS */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Project Documents & Shared Assets
              </h3>
              <p className="text-xs text-zinc-500">
                Centralized access to pitch decks, specs, marketing collateral, and legal agreements.
              </p>
            </div>
            <Button size="sm" variant="default" onClick={() => setShowDocModal(true)} className="gap-1.5 text-xs">
              <PlusCircle className="h-4 w-4" />
              Link Document
            </Button>
          </div>

          {project.documents?.length === 0 ? (
            <Card className="p-8 text-center text-xs text-zinc-500 border-dashed">
              No documents linked to this project yet.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.documents?.map((doc: any) => (
                <Card key={doc.id} className="p-4 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {doc.name}
                      </span>
                      {doc.isConfidential && (
                        <Badge variant="destructive" className="text-[10px]">Confidential</Badge>
                      )}
                    </div>
                    <span className="text-zinc-400 text-[11px] block">{doc.category}</span>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    View
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: MILESTONES */}
      {activeTab === "milestones" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Roadmap Milestones & Progress
              </h3>
              <p className="text-xs text-zinc-500">
                Major milestones, progress completion %, and verification targets.
              </p>
            </div>
            <Button size="sm" variant="default" onClick={() => setShowMilestoneModal(true)} className="gap-1.5 text-xs">
              <PlusCircle className="h-4 w-4" />
              Add Milestone
            </Button>
          </div>

          {project.milestones?.length === 0 ? (
            <Card className="p-8 text-center text-xs text-zinc-500 border-dashed">
              No milestones defined yet.
            </Card>
          ) : (
            <div className="space-y-3">
              {project.milestones?.map((m: any) => (
                <Card key={m.id} className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{m.title}</h4>
                    <Badge variant={m.status === "COMPLETED" ? "success" : "secondary"}>
                      {m.status}
                    </Badge>
                  </div>
                  {m.description && <p className="text-zinc-600 dark:text-zinc-400">{m.description}</p>}
                  <div className="flex items-center justify-between text-zinc-400 text-[11px] pt-1">
                    <span>Due: {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "Flexible"}</span>
                    <span>{m.progressPercent}% Completed</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 7: GOALS & KPIS */}
      {activeTab === "goals" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Business Goals & Key Performance Indicators (KPIs)
              </h3>
              <p className="text-xs text-zinc-500">
                Measurable targets for user acquisition, sales pipeline, and sprint delivery.
              </p>
            </div>
            <Button size="sm" variant="default" onClick={() => setShowGoalModal(true)} className="gap-1.5 text-xs">
              <PlusCircle className="h-4 w-4" />
              Add KPI Goal
            </Button>
          </div>

          {project.goals?.length === 0 ? (
            <Card className="p-8 text-center text-xs text-zinc-500 border-dashed">
              No KPI targets logged yet.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.goals?.map((g: any) => (
                <Card key={g.id} className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{g.title}</h4>
                    <Badge variant="default" className="text-[10px]">{g.status}</Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      {g.currentValue}
                    </span>
                    <span className="text-zinc-400">/ {g.targetValue} {g.unit || ""}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 8: BUSINESS PLAN */}
      {activeTab === "business_plan" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Business Plan & Strategic Execution
              </h3>
              <p className="text-xs text-zinc-500">
                Pre-configured execution templates for SaaS launches, physical consumer goods, and sales pipelines.
              </p>
            </div>
          </div>

          {/* Template Selectors */}
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              "SaaS Launch",
              "Physical Consumer Brand",
              "Marketing Campaign",
              "Startup Validation",
            ].map((tpl) => (
              <button
                key={tpl}
                onClick={() => handleSelectTemplate(tpl)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  planTemplate === tpl
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {tpl} Template
              </button>
            ))}
          </div>

          <form onSubmit={handleSavePlan} className="space-y-4">
            <Card className="p-5 space-y-3">
              <label className="font-semibold text-xs text-zinc-700 dark:text-zinc-300 block">
                Executive Summary
              </label>
              <textarea
                rows={3}
                value={planSummary}
                onChange={(e) => setPlanSummary(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-2.5 text-xs bg-white dark:bg-zinc-900"
                required
              />

              <label className="font-semibold text-xs text-zinc-700 dark:text-zinc-300 block">
                Target Market
              </label>
              <Input
                type="text"
                value={planMarket}
                onChange={(e) => setPlanMarket(e.target.value)}
                required
              />

              <label className="font-semibold text-xs text-zinc-700 dark:text-zinc-300 block">
                Value Proposition
              </label>
              <textarea
                rows={2}
                value={planValueProp}
                onChange={(e) => setPlanValueProp(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-2.5 text-xs bg-white dark:bg-zinc-900"
                required
              />

              <label className="font-semibold text-xs text-zinc-700 dark:text-zinc-300 block">
                Marketing Channels & Go-To-Market
              </label>
              <Input
                type="text"
                value={planMarketing}
                onChange={(e) => setPlanMarketing(e.target.value)}
                required
              />

              <label className="font-semibold text-xs text-zinc-700 dark:text-zinc-300 block">
                Operations & Sprint Roadmap
              </label>
              <Input
                type="text"
                value={planOps}
                onChange={(e) => setPlanOps(e.target.value)}
                required
              />

              <div className="pt-2 flex justify-between items-center text-[11px] text-zinc-400">
                <span>*Planning templates assist structured collaboration and are not guarantees of sales or profit.</span>
                <Button type="submit" size="sm" variant="default" isLoading={isSavingPlan}>
                  Save Plan
                </Button>
              </div>
            </Card>
          </form>
        </div>
      )}

      {/* Tab 9: PIPELINE & LEADS */}
      {activeTab === "pipeline" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Sales Pipeline & B2B Lead Tracking
              </h3>
              <p className="text-xs text-zinc-500">
                Coordinate customer prospect qualification and estimated deal values.
              </p>
            </div>
            <Button size="sm" variant="default" onClick={() => setShowLeadModal(true)} className="gap-1.5 text-xs">
              <PlusCircle className="h-4 w-4" />
              Log Lead
            </Button>
          </div>

          {project.leads?.length === 0 ? (
            <Card className="p-8 text-center text-xs text-zinc-500 border-dashed">
              No sales leads registered yet.
            </Card>
          ) : (
            <div className="space-y-3">
              {project.leads?.map((lead: any) => (
                <Card key={lead.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{lead.leadName}</h4>
                    <p className="text-zinc-500">{lead.company} • {lead.email}</p>
                    {lead.notes && <p className="text-zinc-400 text-[11px] mt-0.5">{lead.notes}</p>}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-emerald-600 block">
                      {formatCents(lead.estimatedValueCents)}
                    </span>
                    <Badge variant="secondary" className="text-[10px] mt-0.5">
                      {lead.stage}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 10: RISKS & BLOCKERS */}
      {activeTab === "risks" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Risks, Blockers & Mitigation Log
              </h3>
              <p className="text-xs text-zinc-500">
                Identify project dependencies, execution risks, and proactive mitigations.
              </p>
            </div>
            <Button size="sm" variant="default" onClick={() => setShowRiskModal(true)} className="gap-1.5 text-xs">
              <PlusCircle className="h-4 w-4" />
              Log Risk / Blocker
            </Button>
          </div>

          {project.risks?.length === 0 ? (
            <Card className="p-8 text-center text-xs text-zinc-500 border-dashed">
              No risks or blockers identified.
            </Card>
          ) : (
            <div className="space-y-3">
              {project.risks?.map((r: any) => (
                <Card key={r.id} className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{r.description}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      Impact: {r.impact}
                    </span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400">Mitigation: {r.mitigationPlan}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 11: DECISIONS */}
      {activeTab === "decisions" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Architectural & Business Decision Log
              </h3>
              <p className="text-xs text-zinc-500">
                Immutable record of team decisions, rationale, and timestamps.
              </p>
            </div>
            <Button size="sm" variant="default" onClick={() => setShowDecisionModal(true)} className="gap-1.5 text-xs">
              <PlusCircle className="h-4 w-4" />
              Record Decision
            </Button>
          </div>

          {project.decisions?.length === 0 ? (
            <Card className="p-8 text-center text-xs text-zinc-500 border-dashed">
              No decisions recorded yet.
            </Card>
          ) : (
            <div className="space-y-3">
              {project.decisions?.map((d: any) => (
                <Card key={d.id} className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{d.title}</h4>
                    <span className="text-zinc-400 text-[11px]">
                      {new Date(d.decidedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 font-medium">{d.decision}</p>
                  {d.rationale && <p className="text-zinc-500 text-[11px]">Rationale: {d.rationale}</p>}
                  <span className="text-[10px] text-zinc-400 block pt-1">— Decided by {d.decidedBy.name}</span>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 12: ACTIVITY & UPDATES */}
      {activeTab === "activity" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Weekly Progress Reports & Announcements
              </h3>
              <p className="text-xs text-zinc-500">
                Regular sprint recaps, blocker notifications, and milestone completions.
              </p>
            </div>
            <Button size="sm" variant="default" onClick={() => setShowUpdateModal(true)} className="gap-1.5 text-xs">
              <PlusCircle className="h-4 w-4" />
              Post Update
            </Button>
          </div>

          {project.updates?.length === 0 ? (
            <Card className="p-8 text-center text-xs text-zinc-500 border-dashed">
              No progress updates posted yet.
            </Card>
          ) : (
            <div className="space-y-3">
              {project.updates?.map((u: any) => (
                <Card key={u.id} className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{u.title}</h4>
                    <span className="text-zinc-400 text-[11px]">{new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">{u.content}</p>
                  <span className="text-[10px] text-zinc-400 block pt-1">— {u.author.name}</span>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 13: COMPENSATION */}
      {activeTab === "compensation" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Commercial Agreements & Compensation Model
            </h3>
            <p className="text-xs text-zinc-500">
              Mutually agreed commission splits, revenue shares, and milestone terms.
            </p>
          </div>

          <Card className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-400 block">Commission Pool</span>
                <span className="text-lg font-bold text-indigo-600 block mt-1">
                  {formatBps(project.commissionRateBps)}
                </span>
                <span className="text-[10px] text-zinc-500">Of qualifying commercial revenue</span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-400 block">Attribution Window</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 block mt-1">
                  {project.attributionWindowDays} Days
                </span>
                <span className="text-[10px] text-zinc-500">Cookie / tracking validity</span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-400 block">Active Agreements</span>
                <span className="text-lg font-bold text-emerald-600 block mt-1">
                  {project.agreements?.length || 0} Signed
                </span>
                <span className="text-[10px] text-zinc-500">Tamper-evident checksums</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <strong className="block font-semibold">Legal & Compliance Notice:</strong>
              <p className="text-[11px] leading-relaxed">
                OpenSource provides the execution and collaboration infrastructure. Proposed equity arrangements and advisory splits are non-binding expressions of commercial intent and do not constitute legal issuance of shares or securities without formal corporate counsel.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 14: SETTINGS */}
      {activeTab === "settings" && isOwner && (
        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-xl">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Project Settings
            </h3>
            <p className="text-xs text-zinc-500">
              Update visibility, business stage, and recruitment status.
            </p>
          </div>

          <Card className="p-5 space-y-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Business Stage</label>
              <select
                value={editStage}
                onChange={(e) => setEditStage(e.target.value)}
                className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 text-xs"
              >
                <option value="Idea">Idea / Validation</option>
                <option value="Prototype">Prototype</option>
                <option value="MVP">Minimum Viable Product (MVP)</option>
                <option value="Early Traction">Early Traction</option>
                <option value="Scaling">Scaling</option>
                <option value="Established">Established Business</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Visibility</label>
              <select
                value={editVisibility}
                onChange={(e) => setEditVisibility(e.target.value)}
                className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 text-xs"
              >
                <option value="PUBLIC">Public (Listed in Discover)</option>
                <option value="UNLISTED">Unlisted (Accessible by link)</option>
                <option value="PRIVATE">Private (Team members only)</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" size="sm" variant="glow" isLoading={isSavingSettings}>
                Save Changes
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* MODAL: ADD TASK */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Add Project Deliverable</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Title</label>
                <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required />
              </div>
              <div>
                <label className="font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-2 text-xs bg-white dark:bg-zinc-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Department</label>
                  <select
                    value={taskDepartment}
                    onChange={(e) => setTaskDepartment(e.target.value)}
                    className="w-full h-8 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-2 text-xs"
                  >
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full h-8 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-2 text-xs"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Due Date</label>
                <Input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />
              </div>
              <div>
                <label className="font-semibold block mb-1">Acceptance Criteria</label>
                <Input value={taskCriteria} onChange={(e) => setTaskCriteria(e.target.value)} placeholder="Definition of done..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setShowTaskModal(false)}>Cancel</Button>
                <Button size="sm" variant="default" type="submit" isLoading={isCreatingTask}>Create Deliverable</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE MEETING */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Schedule Meeting</h3>
            <form onSubmit={handleScheduleMeeting} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Meeting Title</label>
                <Input value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)} required />
              </div>
              <div>
                <label className="font-semibold block mb-1">Scheduled Time</label>
                <Input type="datetime-local" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} required />
              </div>
              <div>
                <label className="font-semibold block mb-1">Video Link (Meet / Zoom)</label>
                <Input type="url" value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)} placeholder="https://meet.google.com/..." />
              </div>
              <div>
                <label className="font-semibold block mb-1">Agenda</label>
                <textarea
                  rows={2}
                  value={meetingAgenda}
                  onChange={(e) => setMeetingAgenda(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-2 text-xs bg-white dark:bg-zinc-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setShowMeetingModal(false)}>Cancel</Button>
                <Button size="sm" variant="default" type="submit" isLoading={isSchedulingMeeting}>Schedule</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INVITE MEMBER */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Invite Member to Project</h3>
            <form onSubmit={handleInviteMember} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Professional Email</label>
                <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required placeholder="collaborator@example.com" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Project Role</label>
                <Input value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} required />
              </div>
              <div>
                <label className="font-semibold block mb-1">Department</label>
                <select
                  value={inviteDepartment}
                  onChange={(e) => setInviteDepartment(e.target.value)}
                  className="w-full h-8 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-2 text-xs"
                >
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setShowInviteModal(false)}>Cancel</Button>
                <Button size="sm" variant="default" type="submit" isLoading={isInviting}>Send Invitation</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LINK DOCUMENT */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Link Project Document</h3>
            <form onSubmit={handleAddDocument} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Document Name</label>
                <Input value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="e.g. Q4 Growth Pitch Deck" required />
              </div>
              <div>
                <label className="font-semibold block mb-1">Document URL / Cloud Link</label>
                <Input type="url" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} placeholder="https://docs.google.com/..." required />
              </div>
              <div>
                <label className="font-semibold block mb-1">Category</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full h-8 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-2 text-xs"
                >
                  <option value="Strategy">Strategy</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Technical">Technical</option>
                  <option value="Legal">Legal</option>
                  <option value="Financial">Financial</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="confidential"
                  checked={docConfidential}
                  onChange={(e) => setDocConfidential(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="confidential" className="font-medium text-xs">
                  Confidential (Accessible only to authorized team members)
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setShowDocModal(false)}>Cancel</Button>
                <Button size="sm" variant="default" type="submit" isLoading={isAddingDoc}>Link Document</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MILESTONE */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Add Roadmap Milestone</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Milestone Title</label>
                <Input value={milestoneTitle} onChange={(e) => setMilestoneTitle(e.target.value)} placeholder="e.g. Beta Launch to 100 Pilot Accounts" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Description</label>
                <Input value={milestoneDesc} onChange={(e) => setMilestoneDesc(e.target.value)} />
              </div>
              <div>
                <label className="font-semibold block mb-1">Target Date</label>
                <Input type="date" value={milestoneDate} onChange={(e) => setMilestoneDate(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setShowMilestoneModal(false)}>Cancel</Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={async () => {
                    await handleCreateExecutionItem("milestone", {
                      title: milestoneTitle,
                      description: milestoneDesc,
                      dueDate: milestoneDate,
                    });
                    setShowMilestoneModal(false);
                    setMilestoneTitle("");
                  }}
                >
                  Add Milestone
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD GOAL / KPI */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Add KPI Target</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Metric Title</label>
                <Input value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} placeholder="e.g. Monthly Recurring Revenue, Active Teams" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Target Value</label>
                  <Input value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} placeholder="50,000" />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Unit</label>
                  <Input value={goalUnit} onChange={(e) => setGoalUnit(e.target.value)} placeholder="USD / accounts" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setShowGoalModal(false)}>Cancel</Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={async () => {
                    await handleCreateExecutionItem("goal", {
                      title: goalTitle,
                      targetValue: goalTarget,
                      currentValue: goalCurrent,
                      unit: goalUnit,
                    });
                    setShowGoalModal(false);
                    setGoalTitle("");
                  }}
                >
                  Add KPI
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOG LEAD */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Log Sales Lead / Pipeline Deal</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Contact Name</label>
                <Input value={leadName} onChange={(e) => setLeadName(e.target.value)} placeholder="Alex Mercer" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Company</label>
                <Input value={leadCompany} onChange={(e) => setLeadCompany(e.target.value)} placeholder="Fintech Corp" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Email</label>
                <Input type="email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} placeholder="alex@fintech.com" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Estimated Value ($)</label>
                  <Input type="number" value={leadValueDollars} onChange={(e) => setLeadValueDollars(Number(e.target.value))} />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Stage</label>
                  <select
                    value={leadStage}
                    onChange={(e) => setLeadStage(e.target.value)}
                    className="w-full h-8 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-2 text-xs"
                  >
                    <option value="PROSPECT">Prospect</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="PROPOSAL">Proposal</option>
                    <option value="WON">Won</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setShowLeadModal(false)}>Cancel</Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={async () => {
                    await handleCreateExecutionItem("lead", {
                      leadName,
                      company: leadCompany,
                      email: leadEmail,
                      estimatedValueCents: Math.round(leadValueDollars * 100),
                      stage: leadStage,
                    });
                    setShowLeadModal(false);
                    setLeadName("");
                    setLeadCompany("");
                    setLeadEmail("");
                  }}
                >
                  Log Lead
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOG RISK */}
      {showRiskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Log Risk / Blocker</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Risk Description</label>
                <Input value={riskDesc} onChange={(e) => setRiskDesc(e.target.value)} placeholder="e.g. Delays in 3PL packaging shipment" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Impact Level</label>
                <select
                  value={riskImpact}
                  onChange={(e) => setRiskImpact(e.target.value)}
                  className="w-full h-8 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-2 text-xs"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Mitigation Plan</label>
                <textarea
                  rows={2}
                  value={riskMitigation}
                  onChange={(e) => setRiskMitigation(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-2 text-xs bg-white dark:bg-zinc-800"
                  placeholder="Steps taken to mitigate or bypass the blocker..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setShowRiskModal(false)}>Cancel</Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={async () => {
                    await handleCreateExecutionItem("risk", {
                      description: riskDesc,
                      impact: riskImpact,
                      mitigationPlan: riskMitigation,
                    });
                    setShowRiskModal(false);
                    setRiskDesc("");
                    setRiskMitigation("");
                  }}
                >
                  Record Risk
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOG DECISION */}
      {showDecisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Record Decision</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Subject / Question</label>
                <Input value={decisionTitle} onChange={(e) => setDecisionTitle(e.target.value)} placeholder="e.g. Database Architecture for Analytics" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Decision Summary</label>
                <Input value={decisionSummary} onChange={(e) => setDecisionSummary(e.target.value)} placeholder="e.g. Adopted PostgreSQL on Neon with branch isolation" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Rationale</label>
                <textarea
                  rows={2}
                  value={decisionRationale}
                  onChange={(e) => setDecisionRationale(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-2 text-xs bg-white dark:bg-zinc-800"
                  placeholder="Why this direction was chosen..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setShowDecisionModal(false)}>Cancel</Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={async () => {
                    await handleCreateExecutionItem("decision", {
                      title: decisionTitle,
                      decision: decisionSummary,
                      rationale: decisionRationale,
                    });
                    setShowDecisionModal(false);
                    setDecisionTitle("");
                    setDecisionSummary("");
                  }}
                >
                  Record Decision
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: POST UPDATE */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Post Weekly Progress Update</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Update Title</label>
                <Input value={updateTitle} onChange={(e) => setUpdateTitle(e.target.value)} placeholder="e.g. Week 4 Sprint: 12 Leads Qualified" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Update Details</label>
                <textarea
                  rows={4}
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-2 text-xs bg-white dark:bg-zinc-800"
                  placeholder="Summary of accomplishments, metrics moved, and upcoming focus..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setShowUpdateModal(false)}>Cancel</Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={async () => {
                    await handleCreateExecutionItem("update", {
                      title: updateTitle,
                      content: updateContent,
                    });
                    setShowUpdateModal(false);
                    setUpdateTitle("");
                    setUpdateContent("");
                  }}
                >
                  Post Update
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
