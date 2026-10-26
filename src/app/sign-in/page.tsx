"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      toast({
        title: "Welcome back!",
        message: `Signed in as ${data.user.name}.`,
        type: "success",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      toast({ title: "Sign In Error", message: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoUser = (userEmail: string) => {
    setEmail(userEmail);
    setPassword("Password123!");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-100">
              Open<span className="text-indigo-600 dark:text-indigo-400">Source</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Sign In to OpenSource
          </h1>
          <p className="text-xs text-zinc-500">
            Access your collaborative products, teams, and commission earnings.
          </p>
        </div>

        <Card>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-6">
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

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="glow"
                className="w-full gap-2 text-sm font-semibold"
                isLoading={isLoading}
              >
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </form>

          {/* Quick Demo Logins */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-xl space-y-2">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
              1-Click Demo Credentials:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoUser("sarah.chen@cloudscale.io")}
                className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 transition-all text-center"
              >
                Product Owner
              </button>
              <button
                type="button"
                onClick={() => setDemoUser("elena.rostova@hypergrowth.syndicate")}
                className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 transition-all text-center"
              >
                Professional
              </button>
              <button
                type="button"
                onClick={() => setDemoUser("admin@opensource.platform")}
                className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 transition-all text-center"
              >
                Admin
              </button>
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-zinc-500">
          Don't have an account?{" "}
          <Link href="/create-account" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
