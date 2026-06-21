"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Plus,
  Menu,
  Search,
  Sun,
  Moon,
  MessageCircle,
  Maximize,
  Minimize,
  Settings,
  LayoutDashboard,
  ChevronRight,
  Command,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useLogoutMutation } from "@/lib/api/authApi";
import { logout } from "@/store/slices/authSlice";
import { baseApi } from "@/lib/api/baseApi";
import { RootState } from "@/store";
import { toast } from "sonner";

export default function TopNavbar({
  onMenuClick,
  onClose,
}: {
  onMenuClick?: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();

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

  // Initials fallback
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    const toastId = toast.loading("Signing out...");
    try {
      await logoutApi().unwrap();
    } catch {
      // ignore API errors — still log out locally
    } finally {
      dispatch(logout());
      dispatch(baseApi.util.resetApiState());
      toast.success("Signed out", { id: toastId });
      setDropdownOpen(false);
      onClose?.();
      router.replace("/");
    }
  };

  // Readable current page name from pathname
  const currentPage =
    pathname
      ?.split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Overview";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-zinc-100 bg-white px-4 sm:px-6">
      {/* ── Left: Brand + Breadcrumb ── */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-zinc-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-4 h-4 text-zinc-600" />
        </button>
      </div>

      {/* ── Right: Actions ── */}
      <div className="flex items-center gap-1">
        {/* Fullscreen */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFullScreen}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className="hidden lg:flex h-8 w-8 rounded-lg text-zinc-500 hover:bg-zinc-100 p-0 items-center justify-center"
        >
          {isFullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </Button>

        {/* ── Avatar Dropdown ── */}
        <div className="relative ml-0.5" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg pl-0.5 pr-2 py-0.5 hover:bg-zinc-100 transition-colors group"
            aria-label="Account menu"
            aria-expanded={dropdownOpen}
          >
            {/* Avatar image or initials */}
            <div className="relative h-7 w-7 flex-shrink-0">
              <div className="h-7 w-7 rounded-[8px] overflow-hidden ring-1 ring-zinc-200 group-hover:ring-blue-400 transition-all">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-medium">
                    {initials}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border-2 border-white rounded-full" />
            </div>

            {/* Name + chevron (desktop only) */}
            <div className="hidden lg:flex items-center gap-1">
              <span className="text-[13px] font-medium text-zinc-800 max-w-[100px] truncate">
                {displayName}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {/* Dropdown panel */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 bg-white shadow-lg overflow-hidden z-50">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-zinc-100">
                <p className="text-[13px] font-medium text-zinc-900 truncate">
                  {displayName}
                </p>
                {email && (
                  <p className="text-[12px] text-zinc-500 truncate mt-0.5">
                    {email}
                  </p>
                )}
                {country && (
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {country}
                  </p>
                )}
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push("/dashboard/profile");
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <User className="w-4 h-4 text-zinc-400" />
                  Profile
                </button>
              </div>

              <div className="border-t border-zinc-100 py-1">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut className="w-4 h-4" />
                  {isLoggingOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}