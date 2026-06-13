"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── animation helpers ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: {
    duration: 0.6,
    delay,
    ease: [0.22, 1, 0.36, 1] as const,
  },
});

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true },
};

const cardVariant = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  transition: {
    duration: 0.55,
    ease: [0.22, 1, 0.36, 1] as const,
  },
};

/* ── data ── */
const stats = [
  { value: "40%", label: "Commission Rate" },
  { value: "12K+", label: "Active Affiliates" },
  { value: "$500K+", label: "Total Paid Out" },
  { value: "90 Days", label: "Cookie Window" },
];

const steps = [
  {
    num: "01",
    title: "Sign up free",
    desc: "Create your affiliate account in minutes. Get your unique referral link instantly — no approval needed.",
  },
  {
    num: "02",
    title: "Share your link",
    desc: "Promote on YouTube, your blog, social media, or email. We provide banners and copy to help you convert.",
  },
  {
    num: "03",
    title: "Earn commissions",
    desc: "Earn up to 40% on every purchase. Get paid monthly via ZiniPay, Nagad, or bank transfer.",
  },
];

const tiers = [
  {
    name: "Starter",
    pct: "20%",
    range: "0–10 sales/month",
    perks: [
      "Basic analytics dashboard",
      "Email support",
      "Marketing kit access",
    ],
    featured: false,
  },
  {
    name: "Growth",
    pct: "30%",
    range: "11–50 sales/month",
    perks: [
      "Advanced analytics",
      "Priority support",
      "Bonus resources",
      "Custom landing page",
    ],
    featured: true,
  },
  {
    name: "Pro Partner",
    pct: "40%",
    range: "50+ sales/month",
    perks: [
      "Full dashboard suite",
      "Dedicated account manager",
      "Recurring income",
      "Co-marketing deals",
    ],
    featured: false,
  },
];

const testimonials = [
  {
    initials: "RS",
    name: "Rafiq Sarker",
    role: "YouTuber · Dhaka",
    quote:
      "Made my first $500 in the second month. The dashboard makes tracking so easy.",
    earning: "$1.2K/mo",
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    initials: "NA",
    name: "Nadia Akter",
    role: "Blogger · Chittagong",
    quote:
      "The 90-day cookie window is a game changer. My passive income has tripled since joining.",
    earning: "$850/mo",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    initials: "MH",
    name: "Mamun Hossain",
    role: "Content Creator · Sylhet",
    quote:
      "Payouts are always on time. Best affiliate program I have ever worked with.",
    earning: "$2K/mo",
    color: "bg-purple-50 text-purple-600 border-purple-100",
  },
];

const faqs = [
  {
    q: "Is there a minimum payout threshold?",
    a: "Yes, the minimum payout is $10. Once you reach that, payments are processed on the 5th of each month.",
  },
  {
    q: "Can I promote on any platform?",
    a: "Absolutely. YouTube, Facebook, Instagram, blogs, email newsletters — anywhere online works as long as you follow our terms.",
  },
  {
    q: "How long does approval take?",
    a: "There is no approval process. Sign up and you get your affiliate link instantly.",
  },
  {
    q: "What if a buyer requests a refund?",
    a: "Commissions on refunds within 7 days are reversed. After 7 days the sale is final and your commission is locked.",
  },
];

