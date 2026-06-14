"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Search,
  Wallet,
  X,
  User,
  BookOpen,
  Calendar,
  CreditCard,
  Hash,
  Activity,
} from "lucide-react";
import {
  useAdminEnrollmentsManualPaymentMutation,
  useAdminEnrollmentsPayZinipayPaymentMutation,
  useAdminEnrollmentsQuery,
  useLazyAdminEnrollmentQuery,
} from "@/lib/api/admin/enrollments";
import { useAdminCoursesQuery } from "@/lib/api/admin/course";
import { useAdminUsersQuery } from "@/lib/api/admin/user";
import type { ColumnDef } from "@tanstack/react-table";
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/share/Table-Share";

type UiEnrollment = {
  id: number | string;
  studentId: number | string | null;
  courseId: number | string | null;
  student: string;
  studentEmail: string;
  course: string;
  amount: string;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  isManual: boolean;
  createdAt: string;
  enrolledAt: string;
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

function extractEnrollments(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.enrollments)) return payload.enrollments;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.enrollments))
    return payload.data.enrollments;
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

function normalizeEnrollment(raw: any): UiEnrollment | null {
  const id = raw?.id ?? raw?._id ?? null;
  if (!id) return null;

  const studentObj = raw?.student ?? raw?.user;
  const studentName =
    String(
      studentObj?.name ?? studentObj?.email ?? raw?.userName ?? "",
    ).trim() || "—";

  const studentEmail = String(studentObj?.email ?? "").trim() || "—";
  const studentId =
    studentObj?.id ??
    studentObj?._id ??
    raw?.studentId ??
    raw?.userId ??
    null;

  const courseId =
    raw?.course?.id ??
    raw?.course?._id ??
    raw?.courseId ??
    null;

  const course =
    String(
      raw?.course?.title ??
      raw?.course?.name ??
      raw?.courseTitle ??
      raw?.title ??
      "",
    ).trim() || "—";

  const amount =
    raw?.amount ?? raw?.price ?? raw?.total ?? raw?.payment?.amount ?? "—";

  const status = String(
    raw?.status ?? raw?.paymentStatus ?? (raw?.isPaid ? "paid" : "pending"),
  ).trim();

  const paymentMethod = String(raw?.paymentMethod ?? "—");
  const transactionId = raw?.transactionId ?? undefined;
  const isManual = Boolean(raw?.isManual);

  return {
    id,
    studentId,
    courseId,
    student: studentName,
    studentEmail,
    course,
    amount: String(amount),
    status: status || "—",
    paymentMethod,
    transactionId,
    isManual,
    createdAt: formatDate(raw?.createdAt),
    enrolledAt: formatDate(raw?.enrolledAt),
  };
}

