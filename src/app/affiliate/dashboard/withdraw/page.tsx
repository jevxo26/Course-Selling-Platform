"use client";

import React, { useMemo, useState } from "react";
import {
  HandCoins,
  Loader2,
  Plus,
  Clock,
  ShieldCheck,
  Eye,
  Trash2,
  TrendingUp,
  ListTodo,
  Clock3,
  ArrowUpRight,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetReferredEnrollmentsQuery,
  useGetAffiliateWithdrawalsQuery,
  useRequestAffiliateWithdrawalMutation,
  useDeleteAffiliateWithdrawalMutation,
} from "@/lib/api/affiliateApi";

export default function AffiliateWithdrawPage() {
  const { data: sales, isLoading: salesLoading } =
    useGetReferredEnrollmentsQuery();
  const { data: withdrawals, isLoading: withdrawalsLoading } =
    useGetAffiliateWithdrawalsQuery();

  const [requestWithdraw, { isLoading: isRequesting }] =
    useRequestAffiliateWithdrawalMutation();
  const [deleteRequest, { isLoading: isDeleting }] =
    useDeleteAffiliateWithdrawalMutation();

  const salesList = useMemo(() => {
    if (!sales) return [];
    if (Array.isArray(sales)) return sales;
    if (Array.isArray(sales?.data)) return sales.data;
    return [];
  }, [sales]);

  const withdrawalsList = useMemo(() => {
    if (!withdrawals) return [];
    if (Array.isArray(withdrawals)) return withdrawals;
    if (Array.isArray(withdrawals?.items)) return withdrawals.items;
    if (Array.isArray(withdrawals?.data)) return withdrawals.data;
    return [];
  }, [withdrawals]);

  const requestedEnrollmentIds = useMemo(() => {
    return new Set(
      withdrawalsList.map((w: any) => w?.enrollment?.id).filter(Boolean),
    );
  }, [withdrawalsList]);

  const handleRequestWithdraw = async (enrollmentId: number) => {
    const toastId = toast.loading("Submitting withdrawal request...");
    try {
      await requestWithdraw({ enrollmentId }).unwrap();
      toast.success("Withdrawal request submitted!", { id: toastId });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit request", {
        id: toastId,
      });
    }
  };

  const handleDeleteRequest = async (id: number) => {
    const toastId = toast.loading("Cancelling request...");
    try {
      await deleteRequest(id).unwrap();
      toast.success("Request cancelled successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to cancel request", {
        id: toastId,
      });
    }
  };

  if (salesLoading || withdrawalsLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
            <Loader2 className="relative h-12 w-12 animate-spin text-indigo-600" />
          </div>
          <p className="text-sm font-semibold text-slate-500">
            Loading withdrawals manager…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white  p-3 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ── Header ── */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl shadow-lg shadow-indigo-500/20">
              <HandCoins className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Withdrawals
            </h1>
          </div>
          <p className="text-slate-500 ml-0 sm:ml-14 max-w-2xl">
            Request commission payouts for your referred sales and track their
            status.
          </p>
        </div>

        {/* ── Two‑column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* ── Referred Sales ── */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-black text-slate-900">
                Referred Sales
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Completed referral sales eligible for commission payout.
            </p>

            <div className="flex-1 overflow-y-auto max-h-[520px] pr-1 space-y-3">
              {salesList.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex p-4 rounded-full bg-slate-100 mb-4">
                    <TrendingUp className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">
                    No referred sales yet
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Start sharing your referral link to earn commissions.
                  </p>
                </div>
              ) : (
                salesList.map((sale: any) => {
                  const isRequested = requestedEnrollmentIds.has(sale.id);
                  return (
                    <div
                      key={sale.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3.5 hover:shadow-sm transition-shadow"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {sale?.course?.title || "Course Sale"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Student: {sale?.student?.name || "Student"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {sale.enrolledAt
                            ? new Date(sale.enrolledAt).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                        <span className="text-sm font-black text-slate-900">
                          ৳{Number(sale.amount || 0).toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleRequestWithdraw(sale.id)}
                          disabled={isRequested || isRequesting}
                          className={`rounded-xl px-3 py-1.5 text-[10px] font-bold border transition-colors ${
                            isRequested
                              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                              : "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200"
                          }`}
                        >
                          {isRequested ? "Requested" : "Request Payout"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* ── Disbursal History ── */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-xl bg-amber-50 text-amber-600">
                <Clock3 className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-black text-slate-900">
                Disbursal History
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Track the status of your submitted payout requests.
            </p>

            <div className="flex-1 overflow-y-auto max-h-[520px] pr-1 space-y-3">
              {withdrawalsList.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex p-4 rounded-full bg-slate-100 mb-4">
                    <Clock3 className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">
                    No withdrawal history
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Once you submit a request, it will appear here.
                  </p>
                </div>
              ) : (
                withdrawalsList.map((w: any) => {
                  const status = String(w.status).toLowerCase();
                  const canCancel = status === "pending";

                  const statusConfig = {
                    approved: {
                      icon: ShieldCheck,
                      color:
                        "bg-emerald-50 text-emerald-700 border-emerald-200",
                    },
                    completed: {
                      icon: ShieldCheck,
                      color:
                        "bg-emerald-50 text-emerald-700 border-emerald-200",
                    },
                    paid: {
                      icon: ShieldCheck,
                      color:
                        "bg-emerald-50 text-emerald-700 border-emerald-200",
                    },
                    pending: {
                      icon: Clock3,
                      color: "bg-amber-50 text-amber-700 border-amber-200",
                    },
                    processing: {
                      icon: Clock3,
                      color: "bg-amber-50 text-amber-700 border-amber-200",
                    },
                    rejected: {
                      icon: XCircle,
                      color: "bg-red-50 text-red-700 border-red-200",
                    },
                  }[status] || {
                    icon: Clock3,
                    color: "bg-slate-50 text-slate-600 border-slate-200",
                  };
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={w.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3.5 hover:shadow-sm transition-shadow"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900">
                          Payout Request #{w.id}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Course: {w?.enrollment?.course?.title || "—"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {w.createdAt
                            ? new Date(w.createdAt).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                        <span className="text-sm font-black text-slate-900">
                          ৳{Number(w.totalAmount ?? w.amount ?? 0).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {status.toUpperCase()}
                          </span>
                          {canCancel && (
                            <button
                              onClick={() => handleDeleteRequest(w.id)}
                              disabled={isDeleting}
                              className="p-1 rounded-lg border border-red-200 text-red-500 bg-white hover:bg-red-50 transition"
                              title="Cancel Request"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
