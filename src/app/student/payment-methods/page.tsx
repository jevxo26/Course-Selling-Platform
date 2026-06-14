"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  Smartphone,
  Wallet,
  RefreshCw,
  Filter,
  User,
  Hash,
  Calendar,
  AlertCircle,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import {
  PaymentMethodStatus,
  PaymentMethodType,
  useStudentCreatePaymentMethodMutation,
  useStudentPaymentMethodsMySearchQuery,
} from "@/lib/api/student/payment-methods";

/* ─── Types ──────────────────────────────────────────────────────── */
type UiPaymentMethod = {
  id: number | string;
  type: string;
  status: string;
  label: string;
  account: string;
  owner: string;
  createdAt: string;
  raw: any;
};

const PAGE_SIZE = 10;

/* ─── Helpers ────────────────────────────────────────────────────── */
function formatDate(input: any): string {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeType(v: any): string {
  const s = String(v ?? "")
    .toLowerCase()
    .trim();
  if (s === "zinipay") return "zinipay";
  if (s === "nagad") return "nagad";
  if (s === "bank") return "bank";
  if (s === "binance") return "binance";
  if (s === "visa") return "visa";
  return s || "unknown";
}

function normalizeStatus(v: any): string {
  const s = String(v ?? "")
    .toLowerCase()
    .trim();
  if (s === "pending" || s === "approved" || s === "rejected") return s;
  return s || "unknown";
}

function extractList(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.paymentMethods)) return payload.paymentMethods;
  if (Array.isArray(payload?.methods)) return payload.methods;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.paymentMethods))
    return payload.data.paymentMethods;
  if (Array.isArray(payload?.data?.methods)) return payload.data.methods;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
}

function extractTotal(payload: any): number | null {
  const candidates = [
    payload?.total,
    payload?.meta?.total,
    payload?.pagination?.total,
    payload?.data?.total,
    payload?.data?.meta?.total,
    payload?.data?.pagination?.total,
  ];
  for (const c of candidates) {
    const n = Number(c);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function toUi(raw: any, fallbackId: number): UiPaymentMethod {
  const id = raw?.id ?? raw?._id ?? raw?.paymentMethodId ?? fallbackId;
  const type = normalizeType(raw?.type ?? raw?.method ?? raw?.provider);
  const status = normalizeStatus(raw?.status);
  const label =
    String(raw?.label ?? raw?.name ?? raw?.title ?? type).trim() ||
    String(type).toUpperCase();
  const account =
    String(
      raw?.accountNumber ??
        raw?.account ??
        raw?.phone ??
        raw?.walletNumber ??
        raw?.number ??
        raw?.binanceId ??
        "",
    ).trim() || "—";
  const owner =
    String(
      raw?.accountHolderName ??
        raw?.user?.name ??
        raw?.user?.email ??
        raw?.owner?.name ??
        raw?.owner ??
        raw?.nameOnAccount ??
        "",
    ).trim() || "—";
  const createdAt = formatDate(raw?.createdAt ?? raw?.created_at);
  return { id, type, status, label, account, owner, createdAt, raw };
}

function cleanBody(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => {
      if (v === undefined || v === null) return false;
      if (typeof v === "string") return v.trim().length > 0;
      if (typeof v === "number") return Number.isFinite(v);
      return true;
    }),
  );
}

/* ─── Type config ────────────────────────────────────────────────── */
const TYPE_CFG: Record<
  string,
  { bg: string; text: string; border: string; icon: React.FC<any> }
> = {
  zinipay: {
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
    icon: Smartphone,
  },
  nagad: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    icon: Smartphone,
  },
  bank: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    icon: Building2,
  },
  binance: {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-200",
    icon: Wallet,
  },
  visa: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    icon: CreditCard,
  },
};

const STATUS_CFG: Record<
  string,
  { bg: string; text: string; border: string; icon: React.FC<any>; dot: string }
> = {
  approved: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircle2,
    dot: "bg-emerald-500",
  },
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: Clock,
    dot: "bg-amber-500",
  },
  rejected: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: XCircle,
    dot: "bg-red-500",
  },
};

