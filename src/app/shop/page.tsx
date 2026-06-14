"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { type Category } from "@/lib/courses";
import {
  useGetShopItemsQuery,
  useBuyShopItemMutation,
} from "@/lib/api/shopApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { toast } from "sonner";
import {
  ArrowRight,
  BadgeCheck,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";

export default function ShopPage() {
  type CategoryFilter = "All" | Category;

  const { data: shopData, isLoading } = useGetShopItemsQuery({
    page: 1,
    limit: 100,
  });
  const [buyShopItem, { isLoading: isBuying }] = useBuyShopItemMutation();
  const authUser = useSelector((state: RootState) => state.auth.user);

  const handleBuy = async (shopId: number, price: number) => {
    if (!authUser) {
      toast.error("Please login to purchase");
      return;
    }
    try {
      const res = await buyShopItem({
        userId: authUser.id,
        shopId: shopId,
        amount: price,
      }).unwrap();
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to initiate payment");
    }
  };

  const shopItems = useMemo(() => {
    const rawItems = shopData?.items || [];
    return rawItems.map((c: any) => ({
      id: c.id,
      title: c.name ?? "Untitled Shop Item",
      desc: c.gmail ?? "Digital Asset",
      image: c.logo ?? "/placeholder.jpg",
      price: Number(c.price ?? 0),
      category: "Digital Asset",
      rating: 4.9,
      reviews: "1k+",
      earnings: "High Potential",
    }));
  }, [shopData]);

  const filters = useMemo<CategoryFilter[]>(() => {
    return ["All", "Digital Asset"] as CategoryFilter[];
  }, []);

  const [query, setQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");

  const filteredCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shopItems.filter((c) => {
      if (activeCategory !== "All" && c.category !== activeCategory)
        return false;
      if (!q) return true;
      const haystack = `${c.title} ${c.desc} ${c.category}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [activeCategory, query, shopItems]);

  const popularCourses = useMemo(() => {
    return [...shopItems].sort((a, b) => b.rating - a.rating).slice(0, 3);
  }, [shopItems]);

  return (
    <div className="min-h-screen bg-slate-50 mt-10 font-sans">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-[760px] rounded-full bg-blue-100/70 blur-[90px]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black tracking-widest text-blue-700 uppercase">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified Marketplace
              </div>
              <h1 className="mt-4 text-[1.7rem] sm:text-[2.1rem] font-black tracking-tight text-slate-900 leading-[1.1]">
                Shop Products & Digital Assets
                <span className="text-blue-600"> built to earn.</span>
              </h1>
              <p className="mt-3 text-[13px] text-slate-600 leading-relaxed max-w-xl">
                Pick a course, learn the system, and ship outcomes. Instant
                access, lifetime updates, and secure checkout.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-white text-[12px] font-black shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all"
                >
                  Browse Courses <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/shop/shopArchitect"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-slate-900 text-[12px] font-black hover:bg-slate-50 active:scale-[0.98] transition-all"
                >
                  Explore Toolkit
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { k: "Instant Access", v: "Start in 60 seconds" },
                  { k: "Lifetime Updates", v: "New modules included" },
                  { k: "Secure Checkout", v: "Encrypted payments" },
                ].map((x) => (
                  <div
                    key={x.k}
                    className="rounded-2xl border border-slate-200 bg-white p-3.5"
                  >
                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      {x.k}
                    </p>
                    <p className="mt-1 text-[12px] font-bold text-slate-800">
                      {x.v}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-5 sm:p-6 shadow-xl shadow-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    Popular Right Now
                  </p>
                  <h2 className="mt-1.5 text-[17px] font-black text-white">
                    Top-rated picks
                  </h2>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black tracking-widest text-white">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-300" />
                  Trusted
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {popularCourses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleBuy(c.id, c.price)}
                    className="cursor-pointer block rounded-2xl border border-white/10 bg-white/5 p-3.5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black tracking-widest text-blue-300 uppercase">
                          {c.category}
                        </p>
                        <p className="mt-1 text-[13px] font-black text-white truncate">
                          {c.title}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-300">
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-amber-300" />
                            <span className="font-bold text-white">
                              {c.rating}
                            </span>
                          </span>
                          <span className="text-slate-400">
                            ({c.reviews} reviews)
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                          Price
                        </p>
                        <p className="mt-1 text-[15px] font-black text-white">
                          ৳{c.price.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-[16px] sm:text-[18px] font-black text-slate-900">
              Products
            </h2>
            <p className="mt-0.5 text-[12px] text-slate-500 font-medium">
              Filter by category or search by title.
            </p>
          </div>
          <div className="w-full sm:w-[360px]">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full bg-transparent text-[12px] font-semibold text-slate-700 placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = f === activeCategory;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setActiveCategory(f)}
                className={
                  active
                    ? "rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-black text-white shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
                    : "rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[11px] font-black text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all"
                }
              >
                {f}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((c) => (
            <div
              key={c.id}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:shadow-slate-200 transition-shadow"
            >
              <div className="relative h-[175px] bg-slate-100 overflow-hidden">
                <img
                  src={c.image}
                  alt={c.title}
                  className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-slate-900/0 to-slate-900/0" />
                <div className="absolute left-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black tracking-widest text-slate-900 uppercase">
                  {c.category}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[13px] font-black text-slate-900 leading-snug">
                    {c.title}
                  </h3>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Price
                    </p>
                    <p className="mt-0.5 text-[15px] font-black text-blue-600">
                      ৳{c.price.toFixed(0)}
                    </p>
                  </div>
                </div>

                <p className="mt-2 text-[12px] text-slate-600 leading-relaxed line-clamp-2">
                  {c.desc}
                </p>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-500" />
                      <span className="font-black text-slate-900">
                        {c.rating}
                      </span>
                    </span>
                    <span className="text-slate-400">
                      ({c.reviews} reviews)
                    </span>
                  </div>
                  <div className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                    {c.earnings}
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => handleBuy(c.id, c.price)}
                    disabled={isBuying}
                    className="w-full inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-[12px] font-black text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isBuying ? "Processing..." : "Buy Now"}
                  </button>
                </div>

                <p className="mt-3 text-[10px] text-slate-400 font-semibold">
                  30-day money-back guarantee · Lifetime access
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-[13px] font-black text-slate-900">
              No Products found.
            </p>
            <p className="mt-1 text-[12px] text-slate-500 font-medium">
              Try a different keyword or category.
            </p>
          </div>
        )}
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-[17px] font-black text-slate-900">
                Want templates, tools, and software?
              </h3>
              <p className="mt-2 text-[13px] text-slate-600 leading-relaxed">
                Explore the Digital Toolkit store for software and assets built
                for creators and high-ticket operators.
              </p>
              <Link
                href="/shop/shopArchitect"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-white text-[12px] font-black shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all"
              >
                Open Toolkit <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="text-[17px] font-black text-slate-900">FAQ</h3>
              <div className="mt-3 space-y-2.5">
                {[
                  {
                    q: "How do I access the course after purchase?",
                    a: "Right after payment you can open your student dashboard and see the course in your courses area.",
                  },
                  {
                    q: "Do I get lifetime access?",
                    a: "Yes. Your purchase includes lifetime access and future updates for the course.",
                  },
                  {
                    q: "Is there a refund policy?",
                    a: "Yes. We offer a 30-day money-back guarantee if the course is not a fit.",
                  },
                ].map((x) => (
                  <details
                    key={x.q}
                    className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5"
                  >
                    <summary className="cursor-pointer list-none text-[12px] font-black text-slate-900 flex items-center justify-between gap-4">
                      <span>{x.q}</span>
                      <span className="text-slate-400 group-open:rotate-180 transition-transform">
                        <ArrowRight className="h-3.5 w-3.5 rotate-90" />
                      </span>
                    </summary>
                    <p className="mt-2 text-[12px] text-slate-600 leading-relaxed font-medium">
                      {x.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
