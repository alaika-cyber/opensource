import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles, Shield, HeartHandshake, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <Badge variant="default">Our Purpose & Manifesto</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          About OpenSource
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          We believe great software and digital products shouldn't fail simply because building a traditional, salaried in-house sales team is financially out of reach.
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-sm sm:text-base text-zinc-600 dark:text-zinc-400 space-y-6 leading-relaxed">
        <p>
          Throughout the tech world, millions of extraordinary products exist in obscurity. Meanwhile, millions of high-performing independent strategists, marketers, and outbound sales professionals seek high-leverage commercial upside without being locked into conventional 9-to-5 employment.
        </p>
        <p>
          OpenSource exists to bridge this gap. We provide the collaborative infrastructure, tamper-evident agreements, sales attribution, and penny-perfect financial reconciliation to enable sovereign professionals to unite into growth syndicates and grow real businesses together.
        </p>

        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 pt-4">Our Core Principles</h3>
        <ul className="space-y-2 list-disc pl-5">
          <li><strong>No Fake Popularity:</strong> We never fabricate reviews, testimonials, ratings, or sales volume.</li>
          <li><strong>Performance Over Bureaucracy:</strong> Product owners pay only when genuine commercial revenue is created.</li>
          <li><strong>Deterministic Math:</strong> Financial transactions are calculated in integer minor units, preventing rounding drift or hidden fees.</li>
          <li><strong>Tamper-Evident Terms:</strong> Commercial agreements cannot be modified retroactively without mutual consent.</li>
        </ul>
      </div>
    </div>
  );
}
