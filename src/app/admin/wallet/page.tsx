"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Users,
  Wallet,
  X,
  Sparkles,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { useAdminWalletsQuery, useAdminDeleteWalletMutation } from "@/lib/api/admin/wallet";
import { toast } from "sonner";

type UiWallet = {
  id: number | string;
  balance: string;
  user: {
    name: string;
    email: string;
    photo: string;
  };
  createdAt: string;
};

const PAGE_SIZE = 10;

function extractList(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function extractTotal(payload: any): number | null {
  const candidates = [payload?.data?.meta?.total, payload?.meta?.total];
  for (const v of candidates) {
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return null;
}

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

function toUi(raw: any): UiWallet | null {
  const id = raw?.id;
  if (!id) return null;
  const user = raw?.user || {};
  return {
    id,
    balance: raw?.balance ?? "0.00",
    user: {
      name: user.name || "—",
      email: user.email || "—",
      photo: user.photo || "",
    },
    createdAt: formatDate(raw?.createdAt),
  };
}

function Avatar({ name, src }: { name: string; src?: string }) {
  if (src && src.startsWith("http")) {
    return (
      <img
        src={src}
        alt={name}
        className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow-sm"
      />
    );
  }
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const colors = [
    "bg-violet-100 text-violet-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-pink-100 text-pink-700",
    "bg-amber-100 text-amber-700",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0 ring-2 ring-white shadow-sm ${colors[idx]}`}
    >
      {initials || "?"}
    </div>
  );
}

export default function AdminWalletPage(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useAdminWalletsQuery({
    search,
    page,
    limit: PAGE_SIZE,
  });

  const [deleteId, setDeleteId] = useState<number | string | null>(null);
  const [deleteWallet, { isLoading: isDeleting }] = useAdminDeleteWalletMutation();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteWallet(deleteId).unwrap();
      toast.success("Wallet deleted successfully");
      setDeleteId(null);
    } catch (e: any) {
      toast.error(e?.data?.message || "Failed to delete wallet");
    }
  };

  const list = useMemo(
    () => extractList(data).map(toUi).filter(Boolean) as UiWallet[],
    [data],
  );
  const total = extractTotal(data);
  const totalPages = Math.max(
    1,
    total !== null
      ? Math.ceil(total / PAGE_SIZE)
      : Math.ceil(list.length / PAGE_SIZE) || 1,
  );
  const totalCount = total ?? list.length;
  const totalBalance = list
    .reduce((acc, curr) => acc + Number(curr.balance), 0)
    .toFixed(2);

  // Shared pagination controls to avoid duplication
  const pagination = (
    <div className="px-4 py-3.5 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
      <p className="text-[11px] text-gray-400 font-semibold">
        Showing{" "}
        <span className="text-gray-700">
          {list.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}–
          {Math.min(page * PAGE_SIZE, total ?? list.length)}
        </span>{" "}
        of <span className="text-gray-700">{total ?? list.length}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="h-8 w-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="text-[12px] font-bold text-gray-600 px-1">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="h-8 w-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-3 sm:p-4 lg:p-6 space-y-4">
      {/* ── Premium Header (already responsive) ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 px-5 py-5 sm:px-7 sm:py-6 shadow-lg shadow-violet-200">
        <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 w-24 h-24 rounded-full bg-indigo-400/20 blur-xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl border border-white/20 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Wallet size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-[18px] sm:text-[22px] font-extrabold text-white tracking-tight leading-none">
                  Wallets
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 bg-white/15 border border-white/20 text-white/90 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <Sparkles size={9} /> Premium
                </span>
              </div>
              <p className="text-[12px] text-violet-200 font-medium">
                Manage user wallets and balances.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,.3)] animate-pulse" />
            <span className="text-[11px] font-bold text-white/90 tracking-wide">
              Live
            </span>
          </div>
        </div>
      </div>

      {/* ── Premium Stats Cards (already responsive) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4 group hover:shadow-md transition-shadow">
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-emerald-400 to-emerald-600" />
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            <Wallet size={18} className="text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className="text-[10.5px] font-bold uppercase tracking-widest text-gray-400">
                Total Balance
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
                <TrendingUp size={9} /> Active
              </span>
            </div>
            <p className="text-[26px] sm:text-[28px] font-black text-gray-900 leading-none tracking-tight">
              ৳
              {Number(totalBalance).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4 group hover:shadow-md transition-shadow">
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-violet-400 to-violet-600" />
          <div className="w-11 h-11 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-violet-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className="text-[10.5px] font-bold uppercase tracking-widest text-gray-400">
                Total Wallets
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded-full">
                <Users size={9} /> Users
              </span>
            </div>
            <p className="text-[26px] sm:text-[28px] font-black text-gray-900 leading-none tracking-tight">
              {totalCount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* ── Premium Search Bar (already responsive) ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4">
        <div className="relative flex items-center gap-3">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center pointer-events-none">
            <Search size={13} className="text-violet-500" />
          </div>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by user name or email…"
            className="w-full pl-12 pr-10 py-2.5 text-[13px] font-semibold text-gray-700 placeholder:text-gray-400 placeholder:font-normal outline-none bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                {["User", "Balance", "Created At", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 py-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-10 text-center text-[12px] text-gray-500 font-semibold"
                  >
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2 text-violet-500" />
                    Loading...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-10 text-center text-[12px] text-red-500 font-semibold"
                  >
                    Failed to load wallets
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                        <Wallet size={20} className="text-gray-400" />
                      </div>
                      <p className="text-[12px] text-gray-400 font-semibold">
                        No wallets found.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                list.map((m) => (
                  <tr
                    key={String(m.id)}
                    className="hover:bg-violet-50/20 transition-colors group"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={m.user.name} src={m.user.photo} />
                        <div>
                          <p className="text-[13px] font-bold text-gray-900 leading-none mb-1">
                            {m.user.name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {m.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[13px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                        ৳
                        {Number(m.balance).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-[11px] font-semibold text-gray-400">
                        {m.createdAt}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => setDeleteId(m.id)}
                        className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination}
      </div>

      {/* ── Mobile Cards ── */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500 font-semibold">
            Failed to load wallets
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Wallet size={20} className="text-gray-400" />
            </div>
            <p className="text-gray-400 font-semibold">No wallets found.</p>
          </div>
        ) : (
          list.map((m) => (
            <div
              key={String(m.id)}
              className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3"
            >
              <div className="flex items-center gap-3">
                <Avatar name={m.user.name} src={m.user.photo} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-gray-900 truncate">
                    {m.user.name}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {m.user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Balance
                </span>
                <span className="inline-flex items-center gap-1 text-[15px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                  ৳
                  {Number(m.balance).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Created
                </span>
                <span className="text-[11px] font-semibold text-gray-500">
                  {m.createdAt}
                </span>
              </div>
              
              <div className="pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setDeleteId(m.id)}
                  className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors w-full justify-center"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))
        )}

        {/* Mobile pagination */}
        {list.length > 0 && <div className="mt-4">{pagination}</div>}
      </div>

      {deleteId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Wallet</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this wallet? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl text-gray-600 font-bold hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 text-sm flex items-center gap-2"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
