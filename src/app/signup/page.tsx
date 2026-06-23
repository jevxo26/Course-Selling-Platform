"use client";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Link from "next/link";
import SignupLotti from "@/components/signup/Lotti";
import { useRegisterMutation } from "@/lib/api/authApi";
import { uploadImageToImgBB } from "@/lib/images.upload";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Loader2,
  Camera,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";

type SignupFormData = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  password: string;
};

export default function SignupPage(): React.JSX.Element {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastIdRef = useRef<string | number | null>(null);
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [
    registerUser,
    {
      isLoading: isRegisterLoading,
      isSuccess: isRegisterSuccess,
      isError: isRegisterError,
      error: registerError,
      reset: resetRegister,
    },
  ] = useRegisterMutation();

  const getApiErrorMessage = (error: unknown): string => {
    if (!error) return "Registration failed";
    if (typeof error === "string") return error;
    if (error instanceof Error) return error.message || "Registration failed";

    const anyErr = error as any;
    const data = anyErr?.data;

    if (typeof data === "string") return data;
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.error === "string") return data.error;
    if (Array.isArray(data?.message))
      return data.message.filter((x: any) => typeof x === "string").join(", ");

    if (typeof anyErr?.error === "string") return anyErr.error;

    try {
      return JSON.stringify(data ?? error);
    } catch {
      return "Registration failed";
    }
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      country: "",
      password: "",
    },
  });

  useEffect(() => {
    let active = true;

    fetch("/cuntrey.json")
      .then((res) => res.json())
      .then((data: Array<{ name?: unknown }>) => {
        if (!active) return;
        const names = data
          .map((x) => (typeof x?.name === "string" ? x.name : null))
          .filter((x): x is string => !!x);
        const withOther = names.includes("Other") ? names : [...names, "Other"];
        setCountries(withOther);
      })
      .catch(() => { });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const id = toastIdRef.current;
    if (!id) return;

    if (isRegisterSuccess) {
      setSuccess(true);
      toast.success("Account created!", { id });
      toastIdRef.current = null;
      return;
    }

    if (isRegisterError) {
      toast.error(getApiErrorMessage(registerError), { id });
      toastIdRef.current = null;
    }
  }, [getApiErrorMessage, isRegisterError, isRegisterSuccess, registerError]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<SignupFormData> = async (data) => {
    if (!selectedPhoto) {
      toast.error("Please upload a profile photo");
      return;
    }

    const toastId = toast.loading("Creating account...");

    try {
      const photoUrl = await uploadImageToImgBB(selectedPhoto);

      const searchParams = new URLSearchParams(window.location.search);
      const requestedRole = searchParams.get('role');
      const finalRole = requestedRole === 'affiliate' ? 'affiliate' : 'student';

      await registerUser({
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        country: data.country,
        password: data.password,
        photo: photoUrl,
        role: finalRole,
      }).unwrap();

      setSuccess(true);
      toast.success("Account created! Redirecting to login...", { id: toastId });
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err) {
      const message =
        typeof err === "object" && err && "data" in err
          ? (err as any).data?.message || "Registration failed"
          : err instanceof Error
            ? err.message
            : "Registration failed";
      toast.error(message, { id: toastId });
    }
  };

  /* ─── JEVXO color palette: dark navy + electric blue ─── */
  const inputBase =
    "w-full bg-[#F1F5F9] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 rounded-xl px-4 py-3 text-[13px] outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700";

  return (
    <div className="min-h-screen md:mt-7 mt-10 bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full  md:max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* ── LEFT: Lottie — hidden on mobile (< md), visible md and above ── */}
          <div className="hidden md:flex lg:w-1/2 p-10 flex-col items-center justify-center bg-white">
            <div className="w-full mb-6">
              <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                Skill to Income{" "}
                <span className="text-[#2563EB]">Transformation</span>
              </h2>
              <p className="text-[14px] text-slate-500 mt-2 leading-relaxed max-w-xs">
                Master high-demand skills, track your progress, and grow faster
                with our next-gen dashboard.
              </p>
            </div>
            <div className="w-full flex items-center justify-center">
              <SignupLotti />
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
                  Create Account
                </h1>
                <p className="text-[#2563EB] text-[13px] font-semibold mt-0.5">
                  Your Personal Dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Photo Upload */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Profile Photo
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-[#F1F5F9] border-2 border-dashed border-[#BFDBFE] hover:border-[#2563EB] hover:bg-[#EFF6FF]/40 rounded-xl px-4 py-3 cursor-pointer transition-all flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#EFF6FF] border-2 border-white shadow-sm shrink-0 flex items-center justify-center">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-5 h-5 text-[#2563EB] group-hover:text-[#1D4ED8] transition-colors" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-slate-600 group-hover:text-[#2563EB] transition-colors truncate">
                        {photoName ? photoName : "Click to upload photo"}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        JPG, PNG or GIF · Max 5MB
                      </p>
                    </div>
                    <Upload className="w-4 h-4 text-[#93C5FD] group-hover:text-[#2563EB] transition-colors shrink-0" />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>

                {/* Full Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Full Name
                    </label>
                    <input
                      {...register("fullName", {
                        required: "Name is required",
                      })}
                      type="text"
                      placeholder="John Doe"
                      className={`${inputBase} ${errors.fullName ? "border-red-400" : ""}`}
                    />
                    {errors.fullName && (
                      <p className="text-[11px] text-red-500 font-bold ml-1">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Email
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
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register("password", {
                        required: "Password is required",
                        minLength: { value: 6, message: "Min 6 characters" },
                      })}
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
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

                {/* Phone + Country */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Phone Number
                    </label>
                    <input
                      {...register("phone", {
                        required: "Phone is required",
                        pattern: {
                          value: /^[+]?[\d\s\-()]{7,15}$/,
                          message: "Invalid phone",
                        },
                      })}
                      type="tel"
                      placeholder="+880 1700 000000"
                      className={`${inputBase} ${errors.phone ? "border-red-400" : ""}`}
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-red-500 font-bold ml-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Country
                    </label>
                    <Controller
                      control={control}
                      name="country"
                      rules={{ required: "Country is required" }}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            className={`w-full bg-[#F1F5F9] border ${errors.country ? "border-red-400" : "border-[#E2E8F0]"} focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 rounded-xl px-4 py-3 text-[13px] outline-none transition-all text-slate-700 font-medium cursor-pointer`}
                          >
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.country && (
                      <p className="text-[11px] text-red-500 font-bold ml-1">
                        {errors.country.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit — JEVXO "Start Learning" button style */}
                <button
                  type="submit"
                  disabled={isSubmitting || isRegisterLoading || success}
                  className="w-full bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none text-[13px] flex items-center justify-center gap-2 mt-1"
                >
                  {isSubmitting || isRegisterLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : success ? (
                    <>
                      <Check className="w-4 h-4" />
                      Account Created!
                    </>
                  ) : (
                    <>
                      Create My Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <p className="text-center text-[12px] text-slate-400 mt-5">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#2563EB] font-black hover:underline"
                >
                  Sign In
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
