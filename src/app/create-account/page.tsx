"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Sparkles, ArrowRight, ShieldCheck, Users, Briefcase } from "lucide-react";

export default function CreateAccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [intent, setIntent] = useState<"owner" | "professional" | "both">("professional");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, intent }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast({
        title: "Account Created!",
        message: `Welcome to OpenSource, ${data.user.name}.`,
        type: "success",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      toast({ title: "Registration Error", message: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
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
            Create Your Account
          </h1>
          <p className="text-xs text-zinc-500">
            Start collaborating on commercial growth campaigns today.
          </p>
        </div>

        <Card>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4 pt-6">
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Jordan Miller"
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
                  placeholder="jordan@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  Password (minimum 8 characters)
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Primary Intent (Non-exclusive)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setIntent("professional")}
                    className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                      intent === "professional"
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Professional
                  </button>
                  <button
                    type="button"
                    onClick={() => setIntent("owner")}
                    className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                      intent === "owner"
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Product Owner
                  </button>
                  <button
                    type="button"
                    onClick={() => setIntent("both")}
                    className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                      intent === "both"
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Both
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="glow"
                className="w-full gap-2 text-sm font-semibold"
                isLoading={isLoading}
              >
                Create Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </form>
        </Card>

        <p className="text-center text-xs text-zinc-500">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
