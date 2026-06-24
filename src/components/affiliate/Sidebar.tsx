"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HandCoins,
  LayoutDashboard,
  LogOut,
  Wallet,
  CreditCard,
  X,
  Sparkles,
  Home,
} from "lucide-react";
import Image from "next/image";
import { useLogoutMutation } from "@/lib/api/authApi";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { baseApi } from "@/lib/api/baseApi";
import { toast } from "sonner";
import type { RootState } from "@/store";

const menuGroups = [
  {
    label: "OVERVIEW",
    items: [
      {
        name: "Dashboard",
        href: "/affiliate/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { name: "Wallet", href: "/affiliate/dashboard/wallet", icon: Wallet },
      {
        name: "Payment Methods",
        href: "/affiliate/dashboard/payment-methods",
        icon: CreditCard,
      },
      {
        name: "Withdraw",
        href: "/affiliate/dashboard/withdraw",
        icon: HandCoins,
      },
    ],
  },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const authUser = useSelector((state: RootState) => state.auth.user);

  const displayName =
    String(
      authUser?.name ?? authUser?.fullName ?? authUser?.username ?? "",
    ).trim() || "Affiliate";
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

  const roleRaw = String(authUser?.role ?? "affiliate");
  const badge = roleRaw.replace(/_/g, " ");

  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();

  return (
    <aside className="relative h-screen w-full border-r border-slate-200 bg-white overflow-y-auto overflow-x-hidden px-3 py-5 flex flex-col">
      {/* Close button (mobile) */}
      {onClose && (
        <div className="flex justify-end mb-3 md:hidden">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Profile card */}
      <div className="mb-6 px-2">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700 overflow-hidden border border-slate-300">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                  width={40}
                  height={40}
                />
              ) : (
                <span>{displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            {/* Online dot */}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white" />
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-slate-900 truncate leading-tight">
              {displayName}
            </h2>
            <p className="text-xs text-slate-500 truncate">
              {email || "Logged in"}
            </p>
            <span className="mt-1 inline-flex items-center gap-1 self-start rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold tracking-widest text-white uppercase">
              <Sparkles size={8} />
              {badge}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation groups */}
      <nav className="flex flex-col gap-5 flex-1">
        {menuGroups.map((group) => (
          <div key={group.label}>
            {/* Section label */}
            <p className="mb-1.5 px-3 text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
              {group.label}
            </p>

            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.name === "Dashboard"
                    ? pathname === item.href
                    : pathname === item.href ||
                      pathname?.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-blue-50 text-blue-600 border-l-[3px] border-blue-600"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-[3px] border-transparent"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={`shrink-0 ${
                        isActive
                          ? "text-blue-600"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col gap-2">
        <Link
          href="/"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-150"
        >
          <Home size={16} className="shrink-0" />
          <span className="truncate">Back to Home</span>
        </Link>

        <button
          onClick={async () => {
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
              window.location.href = "/login";
            }
          }}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 disabled:opacity-70 disabled:pointer-events-none"
        >
          <LogOut size={16} className="shrink-0" />
          <span className="truncate">
            {isLoggingOut ? "Signing out..." : "Sign Out"}
          </span>
        </button>
      </div>
    </aside>
  );
}
