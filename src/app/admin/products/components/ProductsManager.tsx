"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  Globe,
  Loader2,
  Package,
  Plus,
  Search,
  Shield,
  Trash2,
  TrendingUp,
  X,
  Calendar,
  DollarSign,
  Tag,
  MapPin,
  User,
} from "lucide-react";
import {
  useAdminApproveProductMutation,
  useAdminCreateProductMutation,
  useAdminDeleteProductMutation,
  useAdminProductsQuery,
  useAdminRejectProductMutation,
  useAdminMyProductsQuery,
} from "@/lib/api/admin/products";
import { useAdminDirectWithdrawMutation } from "@/lib/api/admin/withdraw";
import { useAdminPaymentMethodsQuery } from "@/lib/api/admin/payment-methods";

type UiProduct = {
  id: number | string;
  title: string;
  owner: string;
  ownerEmail: string;
  ownerPhoto?: string;
  price: string;
  status: string;
  createdAt: string;
  countryCodes: string[];
  raw: any;
};

type Tab = "all" | "my";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = ["pending", "approved", "paid", "rejected"] as const;

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

function extractList(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.products)) return payload.data.products;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function extractMeta(payload: any) {
  const meta =
    payload?.data?.meta ??
    payload?.meta ??
    payload?.data?.pagination ??
    payload?.pagination ??
    null;
  return {
    total: Number(meta?.total ?? 0),
    page: Number(meta?.page ?? 1),
    limit: Number(meta?.limit ?? PAGE_SIZE),
    totalPages: Number(meta?.totalPages ?? 1),
  };
}

