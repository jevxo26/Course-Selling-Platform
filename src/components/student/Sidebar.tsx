"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  HandCoins,
  Package,
  Wallet,
  CreditCard,
  Users,
  LogOut,
  X,
  UserRound,
  ChevronRight,
  ShoppingBag,
  Home,
} from "lucide-react";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { HiOutlineUsers } from "react-icons/hi2";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { TbLayoutGridAdd } from "react-icons/tb";
import Image from "next/image";
import { useLogoutMutation } from "@/lib/api/authApi";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { baseApi } from "@/lib/api/baseApi";
import { toast } from "sonner";
import type { RootState } from "@/store";
import { useState } from "react";

const navGroups = [
  {
    label: "Overview",
    icon: MdOutlineSpaceDashboard,
    items: [
      { label: "Dashboard", href: "/student", icon: LayoutDashboard },
      { label: "Profile", href: "/student/profile", icon: UserRound },
    ],
  },
  {
    label: "Learning",
    icon: GraduationCap,
    items: [
      { label: "My Courses", href: "/student/courses", icon: GraduationCap },
      { label: "Products", href: "/student/products", icon: Package },
      { label: "My Shops", href: "/student/my-shops", icon: ShoppingBag },
    ],
  },
  {
    label: "Finance",
    icon: RiMoneyDollarCircleLine,
    items: [
      { label: "Wallet", href: "/student/wallet", icon: Wallet },
      {
        label: "Payment Methods",
        href: "/student/payment-methods",
        icon: CreditCard,
      },
      { label: "Withdraw", href: "/student/withdraw", icon: HandCoins },
    ],
  },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  const displayName =
    String(
      authUser?.name ?? authUser?.fullName ?? authUser?.username ?? "",
    ).trim() || "Student";
  const email = String(authUser?.email ?? "").trim();

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
      window.location.href = "/";
    }
  };

  return (
    <aside
      className="
        relative z-50 flex h-full w-[220px] flex-col
        border-r border-slate-200 bg-white shadow-sm
      "
    >
      {/* Subtle top blue tint */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[180px] bg-[radial-gradient(ellipse_at_50%_-10%,rgba(79,142,247,0.06)_0%,transparent_70%)]" />

      {/* Close button — mobile only */}
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

      {/* ─── PROFILE CARD (VERTICAL LAYOUT) ─── */}
      <div className="px-3 md:mt-5 pb-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col items-center text-center gap-3">
            {/* Avatar – centered on top */}
            <div className="relative flex-shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#4f8ef7] via-[#7b5cfa] to-[#34d399] p-[2px]">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    width={64}
                    height={64}
                    className="h-full w-full rounded-full bg-white object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                    <span className="text-xl font-bold text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {/* Online Status */}
              <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
            </div>

            {/* Name, Role, Email stacked below */}
            <div className="space-y-0.5 w-full min-w-0">
              <h3 className="truncate text-[13px] font-semibold text-slate-800">
                {displayName}
              </h3>
              <p className="truncate text-[10px] font-medium capitalize text-[#4f8ef7]">
                {String(authUser?.role ?? "Student")
                  .replace(/_/g, " ")
                  .toLowerCase()}
              </p>
              <p className="truncate text-[10px] text-slate-400">
                {email || "student@panel.io"}
              </p>
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
                  size={11}
                  className="flex-shrink-0 text-[#4f8ef7]"
                  strokeWidth={2.5}
                />
                <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-black">
                  {group.label}
                </span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              {/* Items */}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/student"
                      ? pathname === item.href
                      : pathname === item.href ||
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
                        ${
                          isActive
                            ? "bg-blue-50 text-slate-800"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        }
                      `}
                    >
                      {/* Active left bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-[60%] w-[3px] -translate-y-1/2 rounded-r-[3px] bg-[#4f8ef7] shadow-[0_0_8px_rgba(79,142,247,0.4)]" />
                      )}

                      {/* Icon wrapper */}
                      <span
                        className={`
                          flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-lg
                          transition-all duration-[180ms]
                          ${
                            isActive
                              ? "bg-blue-100 text-[#4f8ef7]"
                              : "bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#4f8ef7]"
                          }
                        `}
                      >
                        <Icon size={14} />
                      </span>

                      {/* Label */}
                      <span
                        className={`text-[12px] leading-none ${isActive ? "font-semibold" : "font-medium"}`}
                      >
                        {item.label}
                      </span>

                      {/* Chevron */}
                      <ChevronRight
                        size={11}
                        className={`
                          ml-auto text-[#4f8ef7] transition-all duration-[180ms]
                          ${
                            isActive || hoveredHref === item.href
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
          <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-lg bg-red-50 transition-all duration-[180ms] group-hover:bg-red-100">
            <LogOut size={13} />
          </span>
          <span className="text-[12px] font-semibold">
            {isLoggingOut ? "Signing out…" : "Sign Out"}
          </span>
        </button>

        {/* Footer */}
        <p className="mt-3.5 text-center text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-300">
          Student Panel · v2.0
        </p>
      </div>
    </aside>
  );
}
