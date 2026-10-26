"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  Calendar,
  Clock,
  Video,
  PlusCircle,
  FolderKanban,
  ExternalLink,
  Users,
  FileText,
  CheckCircle2,
} from "lucide-react";

interface MeetingItem {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  durationMinutes: number;
  timezone: string;
  meetingUrl: string | null;
  agenda: string | null;
  notes: string | null;
  decisions: string | null;
  status: string;
  project?: { id: string; name: string; slug: string } | null;
  creator?: { id: string; name: string; avatarUrl: string | null } | null;
}

interface Props {
  initialMeetings: MeetingItem[];
  userProjects: { id: string; name: string }[];
  currentUserId: string;
}

export function MeetingsDashboardClient({ initialMeetings, userProjects, currentUserId }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<MeetingItem[]>(initialMeetings);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // New meeting form state
  const [projectId, setProjectId] = useState(userProjects[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [timezone, setTimezone] = useState(
    typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC"
  );
  const [meetingUrl, setMeetingUrl] = useState("");
  const [agenda, setAgenda] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit notes state
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");
  const [decisionsText, setDecisionsText] = useState("");

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !scheduledAt || !projectId) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${projectId}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          scheduledAt,
          durationMinutes,
          timezone,
          meetingUrl: meetingUrl || undefined,
          agenda,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: "Meeting Scheduled", message: `"${title}" has been scheduled.`, type: "success" });
      setMeetings((prev) => [data.meeting, ...prev]);
      setTitle("");
      setDescription("");
      setScheduledAt("");
      setMeetingUrl("");
      setAgenda("");
      setShowScheduleModal(false);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Scheduling Error", message: err.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNotes = async (meetingId: string, projectId: string) => {
    try {
      const res = await fetch(`/api/products/${projectId}/meetings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId,
          notes: notesText,
          decisions: decisionsText,
          status: "COMPLETED",
        }),
      });

      if (!res.ok) throw new Error("Failed to save notes");

      setMeetings((prev) =>
        prev.map((m) =>
          m.id === meetingId
            ? { ...m, notes: notesText, decisions: decisionsText, status: "COMPLETED" }
            : m
        )
      );
      setEditingMeetingId(null);
      toast({ title: "Meeting Notes Saved", message: "Notes & decisions recorded.", type: "success" });
    } catch (err: any) {
      toast({ title: "Error", message: err.message, type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Meetings & Collaboration Sessions
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Coordinate team agendas, sync on execution, and log key decisions across projects.
          </p>
        </div>

        {userProjects.length > 0 && (
          <Button
            size="sm"
            variant="default"
            onClick={() => setShowScheduleModal(true)}
            className="gap-1.5 text-xs self-start sm:self-auto"
          >
            <PlusCircle className="h-4 w-4" />
            Schedule Meeting
          </Button>
        )}
      </div>

      {/* Meetings Grid / List */}
      {meetings.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Calendar className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            No upcoming meetings scheduled
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Schedule strategy discussions, sprint retrospectives, or customer review sessions with your project members.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="p-5 space-y-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={meeting.status === "COMPLETED" ? "success" : "default"} className="text-[10px]">
                      {meeting.status}
                    </Badge>
                    {meeting.project && (
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                        <FolderKanban className="h-3 w-3" />
                        {meeting.project.name}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    {meeting.title}
                  </h3>
                  {meeting.description && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">{meeting.description}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {meeting.meetingUrl ? (
                    <a
                      href={meeting.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
                    >
                      <Video className="h-3.5 w-3.5" />
                      Join Meeting
                      <ExternalLink className="h-3 w-3 ml-0.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-400 italic">No link attached</span>
                  )}
                </div>
              </div>

              {/* Time & Duration */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                  <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                  {new Date(meeting.scheduledAt).toLocaleString(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-zinc-400" />
                  {meeting.durationMinutes} mins ({meeting.timezone})
                </span>
                {meeting.creator && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-zinc-400" />
                    Host: {meeting.creator.name}
                  </span>
                )}
              </div>

              {/* Agenda */}
              {meeting.agenda && (
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-xs space-y-1">
                  <strong className="text-zinc-700 dark:text-zinc-300 block font-semibold">
                    Agenda:
                  </strong>
                  <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-line leading-relaxed">
                    {meeting.agenda}
                  </p>
                </div>
              )}

              {/* Notes & Decisions */}
              {meeting.notes && (
                <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs space-y-1">
                  <strong className="text-emerald-800 dark:text-emerald-300 block font-semibold">
                    Notes & Action Items:
                  </strong>
                  <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                    {meeting.notes}
                  </p>
                </div>
              )}

              {/* Edit notes trigger */}
              {meeting.project && (
                <div className="flex justify-end pt-1">
                  {editingMeetingId === meeting.id ? (
                    <div className="w-full space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <label className="text-xs font-semibold block">Meeting Notes & Summary</label>
                      <textarea
                        rows={3}
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        placeholder="Key points discussed, agreed deadlines, and task assignments..."
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-2.5 text-xs bg-white dark:bg-zinc-900"
                      />
                      <label className="text-xs font-semibold block">Agreed Decisions</label>
                      <Input
                        type="text"
                        value={decisionsText}
                        onChange={(e) => setDecisionsText(e.target.value)}
                        placeholder="e.g. Approved launch date for Q2, allocated 10% pool to growth"
                      />
                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingMeetingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleSaveNotes(meeting.id, meeting.project!.id)}
                        >
                          Save Notes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingMeetingId(meeting.id);
                        setNotesText(meeting.notes || "");
                        setDecisionsText(meeting.decisions || "");
                      }}
                      className="text-xs gap-1 text-zinc-500 hover:text-indigo-600"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {meeting.notes ? "Edit Notes" : "+ Add Meeting Notes"}
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              Schedule Collaboration Session
            </h3>

            <form onSubmit={handleScheduleMeeting} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Project</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
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
                <label className="font-semibold block mb-1">Session Title</label>
                <Input
                  type="text"
                  placeholder="e.g. Q4 Go-to-Market Strategy & Syndicate Kickoff"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Description</label>
                <Input
                  type="text"
                  placeholder="Brief description of the call objective"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Duration (Minutes)</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 text-xs"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Meeting Link (Meet, Zoom, or Teams)</label>
                <Input
                  type="url"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx or Zoom link"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Agenda & Talking Points</label>
                <textarea
                  rows={3}
                  placeholder="1. Review sales pipeline metrics&#10;2. Marketing content deliverables&#10;3. Revenue share reconciliation"
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="glow" isLoading={isSubmitting}>
                  Schedule Meeting
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
