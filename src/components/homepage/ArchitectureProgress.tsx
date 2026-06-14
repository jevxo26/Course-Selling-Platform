"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ChevronDown, TrendingUp, TrendingDown } from "lucide-react";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// ── Fixed Animation Helper ─────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { 
    duration: 0.6, 
    delay, 
    ease: [0.22, 1, 0.36, 1] as const 
  },
});

// ── Animated Number Component ─────────────────────────────────────────────────
function AnimatedDollar({
  value,
  isInView,
  delay,
}: {
  value: string;
  isInView: boolean;
  delay: number;
}) {
  return (
    <motion.span
      className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight"
      initial={{ opacity: 0, x: -12 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ 
        delay, 
        duration: 0.5, 
        ease: [0.22, 1, 0.36, 1] as const 
      }}
    >
      {value}
    </motion.span>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
const ArchitectureProgress = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className={`py-20 md:py-22 relative overflow-hidden ${plusJakarta.className}`}
      style={{
        background:
          "linear-gradient(135deg, #f8f9ff 0%, #f0f1ff 40%, #eef0ff 100%)",
      }}
    >
      {/* subtle bg grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="g"
              x="0"
              y="0"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 32 0 L 0 0 0 32"
                fill="none"
                stroke="#0052CC"
                strokeWidth="0.6"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-20 items-center">
          {/* LEFT SIDE */}
          <div>
            {/* Heading - Fixed */}
            <motion.h2
              className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-10"
              initial={{ opacity: 0, y: 28 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
              transition={{ 
                duration: 0.6, 
                delay: 0, 
                ease: [0.22, 1, 0.36, 1] as const 
              }}
            >
              The Architecture of{" "}
              <span className="text-[#0052CC]">Progress</span>
            </motion.h2>

            {/* BEFORE card */}
            <motion.div
              className="relative bg-white rounded-2xl px-6 py-5 mb-2 border border-gray-100 shadow-sm overflow-hidden"
              initial={{ opacity: 0, x: -24 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{
                delay: 0.15,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-red-300" />

              <p className="text-[10px] font-extrabold tracking-[0.16em] text-gray-400 uppercase mb-3">
                Before IncomeArchitect
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <AnimatedDollar
                  value="৳1,200/mo"
                  isInView={isInView}
                  delay={0.3}
                />
                <span className="flex items-center gap-1 text-sm text-gray-400 font-medium">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  Stagnant wage, no growth roadmap.
                </span>
              </div>
            </motion.div>

            {/* Arrow */}
            <motion.div
              className="flex justify-center my-3"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                delay: 0.42,
                duration: 0.4,
                type: "spring",
                stiffness: 220,
              }}
            >
              <div className="w-8 h-8 rounded-full bg-[#0052CC] flex items-center justify-center shadow-md shadow-blue-200">
                <ChevronDown className="text-white w-5 h-5" />
              </div>
            </motion.div>

            {/* AFTER card */}
            <motion.div
              className="relative bg-[#f0fdf4] rounded-2xl px-6 py-5 border border-green-100 shadow-sm overflow-hidden"
              initial={{ opacity: 0, x: -24 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{
                delay: 0.5,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-green-500" />

              <p className="text-[10px] font-extrabold tracking-[0.16em] text-green-600 uppercase mb-3">
                After 6 Months
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <AnimatedDollar
                  value="৳7,850/mo"
                  isInView={isInView}
                  delay={0.65}
                />
                <motion.span
                  className="flex items-center gap-1.5 text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ 
                    delay: 0.8, 
                    duration: 0.4, 
                    type: "spring" 
                  }}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  +554% Growth
                </motion.span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDE */}
          <motion.div
            className="relative flex justify-center"
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ 
              delay: 0.2, 
              duration: 0.7, 
              ease: [0.22, 1, 0.36, 1] as const 
            }}
          >
            {/* glow */}
            <div className="absolute inset-4 rounded-3xl bg-gradient-to-br from-green-200/40 to-blue-100/30 blur-2xl pointer-events-none" />

            {/* Main Image Card */}
            <div className="relative w-[300px] md:w-[340px] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=700&q=85"
                alt="Student success"
                className="w-full h-[400px] object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />

              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(170deg, rgba(40,48,20,0.55) 0%, rgba(30,38,15,0.82) 100%)",
                }}
              />

              <div className="absolute inset-0 flex flex-col justify-center px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.55, duration: 0.6 }}
                >
                  <p className="text-[11px] font-bold tracking-[0.22em] text-white/50 uppercase mb-1">
                    Student
                  </p>
                  <h3
                    className="font-extrabold text-white leading-[1.05] mb-5"
                    style={{
                      fontSize: "clamp(2.4rem, 5vw, 3rem)",
                      fontStyle: "italic",
                    }}
                  >
                    Student
                    <br />
                    <span style={{ fontStyle: "normal" }}>Success</span>
                  </h3>
                  <p className="text-[12px] text-white/50 leading-relaxed max-w-[220px]">
                    I went from struggling freelancer to running a ৳10k/mo agency in
                    less than a year thanks to the systems here.
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Floating Testimonial */}
            <motion.div
              className="absolute -bottom-4 -left-4 md:-left-10 bg-white rounded-2xl shadow-xl p-5 w-[240px] md:w-[270px] border border-gray-100"
              initial={{ opacity: 0, y: 24, x: -10 }}
              animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
              transition={{
                delay: 0.8,
                duration: 0.65,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
            >
              <div className="text-[32px] text-green-200 font-serif leading-none mb-1 select-none">
                "
              </div>
              <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
                I went from struggling freelancer to running a ৳10k/mo agency in
                less than a year thanks to the systems here.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#0052CC] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                  MJ
                </div>
                <p className="text-[13px] font-bold text-[#0052CC]">
                  — Marcus J., UI Architect
                </p>
              </div>
            </motion.div>

            {/* Floating Stat Badge */}
            <motion.div
              className="absolute -top-3 -right-3 bg-[#0052CC] text-white rounded-xl px-3 py-2 shadow-lg text-center"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                delay: 1,
                duration: 0.4,
                type: "spring",
                stiffness: 220,
              }}
            >
              <p className="text-[10px] font-semibold text-white/70 leading-none mb-0.5">
                Avg. Income Jump
              </p>
              <p className="text-base font-extrabold leading-none">+৳6,650</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ArchitectureProgress;