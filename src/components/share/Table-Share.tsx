"use client";

import * as React from "react";
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type DataTableColumnHeaderProps<TData, TValue> =
  React.HTMLAttributes<HTMLDivElement> & {
    column: Column<TData, TValue>;
    title: string;
  };

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false);

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const sorted = column.getIsSorted();

  return (
    <div
      className={cn("relative inline-flex items-center", className)}
      tabIndex={-1}
      onBlur={(e) => {
        const next = e.relatedTarget as Node | null;
        if (!next || !e.currentTarget.contains(next)) setOpen(false);
      }}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "-ml-3 h-8 rounded-lg px-2 text-[11px] font-extrabold tracking-wide text-gray-700 hover:bg-gray-100/70 hover:text-gray-900",
          open && "bg-gray-100/80"
        )}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="whitespace-nowrap">{title}</span>
        {sorted === "desc" ? (
          <ArrowDown className="h-3.5 w-3.5" />
        ) : sorted === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronsUpDown className="h-3.5 w-3.5" />
        )}
      </Button>

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => {
              column.toggleSorting(false);
              setOpen(false);
            }}
          >
            <ArrowUp className="h-3.5 w-3.5" /> Asc
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => {
              column.toggleSorting(true);
              setOpen(false);
            }}
          >
            <ArrowDown className="h-3.5 w-3.5" /> Desc
          </button>
          <div className="my-1 h-px bg-gray-100" />
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => {
              column.toggleVisibility(false);
              setOpen(false);
            }}
          >
            <EyeOff className="h-3.5 w-3.5" /> Hide
          </button>
        </div>
      ) : null}
    </div>
  );
}

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  showColumnsToggle?: boolean;
  showFooter?: boolean;
  pageSize?: number;
  toolbarRight?: React.ReactNode;
  className?: string;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  showColumnsToggle = true,
  showFooter = true,
  pageSize = 10,
  toolbarRight,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnsOpen, setColumnsOpen] = React.useState(false);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    initialState: { pagination: { pageSize } },
  });

  React.useEffect(() => {
    table.setPageSize(pageSize);
  }, [pageSize, table]);

  const filterColumn = searchKey ? table.getColumn(searchKey) : undefined;

  return (
    <div className={cn("w-full", className)}>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-3">
        {searchKey ? (
          <div className="w-full sm:max-w-sm">
            <Input
              placeholder={searchPlaceholder ?? "Search..."}
              value={(filterColumn?.getFilterValue() as string) ?? ""}
              onChange={(e) => filterColumn?.setFilterValue(e.target.value)}
              className="h-10 rounded-xl border-gray-200 bg-white shadow-sm focus-visible:ring-indigo-500 placeholder:text-gray-400 text-gray-800"
            />
          </div>
        ) : (
          <div />
        )}

        <div className="flex flex-wrap items-center gap-2">
          {toolbarRight}

          {showColumnsToggle ? (
            <div
              className="relative"
              tabIndex={-1}
              onBlur={(e) => {
                const next = e.relatedTarget as Node | null;
                if (!next || !e.currentTarget.contains(next)) {
                  setColumnsOpen(false);
                }
              }}
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 rounded-xl border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-700 font-semibold transition-colors"
                onClick={() => setColumnsOpen((v) => !v)}
              >
                Columns
              </Button>

              {columnsOpen ? (
                <div className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                  <div className="px-3 py-2 text-[11px] font-extrabold tracking-widest uppercase text-gray-500">
                    Toggle columns
                  </div>
                  <div className="h-px bg-gray-100" />
                  <div className="max-h-64 overflow-auto">
                    {table
                      .getAllColumns()
                      .filter((c) => c.getCanHide())
                      .map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => c.toggleVisibility(!c.getIsVisible())}
                        >
                          <span
                            className={cn(
                              "inline-flex h-4 w-4 items-center justify-center rounded border text-[10px] font-black transition-colors",
                              c.getIsVisible()
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-white border-gray-300"
                            )}
                          >
                            {c.getIsVisible() ? "✓" : ""}
                          </span>
                          <span className="capitalize">{c.id}</span>
                        </button>
                      ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200/70 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="bg-gray-50/80">
            {table.getHeaderGroups().map((hg) => (
              <tr
                key={hg.id}
                className="border-b border-gray-200/80"
              >
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="h-11 px-3 text-left align-middle text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase text-gray-600 whitespace-nowrap"
                  >
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="p-3 align-middle text-[12px] sm:text-[13px] text-gray-800"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center text-[13px] font-semibold text-gray-500"
                >
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {showFooter ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4">
          <div className="text-[12px] font-semibold text-gray-600">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-semibold text-xs transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-9 rounded-lg border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-semibold text-xs transition-colors disabled:opacity-50"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}