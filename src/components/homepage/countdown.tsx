"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Users, DollarSign, TrendingUp, BookOpen } from "lucide-react";
import { useGetStatsQuery } from "@/lib/api/statsApi";
import type { ReactNode } from "react";

interface StatItem {
  id: number;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon: ReactNode;
  gradient: string;
  borderColor: string;
  glowColor: string;
}

function useCounter(target: number, decimals = 0, shouldStart: boolean) {
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    if (!shouldStart) return;
    const controls = animate(0, target, {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(val) {
        setDisplay(
          decimals > 0
            ? val.toFixed(decimals)
            : Math.floor(val).toLocaleString(),
        );
      },
    });
    return () => controls.stop();
  }, [shouldStart, target, decimals]);
  return display;
}

function StatCard({
  stat,
  index,
  shouldStart,
}: {
  stat: StatItem;
  index: number;
  shouldStart: boolean;
}) {
  const count = useCounter(stat.value, stat.decimals ?? 0, shouldStart);

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      animate={shouldStart ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.65,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative group bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 overflow-hidden"
      style={{
        boxShadow: "0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)",
      }}
    >
      {/* hover border glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 0 1.5px ${stat.borderColor}60`,
        }}
      />

      {/* top-right decorative circle */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-xl pointer-events-none"
        style={{ background: stat.borderColor }}
      />

      {/* icon */}
      <motion.div
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
        style={{ background: stat.gradient }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={shouldStart ? { scale: 1, opacity: 1 } : {}}
        transition={{
          delay: index * 0.12 + 0.2,
          duration: 0.5,
          type: "spring",
          stiffness: 220,
        }}
      >
        <div className="text-white">{stat.icon}</div>
      </motion.div>

      {/* label */}
      <p className="text-[11px] sm:text-[12px] font-black tracking-widest text-slate-400 uppercase mb-2">
        {stat.label}
      </p>

      {/* number */}
      <p
        className="text-[28px] sm:text-[34px] md:text-[40px] font-black tracking-tight leading-none bg-clip-text text-transparent"
        style={{ backgroundImage: stat.gradient }}
      >
        {stat.prefix ?? ""}
        {count}
        {stat.suffix ?? ""}
      </p>

      {/* bottom animated bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-[3px] rounded-full"
        style={{ background: stat.gradient }}
        initial={{ width: "0%" }}
        animate={shouldStart ? { width: "100%" } : {}}
        transition={{
          duration: 1.2,
          delay: index * 0.15 + 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
      />

      {/* hover glow floor */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 120%, ${stat.glowColor} 0%, transparent 70%)`,
        }}
      />
    </motion.div>
  );
}

const avatars = [{ bg: "#c7d2fe" }, { bg: "#a5b4fc" }, { bg: "#818cf8" }];

const CountDownTrust = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const { data: statsData } = useGetStatsQuery();

  const parseNumber = (val: string) =>
    parseFloat(val.replace(/[^0-9.-]+/g, "")) || 0;

  const totalStudents = statsData
    ? parseNumber(
        statsData.kpis.find((k) => k.label === "Active Students")?.value || "0",
      )
    : 50000;
  const rawRevenue = statsData
    ? parseNumber(
        statsData.kpis.find((k) => k.label === "Total Revenue")?.value || "0",
      )
    : 12400000;
  const totalCourses = statsData
    ? parseNumber(
        statsData.kpis.find((k) => k.label === "Published Courses")?.value ||
          "0",
      )
    : 120;

  const revValue = rawRevenue > 1000000 ? rawRevenue / 1000000 : rawRevenue;
  const revSuffix = rawRevenue > 1000000 ? "M+" : "+";
  const revDecimals = rawRevenue > 1000000 ? 1 : 0;

  const stats: StatItem[] = [
    {
      id: 1,
      label: "Total Students",
      value: totalStudents || 50000,
      suffix: "+",
      icon: <Users className="w-6 h-6" />,
      gradient: "linear-gradient(135deg, #4f46e5, #6366f1)",
      borderColor: "#6366f1",
      glowColor: "rgba(99,102,241,0.12)",
    },
    {
      id: 2,
      label: "Total Earnings",
      value: revValue || 12.4,
      prefix: "৳",
      suffix: revSuffix || "M+",
      decimals: revDecimals || 1,
      icon: <DollarSign className="w-6 h-6" />,
      gradient: "linear-gradient(135deg, #059669, #10b981)",
      borderColor: "#10b981",
      glowColor: "rgba(16,185,129,0.12)",
    },
    {
      id: 3,
      label: "Success Rate",
      value: 94.2,
      suffix: "%",
      decimals: 1,
      icon: <TrendingUp className="w-6 h-6" />,
      gradient: "linear-gradient(135deg, #d97706, #f59e0b)",
      borderColor: "#f59e0b",
      glowColor: "rgba(245,158,11,0.12)",
    },
    {
      id: 4,
      label: "Total Courses",
      value: totalCourses || 120,
      suffix: "+",
      icon: <BookOpen className="w-6 h-6" />,
      gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)",
      borderColor: "#a78bfa",
      glowColor: "rgba(167,139,250,0.12)",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-14 md:py-16 md:-mt-10 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #eef0ff 0%, #f0f1ff 60%, #edf0ff 100%)",
        fontFamily: "var(--font-manrope)",
      }}
    >
      {/* bg blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-28 -right-28 w-[420px] h-[420px] rounded-full opacity-[0.07] blur-3xl"
          style={{
            background: "radial-gradient(circle, #6366f1, transparent)",
          }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-[0.07] blur-2xl"
          style={{
            background: "radial-gradient(circle, #818cf8, transparent)",
          }}
        />
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.03]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="cdots"
              x="0"
              y="0"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" fill="#4f46e5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cdots)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10">
        {/* eyebrow */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-indigo-200" />
          <p className="text-[11px] font-black tracking-[0.22em] text-indigo-400 uppercase">
            Trusted by thousands worldwide
          </p>
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-indigo-200" />
        </motion.div>

        {/* stat cards grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-12 sm:mb-14">
          {stats.map((stat, idx) => (
            <StatCard
              key={stat.id}
              stat={stat}
              index={idx}
              shouldStart={isInView}
            />
          ))}
        </div>

        {/* trust row */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5"
          initial={{ opacity: 0, y: 18 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* avatar stack */}
          <div className="flex items-center">
            {avatars.map((av, i) => (
              <motion.div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center shadow-sm"
                style={{
                  backgroundColor: av.bg,
                  marginLeft: i === 0 ? 0 : "-10px",
                  zIndex: avatars.length - i,
                  position: "relative",
                }}
                initial={{ opacity: 0, x: -8 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white/90">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </motion.div>
            ))}

            <motion.div
              className="relative z-10 -ml-2 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md border-2 border-white whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, #4f46e5, #6366f1)",
              }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                delay: 0.84,
                duration: 0.45,
                type: "spring",
                stiffness: 220,
              }}
            >
              +50k
            </motion.div>
          </div>

          {/* quote */}
          <motion.p
            className="text-slate-600 text-[14px] sm:text-base leading-relaxed text-center sm:text-left max-w-xs sm:max-w-none"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.94, duration: 0.5 }}
          >
            <span className="text-slate-300 mr-1">"</span>
            Join{" "}
            <span className="font-black text-indigo-600">
              50k+ successful students
            </span>{" "}
            transforming their future today.
            <span className="text-slate-300 ml-1">"</span>
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default CountDownTrust;
