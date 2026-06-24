"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  Search,
  X,
  GraduationCap,
  BarChart2,
  Clock,
  Layers,
  Hash,
  Mail,
  Phone,
  MapPin,
  Shield,
  Ticket,
  Link2,
  Eye,
  User,
  Tag,
  ImageIcon,
  TrendingDown,
  BookMarked,
  UserCircle2,
} from "lucide-react";
import { useStudentMyCoursesQuery } from "@/lib/api/student/courses";

// ─── Types ─────────────────────────────────────────────────────────────────────

type UiCourse = {
  id: number | string;
  title: string;
  status: string;
  progress: number | null;
  enrolledAt: string;
  raw: any;
};

type FieldItem = {
  label: string;
  value: string;
  icon: React.ReactNode;
  isUrl?: boolean;
  isImage?: boolean;
};

type Section = {
  title: string;
  icon: React.ReactNode;
  fields: FieldItem[];
  headerNode?: React.ReactNode; // optional custom header (e.g. instructor avatar row)
};

const PAGE_SIZE = 10;
const IMAGE_EXT = /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i;

// ─── Helpers ────────────────────────────────────────────────────────────────────

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
  for (const key of ["courses", "myCourses", "enrollments", "data"]) {
    if (Array.isArray(payload[key])) return payload[key];
    if (Array.isArray(payload?.data?.[key])) return payload.data[key];
  }
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
}

function toUi(raw: any): UiCourse | null {
  const id =
    raw?.id ??
    raw?._id ??
    raw?.courseId ??
    raw?.enrollmentId ??
    raw?.enrollId ??
    raw?.course?._id ??
    raw?.course?.id ??
    null;
  if (!id) return null;

  const title =
    String(
      raw?.title ?? raw?.name ?? raw?.course?.title ?? raw?.course?.name ?? "—",
    ).trim() || "—";
  const status =
    String(
      raw?.status ??
        raw?.state ??
        raw?.enrollmentStatus ??
        raw?.course?.status ??
        "—",
    ).trim() || "—";

  const progressRaw = raw?.progress ?? raw?.courseProgress ?? null;
  let progress: number | null = null;
  if (progressRaw !== null && progressRaw !== undefined && progressRaw !== "") {
    const n = Number(progressRaw);
    progress = Number.isFinite(n) ? n : null;
  } else {
    const completed = Number(
      raw?.lessonsCompleted ?? raw?.completedLessons ?? NaN,
    );
    const total = Number(raw?.totalLessons ?? raw?.lessonsTotal ?? NaN);
    if (Number.isFinite(completed) && Number.isFinite(total) && total > 0)
      progress = Math.round((completed / total) * 100);
  }

  const enrolledAt = formatDate(
    raw?.enrolledAt ??
      raw?.createdAt ??
      raw?.created_at ??
      raw?.course?.createdAt,
  );
  return { id, title, status, progress, enrolledAt, raw };
}

// ─── Field helpers ──────────────────────────────────────────────────────────────

function fieldIcon(key: string): React.ReactNode {
  const k = key.toLowerCase();
  const cls = "h-3 w-3 shrink-0";
  if (k.includes("email")) return <Mail className={cls} />;
  if (k.includes("phone")) return <Phone className={cls} />;
  if (k.includes("country") || k.includes("city"))
    return <MapPin className={cls} />;
  if (k.includes("role")) return <Shield className={cls} />;
  if (k.includes("refer") || k.includes("code"))
    return <Ticket className={cls} />;
  if (k.includes("thumb") || k.includes("photo") || k.includes("image"))
    return <ImageIcon className={cls} />;
  if (k === "id" || k === "_id" || k.endsWith("id") || k.endsWith("_id"))
    return <Hash className={cls} />;
  if (k.includes("slug") || k.includes("url") || k.includes("link"))
    return <Link2 className={cls} />;
  if (k.includes("status") || k.includes("state"))
    return <Tag className={cls} />;
  if (k.includes("publish")) return <Eye className={cls} />;
  if (k.includes("name")) return <User className={cls} />;
  if (k.includes("price") || k.includes("discount"))
    return <TrendingDown className={cls} />;
  if (
    k.includes("at") ||
    k.includes("date") ||
    k.includes("created") ||
    k.includes("updated")
  )
    return <Calendar className={cls} />;
  if (k.includes("progress")) return <BarChart2 className={cls} />;
  return <Info className={cls} />;
}

