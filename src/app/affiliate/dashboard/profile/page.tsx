"use client";

import React from "react";
import { User, ShieldCheck } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export default function AffiliateProfilePage() {
  const authUser = useSelector((state: RootState) => state.auth.user);

  const displayName = String(
    authUser?.name ?? authUser?.fullName ?? authUser?.username ?? "Affiliate"
  ).trim();
  const email = String(authUser?.email ?? "affiliate@example.com").trim();
// sdfwe
  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          My Profile
        </h1>
        
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-md shrink-0 border-4 border-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">
                {displayName}
              </h2>
              <p className="text-slate-500 font-medium">{email}</p>
              
              <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-2">
                <ShieldCheck className="w-4 h-4" />
                Affiliate Account
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-500 text-center">
              Profile settings and updates will be available soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
