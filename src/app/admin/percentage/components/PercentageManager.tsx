"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Percent,
  Hash,
  Tag,
  Clock,
} from "lucide-react";
import {
  useAdminCreatePercentageMutation,
  useAdminDeletePercentageMutation,
  useAdminPercentageQuery,
  useAdminPercentagesQuery,
  useAdminUpdatePercentageMutation,
} from "@/lib/api/admin/percentage";
import { toast } from "sonner";

type ApiPercentage = {
  id: number;
  type: string;
  percentage: string;
  createdAt: string;
  updatedAt: string;
};

type UiPercentage = {
  id: number;
  type: string;
  percentage: number | null;
  createdAt: string;
  updatedAt: string;
  raw: ApiPercentage;
};

const PAGE_SIZE = 10;

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

function extractList(payload: any): ApiPercentage[] {
  if (!payload) return [];
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

function extractTotal(payload: any): number | null {
  const candidates = [
    payload?.data?.meta?.total,
    payload?.meta?.total,
    payload?.data?.pagination?.total,
    payload?.pagination?.total,
    payload?.data?.total,
    payload?.total,
  ];
  for (const v of candidates) {
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return null;
}

function toUi(raw: ApiPercentage): UiPercentage {
  const pct = parseFloat(raw.percentage);
  return {
    id: raw.id,
    type: raw.type ?? "—",
    percentage: Number.isFinite(pct) ? pct : null,
    createdAt: formatDate(raw.createdAt),
    updatedAt: formatDate(raw.updatedAt),
    raw,
  };
}

function typeBadgeColor(type: string) {
  const t = type.toLowerCase();
  if (t === "student") return "bg-violet-50 text-violet-700 border-violet-200";
  if (t === "teacher" || t === "instructor")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (t === "admin") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

/* ─── Modal shell ─── */
function ModalShell({
  title,
  subtitle,
  loading,
  onClose,
  children,
  headerColor = "from-indigo-600 to-violet-600",
  icon: Icon = Percent,
}: {
  title: string;
  subtitle?: string;
  loading?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  headerColor?: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet: slides up on mobile, centered card on sm+ */}
      <div className="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        <div
          className={`bg-gradient-to-r ${headerColor} px-5 py-4 flex items-center justify-between flex-shrink-0`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Icon size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-black text-white leading-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[10px] text-white/60 mt-0.5 font-mono truncate max-w-[180px]">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-9 h-9 rounded-2xl flex items-center justify-center text-white/70 hover:bg-white/20 transition-all disabled:opacity-60 flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>
        <div className="px-5 py-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

/* ─── Form Modal ─── */
function PercentageFormModal({
  title,
  subtitle,
  loading,
  initialType,
  initialPercentage,
  onClose,
  onSubmit,
  isEdit,
}: {
  title: string;
  subtitle: string;
  loading: boolean;
  initialType: string;
  initialPercentage: string;
  onClose: () => void;
  onSubmit: (body: { type: string; percentage: string }) => void;
  isEdit?: boolean;
}) {
  const [type, setType] = useState(initialType);
  const [percentage, setPercentage] = useState(initialPercentage);
  const [errors, setErrors] = useState<{ type?: string; percentage?: string }>(
    {},
  );

  const validate = () => {
    const e: typeof errors = {};
    if (!type.trim()) e.type = "Type is required";
    const n = parseFloat(percentage);
    if (isNaN(n) || n < 0 || n > 100)
      e.percentage = "Must be a number between 0 and 100";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSubmit({
      type: type.trim(),
      percentage: parseFloat(percentage).toFixed(2),
    });
  };

  const inputCls = (hasError?: boolean) =>
    `w-full px-3 py-3 text-[13px] font-semibold border rounded-xl outline-none focus:ring-2 transition-all ${
      hasError
        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
        : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-100"
    }`;

  return (
    <ModalShell
      title={title}
      subtitle={subtitle}
      loading={loading}
      onClose={onClose}
      headerColor={
        isEdit
          ? "from-amber-500 to-orange-500"
          : "from-indigo-600 to-violet-600"
      }
      icon={isEdit ? Pencil : Plus}
    >
      <div className="space-y-4">
        {/* Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Tag size={11} className="text-slate-400" />
            Type <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="e.g. student, teacher, admin"
            className={inputCls(!!errors.type)}
          />
          {errors.type && (
            <p className="text-[10px] text-red-500 font-semibold">
              {errors.type}
            </p>
          )}
        </div>

        {/* Percentage */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Percent size={11} className="text-slate-400" />
            Percentage (%) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            placeholder="e.g. 10.00"
            min={0}
            max={100}
            step={0.01}
            className={inputCls(!!errors.percentage)}
          />
          {errors.percentage && (
            <p className="text-[10px] text-red-500 font-semibold">
              {errors.percentage}
            </p>
          )}
          {percentage && !isNaN(parseFloat(percentage)) && (
            <div className="mt-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.max(0, parseFloat(percentage)))}%`,
                }}
              />
            </div>
          )}
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-[13px] font-bold text-slate-500 hover:bg-slate-50 transition-all disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className={`flex-1 py-3.5 rounded-2xl text-[13px] font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60 ${
              isEdit
                ? "bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-200"
                : "bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-indigo-200"
            }`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ─── Confirm Delete Modal ─── */
function ConfirmModal({
  title,
  subtitle,
  loading,
  onClose,
  onConfirm,
}: {
  title: string;
  subtitle?: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell
      title={title}
      subtitle={subtitle}
      loading={loading}
      onClose={onClose}
      headerColor="from-red-500 to-rose-600"
      icon={Trash2}
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800 font-semibold">
          ⚠️ This action cannot be undone.
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-[13px] font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-200 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ─── Details Modal ─── */
function DetailsModal({ id, onClose }: { id: number; onClose: () => void }) {
  const {
    data: apiResponse,
    isFetching,
    isError,
  } = useAdminPercentageQuery(id);
  const detail: ApiPercentage | null =
    (apiResponse as any)?.data ?? (apiResponse as any) ?? null;

  return (
    <ModalShell
      title="Percentage Details"
      subtitle={`GET /percentage/${id}`}
      loading={isFetching}
      onClose={onClose}
      headerColor="from-slate-700 to-slate-900"
      icon={Eye}
    >
      {isFetching ? (
        <div className="flex items-center justify-center gap-2 text-[12px] text-gray-500 font-semibold py-10">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : isError || !detail ? (
        <div className="text-[12px] text-red-500 font-semibold py-4">
          Failed to load details
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "ID", value: detail.id, icon: Hash },
              { label: "Type", value: detail.type, icon: Tag },
              {
                label: "Percentage",
                value: `${parseFloat(detail.percentage).toFixed(2)}%`,
                icon: Percent,
              },
              {
                label: "Created",
                value: formatDate(detail.createdAt),
                icon: Clock,
              },
              {
                label: "Updated",
                value: formatDate(detail.updatedAt),
                icon: Clock,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl bg-gray-50 border border-gray-100 px-3 py-3"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={10} className="text-gray-400" />
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    {label}
                  </p>
                </div>
                <p className="text-[13px] font-bold text-gray-800 break-words">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </ModalShell>
  );
}

/* ─── Mobile Card Row ─── */
function MobileCard({
  p,
  onView,
  onEdit,
  onDelete,
}: {
  p: UiPercentage;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-bold text-gray-400 font-mono flex-shrink-0">
            #{p.id}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize truncate ${typeBadgeColor(p.type)}`}
          >
            <Tag size={9} />
            {p.type}
          </span>
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onView}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 active:scale-95 transition-all"
            title="View"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={onEdit}
            className="w-9 h-9 rounded-xl border border-amber-200 bg-amber-50 flex items-center justify-center text-amber-600 hover:bg-amber-100 active:scale-95 transition-all"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            className="w-9 h-9 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 active:scale-95 transition-all"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Percentage bar */}
      <div className="flex items-center gap-3">
        <span className="text-[18px] font-extrabold text-indigo-600 leading-none">
          {p.percentage === null ? "—" : `${p.percentage.toFixed(2)}%`}
        </span>
        {p.percentage !== null && (
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
              style={{ width: `${Math.min(100, p.percentage)}%` }}
            />
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 min-w-0">
          <Clock size={10} className="text-gray-300 flex-shrink-0" />
          <span className="text-[10px] text-gray-400 font-semibold truncate">
            {p.createdAt}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════ */
export default function PercentageManager() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<
    | { type: "none" }
    | { type: "details"; id: number }
    | { type: "create" }
    | { type: "edit"; item: UiPercentage }
    | { type: "delete"; item: UiPercentage }
  >({ type: "none" });

  const {
    data: apiResponse,
    isFetching,
    isError,
    refetch,
  } = useAdminPercentagesQuery({
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const [createPercentage, createState] = useAdminCreatePercentageMutation();
  const [updatePercentage, updateState] = useAdminUpdatePercentageMutation();
  const [deletePercentage, deleteState] = useAdminDeletePercentageMutation();

  const items = useMemo<UiPercentage[]>(() => {
    return extractList(apiResponse).map(toUi);
  }, [apiResponse]);

  const total = extractTotal(apiResponse);
  const totalPages =
    total === null
      ? Math.max(1, page)
      : Math.max(1, Math.ceil(total / PAGE_SIZE));

  const canPrev = page > 1;
  const canNext = page < totalPages;
  const anyLoading =
    createState.isLoading || updateState.isLoading || deleteState.isLoading;

  const closeModal = () => setModal({ type: "none" });

  const avgPct =
    items.length > 0
      ? items.reduce((s, i) => s + (i.percentage ?? 0), 0) / items.length
      : 0;

  return (
    <>
      <div className="min-h-screen bg-white p-3 sm:p-4 lg:p-6">
        {/* ═══ HEADER CARD ═══ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 overflow-hidden">
          {/* Gradient top band */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 px-4 sm:px-6 py-4 sm:py-5">
            {/* Title row */}
            <div className="flex items-start gap-3 mb-3 sm:mb-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/30">
                <BarChart3 size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-0.5">
                  Admin · Finance
                </p>
                <h1 className="text-[18px] sm:text-[22px] font-extrabold text-white tracking-tight leading-none">
                  Percentage Manager
                </h1>
                <p className="text-[11px] text-indigo-200 mt-1 font-medium">
                  Create, edit and manage commission percentages
                </p>
              </div>
            </div>

            {/* Action buttons row — below title on mobile */}
            <div className="flex items-center gap-2 flex-wrap mt-3 sm:mt-0 sm:absolute sm:top-4 sm:right-6">
              <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl">
                <TrendingUp size={12} />
                {items.length} Entries
              </span>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl hover:bg-white/25 active:scale-95 transition-all"
              >
                <RefreshCw size={12} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setModal({ type: "create" })}
                className="inline-flex items-center gap-1.5 bg-white text-indigo-600 text-[12px] font-extrabold px-4 py-2 rounded-xl hover:bg-indigo-50 active:scale-95 transition-all shadow-lg"
              >
                <Plus size={14} />
                <span>Create</span>
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
            {[
              {
                label: "Total",
                value: items.length,
                icon: Hash,
                color: "text-indigo-600",
                bg: "bg-indigo-50",
              },
              {
                label: "Avg. %",
                value: `${avgPct.toFixed(2)}%`,
                icon: Percent,
                color: "text-violet-600",
                bg: "bg-violet-50",
              },
              {
                label: "Page",
                value: `${page} / ${totalPages}`,
                icon: BarChart3,
                color: "text-slate-600",
                bg: "bg-slate-100",
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div
                key={label}
                className="px-3 sm:px-6 py-3 flex items-center gap-2 sm:gap-3"
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon size={14} className={color} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                    {label}
                  </p>
                  <p className="text-[14px] sm:text-[18px] font-extrabold text-gray-900 leading-none mt-0.5 truncate">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ TABLE / CARD SECTION ═══ */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 w-full sm:w-72 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by type…"
                className="w-full text-[13px] font-semibold text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => canPrev && setPage((p) => p - 1)}
                disabled={!canPrev}
                className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 active:scale-95 transition-all"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-[12px] font-bold text-gray-600 px-1 whitespace-nowrap">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => canNext && setPage((p) => p + 1)}
                disabled={!canNext}
                className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 active:scale-95 transition-all"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* ─── DESKTOP: Table (hidden on mobile) ─── */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  {[
                    "ID",
                    "Type",
                    "Percentage",
                    "Created At",
                    "Updated At",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isFetching ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                        <p className="text-[12px] font-semibold">Loading…</p>
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-14 text-center text-[12px] font-semibold text-red-500"
                    >
                      Failed to load percentages
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                          <BarChart3 size={20} className="text-gray-300" />
                        </div>
                        <p className="text-[12px] font-semibold text-gray-400">
                          No percentages found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-indigo-50/20 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[12px] font-bold text-gray-500 font-mono">
                          #{p.id}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${typeBadgeColor(p.type)}`}
                        >
                          <Tag size={9} />
                          {p.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-extrabold text-indigo-600">
                            {p.percentage === null
                              ? "—"
                              : `${p.percentage.toFixed(2)}%`}
                          </span>
                          {p.percentage !== null && (
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                                style={{
                                  width: `${Math.min(100, p.percentage)}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-[11px] font-semibold text-gray-500">
                          {p.createdAt}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-[11px] font-semibold text-gray-500">
                          {p.updatedAt}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              setModal({ type: "details", id: p.id })
                            }
                            className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                            title="View"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => setModal({ type: "edit", item: p })}
                            className="w-8 h-8 rounded-lg border border-amber-200 bg-amber-50 flex items-center justify-center text-amber-600 hover:bg-amber-100 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() =>
                              setModal({ type: "delete", item: p })
                            }
                            className="w-8 h-8 rounded-lg border border-red-200 bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ─── MOBILE: Card list (shown only on mobile) ─── */}
          <div className="sm:hidden">
            {isFetching ? (
              <div className="flex flex-col items-center gap-2 text-gray-400 py-14">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                <p className="text-[12px] font-semibold">Loading…</p>
              </div>
            ) : isError ? (
              <div className="px-4 py-14 text-center text-[12px] font-semibold text-red-500">
                Failed to load percentages
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-14">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <BarChart3 size={20} className="text-gray-300" />
                </div>
                <p className="text-[12px] font-semibold text-gray-400">
                  No percentages found
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-2.5">
                {items.map((p) => (
                  <MobileCard
                    key={p.id}
                    p={p}
                    onView={() => setModal({ type: "details", id: p.id })}
                    onEdit={() => setModal({ type: "edit", item: p })}
                    onDelete={() => setModal({ type: "delete", item: p })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <p className="text-[11px] text-gray-400 font-semibold">
                Showing{" "}
                <span className="text-gray-700 font-bold">{items.length}</span>{" "}
                entries
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => canPrev && setPage((p) => p - 1)}
                  disabled={!canPrev}
                  className="h-8 w-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 active:scale-95 transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[12px] font-bold text-gray-600">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => canNext && setPage((p) => p + 1)}
                  disabled={!canNext}
                  className="h-8 w-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 active:scale-95 transition-all"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Modals ═══ */}
      {modal.type === "details" && (
        <DetailsModal id={modal.id} onClose={closeModal} />
      )}

      {modal.type === "create" && (
        <PercentageFormModal
          title="Create Percentage"
          subtitle="POST /percentage"
          loading={createState.isLoading}
          initialType=""
          initialPercentage=""
          onClose={closeModal}
          onSubmit={async (body) => {
            await createPercentage({
              type: body.type,
              percentage: Number(body.percentage) || 0,
            }).unwrap();
            closeModal();
          }}
        />
      )}

      {modal.type === "edit" && (
        <PercentageFormModal
          title="Edit Percentage"
          subtitle={`PATCH /percentage/${modal.item.id}`}
          loading={updateState.isLoading}
          initialType={modal.item.type}
          initialPercentage={String(modal.item.percentage ?? "")}
          onClose={closeModal}
          isEdit
          onSubmit={async (body) => {
            await updatePercentage({
              id: modal.item.id,
              body: {
                type: body.type,
                percentage: Number(body.percentage) || 0,
              },
            }).unwrap();
            closeModal();
          }}
        />
      )}

      {modal.type === "delete" && (
        <ConfirmModal
          title="Delete Percentage"
          subtitle={`ID: ${modal.item.id} · ${modal.item.type}`}
          loading={deleteState.isLoading}
          onClose={closeModal}
          onConfirm={async () => {
            try {
              await deletePercentage(modal.item.id).unwrap();
              toast.success("Percentage deleted successfully");
            } catch (err: any) {
              toast.error(err?.data?.message || "Failed to delete percentage");
            } finally {
              setModal({ type: "none" });
            }
          }}
        />
      )}

      {anyLoading && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60]">
          <div className="rounded-2xl bg-gray-900 text-white px-4 py-2.5 text-[12px] font-semibold shadow-xl flex items-center gap-2">
            <Loader2 size={12} className="animate-spin" /> Processing…
          </div>
        </div>
      )}
    </>
  );
}
