"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Calendar,
  ListTodo,
  DollarSign,
  UserPlus,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

interface Props {
  initialNotifications: NotificationItem[];
}

export function NotificationsDashboardClient({ initialNotifications }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast({ title: "Updated", message: "All notifications marked as read.", type: "success" });
    } catch (err: any) {
      toast({ title: "Error", message: err.message, type: "error" });
    }
  };

  const filtered = notifications.filter((n) => (filter === "UNREAD" ? !n.isRead : true));

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "COMMISSION":
      case "SALE":
        return <DollarSign className="h-4 w-4 text-emerald-500" />;
      case "TASK":
        return <ListTodo className="h-4 w-4 text-sky-500" />;
      case "MEETING":
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case "INVITATION":
      case "APPLICATION":
        return <UserPlus className="h-4 w-4 text-indigo-500" />;
      default:
        return <Bell className="h-4 w-4 text-zinc-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Notifications & Alerts
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Stay up to date with project invitations, application reviews, meetings, and deliverables.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkAllRead}
            className="gap-1.5 text-xs self-start sm:self-auto"
          >
            <CheckCheck className="h-4 w-4" />
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === "ALL"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("UNREAD")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === "UNREAD"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Bell className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            No notifications
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            {filter === "UNREAD" ? "You're all caught up!" : "You will receive notifications here as activities occur."}
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                notification.isRead
                  ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                  : "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/40"
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                  {getTypeIcon(notification.type)}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {notification.message}
                  </p>

                  <span className="text-[10px] text-zinc-400 block pt-0.5">
                    {new Date(notification.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-center">
                {notification.linkUrl && (
                  <Link href={notification.linkUrl} onClick={() => handleMarkAsRead(notification.id)}>
                    <Button size="sm" variant="outline" className="text-xs gap-1 h-8">
                      View
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                )}

                {!notification.isRead && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-xs h-8 text-zinc-400 hover:text-zinc-600"
                    title="Mark as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
