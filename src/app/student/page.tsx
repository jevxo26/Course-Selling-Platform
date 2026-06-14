"use client";

import React from "react";
import { useGetStudentDashboardStatsQuery } from "@/lib/api/statsApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  RiArrowUpLine,
  RiArrowRightLine,
  RiSparklingFill,
} from "react-icons/ri";
import { LuCalendarDays } from "react-icons/lu";
import {
  TbTrendingUp,
  TbShoppingBag,
  TbBuildingBank,
  TbWallet,
  TbUsersGroup,
  TbBooks,
  TbChartBar,
  TbRocket,
  TbSparkles,
} from "react-icons/tb";

/* ─────────────────────────────────────────────
   Icon resolver for activity list
───────────────────────────────────────────── */
const getIcon = (iconName: string) => {
  switch (iconName) {
    case "TrendingUp":
      return TbTrendingUp;
    case "ShoppingBag":
      return TbShoppingBag;
    case "Landmark":
      return TbBuildingBank;
    default:
      return TbTrendingUp;
  }
};

/* ─────────────────────────────────────────────
   Skeleton – forced white background
───────────────────────────────────────────── */
const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={`rounded-2xl bg-slate-100 dark:bg-white animate-pulse ${
      className ?? ""
    }`}
  />
);

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function StudentDashboardPage() {
  /* Single shared API call */
  const { data, isLoading } = useGetStudentDashboardStatsQuery();
  const authUser = useSelector((state: RootState) => state.auth.user);

  const displayName =
    String(
      authUser?.name ?? authUser?.fullName ?? authUser?.username ?? "",
    ).trim() || "Student";
  const firstName = displayName.split(" ")[0];

  const progressData = data?.progressData ?? {
    percentage: 0,
    label: "No Active Courses",
    status: "Enroll to start learning!",
  };

  const stats = data?.dashboardStats ?? {
    currentBalance: {
      amount: 0,
      currency: "USD",
      percentageChange: 0,
      label: "CURRENT WALLET BALANCE",
    },
    affiliateEarnings: {
      amount: 0,
      currency: "USD",
      lifetime: true,
      nextPayoutDate: "End of Month",
      label: "TOTAL AFFILIATE EARNINGS",
    },
    coursesEnrolled: {
      activeModules: 0,
      label: "TOTAL COURSES ENROLLED",
      subtext: "Total active courses",
    },
  };

  const activities = data?.activities ?? [];
  const continueLearning = data?.continueLearning ?? {
    title: "Explore our courses",
    module: "Visit the store to start learning.",
    progress: 0,
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-white dark:bg-white pb-10 p-3 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-[160px]" />
          <Skeleton className="h-[160px]" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-[140px]" />
          <Skeleton className="h-[140px]" />
          <Skeleton className="h-[140px]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-4">
          <Skeleton className="h-[280px]" />
          <Skeleton className="h-[280px]" />
        </div>
      </div>
    );
  }

  /* ── Full render ── */
  return (
    <div className="w-full min-h-screen bg-white dark:bg-white pb-12 p-3 sm:p-5 space-y-4">
      {/* ══════════════════════════════════════
          SECTION 1 — HERO ROW
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Welcome card – slightly thicker border */}
        <div className="relative bg-white dark:bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 overflow-hidden group hover:shadow-lg hover:shadow-slate-200/60 hover:border-blue-300/60 transition-all duration-300">
          {/* Dot grid texture */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, #4f8ef7 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          {/* Accent glow blob */}
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1 mb-3">
              <RiSparklingFill className="w-3 h-3 text-[#4f8ef7]" />
              <span className="text-[9.5px] font-black tracking-[0.18em] text-[#4f8ef7] uppercase">
                Welcome Back, {firstName}
              </span>
            </div>

            <h1 className="text-[19px] sm:text-[22px] font-black leading-tight text-slate-900 tracking-tight">
              Fueling your journey to{" "}
              <span className="relative inline-block text-[#4f8ef7]">
                precision prosperity.
                <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-gradient-to-r from-[#4f8ef7] to-transparent rounded-full" />
              </span>
            </h1>

            <p className="text-slate-400 mt-3 text-[11.5px] leading-relaxed font-medium">
              Track your progress, manage your earnings, and expand your
              portfolio from your personal hub.
            </p>

            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Active Account
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 text-slate-500 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200">
                <TbChartBar className="w-3 h-3" />
                Student Dashboard
              </div>
            </div>
          </div>
        </div>

        {/* Progress card – no border change (gradient) */}
        <div className="relative bg-gradient-to-br from-[#4f8ef7] to-[#2c6ce8] text-white rounded-2xl p-5 sm:p-6 overflow-hidden shadow-xl shadow-blue-400/25 group hover:shadow-blue-500/35 transition-all duration-300">
          {/* Orbs */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/15 transition-all" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full -ml-14 -mb-14 blur-2xl" />
          <div className="absolute top-1/2 right-8 w-20 h-20 bg-white/5 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col h-full gap-4">
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[9.5px] font-black tracking-[0.18em] text-white/60 uppercase mb-1">
                  Course Progress
                </p>
                <h2 className="text-[14px] sm:text-[15px] font-black leading-tight text-white">
                  {progressData.label}
                </h2>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-black bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/25">
                  {progressData.percentage}% Done
                </span>
              </div>
            </div>

            <p className="text-[11px] text-white/70 leading-relaxed -mt-1">
              {progressData.status} Keep going — you&apos;ve completed{" "}
              <span className="font-black text-white">
                {progressData.percentage}%
              </span>{" "}
              of your goal.
            </p>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="relative bg-white/20 w-full h-2 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 bg-gradient-to-r from-[#4ADE80] to-[#22c55e] h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(74,222,128,0.7)]"
                  style={{ width: `${progressData.percentage}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => alert("Loading growth analytics...")}
              className="flex items-center gap-2 w-full sm:w-auto self-start bg-white text-[#4f8ef7] font-black px-5 py-2 rounded-xl hover:bg-blue-50 active:scale-95 transition-all text-[10.5px] uppercase tracking-widest shadow-md"
            >
              <TbChartBar className="w-3.5 h-3.5" />
              View Your Growth
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          SECTION 2 — STATS GRID (forced white bg, better borders)
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {/* ── Card 1: Wallet Balance ── */}
        <div className="relative bg-white dark:bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-5 overflow-hidden group hover:shadow-lg hover:shadow-blue-100/60 hover:border-blue-300/60 transition-all duration-300">
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-70 pointer-events-none" />

          {/* Icon badge */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <TbWallet className="w-4 h-4 sm:w-5 sm:h-5 text-[#4f8ef7]" />
          </div>

          <p className="text-[8.5px] sm:text-[9px] uppercase tracking-[0.16em] font-black text-slate-400">
            {stats.currentBalance.label}
          </p>

          <div className="flex items-baseline gap-1.5 mt-1.5">
            <h2 className="text-[20px] sm:text-[26px] font-black text-slate-900 leading-none tracking-tight">
              ৳{stats.currentBalance.amount.toLocaleString()}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-0.5 text-emerald-600 text-[9.5px] font-black bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
              <RiArrowUpLine className="w-2.5 h-2.5" />
              {stats.currentBalance.percentageChange}%
            </div>
            <span className="text-[9px] text-slate-400 font-medium">
              vs last month
            </span>
          </div>

          <button className="mt-3 sm:mt-4 bg-[#4f8ef7] hover:bg-[#3d7ef0] text-white text-[9.5px] sm:text-[10.5px] font-black px-3 py-1.5 sm:py-2 rounded-xl w-full transition-all active:scale-95 shadow-sm shadow-blue-400/25 tracking-wide">
            Withdraw Funds
          </button>
        </div>

        {/* ── Card 2: Affiliate Earnings ── */}
        <div className="relative bg-white dark:bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-5 overflow-hidden group hover:shadow-lg hover:shadow-emerald-100/60 hover:border-emerald-300/60 transition-all duration-300">
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl opacity-70 pointer-events-none" />

          {/* Icon badge */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <TbUsersGroup className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          </div>

          <p className="text-[8.5px] sm:text-[9px] uppercase tracking-[0.16em] font-black text-slate-400">
            {stats.affiliateEarnings.label}
          </p>

          <div className="flex items-baseline gap-1.5 mt-1.5">
            <h2 className="text-[20px] sm:text-[26px] font-black text-slate-900 leading-none tracking-tight">
              ৳{stats.affiliateEarnings.amount.toLocaleString()}
            </h2>
          </div>

          <div className="mt-2">
            <span className="text-emerald-600 text-[9.5px] font-black bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
              Lifetime Total
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-3 sm:mt-4 text-[9.5px] sm:text-[10px] text-slate-500 font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <LuCalendarDays className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 text-slate-400" />
            <span>
              Payout:{" "}
              <span className="font-black text-slate-700">
                {stats.affiliateEarnings.nextPayoutDate}
              </span>
            </span>
          </div>
        </div>

        {/* ── Card 3: Courses Enrolled ── */}
        <div className="relative bg-white dark:bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-5 overflow-hidden group hover:shadow-lg hover:shadow-indigo-100/60 hover:border-indigo-300/60 transition-all duration-300">
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-70 pointer-events-none" />

          {/* Icon badge */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <TbBooks className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
          </div>

          <p className="text-[8.5px] sm:text-[9px] uppercase tracking-[0.16em] font-black text-slate-400">
            {stats.coursesEnrolled.label}
          </p>

          <div className="flex items-baseline gap-1.5 mt-1.5">
            <h2 className="text-[20px] sm:text-[26px] font-black text-slate-900 leading-none tracking-tight">
              {stats.coursesEnrolled.activeModules}
            </h2>
            <span className="text-slate-400 text-[10px] sm:text-[11px] font-bold">
              Modules
            </span>
          </div>

          <div className="mt-2">
            <span className="text-indigo-500 text-[9.5px] font-black bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-full">
              Active Modules
            </span>
          </div>

          <div className="flex items-center gap-2 mt-3 sm:mt-4">
            <div className="flex -space-x-1.5">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 border-2 border-white overflow-hidden flex-shrink-0"
                >
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 20}`}
                    alt="User"
                    className="w-full h-full"
                  />
                </div>
              ))}
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-[7.5px] sm:text-[8px] font-black text-indigo-500 flex-shrink-0">
                +10
              </div>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">
              {stats.coursesEnrolled.subtext}
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          SECTION 3 — ACTIVITY + CONTINUE LEARNING
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-4">
        {/* Recent Activity – better border */}
        <div className="bg-white dark:bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[14px] sm:text-[15px] font-black text-slate-900 tracking-tight">
                Recent Activity
              </h2>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Your latest transactions & events
              </p>
            </div>
            <button className="flex items-center gap-1 text-[#4f8ef7] text-[9.5px] font-black hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-all uppercase tracking-wider">
              View All →
            </button>
          </div>

          <div className="space-y-2">
            {activities.length === 0 ? (
              <div className="text-center text-slate-400 text-[12px] py-10 bg-slate-50 border border-slate-200 rounded-xl">
                <TbSparkles className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                No recent activity yet.
              </div>
            ) : (
              activities.map((activity: any) => {
                const Icon = getIcon(activity.icon);
                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between bg-slate-50/80 border border-slate-100 hover:border-blue-200/60 rounded-xl px-3 py-2.5 transition-all duration-200 group cursor-default"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center ${activity.iconBg} flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${activity.iconColor}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[11px] sm:text-[12px] font-black text-slate-800 truncate">
                          {activity.title}
                        </h3>
                        <p className="text-[9.5px] sm:text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                          {activity.subtitle}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-[12px] sm:text-[13px] font-black shrink-0 ml-2 ${
                        activity.type === "income"
                          ? "text-emerald-600"
                          : "text-rose-500"
                      }`}
                    >
                      {activity.amount}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Continue Learning – gradient, no border change */}
        <div className="relative bg-gradient-to-br from-[#4f8ef7] to-[#2c6ce8] rounded-2xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-xl shadow-blue-400/20 group hover:shadow-blue-500/30 transition-all duration-300 min-h-[240px]">
          {/* Orbs */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/15 transition-all" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-2xl" />
          <div className="absolute top-1/2 right-4 w-16 h-16 bg-white/5 rounded-full blur-xl" />

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <TbRocket className="w-3.5 h-3.5 text-white/70" />
                <p className="text-[9px] font-black tracking-[0.18em] text-white/60 uppercase">
                  Keep Growing
                </p>
              </div>
              <h2 className="text-[15px] sm:text-[16px] font-black text-white tracking-tight">
                Continue Learning
              </h2>
            </div>
          </div>

          <div className="relative z-10 mt-auto pt-4">
            <h3 className="text-[19px] sm:text-[23px] font-black text-white leading-tight tracking-tight">
              {continueLearning.title}
            </h3>
            <p className="text-white/65 text-[11px] mt-2 leading-relaxed font-medium">
              {continueLearning.module}
            </p>

            <div className="flex items-center justify-between mt-5 gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-white/75 font-black text-[9.5px] uppercase tracking-widest">
                    Progress
                  </p>
                  <p className="text-white font-black text-[10px]">
                    {continueLearning.progress}%
                  </p>
                </div>
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#4ADE80] to-[#22c55e] rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(74,222,128,0.6)]"
                    style={{ width: `${continueLearning.progress}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => alert("Redirecting to course player...")}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center hover:bg-blue-50 active:scale-90 transition-all shadow-lg flex-shrink-0 group/btn"
              >
                <RiArrowRightLine className="w-4 h-4 sm:w-5 sm:h-5 text-[#4f8ef7] group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
