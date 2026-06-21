"use client";

import React, { useMemo, useState } from "react";
import { Plus,BookOpen } from "lucide-react";
import {
  useAdminCoursesQuery,
  useAdminCreateCourseMutation,
  useAdminUpdateCourseMutation,
  useAdminDeleteCourseMutation,
} from "@/lib/api/admin/course";
import { useAdminCategoriesQuery } from "@/lib/api/admin/category";
import { useAdminInstructorsQuery } from "@/lib/api/admin/instructor";
import { UiCourse } from "./components/types";
import {
  extractCourses,
  extractCategories,
  normalizeCourse,
} from "./components/utils";
import ModalShell from "./components/ModalShell";
import CourseFormModal from "./components/CourseFormModal";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import ViewModal from "./components/ViewModal";
import AdminCoursesToolbar from "./components/AdminCoursesToolbar";
import AdminCoursesStats from "./components/AdminCoursesStats";
import AdminCourseTable from "./components/AdminCourseTable";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export default function AdminCoursesPage(): React.JSX.Element {
  const { data, isLoading, isError } = useAdminCoursesQuery();
  const [createCourse, { isLoading: isCreating }] =
    useAdminCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] =
    useAdminUpdateCourseMutation();
  const [deleteCourse, { isLoading: isDeleting }] =
    useAdminDeleteCourseMutation();
  const { data: catData } = useAdminCategoriesQuery();
  const { data: instData } = useAdminInstructorsQuery();

  // UI state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [edit, setEdit] = useState<UiCourse | null>(null);
  const [viewId, setViewId] = useState<number | string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UiCourse | null>(null);

  // Process categories
  const categoriesRaw = useMemo(() => extractCategories(catData), [catData]);
  const categoryList = useMemo(
    () =>
      categoriesRaw
        .map((c: any) => ({
          id: c?.id ?? c?._id ?? c?.categoryId,
          name: String(c?.name ?? c?.title ?? "").trim(),
        }))
        .filter((c) => c.id && c.name),
    [categoriesRaw],
  );
  const categoryMap = useMemo(() => {
    const m = new Map<string, string>();
    categoryList.forEach((c) => m.set(String(c.id), c.name));
    return m;
  }, [categoryList]);

  // Process instructors
  const instructorsRaw = useMemo(() => {
    const p = instData as any;
    if (!p) return [];
    if (Array.isArray(p)) return p;
    if (Array.isArray(p?.data?.data)) return p.data.data;
    if (Array.isArray(p?.data)) return p.data;
    return [];
  }, [instData]);

  const instructorList = useMemo(
    () =>
      instructorsRaw
        .map((i: any) => ({
          id: i?.id ?? i?._id,
          name: String(i?.user?.name ?? i?.name ?? "").trim(),
        }))
        .filter((i: any) => i.id && i.name),
    [instructorsRaw],
  );

  // Process courses
  const coursesRaw = useMemo(() => extractCourses(data), [data]);
  const courses = useMemo(
    () =>
      coursesRaw
        .map((c) => normalizeCourse(c, categoryMap))
        .filter((x): x is UiCourse => Boolean(x)),
    [coursesRaw, categoryMap],
  );

  // Filter & paginate
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) =>
      `${c.name} ${c.description ?? ""} ${c.categoryName}`
        .toLowerCase()
        .includes(q),
    );
  }, [courses, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const total = courses.length;
  const active = courses.filter((c) => c.status === "Active").length;
  const deleted = courses.filter((c) => c.status === "Deleted").length;
  const busy = isCreating || isUpdating || isDeleting;

  return (
    <>
      {createOpen && (
        <CourseFormModal
          categories={categoryList}
          instructors={instructorList}
          loading={isCreating}
          onClose={() => setCreateOpen(false)}
          onSubmit={async (payload) => {
            await createCourse(payload).unwrap();
            setCreateOpen(false);
          }}
        />
      )}

      {edit && (
        <CourseFormModal
          initial={edit}
          categories={categoryList}
          instructors={instructorList}
          loading={isUpdating}
          onClose={() => setEdit(null)}
          onSubmit={async (payload) => {
            await updateCourse({ id: edit.id, body: payload }).unwrap();
            setEdit(null);
          }}
        />
      )}

      {viewId !== null && (
        <ViewModal id={viewId} open={true} onClose={() => setViewId(null)} />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          courseName={deleteTarget.name}
          loading={isDeleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            try {
              await deleteCourse(deleteTarget.id).unwrap();
              toast.success("Course deleted successfully");
            } catch (err: any) {
              toast.error(err?.data?.message || "Failed to delete course");
            } finally {
              setDeleteTarget(null);
            }
          }}
        />
      )}

      <div className="min-h-screen bg-white p-3 sm:p-4 lg:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Left */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <BookOpen className="w-7 h-7 text-white" />
              </div>

              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                Course Management
              </h1>

              <p className="text-sm text-gray-500 font-medium mt-1">
                Create, organize, and manage your learning content, modules, and
                course structure from a single dashboard.
              </p>
            </div>
          </div>

          {/* Right */}
          <button
            onClick={() => setCreateOpen(true)}
            disabled={isCreating}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 hover:opacity-95 active:scale-95 transition-all disabled:opacity-70"
          >
            <Plus size={16} />
            Create Course
          </button>
        </div>

        <AdminCoursesStats total={total} active={active} deleted={deleted} />

        <AdminCoursesToolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          onResetPage={() => setPage(1)}
        />

        <AdminCourseTable
          isLoading={isLoading}
          isError={isError}
          courses={paginated}
          page={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          onView={(id) => setViewId(id)}
          onEdit={setEdit}
          onDelete={setDeleteTarget}
        />
      </div>
    </>
  );
}
