"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowDownCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Trash2,
  X,
  Banknote,
  Eye,
  RefreshCw,
  Filter,
  Hash,
  CreditCard,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  Percent,
  User,
  Tag,
  TrendingDown,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  useStudentWithdrawDeleteMutation,
  useStudentWithdrawsMyQuery,
} from "@/lib/api/student/withdraw";

const TakaIcon = ({ className }: { className?: string }) => (
  <span className={`font-extrabold flex items-center justify-center leading-none ${className || ""}`}>৳</span>
);

// ─── Types ───────────────────────────────────────────────────────────────

type UiWithdraw = {
  id: number | string;
  amount: string;
  totalAmount: string;
  adminAmount: string;
  studentAmount: string;
  method: string;
  status: string;
  rejectReason: string;
  createdAt: string;
  updatedAt: string;
  product: Record<string, any> | null;
  percentage: Record<string, any> | null;
  paymentMethod: Record<string, any> | null;
  user: Record<string, any> | null;
  raw: any;
};

type StatusFilter =
  | "all"
  | "pending"
  | "approved"
  | "rejected"
  | "processing"
  | "paid"
  | "completed";

const PAGE_SIZE = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatDate(value: unknown): string {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtAmt(v: any): string {
  if (v === null || v === undefined || v === "" || v === "—") return "—";
  const n = Number(v);
  if (isNaN(n)) return String(v);
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function extractList(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  for (const k of ["items", "withdraws", "withdrawals", "data"]) {
    if (Array.isArray(payload?.[k])) return payload[k];
  }
  for (const k of ["items", "withdraws", "withdrawals", "data"]) {
    if (Array.isArray(payload?.data?.[k])) return payload.data[k];
  }
  return [];
}

function extractTotal(payload: any): number | null {
  const candidates = [
    payload?.meta?.total,
    payload?.data?.meta?.total,
    payload?.pagination?.total,
    payload?.data?.pagination?.total,
    payload?.total,
    payload?.data?.total,
  ];
  for (const v of candidates) {
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return null;
}

function toUi(raw: any): UiWithdraw | null {
  const id = raw?.id ?? raw?._id ?? raw?.withdrawId ?? raw?.requestId ?? null;
  if (!id) return null;
  const amountRaw =
    raw?.amount ??
    raw?.requestedAmount ??
    raw?.requestAmount ??
    raw?.value ??
    null;
  return {
    id,
    amount:
      amountRaw === null || amountRaw === undefined ? "—" : String(amountRaw),
    totalAmount: raw?.totalAmount != null ? String(raw.totalAmount) : "—",
    adminAmount: raw?.adminAmount != null ? String(raw.adminAmount) : "—",
    studentAmount: raw?.studentAmount != null ? String(raw.studentAmount) : "—",
    method:
      String(
        raw?.method ?? raw?.paymentMethod?.type ?? raw?.channel ?? "—",
      ).trim() || "—",
    status: String(raw?.status ?? raw?.state ?? "—").trim() || "—",
    rejectReason: String(
      raw?.rejectReason ?? raw?.rejectionReason ?? "",
    ).trim(),
    createdAt: formatDate(raw?.createdAt ?? raw?.created_at),
    updatedAt: formatDate(raw?.updatedAt ?? raw?.updated_at),
    product:
      raw?.product && typeof raw.product === "object" ? raw.product : null,
    percentage:
      raw?.percentage && typeof raw.percentage === "object"
        ? raw.percentage
        : null,
    paymentMethod:
      raw?.paymentMethod && typeof raw.paymentMethod === "object"
        ? raw.paymentMethod
        : null,
    user: raw?.user && typeof raw.user === "object" ? raw.user : null,
    raw,
  };
}

// ─── Status config ────────────────────────────────────────────────────────

const STATUS_CFG: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  approved: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  paid: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  completed: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  processing: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    dot: "bg-indigo-400",
  },
  rejected: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CFG[status.toLowerCase()] ?? {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
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

// ─── Detail Section ───────────────────────────────────────────────────────

function DetailSection({
  title,
  icon: Icon,
  color,
  children,
}: {
  title: string;
  icon: React.FC<any>;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 ${color}`}
      >
        <Icon className="w-4 h-4" />
        <p className="text-[11px] font-black uppercase tracking-widest">
          {title}
        </p>
      </div>
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {children}
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: "green" | "red" | "blue";
}) {
  if (!value || value === "—") return null;
  const valCls =
    highlight === "green"
      ? "text-blue-700 font-black"
      : highlight === "red"
        ? "text-red-600 font-bold"
        : highlight === "blue"
          ? "text-blue-700 font-bold"
          : "text-gray-800 font-semibold";
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-3 py-2.5">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={`text-[12px] break-words ${mono ? "font-mono text-[11px]" : ""} ${valCls}`}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Details Modal ────────────────────────────────────────────────────────

function DetailsModal({
  item,
  onClose,
}: {
  item: UiWithdraw;
  onClose: () => void;
}) {
  const isApproved = ["approved", "paid", "completed"].includes(
    item.status.toLowerCase(),
  );
  const isRejected = item.status.toLowerCase() === "rejected";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col mx-2 sm:mx-0">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <ArrowDownCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[14px] font-extrabold text-gray-900">
                Withdraw Details
              </h2>
              <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                #{String(item.id).slice(0, 12)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusPill status={item.status} />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Hero amount banner */}
          <div
            className={`rounded-2xl p-5 text-white ${isApproved ? "bg-gradient-to-br from-blue-500 to-blue-700" : isRejected ? "bg-gradient-to-br from-red-500 to-rose-600" : "bg-gradient-to-br from-amber-500 to-orange-500"}`}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
              Total Amount
            </p>
            <p className="text-3xl font-black">
              ৳
              {fmtAmt(
                item.totalAmount !== "—" ? item.totalAmount : item.amount,
              )}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-white/15 rounded-xl p-3">
                <p className="text-[9px] opacity-80 uppercase tracking-widest font-bold mb-1">
                  Student Gets
                </p>
                <p className="text-lg font-black">
                  ৳{fmtAmt(item.studentAmount)}
                </p>
              </div>
              <div className="bg-white/15 rounded-xl p-3">
                <p className="text-[9px] opacity-80 uppercase tracking-widest font-bold mb-1">
                  Platform Fee
                </p>
                <p className="text-lg font-black">
                  ৳{fmtAmt(item.adminAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Reject reason */}
          {isRejected && item.rejectReason && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3">
              <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-black text-red-400 uppercase tracking-wider mb-1">
                  Rejection Reason
                </p>
                <p className="text-[13px] font-semibold text-red-700">
                  {item.rejectReason}
                </p>
              </div>
            </div>
          )}

          {/* Transaction info */}
          <DetailSection
            title="Transaction Info"
            icon={TrendingDown}
            color="bg-gray-50/80 text-gray-600"
          >
            <DetailField label="Withdraw ID" value={String(item.id)} mono />
            <DetailField label="Method" value={item.method} />
            <DetailField label="Status" value={item.status} />
            <DetailField label="Created At" value={item.createdAt} />
            <DetailField label="Updated At" value={item.updatedAt} />
          </DetailSection>

          {/* Payment method */}
          {item.paymentMethod && (
            <DetailSection
              title="Payment Method"
              icon={CreditCard}
              color="bg-blue-50/60 text-blue-600"
            >
              <DetailField label="Type" value={item.paymentMethod.type} />
              <DetailField
                label="Account"
                value={
                  item.paymentMethod.accountNumber ??
                  item.paymentMethod.account ??
                  item.paymentMethod.phone ??
                  "—"
                }
                mono
              />
              <DetailField
                label="Account Name"
                value={
                  item.paymentMethod.accountHolderName ??
                  item.paymentMethod.nameOnAccount ??
                  "—"
                }
              />
              <DetailField label="Status" value={item.paymentMethod.status} />
              {item.paymentMethod.bankName && (
                <DetailField label="Bank" value={item.paymentMethod.bankName} />
              )}
              {item.paymentMethod.branchName && (
                <DetailField
                  label="Branch"
                  value={item.paymentMethod.branchName}
                />
              )}
            </DetailSection>
          )}

          {/* Product */}
          {item.product && (
            <DetailSection
              title="Product"
              icon={Package}
              color="bg-blue-50/60 text-blue-600"
            >
              <DetailField
                label="Product ID"
                value={String(item.product.id ?? "—")}
                mono
              />
              <DetailField
                label="Name"
                value={
                  item.product.botName ??
                  item.product.title ??
                  item.product.name ??
                  "—"
                }
              />
              <DetailField
                label="Category"
                value={item.product.category ?? "—"}
              />
              <DetailField
                label="Total Amount"
                value={`৳${fmtAmt(item.product.totalAmount ?? item.product.price)}`}
                highlight="green"
              />
              <DetailField label="Status" value={item.product.status ?? "—"} />
              {item.product.createdAt && (
                <DetailField
                  label="Created"
                  value={formatDate(item.product.createdAt)}
                />
              )}
            </DetailSection>
          )}

          {/* Percentage / Commission */}
          {item.percentage && (
            <DetailSection
              title="Commission Rate"
              icon={Percent}
              color="bg-blue-50/60 text-blue-600"
            >
              <DetailField
                label="ID"
                value={String(item.percentage.id ?? "—")}
                mono
              />
              <DetailField label="Type" value={item.percentage.type ?? "—"} />
              <DetailField
                label="Percentage"
                value={
                  item.percentage.percentage != null
                    ? `${item.percentage.percentage}%`
                    : "—"
                }
                highlight="blue"
              />
              {item.percentage.createdAt && (
                <DetailField
                  label="Set At"
                  value={formatDate(item.percentage.createdAt)}
                />
              )}
            </DetailSection>
          )}

          {/* User */}
          {item.user && (
            <DetailSection
              title="User"
              icon={User}
              color="bg-slate-50/80 text-slate-600"
            >
              <DetailField
                label="ID"
                value={String(item.user.id ?? "—")}
                mono
              />
              <DetailField
                label="Name"
                value={item.user.name ?? item.user.fullName ?? "—"}
              />
              <DetailField label="Email" value={item.user.email ?? "—"} />
              <DetailField label="Phone" value={item.user.phone ?? "—"} />
              <DetailField label="Role" value={item.user.role ?? "—"} />
              <DetailField label="Country" value={item.user.country ?? "—"} />
            </DetailSection>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────

function ConfirmModal({
  item,
  loading,
  onClose,
  onConfirm,
}: {
  item: UiWithdraw;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-600" />
            </div>
            <h2 className="text-[14px] font-extrabold text-gray-900">
              Delete Withdrawal
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"
          >
            <X size={14} />
          </button>
        </div>
        <div className="p-5">
          <p className="text-[13px] text-gray-600">
            Withdrawal request{" "}
            <span className="font-mono font-bold text-gray-800">
              #{String(item.id).slice(0, 8)}
            </span>{" "}
            will be permanently removed. This action cannot be undone.
          </p>
          <div className="flex gap-2.5 mt-5">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 rounded-xl bg-red-600 py-2.5 text-[13px] font-bold text-white hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function WithdrawManager() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<
    | { type: "none" }
    | { type: "details"; item: UiWithdraw }
    | { type: "delete"; item: UiWithdraw }
  >({ type: "none" });

  const { data, isFetching, isError, refetch } = useStudentWithdrawsMyQuery({
    search: search || undefined,
    status: status === "all" ? undefined : status,
    page,
    limit: PAGE_SIZE,
  });

  const [deleteWithdraw, deleteState] = useStudentWithdrawDeleteMutation();

  const items = useMemo(
    () => extractList(data).map(toUi).filter(Boolean) as UiWithdraw[],
    [data],
  );
  const total = extractTotal(data);
  const totalPages =
    total === null
      ? Math.max(1, page)
      : Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  /* stats */
  const approved = items.filter((w) =>
    ["approved", "paid", "completed"].includes(w.status.toLowerCase()),
  ).length;
  const pending = items.filter(
    (w) => w.status.toLowerCase() === "pending",
  ).length;
  const rejected = items.filter(
    (w) => w.status.toLowerCase() === "rejected",
  ).length;
  const totalVal = items.reduce(
    (s, w) =>
      s +
      (isNaN(Number(w.studentAmount !== "—" ? w.studentAmount : w.amount))
        ? 0
        : Number(w.studentAmount !== "—" ? w.studentAmount : w.amount)),
    0,
  );

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* ── HEADER ───────────────────────────────────────────────── */}
      <div className="border-b px-4 py-6">
        <div className="mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 flex-shrink-0">
                <Banknote className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Withdrawals
                </h1>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Track your withdrawal requests
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Approved",
                value: approved,
                icon: CheckCircle2,
                bg: "bg-blue-50",
                color: "text-blue-600",
              },
              {
                label: "Pending",
                value: pending,
                icon: Clock,
                bg: "bg-amber-50",
                color: "text-amber-600",
              },
              {
                label: "Rejected",
                value: rejected,
                icon: XCircle,
                bg: "bg-red-50",
                color: "text-red-600",
              },
              {
                label: "Net Received",
                value: `৳${fmtAmt(totalVal)}`,
                icon: TakaIcon,
                bg: "bg-blue-50",
                color: "text-blue-600",
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3 shadow-sm"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg} flex-shrink-0`}
                  >
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {s.label}
                    </p>
                    <p className="text-base font-black text-slate-900 leading-tight">
                      {s.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── TABLE SECTION ────────────────────────────────────────── */}
      <div className="mx-auto px-4 sm:px-8 mt-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-4 sm:px-5 py-4 border-b border-slate-100 bg-slate-50/40">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 w-full sm:w-64 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-sm">
                  <Search className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search withdrawals…"
                    className="w-full text-[12px] font-semibold text-slate-700 placeholder:text-slate-400 outline-none bg-transparent"
                  />
                  {search && (
                    <button
                      onClick={() => {
                        setSearch("");
                        setPage(1);
                      }}
                    >
                      <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                    </button>
                  )}
                </div>

                {/* Status filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value as StatusFilter);
                      setPage(1);
                    }}
                    className="h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-[12px] font-semibold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="approved">Approved</option>
                    <option value="paid">Paid</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Refresh */}
                <button
                  onClick={() => refetch?.()}
                  className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
                  />
                </button>
              </div>

              {/* Pagination */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => canPrev && setPage((p) => p - 1)}
                  disabled={!canPrev}
                  className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-[12px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <div className="h-9 px-4 rounded-xl bg-blue-600 text-white text-[12px] font-black flex items-center min-w-[64px] justify-center">
                  {page} / {totalPages}
                </div>
                <button
                  onClick={() => canNext && setPage((p) => p + 1)}
                  disabled={!canNext}
                  className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-[12px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {isFetching ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                </div>
                <p className="text-[12px] font-bold text-slate-500">
                  Loading withdrawals…
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
                  Failed to load withdrawals
                </p>
                <button
                  onClick={() => refetch?.()}
                  className="text-[11px] font-bold text-blue-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <Banknote className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-[13px] font-bold text-slate-700">
                  No withdrawals found
                </p>
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
                        { label: "Request", icon: Hash },
                        { label: "Total", icon: TakaIcon },
                        { label: "You Get", icon: TrendingDown },
                        { label: "Method", icon: CreditCard },
                        { label: "Status", icon: BarChart3 },
                        { label: "Created", icon: Calendar },
                        { label: "Actions", icon: ShieldCheck },
                      ].map((col) => {
                        const Icon = col.icon;
                        return (
                          <th
                            key={col.label}
                            className="px-5 py-3.5 text-left whitespace-nowrap"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center">
                                <Icon className="w-3 h-3 text-blue-500" />
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
                    {items.map((w) => (
                      <tr
                        key={String(w.id)}
                        className="hover:bg-blue-50/20 transition-colors group"
                      >
                        {/* Request ID */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <ArrowDownCircle className="w-4 h-4 text-blue-600" />
                            </div>
                            <p className="text-[11px] font-mono text-slate-500">
                              #{String(w.id).slice(0, 10)}
                            </p>
                          </div>
                        </td>
                        {/* Total */}
                        <td className="px-5 py-4">
                          <span className="text-[13px] font-black text-slate-900">
                            ৳
                            {fmtAmt(
                              w.totalAmount !== "—" ? w.totalAmount : w.amount,
                            )}
                          </span>
                        </td>
                        {/* Student gets */}
                        <td className="px-5 py-4">
                          <span className="text-[13px] font-black text-blue-700">
                            ৳
                            {fmtAmt(
                              w.studentAmount !== "—"
                                ? w.studentAmount
                                : w.amount,
                            )}
                          </span>
                        </td>
                        {/* Method */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-[11px] font-bold text-blue-700">
                            <CreditCard className="w-3 h-3" />
                            {w.method !== "—"
                              ? w.method.charAt(0).toUpperCase() +
                              w.method.slice(1)
                              : "—"}
                          </span>
                        </td>
                        {/* Status */}
                        <td className="px-5 py-4">
                          <StatusPill status={w.status} />
                        </td>
                        {/* Created */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                              {w.createdAt}
                            </span>
                          </div>
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() =>
                                setModal({ type: "details", item: w })
                              }
                              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:text-blue-600 text-slate-600 text-[11px] font-bold transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            <button
                              onClick={() =>
                                setModal({ type: "delete", item: w })
                              }
                              className="h-8 w-8 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 text-slate-400 flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {items.map((w) => (
                  <div
                    key={String(w.id)}
                    className="p-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <ArrowDownCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-mono text-slate-500">
                            #{String(w.id).slice(0, 10)}
                          </p>
                          <p className="text-[15px] font-black text-blue-700 mt-0.5">
                            ৳
                            {fmtAmt(
                              w.studentAmount !== "—"
                                ? w.studentAmount
                                : w.amount,
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {w.method} · {w.createdAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <StatusPill status={w.status} />
                        <div className="flex gap-1.5">
                          <button
                            onClick={() =>
                              setModal({ type: "details", item: w })
                            }
                            className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-blue-600"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setModal({ type: "delete", item: w })
                            }
                            className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-400">
                Showing{" "}
                <span className="font-bold text-slate-600">{items.length}</span>
                {total !== null && (
                  <>
                    {" "}
                    of <span className="font-bold text-slate-600">{total}</span>
                  </>
                )}{" "}
                withdrawals
              </p>
              <div className="flex items-center gap-1.5">
                {Array.from(
                  { length: Math.min(totalPages, 5) },
                  (_, i) => i + 1,
                ).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-colors ${n === page ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
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
      </div>

      {/* Modals */}
      {modal.type === "details" && (
        <DetailsModal
          item={modal.item}
          onClose={() => setModal({ type: "none" })}
        />
      )}
      {modal.type === "delete" && (
        <ConfirmModal
          item={modal.item}
          loading={deleteState.isLoading}
          onClose={() => setModal({ type: "none" })}
          onConfirm={async () => {
            try {
              await deleteWithdraw(modal.item.id).unwrap();
              toast.success("Withdrawal deleted");
              setModal({ type: "none" });
            } catch (e: any) {
              toast.error(e?.data?.message ?? "Failed to delete");
            }
          }}
        />
      )}
    </div>
  );
}