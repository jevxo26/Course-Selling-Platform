// DetailsModal.tsx
import React, { useEffect, useMemo } from "react";
import { ImageIcon, Layers, Loader2, Star, Tag } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { useLazyAdminCategoryQuery } from "@/lib/api/admin/category";
import { normalizeCategory } from "./utils";

export function DetailsModal({
  id,
  onClose,
}: {
  id: number | string;
  onClose: () => void;
}) {
  const [trigger, { data, isFetching, isError }] = useLazyAdminCategoryQuery();

  useEffect(() => {
    trigger(id);
  }, [id, trigger]);

  const cat = useMemo(() => {
    if (!data) return null;
    const raw = data?.data ?? data?.category ?? data;
    return normalizeCategory(raw);
  }, [data]);

  return (
    <ModalShell
      title="Category Details"
      subtitle={`GET /category/${id}`}
      loading={isFetching}
      onClose={onClose}
      wide
    >
      {isFetching ? (
        <div className="flex items-center justify-center gap-2 py-12 text-[12px] text-gray-400 font-semibold">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-500" /> Loading…
        </div>
      ) : isError ? (
        <div className="py-8 text-center text-[12px] text-red-500 font-semibold">
          Failed to load details
        </div>
      ) : cat ? (
        <div className="space-y-4">
          {cat.photo ? (
            <img
              src={cat.photo}
              alt={cat.name}
              className="w-full h-44 object-cover rounded-2xl border border-gray-100"
            />
          ) : (
            <div className="w-full h-32 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center border border-indigo-100">
              <ImageIcon size={32} className="text-indigo-300" />
            </div>
          )}

          <div className="flex items-start gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <h3 className="text-[17px] font-black text-gray-900 truncate">
                {cat.name}
              </h3>
              <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                /{cat.slug}
              </p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${cat.status === "Active"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-500"
                  }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${cat.status === "Active" ? "bg-emerald-500" : "bg-red-400"
                    }`}
                />
                {cat.status}
              </span>
              {cat.metadata?.is_featured && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
                  <Star size={9} className="fill-amber-500 text-amber-500" />
                  Featured
                </span>
              )}
            </div>
          </div>

          {cat.description && (
            <p className="text-[12px] text-gray-600 leading-relaxed">
              {cat.description}
            </p>
          )}

          {cat.metadata && (
            <div className="bg-gray-50 rounded-xl p-3.5 space-y-2">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                Metadata
              </p>
              {cat.metadata.seo_title && (
                <InfoRow
                  icon={<Tag size={12} />}
                  label="SEO Title"
                  value={cat.metadata.seo_title}
                />
              )}
              {cat.metadata.icon_class && (
                <InfoRow
                  icon={<Layers size={12} />}
                  label="Icon"
                  value={cat.metadata.icon_class}
                />
              )}
            </div>
          )}

          {cat.createdAt && (
            <p className="text-[11px] text-gray-400">
              Created:{" "}
              <span className="text-gray-600 font-semibold">
                {cat.createdAt}
              </span>
            </p>
          )}

          {/* <details>
            <summary className="cursor-pointer text-[11px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors list-none">
              View raw JSON ↓
            </summary>
            <pre className="mt-2 text-[10px] text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-3 overflow-auto max-h-[200px]">
              {JSON.stringify(data ?? null, null, 2)}
            </pre>
          </details> */}
        </div>
      ) : null}
    </ModalShell>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400">{icon}</span>
      <span className="text-[11px] text-gray-500 w-20 shrink-0">{label}</span>
      <span className="text-[11px] font-semibold text-gray-800 truncate">
        {value}
      </span>
    </div>
  );
}
