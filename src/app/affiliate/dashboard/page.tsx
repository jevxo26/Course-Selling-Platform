"use client";

import React, { useMemo } from "react";
import {
  LayoutDashboard,
  DollarSign,
  Users,
  Activity,
  Copy,
  ExternalLink,
  Loader2,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { useGetAffiliateDashboardQuery } from "@/lib/api/affiliateApi";
import { toast } from "sonner";
import Image from "next/image";

export default function AffiliateDashboard() {
  const { data: stats, isLoading, isError } = useGetAffiliateDashboardQuery();

  const statsList = useMemo(() => {
    if (!stats) return [];
    if (Array.isArray(stats)) return stats;
    if (Array.isArray(stats?.data)) return stats.data;
    if (Array.isArray(stats?.items)) return stats.items;
    return [];
  }, [stats]);

  const totals = useMemo(() => {
    return statsList.reduce(
      (acc: { totalIncome: number; totalSales: number }, item: any) => {
        acc.totalIncome += Number(item.totalIncome) || 0;
        acc.totalSales += Number(item.totalEnrollments) || 0;
        return acc;
      },
      { totalIncome: 0, totalSales: 0 },
    );
  }, [statsList]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Referral link copied!");
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
            <Loader2 className="relative h-12 w-12 animate-spin text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-slate-500">
            Loading your dashboard…
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center space-y-3 max-w-sm mx-auto">
          <div className="inline-flex p-3 rounded-full bg-red-50">
            <Activity className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-red-600 font-bold text-lg">
            Unable to load dashboard
          </p>
          <p className="text-sm text-slate-500">
            Please check your connection or try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-3 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl shadow-lg shadow-blue-500/20">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Affiliate Dashboard
            </h1>
          </div>
          <p className="text-slate-500 ml-14 sm:ml-0 max-w-2xl">
            Track your referrals, copy promotional links, and monitor your
            earnings in real time.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Income */}
          <div className="group relative bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-400 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Total Income
                </p>
                <p className="text-3xl font-black text-slate-900">
                  ৳
                  {totals.totalIncome.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-2xl">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
              All-time commissions earned
            </div>
          </div>

          {/* Total Referrals */}
          <div className="group relative bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-400 to-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Total Referrals
                </p>
                <p className="text-3xl font-black text-slate-900">
                  {totals.totalSales.toLocaleString()}
                </p>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-2xl">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-blue-600">
              <Users className="h-3.5 w-3.5" />
              Successful student enrollments
            </div>
          </div>

          {/* Promotable Courses */}
          <div className="group relative bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-400 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Promotable Courses
                </p>
                <p className="text-3xl font-black text-slate-900">
                  {statsList.length}
                </p>
              </div>
              <div className="p-2.5 bg-indigo-50 rounded-2xl">
                <BookOpen className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-indigo-600">
              <Activity className="h-3.5 w-3.5" />
              Published courses available for promotion
            </div>
          </div>
        </div>

        {/* Campaigns Table / Card List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-black text-slate-900">
                  Your Promotional Campaigns
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Share referral links with your audience and earn commissions.
              </p>
            </div>
            {statsList.length > 0 && (
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {statsList.length} courses
              </span>
            )}
          </div>

          {statsList.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex p-4 rounded-full bg-slate-100 mb-4">
                <BookOpen className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">
                No courses available for promotion yet.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Once courses are assigned, they will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {[
                        "Course",
                        "Price",
                        "Referrals",
                        "Earnings",
                        "Referral Link",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="py-3 px-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {statsList.map((item: any) => (
                      <tr
                        key={item.courseId}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-20 relative rounded-xl bg-slate-100 overflow-hidden shrink-0">
                              {item.courseThumbnail ? (
                                <Image
                                  src={item.courseThumbnail}
                                  alt={item.courseTitle}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                                  NO IMG
                                </div>
                              )}
                            </div>
                            <span className="font-bold text-slate-900 truncate max-w-[200px]">
                              {item.courseTitle}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm font-bold text-slate-700">
                          ৳{Number(item.price).toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-sm font-black text-slate-900">
                          {item.totalEnrollments}
                        </td>
                        <td className="py-4 px-4 text-sm font-bold text-emerald-600">
                          ৳{Number(item.totalIncome).toFixed(2)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-600 max-w-[180px] truncate select-all">
                              {item.affiliateLink}
                            </div>
                            <button
                              onClick={() =>
                                copyToClipboard(item.affiliateLink)
                              }
                              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
                              title="Copy Link"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden space-y-4">
                {statsList.map((item: any) => (
                  <div
                    key={item.courseId}
                    className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm"
                  >
                    <div className="flex gap-3 mb-3">
                      <div className="h-14 w-24 relative rounded-xl bg-slate-100 overflow-hidden shrink-0">
                        {item.courseThumbnail ? (
                          <Image
                            src={item.courseThumbnail}
                            alt={item.courseTitle}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                            NO IMG
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 truncate">
                          {item.courseTitle}
                        </h3>
                        <p className="text-sm font-bold text-slate-700 mt-0.5">
                          ৳{Number(item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="bg-slate-50 rounded-xl p-2.5">
                        <p className="text-slate-400 font-medium">Referrals</p>
                        <p className="font-black text-slate-900">
                          {item.totalEnrollments}
                        </p>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-2.5">
                        <p className="text-slate-400 font-medium">Earnings</p>
                        <p className="font-black text-emerald-600">
                          ৳{Number(item.totalIncome).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 flex-1 truncate select-all">
                        {item.affiliateLink}
                      </div>
                      <button
                        onClick={() => copyToClipboard(item.affiliateLink)}
                        className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        title="Copy Link"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
