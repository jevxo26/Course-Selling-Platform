"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Search,
  ShoppingBag,
  Plus,
  X,
  Banknote,
  Package,
  Tag,
  Clock,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  HourglassIcon,
  Layers,
  Filter,
  RefreshCw,
  Globe,
  Hash,
  Calendar,
  ArrowUpRight,
  Sparkles,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useStudentMyProductsQuery } from "@/lib/api/student/products";
import { useStudentWithdrawRequestMutation } from "@/lib/api/student/withdraw";
import CreateProductModal from "./CreateProductModal";

const TakaIcon = ({ className }: { className?: string }) => (
  <span className={`font-extrabold flex items-center justify-center leading-none ${className || ""}`}>৳</span>
);

/* ─── Types ──────────────────────────────────────────────────────── */
type UiUser = {
  id?: string | number;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  country?: string;
  telegram?: string;
  whatsapp?: string;
  isActive?: boolean;
  isBanned?: boolean;
};

type UiProduct = {
  id: number | string;
  title: string;
  category: string;
  price: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  botName: string;
  countryCodes: string[];
  user: UiUser | null;
  extra: { label: string; value: string }[];
};

type StatusFilter = "all" | "pending" | "approved" | "rejected";

const PAGE_SIZE = 10;

/* ─── Helpers ────────────────────────────────────────────────────── */
function formatDate(value: unknown): string {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function extractList(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  for (const key of ["items", "products", "myProducts", "data"]) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.products)) return payload.data.products;
  if (Array.isArray(payload?.data?.myProducts)) return payload.data.myProducts;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
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

// Keys shown as dedicated fields — skip in extra loop
const KNOWN_KEYS = new Set([
  "id",
  "_id",
  "productId",
  "courseId",
  "botName",
  "title",
  "name",
  "productName",
  "category",
  "categoryName",
  "totalAmount",
  "price",
  "amount",
  "total",
  "status",
  "state",
  "approvalStatus",
  "createdAt",
  "created_at",
  "updatedAt",
  "updated_at",
  "description",
  "desc",
  "summary",
  "countryCodes",
  "user",
  "owner",
  "student",
  "creator",
]);

function humanLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function extractUser(raw: any): UiUser | null {
  const u = raw?.user ?? raw?.owner ?? raw?.student ?? raw?.creator ?? null;
  if (!u || typeof u !== "object") return null;
  return {
    id: u.id ?? u._id,
    name: u.name ?? u.fullName ?? u.username,
    email: u.email,
    phone: u.phone,
    role: u.role,
    country: u.country,
    telegram: u.telegram,
    whatsapp: u.whatsapp,
    isActive: u.isActive,
    isBanned: u.isBanned,
  };
}

function toUi(raw: any): UiProduct | null {
  const id = raw?.id ?? raw?._id ?? raw?.productId ?? raw?.courseId ?? null;
  if (!id) return null;

  const title =
    String(
      raw?.botName ??
      raw?.title ??
      raw?.name ??
      raw?.productName ??
      raw?.course?.title ??
      "—",
    ).trim() || "—";
  const category =
    String(
      raw?.category ?? raw?.categoryName ?? raw?.course?.category ?? "—",
    ).trim() || "—";
  const priceRaw =
    raw?.totalAmount ?? raw?.price ?? raw?.amount ?? raw?.total ?? null;
  const price = priceRaw == null || priceRaw === "" ? "—" : String(priceRaw);
  const status =
    String(raw?.status ?? raw?.state ?? raw?.approvalStatus ?? "—").trim() ||
    "—";
  const createdAt = formatDate(raw?.createdAt ?? raw?.created_at);
  const updatedAt = formatDate(raw?.updatedAt ?? raw?.updated_at);
  const description = String(
    raw?.description ?? raw?.desc ?? raw?.summary ?? "",
  ).trim();
  const botName = String(raw?.botName ?? "").trim();
  const countryCodes: string[] = Array.isArray(raw?.countryCodes)
    ? raw.countryCodes
    : [];
  const user = extractUser(raw);

  // Remaining unknown fields as labeled pairs
  const extra: { label: string; value: string }[] = [];
  if (raw && typeof raw === "object") {
    for (const [k, v] of Object.entries(raw)) {
      if (KNOWN_KEYS.has(k) || v == null || v === "") continue;
      if (typeof v === "object") {
        extra.push({ label: humanLabel(k), value: JSON.stringify(v, null, 2) });
      } else {
        extra.push({ label: humanLabel(k), value: String(v) });
      }
    }
  }

  return {
    id,
    title,
    category,
    price,
    status,
    createdAt,
    updatedAt,
    description,
    botName,
    countryCodes,
    user,
    extra,
  };
}

