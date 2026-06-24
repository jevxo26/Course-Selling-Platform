"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { ArrowRight, Star, Users, Clock } from "lucide-react";
import { useGetPublicCoursesQuery } from "@/lib/api/courseApi";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

function CourseCard({
  course,
  index,
  isInView,
}: {
  course: any;
  index: number;
  isInView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 44 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.65,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group bg-white rounded-[1.5rem] overflow-hidden border border-slate-100/90 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,82,204,0.08)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col"
    >
      {/* image */}
      <div
        className="relative h-52 overflow-hidden flex-shrink-0"
        style={{ backgroundColor: course.imageBg }}
      >
        <motion.img
          src={course.imageUrl}
          alt={course.imageAlt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          initial={{ scale: 1.1 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{
            delay: index * 0.15 + 0.15,
            duration: 0.8,
            ease: "easeOut",
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        {/* vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />

        {/* potential badge */}
        <motion.span
          className="absolute top-4 right-4 text-[10.5px] font-black px-3.5 py-1.5 rounded-full shadow-lg text-white"
          style={{
            background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
          }}
          initial={{ opacity: 0, y: -6, scale: 0.85 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{
            delay: index * 0.15 + 0.4,
            duration: 0.4,
            type: "spring",
            stiffness: 220,
          }}
        >
          {course.tag}
        </motion.span>
      </div>

      {/* body */}
      <div className="p-6 flex flex-col flex-1">
        {/* category */}
        <span
          className="inline-block text-[9.5px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-md bg-blue-50 text-[#0052CC] mb-3.5 self-start"
        >
          {course.category}
        </span>

        {/* title */}
        <h3 className="text-[17px] font-extrabold text-slate-800 leading-[1.4] mb-3.5 flex-1">
          {course.title}
        </h3>

        {/* meta row */}
        <div className="flex items-center gap-4 text-[12px] text-slate-400 font-medium mb-4.5">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            {course.students} students
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            {course.duration}
          </span>
        </div>

        {/* divider */}
        <div className="h-px bg-slate-100 mb-4" />

        {/* price + rating */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-[23px] font-black text-slate-900 tracking-tight">
            {course.price}
          </span>
          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 text-[13px] font-bold text-amber-700">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {course.rating}
          </div>
        </div>

        {/* enroll button */}
        <Link href={`/courses/${course.id}`} className="mt-auto">
          <motion.button
            className="w-full py-3.5 rounded-xl text-[14px] font-extrabold text-white tracking-wide transition-all duration-300 shadow-sm"
            style={{
              background: "linear-gradient(135deg, #0052CC 0%, #1d4ed8 100%)",
            }}
            whileHover={{
              scale: 1.01,
              boxShadow: "0 6px 20px rgba(0, 82, 204, 0.25)",
              background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            Enroll Now
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

// ── main ─────────────────────────────────────────────────────────────────────
const CourseSection = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const { data, isLoading } = useGetPublicCoursesQuery({ page: 1, limit: 3 });

  const mappedCourses = data?.items?.map((c, idx) => {
    const colors = [
      { tagColor: "#15803d", tagBg: "#dcfce7", imageBg: "#f0ece4", accent: "#0052CC" },
      { tagColor: "#15803d", tagBg: "#dcfce7", imageBg: "#d1fae5", accent: "#006E2A" },
      { tagColor: "#15803d", tagBg: "#dcfce7", imageBg: "#0d9488", accent: "#705D00" },
    ];
    const colorSet = colors[idx % colors.length];

    const coursePrice = Number(c.price) || 0;
    const ratingVal = c.metadata?.rating || "5.0";
    const durationVal = c.metadata?.duration || "Self-paced";

    return {
      id: c.id,
      tag: c.metadata?.potential || (coursePrice > 5000 ? "" : ""),
      tagColor: colorSet.tagColor,
      tagBg: colorSet.tagBg,
      category: c.category?.name || "GENERAL",
      categoryColor: "#0052CC",
      title: c.title,
      price: c.price ? `৳${c.price}` : "Free",
      rating: ratingVal,
      students: c.enrollmentCount || 0,
      duration: durationVal,
      imageBg: colorSet.imageBg,
      imageUrl:
        c.thumbnail ||
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=700&q=85",
      imageAlt: c.title,
      accent: colorSet.accent,
    };
  }) || [];

  return (
    <section
      ref={ref}
      className={`py-12 md:py-16 ${plusJakarta.className}`}
      style={{
        background:
          "linear-gradient(135deg, #f8f9ff 0%, #f0f1ff 40%, #eef0ff 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── header ── */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 md:mb-12 gap-4 sm:gap-6"
          initial={{ opacity: 0, y: 22 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* left */}
          <div className="w-full">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Master Your <span className="text-[#0052CC]">Future</span>
            </h2>

            <p className="text-slate-500 mt-3 text-base md:text-lg font-medium max-w-xl">
              Curated paths to high-income mastery.
            </p>
          </div>

          {/* right — "View All Courses →" */}
          <Link
            href="/courses"
            className="flex items-center self-start sm:self-auto flex-shrink-0"
          >
            <motion.span
              className="flex items-center gap-1.5 text-[#0052CC] font-semibold text-sm sm:text-[14px] group/link"
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              View All Courses
              <motion.span
                className="inline-flex"
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
              >
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" />
              </motion.span>
            </motion.span>
          </Link>
        </motion.div>

        {/* ── cards ── */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-[#0052CC] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mappedCourses.map((course, idx) => (
              <CourseCard
                key={course.id}
                course={course}
                index={idx}
                isInView={isInView}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CourseSection;
