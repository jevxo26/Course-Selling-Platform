"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { ArrowRight, Check, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import ForgetLotti from "@/components/homepage/forget-password/ForgetLotti";

type ForgotPasswordFormData = {
  email: string;
};

export default function ForgetPasswordPage(): React.JSX.Element {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    defaultValues: { email: "" },
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async () => {
    const toastId = toast.loading("Sending reset link...");
    try {
      await new Promise((r) => setTimeout(r, 700));
      setSuccess(true);
      toast.success("Reset link sent!", { id: toastId });
    } catch {
      toast.error("Failed to send reset link", { id: toastId });
    }
  };

  const inputBase =
    "w-full bg-[#F1F5F9] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 rounded-xl px-4 py-3 text-[13px] outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-[#F8FAFF] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto mt-15">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10">
          <div className="hidden md:flex lg:w-1/2 flex-col items-start justify-center px-2 lg:px-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-black text-[#1D4ED8]">
              Account Recovery
            </div>
            <h2 className="mt-4 text-[28px] lg:text-[34px] font-extrabold text-slate-900 leading-tight">
              Securely reset your password in{" "}
              <span className="text-[#2563EB]">seconds</span>.
            </h2>
            <p className="mt-2 text-[14px] text-slate-500 leading-relaxed max-w-md">
              Enter the email associated with your account. We’ll send a secure
              link to help you regain access.
            </p>

            {/* <div className="mt-5 grid gap-2 text-[13px] text-slate-600 font-medium">
              <div className="flex items-start gap-2">
                <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB] font-black text-[12px]">
                  1
                </span>
                <span>Provide your email address and submit the request.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB] font-black text-[12px]">
                  2
                </span>
                <span>Check your inbox (and spam/junk folder).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB] font-black text-[12px]">
                  3
                </span>
                <span>Open the link and set a new password.</span>
              </div>
            </div> */}

            <div className="mt-0 w-full flex items-center justify-center">
              <ForgetLotti />
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex items-center justify-center">
            <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-sm shadow-blue-100 border border-slate-100 p-8">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] flex items-center justify-center">
                  <Mail className="w-6 h-6 text-[#2563EB]" />
                </div>
              </div>

              <div className="text-center mb-6">
                <h1 className="text-[20px] font-black text-slate-900">
                  Forgot your password?
                </h1>
                <p className="text-slate-500 text-[13px] font-medium mt-1 leading-relaxed">
                  We’ll email you a secure reset link. No worries — it happens.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={isSubmitting || success}
                  className="w-full bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none text-[13px] flex items-center justify-center gap-2 mt-1"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : success ? (
                    <>
                      <Check className="w-4 h-4" />
                      Email Sent
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {success && (
                  <p className="text-[12px] text-slate-500 font-medium text-center">
                    If you don&apos;t see it within a minute, check spam/junk
                    and try again.
                  </p>
                )}
              </form>

              <div className="mt-5 flex items-center justify-center gap-2 text-[12px] font-bold">
                <Link href="/login" className="text-[#2563EB] hover:underline">
                  Back to Login
                </Link>
                <span className="text-slate-300">•</span>
                <Link
                  href="/signup"
                  className="text-slate-500 hover:text-[#2563EB] hover:underline transition-colors"
                >
                  Create Account
                </Link>
              </div>

              <p className="text-center text-[11px] text-slate-500 mt-4">
                © 2026 Developed by Aftab Farhan ARKO . All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
