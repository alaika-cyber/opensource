"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  Filter,
  CheckSquare,
  Square,
  User,
  FolderKanban,
} from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  department: string | null;
  labels: string[];
  subtasks: any;
  acceptanceCriteria: string | null;
  project?: { id: string; name: string; slug: string } | null;
  team?: { id: string; name: string; slug: string } | null;
  assignee?: { id: string; name: string; avatarUrl: string | null } | null;
  creator?: { id: string; name: string } | null;
}

interface Props {
  initialTasks: TaskItem[];
  userProjects: { id: string; name: string }[];
  currentUserId: string;
}

export function TasksDashboardClient({ initialTasks, userProjects, currentUserId }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // New task form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState("MEDIUM");
  const [newProjectId, setNewProjectId] = useState(userProjects[0]?.id || "");
  const [newDueDate, setNewDueDate] = useState("");
  const [newDepartment, setNewDepartment] = useState("Marketing");
  const [newCriteria, setNewCriteria] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleUpdateStatus = async (task: TaskItem, newStatus: string) => {
    try {
      const endpoint = task.project
        ? `/api/products/${task.project.id}/tasks`
        : `/api/teams/${task.team?.id}/tasks`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setTasks((prev) =>
        prev.map((item) => (item.id === task.id ? { ...item, status: newStatus } : item))
      );
      toast({ title: "Task Updated", message: `Task moved to ${newStatus}`, type: "success" });
    } catch (err: any) {
      toast({ title: "Update Error", message: err.message, type: "error" });
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newProjectId) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${newProjectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim() || undefined,
          priority: newPriority,
          assigneeId: currentUserId,
          dueDate: newDueDate || undefined,
          department: newDepartment,
          acceptanceCriteria: newCriteria.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: "Task Created", message: `"${newTitle}" added to project.`, type: "success" });
      setTasks((prev) => [data.task, ...prev]);
      setNewTitle("");
      setNewDesc("");
      setShowCreateModal(false);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", message: err.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityColors: Record<string, string> = {
    LOW: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    HIGH: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    URGENT: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  };

  const statusBadges: Record<string, { label: string; variant: "default" | "secondary" | "success" | "destructive" }> = {
    TODO: { label: "To Do", variant: "secondary" },
    IN_PROGRESS: { label: "In Progress", variant: "default" },
    REVIEW: { label: "Under Review", variant: "secondary" },
    DONE: { label: "Completed", variant: "success" },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Tasks & Business Execution
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Track deliverables, acceptance criteria, and departmental workflows across your projects.
          </p>
        </div>

        {userProjects.length > 0 && (
          <Button
            size="sm"
            variant="default"
            onClick={() => setShowCreateModal(true)}
            className="gap-1.5 text-xs self-start sm:self-auto"
          >
            <PlusCircle className="h-4 w-4" />
            Create Task
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-zinc-500 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            Status:
          </span>
          {["ALL", "TODO", "IN_PROGRESS", "REVIEW", "DONE"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === s
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
              }`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Search task title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs w-full sm:w-48"
          />
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <ListTodo className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            No tasks found
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== "ALL"
              ? "Try adjusting your filters or search terms."
              : "Create a task in one of your projects to coordinate execution with your team."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className={`p-4 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 ${
                task.status === "DONE" ? "opacity-75 bg-zinc-50/50 dark:bg-zinc-900/30" : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        priorityColors[task.priority] || priorityColors.MEDIUM
                      }`}
                    >
                      {task.priority}
                    </span>
                    <Badge variant={statusBadges[task.status]?.variant || "secondary"} className="text-[10px]">
                      {statusBadges[task.status]?.label || task.status}
                    </Badge>
                    {task.department && (
                      <span className="text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md font-medium">
                        {task.department}
                      </span>
                    )}
                    {task.project && (
                      <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                        <FolderKanban className="h-3 w-3" />
                        {task.project.name}
                      </span>
                    )}
                  </div>

                  <h3
                    className={`font-bold text-sm text-zinc-900 dark:text-zinc-100 ${
                      task.status === "DONE" ? "line-through text-zinc-500" : ""
                    }`}
                  >
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  {task.acceptanceCriteria && (
                    <div className="mt-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
                      <strong className="text-zinc-700 dark:text-zinc-300 block mb-0.5">Acceptance Criteria:</strong>
                      {task.acceptanceCriteria}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-500">
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {task.assignee && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Assignee: {task.assignee.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {task.status !== "TODO" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateStatus(task, "TODO")}
                      className="text-xs h-7 px-2"
                    >
                      To Do
                    </Button>
                  )}
                  {task.status !== "IN_PROGRESS" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateStatus(task, "IN_PROGRESS")}
                      className="text-xs h-7 px-2"
                    >
                      In Progress
                    </Button>
                  )}
                  {task.status !== "REVIEW" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateStatus(task, "REVIEW")}
                      className="text-xs h-7 px-2"
                    >
                      Review
                    </Button>
                  )}
                  {task.status !== "DONE" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(task, "DONE")}
                      className="text-xs h-7 px-2 text-emerald-600 hover:text-emerald-700 gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark Done
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateStatus(task, "TODO")}
                      className="text-xs h-7 px-2 text-zinc-400"
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Task Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-indigo-500" />
              Create Project Deliverable
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Project</label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 text-xs"
                  required
                >
                  {userProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Task Title</label>
                <Input
                  type="text"
                  placeholder="e.g. Set up outbound sales sequence for mid-market dev leads"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Description & Scope</label>
                <textarea
                  rows={3}
                  placeholder="Describe the deliverable and key requirements..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 text-xs"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 text-xs"
                  >
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Research">Research</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Due Date</label>
                <Input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Acceptance Criteria</label>
                <Input
                  type="text"
                  placeholder="e.g. 50 personalized emails sent, open rate > 40%"
                  value={newCriteria}
                  onChange={(e) => setNewCriteria(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="glow" isLoading={isSubmitting}>
                  Create Deliverable
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
