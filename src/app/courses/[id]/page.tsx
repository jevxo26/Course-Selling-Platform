"use client";

import { notFound, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useGetPublicCourseQuery } from "@/lib/api/courseApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useAdminEnrollmentsPayZinipayPaymentMutation } from "@/lib/api/admin/enrollments";
import { toast } from "sonner";
import {
  Star,
  CheckCircle2,
  Clock,
  PlayCircle,
  Download,
  Infinity,
  Trophy,
  ChevronRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export default function CourseDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const referCode = searchParams.get("ref");
  
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [payZinipay, { isLoading: isPaying }] = useAdminEnrollmentsPayZinipayPaymentMutation();

  const { data: raw, isLoading, isError, error } = useGetPublicCourseQuery(id);

  const course = raw
    ? {
        id: raw.id ?? id,
        title: raw.title ?? "Untitled",
        desc: raw.description ?? "",
        image: raw.thumbnail ?? "/placeholder.jpg",
        price: Number(raw.price ?? 0),
        category: raw.category?.name ?? "Uncategorized",
        potential: "৳10k+/mo Potential",
        commission: "0%",
        rating: 4.9,
        reviews: "1.2k",
        duration: "14.5 Hours On‑Demand",
      }
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fc]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading course...</span>
        </div>
      </div>
    );
  }

  if (isError || !course) {
    if (
      (error as any)?.status === 404 ||
      (error as any)?.originalStatus === 404
    ) {
      return notFound();
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-red-500 font-semibold">Failed to load course.</p>
      </div>
    );
  }

  const handleEnroll = async () => {
    if (!authUser) {
      toast.error("Please login to enroll in this course");
      router.push(`/login?redirect=/courses/${course.id}${referCode ? `?ref=${referCode}` : ""}`);
      return;
    }
    const toastId = toast.loading("Initiating payment...");
    try {
      const res = await payZinipay({
        studentId: Number(authUser.id),
        courseId: Number(course.id),
        amount: Number(course.price),
        referCode: referCode || undefined,
      }).unwrap();
      
      const paymentUrl = res?.paymentUrl ?? res?.data?.paymentUrl;
      if (paymentUrl) {
        toast.success("Redirecting to payment gateway...", { id: toastId });
        window.location.href = paymentUrl;
      } else {
        toast.error("Failed to retrieve payment URL", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Enrollment failed", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* ─── Breadcrumb ─── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex items-center gap-2 text-[13px] font-semibold text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <Link
            href="/courses"
            className="hover:text-blue-600 transition-colors"
          >
            Courses
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-slate-900 truncate">{course.category}</span>
        </div>
      </div>

      {/* ─── Hero Section ─── */}
      <div className="bg-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px]" />

        <div className="max-w-[1200px] mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase">
                {course.category}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 text-[13px] font-bold">
                <ShieldCheck size={16} /> Certified Quality
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6">
              {course.title}
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-xl">
              {course.desc} Equip yourself with the systems, frameworks, and
              strategies used by the top 1% in the industry.
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {Array.from({ length: Math.floor(course.rating) }).map(
                    (_, i) => (
                      <Star key={i} size={18} fill="currentColor" />
                    ),
                  )}
                </div>
                <span className="font-bold text-[15px]">{course.rating}</span>
                <span className="text-slate-400 text-[14px]">
                  ({course.reviews} reviews)
                </span>
              </div>
              <div className="h-5 w-px bg-slate-700 hidden sm:block" />
              <div className="flex items-center gap-2 text-slate-300 text-[14px] font-medium">
                <Clock size={18} className="text-slate-400" /> {course.duration}
              </div>
            </div>
          </div>

          {/* Hero Video/Image Preview */}
          <div className="relative group rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-700/50 aspect-video lg:aspect-auto lg:h-[400px] bg-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-colors duration-500" />
            <div className="absolute inset-0 m-auto w-20 h-20 bg-white/20 hover:bg-blue-600 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl group-hover:scale-110 cursor-pointer">
              <PlayCircle size={36} className="text-white ml-1.5" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 -mt-10 relative z-20 flex flex-col lg:flex-row gap-8">
        {/* Left Column (Details) */}
        <div className="flex-1 space-y-8">
          {/* Key Metrics Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-wrap sm:flex-nowrap divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="w-full sm:flex-1 pb-4 sm:pb-0 sm:px-6 first:pl-0 last:pr-0 text-center sm:text-left">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Earning Potential
              </p>
              <p className="text-2xl font-black text-emerald-600">
                {course.potential}
              </p>
            </div>
            <div className="w-full sm:flex-1 py-4 sm:py-0 sm:px-6 text-center sm:text-left">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Affiliate Commission
              </p>
              <p className="text-2xl font-black text-blue-600">
                {course.commission}
              </p>
            </div>
          </div>

          {/* What you'll learn */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              What you'll learn
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Develop high-conversion funnels and landing pages that turn visitors into paying customers.",
                "Master the psychology of high-ticket sales and closing techniques.",
                "Automate client acquisition using advanced AI tools and frameworks.",
                "Build a predictable, recurring revenue engine from scratch.",
                "Create scalable design systems to charge premium enterprise rates.",
                "Leverage performance marketing to scale rapidly across platforms.",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="text-emerald-500 shrink-0 mt-0.5"
                  />
                  <p className="text-[14px] text-slate-600 leading-relaxed font-medium">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Course Description */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              About this course
            </h2>
            <div className="space-y-4 text-[15px] text-slate-600 leading-relaxed">
              <p>
                This intensive program is designed for ambitious professionals
                who want to escape the trap of low-ticket services. You will
                learn the exact blueprint to architect a premium offer, position
                yourself as an authority, and execute strategies that command
                high fees.
              </p>
              <p>
                Whether you are starting from zero or looking to scale an
                existing business, the {course.title} provides you with the
                tools, templates, and community support you need. The curriculum
                is rigorously updated to reflect the latest market trends and
                technological advancements.
              </p>
              <p>
                By the end of this course, you won't just have theoretical
                knowledge; you will have a deployed, functioning system capable
                of generating{" "}
                {course.potential.toLowerCase().replace(" potential", "")}.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (Sticky Pricing Card) */}
        <div className="lg:w-[380px] shrink-0">
          <div className="sticky top-24 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Price Header */}
            <div className="p-8 pb-6 border-b border-slate-100 text-center">
              <div className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
                LIFETIME ACCESS
              </div>
              <div className="flex items-end justify-center gap-1 mb-2">
                <span className="text-3xl font-bold text-slate-400 line-through">
                  ৳{Math.floor(course.price * 1.5)}
                </span>
                <span className="text-5xl font-black text-slate-900 tracking-tight">
                  ৳{course.price}
                </span>
              </div>
              <p className="text-sm font-semibold text-emerald-600 mb-6">
                Save 33% limited time offer
              </p>
              <button
                onClick={handleEnroll}
                disabled={isPaying}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-1 active:translate-y-0 text-lg flex items-center justify-center gap-2 disabled:opacity-75 disabled:pointer-events-none"
              >
                {isPaying ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Initiating...
                  </>
                ) : (
                  <>
                    Enroll Now
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
              <p className="text-xs text-slate-400 font-medium mt-4">
                30-Day Money-Back Guarantee
              </p>
            </div>

            {/* Features List */}
            <div className="p-8 bg-slate-50">
              <h3 className="font-bold text-slate-900 mb-4">
                This course includes:
              </h3>
              <ul className="space-y-4">
                {[
                  { icon: PlayCircle, text: "14.5 hours on-demand video" },
                  {
                    icon: Download,
                    text: "22 downloadable resources & templates",
                  },
                  { icon: Infinity, text: "Full lifetime access" },
                  { icon: ShieldCheck, text: "Access on mobile and TV" },
                  { icon: Trophy, text: "Certificate of completion" },
                ].map((Feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm font-medium text-slate-600"
                  >
                    <Feature.icon size={18} className="text-blue-600" />
                    {Feature.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
