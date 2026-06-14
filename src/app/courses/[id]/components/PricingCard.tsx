// app/courses/[id]/components/PricingCard.tsx
import {
  ChevronRight,
  PlayCircle,
  Download,
  Infinity,
  ShieldCheck,
  Trophy,
} from "lucide-react";

interface Props {
  course: {
    price: number;
  };
}

export default function PricingCard({ course }: Props) {
  return (
    <div className="sticky top-24 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
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
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-1 active:translate-y-0 text-lg flex items-center justify-center gap-2">
          Enroll Now
          <ChevronRight size={20} />
        </button>
        <p className="text-xs text-slate-400 font-medium mt-4">
          30-Day Money-Back Guarantee
        </p>
      </div>

      <div className="p-8 bg-slate-50">
        <h3 className="font-bold text-slate-900 mb-4">This course includes:</h3>
        <ul className="space-y-4">
          {[
            { icon: PlayCircle, text: "14.5 hours on-demand video" },
            { icon: Download, text: "22 downloadable resources & templates" },
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
  );
}