function formatFieldValue(
  key: string,
  val: any,
): { display: string; isUrl: boolean; isImage: boolean } {
  if (val === null || val === undefined || val === "")
    return { display: "—", isUrl: false, isImage: false };
  if (typeof val === "boolean")
    return { display: val ? "Yes" : "No", isUrl: false, isImage: false };
  if (typeof val === "object")
    return {
      display: Array.isArray(val) ? `[${val.length} items]` : "{object}",
      isUrl: false,
      isImage: false,
    };

  const k = key.toLowerCase();
  const s = String(val);

  // Price formatting
  if ((k.includes("price") || k.includes("discount")) && !isNaN(Number(val)))
    return {
      display: `৳${Number(val).toLocaleString()}`,
      isUrl: false,
      isImage: false,
    };

  // Image URL
  if ((s.startsWith("http") || s.startsWith("/")) && IMAGE_EXT.test(s))
    return { display: s, isUrl: false, isImage: true };

  // Generic URL
  if (s.startsWith("http://") || s.startsWith("https://"))
    return { display: s, isUrl: true, isImage: false };

  // Date
  if (
    k.includes("at") ||
    k.includes("date") ||
    k.includes("created") ||
    k.includes("updated")
  ) {
    const d = new Date(s);
    if (!isNaN(d.getTime()))
      return {
        display: d.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        isUrl: false,
        isImage: false,
      };
  }

  return { display: s, isUrl: false, isImage: false };
}

function humanLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

// ─── Build modal sections ───────────────────────────────────────────────────────

function buildSections(raw: any): Section[] {
  if (!raw || typeof raw !== "object") return [];
  const sections: Section[] = [];
  const course = raw.course || {};
  const instructor = course.instructor || {};

  // ── 1. Course details ─────────────────────────────────────────────────────
  const courseSkip = new Set([
    "id",
    "_id",
    "title",
    "name",
    "slug",
    "instructor",
    "thumbnail",
    "photo",
    "image",
  ]);
  const courseFields: FieldItem[] = [];

  // Thumbnail image first (full-width)
  if (course.thumbnail) {
    courseFields.unshift({
      label: "Thumbnail",
      value: course.thumbnail,
      icon: <ImageIcon className="h-3 w-3 shrink-0" />,
      isImage: true,
    });
  }

  for (const [k, v] of Object.entries(course)) {
    if (courseSkip.has(k) || typeof v === "object") continue;
    const { display, isUrl, isImage } = formatFieldValue(k, v);
    if (display === "—") continue;
    courseFields.push({
      label: humanLabel(k),
      value: display,
      icon: fieldIcon(k),
      isUrl,
      isImage,
    });
  }

  if (courseFields.length)
    sections.push({
      title: "Course details",
      icon: <BookOpen className="h-3.5 w-3.5" />,
      fields: courseFields,
    });

  // ── 2. Enrollment info ────────────────────────────────────────────────────
  const enrollSkip = new Set([
    "id",
    "_id",
    "title",
    "name",
    "course",
    "instructor",
    "thumbnail",
    "photo",
    "image",
  ]);
  const enrollFields: FieldItem[] = [];
  for (const [k, v] of Object.entries(raw)) {
    if (enrollSkip.has(k) || typeof v === "object") continue;
    const { display, isUrl, isImage } = formatFieldValue(k, v);
    if (display === "—") continue;
    enrollFields.push({
      label: humanLabel(k),
      value: display,
      icon: fieldIcon(k),
      isUrl,
      isImage,
    });
  }
  if (enrollFields.length)
    sections.push({
      title: "Enrollment info",
      icon: <BookMarked className="h-3.5 w-3.5" />,
      fields: enrollFields,
    });

  // ── 3. Instructor ─────────────────────────────────────────────────────────
  if (Object.keys(instructor).length) {
    const instrSkip = new Set([
      "id",
      "_id",
      "name",
      "role",
      "photo",
      "image",
      "thumbnail",
    ]);
    const instrFields: FieldItem[] = [];
    for (const [k, v] of Object.entries(instructor)) {
      if (instrSkip.has(k) || typeof v === "object") continue;
      const { display, isUrl, isImage } = formatFieldValue(k, v);
      if (display === "—") continue;
      instrFields.push({
        label: humanLabel(k),
        value: display,
        icon: fieldIcon(k),
        isUrl,
        isImage,
      });
    }

    // Avatar header node
    const photoUrl = instructor.photo || instructor.image || "";
    const instrInitials = (instructor.name || "IN")
      .split(" ")
      .slice(0, 2)
      .map((w: string) => w[0]?.toUpperCase() ?? "")
      .join("");

    const headerNode = (
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-50">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={instructor.name || "Instructor"}
            className="w-12 h-12 rounded-full object-cover border border-gray-100 shrink-0"
            onError={(e) => {
              const el = e.currentTarget;
              el.style.display = "none";
              const fallback = el.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-[14px] shrink-0"
          style={{ display: photoUrl ? "none" : "flex" }}
        >
          {instrInitials}
        </div>
        <div>
          <p className="text-[13px] font-bold text-gray-900">
            {instructor.name || "—"}
          </p>
          {instructor.role && (
            <p className="text-[11px] text-gray-400 capitalize mt-0.5">
              {instructor.role}
            </p>
          )}
        </div>
      </div>
    );

    sections.push({
      title: "Instructor",
      icon: <UserCircle2 className="h-3.5 w-3.5" />,
      fields: instrFields,
      headerNode,
    });
  }

  return sections;
}

// ─── Image with fallback ────────────────────────────────────────────────────────

function CourseImage({
  src,
  alt,
  className,
  fallbackClassName,
  fallbackText,
}: {
  src: string;
  alt: string;
  className: string;
  fallbackClassName: string;
  fallbackText: string;
}) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div className={fallbackClassName}>
        <ImageIcon className="h-5 w-5 text-gray-300 mb-1" />
        <span className="text-[10px] text-gray-400">{fallbackText}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
    />
  );
}