/* ─── Pill components ────────────────────────────────────────────── */
function TypePill({ type }: { type: string }) {
  const cfg = TYPE_CFG[type] ?? {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
    icon: CreditCard,
  };
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <Icon className="w-3 h-3" />
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
    icon: AlertCircle,
    dot: "bg-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/* ─── Form Field ─────────────────────────────────────────────────── */
function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all";
const selectCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer";

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function PaymentMethodsPage() {
  const [filterType, setFilterType] = useState<"" | PaymentMethodType>("");
  const [filterStatus, setFilterStatus] = useState<"" | PaymentMethodStatus>(
    "",
  );
  const [pageNum, setPageNum] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [rawOpen, setRawOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { data, isFetching, isError, refetch } =
    useStudentPaymentMethodsMySearchQuery({
      type: filterType || undefined,
      status: filterStatus || undefined,
      page: pageNum,
      limit,
    });

  const list = useMemo(
    () => extractList(data).map((m, idx) => toUi(m, idx + 1)),
    [data],
  );

  const total = extractTotal(data);
  const totalPages = useMemo(() => {
    const t = total !== null ? Math.ceil(total / limit) : null;
    if (t !== null && Number.isFinite(t) && t > 0) return t;
    return Math.max(1, Math.ceil(list.length / limit) || 1);
  }, [total, list.length, limit]);

  /* form state */
  const [createType, setCreateType] = useState<PaymentMethodType>("zinipay");
  const [label, setLabel] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [nameOnAccount, setNameOnAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [binanceId, setBinanceId] = useState("");

  const [create, { isLoading: isCreating }] =
    useStudentCreatePaymentMethodMutation();

  const accountLabel =
    createType === "bank"
      ? "Account Number"
      : createType === "binance"
        ? "Binance ID"
        : "Phone / Wallet Number";

  const canSubmit =
    !isCreating &&
    createType.trim().length > 0 &&
    accountNumber.trim().length > 0 &&
    nameOnAccount.trim().length > 0;

  function resetForm() {
    setLabel("");
    setAccountNumber("");
    setNameOnAccount("");
    setBankName("");
    setBranchName("");
    setRoutingNumber("");
    setBinanceId("");
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    const toastId = toast.loading("Submitting payment method...");
    try {
      const body = cleanBody({
        type: createType,
        accountNumber,
        accountHolderName: nameOnAccount,
        label: label || undefined,
        bankName: createType === "bank" ? bankName : undefined,
        branchName: createType === "bank" ? branchName : undefined,
        routingNumber: createType === "bank" ? routingNumber : undefined,
        binanceId: createType === "binance" ? binanceId : undefined,
      });
      await create(body as any).unwrap();
      toast.success("Payment method submitted for review", { id: toastId });
      resetForm();
      setShowForm(false);
    } catch (e: any) {
      toast.error(e?.data?.message ?? e?.error ?? "Failed to submit", {
        id: toastId,
      });
    }
  }

  /* stats */
  const approvedCount = list.filter((m) => m.status === "approved").length;
  const pendingCount = list.filter((m) => m.status === "pending").length;
  const rejectedCount = list.filter((m) => m.status === "rejected").length;

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* ── PAGE HEADER ────────────────────────────────────────────── */}
      <div className="border-b b px-4 sm:px-8 py-6">
        <div className=" mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Payment Methods
                </h1>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Manage your withdrawal accounts
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm text-[13px] self-start sm:self-auto"
            >
              {showForm ? (
                <X className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {showForm ? "Cancel" : "Add Method"}
            </button>
          </div>

          {/* Stats row */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              {
                label: "Approved",
                value: approvedCount,
                icon: CheckCircle2,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                label: "Pending",
                value: pendingCount,
                icon: Clock,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
              {
                label: "Rejected",
                value: rejectedCount,
                icon: XCircle,
                color: "text-red-600",
                bg: "bg-red-50",
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3 shadow-sm"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg}`}
                  >
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {s.label}
                    </p>
                    <p className="text-lg font-black text-slate-900 leading-tight">
                      {s.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className=" mx-auto px-4 sm:px-8 mt-6 space-y-5">
        {/* ── ADD FORM (collapsible) ─────────────────────────────── */}
        {showForm && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-[14px] font-extrabold text-slate-900">
                    Add Payment Method
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Will be reviewed before activation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Method Type" required>
                  <select
                    value={createType}
                    onChange={(e) =>
                      setCreateType(e.target.value as PaymentMethodType)
                    }
                    className={selectCls}
                  >
                    <option value="zinipay">ZiniPay</option>
                    <option value="nagad">Nagad</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="binance">Binance</option>
                    <option value="visa">Visa Card</option>
                  </select>
                </FormField>

                <FormField label="Label">
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className={inputCls}
                    placeholder="e.g. My ZiniPay account"
                  />
                </FormField>

                <FormField label={accountLabel} required>
                  <input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className={inputCls}
                    placeholder={
                      createType === "bank"
                        ? "Account number"
                        : createType === "binance"
                          ? "Binance UID"
                          : "01XXXXXXXXX"
                    }
                  />
                </FormField>

                <FormField label="Name on Account" required>
                  <input
                    value={nameOnAccount}
                    onChange={(e) => setNameOnAccount(e.target.value)}
                    className={inputCls}
                    placeholder="Full name"
                  />
                </FormField>

                {createType === "bank" && (
                  <>
                    <FormField label="Bank Name">
                      <input
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className={inputCls}
                        placeholder="e.g. Dutch-Bangla Bank"
                      />
                    </FormField>
                    <FormField label="Branch">
                      <input
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        className={inputCls}
                        placeholder="Branch name"
                      />
                    </FormField>
                    <FormField label="Routing Number">
                      <input
                        value={routingNumber}
                        onChange={(e) => setRoutingNumber(e.target.value)}
                        className={inputCls}
                        placeholder="Routing number"
                      />
                    </FormField>
                  </>
                )}

                {createType === "binance" && (
                  <FormField label="Binance ID">
                    <input
                      value={binanceId}
                      onChange={(e) => setBinanceId(e.target.value)}
                      className={inputCls}
                      placeholder="Binance UID"
                    />
                  </FormField>
                )}
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[13px] shadow-sm"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Banknote className="w-4 h-4" /> Submit Method
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400">
                  <span className="text-red-400">*</span> Required fields
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── TABLE CARD ────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-4 sm:px-5 py-4 border-b border-slate-100 bg-slate-50/40">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {/* Type filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value as any);
                      setPageNum(1);
                    }}
                    className="h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-[12px] font-semibold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="">All Types</option>
                    <option value="zinipay">ZiniPay</option>
                    <option value="nagad">Nagad</option>
                    <option value="bank">Bank</option>
                    <option value="binance">Binance</option>
                    <option value="visa">Visa</option>
                  </select>
                </div>

                {/* Status filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value as any);
                    setPageNum(1);
                  }}
                  className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-[12px] font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                {/* Limit */}
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPageNum(1);
                  }}
                  className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-[12px] font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  {[10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      {n} / page
                    </option>
                  ))}
                </select>

                {/* Refresh */}
                <button
                  onClick={() => refetch?.()}
                  className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
                  />
                </button>

                {/* Raw toggle */}
                <button
                  onClick={() => setRawOpen((v) => !v)}
                  className={`h-9 px-3 rounded-xl border text-[12px] font-bold flex items-center gap-1.5 transition-colors ${rawOpen ? "border-indigo-300 bg-indigo-50 text-indigo-600" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
                >
                  {rawOpen ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                  Raw
                </button>
              </div>

              {/* Pagination */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                  disabled={pageNum <= 1}
                  className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-[12px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <div className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-[12px] font-black flex items-center justify-center min-w-[72px]">
                  {pageNum} / {totalPages}
                </div>
                <button
                  onClick={() => setPageNum((p) => Math.min(totalPages, p + 1))}
                  disabled={pageNum >= totalPages}
                  className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-[12px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          {isFetching ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                </div>
                <p className="text-[12px] font-bold">
                  Loading payment methods...
                </p>
              </div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-[12px] font-bold text-red-600">
                  Failed to load payment methods
                </p>
                <button
                  onClick={() => refetch?.()}
                  className="text-[11px] font-bold text-indigo-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : list.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <CreditCard className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-[13px] font-bold text-slate-700">
                  No payment methods found
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-100 mt-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Your First Method
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      {[
                        { label: "Method", icon: CreditCard },
                        { label: "Type", icon: Wallet },
                        { label: "Account", icon: Hash },
                        { label: "Owner", icon: User },
                        { label: "Status", icon: CheckCircle2 },
                        { label: "Created", icon: Calendar },
                      ].map((col) => {
                        const Icon = col.icon;
                        return (
                          <th
                            key={col.label}
                            className="px-5 py-3.5 text-left whitespace-nowrap"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center">
                                <Icon className="w-3 h-3 text-indigo-500" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                {col.label}
                              </span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {list.map((m) => (
                      <tr
                        key={String(m.id)}
                        className="hover:bg-indigo-50/20 transition-colors group"
                      >
                        {/* Method label */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-[11px] font-black text-indigo-600">
                                {m.label.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-[13px] font-bold text-slate-900">
                                {m.label}
                              </p>
                              <p className="text-[10px] font-mono text-slate-400">
                                #{String(m.id).slice(0, 8)}
                              </p>
                            </div>
                          </div>
                        </td>
                        {/* Type */}
                        <td className="px-5 py-4">
                          <TypePill type={m.type} />
                        </td>
                        {/* Account */}
                        <td className="px-5 py-4">
                          <span className="text-[12px] font-mono font-semibold text-slate-700">
                            {m.account}
                          </span>
                        </td>
                        {/* Owner */}
                        <td className="px-5 py-4">
                          <span className="text-[12px] font-semibold text-slate-700">
                            {m.owner}
                          </span>
                        </td>
                        {/* Status */}
                        <td className="px-5 py-4">
                          <StatusPill status={m.status} />
                        </td>
                        {/* Created */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                              {m.createdAt}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {list.map((m) => (
                  <div
                    key={String(m.id)}
                    className="p-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-[11px] font-black text-indigo-600">
                            {m.label.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-slate-900 truncate">
                            {m.label}
                          </p>
                          <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                            {m.account}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {m.owner}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <StatusPill status={m.status} />
                        <TypePill type={m.type} />
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {m.createdAt}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Footer */}
          {list.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-400">
                Showing{" "}
                <span className="font-bold text-slate-600">{list.length}</span>
                {total !== null && (
                  <>
                    {" "}
                    of <span className="font-bold text-slate-600">{total}</span>
                  </>
                )}{" "}
                methods
              </p>
              <div className="flex items-center gap-1.5">
                {Array.from(
                  { length: Math.min(totalPages, 5) },
                  (_, i) => i + 1,
                ).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPageNum(n)}
                    className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-colors ${n === pageNum ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    {n}
                  </button>
                ))}
                {totalPages > 5 && (
                  <span className="text-slate-400 text-[11px]">…</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RAW RESPONSE ─────────────────────────────────────────── */}
      </div>
    </div>
  );
}
