// CategoryManagerPage.tsx
"use client";

import React, { useMemo, useState } from "react";
import { FolderOpen, Plus, Search, X } from "lucide-react";
import {
  useAdminCategoriesQuery,
  useAdminCreateCategoryMutation,
  useAdminDeleteCategoryMutation,
  useAdminRestoreCategoryMutation,
  useAdminUpdateCategoryMutation,
} from "@/lib/api/admin/category";

import { Status, UiCategory } from "./types";
import { extractItems, extractMeta, normalizeCategory } from "./utils";
import { StatCards } from "./StatCards";
import { CategoryFormModal } from "./CategoryFormModal";
import { ConfirmModal } from "./ConfirmModal";
import { DetailsModal } from "./DetailsModal";
import { CategoryTable } from "./CategoryTable";
import { Pagination } from "./Pagination";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export default function CategoryManager(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | Status>("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useAdminCategoriesQuery({
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const [createCategory, { isLoading: isCreating }] =
    useAdminCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useAdminUpdateCategoryMutation();
  const [restoreCategory, { isLoading: isRestoring }] =
    useAdminRestoreCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useAdminDeleteCategoryMutation();

  const categories = useMemo(
    () =>
      extractItems(data)
        .map(normalizeCategory)
        .filter((x): x is UiCategory => Boolean(x)),
    [data]
  );

  const meta = useMemo(() => extractMeta(data), [data]);

  const filtered = useMemo(
    () =>
      statusFilter
        ? categories.filter((c) => c.status === statusFilter)
        : categories,
    [categories, statusFilter]
  );

  const totalPages =
    meta.totalPages || Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated =
    meta.total > 0
      ? filtered
      : filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const total = meta.total || categories.length;
  const active = categories.filter((c) => c.status === "Active").length;
  const deleted = categories.filter((c) => c.status === "Deleted").length;

  const [createOpen, setCreateOpen] = useState(false);
  const [edit, setEdit] = useState<UiCategory | null>(null);
  const [detailsId, setDetailsId] = useState<number | string | null>(null);
  const [restore, setRestore] = useState<UiCategory | null>(null);
  const [remove, setRemove] = useState<UiCategory | null>(null);

  const busy = isCreating || isUpdating || isRestoring || isDeleting;

  return (
    <>
      {/* ── Modals ── */}
      {createOpen && (
        <CategoryFormModal
          loading={isCreating}
          onClose={() => setCreateOpen(false)}
          onSubmit={async (payload) => {
            await createCategory(payload).unwrap();
            setCreateOpen(false);
          }}
        />
      )}
      {edit && (
        <CategoryFormModal
          initial={edit}
          loading={isUpdating}
          onClose={() => setEdit(null)}
          onSubmit={async (payload) => {
            await updateCategory({ id: edit.id, ...payload }).unwrap();
            setEdit(null);
          }}
        />
      )}
      {detailsId !== null && (
        <DetailsModal id={detailsId} onClose={() => setDetailsId(null)} />
      )}
      {restore && (
        <ConfirmModal
          title="Restore category?"
          description={
            <>
              Restore{" "}
              <span className="font-bold text-gray-800">{restore.name}</span>{" "}
              and mark it as active?
            </>
          }
          confirmText="Restore"
          confirmTone="primary"
          loading={busy}
          onClose={() => setRestore(null)}
          onConfirm={async () => {
            await restoreCategory(restore.id).unwrap();
            setRestore(null);
          }}
        />
      )}
      {remove && (
        <ConfirmModal
          title="Delete category?"
          description={
            <>
              Are you sure you want to delete{" "}
              <span className="font-bold text-gray-800">{remove.name}</span>?
              This can be restored later.
            </>
          }
          confirmText="Delete"
          confirmTone="danger"
          loading={busy}
          onClose={() => setRemove(null)}
          onConfirm={async () => {
            try {
              await deleteCategory(remove.id).unwrap();
              toast.success("Category deleted successfully");
            } catch (err: any) {
              toast.error(err?.data?.message || "Failed to delete category");
            } finally {
              setRemove(null);
            }
          }}
        />
      )}

      {/* ── Page Content ── */}
      <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
              <FolderOpen size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-[22px] font-black text-gray-900 tracking-tight">
                Category Management
              </h1>
              <p className="text-sm text-gray-500 mt-1 leading-tight">
                Manage course categories, slugs, photos and SEO metadata.
              </p>
            </div>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            disabled={isCreating}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] text-white text-sm font-bold px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-60 w-full sm:w-auto"
          >
            <Plus size={18} /> Add Category
          </button>
        </div>

        <StatCards total={total} active={active} deleted={deleted} />

        {/* Search + Filter */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </div>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search categories…"
              className="w-full pl-11 pr-10 py-3 text-[15px] font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className="h-12 sm:h-12 px-4 text-[15px] font-medium border border-gray-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 w-full sm:w-52"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Deleted">Deleted</option>
          </select>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <CategoryTable
              isLoading={isLoading}
              isError={isError}
              categories={paginated}
              onView={(c) => setDetailsId(c.id)}
              onEdit={setEdit}
              onRestore={setRestore}
              onDelete={setRemove}
            />
          </div>

          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={meta.total || filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>
    </>
  );
}