"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  GraduationCap,
  SquarePen,
  RefreshCw,
  Wallet,
  Sparkles,
} from "lucide-react";

// ── data ─────────────────────────────────────────────────────────────────────
const steps = [
  {
    id: 1,
    title: "Learn",
    icon: GraduationCap,
    color: "#0052CC",
    ringColor: "rgba(0,82,204,0.12)",
    description:
      "Master high-income skills through curated, professional architected curriculum.",
  },
  {
    id: 2,
    title: "Create",
    icon: SquarePen,
    color: "#006E2A",
    ringColor: "rgba(0,110,42,0.12)",
    description:
      "Build your portfolio and real-world assets while you learn from industry titans.",
  },
  {
    id: 3,
    title: "Earn",
    icon: RefreshCw,
    color: "#705D00",
    ringColor: "rgba(112,93,0,0.12)",
    description:
      "Deploy your skills into the market and watch your income architecture flourish.",
  },
  {
    id: 4,
    title: "Withdraw",
    icon: Wallet,
    color: "#7C3AED",
    ringColor: "rgba(124,58,237,0.12)",
    description:
      "Cash out your earnings instantly with flexible withdrawal options to your account.",
  },
];

// ── connector line between steps ─────────────────────────────────────────────
function ConnectorLine({ color, delay }: { color: string; delay: number }) {
  return (
    <div className="hidden md:flex items-center justify-center flex-1 px-2 mt-[-3.5rem]">
      <div className="relative w-full h-[2px] bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: "0%" }}
          whileInView={{ width: "100%" }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* dashed overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 6px, white 6px, white 10px)",
          }}
        />
      </div>
    </div>
  );
}

// ── step card ─────────────────────────────────────────────────────────────────
function StepCard({
  step,
  index,
  isInView,
}: {
  step: (typeof steps)[0];
  index: number;
  isInView: boolean;
}) {
  const Icon = step.icon;

  return (
    <motion.div
      className="group flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 36 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.65,
        delay: index * 0.18,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* ── icon with layered rings ── */}
      <div className="relative mb-8">
        {/* outermost soft ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: step.ringColor }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={isInView ? { scale: 1.65, opacity: 1 } : {}}
          transition={{
            delay: index * 0.18 + 0.2,
            duration: 0.55,
            ease: "easeOut",
          }}
        />

        {/* mid ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: step.ringColor }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={isInView ? { scale: 1.3, opacity: 1 } : {}}
          transition={{
            delay: index * 0.18 + 0.28,
            duration: 0.5,
            ease: "easeOut",
          }}
        />

        {/* icon circle */}
        <motion.div
          className="relative z-10 w-[72px] h-[72px] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
          style={{
            backgroundColor: step.color,
            boxShadow: `0 8px 24px ${step.color}55`,
          }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{
            delay: index * 0.18 + 0.1,
            duration: 0.5,
            type: "spring",
            stiffness: 220,
            damping: 18,
          }}
        >
          <Icon className="w-8 h-8 text-white" strokeWidth={1.8} />
        </motion.div>

        {/* step number badge */}
        <motion.div
          className="absolute -top-1 -right-1 z-20 w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center text-[9px] font-black shadow-sm"
          style={{ color: step.color, borderColor: step.color }}
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{
            delay: index * 0.18 + 0.45,
            duration: 0.35,
            type: "spring",
          }}
        >
          {step.id}
        </motion.div>
      </div>

      {/* title */}
      <motion.h3
        className="text-xl font-extrabold text-gray-900 mb-3 tracking-tight"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: index * 0.18 + 0.35, duration: 0.4 }}
      >
        {step.title}
      </motion.h3>

      {/* description */}
      <motion.p
        className="text-base md:text-[17px] text-gray-500 leading-[1.75] max-w-[260px] font-medium"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: index * 0.18 + 0.45, duration: 0.4 }}
      >
        {step.description}
      </motion.p>

      {/* hover cta */}
      <motion.span
        className="mt-5 text-sm font-semibold inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0"
        style={{ color: step.color }}
      >
        Get started
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.span>
    </motion.div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────
const PrecisionWorkflow = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-10 md:py-15 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #f8f9ff 0%, #f0f1ff 40%, #eef0ff 100%)",
        fontFamily: "var(--font-manrope)",
      }}
    >
      {/* subtle bg texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
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
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ── header ── */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* eyebrow badge */}
          <motion.div
            className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full mb-5"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{
              delay: 0.1,
              duration: 0.45,
              type: "spring",
              stiffness: 200,
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-bold text-blue-700 tracking-widest uppercase">
              Precision Workflow
            </span>
          </motion.div>

          {/* heading */}
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Precision <span className="text-[#0052CC]">Workflow</span>
          </h2>

          {/* underline bar */}
          <motion.div
            className="h-[3px] bg-[#0052CC] rounded-full mx-auto mt-4"
            initial={{ width: 0 }}
            animate={isInView ? { width: 56 } : {}}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>

        {/* ── steps + connectors ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-4 relative">
          {/* connector line behind all cards (desktop only) */}
          <div className="hidden md:block absolute top-[36px] left-[12%] right-[12%] h-[2px] z-0">
            <div className="w-full h-full bg-gray-200 rounded-full">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#0052CC] via-[#006E2A] via-[#705D00] to-[#7C3AED]"
                initial={{ width: "0%" }}
                animate={isInView ? { width: "100%" } : {}}
                transition={{
                  delay: 0.5,
                  duration: 1.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </div>
          </div>

          {steps.map((step, idx) => (
            <div key={step.id} className="relative z-10">
              <StepCard step={step} index={idx} isInView={isInView} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PrecisionWorkflow;
