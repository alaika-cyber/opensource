"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  MessageSquare,
  Send,
  Pin,
  Clock,
  User,
  Users,
  FolderKanban,
  PlusCircle,
  CornerDownRight,
} from "lucide-react";

interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; avatarUrl: string | null };
}

interface DiscussionItem {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  author: { id: string; name: string; avatarUrl: string | null };
  team?: { id: string; name: string } | null;
  comments: CommentItem[];
}

interface Props {
  initialDiscussions: DiscussionItem[];
  userTeams: { id: string; name: string }[];
  currentUserId: string;
}

export function MessagesDashboardClient({
  initialDiscussions,
  userTeams,
  currentUserId,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<DiscussionItem[]>(initialDiscussions);
  const [activeDiscussionId, setActiveDiscussionId] = useState<string | null>(
    initialDiscussions[0]?.id || null
  );

  // New topic state
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(userTeams[0]?.id || "");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // Reply state
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const activeDiscussion = discussions.find((d) => d.id === activeDiscussionId);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !selectedTeamId) return;

    setIsPosting(true);
    try {
      const res = await fetch(`/api/teams/${selectedTeamId}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), content: newContent.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: "Topic Published", message: `"${newTitle}" posted.`, type: "success" });
      setDiscussions((prev) => [data.discussion, ...prev]);
      setActiveDiscussionId(data.discussion.id);
      setNewTitle("");
      setNewContent("");
      setShowNewTopic(false);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Posting Error", message: err.message, type: "error" });
    } finally {
      setIsPosting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeDiscussion || !activeDiscussion.team?.id) return;

    setIsReplying(true);
    try {
      const res = await fetch(`/api/teams/${activeDiscussion.team.id}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "comment",
          discussionId: activeDiscussion.id,
          content: replyText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Append reply locally
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === activeDiscussion.id
            ? { ...d, comments: [...d.comments, data.comment] }
            : d
        )
      );

      setReplyText("");
    } catch (err: any) {
      toast({ title: "Reply Error", message: err.message, type: "error" });
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Messages & Team Discussions
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Collaborate on sprint objectives, strategy channels, and project execution threads.
          </p>
        </div>

        {userTeams.length > 0 && (
          <Button
            size="sm"
            variant="default"
            onClick={() => setShowNewTopic(true)}
            className="gap-1.5 text-xs self-start sm:self-auto"
          >
            <PlusCircle className="h-4 w-4" />
            New Discussion
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[500px]">
        {/* Discussion Channels Sidebar */}
        <div className="md:col-span-4 space-y-2">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1 block">
            Channels & Threads ({discussions.length})
          </span>

          {discussions.length === 0 ? (
            <Card className="p-6 text-center text-xs text-zinc-500 border-dashed">
              No active discussions yet.
            </Card>
          ) : (
            <div className="space-y-1.5">
              {discussions.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setActiveDiscussionId(d.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs space-y-1 ${
                    activeDiscussionId === d.id
                      ? "border-indigo-600/40 bg-indigo-50/60 dark:bg-indigo-950/40"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">
                      {d.title}
                    </span>
                    {d.isPinned && <Pin className="h-3 w-3 text-indigo-500 fill-indigo-500 shrink-0" />}
                  </div>

                  <p className="text-zinc-500 text-[11px] line-clamp-1">{d.content}</p>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                    <span>{d.team?.name || "Workspace"}</span>
                    <span>{d.comments.length} replies</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active Discussion Thread & Replies */}
        <div className="md:col-span-8 flex flex-col">
          {activeDiscussion ? (
            <Card className="flex-1 flex flex-col justify-between p-6">
              <div className="space-y-6">
                {/* Thread Header */}
                <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {activeDiscussion.team?.name || "General Syndicate"}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {new Date(activeDiscussion.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {activeDiscussion.title}
                  </h2>

                  <div className="flex items-center gap-2 pt-1">
                    <div className="h-6 w-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      {activeDiscussion.author.name.charAt(0)}
                    </div>
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {activeDiscussion.author.name}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line pt-2">
                    {activeDiscussion.content}
                  </p>
                </div>

                {/* Thread Comments */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Thread Replies ({activeDiscussion.comments.length})
                  </h4>

                  {activeDiscussion.comments.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">No replies yet. Start the conversation below.</p>
                  ) : (
                    <div className="space-y-3">
                      {activeDiscussion.comments.map((c) => (
                        <div
                          key={c.id}
                          className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {c.author.name}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {new Date(c.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                            {c.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="pt-6 border-t border-zinc-100 dark:border-zinc-800 mt-6 flex gap-2">
                <Input
                  type="text"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="text-xs h-10"
                />
                <Button type="submit" size="sm" variant="default" isLoading={isReplying} className="shrink-0 gap-1.5">
                  <Send className="h-3.5 w-3.5" />
                  Reply
                </Button>
              </form>
            </Card>
          ) : (
            <Card className="flex-1 flex items-center justify-center p-12 text-center text-xs text-zinc-400 border-dashed">
              Select a discussion on the left or create a new topic.
            </Card>
          )}
        </div>
      </div>

      {/* New Topic Modal */}
      {showNewTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-500" />
              Start New Team Discussion
            </h3>

            <form onSubmit={handleCreateTopic} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Team Workspace</label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 text-xs"
                  required
                >
                  {userTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Discussion Subject</label>
                <Input
                  type="text"
                  placeholder="e.g. Inbound Lead Nurturing Strategy for Enterprise Tier"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Content / Message</label>
                <textarea
                  rows={4}
                  placeholder="Share ideas, proposals, questions, or campaign announcements..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewTopic(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="glow" isLoading={isPosting}>
                  Post Topic
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