/* ─── Status config ──────────────────────────────────────────────── */
const STATUS_CFG: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  approved: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  active: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  rejected: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  paid: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
};

const isApproved = (s: string) =>
  ["approved", "active", "paid"].includes(s.toLowerCase());

/* ─── Small components ───────────────────────────────────────────── */
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
      {status}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.FC<any>;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {label}
        </p>
        <p className="text-lg font-black text-gray-900 leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

// A single labeled field row in the details modal
function Field({
  label,
  value,
  icon: Icon,
  mono,
}: {
  label: string;
  value: string;
  icon?: React.FC<any>;
  mono?: boolean;
}) {
  if (!value || value === "—") return null;
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p
        className={`text-[13px] font-medium text-gray-900 break-words ${mono ? "font-mono text-[11px]" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

/* ─── User Card in Modal ─────────────────────────────────────────── */
function UserCard({ user }: { user: UiUser }) {
  const initials = (user.name ?? "?").charAt(0).toUpperCase();
  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-indigo-100 bg-indigo-50/60">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">
            User / Owner
          </p>
          <p className="text-[13px] font-bold text-gray-900 truncate">
            {user.name ?? "—"}
          </p>
        </div>
        {user.isActive !== undefined && (
          <span
            className={`ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${user.isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-gray-100 text-gray-500 border-gray-200"
              }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-gray-400"}`}
            />
            {user.isActive ? "Active" : "Inactive"}
          </span>
        )}
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">
        {user.id && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-100">
            <Hash className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                ID
              </p>
              <p className="text-[11px] font-mono text-gray-700 truncate">
                {String(user.id)}
              </p>
            </div>
          </div>
        )}
        {user.email && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-100">
            <Mail className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                Email
              </p>
              <p className="text-[11px] font-medium text-gray-700 truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}
        {user.phone && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-100">
            <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                Phone
              </p>
              <p className="text-[11px] font-medium text-gray-700 truncate">
                {user.phone}
              </p>
            </div>
          </div>
        )}
        {user.role && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-100">
            <Shield className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                Role
              </p>
              <p className="text-[11px] font-medium text-gray-700 capitalize">
                {user.role}
              </p>
            </div>
          </div>
        )}
        {user.country && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-100">
            <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                Country
              </p>
              <p className="text-[11px] font-medium text-gray-700 truncate">
                {user.country}
              </p>
            </div>
          </div>
        )}
        {user.telegram && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-100">
            <Globe className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                Telegram
              </p>
              <p className="text-[11px] font-medium text-gray-700 truncate">
                {user.telegram}
              </p>
            </div>
          </div>
        )}
        {user.whatsapp && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-100">
            <Phone className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                WhatsApp
              </p>
              <p className="text-[11px] font-medium text-gray-700 truncate">
                {user.whatsapp}
              </p>
            </div>
          </div>
        )}
        {user.isBanned && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-100 sm:col-span-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <p className="text-[11px] font-bold text-red-600">
              This account is banned
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Details Modal ──────────────────────────────────────────────── */
function ProductDetailsModal({
  product,
  onClose,
  onWithdraw,
  isWithdrawing,
}: {
  product: UiProduct;
  onClose: () => void;
  onWithdraw: () => void;
  isWithdrawing: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col mx-2 sm:mx-0">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[14px] font-extrabold text-gray-900 truncate">
                Product Details
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                {product.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Hero banner */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-1">
                  Product
                </p>
                <h3 className="text-xl font-black break-words">
                  {product.title}
                </h3>
                {product.category !== "—" && (
                  <p className="text-indigo-200 mt-1 text-[12px] font-semibold flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> {product.category}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                <StatusPill status={product.status} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="bg-white/15 rounded-xl p-3">
                <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-bold mb-1">
                  Price
                </p>
                <p className="text-2xl font-black">
                  {product.price !== "—"
                    ? `৳${Number(product.price).toLocaleString()}`
                    : "—"}
                </p>
              </div>
              <div className="bg-white/15 rounded-xl p-3">
                <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-bold mb-1">
                  Created
                </p>
                <p className="text-[13px] font-bold">{product.createdAt}</p>
              </div>
            </div>
          </div>

          {/* Structured fields */}
          <div className="grid grid-cols-1 gap-3">
            <Field
              label="Product ID"
              value={String(product.id)}
              icon={Hash}
              mono
            />
            {product.botName && product.botName !== product.title && (
              <Field label="Bot Name" value={product.botName} icon={Package} />
            )}
            <Field label="Category" value={product.category} icon={Tag} />
            <Field label="Status" value={product.status} icon={BarChart3} />
            <Field
              label="Price"
              value={
                product.price !== "—"
                  ? `৳${Number(product.price).toLocaleString()}`
                  : "—"
              }
              icon={TakaIcon}
            />
            <Field
              label="Created At"
              value={product.createdAt}
              icon={Calendar}
            />
            {product.updatedAt && product.updatedAt !== "—" && (
              <Field
                label="Updated At"
                value={product.updatedAt}
                icon={Clock}
              />
            )}
            {product.description && (
              <Field
                label="Description"
                value={product.description}
                icon={Package}
              />
            )}
          </div>

          {/* Country codes */}
          {product.countryCodes.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-3">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Target Countries
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.countryCodes.map((c) => (
                  <span
                    key={c}
                    className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-xl text-[11px] font-bold shadow-sm flex items-center gap-1"
                  >
                    <Globe className="w-3 h-3 text-indigo-400" /> {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── USER CARD ── */}
          {product.user && <UserCard user={product.user} />}

          {/* Extra fields from API */}
          {product.extra.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-3"
            >
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                {label}
              </p>
              <p className="text-[12px] font-medium text-gray-800 break-words whitespace-pre-wrap">
                {value}
              </p>
            </div>
          ))}

          {/* Withdraw CTA */}
          {isApproved(product.status) && (
            <button
              onClick={onWithdraw}
              disabled={isWithdrawing}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-md shadow-emerald-200 disabled:opacity-50"
            >
              {isWithdrawing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Banknote className="w-4 h-4" />
              )}
              Request Withdrawal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Mobile card ────────────────────────────────────────────────── */
function MobileProductCard({
  p,
  onView,
  onWithdraw,
  isWithdrawing,
}: {
  p: UiProduct;
  onView: () => void;
  onWithdraw: () => void;
  isWithdrawing: boolean;
}) {
  return (
    <div className="p-4 border-b border-gray-100 last:border-0 bg-white hover:bg-gray-50/60 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-black text-indigo-600">
              {p.title.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-gray-900 truncate">
              {p.title}
            </p>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <StatusPill status={p.status} />
              {p.category !== "—" && (
                <span className="text-[11px] text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-lg font-bold">
                  {p.category}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {p.price !== "—" && (
                <span className="text-[12px] font-black text-gray-900 flex items-center gap-0.5">
                  <TakaIcon className="w-3 h-3 text-emerald-500" />
                  {Number(p.price).toLocaleString()}
                </span>
              )}
              <span className="text-[11px] text-gray-400">{p.createdAt}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <button
            onClick={onView}
            className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {isApproved(p.status) && (
            <button
              onClick={onWithdraw}
              disabled={isWithdrawing}
              className="w-8 h-8 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 disabled:opacity-50"
            >
              <Banknote className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Table columns ──────────────────────────────────────────────── */
const COLUMNS = [
  { key: "product", label: "Product", icon: Package, sub: "Name & ID" },
  { key: "category", label: "Category", icon: Tag, sub: "Type" },
  { key: "price", label: "Price", icon: TakaIcon, sub: "Amount" },
  { key: "status", label: "Status", icon: BarChart3, sub: "State" },
  { key: "created", label: "Created", icon: Calendar, sub: "Date" },
  { key: "actions", label: "Actions", icon: ArrowUpRight, sub: "Operations" },
];

/* ─── Main page ──────────────────────────────────────────────────── */
export default function StudentProductsManager() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [details, setDetails] = useState<UiProduct | null>(null);
  const [isCreateOpen, setCreate] = useState(false);

  const [requestWithdraw, { isLoading: isWithdrawing }] =
    useStudentWithdrawRequestMutation();

  const { data, isFetching, isError, refetch } = useStudentMyProductsQuery({
    search: search || undefined,
    status: status === "all" ? undefined : status,
    page,
    limit: PAGE_SIZE,
  });

  const items = useMemo(() => {
    return extractList(data).map(toUi).filter(Boolean) as UiProduct[];
  }, [data]);

  const total = extractTotal(data);
  const totalPages =
    total === null
      ? Math.max(1, page)
      : Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const approvedCount = items.filter((p) => isApproved(p.status)).length;
  const pendingCount = items.filter(
    (p) => p.status.toLowerCase() === "pending",
  ).length;
  const totalValue = items.reduce(
    (s, p) => s + (isNaN(Number(p.price)) ? 0 : Number(p.price)),
    0,
  );

  async function handleWithdraw(productId: string | number) {
    const toastId = toast.loading("Requesting withdrawal…");
    try {
      await requestWithdraw({ productId }).unwrap();
      toast.success("Withdrawal requested successfully!", { id: toastId });
      setDetails(null);
    } catch (e: any) {
      toast.error(
        e?.data?.message || e?.error || "Failed to request withdrawal",
        { id: toastId },
      );
    }
  }

  return (
    <div className="min-h-screen pb-16 bg-white">
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 px-4 sm:px-8 py-6">
        <div className="w-full max-w-full mx-auto">


          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
                <ShoppingBag className="w-7 h-7 text-white" />
              </div>
              <div>

                <h1 className="mt-1 text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  My Products
                </h1>
                <p className="text-[12px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                  Manage, track &amp; withdraw your product earnings
                </p>
              </div>
            </div>

            <button
              onClick={() => setCreate(true)}
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap self-start lg:self-auto"
            >
              <Plus className="w-4 h-4" />
              Add New Product
              <Sparkles className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>

          {/* Stat cards */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              icon={Package}
              label="Total Products"
              value={total ?? items.length}
              color="bg-indigo-100 text-indigo-600"
            />
            <StatCard
              icon={CheckCircle2}
              label="Approved"
              value={approvedCount}
              color="bg-emerald-100 text-emerald-600"
            />
            <StatCard
              icon={HourglassIcon}
              label="Pending"
              value={pendingCount}
              color="bg-amber-100 text-amber-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Value"
              value={`৳${totalValue.toLocaleString()}`}
              color="bg-violet-100 text-violet-600"
            />
          </div>
        </div>
      </div>

      {/* ── TABLE SECTION ──────────────────────────────────────────── */}
      <div className="w-full max-w-full mx-auto px-4 sm:px-8 mt-7">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-4 sm:px-5 py-4 border-b border-gray-100 bg-gray-50/40">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 w-full sm:w-72 lg:w-80 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                  <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search products by name…"
                    className="w-full text-[12px] font-semibold text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
                  />
                  {search && (
                    <button
                      onClick={() => {
                        setSearch("");
                        setPage(1);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value as StatusFilter);
                      setPage(1);
                    }}
                    className="h-[42px] pl-9 pr-4 rounded-2xl border border-gray-200 bg-white text-[12px] font-bold text-gray-700 shadow-sm appearance-none cursor-pointer w-full sm:w-auto outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <button
                  onClick={() => refetch?.()}
                  className="h-[42px] w-full sm:w-[42px] rounded-2xl border border-gray-200 bg-white flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm text-[12px] font-bold"
                  title="Refresh"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
                  />
                  <span className="sm:hidden">Refresh</span>
                </button>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2">
                <button
                  onClick={() => canPrev && setPage((p) => p - 1)}
                  disabled={!canPrev}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />{" "}
                  <span className="hidden xs:inline">Prev</span>
                </button>
                <div className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-[11px] font-black shadow-sm min-w-[64px] text-center">
                  {page} / {totalPages}
                </div>
                <button
                  onClick={() => canNext && setPage((p) => p + 1)}
                  disabled={!canNext}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  <span className="hidden xs:inline">Next</span>{" "}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {isFetching ? (
            <div className="flex items-center justify-center py-20">
              <div className="inline-flex flex-col items-center gap-3 text-gray-500">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                </div>
                <p className="text-[12px] font-bold">Loading products…</p>
              </div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-20">
              <div className="inline-flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <p className="text-[12px] font-bold text-red-600">
                  Failed to load products
                </p>
                <button
                  onClick={() => refetch?.()}
                  className="text-[11px] font-bold text-indigo-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="inline-flex flex-col items-center gap-3 text-gray-500">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <ShoppingBag className="h-7 w-7 text-gray-300" />
                </div>
                <p className="text-[13px] font-bold text-gray-700">
                  No products found
                </p>
                <button
                  onClick={() => setCreate(true)}
                  className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-100"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Product
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      {COLUMNS.map((col) => {
                        const Icon = col.icon;
                        return (
                          <th
                            key={col.key}
                            className="px-5 py-3.5 text-left whitespace-nowrap text-xs font-semibold text-gray-700"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                                <Icon className="w-3.5 h-3.5 text-indigo-500" />
                              </div>
                              <div>
                                <p className="uppercase tracking-wider">
                                  {col.label}
                                </p>
                                <p className="text-[9px] text-gray-400 font-semibold leading-none mt-0.5">
                                  {col.sub}
                                </p>
                              </div>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.map((p) => (
                      <tr
                        key={String(p.id)}
                        className="hover:bg-indigo-50/30 transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-[11px] font-black text-indigo-600">
                                {p.title.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-bold text-gray-900 truncate max-w-[180px]">
                                {p.title}
                              </p>
                              <p className="text-[10px] font-mono text-gray-400 mt-0.5 flex items-center gap-1">
                                <Hash className="w-2.5 h-2.5" />
                                {String(p.id).slice(0, 12)}
                                {String(p.id).length > 12 ? "…" : ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {p.category !== "—" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-100 text-[11px] font-bold text-violet-700 whitespace-nowrap">
                              <Tag className="w-3 h-3" />
                              {p.category}
                            </span>
                          ) : (
                            <span className="text-[12px] text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <TakaIcon className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            <span className="text-[13px] font-black text-gray-900 tabular-nums">
                              {p.price !== "—"
                                ? Number(p.price).toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                })
                                : "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <StatusPill status={p.status} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-[12px] font-semibold text-gray-600 whitespace-nowrap">
                              {p.createdAt}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                            {isApproved(p.status) && (
                              <button
                                onClick={() => handleWithdraw(p.id)}
                                disabled={isWithdrawing}
                                className="inline-flex items-center gap-1.5 px-3 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap"
                              >
                                <Banknote className="w-3.5 h-3.5" /> Withdraw
                              </button>
                            )}
                            <button
                              onClick={() => setDetails(p)}
                              className="inline-flex items-center gap-1.5 px-3 h-8 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-indigo-600 text-[11px] font-bold transition-colors shadow-sm whitespace-nowrap"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden divide-y divide-gray-100">
                {items.map((p) => (
                  <MobileProductCard
                    key={String(p.id)}
                    p={p}
                    onView={() => setDetails(p)}
                    onWithdraw={() => handleWithdraw(p.id)}
                    isWithdrawing={isWithdrawing}
                  />
                ))}
              </div>
            </>
          )}

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-gray-50/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] font-semibold text-gray-400">
                Showing{" "}
                <span className="font-bold text-gray-600">{items.length}</span>{" "}
                of{" "}
                <span className="font-bold text-gray-600">{total ?? "?"}</span>{" "}
                products
              </p>
              <div className="flex items-center gap-1.5">
                {Array.from(
                  { length: Math.min(totalPages, 5) },
                  (_, i) => i + 1,
                ).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-colors ${n === page ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    {n}
                  </button>
                ))}
                {totalPages > 5 && (
                  <span className="text-gray-400 text-[11px]">…</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── DETAILS MODAL ──────────────────────────────────────────── */}
      {details && (
        <ProductDetailsModal
          product={details}
          onClose={() => setDetails(null)}
          onWithdraw={() => handleWithdraw(details.id)}
          isWithdrawing={isWithdrawing}
        />
      )}

      <CreateProductModal
        isOpen={isCreateOpen}
        onClose={() => setCreate(false)}
      />
    </div>
  );
}
