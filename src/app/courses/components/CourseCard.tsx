import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Crown, Star } from "lucide-react";
import { Course } from "./types";
import { CATEGORY_PALETTE } from "./utils";
import StarRating from "./StarRating";

interface Props {
  course: Course;
  index: number;
  categoryMeta: Record<string, { icon: any; color: string; bg: string }>;
}

export default function CourseCard({ course, index, categoryMeta }: Props) {
  const meta = categoryMeta[course.category] ?? CATEGORY_PALETTE[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      className="group relative bg-white rounded-3xl overflow-hidden flex flex-col"
      style={{
        boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)",
      }}
    >
      {/* ── Hover glow border ── */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
        style={{
          boxShadow:
            "inset 0 0 0 1.5px rgba(99,102,241,0.35), 0 8px 32px rgba(99,102,241,0.12)",
        }}
      />

      {/* ── Thumbnail ── */}
      <div className="relative h-48 overflow-hidden flex-shrink-0 bg-slate-100">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Premium ribbon top-left */}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-violet-500/40">
          <Crown className="w-2.5 h-2.5" />
          PREMIUM
        </div>

        {/* Potential badge top-right */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-emerald-500/30">
          <Sparkles className="w-2.5 h-2.5" />
          {course.potential}
        </div>

        {/* Commission bottom-left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-black text-emerald-700 tracking-wide">
            {course.commission}
          </span>
        </div>

        {/* Category bottom-right */}
        <span
          className={`absolute bottom-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-md bg-white/85 ${meta.color} ${meta.bg}`}
        >
          {course.category}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Title + Price row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[14.5px] font-extrabold text-slate-900 leading-snug flex-1 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
            {course.title}
          </h3>
          <div className="shrink-0 flex flex-col items-end">
            <span className="text-[20px] font-black text-slate-900 leading-none">
              ৳{course.price}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
              one-time
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2 flex-1">
          {course.desc}
        </p>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Rating row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <StarRating rating={course.rating} />
            <span className="text-[12px] font-bold text-slate-800">
              {course.rating}
            </span>
            <span className="text-[11px] text-slate-400">
              ({course.reviews})
            </span>
          </div>
          <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
            ✦ Top Rated
          </span>
        </div>

        {/* CTA Button */}
        <Link
          href={`/courses/${course.id}`}
          className="group/btn relative w-full py-3 rounded-2xl text-white text-[13px] font-extrabold transition-all duration-200 flex items-center justify-center gap-2 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)",
            boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
          }}
        >
          {/* shine sweep */}
          <span className="absolute inset-0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />
          View Details
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </motion.div>
  );
}
