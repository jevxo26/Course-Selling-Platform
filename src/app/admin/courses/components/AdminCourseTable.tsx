import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Pencil,
  Trash2,
  Users,
  Globe,
  Lock,
} from "lucide-react";
import { UiCourse } from "./types";

type Props = {
  isLoading: boolean;
  isError: boolean;
  courses: UiCourse[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (id: number | string) => void;
  onEdit: (course: UiCourse) => void;
  onDelete: (course: UiCourse) => void;
};

export default function AdminCourseTable({
  isLoading,
  isError,
  courses,
  page,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: Props) {
  const safePage = Math.min(page, totalPages);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              {["Course", "Instructor", "Pricing", "Visibility", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10">
                  <div className="flex items-center justify-center gap-2 text-[12px] text-gray-500 font-semibold">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading courses...
                  </div>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-[12px] text-red-500 font-semibold"
                >
                  Failed to load courses
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-[12px] text-gray-400"
                >
                  No courses found.
                </td>
              </tr>
            ) : (
              courses.map((c) => (
                <tr
                  key={String(c.id)}
                  className="hover:bg-indigo-50/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {c.thumbnail ? (
                        <img src={c.thumbnail} alt={c.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                          <span className="text-[10px] text-gray-400 font-semibold text-center leading-tight">No<br />Img</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-gray-900 truncate">
                          {c.name}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                          {c.categoryName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px] font-medium text-gray-700">
                      {c.instructorName ?? "—"}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                      <Users size={12} />
                      {c.enrollmentCount ?? 0} enrolls
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-bold text-gray-900">
                        ৳{Number(c.discountPrice ?? c.price ?? 0).toFixed(2)}
                      </span>
                      {c.discountPrice && c.price && Number(c.discountPrice) < Number(c.price) && (
                        <span className="text-[11px] text-gray-400 line-through">
                          ৳{Number(c.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {c.isPublished ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                        <Globe size={11} /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                        <Lock size={11} /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        c.status === "Active"
                          ? "inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600"
                          : "inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-600"
                      }
                    >
                      <span
                        className={
                          c.status === "Active"
                            ? "w-1.5 h-1.5 rounded-full bg-emerald-500"
                            : "w-1.5 h-1.5 rounded-full bg-amber-500"
                        }
                      />
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView(c.id)}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
                        title="Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => onEdit(c)}
                        className="p-2 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(c)}
                        className="p-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-[11px] text-gray-400 font-semibold">
          Page <span className="text-gray-700">{safePage}</span> of{" "}
          <span className="text-gray-700">{totalPages}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}