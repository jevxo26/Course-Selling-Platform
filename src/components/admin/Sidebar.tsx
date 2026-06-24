"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Layers,
  GraduationCap,
  Wallet,
  Banknote,
  ClipboardList,
  CreditCard,
  ShoppingBag,
  BarChart,
  LogOut,
  X,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  UserCircle,
  PieChart,
  BookOpen,
  Settings,
  Home,
} from "lucide-react";
import { LiaCloudShowersHeavySolid } from "react-icons/lia";
import { useLogoutMutation } from "@/lib/api/authApi";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { baseApi } from "@/lib/api/baseApi";
import { toast } from "sonner";
import type { RootState } from "@/store";

const navGroups = [
  {
    label: "Overview",
    icon: PieChart,
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Settings", href: "/admin/settings", icon: Settings },
      { label: "Enrollments", href: "/admin/enrollments", icon: ClipboardList },
    ],
  },
  {
    label: "People",
    icon: Users,
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Instructors", href: "/admin/instructor", icon: GraduationCap },
    ],
  },
  {
    label: "Finance",
    icon: Wallet,
    items: [
      { label: "Wallet", href: "/admin/wallet", icon: Wallet },
      {
        label: "Payment Methods",
        href: "/admin/paymentMethods",
        icon: CreditCard,
      },
      { label: "Withdrawals", href: "/admin/withdraw", icon: Banknote },
    ],
  },
  {
    label: "Content",
    icon: BookOpen,
    items: [
      { label: "Products", href: "/admin/products", icon: ShoppingBag },
      { label: "Shop", href: "/admin/shop", icon: ShoppingBag },
      { label: "Category", href: "/admin/category", icon: Layers },
      {
        label: "Courses",
        href: "/admin/courses",
        icon: LiaCloudShowersHeavySolid,
      },
      { label: "Percentage", href: "/admin/percentage", icon: BarChart },
    ],
  },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  const authUser = useSelector((state: RootState) => state.auth.user);

  const displayName =
    String(
      authUser?.name ?? authUser?.fullName ?? authUser?.username ?? "",
    ).trim() || "Admin";
  const email = String(authUser?.email ?? "").trim();
  const country = String(authUser?.country ?? "").trim();

  const avatarUrlRaw =
    authUser?.photo ??
    authUser?.avatar ??
    authUser?.image ??
    authUser?.profileImage ??
    null;
  const avatarUrl =
    typeof avatarUrlRaw === "string" && avatarUrlRaw.trim().length > 0
      ? avatarUrlRaw.trim()
      : null;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    const toastId = toast.loading("Signing out...");
    try {
      await logoutApi().unwrap();
    } catch {
    } finally {
      dispatch(logout());
      dispatch(baseApi.util.resetApiState());
      toast.success("Signed out", { id: toastId });
      onClose?.();
      router.replace("/");
    }
  };

  return (
    <aside
      className="
        relative z-50 flex h-full w-[220px] flex-col
        border-r border-slate-200 bg-white dark:bg-white dark:border-slate-200 shadow-sm
      "
    >
      {/* Subtle top blue tint */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[180px] bg-[radial-gradient(ellipse_at_50%_-10%,rgba(79,142,247,0.08)_0%,transparent_70%)]" />

      {/* Close button – mobile only */}
      {onClose && (
        <div className="mb-2 flex justify-end px-3 pt-4 lg:hidden">
          <button
            onClick={onClose}
            className="flex cursor-pointer items-center justify-center rounded-lg border-none bg-slate-100 p-1.5 text-slate-400 transition-all duration-200 hover:bg-slate-200 hover:text-slate-600"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ─── PROFILE CARD (VERTICAL) ─── */}
      <div className="px-3 pb-4 md:mt-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-200 dark:bg-white">
          <div className="flex flex-col items-center text-center gap-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#4f8ef7] via-[#7b5cfa] to-[#34d399] p-[2px]">
                <img
                  src={avatarUrl || "https://i.ibb.co.com/pjRGYLkQ/image.png"}
                  alt={displayName}
                  className="h-full w-full rounded-full bg-white object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://i.ibb.co.com/pjRGYLkQ/image.png";
                  }}
                />
              </div>
              {/* Online Status */}
              <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
            </div>

            {/* Name, Role, Email */}
            <div className="space-y-0.5 w-full min-w-0">
              <h3 className="truncate text-[13px] font-semibold text-slate-800">
                {displayName}
              </h3>
              <p className="truncate text-[10px] font-medium capitalize text-[#4f8ef7]">
                {String(authUser?.role ?? "Administrator")
                  .replace(/_/g, " ")
                  .toLowerCase()}
              </p>
              <p className="truncate text-[10px] text-slate-400">
                {email || "admin@panel.io"}
              </p>
              {country && (
                <p className="truncate text-[10px] text-slate-400">{country}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Navigation */}
      <nav
        className="flex-1 overflow-y-auto px-3
          [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.08)_transparent]
          [&::-webkit-scrollbar]:w-[3px]
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-slate-200
        "
      >
        {navGroups.map((group) => {
          const GroupIcon = group.icon;
          return (
            <div key={group.label}>
              {/* Group label with icon */}
              <div className="mb-1 mt-[18px] flex items-center gap-1.5 px-2.5">
                <GroupIcon
                  size={12}
                  className="flex-shrink-0 text-[#4f8ef7]"
                  strokeWidth={2.5}
                />
                <span className="text-[9px] font-bold uppercase tracking-[0.12em] bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                  {group.label}
                </span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              {/* Items */}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname?.startsWith(item.href + "/");
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      onMouseEnter={() => setHoveredHref(item.href)}
                      onMouseLeave={() => setHoveredHref(null)}
                      className={`
                        group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 no-underline
                        transition-all duration-[180ms] ease-[cubic-bezier(.4,0,.2,1)]
                        ${isActive
                          ? "bg-blue-50 text-slate-800 shadow-sm"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        }
                      `}
                    >
                      {/* Active left bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-[60%] w-[3px] -translate-y-1/2 rounded-r-[3px] bg-[#4f8ef7] shadow-[0_0_10px_rgba(79,142,247,0.5)]" />
                      )}

                      {/* Icon wrapper */}
                      <span
                        className={`
                          flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-lg
                          transition-all duration-[180ms]
                          ${isActive
                            ? "bg-blue-100 text-[#4f8ef7] scale-105"
                            : "bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#4f8ef7] group-hover:scale-105"
                          }
                        `}
                      >
                        <Icon size={14} />
                      </span>

                      {/* Label */}
                      <span
                        className={`text-[12px] leading-none ${isActive ? "font-semibold" : "font-medium"
                          }`}
                      >
                        {item.label}
                      </span>

                      {/* Chevron */}
                      <ChevronRight
                        size={11}
                        className={`
                          ml-auto text-[#4f8ef7] transition-all duration-[180ms]
                          ${isActive || hoveredHref === item.href
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-1 opacity-0"
                          }
                        `}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom section (always visible) */}
      <div className="flex-shrink-0 px-3 pb-4 pt-1">
        {/* Divider */}
        <div className="mb-4 h-px bg-slate-100" />

        {/* Back to Home */}
        <Link
          href="/"
          className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl border-none bg-transparent px-2.5 py-2 text-slate-500 transition-all duration-[180ms] hover:bg-slate-100 hover:text-slate-700 mb-1"
        >
          <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 transition-all duration-[180ms] group-hover:bg-slate-200">
            <Home size={13} />
          </span>
          <span className="text-[12px] font-semibold">Back to Home</span>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`
            group flex w-full cursor-pointer items-center gap-2.5 rounded-xl border-none
            bg-transparent px-2.5 py-2.5 text-red-400
            transition-all duration-[180ms] hover:bg-red-50 hover:text-red-500
            ${isLoggingOut ? "opacity-60" : "opacity-100"}
          `}
        >
          <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-lg bg-red-50 transition-all duration-[180ms] group-hover:bg-red-100 group-hover:scale-105">
            <LogOut size={13} />
          </span>
          <span className="text-[12px] font-semibold">
            {isLoggingOut ? "Signing out…" : "Sign Out"}
          </span>
        </button>

        {/* Footer */}
        <p className="mt-3.5 text-center text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-300">
          Admin Panel · v2.0
        </p>
      </div>
    </aside>
  );
}
