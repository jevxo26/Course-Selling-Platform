"use client";

import React, { useMemo } from "react";
import {
  Loader2,
  Wallet,
  Clock,
  TrendingUp,
  CreditCard,
  AlertCircle,
  ArrowDownToLine,
  CheckCircle2,
  XCircle,
  Clock3,
} from "lucide-react";
import {
  useGetAffiliateWalletQuery,
  useGetAffiliateWithdrawalsQuery,
} from "@/lib/api/affiliateApi";

export default function AffiliateWalletPage() {
  const {
    data: walletData,
    isLoading: walletLoading,
    isError: walletError,
  } = useGetAffiliateWalletQuery();
  const {
    data: withdrawData,
    isLoading: withdrawLoading,
    isError: withdrawError,
  } = useGetAffiliateWithdrawalsQuery();

  const balance =
    walletData?.balance !== undefined ? Number(walletData.balance) : 0;

  // ── Compute pending / completed totals ──
  const withdrawStats = useMemo(() => {
    if (!withdrawData) return { pending: 0, completed: 0 };

    let list: any[] = [];
    if (Array.isArray(withdrawData)) list = withdrawData;
    else if (Array.isArray(withdrawData?.items)) list = withdrawData.items;
    else if (Array.isArray(withdrawData?.data)) list = withdrawData.data;

    return list.reduce(
      (acc, item: any) => {
        const amt = Number(item.totalAmount ?? item.amount) || 0;
        const status = String(item.status).toLowerCase();
        if (status === "pending" || status === "processing") {
          acc.pending += amt;
        } else if (
          status === "approved" ||
          status === "completed" ||
          status === "paid"
        ) {
          acc.completed += amt;
        }
        return acc;
      },
      { pending: 0, completed: 0 },
    );
  }, [withdrawData]);

  // ── Activity list ──
  const activities = useMemo(() => {
    if (!withdrawData) return [];
    let list: any[] = [];
    if (Array.isArray(withdrawData)) list = withdrawData;
    else if (Array.isArray(withdrawData?.items)) list = withdrawData.items;
    else if (Array.isArray(withdrawData?.data)) list = withdrawData.data;
    return list;
  }, [withdrawData]);

  // ── Loading state ──
  if (walletLoading || withdrawLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
            <Loader2 className="relative h-12 w-12 animate-spin text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-slate-500">
            Loading wallet data…
          </p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (walletError || withdrawError) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center space-y-3 max-w-sm mx-auto">
          <div className="inline-flex p-3 rounded-full bg-red-50">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-red-600 font-bold text-lg">
            Failed to load wallet
          </p>
          <p className="text-sm text-slate-500">
            Please check your connection or try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white  p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ── Header ── */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              My Wallet
            </h1>
          </div>
          <p className="text-slate-500 ml-0 sm:ml-14 max-w-2xl">
            Manage your affiliate earnings, view balances, and track
            withdrawals.
          </p>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Available Balance (gradient card) */}
          <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-blue-500/20 overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
              <div>
                <div className="flex items-center gap-2 text-blue-100">
                  <Wallet className="w-4 h-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    Available Balance
                  </p>
                </div>
                <p className="text-3xl sm:text-4xl font-black tracking-tight mt-3 leading-none">
                  ৳
                  {balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-blue-200 text-[11px] font-semibold mt-2">
                <ArrowDownToLine className="h-3.5 w-3.5" />
                Ready for instant withdrawal
              </div>
            </div>
          </div>

          {/* Pending Withdrawals */}
          <div className="group relative bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-400 to-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            <div className="flex flex-col justify-between h-full min-h-[160px]">
              <div>
                <div className="flex items-center gap-2 text-amber-500">
                  <Clock3 className="h-4 w-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Pending Withdrawals
                  </p>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 leading-none">
                  ৳
                  {withdrawStats.pending.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 mt-2">
                Awaiting admin approval
              </p>
            </div>
          </div>

          {/* Completed Withdrawals */}
          <div className="group relative bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-400 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            <div className="flex flex-col justify-between h-full min-h-[160px]">
              <div>
                <div className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Withdrawn Earnings
                  </p>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 leading-none">
                  ৳
                  {withdrawStats.completed.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 mt-2">
                Total funds successfully disbursed
              </p>
            </div>
          </div>
        </div>

        {/* ── Recent Activity ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-black text-slate-900">
              Recent Wallet Activity
            </h2>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-4 rounded-full bg-slate-100 mb-4">
                <CreditCard className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No transactions yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Your withdrawal activity will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.slice(0, 10).map((a: any, idx: number) => {
                const amount = Number(
                  a?.studentAmount ?? a?.totalAmount ?? a?.amount ?? 0,
                );
                const status = String(a?.status ?? "—").toUpperCase();

                const statusConfig = {
                  APPROVED: {
                    color: "bg-emerald-50 text-emerald-700",
                    icon: CheckCircle2,
                  },
                  COMPLETED: {
                    color: "bg-emerald-50 text-emerald-700",
                    icon: CheckCircle2,
                  },
                  PAID: {
                    color: "bg-emerald-50 text-emerald-700",
                    icon: CheckCircle2,
                  },
                  PENDING: {
                    color: "bg-amber-50 text-amber-700",
                    icon: Clock3,
                  },
                  PROCESSING: {
                    color: "bg-amber-50 text-amber-700",
                    icon: Clock3,
                  },
                  REJECTED: { color: "bg-red-50 text-red-700", icon: XCircle },
                }[status] || {
                  color: "bg-slate-50 text-slate-600",
                  icon: CreditCard,
                };

                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={String(a?.id ?? idx)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 sm:px-5 py-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${statusConfig.color}`}>
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Withdrawal Disbursal
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {a.createdAt
                            ? new Date(a.createdAt).toLocaleString()
                            : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:text-right self-end sm:self-auto">
                      <span className="text-sm font-black text-slate-900">
                        ৳{amount.toFixed(2)}
                      </span>
                      <span
                        className={`inline-block text-[10px] font-bold rounded-full px-2.5 py-1 ${statusConfig.color}`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