function ModalShell({ title, subtitle, loading, onClose, children }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-extrabold text-gray-900">
              {title}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-60"
          >
            <X size={15} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* Keep your existing JsonBodyModal and DetailsModal components (unchanged) */
function JsonBodyModal({ ...props }: any) {
  // ... your existing JsonBodyModal code
  const [text, setText] = useState(JSON.stringify(props.initialBody, null, 2));
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    try {
      const parsed = JSON.parse(text);
      setError(null);
      props.onSubmit(parsed);
    } catch {
      setError("Invalid JSON");
    }
  };

  return (
    <ModalShell
      title={props.title}
      subtitle={props.subtitle}
      loading={props.loading}
      onClose={props.onClose}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
            Request Body (JSON)
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={`w-full min-h-[220px] px-3 py-2 text-[12px] border rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300 ${error ? "border-red-400 bg-red-50" : "border-gray-200"}`}
          />
          {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={props.onClose}
            disabled={props.loading}
            className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={props.loading}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-semibold flex items-center justify-center gap-1.5"
          >
            {props.loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={13} />
            )}
            Submit
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function ManualEnrollModal({ title, subtitle, loading, onClose, onSubmit, initialBody }: any) {
  const [courseId, setCourseId] = useState(initialBody?.courseId || "");
  const [studentId, setStudentId] = useState(initialBody?.studentId || "");
  const [amount, setAmount] = useState(initialBody?.amount || "");
  const [paymentMethod, setPaymentMethod] = useState(initialBody?.paymentMethod || "cash");

  const coursesQuery = useAdminCoursesQuery({ limit: 1000 });
  const usersQuery = useAdminUsersQuery();

  const extractArr = (payload: any) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.data?.items)) return payload.data.items;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.users)) return payload.users;
    if (Array.isArray(payload?.courses)) return payload.courses;
    return [];
  };

  const courses = extractArr(coursesQuery.data);
  const users = extractArr(usersQuery.data);

  const submit = () => {
    onSubmit({
      courseId: courseId,
      studentId: studentId,
      amount: amount,
      paymentMethod: paymentMethod,
    });
  };

  return (
    <ModalShell
      title={title}
      subtitle={subtitle}
      loading={loading}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
            Select Course
          </label>
          <select
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value);
              const selectedCourse = courses.find((c: any) => String(c.id || c._id) === String(e.target.value));
              if (selectedCourse && !amount) {
                setAmount(selectedCourse.discountPrice || selectedCourse.price || "");
              }
            }}
            disabled={coursesQuery.isLoading}
            className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
          >
            <option value="">Select a course...</option>
            {courses.map((c: any) => (
              <option key={c.id || c._id} value={c.id || c._id}>
                {c.title || c.name || `Course #${c.id || c._id}`}
              </option>
            ))}
          </select>
          {coursesQuery.isLoading && <p className="text-[10px] text-gray-500 mt-1">Loading courses...</p>}
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
            Select Student
          </label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            disabled={usersQuery.isLoading}
            className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
          >
            <option value="">Select a student...</option>
            {users.map((u: any) => (
              <option key={u.id || u._id} value={u.id || u._id}>
                {u.name || u.email || `User #${u.id || u._id}`} ({u.email})
              </option>
            ))}
          </select>
          {usersQuery.isLoading && <p className="text-[10px] text-gray-500 mt-1">Loading users...</p>}
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
            Amount (৳)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Enter payment amount"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="cash">Cash</option>
            <option value="zinipay">Zinipay</option>
            <option value="nagad">Nagad</option>
            <option value="rocket">Rocket</option>
            <option value="bank">Bank Transfer</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-semibold flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={13} />
            )}
            Submit
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function DetailsModal({
  id,
  open,
  onClose,
}: {
  id: number | string;
  open: boolean;
  onClose: () => void;
}) {
  const [trigger, { data, isFetching, isError }] =
    useLazyAdminEnrollmentQuery();

  React.useEffect(() => {
    if (open) trigger(id);
  }, [id, open, trigger]);

  const raw = data?.data?.enrollment || data?.enrollment || data?.data || data;
  const enr = React.useMemo(() => normalizeEnrollment(raw), [raw]);

  return (
    <ModalShell
      title="Enrollment Details"
      subtitle={`GET /enrollments/${id}`}
      loading={isFetching}
      onClose={onClose}
    >
      {isFetching ? (
        <div className="flex items-center justify-center gap-2 text-[12px] text-gray-500 font-semibold py-10">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </div>
      ) : isError ? (
        <div className="text-red-600 font-semibold py-4">
          Failed to load details
        </div>
      ) : !enr ? (
        <pre className="text-[11px] text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-4 overflow-auto max-h-[520px] whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl">
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Status</p>
              <span className={`inline-flex px-3 py-1 rounded-full text-[12px] font-extrabold uppercase tracking-wider ${enr.status === "completed" || enr.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {enr.status}
              </span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Amount</p>
              <p className="text-lg font-extrabold text-gray-900">৳{enr.amount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-100 rounded-2xl bg-white">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
                <User className="h-4 w-4 text-indigo-500" />
                <h3 className="text-[12px] font-extrabold text-gray-900 tracking-wide uppercase">Student Info</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold mb-0.5">NAME</p>
                  <p className="text-[13px] font-semibold text-gray-800">{enr.student}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold mb-0.5">EMAIL</p>
                  <p className="text-[13px] font-semibold text-gray-800 break-all">{enr.studentEmail}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold mb-0.5">ID</p>
                  <p className="text-[12px] font-mono text-gray-600 break-all">{enr.studentId || "—"}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-100 rounded-2xl bg-white">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
                <BookOpen className="h-4 w-4 text-emerald-500" />
                <h3 className="text-[12px] font-extrabold text-gray-900 tracking-wide uppercase">Course Info</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold mb-0.5">COURSE TITLE</p>
                  <p className="text-[13px] font-semibold text-gray-800">{enr.course}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold mb-0.5">COURSE ID</p>
                  <p className="text-[12px] font-mono text-gray-600 break-all">{enr.courseId || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border border-gray-100 rounded-2xl bg-white">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
              <CreditCard className="h-4 w-4 text-amber-500" />
              <h3 className="text-[12px] font-extrabold text-gray-900 tracking-wide uppercase">Payment & System</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-400 font-bold mb-0.5">PAYMENT METHOD</p>
                <p className="text-[13px] font-semibold text-gray-800 capitalize">{enr.paymentMethod}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold mb-0.5">TRANSACTION ID</p>
                <p className="text-[12px] font-mono text-gray-600 break-all">{enr.transactionId || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold mb-0.5">ENROLLMENT TYPE</p>
                <p className="text-[13px] font-semibold text-gray-800">{enr.isManual ? "Manual" : "System"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold mb-0.5">DATE CREATED</p>
                <p className="text-[13px] font-semibold text-gray-800">{enr.createdAt}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

export default function AdminEnrollmentsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const list = useAdminEnrollmentsQuery({
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const enrollments = useMemo(() => {
    const items = extractEnrollments(list.data);
    return items
      .map(normalizeEnrollment)
      .filter((x): x is UiEnrollment => Boolean(x));
  }, [list.data]);

  const totalFromApi = extractTotal(list.data);
  const totalPages = Math.max(
    1,
    totalFromApi ? Math.ceil(totalFromApi / PAGE_SIZE) : 1,
  );
  const [detailsId, setDetailsId] = useState<number | string | null>(null);
  const [zinipayBody, setZinipayBody] = useState<
    { courseId: number | string | null; studentId: number | string | null } | null
  >(null);
  const [manualBody, setManualBody] = useState<
    { courseId: number | string | null; studentId: number | string | null } | null
  >(null);
  const [payZinipay, { isLoading: isPayingZinipay }] =
    useAdminEnrollmentsPayZinipayPaymentMutation();
  const [manualPayment, { isLoading: isManualPaying }] =
    useAdminEnrollmentsManualPaymentMutation();

  const columns = useMemo<ColumnDef<UiEnrollment, unknown>[]>(
    () => [
      {
        accessorKey: "student",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Student" />
        ),
        cell: ({ row }) => {
          const e = row.original;
          return (
            <div>
              <p className="font-bold text-gray-900">{e.student}</p>
              <p className="text-[11px] text-gray-500">{e.studentEmail}</p>
              <p className="text-[11px] text-gray-400">ID: {e.id}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "course",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Course" />
        ),
        cell: ({ row }) => (
          <span className="font-medium text-gray-800">{row.original.course}</span>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Amount" />
        ),
        cell: ({ row }) => (
          <span className="font-extrabold text-gray-900">৳{row.original.amount}</span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const e = row.original;
          return (
            <span
              className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${e.status === "completed" || e.status === "paid"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
                }`}
            >
              {e.status}
            </span>
          );
        },
      },
      {
        id: "payment",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Payment" />
        ),
        cell: ({ row }) => {
          const e = row.original;
          return (
            <div className="text-sm">
              <p className="font-semibold capitalize">{e.paymentMethod}</p>
              {e.transactionId && (
                <p className="text-[11px] text-gray-500">TRX: {e.transactionId}</p>
              )}
              {e.isManual && (
                <span className="text-[10px] text-purple-600 font-bold">MANUAL</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) => (
          <span className="text-[12px] text-gray-600">{row.original.createdAt}</span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const e = row.original;
          return (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDetailsId(e.id)}
                className="h-9 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold flex items-center gap-1"
              >
                <Eye size={14} /> Details
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <>
      {detailsId !== null && (
        <DetailsModal id={detailsId} open onClose={() => setDetailsId(null)} />
      )}
      {zinipayBody !== null && (
        <JsonBodyModal
          title="Pay (Zinipay)"
          subtitle="POST /enrollments/pay"
          loading={isPayingZinipay}
          initialBody={{
            courseId: zinipayBody.courseId,
            studentId: zinipayBody.studentId,
          }}
          onClose={() => setZinipayBody(null)}
          onSubmit={async (body: any) => {
            const payload: any = { ...body };
            delete payload.enrollmentId;
            if (payload.courseId !== undefined && payload.courseId !== null) {
              payload.courseId = Number(payload.courseId);
            }
            if (payload.studentId !== undefined && payload.studentId !== null) {
              payload.studentId = Number(payload.studentId);
            }
            await payZinipay(payload).unwrap();
            setZinipayBody(null);
            list.refetch();
          }}
        />
      )}
      {manualBody !== null && (
        <ManualEnrollModal
          title="Manual Payment"
          subtitle="POST /enrollments/manual"
          loading={isManualPaying}
          initialBody={{
            courseId: manualBody.courseId,
            studentId: manualBody.studentId,
          }}
          onClose={() => setManualBody(null)}
          onSubmit={async (body: any) => {
            const payload: any = { ...body };
            delete payload.enrollmentId;
            if (payload.courseId !== undefined && payload.courseId !== null && payload.courseId !== "") {
              payload.courseId = Number(payload.courseId);
            } else {
              delete payload.courseId;
            }
            if (payload.studentId !== undefined && payload.studentId !== null && payload.studentId !== "") {
              payload.studentId = Number(payload.studentId);
            } else {
              delete payload.studentId;
            }
            if (payload.amount !== undefined && payload.amount !== null && payload.amount !== "") {
              payload.amount = Number(payload.amount);
            }
            if (!payload.paymentMethod) {
              payload.paymentMethod = "cash";
            }
            await manualPayment(payload).unwrap();
            setManualBody(null);
            list.refetch();
          }}
        />
      )}
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-9">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
              <BookOpen size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[17px] sm:text-[20px] font-extrabold text-gray-900 tracking-tight leading-none">
                Enrollments
              </h1>
              <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 font-medium truncate hidden sm:block">
                Manage student enrollments, track payments, and add manual enrollments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search student or course..."
                className="w-[280px] h-10 pl-10 pr-3 rounded-xl border border-gray-200 bg-white text-[13px] font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <button
              onClick={() => list.refetch()}
              className="h-10 px-4 rounded-xl bg-white border border-gray-200 text-[13px] font-bold text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>
            <button
              onClick={() => setManualBody({ courseId: "", studentId: "" })}
              className="h-10 px-4 rounded-xl bg-indigo-600 border border-transparent text-[13px] font-bold text-white hover:bg-indigo-700 flex items-center gap-2"
            >
              <Wallet size={16} /> Manual Enroll
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl mt-16 border border-gray-200 shadow-sm overflow-hidden">
          {list.isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-indigo-500" />
            </div>
          ) : list.isError ? (
            <div className="py-12 text-center text-red-600">
              Failed to load enrollments
            </div>
          ) : enrollments.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No enrollments found
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={enrollments}
              showColumnsToggle={false}
              showFooter={false}
              pageSize={PAGE_SIZE}
            />
          )}

          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 font-medium">
              Page {page} of {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-9 px-4 rounded-xl border flex items-center gap-1 disabled:opacity-50"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-9 px-4 rounded-xl border flex items-center gap-1 disabled:opacity-50"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
