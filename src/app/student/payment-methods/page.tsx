"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import {
  PaymentMethodStatus,
  PaymentMethodType,
  useStudentCreatePaymentMethodMutation,
  useStudentPaymentMethodsMySearchQuery,
} from "@/lib/api/student/payment-methods";

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

function formatDate(input: any): string {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  return d.toLocaleString();
}

function normalizeType(v: any): string {
  const s = String(v ?? "").toLowerCase().trim();
  if (s === "zinipay") return "zinipay";
  if (s === "nagad") return "nagad";
  if (s === "bank") return "bank";
  if (s === "binance") return "binance";
  if (s === "visa") return "visa";
  return s || "unknown";
}

function normalizeStatus(v: any): string {
  const s = String(v ?? "").toLowerCase().trim();
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

  return {
    id,
    type,
    status,
    label,
    account,
    owner,
    createdAt,
    raw,
  };
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "approved"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
      : status === "pending"
        ? "bg-amber-50 text-amber-700 border border-amber-200"
        : status === "rejected"
          ? "bg-red-50 text-red-700 border border-red-200"
          : "bg-zinc-50 text-zinc-700 border border-zinc-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${cls}`}
    >
      {status}
    </span>
  );
}

function TypePill({ type }: { type: string }) {
  const cls =
    type === "zinipay"
      ? "bg-pink-50 text-pink-700 border border-pink-200"
      : type === "nagad"
        ? "bg-orange-50 text-orange-700 border border-orange-200"
        : type === "bank"
          ? "bg-blue-50 text-blue-700 border border-blue-200"
          : type === "binance"
            ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
            : type === "visa"
              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
              : "bg-zinc-50 text-zinc-700 border border-zinc-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${cls}`}
    >
      {type}
    </span>
  );
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

