"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  BookOpen,
  ShoppingBag,
  BarChart2,
  Lock,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
} from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { useGetStatsQuery } from "@/lib/api/statsApi";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// ─── Data ─────────────────────────────────────────────────────────────────────

const navLinks = [
  { label: "Home", href: "/", Icon: Home },
  { label: "Courses", href: "/courses", Icon: BookOpen },
  { label: "Shop", href: "/shop", Icon: ShoppingBag },
  { label: "Stats", href: "/stats", Icon: BarChart2 },
];

const socials = [
  { label: "Twitter/X", Icon: Twitter, href: "https://twitter.com" },
  { label: "Instagram", Icon: Instagram, href: "https://instagram.com" },
  { label: "LinkedIn", Icon: Linkedin, href: "https://linkedin.com" },
  { label: "YouTube", Icon: Youtube, href: "https://youtube.com" },
  { label: "Email", Icon: Mail, href: "mailto:hello@incomearchitect.com" },
];

// Helper to parse a value string like "$12.4M+" or "50,000+" into a clean number
function parseNumber(val: string) {
  return parseFloat(val.replace(/[^0-9.-]+/g, "")) || 0;
}

// ─── Component ────────────────────────────────────────────────────────────────

function Footer() {
  const pathname = usePathname();
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/student") ||
    pathname?.startsWith("/affiliate/dashboard")
  )
    return null;

  const { data: statsData } = useGetStatsQuery();

  // Extract real values from API
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

  const avgRating = statsData
    ? parseFloat(
        statsData.kpis.find((k) => k.label === "Avg. Rating")?.value || "4.9",
      )
    : 4.9;

  const revenueDisplay =
    rawRevenue > 1000000
      ? `$${(rawRevenue / 1000000).toFixed(1)}M+`
      : `$${Math.floor(rawRevenue).toLocaleString()}+`;

  const stats = [
    { label: "Total distributed", value: revenueDisplay },
    {
      label: "Active students",
      value: `${(totalStudents || 50000).toLocaleString()}+`,
    },
    {
      label: "Courses available",
      value: `${(totalCourses || 120).toLocaleString()}+`,
    },
    {
      label: "Avg. student rating",
      value: `${avgRating.toFixed(1)} / 5.0`,
    },
  ];

  return (
    <footer
      className={`${plusJakarta.className} bg-[#DFE2FF] border-t border-indigo-200/40 pb-[80px] lg:pb-0`}
    >
      {/* ── Top Grid ── */}
      <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-5 sm:px-8 py-8 sm:py-10 border-b border-indigo-200/30">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {/* ── Logo ── */}
            <Link href="/" className="flex-shrink-0 lg:w-48">
              <img
                src="/maruf.png"
                alt="Maruf Tech"
                className="h-[50px] w-[300px] -ml-14 md:-ml-8 object-contain"
              />
            </Link>
          </div>
          <p className="text-[10px] font-bold tracking-[.06em] text-indigo-500 mb-2.5">
            PRECISION PROSPERITY
          </p>
          <p className="text-[12.5px] text-gray-500 leading-relaxed max-w-[210px]">
            Build sustainable income streams with proven frameworks and
            expert-led courses trusted by 50,000+ creators.
          </p>
        </div>

        {/* Navigate */}
        <div>
          <p className="text-[10px] font-extrabold tracking-[.1em] text-indigo-500 uppercase mb-3">
            Navigate
          </p>
          <ul className="space-y-2">
            {navLinks.map(({ label, href, Icon }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="flex items-center gap-2 text-[13px] font-medium text-gray-600 hover:text-indigo-600 transition-colors group"
                >
                  <Icon className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Stats */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="inline-flex items-center gap-1.5 bg-indigo-100/60 border border-indigo-200/40 rounded-full px-3 py-1 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_0_3px_rgba(34,197,94,.2)] animate-pulse" />
            <span className="text-[10px] font-bold tracking-[.04em] text-indigo-700">
              Platform Live
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-2">
            {stats.map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between bg-white/45 border border-white/60 rounded-xl px-3 py-2"
              >
                <span className="text-[11px] text-gray-500 font-medium truncate mr-2">
                  {label}
                </span>
                <span className="text-[12.5px] font-extrabold text-indigo-950 shrink-0">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="max-w-[1400px] mx-auto w-full px-5 sm:px-8 py-4 border-t border-indigo-200/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11.5px] text-gray-500 font-medium">
            © {new Date().getFullYear()} All rights reserved.
            <strong className="text-gray-700 font-bold">
              {" "}
              <a
                href="https://www.jevxo.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11.5px] text-gray-500 font-medium hover:text-indigo-600 transition-colors duration-200"
              >
                Developed by{" "}
                <span className="font-bold text-gray-700 hover:text-indigo-600">
                  Jevxo
                </span>
              </a>
            </strong>
          </p>

          {/* Trust badges */}
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
            <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
              <Lock className="w-2.5 h-2.5 text-green-600" />
            </div>
            SSL Secured
            <span className="w-1 h-1 rounded-full bg-gray-300 mx-0.5" />
            GDPR Compliant
            <span className="w-1 h-1 rounded-full bg-gray-300 mx-0.5" />
            256-bit Encryption
          </div>

          {/* Socials */}
          <div className="flex items-center gap-2">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/50 border border-indigo-200/30 flex items-center justify-center text-indigo-600 hover:bg-white hover:-translate-y-0.5 transition-all duration-200"
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
