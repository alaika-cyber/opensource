"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    toast({
      title: "Recovery Instructions Sent",
      message: "If an account exists for this email, password reset instructions have been issued.",
      type: "success",
    });
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Reset Your Password
          </h1>
          <p className="text-xs text-zinc-500">
            Enter your account email to receive a password recovery link.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {submitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <h4 className="font-semibold text-sm">Check your inbox</h4>
                <p className="text-xs text-zinc-500">
                  We've sent recovery instructions to <strong>{email}</strong>.
                </p>
                <Link href="/sign-in" className="inline-block pt-2">
                  <Button variant="outline" size="sm">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <Button type="submit" variant="glow" className="w-full">
                  Send Recovery Link
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-zinc-500">
          Remember your password?{" "}
          <Link href="/sign-in" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
