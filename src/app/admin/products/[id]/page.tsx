"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  CreditCard,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Shield,
  Trash2,
  TrendingUp,
  User,
  Hash,
  Clock,
  DollarSign,
  Activity,
  FileJson,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  useAdminApproveProductMutation,
  useAdminDeleteProductMutation,
  useAdminProductQuery,
} from "@/lib/api/admin/products";

/* ─── helpers ─── */
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

function StatusPill({ status }: { status: string }) {
  const v = status.toLowerCase();
  const map: Record<string, string> = {
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    paid: "bg-blue-50 text-blue-700 border-blue-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };
  const dotMap: Record<string, string> = {
    approved: "bg-emerald-500",
    active: "bg-emerald-500",
    pending: "bg-amber-400 animate-pulse",
    paid: "bg-blue-500",
    rejected: "bg-red-500",
  };
  const cls = map[v] ?? "bg-slate-100 text-slate-600 border-slate-200";
  const dot = dotMap[v] ?? "bg-slate-400";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

function DeleteConfirmModal({
  title,
  loading,
  onClose,
  onConfirm,
}: {
  title: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-sm bg-white sm:rounded-2xl rounded-t-2xl shadow-xl p-6 text-center border border-slate-100 safe-bottom">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden" />
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-500" />
        </div>
        <h3 className="text-[15px] font-bold text-slate-900 mb-1.5">
          Delete product?
        </h3>
        <p className="text-[12px] text-slate-500">
          Permanently delete{" "}
          <span className="font-semibold text-slate-700">{title}</span>. This
          cannot be undone.
        </p>
        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 size={12} className="animate-spin" />}Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Payload display ── */
type JVal = string | number | boolean | null | JVal[] | { [k: string]: JVal };

/** Is this value "simple" enough to render inline in a grid cell? */
function isSimple(val: JVal): boolean {
  if (val === null || val === undefined) return true;
  if (typeof val !== "object") return true;
  if (Array.isArray(val)) return val.every((v) => typeof v !== "object");
  return false;
}

function renderSimpleValue(val: JVal): React.ReactNode {
  if (val === null || val === undefined)
    return <span className="text-slate-300 text-[11px]">—</span>;
  if (typeof val === "boolean")
    return (
      <span
        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${val ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
          }`}
      >
        {val ? "true" : "false"}
      </span>
    );
  if (typeof val === "number")
    return <span className="font-mono text-[11px] text-slate-800">{val}</span>;
  if (typeof val === "string") {
    if (!val) return <span className="text-slate-300 text-[11px]">—</span>;
    if (/^\d{4}-\d{2}-\d{2}T/.test(val))
      return (
        <span className="text-[11px] text-slate-600 flex items-center gap-1">
          <Clock size={9} className="text-slate-400 shrink-0" />
          {formatDate(val)}
        </span>
      );
    if (val.startsWith("http"))
      return (
        <a
          href={val}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-blue-600 underline break-all line-clamp-2"
        >
          {val}
        </a>
      );
    return (
      <span className="text-[11px] text-slate-800 break-words leading-snug">
        {val}
      </span>
    );
  }
  // Simple array (primitives only)
  if (Array.isArray(val)) {
    if (!val.length)
      return <span className="text-slate-300 text-[11px]">—</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {val.map((v, i) => (
          <span
            key={i}
            className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-medium border border-indigo-100"
          >
            {String(v)}
          </span>
        ))}
      </div>
    );
  }
  return (
    <span className="text-[11px] text-slate-800 break-words">
      {String(val)}
    </span>
  );
}

const ICONS: Record<string, React.ElementType> = {
  id: Hash,
  botName: TrendingUp,
  name: User,
  title: TrendingUp,
  status: Activity,
  totalAmount: DollarSign,
  price: DollarSign,
  createdAt: Calendar,
  updatedAt: Calendar,
  created_at: Calendar,
  updated_at: Calendar,
  approvalDate: Calendar,
  approvedByName: Shield,
  rejectReason: AlertTriangle,
  countryCodes: Globe,
  email: Mail,
  phone: Phone,
  country: MapPin,
  role: Shield,
  referCode: Hash,
  user: User,
  paymentMethods: CreditCard,
};

function fieldLabel(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/**
 * PayloadGrid — renders flat key/value pairs in a responsive 2-col (md: 3-col) grid.
 * Complex values (nested objects / arrays of objects) fall through to full-width rows below.
 */
function PayloadGrid({ data }: { data: Record<string, JVal> }) {
  const entries = Object.entries(data);

  const simpleEntries = entries.filter(([, v]) => isSimple(v));
  const complexEntries = entries.filter(([, v]) => !isSimple(v));

  return (
    <div className="w-full space-y-3">
      {/* ── 2/3-col grid for simple scalar / primitive-array values ── */}
      {simpleEntries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-0 divide-y divide-slate-100">
          {simpleEntries.map(([key, val]) => {
            const Icon = ICONS[key] ?? Package;
            return (
              <div key={key} className="py-2 flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <Icon size={9} className="text-slate-400 shrink-0" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">
                    {fieldLabel(key)}
                  </span>
                </div>
                <div className="pl-0.5 min-w-0 overflow-hidden">
                  {renderSimpleValue(val)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Full-width rows for nested objects / arrays of objects ── */}
      {complexEntries.map(([key, val]) => {
        const Icon = ICONS[key] ?? Package;
        return (
          <div key={key} className="w-full">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Icon size={10} className="text-slate-400 shrink-0" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {fieldLabel(key)}
              </span>
            </div>
            <ComplexValue val={val} />
          </div>
        );
      })}
    </div>
  );
}

function ComplexValue({ val }: { val: JVal }) {
  if (val === null || val === undefined)
    return <span className="text-slate-300 text-[11px]">—</span>;

  if (Array.isArray(val)) {
    if (!val.length)
      return <span className="text-slate-300 text-[11px]">—</span>;
    // Array of primitives already handled in isSimple; here it's array of objects
    return (
      <div className="space-y-1.5">
        {(val as any[]).map((item, i) => (
          <div
            key={i}
            className="border border-slate-100 rounded-xl p-3 bg-slate-50/60"
          >
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              #{i + 1}
            </p>
            {typeof item === "object" && item !== null ? (
              <PayloadGrid data={item as Record<string, JVal>} />
            ) : (
              <span className="text-[11px] text-slate-800">{String(item)}</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (typeof val === "object") {
    return (
      <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/40">
        <PayloadGrid data={val as Record<string, JVal>} />
      </div>
    );
  }

  return renderSimpleValue(val);
}

function ApiPayloadCard({ product }: { product: Record<string, JVal> }) {
  const [open, setOpen] = React.useState(true);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-slate-50/60">
        <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
          <FileJson size={13} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800">
            Payload
          </p>
          <p className="text-[10px] text-slate-400 truncate">
            Product #{String(product.id)} · {Object.keys(product).length}
          </p>
        </div>
        <button
          onClick={() => setOpen((p) => !p)}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors shrink-0"
        >
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {open && (
        <div className="p-4">
          <PayloadGrid data={product} />
        </div>
      )}
    </div>
  );
}

/* ── Info Row (used in Owner Info table) ── */
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-1.5 w-24 shrink-0 mt-0.5">
        <Icon size={10} className="text-slate-400 shrink-0" />
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-[12px] font-medium text-slate-800 break-all flex-1 min-w-0">
        {value}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PRODUCT DETAILS PAGE
═══════════════════════════════════════════════ */
export default function ProductDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const productId = params.id;

  const {
    data: productPayload,
    isLoading,
    isError,
  } = useAdminProductQuery(productId);
  const raw = (productPayload as any)?.data ?? productPayload;
  const product = (raw as any)?.data ?? raw ?? null;

  const [approve, { isLoading: isApproving }] =
    useAdminApproveProductMutation();
  const [remove, { isLoading: isDeleting }] = useAdminDeleteProductMutation();

  if (isLoading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center animate-pulse">
            <Package size={22} className="text-white" />
          </div>
          <p className="text-[13px] text-slate-400">Loading product...</p>
        </div>
      </div>
    );

  if (isError || !product)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center w-full max-w-xs">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
          <p className="text-[14px] font-bold text-slate-700">
            Product not found
          </p>
          <p className="text-[12px] text-slate-400 mt-1">
            ID #{productId} does not exist or was removed.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={13} />
            Go back
          </button>
        </div>
      </div>
    );

  const title =
    String(product.botName ?? product.title ?? product.name ?? "").trim() ||
    "—";
  const status = String(product.status ?? product.state ?? "—").trim();
  const price = product.totalAmount ?? product.price ?? null;
  const priceFormatted = price
    ? `৳${Number(price).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : "—";
  const createdAt = formatDate(product.createdAt ?? product.created_at);
  const updatedAt = formatDate(product.updatedAt ?? product.updated_at);
  const approvalDate = product.approvalDate
    ? formatDate(product.approvalDate)
    : null;
  const approvedByName = product.approvedByName ?? null;
  const rejectReason = product.rejectReason ?? null;
  const countryCodes: string[] = Array.isArray(product.countryCodes)
    ? product.countryCodes
    : [];

  const user = product.user ?? product.seller ?? product.owner ?? null;
  const userName = user?.name ?? "—";
  const userEmail = user?.email ?? "—";
  const userPhone = user?.phone ?? null;
  const userCountry = user?.country ?? null;
  const userRole = user?.role ?? null;
  const userPhoto = user?.photo ?? null;
  const userReferCode = user?.referCode ?? null;
  const userActive = user?.isActive ?? null;
  const userBanned = user?.isBanned ?? false;
  const paymentMethods: any[] = Array.isArray(user?.paymentMethods)
    ? user.paymentMethods
    : [];

  const ownerFields = [
    { icon: Mail, label: "Email", value: userEmail },
    ...(userPhone ? [{ icon: Phone, label: "Phone", value: userPhone }] : []),
    ...(userCountry
      ? [{ icon: MapPin, label: "Country", value: userCountry }]
      : []),
    ...(userReferCode
      ? [{ icon: Shield, label: "Refer", value: userReferCode }]
      : []),
    { icon: Hash, label: "User ID", value: `#${user?.id ?? "—"}` },
  ];

  return (
    <>
      {showDeleteModal && (
        <DeleteConfirmModal
          title={title}
          loading={isDeleting}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            await remove(product.id).unwrap();
            router.replace("/admin/products");
          }}
        />
      )}

      <div className="min-h-screen bg-slate-50">
        {/* ── Sticky top bar ── */}
        <div className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur-sm border-b border-slate-200/70 px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-sm shrink-0"
          >
            <ArrowLeft size={13} />
            <span className="hidden xs:inline">Back</span>
          </button>

          <p className="text-[13px] font-bold text-slate-700 truncate flex-1 text-center px-2 hidden sm:block">
            {title}
          </p>

          <div className="flex items-center gap-2 shrink-0">
            {status.toLowerCase() === "pending" && (
              <button
                disabled={isApproving}
                onClick={async () => {
                  await approve(product.id).unwrap();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-[12px] font-semibold transition-colors shadow-sm disabled:opacity-60"
              >
                {isApproving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Check size={13} />
                )}
                <span>Approve</span>
              </button>
            )}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-red-200 hover:bg-red-50 active:bg-red-100 text-red-600 text-[12px] font-semibold transition-colors"
            >
              <Trash2 size={13} />
              <span className="hidden xs:inline">Delete</span>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4 max-w-5xl mx-auto">
          {/* ── Hero Card ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={18} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-[16px] sm:text-[20px] font-bold text-slate-900 truncate">
                    {title}
                  </h1>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    ID: #{String(product.id)}
                  </p>
                </div>
              </div>
              <StatusPill status={status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
              {[
                {
                  label: "Total Amount",
                  value: priceFormatted,
                  cls: "text-violet-700",
                },
                {
                  label: "Countries",
                  value: countryCodes.length
                    ? `${countryCodes.length} countries`
                    : "—",
                  cls: "text-indigo-700",
                },
                { label: "Created", value: createdAt, cls: "text-slate-700" },
                { label: "Updated", value: updatedAt, cls: "text-slate-700" },
              ].map(({ label, value, cls }) => (
                <div
                  key={label}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3"
                >
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                    {label}
                  </p>
                  <p
                    className={`text-[12px] sm:text-[13px] font-bold ${cls} mt-0.5 leading-snug break-words`}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {countryCodes.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1.5">
                  Available Countries
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {countryCodes.map((cc) => (
                    <span
                      key={cc}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200"
                    >
                      <Globe size={9} />
                      {cc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {approvedByName && (
              <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 mt-2">
                <Shield
                  size={13}
                  className="text-emerald-600 shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-[12px] font-semibold text-emerald-700">
                    Approved by{" "}
                    <span className="font-bold text-emerald-900">
                      {approvedByName}
                    </span>
                  </p>
                  {approvalDate && (
                    <p className="text-[10px] text-emerald-600 mt-0.5">
                      {approvalDate}
                    </p>
                  )}
                </div>
              </div>
            )}

            {rejectReason && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 mt-2">
                <AlertTriangle
                  size={13}
                  className="text-red-500 shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-[12px] font-semibold text-red-600">
                    Rejection Reason
                  </p>
                  <p className="text-[11px] text-red-500 mt-0.5">
                    {rejectReason}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Owner + Payment ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Owner Info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                <User size={14} className="text-violet-600" />
                <h2 className="text-[13px] font-bold text-slate-800">
                  Owner Info
                </h2>
              </div>

              <div className="flex items-center gap-3 mb-4">
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt={userName}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                    <span className="text-[15px] font-bold text-violet-600">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-slate-900 truncate">
                    {userName}
                  </p>
                  <div className="flex gap-1.5 mt-0.5 flex-wrap">
                    {userRole && (
                      <span className="px-1.5 py-0.5 bg-violet-50 text-violet-700 text-[9px] font-bold rounded border border-violet-100">
                        {userRole}
                      </span>
                    )}
                    {userBanned && (
                      <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-bold rounded border border-red-100">
                        Banned
                      </span>
                    )}
                    {userActive === false && (
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded border border-slate-200">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-0">
                {ownerFields.map(({ icon, label, value }) => (
                  <InfoRow
                    key={label}
                    icon={icon}
                    label={label}
                    value={value}
                  />
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                <CreditCard size={14} className="text-indigo-600" />
                <h2 className="text-[13px] font-bold text-slate-800">
                  Payment Methods
                </h2>
                <span className="ml-auto text-[10px] font-semibold text-slate-400">
                  {paymentMethods.length} method
                  {paymentMethods.length !== 1 ? "s" : ""}
                </span>
              </div>
              {paymentMethods.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                  <CreditCard size={24} />
                  <p className="text-[12px] text-slate-400 mt-2">
                    No payment methods
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {paymentMethods.map((pm: any) => {
                    const s = String(pm?.status ?? "").toLowerCase();
                    return (
                      <div
                        key={pm?.id}
                        className="border border-slate-200 rounded-xl p-3 hover:border-indigo-200 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1.5 gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <CreditCard
                              size={12}
                              className="text-indigo-500 shrink-0"
                            />
                            <span className="text-[12px] font-semibold text-slate-800 capitalize truncate">
                              {pm?.type ?? "—"}
                            </span>
                            {pm?.isDefault && (
                              <span className="px-1.5 py-0.5 bg-violet-50 text-violet-600 text-[9px] font-bold rounded border border-violet-100 shrink-0">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${s === "approved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : s === "pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                          >
                            {pm?.status ?? "—"}
                          </span>
                        </div>
                        {pm?.type === "bank" && (
                          <div className="text-[11px] text-slate-500 space-y-0.5">
                            {pm?.bankName && (
                              <p className="truncate">
                                {pm.bankName}
                                {pm?.branchName ? ` · ${pm.branchName}` : ""}
                              </p>
                            )}
                            {pm?.accountNumber && (
                              <p className="font-mono break-all">
                                Acct: {pm.accountNumber}
                              </p>
                            )}
                            {pm?.accountHolderName && (
                              <p className="truncate">
                                Holder: {pm.accountHolderName}
                              </p>
                            )}
                          </div>
                        )}
                        {pm?.type === "binance" && pm?.binanceId && (
                          <p className="text-[11px] text-slate-500 font-mono break-all">
                            Binance ID: {pm.binanceId}
                          </p>
                        )}
                        {pm?.rejectReason && (
                          <p className="text-[10px] text-red-500 mt-1 flex items-start gap-1">
                            <AlertTriangle
                              size={9}
                              className="mt-0.5 shrink-0"
                            />
                            <span className="break-words">
                              {pm.rejectReason}
                            </span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* API Payload */}
          <ApiPayloadCard product={product as Record<string, JVal>} />

          <div className="h-4 sm:h-0" />
        </div>
      </div>
    </>
  );
}