export default function page() {
  const [filterType, setFilterType] = useState<"" | PaymentMethodType>("");
  const [filterStatus, setFilterStatus] = useState<"" | PaymentMethodStatus>(
    "",
  );
  const [pageNum, setPageNum] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [rawOpen, setRawOpen] = useState(false);

  const { data, isFetching, isError } = useStudentPaymentMethodsMySearchQuery({
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

  return (
    <div className="w-full min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#1447E6] flex items-center justify-center">
            <CreditCard className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-900 dark:text-white leading-none">
              Payment Methods
            </h1>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              POST /payment-methods · GET /payment-methods/my
            </p>
          </div>
        </div>

        <button
          onClick={() => setRawOpen((v) => !v)}
          className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          title="Toggle raw response"
        >
          <Eye className="w-4 h-4 text-zinc-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                Add Payment Method
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Your method will be pending until approved
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
              <Plus className="w-4 h-4 text-zinc-500" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                Type
              </label>
              <select
                value={createType}
                onChange={(e) => setCreateType(e.target.value as PaymentMethodType)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-[12px] font-semibold text-zinc-800 dark:text-zinc-200"
              >
                <option value="zinipay">Zinipay</option>
                <option value="nagad">Nagad</option>
                <option value="bank">Bank</option>
                <option value="binance">Binance</option>
                <option value="visa">Visa</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                Label (optional)
              </label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-[12px] font-semibold text-zinc-800 dark:text-zinc-200"
                placeholder="e.g. My Zinipay"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                {accountLabel}
              </label>
              <input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-[12px] font-semibold text-zinc-800 dark:text-zinc-200"
                placeholder={
                  createType === "bank"
                    ? "1234567890"
                    : createType === "binance"
                      ? "Binance UID"
                      : "01XXXXXXXXX"
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                Name on Account
              </label>
              <input
                value={nameOnAccount}
                onChange={(e) => setNameOnAccount(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-[12px] font-semibold text-zinc-800 dark:text-zinc-200"
                placeholder="Your name"
              />
            </div>

            {createType === "bank" ? (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    Bank Name (optional)
                  </label>
                  <input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-[12px] font-semibold text-zinc-800 dark:text-zinc-200"
                    placeholder="e.g. DBBL"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    Branch (optional)
                  </label>
                  <input
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-[12px] font-semibold text-zinc-800 dark:text-zinc-200"
                    placeholder="Branch name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    Routing Number (optional)
                  </label>
                  <input
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-[12px] font-semibold text-zinc-800 dark:text-zinc-200"
                    placeholder="Routing"
                  />
                </div>
              </>
            ) : null}

            {createType === "binance" ? (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  Binance ID (optional)
                </label>
                <input
                  value={binanceId}
                  onChange={(e) => setBinanceId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-[12px] font-semibold text-zinc-800 dark:text-zinc-200"
                  placeholder="Binance UID"
                />
              </div>
            ) : null}

            <button
              disabled={!canSubmit}
              onClick={async () => {
                if (!canSubmit) return;
                const toastId = toast.loading("Creating payment method...");

                try {
                  const body = cleanBody({
                    type: createType,
                    accountNumber,
                    accountHolderName: nameOnAccount,
                    bankName: createType === "bank" ? bankName : undefined,
                    branchName: createType === "bank" ? branchName : undefined,
                    binanceId: createType === "binance" ? binanceId : undefined,
                  });

                  await create(body as any).unwrap();
                  toast.success("Payment method submitted", { id: toastId });

                  setLabel("");
                  setAccountNumber("");
                  setNameOnAccount("");
                  setBankName("");
                  setBranchName("");
                  setRoutingNumber("");
                  setBinanceId("");
                } catch (e: any) {
                  const msg =
                    e?.data?.message ??
                    e?.error ??
                    "Failed to create payment method";
                  toast.error(String(msg), { id: toastId });
                }
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1447E6] text-white px-4 py-2.5 text-[12px] font-bold disabled:opacity-60 disabled:pointer-events-none hover:brightness-105 transition"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>Submit</>
              )}
            </button>

            <div className="text-[11px] text-zinc-400">Required: account + name</div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                  My Payment Methods
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Filters: type, status, page, limit
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value as any);
                    setPageNum(1);
                  }}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-[12px] font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  <option value="">All types</option>
                  <option value="zinipay">Zinipay</option>
                  <option value="nagad">Nagad</option>
                  <option value="bank">Bank</option>
                  <option value="binance">Binance</option>
                  <option value="visa">Visa</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value as any);
                    setPageNum(1);
                  }}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-[12px] font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  <option value="">All status</option>
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                </select>

                <select
                  value={limit}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    setLimit(Number.isFinite(n) && n > 0 ? n : PAGE_SIZE);
                    setPageNum(1);
                  }}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-[12px] font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  {[10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      limit {n}
                    </option>
                  ))}
                </select>

                <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-[12px] font-semibold text-zinc-700 dark:text-zinc-200">
                  <button
                    onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                    disabled={pageNum <= 1}
                    className="disabled:opacity-40"
                    title="Previous"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span>
                    Page {pageNum} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPageNum((p) => Math.min(totalPages, p + 1))}
                    disabled={pageNum >= totalPages}
                    className="disabled:opacity-40"
                    title="Next"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-100 dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-950">
                  <tr>
                    {[
                      "Label",
                      "Type",
                      "Account",
                      "Owner",
                      "Status",
                      "Created",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                  {isFetching ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10">
                        <div className="flex items-center justify-center gap-2 text-[12px] text-zinc-500 font-semibold">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                        </div>
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-[12px] text-red-600 font-semibold"
                      >
                        Failed to load payment methods
                      </td>
                    </tr>
                  ) : list.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-[12px] text-zinc-400"
                      >
                        No payment methods found.
                      </td>
                    </tr>
                  ) : (
                    list.map((m) => (
                      <tr key={String(m.id)}>
                        <td className="px-4 py-3 text-[12px] font-bold text-zinc-900 dark:text-white whitespace-nowrap">
                          {m.label}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <TypePill type={m.type} />
                        </td>
                        <td className="px-4 py-3 text-[12px] font-semibold text-zinc-700 dark:text-zinc-200 whitespace-nowrap">
                          {m.account}
                        </td>
                        <td className="px-4 py-3 text-[12px] font-semibold text-zinc-700 dark:text-zinc-200 whitespace-nowrap">
                          {m.owner}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusPill status={m.status} />
                        </td>
                        <td className="px-4 py-3 text-[12px] font-semibold text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                          {m.createdAt}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {rawOpen ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Raw API Response
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    GET /payment-methods/my
                  </p>
                </div>
              </div>

              <div className="mt-4">
                {isFetching ? (
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-zinc-500 dark:text-zinc-400">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                  </div>
                ) : isError ? (
                  <div className="text-[12px] font-semibold text-red-600">
                    Failed to load
                  </div>
                ) : (
                  <pre className="text-[11px] text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 overflow-auto max-h-[520px]">
                    {JSON.stringify(data ?? null, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
