"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Home,
  GraduationCap,
  ShoppingBag,
  BarChart2,
  Menu,
  X,
  LogIn,
  UserPlus,
  Shield,
  LayoutDashboard,
  LogOut,
  SignalIcon,
  ChevronDown,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useLogoutMutation } from "@/lib/api/authApi";
import { logout } from "@/store/slices/authSlice";
import { baseApi } from "@/lib/api/baseApi";
import { toast } from "sonner";

const navLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "Courses", href: "/courses", icon: GraduationCap },
  { name: "Shop", href: "/shop", icon: ShoppingBag },
  { name: "Stats", href: "/stats", icon: BarChart2 },
];

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const drawerRef = useRef<HTMLDivElement>(null);
  const desktopProfileRef = useRef<HTMLDivElement>(null);
  const mobileProfileRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth,
  );
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
      if (profileOpen) {
        const clickedOutsideDesktop = desktopProfileRef.current && !desktopProfileRef.current.contains(e.target as Node);
        const clickedOutsideMobile = mobileProfileRef.current && !mobileProfileRef.current.contains(e.target as Node);
        
        if (clickedOutsideDesktop && clickedOutsideMobile) {
          setProfileOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen, profileOpen]);

  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/student") ||
    pathname?.startsWith("/affiliate/dashboard")
  ) {
    return null;
  }

  const role = String((user as any)?.role ?? "").toLowerCase();
  const isAdminRole =
    role === "superadmin" || role === "super_admin" || role === "admin";
  const isAffiliateRole = role === "affiliate";

  const avatarUrl =
    (user as any)?.photo ||
    (user as any)?.avatar ||
    (user as any)?.image ||
    (user as any)?.profileImage ||
    null;

  const displayName =
    (user as any)?.name ||
    (user as any)?.fullName ||
    (user as any)?.username ||
    "User";

  const initials = String(displayName).trim().slice(0, 1).toUpperCase();

  const dashboardHref = isAdminRole
    ? "/admin/dashboard"
    : isAffiliateRole
      ? "/affiliate/dashboard"
      : "/student";

  const handleLogout = (closeCallback: () => void) => {
    if (isLoggingOut) return;
    const toastId = toast.loading("Signing out...");

    try {
      // 1. Clear local storage explicitly to guarantee removal
      if (typeof window !== "undefined") {
        localStorage.removeItem("course_platform_auth");
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        document.cookie = "role=; Path=/; Max-Age=0; SameSite=Lax";
      }

      // 2. Clear Redux state
      dispatch(logout());
      try {
        dispatch(baseApi.util.resetApiState());
      } catch (e) {
        // ignore
      }

      // 3. Update UI
      toast.success("Signed out successfully", { id: toastId });
      closeCallback();

      // 4. Redirect with a slight delay so toast is visible and state settles
      setTimeout(() => {
        if (window.location.pathname === "/") {
          window.location.reload();
        } else {
          window.location.href = "/";
        }
      }, 300);

      // 5. Fire API in background
      logoutApi().catch(() => {});
    } catch (error) {
      toast.error("Logout failed", { id: toastId });
    }
  };

  return (
    <>
      {/* ───── TOP HEADER ───── */}
      <header
        className={`fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.06)] py-2"
            : "bg-[#DFE2FF] py-3"
        }`}
        style={{ fontFamily: "var(--font-bai-jamjuree)" }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            {/* ── Mobile: Hamburger left ── */}
            <button
              onClick={() => setIsOpen(true)}
              className="lg:hidden p-2 -ml-1 text-slate-700 hover:bg-black/5 rounded-xl transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* ── Logo: desktop stays left, mobile pushed to right ── */}
            <Link
              href="/"
              className="flex-shrink-0 lg:w-48 lg:order-none order-last ml-auto lg:ml-0"
            >
              <img
                src="/maruf.png"
                alt="Maruf Tech"
                className="h-10 w-auto object-contain"
              />
            </Link>

            {/* ── Desktop Center Nav ── */}
            <nav className="hidden lg:flex items-center gap-0.5 bg-black/5 rounded-2xl px-2 py-1.5 flex-1 max-w-md mx-auto justify-center">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative flex items-center gap-2 text-[13.5px] font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${
                      active
                        ? "bg-[#0047FF] text-white shadow-md shadow-blue-300/40"
                        : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                    }`}
                  >
                    <Icon className="w-[15px] h-[15px]" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* ── Desktop Right: Auth / Profile ── */}
            <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0 lg:w-48 justify-end">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 text-[13.5px] font-bold text-slate-700 px-4 h-10 rounded-xl bg-black/5 hover:bg-black/10 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>

                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 h-10 px-8 rounded-xl bg-[#0047FF] text-white text-[14px] font-bold transition-all duration-300 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/25 active:scale-95"
                  >
                    <span>SignUp</span>
                    <UserPlus className="w-4 h-4 flex-shrink-0" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={dashboardHref}
                    className="flex items-center gap-1.5 text-[13.5px] font-bold text-slate-700 px-4 py-2 rounded-xl bg-black/5 hover:bg-black/10 transition-colors"
                  >
                    {isAdminRole ? (
                      <Shield className="w-4 h-4" />
                    ) : (
                      <LayoutDashboard className="w-4 h-4" />
                    )}
                    {isAdminRole
                      ? "Admin"
                      : isAffiliateRole
                        ? "Affiliate"
                        : "Dashboard"}
                  </Link>

                  {/* Profile dropdown */}
                  <div className="relative" ref={desktopProfileRef}>
                    <button
                      type="button"
                      onClick={() => setProfileOpen((v) => !v)}
                      className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl bg-black/5 hover:bg-black/10 transition-colors"
                      aria-label="Account menu"
                    >
                      <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-200 flex items-center justify-center shadow-sm">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[11px] font-black text-slate-700">
                            {initials}
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-black/10 overflow-hidden z-50">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                          <p className="text-[13px] font-black text-slate-900 truncate">
                            {displayName}
                          </p>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide truncate">
                            {role || "user"}
                          </p>
                        </div>
                        <div className="py-1.5 px-1.5 flex flex-col gap-0.5">
                          <Link
                            href={dashboardHref}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-400" />
                            Dashboard
                          </Link>

                          <button
                            type="button"
                            disabled={isLoggingOut}
                            onClick={() =>
                              handleLogout(() => setProfileOpen(false))
                            }
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                          >
                            <LogOut className="w-4 h-4" />
                            {isLoggingOut ? "Signing out..." : "Sign Out"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ───── MOBILE SIDE DRAWER ───── */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={`fixed top-0 left-0 z-[200] h-full w-72 bg-white shadow-2xl shadow-black/20 transition-transform duration-300 ease-out lg:hidden flex flex-col`}
        style={{ transform: isOpen ? "translateX(0)" : "translateX(-100%)" }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <Link href="/" onClick={() => setIsOpen(false)}>
            <img
              src="/maruf.png"
              alt="Maruf Tech"
              className="h-7 w-auto object-contain"
            />
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          <p className="px-4 text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">
            Navigation
          </p>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-[14.5px] font-bold transition-all overflow-hidden ${
                  active
                    ? "bg-blue-50 text-[#0047FF]"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {/* Left blue border indicator */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full bg-[#0047FF]" />
                )}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    active
                      ? "bg-blue-100 text-[#0047FF]"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Drawer bottom auth */}
        <div className="px-3 py-4 border-t border-slate-100 flex flex-col gap-2">
          {!isAuthenticated ? (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-3 rounded-2xl text-[13.5px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <LogIn className="w-4 h-4 text-slate-500" />
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="flex"
              >
                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#0047FF] hover:bg-blue-700 text-white font-bold text-[13.5px] transition-all hover:shadow-lg hover:shadow-blue-400/30 active:scale-[0.98]">
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* User info strip */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 mb-1">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center flex-shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[12px] font-black text-slate-700">
                      {initials}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-black text-slate-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {role || "user"}
                  </p>
                </div>
              </div>

              <Link
                href={dashboardHref}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-slate-500" />
                </div>
                Dashboard
              </Link>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => handleLogout(() => setIsOpen(false))}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-bold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-red-500" />
                </div>
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ───── MOBILE BOTTOM NAV ───── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-xl border-t border-slate-200/80 pb-safe">
        <div className="flex items-center justify-around h-[60px] max-w-lg mx-auto px-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex flex-col items-center justify-center gap-[3px] flex-1 py-1 px-2 rounded-2xl transition-all duration-200 ${
                  active
                    ? "text-[#0047FF]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <div
                  className={`relative flex items-center justify-center w-8 h-7 rounded-xl transition-all duration-200 ${
                    active ? "bg-blue-50" : ""
                  }`}
                >
                  <Icon
                    className="w-[18px] h-[18px]"
                    strokeWidth={active ? 2.5 : 1.8}
                  />
                  {active && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0047FF]" />
                  )}
                </div>
                <span
                  className={`text-[9.5px] font-bold tracking-wide ${active ? "text-[#0047FF]" : ""}`}
                >
                  {link.name}
                </span>
              </Link>
            );
          })}

          {/* ── Profile tab (only when logged in) ── */}
          {isAuthenticated && (
            <div className="relative flex-1" ref={mobileProfileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className={`w-full flex flex-col items-center justify-center gap-[3px] py-1 px-2 rounded-2xl transition-all duration-200 ${
                  profileOpen ? "text-[#0047FF]" : "text-slate-400"
                }`}
              >
                <div
                  className={`relative flex items-center justify-center w-8 h-7 rounded-xl transition-all duration-200 ${
                    profileOpen ? "bg-blue-50" : ""
                  }`}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                    />
                  ) : (
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                        profileOpen
                          ? "bg-[#0047FF] text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {initials}
                    </div>
                  )}
                  {profileOpen && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0047FF]" />
                  )}
                </div>
                <span
                  className={`text-[9.5px] font-bold tracking-wide ${profileOpen ? "text-[#0047FF]" : ""}`}
                >
                  {isAdminRole
                    ? "Admin"
                    : isAffiliateRole
                      ? "Affiliate"
                      : "Profile"}
                </span>
              </button>

              {/* Bottom-nav profile dropdown — slides up */}
              {profileOpen && (
                <div className="absolute bottom-[68px] right-0 w-64 rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-black/20 overflow-hidden z-[200]">
                  {/* User info */}
                  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-slate-50">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[13px] font-black text-slate-700">
                          {initials}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-black text-slate-900 truncate">
                        {displayName}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {role || "user"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="py-2 px-2 flex flex-col gap-0.5">
                    <Link
                      href={dashboardHref}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        {isAdminRole ? (
                          <Shield className="w-3.5 h-3.5 text-[#0047FF]" />
                        ) : (
                          <LayoutDashboard className="w-3.5 h-3.5 text-[#0047FF]" />
                        )}
                      </div>
                      {isAdminRole
                        ? "Admin Dashboard"
                        : isAffiliateRole
                          ? "Affiliate Dashboard"
                          : "Student Dashboard"}
                    </Link>



                    <div className="my-1 h-px bg-slate-100 mx-1" />

                    <button
                      type="button"
                      disabled={isLoggingOut}
                      onClick={() => handleLogout(() => setProfileOpen(false))}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      {isLoggingOut ? "Signing out..." : "Sign Out"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Spacers */}
      <div className="h-[60px] lg:h-[68px]" />
    </>
  );
}

export default Header;
