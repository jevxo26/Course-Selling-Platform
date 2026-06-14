// CategoryFormModal.tsx
import { useState } from "react";
import { Check, Loader2, Star } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { ImageUploadField } from "./ImageUploadField";
import { UiCategory } from "./types";
import { slugify } from "./utils";

export function CategoryFormModal({
  initial,
  loading,
  onClose,
  onSubmit,
}: {
  initial?: UiCategory | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    slug: string;
    description?: string;
    photo?: string;
    metadata?: {
      seo_title?: string;
      icon_class?: string;
      is_featured?: boolean;
    };
  }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!!initial?.slug);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [photo, setPhoto] = useState(initial?.photo ?? "");
  const [seoTitle, setSeoTitle] = useState(initial?.metadata?.seo_title ?? "");
  const [iconClass, setIconClass] = useState(initial?.metadata?.icon_class ?? "");
  const [isFeatured, setIsFeatured] = useState(initial?.metadata?.is_featured ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slugManual) setSlug(slugify(v));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!slug.trim()) e.slug = "Slug is required";
    return e;
  };

  const submit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    onSubmit({
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      photo: photo || undefined,
      metadata: {
        seo_title: seoTitle.trim() || undefined,
        icon_class: iconClass.trim() || undefined,
        is_featured: isFeatured,
      },
    });
  };

  // Fixed input class
  const getInputClass = (error?: string) => {
    const base = "w-full h-10 px-4 text-[13px] font-medium text-gray-900 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";
    return error
      ? `${base} border-red-400 bg-red-50`
      : `${base} border-gray-300 hover:border-gray-400`;
  };

  const textareaCls = `w-full px-4 py-3 text-[13px] font-medium text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all`;

  const Field = ({
    label,
    optional,
    error,
    children,
  }: {
    label: string;
    optional?: boolean;
    error?: string;
    children: React.ReactNode;
  }) => (
    <div>
      <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1.5">
        {label}
        {optional && <span className="text-gray-400 normal-case font-normal">· optional</span>}
      </label>
      {children}
      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
    </div>
  );

  return (
    <ModalShell
      title={initial ? "Edit Category" : "New Category"}
      subtitle={initial ? `PATCH /category/${initial.id}` : "POST /category"}
      loading={loading}
      onClose={onClose}
      wide
    >
      <div className="space-y-5">
        <ImageUploadField value={photo} onChange={setPhoto} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name" error={errors.name}>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Web Development"
              className={getInputClass(errors.name)}
              disabled={loading}
            />
          </Field>

          <Field label="Slug" error={errors.slug}>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugManual(true);
                setSlug(e.target.value);
              }}
              placeholder="e.g. web-development"
              className={getInputClass(errors.slug)}
              disabled={loading}
            />
          </Field>
        </div>

        <Field label="Description" optional>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description of this category…"
            rows={3}
            className={textareaCls}
            disabled={loading}
          />
        </Field>

        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 space-y-4">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            Metadata
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="SEO Title" optional>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Best … Courses 2024"
                className={getInputClass()}
                disabled={loading}
              />
            </Field>
            <Field label="Icon Class" optional>
              <input
                type="text"
                value={iconClass}
                onChange={(e) => setIconClass(e.target.value)}
                placeholder="fa-code"
                className={getInputClass()}
                disabled={loading}
              />
            </Field>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <button
              type="button"
              onClick={() => setIsFeatured((p) => !p)}
              className={`relative w-10 rounded-full transition-colors shrink-0 ${isFeatured ? "bg-indigo-600" : "bg-gray-300"}`}
              style={{ height: "22px" }}
              disabled={loading}
              aria-pressed={isFeatured}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isFeatured ? "translate-x-[18px]" : "translate-x-0"}`}
              />
            </button>
            <span className="text-[13px] font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
              Featured category
            </span>
            {isFeatured && <Star size={14} className="text-amber-400 fill-amber-400" />}
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.985] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            {initial ? "Save Changes" : "Create Category"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}