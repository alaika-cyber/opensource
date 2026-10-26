"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Mail, MessageSquare, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast({ title: "Incomplete Form", message: "Please complete all fields.", type: "error" });
      return;
    }

    setSubmitted(true);
    toast({
      title: "Inquiry Received",
      message: "Thank you for contacting OpenSource. Our compliance team will review your inquiry.",
      type: "success",
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="text-center space-y-3">
        <Badge variant="default">Support & Operations</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Contact OpenSource
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
          Questions regarding platform agreements, partnership inquiries, or dispute escalations.
        </p>
      </div>

      <Card className="p-8">
        {submitted ? (
          <div className="text-center py-12 space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Message Sent
            </h3>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto">
              Your inquiry has been routed to our operations team. We typically respond within 1 business day.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSubmitted(false);
                setMessage("");
              }}
            >
              Send Another Message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  Your Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Elena Rostova"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Subject
              </label>
              <Input
                type="text"
                placeholder="Partnership, Platform Inquiry, or Commercial Terms"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Message Details
              </label>
              <textarea
                rows={5}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe your inquiry..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <Button type="submit" variant="glow" className="w-full">
              Submit Inquiry
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