// ─── Status Badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const styles: Record<string, string> = {
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    active: "bg-blue-100 text-blue-700 border-blue-200",
    enrolled: "bg-violet-100 text-violet-700 border-violet-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    cancelled: "bg-red-100 text-red-600 border-red-200",
    expired: "bg-gray-100 text-gray-500 border-gray-200",
  };
  const dots: Record<string, string> = {
    completed: "bg-emerald-500",
    active: "bg-blue-500",
    enrolled: "bg-violet-500",
    pending: "bg-amber-500",
    cancelled: "bg-red-500",
    expired: "bg-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[s] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${dots[s] ?? "bg-gray-400"}`}
      />
      {status}
    </span>
  );
}

// ─── Progress Bar ───────────────────────────────────────────────────────────────

function ProgressBar({ value }: { value: number | null }) {
  if (value === null)
    return <span className="text-[12px] text-gray-300 font-semibold">N/A</span>;
  const color =
    value >= 100
      ? "bg-emerald-500"
      : value >= 60
        ? "bg-violet-500"
        : value >= 30
          ? "bg-amber-400"
          : "bg-rose-400";
  const track =
    value >= 100
      ? "bg-emerald-100"
      : value >= 60
        ? "bg-violet-100"
        : value >= 30
          ? "bg-amber-100"
          : "bg-rose-100";
  return (
    <div className="flex items-center gap-2.5 min-w-[110px]">
      <div className={`flex-1 h-2 rounded-full ${track} overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="text-[11px] font-black text-gray-600 tabular-nums w-8 text-right">
        {value}%
      </span>
    </div>
  );
}

// ─── Field Row ──────────────────────────────────────────────────────────────────

function FieldRow({ field }: { field: FieldItem }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 py-2.5 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60 transition-colors">
      <div className="flex items-center gap-2 shrink-0 max-w-[45%] pt-0.5">
        <span className="text-gray-300 shrink-0">{field.icon}</span>
        <span className="text-[12px] font-semibold text-gray-400 truncate">
          {field.label}
        </span>
      </div>

      {field.isImage ? (
        <div className="max-w-[55%] w-full">
          <CourseImage
            src={field.value}
            alt={field.label}
            className="w-full max-h-40 object-cover rounded-xl border border-gray-100"
            fallbackClassName="w-full h-16 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center"
            fallbackText="Image not available"
          />
        </div>
      ) : field.isUrl ? (
        <a
          href={field.value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-medium text-blue-500 hover:text-blue-700 text-right break-all leading-snug max-w-[55%] hover:underline underline-offset-2"
        >
          {field.value.length > 42
            ? field.value.slice(0, 42) + "…"
            : field.value}
        </a>
      ) : (
        <span className="text-[12px] font-bold text-gray-800 text-right break-words leading-snug max-w-[55%]">
          {field.value}
        </span>
      )}
    </div>
  );
}

// ─── Thumbnail image field (full-width inside modal) ────────────────────────────

function ThumbnailField({ src }: { src: string }) {
  const [errored, setErrored] = useState(false);
  return (
    <div className="px-5 py-3 border-b border-gray-50">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <ImageIcon className="h-3 w-3" /> Thumbnail
      </p>
      {errored ? (
        <div className="w-full h-24 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-1">
          <ImageIcon className="h-5 w-5 text-gray-300" />
          <span className="text-[10px] text-gray-400">Image not available</span>
        </div>
      ) : (
        <img
          src={src}
          alt="Course thumbnail"
          className="w-full max-h-44 object-cover rounded-xl border border-gray-100"
          onError={() => setErrored(true)}
        />
      )}
    </div>
  );
}

// ─── Details Modal ──────────────────────────────────────────────────────────────

function DetailsModal({
  course,
  onClose,
}: {
  course: UiCourse;
  onClose: () => void;
}) {
  const sections = useMemo(() => buildSections(course.raw), [course.raw]);
  const thumbnail = course.raw?.course?.thumbnail || "";

  const ins =
    course.title
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "C";

  const progColor =
    course.progress !== null
      ? course.progress >= 100
        ? "bg-emerald-500"
        : course.progress >= 60
          ? "bg-violet-500"
          : course.progress >= 30
            ? "bg-amber-400"
            : "bg-rose-400"
      : "";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className="fixed z-50 flex flex-col bg-white bottom-0 left-0 right-0 rounded-t-3xl max-h-[92dvh] sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg sm:rounded-2xl sm:max-h-[88vh] shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="px-5 pt-4 pb-4 sm:px-6 sm:pt-5 border-b border-gray-100 shrink-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar — show thumbnail if available, else initials */}
              {thumbnail ? (
                <CourseImage
                  src={thumbnail}
                  alt={course.title}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover border border-gray-100 shrink-0"
                  fallbackClassName="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0"
                  fallbackText={ins}
                />
              ) : (
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
                  <span className="text-white font-black text-[13px] tracking-wide">
                    {ins}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <h2
                  id="modal-title"
                  className="text-[15px] sm:text-base font-extrabold text-gray-900 leading-snug line-clamp-2"
                >
                  {course.title}
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5 font-semibold">
                  Enrollment #{String(course.id)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close details"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 active:scale-95 transition-all shrink-0 mt-0.5"
            >
              <X size={16} />
            </button>
          </div>

          {/* Pills */}
          <div className="flex flex-wrap gap-2 mb-3">
            <StatusBadge status={course.status} />
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border border-gray-200 bg-gray-50 text-gray-600 uppercase tracking-wider">
              <Calendar className="h-2.5 w-2.5 text-gray-400" />
              {course.enrolledAt}
            </span>
            {course.progress !== null && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border border-violet-200 bg-violet-50 text-violet-700 uppercase tracking-wider">
                <BarChart2 className="h-2.5 w-2.5" />
                {course.progress}% done
              </span>
            )}
          </div>

          {/* Progress bar */}
          {course.progress !== null && (
            <div className="bg-gray-50 rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Course progress
                </span>
                <span className="text-[13px] font-black text-gray-800">
                  {course.progress}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${progColor}`}
                  style={{ width: `${Math.min(100, course.progress)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sections */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {sections.length === 0 ? (
            <div className="py-12 text-center text-[12px] text-gray-400">
              No details available
            </div>
          ) : (
            sections.map((section, si) => (
              <div key={si}>
                {/* Section label */}
                <div className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                  <span className="text-gray-400">{section.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    {section.title}
                  </span>
                </div>

                {/* Thumbnail full-width (for course details section) */}
                {si === 0 && thumbnail && <ThumbnailField src={thumbnail} />}

                {/* Instructor avatar header */}
                {section.headerNode}

                {/* Fields */}
                <div>
                  {section.fields
                    .filter((f) => !(si === 0 && f.isImage)) // skip image fields in course section (already shown above)
                    .map((f, fi) => (
                      <FieldRow key={fi} field={f} />
                    ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 sm:px-6 border-t border-gray-100 bg-gray-50/70 shrink-0 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-gray-900 text-white text-[12px] font-bold hover:bg-gray-700 active:scale-95 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3 shadow-sm">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          {label}
        </p>
        <p className="text-[15px] font-black text-gray-900 leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function StudentCoursesManager() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [details, setDetails] = useState<UiCourse | null>(null);

  const { data, isFetching, isError } = useStudentMyCoursesQuery();

  const allItems = useMemo(
    () => extractList(data).map(toUi).filter(Boolean) as UiCourse[],
    [data],
  );

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter((c) =>
      `${c.title} ${c.status} ${c.id}`.toLowerCase().includes(q),
    );
  }, [allItems, search]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const paged = useMemo(
    () => items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [items, page],
  );

  const stats = useMemo(() => {
    const active = allItems.filter(
      (c) => c.status.toLowerCase() === "active",
    ).length;
    const progs = allItems.filter((c) => c.progress !== null);
    const avgProgress = progs.length
      ? Math.round(
          progs.reduce((s, c) => s + (c.progress ?? 0), 0) / progs.length,
        )
      : null;
    return { active, avgProgress, total: allItems.length };
  }, [allItems]);

  const thumbnail = (c: UiCourse) => c.raw?.course?.thumbnail || "";

  return (
    <div className="w-full bg-white min-h-screen pb-12">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="mb-6 sm:mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm">
            <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />
            <div className="px-5 py-6 sm:px-8 sm:py-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                {/* Left */}
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 mb-4">
                    <div className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600">
                      Student Dashboard
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200 shrink-0">
                      <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 leading-none">
                        My Courses
                      </h1>
                      <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                        Track your learning journey
                      </p>
                    </div>
                  </div>
                  {!isFetching && allItems.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
                      <StatCard
                        icon={<Layers className="h-4 w-4 text-violet-600" />}
                        label="Total"
                        value={stats.total}
                        color="bg-violet-50"
                      />
                      <StatCard
                        icon={<BookOpen className="h-4 w-4 text-blue-600" />}
                        label="Active"
                        value={stats.active}
                        color="bg-blue-50"
                      />
                      <StatCard
                        icon={
                          <BarChart2 className="h-4 w-4 text-emerald-600" />
                        }
                        label="Avg Progress"
                        value={
                          stats.avgProgress !== null
                            ? `${stats.avgProgress}%`
                            : "—"
                        }
                        color="bg-emerald-50"
                      />
                    </div>
                  )}
                </div>

                {/* Search */}
                {!isFetching && allItems.length > 0 && (
                  <div className="lg:w-96 xl:w-[420px] shrink-0">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">
                      Search Courses
                    </label>
                    <div className="flex h-11 items-center rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 transition-all focus-within:border-violet-400 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-violet-100/50">
                      <Search className="h-4 w-4 text-gray-400 shrink-0" />
                      <input
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setPage(1);
                        }}
                        placeholder="Search by title, status, ID…"
                        className="ml-3 flex-1 bg-transparent text-[13px] font-medium text-gray-700 placeholder:text-gray-400 outline-none"
                      />
                      {search && (
                        <button
                          onClick={() => {
                            setSearch("");
                            setPage(1);
                          }}
                          aria-label="Clear search"
                          className="ml-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 transition-colors shrink-0"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    {search && (
                      <p className="mt-2 text-[11px] text-gray-400 font-medium">
                        Showing{" "}
                        <span className="font-bold text-violet-600">
                          {items.length}
                        </span>{" "}
                        result{items.length !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Table Card / Empty State ────────────────────────────────────────── */}
        {!isFetching && !isError && allItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 py-16 bg-white border border-gray-100 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />
            <div className="w-20 h-20 rounded-3xl bg-violet-50 flex items-center justify-center mb-6 shadow-lg shadow-violet-100/50">
              <GraduationCap className="h-10 w-10 text-violet-600 animate-bounce" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
              Start Your Learning Journey
            </h2>
            <p className="text-[13px] text-gray-500 max-w-md mb-8 leading-relaxed">
              You haven&apos;t enrolled in any courses yet. Explore our wide range of premium courses and start learning today!
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[12px] font-bold hover:from-violet-500 hover:to-indigo-500 active:scale-95 transition-all shadow-md shadow-violet-200"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="px-5 py-4 sm:px-6 border-b border-gray-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-violet-600" />
              </div>
              <span className="text-[13px] font-extrabold text-gray-800">
                Enrolled Courses
              </span>
              {!isFetching && (
                <span className="px-2 py-0.5 rounded-full bg-violet-100 text-[10px] font-black text-violet-700">
                  {items.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[11px] font-bold text-gray-500 px-1.5 tabular-nums">
                {page}/{totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── Desktop Table ── */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100">
                  {[
                    "#",
                    "Course Title",
                    "Status",
                    "Progress",
                    "Enrolled",
                    "",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isFetching ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="inline-flex items-center gap-2.5 text-[12px] font-semibold text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                        Loading your courses…
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                          <X className="h-5 w-5 text-red-400" />
                        </div>
                        <p className="text-[12px] font-bold text-red-500">
                          Failed to load courses
                        </p>
                        <p className="text-[11px] text-gray-400">
                          Please try refreshing the page
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-gray-200" />
                        </div>
                        <p className="text-[13px] font-bold text-gray-500">
                          No courses found
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {search
                            ? "Try a different search term"
                            : "You haven't enrolled in any courses yet"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paged.map((c, idx) => (
                    <tr
                      key={String(c.id)}
                      onClick={() => setDetails(c)}
                      className="hover:bg-violet-50/30 transition-colors cursor-pointer group"
                    >
                      {/* # */}
                      <td className="px-5 py-4">
                        <span className="text-[11px] font-black text-gray-300">
                          {String((page - 1) * PAGE_SIZE + idx + 1).padStart(
                            2,
                            "0",
                          )}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {thumbnail(c) ? (
                            <CourseImage
                              src={thumbnail(c)}
                              alt={c.title}
                              className="w-8 h-8 rounded-xl object-cover shrink-0"
                              fallbackClassName="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center shrink-0"
                              fallbackText=""
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center shrink-0">
                              <GraduationCap className="h-3.5 w-3.5 text-violet-500" />
                            </div>
                          )}
                          <span className="text-[13px] font-bold text-gray-900 group-hover:text-violet-700 transition-colors line-clamp-1">
                            {c.title}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={c.status} />
                      </td>

                      {/* Progress */}
                      <td className="px-5 py-4">
                        <ProgressBar value={c.progress} />
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1.5">
                          <Clock className="h-3 w-3 shrink-0" />
                          {c.enrolledAt}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetails(c);
                          }}
                          aria-label={`View details for ${c.title}`}
                          className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:bg-violet-600 hover:text-white hover:border-violet-600 active:scale-95 transition-all shadow-sm"
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards ── */}
          <div className="sm:hidden divide-y divide-gray-50">
            {isFetching ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                <p className="text-[12px] font-semibold text-gray-400">
                  Loading…
                </p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <X className="h-6 w-6 text-red-400" />
                <p className="text-[12px] font-bold text-red-500">
                  Failed to load
                </p>
              </div>
            ) : paged.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <BookOpen className="h-8 w-8 text-gray-200" />
                <p className="text-[12px] font-bold text-gray-400">
                  {search ? "No results found" : "No courses yet"}
                </p>
              </div>
            ) : (
              paged.map((c) => (
                <div
                  key={String(c.id)}
                  onClick={() => setDetails(c)}
                  className="flex items-start gap-3 px-4 py-4 hover:bg-violet-50/30 active:bg-violet-50 cursor-pointer transition-colors group"
                >
                  {/* Thumbnail or icon */}
                  {thumbnail(c) ? (
                    <CourseImage
                      src={thumbnail(c)}
                      alt={c.title}
                      className="w-11 h-11 rounded-xl object-cover shrink-0 mt-0.5"
                      fallbackClassName="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center shrink-0 mt-0.5"
                      fallbackText=""
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                      <GraduationCap className="h-4.5 w-4.5 text-violet-500" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-bold text-gray-900 group-hover:text-violet-700 leading-snug line-clamp-2 transition-colors">
                        {c.title}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetails(c);
                        }}
                        aria-label={`View details for ${c.title}`}
                        className="w-7 h-7 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:bg-violet-600 hover:text-white hover:border-violet-600 active:scale-95 transition-all shrink-0"
                      >
                        <Info className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <StatusBadge status={c.status} />
                      <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {c.enrolledAt}
                      </span>
                    </div>
                    {c.progress !== null && (
                      <div className="mt-2.5">
                        <ProgressBar value={c.progress} />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {!isFetching && paged.length > 0 && (
            <div className="px-5 py-3 sm:px-6 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <p className="text-[11px] text-gray-400 font-medium">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, items.length)} of {items.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-600 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-600 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      </div>

      {/* Details Modal */}
      {details && (
        <DetailsModal course={details} onClose={() => setDetails(null)} />
      )}
    </div>
  );
}
