"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoginMutation } from "@/lib/api/authApi";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Check, Loader2 } from "lucide-react";
import LoginLotti from "@/components/signup/LoginLotti";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [loginUser, { isLoading: isLoginLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    const toastId = toast.loading("Signing in...");

    try {
      const response = await loginUser({ email: data.email, password: data.password }).unwrap() as any;
      const userRole = response?.user?.role || response?.role;
      setSuccess(true);
      toast.success("Signed in!", { id: toastId });

      if (next) {
        router.push(next);
      } else {
        if (userRole === "superadmin" || userRole === "super_admin" || userRole === "admin") {
          router.push("/admin/dashboard");
        } else if (userRole === "affiliate") {
          router.push("/affiliate/dashboard");
        } else {
          router.push("/student/dashboard");
        }
      }
    } catch {
      toast.error("Login failed", { id: toastId });
    }
  };

  /* ─── JEVXO color palette — same as signup ─── */
  const inputBase =
    "w-full bg-[#F1F5F9] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 rounded-xl px-4 py-3 text-[13px] outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* ── LEFT: Lottie — hidden on mobile, visible md+ ── */}
          <div className="hidden md:flex lg:w-1/2 p-10 flex-col items-center justify-center bg-white">
            <div className="w-full mb-6 mt-16 lg:mt-28 pl-4 lg:pl-12">
              <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                Welcome <span className="text-[#2563EB]">Back</span>
              </h2>
              <p className="text-[14px] text-slate-500 mt-2 leading-relaxed max-w-xs">
                Sign in to access your dashboard, track progress, and continue
                your learning journey.
              </p>
            </div>
            <div className="w-full flex items-center justify-center">
              <LoginLotti />
            </div>
          </div>

          {/* ── RIGHT: Form card ── */}
          <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-sm shadow-blue-100 border border-slate-100 p-8">
              {/* Lock icon */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-[#2563EB]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V7a4.5 4.5 0 00-9 0v3.5M5 10.5h14a1 1 0 011 1V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-8.5a1 1 0 011-1z"
                    />
                  </svg>
                </div>
              </div>

              {/* Heading */}
              <div className="text-center mb-6">
                <h1 className="text-[20px] font-black text-slate-900">
                  Welcome Back
                </h1>
                <p className="text-[#2563EB] text-[13px] font-semibold mt-0.5">
                  Your Personal Dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Email Address
                  </label>
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Invalid email",
                      },
                    })}
                    type="email"
                    placeholder="john@example.com"
                    className={`${inputBase} ${errors.email ? "border-red-400" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-500 font-bold ml-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Password
                    </label>
                    <Link
                      href="/forget-password"
                      className="text-[11px] font-bold text-[#2563EB] hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      {...register("password", {
                        required: "Password is required",
                      })}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`${inputBase} pr-11 ${errors.password ? "border-red-400" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2563EB] transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-red-500 font-bold ml-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || isLoginLoading || success}
                  className="w-full bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none text-[13px] flex items-center justify-center gap-2 mt-1"
                >
                  {isSubmitting || isLoginLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : success ? (
                    <>
                      <Check className="w-4 h-4" />
                      Success!
                    </>
                  ) : (
                    <>
                      Sign In to Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <p className="text-center text-[12px] text-slate-400 mt-5">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-[#2563EB] font-black hover:underline"
                >
                  Create Account
                </Link>
              </p>

              <p className="text-center text-[11px] text-slate-500 mt-3">
                © 2026 Developed by Aftab Farhan ARKO . All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
