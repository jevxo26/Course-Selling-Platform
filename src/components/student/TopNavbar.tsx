"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, Menu, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { baseApi } from "@/lib/api/baseApi";
import { useLogoutMutation } from "@/lib/api/authApi";
import { toast } from "sonner";
import type { RootState } from "@/store";

const PAGE_META: Record<string, { title: string }> = {
  student: { title: "Dashboard" },
  dashboard: { title: "Profile" },
  courses: { title: "My Courses" },
  products: { title: "Products" },
  wallet: { title: "Wallet" },
  "payment-methods": { title: "Payment Methods" },
  withdraw: { title: "Withdraw" },
  affiliate: { title: "Affiliate" },
};

export default function TopNavbar({
  onMenuClick,
}: {
  onMenuClick?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const authUser = useSelector((state: RootState) => state.auth.user);
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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getPageMeta = () => {
    if (!pathname) return { title: "Dashboard" };
    const parts = pathname.split("/").filter(Boolean);
    const lastPart = parts[parts.length - 1];
    return (
      PAGE_META[lastPart] ?? {
        title:
          lastPart.charAt(0).toUpperCase() +
          lastPart.slice(1).replace(/-/g, " "),
      }
    );
  };

  const getBreadcrumbs = () => {
    if (!pathname) return [];
    return pathname
      .split("/")
      .filter(Boolean)
      .map(
        (p) =>
          PAGE_META[p]?.title ??
          p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " "),
      );
  };

  const { title } = getPageMeta();
  const breadcrumbs = getBreadcrumbs();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setDropdownOpen(false);
    const toastId = toast.loading("Signing out...");
    try {
      await logoutApi().unwrap();
    } catch {
      // ignore API errors
    } finally {
      dispatch(logout());
      dispatch(baseApi.util.resetApiState());
      toast.success("Signed out", { id: toastId });
      router.replace("/");
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md px-3 sm:px-5">
      {/* ── Left ── */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors flex-shrink-0"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>

        {/* Page title */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex flex-col justify-center min-w-0">
            <h1 className="text-[14px] font-bold text-slate-800 leading-tight truncate">
              {title}
            </h1>

            {breadcrumbs.length > 1 && (
              <div className="hidden sm:flex items-center gap-1">
                {breadcrumbs.map((crumb, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && (
                      <span className="text-[10px] text-slate-300">/</span>
                    )}
                    <span
                      className={`text-[10px] ${
                        i === breadcrumbs.length - 1
                          ? "text-[#4f8ef7] font-semibold"
                          : "text-slate-400"
                      }`}
                    >
                      {crumb}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Notification Bell */}
        <button className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
          <Bell className="w-[18px] h-[18px] text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-50 transition-colors"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-slate-200">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#4f8ef7] to-[#7b5cfa] flex items-center justify-center">
                    <span className="text-white text-[11px] font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
            </div>

            {/* Name — hidden on mobile */}
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-[12px] font-semibold text-slate-800 leading-tight max-w-[90px] truncate">
                {displayName}
              </span>
              <span className="text-[10px] text-[#4f8ef7] font-medium capitalize">
                {String(authUser?.role ?? "student")
                  .replace(/_/g, " ")
                  .toLowerCase()}
              </span>
            </div>

            <ChevronDown
              className={`hidden sm:block w-4 h-4 text-slate-400 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] w-[190px] rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60 overflow-hidden z-50">
              {/* User info */}
              <div className="px-3.5 py-3 border-b border-slate-100">
                <p className="text-[12px] font-semibold text-slate-800 truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {email || "student@panel.io"}
                </p>
              </div>

              {/* Menu */}
              <div className="py-1.5">
                <button
                  onClick={() => {
                    router.push("/student/profile");
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100">
                    <User className="w-3 h-3 text-slate-500" />
                  </span>
                  My Profile
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-slate-100 py-1.5">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-red-50">
                    <LogOut className="w-3 h-3 text-red-400" />
                  </span>
                  {isLoggingOut ? "Signing out…" : "Sign Out"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
