"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Cookie, CheckCircle2 } from "lucide-react";

export default function CookiePreferencesPage() {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const handleSave = () => {
    localStorage.setItem("opensource_cookie_consent", JSON.stringify({ analytics, marketing }));
    toast({
      title: "Preferences Saved",
      message: "Your cookie preferences have been updated.",
      type: "success",
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div>
        <Badge variant="default" className="mb-2">Privacy Controls</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">
          Cookie & Storage Preferences
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
          Manage how OpenSource utilizes local browser storage and session cookies. Essential session cookies required for authentication and security cannot be deactivated.
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Essential Session Cookies</h4>
            <p className="text-xs text-zinc-500 mt-0.5">Required for secure authentication, session persistence, and CSRF protection.</p>
          </div>
          <Badge variant="secondary">Always Active</Badge>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Anonymous Performance Telemetry</h4>
            <p className="text-xs text-zinc-500 mt-0.5">Assists our engineering team in identifying platform latency and query bottlenecks.</p>
          </div>
          <input
            type="checkbox"
            checked={analytics}
            onChange={(e) => setAnalytics(e.target.checked)}
            className="h-5 w-5 accent-indigo-600 rounded"
          />
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Attribution Parameters</h4>
            <p className="text-xs text-zinc-500 mt-0.5">Preserves referral tracking codes across browser sessions for qualifying team commissions.</p>
          </div>
          <input
            type="checkbox"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            className="h-5 w-5 accent-indigo-600 rounded"
          />
        </Card>
      </div>

      <Button onClick={handleSave} variant="glow" className="w-full">
        Save Preferences
      </Button>
    </div>
  );
}
