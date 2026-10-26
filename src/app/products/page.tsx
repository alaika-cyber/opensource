import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatCents, formatBps } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, ArrowRight, ShieldCheck, Tag } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categoryFilter = params.category || "All";
  const searchQuery = params.search || "";

  const where: Record<string, unknown> = {
    status: "ACTIVE",
  };

  if (categoryFilter !== "All") {
    where.category = categoryFilter;
  }

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { shortDesc: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const products = await db.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      owner: true,
      opportunities: {
        where: { isOpen: true },
      },
    },
  });

  const categories = ["All", "Developer Tools", "AI Tools", "SaaS & Software", "Digital Downloads"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="max-w-3xl mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Product Marketplace
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
          Discover verified commercial opportunities. Partner with innovators, review transparent commission pools, and assemble your syndicate.
        </p>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = categoryFilter === cat;
            return (
              <Link
                key={cat}
                href={cat === "All" ? "/products" : `/products?category=${encodeURIComponent(cat)}`}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        <form action="/products" method="GET" className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Search products & tags..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <p className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
            No products match your criteria
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Try adjusting your search query or category filter.
          </p>
          <Link href="/products" className="inline-block mt-4">
            <Button variant="outline" size="sm">
              Clear Filters
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
              <CardHeader>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="secondary">{product.category}</Badge>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {formatBps(product.commissionRateBps)} Commission Pool
                  </span>
                </div>
                <CardTitle className="text-lg">
                  <Link href={`/products/${product.slug}`} className="hover:text-indigo-600 transition-colors">
                    {product.name}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {product.shortDesc}
                </CardDescription>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {product.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="inline-flex items-center text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              </CardHeader>

              <CardFooter className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-400 block">Product Price</span>
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {formatCents(product.priceCents, product.currency)}
                  </span>
                </div>
                <Link href={`/products/${product.slug}`}>
                  <Button size="sm" variant="default" className="gap-1.5 text-xs">
                    View Details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