/* ─────────────────────────────────────── */
export default function AffiliatePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#f5f6fa] font-sans text-slate-900 pb-20">
      {/* ══ HERO ══ */}
      <section className="bg-white border-b border-slate-100 overflow-hidden relative">
        <div className="pointer-events-none absolute top-0 right-0 w-[480px] h-[480px] bg-blue-500/6 rounded-full blur-[90px] -translate-y-1/2 translate-x-1/3" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-100/40 rounded-full blur-[70px] translate-y-1/2 -translate-x-1/4" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center relative z-10">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/70 rounded-full px-3 py-1.5 text-[0.65rem] font-bold text-blue-700 tracking-widest uppercase mb-5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Affiliate Program
            </motion.div>

            <h1 className="text-[2.4rem] sm:text-[2.6rem] lg:text-[3rem] font-black leading-[1.1] tracking-tight mb-5">
              Earn while you
              <br />
              <span className="text-blue-600">teach others</span> to grow
            </h1>

            <p className="text-[0.88rem] text-slate-500 leading-relaxed mb-7 max-w-[440px]">
              Share our premium courses and earn up to 40% commission on every
              sale — with real-time tracking, 90-day cookies, and monthly
              payouts.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/20 active:scale-[0.97]">
                Join for free
              </button>
              <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 px-6 py-3 rounded-xl text-sm font-semibold transition-all">
                See how it works →
              </button>
            </div>

            {/* Social proof strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-7 flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {["#c7d7f5", "#fce7f3", "#d1fae5", "#fef3c7"].map((bg, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-white"
                    style={{ background: bg }}
                  />
                ))}
              </div>
              <p className="text-[0.72rem] text-slate-500">
                <span className="font-bold text-slate-800">12,000+</span> active
                affiliates earning monthly
              </p>
            </motion.div>
          </motion.div>

          {/* Right — Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, x: 32, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            className="relative"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-[0_12px_48px_rgba(0,0,0,0.08)]">
              <p className="text-[0.78rem] font-bold text-slate-700 mb-4">
                Your Affiliate Dashboard
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-4">
                {[
                  { val: "$2,840", lbl: "This month" },
                  { val: "142", lbl: "Referrals" },
                  { val: "30%", lbl: "Commission" },
                  { val: "89%", lbl: "Conversion" },
                ].map(({ val, lbl }) => (
                  <div
                    key={lbl}
                    className="bg-[#f7f8fc] border border-slate-100 rounded-xl p-3.5"
                  >
                    <p className="text-[1.4rem] font-black text-blue-600 tracking-tight leading-none">
                      {val}
                    </p>
                    <p className="text-[0.65rem] font-semibold text-slate-400 mt-1">
                      {lbl}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-0 border-t border-slate-100 pt-3">
                {[
                  { label: "Last payout", val: "$1,920.00" },
                  { label: "Pending", val: "$920.00" },
                ].map(({ label, val }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0"
                  >
                    <span className="text-[0.72rem] font-medium text-slate-400">
                      {label}
                    </span>
                    <span className="text-[0.78rem] font-bold text-emerald-600">
                      {val}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[0.65rem] font-bold px-3 py-1.5 rounded-full">
                ↑ +18.2% vs last month
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="absolute -bottom-3 -left-3 bg-blue-600 text-white text-[0.65rem] font-bold rounded-xl px-3 py-2 shadow-lg"
            >
              🔥 47 joined today
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══ STATS STRIP ══ */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-100">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              {...fadeUp(i * 0.08)}
              className="p-7 sm:p-9 text-center hover:bg-slate-50 transition-colors"
            >
              <p className="text-[2rem] sm:text-[2.4rem] font-black text-blue-600 tracking-tight leading-none mb-1.5">
                {s.value}
              </p>
              <p className="text-[0.72rem] font-semibold text-slate-400">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ══ HOW IT WORKS ══ */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp()} className="mb-10">
          <div className="inline-flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-widest text-blue-600 mb-2.5">
            <div className="w-4 h-px bg-blue-600 rounded-full" /> How it works
          </div>
          <h2 className="text-[1.7rem] sm:text-[2.1rem] font-black tracking-tight mb-3">
            Three steps to your first payout
          </h2>
          <p className="text-[0.85rem] text-slate-500 max-w-md leading-relaxed">
            No lengthy onboarding. No approval queues. Just sign up and start
            earning today.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-1 bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden"
        >
          {steps.map((s) => (
            <motion.div
              key={s.num}
              variants={cardVariant}
              whileHover={{ backgroundColor: "#f8faff" }}
              className="bg-white p-7 sm:p-9 group transition-colors"
            >
              <p className="text-[3rem] font-black text-slate-100 group-hover:text-blue-50 tracking-tighter leading-none mb-5 transition-colors">
                {s.num}
              </p>
              <h3 className="text-[0.95rem] font-bold mb-2">{s.title}</h3>
              <p className="text-[0.78rem] text-slate-500 leading-relaxed">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══ TIERS ══ */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-widest text-blue-600 mb-2.5">
              <div className="w-4 h-px bg-blue-600 rounded-full" /> Commission
              Tiers
            </div>
            <h2 className="text-[1.7rem] sm:text-[2.1rem] font-black tracking-tight mb-3">
              The more you sell, the more you keep
            </h2>
            <p className="text-[0.82rem] text-slate-500 max-w-md mx-auto leading-relaxed">
              Tiers upgrade automatically as your monthly sales grow.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6 items-center"
          >
            {tiers.map((t) => (
              <motion.div
                key={t.name}
                variants={cardVariant}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`relative bg-white rounded-2xl p-7 sm:p-8 transition-shadow duration-300 ${
                  t.featured
                    ? "border-2 border-blue-600 shadow-[0_12px_40px_rgba(37,99,235,0.12)] z-10"
                    : "border border-slate-200 shadow-sm hover:shadow-md"
                }`}
              >
                {t.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[0.58rem] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                    Most Popular
                  </div>
                )}

                <p className="text-[2.8rem] sm:text-[3.2rem] font-black text-blue-600 tracking-tight leading-none mb-1">
                  {t.pct}
                </p>
                <p className="text-[0.68rem] font-semibold text-slate-400 mb-5">
                  {t.range}
                </p>

                <h3 className="text-[0.95rem] font-bold pb-5 border-b border-slate-100 mb-5">
                  {t.name}
                </h3>

                <ul className="space-y-3 mb-7">
                  {t.perks.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2.5 text-[0.78rem] text-slate-600 font-medium"
                    >
                      <div className="bg-emerald-100 text-emerald-600 rounded-full p-0.5 mt-0.5 shrink-0">
                        <Check size={11} strokeWidth={3} />
                      </div>
                      {p}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-xl text-[0.8rem] font-bold transition-all active:scale-[0.97] ${
                    t.featured
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                      : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {t.featured ? "Get started now" : "Join this tier"}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp()} className="mb-10">
          <div className="inline-flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-widest text-blue-600 mb-2.5">
            <div className="w-4 h-px bg-blue-600 rounded-full" /> Partner
            Stories
          </div>
          <h2 className="text-[1.7rem] sm:text-[2.1rem] font-black tracking-tight">
            Real affiliates, real results
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-5"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={cardVariant}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
              <div className="inline-block bg-emerald-50 text-emerald-700 text-[0.65rem] font-bold px-2.5 py-1 rounded-full mb-4 self-start">
                Earning {t.earning}
              </div>
              <p className="text-[0.8rem] text-slate-600 leading-relaxed italic flex-1 mb-5">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div
                  className={`w-9 h-9 rounded-full border flex items-center justify-center text-[0.62rem] font-black shrink-0 ${t.color}`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-[0.78rem] font-bold text-slate-900">
                    {t.name}
                  </p>
                  <p className="text-[0.65rem] font-medium text-slate-400 mt-0.5">
                    {t.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="py-16 max-w-[720px] mx-auto px-4 sm:px-6">
        <motion.div {...fadeUp()} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-widest text-blue-600 mb-2.5">
            <div className="w-4 h-px bg-blue-600 rounded-full" /> FAQ
          </div>
          <h2 className="text-[1.7rem] sm:text-[2.1rem] font-black tracking-tight">
            Common questions
          </h2>
        </motion.div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map((f, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between py-4 text-left group"
                >
                  <span
                    className={`text-[0.85rem] font-bold transition-colors ${isOpen ? "text-blue-600" : "text-slate-900 group-hover:text-blue-600"}`}
                  >
                    {f.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ml-4 transition-all duration-300 ${
                      isOpen
                        ? "bg-blue-50 border-blue-200 text-blue-600 rotate-180"
                        : "bg-white border-slate-200 text-slate-400 group-hover:border-blue-200 group-hover:text-blue-600"
                    }`}
                  >
                    <ChevronDown size={14} strokeWidth={3} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.22, 1, 0.36, 1] as const,
                      }}
                      className="overflow-hidden"
                    >
                      <p className="text-[0.78rem] text-slate-500 leading-relaxed pb-5 pr-10">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
