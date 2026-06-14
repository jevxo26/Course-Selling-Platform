import React, { useState, useEffect } from "react";
import { Check, Loader2, Link as LinkIcon, User, ShieldCheck } from "lucide-react";
import { UiCourse } from "./types";
import ModalShell from "./ModalShell";
import { uploadImageToBackend } from "@/lib/images.upload";

type Props = {
  initial?: UiCourse | null;
  categories: { id: number | string; name: string }[];
  instructors?: { id: number | string; name: string }[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    slug?: string;
    description?: string;
    categoryId: number;
    instructorId?: number;
    price?: number;
    discountPrice?: number;
    thumbnail?: string;
    courseUrl?: string;
    isPublished?: boolean;
    metadata?: {
      level?: string;
      is_premium?: boolean;
    };
  }) => void;
};

export default function CourseFormModal({
  initial,
  categories,
  instructors = [],
  loading,
  onClose,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [manualSlug, setManualSlug] = useState(!!initial?.slug);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ? String(initial.categoryId) : ""
  );
  const [instructorId, setInstructorId] = useState(
    initial?.instructorId ? String(initial.instructorId) : ""
  );
  const [price, setPrice] = useState(initial?.price ? String(initial.price) : "");
  const [discountPrice, setDiscountPrice] = useState(initial?.discountPrice ? String(initial.discountPrice) : "");

  const [thumbnail, setThumbnail] = useState(initial?.thumbnail ?? "");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [courseUrl, setCourseUrl] = useState(initial?.courseUrl ?? "");
  const [level, setLevel] = useState(initial?.level ?? "");
  const [isPremium, setIsPremium] = useState(initial?.is_premium ?? false);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);

  const [uploadingImg, setUploadingImg] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!manualSlug) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  }, [title, manualSlug]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Course title is required";
    if (!categoryId) e.categoryId = "Please select a category";
    return e;
  };

  const submit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    let finalThumbnail = thumbnail;

    if (thumbnailFile) {
      setUploadingImg(true);
      try {
        finalThumbnail = await uploadImageToBackend(thumbnailFile);
      } catch (err) {
        alert("Image upload failed. Please try again.");
        setUploadingImg(false);
        return;
      }
      setUploadingImg(false);
    }

    onSubmit({
      title: title.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
      categoryId: Number(categoryId),
      instructorId: instructorId ? Number(instructorId) : undefined,
      price: price ? Number(price) : undefined,
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      thumbnail: finalThumbnail.trim() || undefined,
      courseUrl: courseUrl.trim() || undefined,
      metadata: {
        level: level.trim() || undefined,
        is_premium: isPremium,
      }
    });
  };

  const isBusy = loading || uploadingImg;

  return (
    <ModalShell
      title={initial ? "Edit Course" : "Create Course"}
      subtitle={initial ? "PATCH /course/:id" : "POST /course"}
      loading={isBusy}
      onClose={onClose}
    >
      <div className="space-y-5 max-h-[70vh] overflow-y-auto px-1 pb-2 scrollbar-thin">
        {/* Row 1: Title & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g. Advanced Next.js"
              className={`w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors text-black ${errors.title ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
                }`}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={`w-full h-10 px-3 text-sm border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors ${errors.categoryId ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
                }`}
            >
              <option value="" disabled>Select a category...</option>
              {categories.map((cat) => (
                <option key={String(cat.id)} value={String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>
            )}
          </div>
        </div>

        {/* Row 2: Instructor & Level */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Instructor <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <User size={14} />
              </div>
              <select
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-sm border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition-colors"
              >
                <option value="">Select instructor...</option>
                {instructors.map((inst) => (
                  <option key={String(inst.id)} value={String(inst.id)}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Level <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full h-10 px-3 text-sm border  text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition-colors"
            >
              <option value="">Select level...</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="All Levels">All Levels</option>
            </select>
          </div>
        </div>

        {/* Row 3: Slug & Thumbnail */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Slug <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 text-black left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <LinkIcon size={14} />
              </div>
              <input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setManualSlug(true);
                }}
                placeholder="advanced-next-js"
                className="w-full h-10 pl-9 pr-3 text-black text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition-colors"
              />
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Thumbnail <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setThumbnailFile(e.target.files[0]);
                  }
                }}
                className="w-full h-10 px-3 py-1.5  text-black text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold file:px-3 file:py-1 file:rounded-md file:mr-3 file:cursor-pointer cursor-pointer text-gray-600 bg-white transition-colors"
              />
            </div>
            {(thumbnail || thumbnailFile) && (
              <p className="text-xs text-gray-500 mt-1 truncate">
                {thumbnailFile ? `Selected: ${thumbnailFile.name}` : `Current: ${thumbnail}`}
              </p>
            )}
          </div>
        </div>

        {/* Row 4: Price & Discount Price (BDT) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Price (৳) <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-600 font-bold text-sm">
                ৳
              </div>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2500"
                className="w-full h-10 pl-8 pr-3 text-black text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition-colors"
              />
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Discount Price (৳) <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-600 font-bold text-sm">
                ৳
              </div>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="1800"
                className="w-full h-10 pl-8 pr-3 text-sm text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Course URL */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Course URL <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <LinkIcon size={14} />
            </div>
            <input
              value={courseUrl}
              onChange={(e) => setCourseUrl(e.target.value)}
              placeholder="https://yoursite.com/courses/nextjs"
              className="w-full h-10 pl-9 pr-3 text-sm border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition-colors"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-[100px] px-3 py-2 text-sm text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition-colors resize-y"
          />
        </div>

        {/* Checkboxes */}
        <div className="flex items-center gap-6 mt-2 bg-gray-100/50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPremium"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <label htmlFor="isPremium" className="text-sm font-medium text-gray-700 select-none cursor-pointer flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-indigo-600" /> Premium Course
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
            />
            <label htmlFor="isPublished" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
              Publish immediately
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-5">
          <button
            onClick={onClose}
            disabled={isBusy}
            className="flex-1 py-2.5 rounded-lg border-2 border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={isBusy}
            className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition-colors disabled:opacity-60"
          >
            {isBusy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {uploadingImg ? "Uploading Image..." : initial ? "Save Changes" : "Create Course"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}