function toUi(raw: any): UiProduct | null {
  const id = raw?.id ?? raw?._id ?? raw?.productId ?? null;
  if (!id) return null;
  const title =
    String(raw?.botName ?? raw?.title ?? raw?.name ?? "").trim() || "—";
  const owner =
    String(
      raw?.user?.name ?? raw?.seller?.name ?? raw?.owner?.name ?? "",
    ).trim() || "—";
  const ownerEmail =
    String(
      raw?.user?.email ?? raw?.seller?.email ?? raw?.owner?.email ?? "",
    ).trim() || "—";
  const ownerPhoto =
    raw?.user?.photo ?? raw?.seller?.photo ?? raw?.owner?.photo ?? undefined;
  const priceRaw = raw?.totalAmount ?? raw?.price ?? raw?.amount ?? null;
  const price =
    priceRaw === null || priceRaw === undefined || priceRaw === ""
      ? "—"
      : `৳${Number(priceRaw).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  const status =
    String(raw?.status ?? raw?.state ?? raw?.approvalStatus ?? "—").trim() ||
    "—";
  const createdAt = formatDate(raw?.createdAt ?? raw?.created_at);
  const countryCodes: string[] = Array.isArray(raw?.countryCodes)
    ? raw.countryCodes
    : [];
  return {
    id,
    title,
    owner,
    ownerEmail,
    ownerPhoto,
    price,
    status,
    createdAt,
    countryCodes,
    raw,
  };
}

function StatusPill({ status }: { status: string }) {
  const v = status.toLowerCase();
  if (v === "approved" || v === "active")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        {status}
      </span>
    );
  if (v === "pending")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse" />
        {status}
      </span>
    );
  if (v === "paid")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
        {status}
      </span>
    );
  if (v === "rejected")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
        {status}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
      {status}
    </span>
  );
}

/* ─── Field wrapper (unchanged) ─── */
function Field({
  label,
  icon: Icon,
  required,
  children,
  hint,
}: {
  label: string;
  icon?: React.ElementType;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
        {Icon && <Icon size={11} className="text-slate-400" />}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 text-[12px] font-semibold border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all";

/* ─── Create Product Modal (unchanged) ─── */
// ... (kept as is, not shown for brevity)

/* ─── ConfirmModal (unchanged) ─── */
// ... (kept as is)

/* ─── PaymentConfirmModal (unchanged) ─── */
// ... (kept as is)

/* ════════════════════════════════════════════
   MAIN LIST PAGE – now fully responsive
════════════════════════════════════════════ */
export default function ProductsManager(): React.JSX.Element {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const all = useAdminProductsQuery({
    search: search || undefined,
    status: status || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const my = useAdminMyProductsQuery(
    {
      search: search || undefined,
      status: status || undefined,
      page,
      limit: PAGE_SIZE,
    },
    { skip: tab !== "my" },
  );

  const listPayload = tab === "my" ? my.data : all.data;
  const listLoading = tab === "my" ? my.isLoading : all.isLoading;
  const listError = tab === "my" ? my.isError : all.isError;

  const products = useMemo(
    () =>
      extractList(listPayload)
        .map(toUi)
        .filter((x): x is UiProduct => Boolean(x)),
    [listPayload],
  );
  const meta = useMemo(() => extractMeta(listPayload), [listPayload]);
  const totalPages = Math.max(1, meta.totalPages);

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UiProduct | null>(null);
  const [rejectTarget, setRejectTarget] = useState<UiProduct | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<UiProduct | null>(null);

  const [createProduct, { isLoading: isCreating }] =
    useAdminCreateProductMutation();
  const [approve, { isLoading: isApproving }] =
    useAdminApproveProductMutation();
  const [reject, { isLoading: isRejecting }] = useAdminRejectProductMutation();
  const [remove, { isLoading: isDeleting }] = useAdminDeleteProductMutation();
  const [direct, { isLoading: isDirecting }] = useAdminDirectWithdrawMutation();
  const busy = isCreating || isApproving || isDeleting || isDirecting;

  // Shared pagination component (used in both views)
  const pagination = (
    <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 flex-wrap gap-3">
      <p className="text-[11px] text-slate-400 font-semibold">
        Showing{" "}
        <span className="text-slate-700 font-black">{products.length}</span> of{" "}
        <span className="text-slate-700 font-black">{meta.total}</span> products
        · Page <span className="text-slate-700 font-black">{page}</span> of{" "}
        <span className="text-slate-700 font-black">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
        >
          <ChevronLeft size={15} />
        </button>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Modals (unchanged) */}
      {/* ... */}

      <div className="min-h-screen bg-white p-4 lg:p-6">
        {/* ── Header (responsive) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-[20px] font-black text-slate-900 tracking-tight">
                Products
              </h1>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                Manage all products &amp; approvals
              </p>
            </div>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            disabled={isCreating}
            className="inline-flex items-center gap-2 bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-[13px] font-bold px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-violet-200 active:scale-95 disabled:opacity-70 disabled:pointer-events-none self-start sm:self-auto"
          >
            <Plus size={15} />
            Create Product
          </button>
        </div>

        {/* ── Stats (2 cols on mobile) ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
          {/* ... stats unchanged, but now use col-span definitions ... */}
          {[
            {
              label: "Total",
              value: meta.total,
              icon: TrendingUp,
              color: "text-violet-600",
              bg: "bg-violet-50",
              border: "border-violet-100",
            },
            {
              label: "This Page",
              value: products.length,
              icon: Package,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
              border: "border-indigo-100",
            },
            {
              label: "Pending",
              value: products.filter(
                (p) => p.status.toLowerCase() === "pending",
              ).length,
              icon: Shield,
              color: "text-amber-600",
              bg: "bg-amber-50",
              border: "border-amber-100",
            },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div
              key={label}
              className={`bg-white rounded-2xl border ${border} p-4 flex items-center gap-3 shadow-sm`}
            >
              <div
                className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}
              >
                <Icon size={15} className={color} />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-semibold">
                  {label}
                </p>
                <p className="text-[18px] font-black text-slate-900 leading-none mt-0.5">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters (stack on mobile) ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 w-fit">
            {(["all", "my"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-[12px] font-bold transition-all ${tab === t
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {t === "all" ? "All Products" : "My Products"}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-64">
              <Search size={14} className="text-slate-400 flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search products..."
                className="w-full text-[12px] font-semibold text-slate-700 placeholder:text-slate-400 outline-none bg-transparent"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 text-[12px] font-bold border border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none focus:border-violet-400 cursor-pointer w-full sm:w-auto"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* ── Desktop Table (hidden on mobile) ── */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {[
                    "Product",
                    "Owner",
                    "Countries",
                    "Price",
                    "Status",
                    "Created",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-5 py-3.5"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {/* ... table body unchanged ... */}
                {listLoading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-violet-400 mx-auto" />
                    </td>
                  </tr>
                ) : listError ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center text-red-500"
                    >
                      Failed to load products
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr
                      key={String(p.id)}
                      className="hover:bg-violet-50/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                            <TrendingUp size={14} className="text-violet-500" />
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-slate-900 leading-tight">
                              {p.title}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              #{p.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {p.ownerPhoto ? (
                            <img
                              src={p.ownerPhoto}
                              alt={p.owner}
                              className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-black text-slate-500">
                                {p.owner.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-[12px] font-bold text-slate-800">
                              {p.owner}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                              {p.ownerEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          {p.countryCodes.length === 0 ? (
                            <span className="text-[11px] text-slate-300">
                              —
                            </span>
                          ) : (
                            p.countryCodes.slice(0, 3).map((cc) => (
                              <span
                                key={cc}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200"
                              >
                                <Globe size={9} />
                                {cc}
                              </span>
                            ))
                          )}
                          {p.countryCodes.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-bold">
                              +{p.countryCodes.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] font-black text-slate-900">
                          {p.price}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill status={p.status} />
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[11px] text-slate-500 font-semibold">
                          {p.createdAt}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              router.push(`/admin/products/${p.id}`)
                            }
                            className="w-8 h-8 rounded-xl border border-slate-200 hover:bg-violet-50 hover:border-violet-200 text-slate-500 hover:text-violet-600 flex items-center justify-center transition-all"
                            title="View details"
                          >
                            <Eye size={13} />
                          </button>
                          {p.status.toLowerCase() === "pending" && (
                            <>
                              <button
                                disabled={busy}
                                onClick={() => setPaymentTarget(p)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 text-[11px] font-bold transition-all disabled:opacity-60 disabled:pointer-events-none"
                              >
                                <CreditCard size={11} />
                                Pay
                              </button>
                              <button
                                disabled={busy}
                                onClick={async () => {
                                  await approve(p.id).unwrap();
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-all disabled:opacity-60 disabled:pointer-events-none"
                              >
                                {isApproving ? (
                                  <Loader2 size={11} className="animate-spin" />
                                ) : (
                                  <Check size={11} />
                                )}
                                Approve
                              </button>
                            </>
                          )}
                          <button
                            disabled={busy}
                            onClick={() => setDeleteTarget(p)}
                            className="w-8 h-8 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-all disabled:opacity-60 disabled:pointer-events-none"
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
          {pagination}
        </div>

        {/* ── Mobile Cards (visible only on mobile) ── */}
        <div className="md:hidden space-y-3">
          {listLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
            </div>
          ) : listError ? (
            <div className="text-center py-12 text-red-500 font-semibold">
              Failed to load products
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-semibold">
              No products found
            </div>
          ) : (
            products.map((p) => (
              <div
                key={String(p.id)}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3"
              >
                {/* Title & Status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                      <TrendingUp size={14} className="text-violet-500" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-slate-900">
                        {p.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        #{p.id}
                      </p>
                    </div>
                  </div>
                  <StatusPill status={p.status} />
                </div>

                {/* Owner & Countries */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {p.ownerPhoto ? (
                      <img
                        src={p.ownerPhoto}
                        alt={p.owner}
                        className="w-6 h-6 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <span className="text-[10px] font-black text-slate-500">
                          {p.owner.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-[12px] font-bold text-slate-800">
                        {p.owner}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {p.ownerEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {p.countryCodes.length === 0 ? (
                      <span className="text-[11px] text-slate-300">—</span>
                    ) : (
                      p.countryCodes.slice(0, 2).map((cc) => (
                        <span
                          key={cc}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200"
                        >
                          <Globe size={9} />
                          {cc}
                        </span>
                      ))
                    )}
                    {p.countryCodes.length > 2 && (
                      <span className="text-[10px] text-slate-400 font-bold">
                        +{p.countryCodes.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price & Date */}
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-black text-slate-900">
                    {p.price}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {p.createdAt}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => router.push(`/admin/products/${p.id}`)}
                    className="flex-1 h-9 rounded-xl border border-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-slate-50"
                  >
                    <Eye size={13} />
                    View
                  </button>
                  {p.status.toLowerCase() === "pending" && (
                    <>
                      <button
                        disabled={busy}
                        onClick={() => setPaymentTarget(p)}
                        className="flex-1 h-9 rounded-xl border border-violet-200 bg-violet-50 text-violet-700 text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-violet-100"
                      >
                        <CreditCard size={13} />
                        Pay
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => approve(p.id)}
                        className="flex-1 h-9 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-emerald-100"
                      >
                        {isApproving ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Check size={13} />
                        )}
                        Approve
                      </button>
                    </>
                  )}
                  <button
                    disabled={busy}
                    onClick={() => setDeleteTarget(p)}
                    className="w-9 h-9 rounded-xl border border-red-200 bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
          {/* Mobile pagination */}
          {products.length > 0 && <div className="mt-4">{pagination}</div>}
        </div>
      </div>
    </>
  );
}
