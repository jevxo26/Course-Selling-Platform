import React from "react";
import { useLazyAdminCourseQuery } from "@/lib/api/admin/course";
import { Loader2, BookOpen, User, Tag, Globe, Lock, DollarSign, BarChart } from "lucide-react";
import ModalShell from "./ModalShell";

type Props = {
  id: number | string;
  open: boolean;
  onClose: () => void;
};

export default function ViewModal({ id, open, onClose }: Props) {
  const [trigger, { data, isFetching, isError }] = useLazyAdminCourseQuery();

  React.useEffect(() => {
    if (!open) return;
    trigger(id);
  }, [id, open, trigger]);

  const course = data?.data ?? data;

  return (
    <ModalShell
      title="Course Details"
      subtitle="View comprehensive course information"
      loading={isFetching}
      onClose={onClose}
    >
      {isFetching ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-indigo-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-[13px] font-semibold text-gray-500">Loading course data...</p>
        </div>
      ) : isError || !course ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-500 mb-3">
            <BookOpen size={24} />
          </div>
          <p className="text-[14px] font-bold text-gray-900">Failed to load details</p>
          <p className="text-[12px] text-gray-500 mt-1">Please try again later.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex gap-4 items-start">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-24 h-24 rounded-2xl object-cover shadow-sm border border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200">
                <BookOpen className="text-gray-300" size={32} />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[18px] font-black text-gray-900 leading-tight">
                    {course.title ?? course.name}
                  </h3>
                  <p className="text-[12px] text-gray-500 mt-1 flex items-center gap-1.5">
                    <Tag size={12} /> {course.slug ?? "N/A"}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${course.isPublished
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                >
                  {course.isPublished ? (
                    <><Globe size={12} /> Published</>
                  ) : (
                    <><Lock size={12} /> Draft</>
                  )}
                </span>
              </div>
              <p className="text-[13px] text-gray-600 mt-3 leading-relaxed">
                {course.description || "No description provided."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Pricing */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                <DollarSign size={14} /> Pricing
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[20px] font-black text-gray-900">
                  ৳{Number(course.discountPrice ?? course.price ?? 0).toFixed(2)}
                </span>
                {course.discountPrice && course.price && Number(course.discountPrice) < Number(course.price) && (
                  <span className="text-[13px] font-semibold text-gray-400 line-through">
                    ৳{Number(course.price).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                <Tag size={14} /> Category
              </div>
              <p className="text-[14px] font-bold text-gray-900">
                {course.category?.name ?? "Uncategorized"}
              </p>
            </div>

            {/* Instructor */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                <User size={14} /> Instructor
              </div>
              <div className="flex items-center gap-3">
                {course.instructor?.photo ? (
                  <img
                    src={course.instructor.photo}
                    alt={course.instructor.name}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[12px]">
                    {course.instructor?.name?.charAt(0) ?? "U"}
                  </div>
                )}
                <div>
                  <p className="text-[13px] font-bold text-gray-900">
                    {course.instructor?.name ?? "Unknown"}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {course.instructor?.email ?? "No email"}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats / Meta */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                <BarChart size={14} /> Statistics
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-gray-600 font-medium">Enrollments</span>
                <span className="text-[14px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg">
                  {course.enrollmentCount ?? 0}
                </span>
              </div>
              {course.metadata?.level && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[13px] text-gray-600 font-medium">Level</span>
                  <span className="text-[12px] font-bold text-gray-700">
                    {course.metadata.level}
                  </span>
                </div>
              )}
            </div>
          </div>

          {course.courseUrl && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[12px] font-bold text-indigo-900">Course URL</p>
                <a href={course.courseUrl} target="_blank" rel="noreferrer" className="text-[12px] text-indigo-500 hover:underline">
                  {course.courseUrl}
                </a>
              </div>
              <a href={course.courseUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-bold rounded-xl transition-colors">
                Visit Link
              </a>
            </div>
          )}
        </div>
      )}
    </ModalShell>
  );
}