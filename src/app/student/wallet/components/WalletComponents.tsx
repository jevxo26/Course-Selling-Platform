"use client";

import React, { useMemo } from "react";
import {
  Loader2,
  Wallet,
  TrendingUp,
  Clock,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Smartphone,
} from "lucide-react";
import { useStudentWalletMyQuery } from "@/lib/api/student/wallet";

function extractRoot(payload: any): any {
  if (!payload) return null;
  return payload?.data ?? payload?.wallet ?? payload;
}

function extractArray(payload: any, keys: string[]): any[] {
  for (const key of keys) {
    const parts = key.split(".");
    let cur: any = payload;
    for (const p of parts) cur = cur?.[p];
    if (Array.isArray(cur)) return cur;
  }
  return [];
}

function extractNumber(payload: any, keys: string[]): number | null {
  for (const key of keys) {
    const parts = key.split(".");
    let cur: any = payload;
    for (const p of parts) cur = cur?.[p];
    const n = Number(cur);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function extractString(payload: any, keys: string[]): string {
  for (const key of keys) {
    const parts = key.split(".");
    let cur: any = payload;
    for (const p of parts) cur = cur?.[p];
    if (typeof cur === "string" && cur.trim()) return cur;
  }
  return "";
}

function formatMoney(amount: number | null, currency: string): string {
  const val = amount === null ? 0 : amount;
  const c = currency || "৳";
  return `${c}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getActivityClass(a: any): "credit" | "debit" | "pending" | "other" {
  const t = String(a?.type ?? a?.title ?? a?.name ?? "").toLowerCase();
  const status = String(a?.status ?? "").toLowerCase();
  const amt = Number(a?.amount ?? a?.value ?? 0);
  if (
    t.includes("credit") ||
    t.includes("deposit") ||
    t.includes("earn") ||
    status === "credit" ||
    amt > 0
  )
    return "credit";
  if (
    t.includes("debit") ||
    t.includes("withdraw") ||
    t.includes("payment") ||
    status === "debit" ||
    amt < 0
  )
    return "debit";
  if (t.includes("pending") || status === "pending") return "pending";
  return "other";
}

function getPmIcon(m: any) {
  const t = String(m?.type ?? "").toLowerCase();
  if (t.includes("bank")) return Building2;
  if (t.includes("mobile") || t.includes("bkash") || t.includes("nagad"))
    return Smartphone;
  return CreditCard;
}

function getPmStatusClasses(status: string): string {
  const s = status.toLowerCase();
  if (s === "active" || s === "verified")
    return "bg-emerald-50 text-emerald-700";
  if (s === "pending")
    return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-500";
}

function formatDate(d: any): string {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return String(d);
  }
}

// ── Prime Card (unchanged, already premium dark) ─────────────────────────────
function PrimeCard({
  available,
  currency,
  isFetching,
  isError,
}: {
  available: number | null;
  currency: string;
  isFetching: boolean;
  isError: boolean;
}) {
  return (
    <div className="relative w-full h-52 rounded-3xl overflow-hidden bg-zinc-900 shadow-2xl shadow-zinc-900/40 mb-5 select-none">
      {/* decorative circles */}
      <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
      <div className="absolute -bottom-12 -left-8 w-44 h-44 rounded-full bg-blue-500/10 blur-3xl" />
      {/* ring pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-5"
        viewBox="0 0 400 200"
        aria-hidden
      >
        <circle
          cx="320"
          cy="60"
          r="120"
          stroke="white"
          strokeWidth="1"
          fill="none"
        />
        <circle
          cx="320"
          cy="60"
          r="80"
          stroke="white"
          strokeWidth="1"
          fill="none"
        />
        <circle
          cx="320"
          cy="60"
          r="40"
          stroke="white"
          strokeWidth="1"
          fill="none"
        />
        <circle
          cx="80"
          cy="160"
          r="90"
          stroke="white"
          strokeWidth="1"
          fill="none"
        />
      </svg>

      <div className="relative z-10 flex flex-col justify-between h-full p-6">
        {/* top row */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40">
            Student Prime
          </span>
          <div className="w-8 h-6 rounded-sm bg-gradient-to-br from-white/30 to-white/10 border border-white/20" />
        </div>

        {/* balance */}
        <div>
          <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1 font-medium">
            Available Balance
          </p>
          <div className="text-4xl font-black tracking-tight text-white leading-none">
            {isFetching ? (
              <span className="text-lg font-semibold text-white/40 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </span>
            ) : isError ? (
              <span className="text-lg font-semibold text-red-400">Error</span>
            ) : (
              formatMoney(available, currency)
            )}
          </div>
        </div>

        {/* bottom row */}
        <div className="flex items-end justify-between">
          <span className="font-mono text-[13px] text-white/30 tracking-widest">
            •••• •••• •••• ••••
          </span>
          <span className="text-[11px] font-bold tracking-widest border border-white/20 rounded-md px-2 py-1 text-white/60 bg-white/5">
            PRIME
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Stat mini‑card (premium light) ───────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  valueClassName,
  isFetching,
  isError,
}: {
  label: string;
  value: string | number | null;
  icon: React.ElementType;
  iconClassName: string;
  valueClassName: string;
  isFetching: boolean;
  isError: boolean;
}) {
  return (
    <div className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-200">
      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center mb-3">
        <Icon className={`w-4 h-4 ${iconClassName}`} />
      </div>
      <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-1">
        {label}
      </p>
      <div className={`text-2xl font-black tracking-tight ${valueClassName}`}>
        {isFetching ? (
          <span className="text-sm text-slate-400 flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" /> …
          </span>
        ) : isError ? (
          <span className="text-sm text-red-500">Error</span>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export const WalletDashboard = () => {
  const { data, isFetching, isError } = useStudentWalletMyQuery();

  const root = useMemo(() => extractRoot(data), [data]);

  const currency = useMemo(
    () =>
      extractString(root, [
        "currency",
        "balance.currency",
        "available.currency",
        "data.currency",
      ]) || "৳",
    [root],
  );

  const available = useMemo(
    () =>
      extractNumber(root, [
        "available",
        "availableBalance",
        "available_amount",
        "balance.available",
        "balance",
        "currentBalance",
        "amount",
      ]),
    [root],
  );

  const pending = useMemo(
    () =>
      extractNumber(root, [
        "pending",
        "pendingAmount",
        "pending_amount",
        "balance.pending",
      ]),
    [root],
  );

  const lifetime = useMemo(
    () =>
      extractNumber(root, [
        "lifetime",
        "lifetimeEarnings",
        "totalEarnings",
        "earnings.total",
      ]),
    [root],
  );

  const paymentMethods = useMemo(
    () =>
      extractArray(root, [
        "paymentMethods",
        "methods",
        "payment_methods",
        "data.paymentMethods",
        "data.methods",
      ]),
    [root],
  );

  const activities = useMemo(
    () =>
      extractArray(root, [
        "activities",
        "transactions",
        "history",
        "data.activities",
        "data.transactions",
        "data.history",
      ]),
    [root],
  );

  return (
    // Premium light background with soft gradient
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-white dark:to-white p-4 sm:p-6 lg:p-8 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-none">
              My Wallet
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Student Dashboard
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700">
          ✦ Secured
        </span>
      </div>

      {/* Prime Card */}
      <PrimeCard
        available={available}
        currency={currency}
        isFetching={isFetching}
        isError={isError}
      />

      {/* Stats Grid – premium white cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard
          label="Pending"
          value={formatMoney(pending, currency)}
          icon={Clock}
          iconClassName="text-amber-500"
          valueClassName="text-amber-600"
          isFetching={isFetching}
          isError={isError}
        />
        <StatCard
          label="Lifetime Earnings"
          value={formatMoney(lifetime, currency)}
          icon={TrendingUp}
          iconClassName="text-emerald-500"
          valueClassName="text-emerald-600"
          isFetching={isFetching}
          isError={isError}
        />
      </div>

      {/* Payment Methods – white card */}
      {paymentMethods.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm mb-3">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-400" />
            Payment Methods
          </h3>
          <div className="divide-y divide-slate-100">
            {paymentMethods.map((m: any, idx: number) => {
              const PmIcon = getPmIcon(m);
              const name = String(m?.name ?? m?.title ?? m?.label ?? "—");
              const type = String(m?.type ?? "—");
              const account = String(
                m?.account ??
                  m?.accountNumber ??
                  m?.number ??
                  m?.walletNumber ??
                  "—",
              );
              const status = String(m?.status ?? "—");
              return (
                <div
                  key={String(m?.id ?? m?._id ?? idx)}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <PmIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-900 truncate">
                      {name}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400">
                      {type} · {account}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${getPmStatusClasses(status)}`}
                  >
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity – white card */}
      {activities.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            Recent Activity
          </h3>
          <div className="divide-y divide-slate-100">
            {activities.slice(0, 20).map((a: any, idx: number) => {
              const cls = getActivityClass(a);
              const title = String(
                a?.title ?? a?.name ?? a?.type ?? a?.status ?? "Activity",
              );
              const date = formatDate(a?.date ?? a?.createdAt ?? a?.created_at);
              const amt =
                a?.amount !== undefined && a?.amount !== null
                  ? String(a.amount)
                  : a?.value !== undefined && a?.value !== null
                    ? String(a.value)
                    : "—";

              const amtClass =
                cls === "credit"
                  ? "text-emerald-600"
                  : cls === "debit"
                    ? "text-red-500"
                    : "text-slate-900";

              const dotClass =
                cls === "credit"
                  ? "bg-emerald-50 text-emerald-600"
                  : cls === "debit"
                    ? "bg-red-50 text-red-500"
                    : cls === "pending"
                      ? "bg-amber-50 text-amber-500"
                      : "bg-slate-100 text-slate-500";

              const DotIcon =
                cls === "credit"
                  ? ArrowDownLeft
                  : cls === "debit"
                    ? ArrowUpRight
                    : Clock;

              return (
                <div
                  key={String(a?.id ?? a?._id ?? idx)}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${dotClass}`}
                  >
                    <DotIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-900 truncate">
                      {title}
                    </p>
                    <p className="text-[11px] text-slate-400">{date}</p>
                  </div>
                  <span
                    className={`text-[13px] font-mono font-semibold whitespace-nowrap ${amtClass}`}
                  >
                    {amt}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};