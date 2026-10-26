"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatBps } from "@/lib/utils";
import {
  ListTodo,
  PieChart,
  MessageSquare,
  Link as LinkIcon,
  PlusCircle,
  UserPlus,
  CheckCircle2,
  Clock,
  Send,
} from "lucide-react";

interface Props {
  team: any;
  currentUserId: string;
  isLeader: boolean;
}

export function TeamWorkspaceClient({ team, currentUserId, isLeader }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"tasks" | "splits" | "discussions" | "links">("tasks");

  // Task creation state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [taskAssignee, setTaskAssignee] = useState(currentUserId);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Invite member state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("SALES_REP");
  const [isInviting, setIsInviting] = useState(false);

  // Discussion state
  const [topicTitle, setTopicTitle] = useState("");
  const [topicContent, setTopicContent] = useState("");
  const [isPostingTopic, setIsPostingTopic] = useState(false);
  const [commentText, setCommentText] = useState<{ [discussionId: string]: string }>({});

  // Allocations state
  const [allocations, setAllocations] = useState<{ [userId: string]: number }>(
    team.members.reduce((acc: any, m: any) => ({ ...acc, [m.userId]: m.allocationBps }), {})
  );
  const [isSavingAllocations, setIsSavingAllocations] = useState(false);

  const totalAllocationBps = Object.values(allocations).reduce((sum, val) => sum + val, 0);

  // Handlers
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    setIsCreatingTask(true);
    try {
      const res = await fetch(`/api/teams/${team.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          priority: taskPriority,
          assigneeId: taskAssignee,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: "Task Created", message: `"${taskTitle}" added to workspace.`, type: "success" });
      setTaskTitle("");
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", message: err.message, type: "error" });
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/teams/${team.id}/tasks`, {
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

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setIsInviting(true);
    try {
      const res = await fetch(`/api/teams/${team.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "invite",
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: "Member Added", message: `${inviteEmail} has joined the team workspace.`, type: "success" });
      setInviteEmail("");
      router.refresh();
    } catch (err: any) {
      toast({ title: "Invite Error", message: err.message, type: "error" });
    } finally {
      setIsInviting(false);
    }
  };

  const handleSaveAllocations = async () => {
    if (totalAllocationBps !== 10000) {
      toast({
        title: "Invalid Allocation Sum",
        message: `Member shares must sum to exactly 100.00% (10,000 bps). Current: ${(totalAllocationBps / 100).toFixed(2)}%.`,
        type: "error",
      });
      return;
    }

    setIsSavingAllocations(true);
    try {
      const payload = Object.entries(allocations).map(([userId, bps]) => ({
        userId,
        memberRole: team.members.find((m: any) => m.userId === userId)?.role || "SALES_REP",
        allocationBps: bps,
      }));

      const res = await fetch(`/api/teams/${team.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_allocations",
          allocations: payload,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: "Splits Updated", message: "Team revenue allocation updated successfully.", type: "success" });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", message: err.message, type: "error" });
    } finally {
      setIsSavingAllocations(false);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle || !topicContent) return;

    setIsPostingTopic(true);
    try {
      const res = await fetch(`/api/teams/${team.id}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: topicTitle, content: topicContent }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: "Discussion Posted", message: `Topic "${topicTitle}" published.`, type: "success" });
      setTopicTitle("");
      setTopicContent("");
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", message: err.message, type: "error" });
    } finally {
      setIsPostingTopic(false);
    }
  };

  const handleAddComment = async (discussionId: string) => {
    const text = commentText[discussionId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch(`/api/teams/${team.id}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "comment",
          discussionId,
          content: text.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to post comment");
      setCommentText((prev) => ({ ...prev, [discussionId]: "" }));
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", message: err.message, type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`pb-3 flex items-center gap-2 transition-colors ${
            activeTab === "tasks"
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <ListTodo className="h-4 w-4" />
          Tasks & Execution ({team.tasks.length})
        </button>

        <button
          onClick={() => setActiveTab("splits")}
          className={`pb-3 flex items-center gap-2 transition-colors ${
            activeTab === "splits"
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <PieChart className="h-4 w-4" />
          Revenue Splits & Members ({team.members.length})
        </button>

        <button
          onClick={() => setActiveTab("discussions")}
          className={`pb-3 flex items-center gap-2 transition-colors ${
            activeTab === "discussions"
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Discussions ({team.discussions.length})
        </button>

        <button
          onClick={() => setActiveTab("links")}
          className={`pb-3 flex items-center gap-2 transition-colors ${
            activeTab === "links"
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <LinkIcon className="h-4 w-4" />
          Campaigns & Links
        </button>
      </div>

      {/* Tab 1: Tasks */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-3">
              Add New Deliverable
            </h3>
            <form onSubmit={handleCreateTask} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-6">
                <label className="text-xs text-zinc-500 block mb-1">Task Title</label>
                <Input
                  type="text"
                  placeholder="e.g. Publish benchmark comparison article"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs text-zinc-500 block mb-1">Assignee</label>
                <select
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-xs"
                >
                  {team.members.map((m: any) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <Button type="submit" variant="glow" size="sm" className="w-full h-10 gap-1.5" isLoading={isCreatingTask}>
                  <PlusCircle className="h-4 w-4" />
                  Add Task
                </Button>
              </div>
            </form>
          </Card>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {(["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const).map((status) => {
              const statusTasks = team.tasks.filter((t: any) => t.status === status);
              return (
                <div key={status} className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    <span>{status.replace(/_/g, " ")}</span>
                    <Badge variant="secondary" className="text-[10px]">{statusTasks.length}</Badge>
                  </div>

                  <div className="space-y-2">
                    {statusTasks.map((task: any) => (
                      <Card key={task.id} className="p-3 space-y-2 text-xs">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">{task.title}</p>
                        <div className="flex items-center justify-between text-[11px] text-zinc-500">
                          <span>Assignee: {task.assignee?.name || "Unassigned"}</span>
                          <span className="font-medium text-amber-500">{task.priority}</span>
                        </div>

                        {/* Move status buttons */}
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between gap-1">
                          {status !== "TODO" && (
                            <button
                              onClick={() => handleUpdateTaskStatus(task.id, status === "DONE" ? "REVIEW" : status === "REVIEW" ? "IN_PROGRESS" : "TODO")}
                              className="text-[10px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                            >
                              ← Back
                            </button>
                          )}
                          {status !== "DONE" && (
                            <button
                              onClick={() => handleUpdateTaskStatus(task.id, status === "TODO" ? "IN_PROGRESS" : status === "IN_PROGRESS" ? "REVIEW" : "DONE")}
                              className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold ml-auto"
                            >
                              Advance →
                            </button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Splits & Member Directory */}
      {activeTab === "splits" && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  Internal Revenue Allocation
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Member shares must sum to exactly 100.00% (10,000 basis points).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs">
                  Current Sum:{" "}
                  <strong className={totalAllocationBps === 10000 ? "text-emerald-500" : "text-red-500"}>
                    {(totalAllocationBps / 100).toFixed(2)}% ({totalAllocationBps} bps)
                  </strong>
                </span>
                {isLeader && (
                  <Button
                    size="sm"
                    variant="glow"
                    onClick={handleSaveAllocations}
                    disabled={totalAllocationBps !== 10000}
                    isLoading={isSavingAllocations}
                  >
                    Save Allocations
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {team.members.map((member: any) => (
                <div
                  key={member.id}
                  className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                      {member.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                        {member.user.name}
                      </p>
                      <span className="text-xs text-zinc-500">Role: {member.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isLeader ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="10000"
                          step="100"
                          value={allocations[member.userId] || 0}
                          onChange={(e) =>
                            setAllocations((prev) => ({
                              ...prev,
                              [member.userId]: parseInt(e.target.value, 10) || 0,
                            }))
                          }
                          className="w-24 text-right font-mono"
                        />
                        <span className="text-xs text-zinc-400">
                          bps ({formatBps(allocations[member.userId] || 0)})
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                        {formatBps(member.allocationBps)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Add / Invite Member */}
          {isLeader && (
            <Card className="p-6">
              <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-indigo-500" />
                Add Professional to Syndicate
              </h4>
              <form onSubmit={handleInviteMember} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-6">
                  <label className="text-xs text-zinc-500 block mb-1">Professional Email</label>
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="text-xs text-zinc-500 block mb-1">Assigned Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-xs"
                  >
                    <option value="SALES_REP">Sales Representative</option>
                    <option value="MARKETER">Marketer</option>
                    <option value="STRATEGIST">Strategist</option>
                    <option value="CONTENT_CREATOR">Content Creator</option>
                    <option value="TECHNICAL_ADVISOR">Technical Advisor</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" variant="default" size="sm" className="w-full h-10" isLoading={isInviting}>
                    Add Member
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      )}

      {/* Tab 3: Discussions */}
      {activeTab === "discussions" && (
        <div className="space-y-6">
          {/* Post Topic */}
          <Card className="p-5">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-2">
              Start a Team Discussion
            </h4>
            <form onSubmit={handleCreateTopic} className="space-y-3">
              <Input
                type="text"
                placeholder="Topic Title (e.g. Q4 Positioning and Outreach Strategy)"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                required
              />
              <textarea
                rows={3}
                placeholder="Share context, questions, or campaign ideas..."
                value={topicContent}
                onChange={(e) => setTopicContent(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <div className="flex justify-end">
                <Button type="submit" variant="glow" size="sm" isLoading={isPostingTopic}>
                  Publish Topic
                </Button>
              </div>
            </form>
          </Card>

          {/* Discussions Feed */}
          <div className="space-y-4">
            {team.discussions.length === 0 ? (
              <p className="text-center py-8 text-xs text-zinc-500">
                No discussion threads yet. Post a topic to coordinate with your syndicate.
              </p>
            ) : (
              team.discussions.map((topic: any) => (
                <Card key={topic.id} className="p-5 space-y-4">
                  <div>
                    <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                      {topic.title}
                    </h4>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">
                      Posted by {topic.author.name}
                    </span>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                      {topic.content}
                    </p>
                  </div>

                  {/* Comments */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                    {topic.comments?.map((comment: any) => (
                      <div key={comment.id} className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 text-xs space-y-0.5">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{comment.author.name}</span>
                        <p className="text-zinc-600 dark:text-zinc-400">{comment.content}</p>
                      </div>
                    ))}

                    {/* Add comment input */}
                    <div className="flex items-center gap-2 pt-1">
                      <Input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentText[topic.id] || ""}
                        onChange={(e) =>
                          setCommentText((prev) => ({ ...prev, [topic.id]: e.target.value }))
                        }
                        className="text-xs h-9"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-9 px-3 shrink-0"
                        onClick={() => handleAddComment(topic.id)}
                      >
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Links & Campaigns */}
      {activeTab === "links" && (
        <Card className="p-6 space-y-4">
          <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
            Attributed Campaigns & Commercial Links
          </h4>
          {team.referralLinks.length === 0 ? (
            <p className="text-xs text-zinc-500">
              No referral tracking links registered under this team yet.
            </p>
          ) : (
            <div className="space-y-3">
              {team.referralLinks.map((link: any) => (
                <div
                  key={link.id}
                  className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{link.product.name}</p>
                    <p className="font-mono text-[11px] text-zinc-500 mt-0.5">{link.targetUrl}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500">Total Clicks: {link.clickCount}</span>
                    <Badge variant="secondary">Code: {link.code}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
