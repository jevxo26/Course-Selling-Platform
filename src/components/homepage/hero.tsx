"use client";

import { DollarSign, TrendingUp, Users, BarChart2, Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  useGetStatsQuery,
  useGetAdminDashboardStatsQuery,
  useGetStudentDashboardStatsQuery,
} from "@/lib/api/statsApi";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const, delay },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as const, delay },
  }),
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.88 },
  show: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay },
  }),
};

const rows = [
  { label: "Figma UI Kit", pct: 78, color: "#4f46e5", earn: "$1,240" },
  { label: "React Bootcamp", pct: 62, color: "#10B981", earn: "$980" },
  { label: "SEO Mastery", pct: 45, color: "#818cf8", earn: "$670" },
  { label: "Copywriting", pct: 91, color: "#F59E0B", earn: "$1,400" },
];

function HomeHero() {
  const { data: statsData } = useGetStatsQuery();
  const { data: adminStats } = useGetAdminDashboardStatsQuery(undefined, { skip: true });
  const { data: studentStats } = useGetStudentDashboardStatsQuery(undefined, { skip: true });

  const parseNumber = (val: string) =>
    parseFloat(val.replace(/[^0-9.-]+/g, "")) || 0;

  const totalStudents = (() => {
    if (!statsData?.kpis) return 0;
    const found = statsData.kpis.find(
      (k) =>
        k.icon === "Users" ||
        k.label.toLowerCase().includes("student") ||
        k.label.toLowerCase().includes("user")
    );
    return found ? parseNumber(found.value) : 0;
  })();

  const rawRevenue = (() => {
    if (!statsData?.kpis) return 0;
    const found = statsData.kpis.find(
      (k) =>
        k.icon === "DollarSign" ||
        k.label.toLowerCase().includes("revenue") ||
        k.label.toLowerCase().includes("sale")
    );
    return found ? parseNumber(found.value) : 0;
  })();

  const totalCourses = (() => {
    if (!statsData?.kpis) return 0;
    const found = statsData.kpis.find(
      (k) =>
        k.icon === "GraduationCap" ||
        k.label.toLowerCase().includes("course")
    );
    return found ? parseNumber(found.value) : 0;
  })();

  const avgRoi = (() => {
    if (!statsData?.kpis) return 0;
    const found = statsData.kpis.find(
      (k) =>
        k.label.toLowerCase().includes("roi") ||
        k.label.toLowerCase().includes("return")
    );
    return found ? parseNumber(found.value) : 0;
  })();

  const avgRating = (() => {
    if (!statsData?.kpis) return 0;
    const found = statsData.kpis.find(
      (k) =>
        k.label.toLowerCase().includes("rating") ||
        k.label.toLowerCase().includes("stars")
    );
    return found ? parseNumber(found.value) : 0;
  })();

  const formatStudents = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k+` : `${n}+`;

  const formatRevenue = (n: number) =>
    n >= 1000000
      ? `৳${(n / 1000000).toFixed(1)}M+`
      : n >= 1000
        ? `৳${(n / 1000).toFixed(0)}k+`
        : `৳${n}+`;

  const stats = [
    {
      icon: Users,
      label: "Students",
      value: formatStudents(totalStudents),
    },
    { icon: TrendingUp, label: "Avg. ROI", value: `${avgRoi}%` },
    { icon: Star, label: "Rating", value: `${avgRating}` },
    {
      icon: BarChart2,
      label: "Courses",
      value: `${totalCourses}+`,
    },
  ];

  const rowsColor = ["#4f46e5", "#10B981", "#818cf8", "#F59E0B"];
  const dynamicRows = (statsData?.topCourses && statsData.topCourses.length > 0)
    ? statsData.topCourses.slice(0, 4).map((c, idx) => {
      const rev = parseNumber(c.revenue);
      const pct = Math.min(100, Math.max(20, Math.round((rev / (rawRevenue || 1)) * 500))) || 60;
      return {
        label: c.title,
        pct,
        color: rowsColor[idx % rowsColor.length],
        earn: typeof c.revenue === 'string' ? c.revenue.replace('$', '৳') : `৳${c.revenue}`,
      };
    })
    : rows;

  return (
    <section
      className="min-h-screen w-full flex items-center pt-20 md:pt-0 pb-12 overflow-hidden relative"
      style={{
        background:
          "linear-gradient(135deg, #f8f9ff 0%, #f0f1ff 40%, #eef0ff 100%)",
      }}
    >
      {/* ── bg decorations ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, #6366f1, transparent)",
          }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-15 blur-2xl"
          style={{
            background: "radial-gradient(circle, #4f46e5, transparent)",
          }}
        />
        <div
          className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl"
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
              id="hero-dots"
              x="0"
              y="0"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" fill="#4f46e5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* ══ LEFT ══ */}
          <div className="flex flex-col space-y-6">
            {/* badge */}
            <motion.div
              className="inline-flex w-fit"
              variants={fadeIn}
              initial="hidden"
              animate="show"
              custom={0}
            >
              <span
                className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest text-white shadow-md"
                style={{
                  background: "linear-gradient(135deg, #0047FF, ##0047FF)",
                }}
              >
                FINANCIAL EVOLUTION
              </span>
            </motion.div>

            {/* heading */}
            <div className="space-y-1">
              <motion.h1
                className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight"
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={0.1}
              >
                Skill to Income
              </motion.h1>
              <motion.h2
                className="text-4xl lg:text-5xl font-black leading-tight ] bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #4f46e5, #6366f1)",
                }}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={0.2}
              >
                Transformation
              </motion.h2>
            </div>

            {/* description */}
            <motion.p
              className="text-[16px] text-slate-500 max-w-md leading-relaxed"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.3}
            >
              Real earning promise. Master the high-demand skills that actually
              pay and bridge the gap between learning and financial freedom.
            </motion.p>

            {/* buttons */}
            <motion.div
              className="grid grid-cols-1 items-stretch sm:items-center gap-3 pt-1"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.4}
            >
              <Link href="/signup" className="w-full sm:w-auto">
                <button
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white text-[15px] font-extrabold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-400/30"
                  style={{
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                  }}
                >
                  Start Learning
                  <TrendingUp className="w-4 h-4" />
                </button>
              </Link>

              <Link href="/signup?role=affiliate" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full text-[15px] font-extrabold border-2 border-indigo-400 text-indigo-700 bg-white/60 backdrop-blur-sm hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95">
                  Earn as Affiliate
                </button>
              </Link>
            </motion.div>

            {/* ── LIVE STATS ── */}
            <motion.div
              className=" grid grid-cols-3 md:grid-cols-4 items-center gap-2.5 pt-2 "
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.55}
            >
              {stats.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 bg-white/70 backdrop-blur-sm border border-indigo-100 rounded-2xl px-3.5 py-2.5 shadow-sm"
                >
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #eef0ff, #e0e3ff)",
                    }}
                  >
                    <Icon className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-black text-slate-900 leading-none">
                      {value}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ══ RIGHT — DASHBOARD MOCKUP ══ */}
          <motion.div
            className="flex items-center justify-center lg:justify-end mt-8 lg:mt-0"
            variants={scaleUp}
            initial="hidden"
            animate="show"
            custom={0.25}
          >
            <div className="relative w-full max-w-[480px]">
              <div
                className="absolute -inset-6 rounded-[2.5rem] blur-2xl pointer-events-none opacity-60"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(79,70,229,0.08))",
                }}
              />

              {/* browser chrome */}
              <div className="relative rounded-[1.5rem] overflow-hidden shadow-2xl border border-indigo-200/30 bg-[#0F1C2E]">
                <div className="flex items-center gap-1.5 px-4 py-3 bg-[#162032] border-b border-white/5">
                  <span className="w-3 h-3 rounded-full bg-red-400/70" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400/70" />
                  <div className="flex-1 mx-4 h-5 rounded-md bg-white/10 flex items-center px-3">
                    <span className="text-[10px] text-white/30 tracking-wide">
                      app.skillpay.io/dashboard
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                      Dashboard
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                      Live
                    </span>
                  </div>

                  {/* stat chips */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        label: "Total Earned",
                        val: statsData ? formatRevenue(rawRevenue) : "৳18,420",
                        color: "text-emerald-400",
                      },
                      {
                        label: "This Month",
                        val: statsData ? formatRevenue(rawRevenue * 0.35) : "৳4,290",
                        color: "text-indigo-400",
                      },
                      {
                        label: "Pending",
                        val: statsData ? formatRevenue(rawRevenue * 0.07) : "৳830",
                        color: "text-yellow-400",
                      },
                    ].map(({ label, val, color }) => (
                      <div
                        key={label}
                        className="bg-white/5 rounded-xl p-3 border border-white/5"
                      >
                        <p className="text-[10px] text-white/40 mb-1">
                          {label}
                        </p>
                        <p className={`text-sm font-bold ${color}`}>{val}</p>
                      </div>
                    ))}
                  </div>

                  {/* course rows */}
                  <div className="space-y-2.5">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">
                      Course Earnings
                    </p>
                    {dynamicRows.map(({ label, pct, color, earn }, i) => (
                      <motion.div
                        key={label}
                        className="space-y-1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.55 + i * 0.08,
                          duration: 0.5,
                          ease: [0.25, 0.1, 0.25, 1] as const,
                        }}
                      >
                        <div className="flex justify-between">
                          <span className="text-[11px] text-white/60">
                            {label}
                          </span>
                          <span className="text-[11px] font-semibold text-white/80">
                            {earn}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{
                              delay: 0.7 + i * 0.1,
                              duration: 0.8,
                              ease: [0.22, 1, 0.36, 1] as const,
                            }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* bar chart */}
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart2 className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="text-[10px] text-white/50 font-semibold uppercase tracking-widest">
                        6-Month Revenue
                      </span>
                    </div>
                    <div className="flex items-end gap-1.5 h-14">
                      {[40, 55, 38, 70, 62, 88].map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-t-sm"
                          style={{
                            background:
                              i === 5
                                ? "linear-gradient(180deg, #6366f1, #4f46e5)"
                                : "rgba(255,255,255,0.10)",
                            height: `${h}%`,
                          }}
                          initial={{ scaleY: 0, originY: 1 }}
                          animate={{ scaleY: 1 }}
                          transition={{
                            delay: 0.8 + i * 0.07,
                            duration: 0.5,
                            ease: [0.25, 0.1, 0.25, 1] as const,
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      {["Dec", "Jan", "Feb", "Mar", "Apr", "May"].map((m) => (
                        <span
                          key={m}
                          className="text-[9px] text-white/25 flex-1 text-center"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Payout Card */}
              <motion.div
                className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl border border-indigo-100 p-4 flex items-center gap-4 min-w-[210px]"
                initial={{ opacity: 0, y: 20, x: -10 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{
                  delay: 0.85,
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-400/30 rounded-full blur-md scale-125" />
                  <div
                    className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                    style={{
                      background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                    }}
                  >
                    <span className="text-xl font-black text-white">৳</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">
                    Weekly Payout
                  </p>
                  <p className="text-xl font-extrabold text-indigo-600 tracking-tight">
                    {statsData ? `${formatRevenue(rawRevenue * 0.35)}` : ""}
                  </p>
                </div>
              </motion.div>

              {/* Floating ROI Badge */}
              <motion.div
                className="absolute -top-4 -right-4 text-white rounded-xl px-3 py-2 shadow-lg flex items-center gap-1.5"
                style={{
                  background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                }}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 1,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200,
                }}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-xs font-bold">+{statsData ? `${avgRoi}%` : "312%"} ROI</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HomeHero;