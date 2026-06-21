"use client";

import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { useGetSettingsQuery, useUpdateSettingMutation } from "@/lib/api/admin/settings";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: settings, isLoading, refetch } = useGetSettingsQuery();
  const [updateSetting, { isLoading: isUpdating }] = useUpdateSettingMutation();

  const [zinipayKey, setZinipayKey] = useState("");

  useEffect(() => {
    if (settings) {
      const ziniKey = settings.find((s) => s.key === "ZINIPAY_API_KEY");
      if (ziniKey) setZinipayKey(ziniKey.value || "");
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSetting({ key: "ZINIPAY_API_KEY", value: zinipayKey }).unwrap();
      toast.success("Settings saved successfully!");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save settings");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p className="text-gray-500 font-medium animate-pulse">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
              <SettingsIcon size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-[22px] font-black text-gray-900 tracking-tight">
                System Settings
              </h1>
              <p className="text-sm text-gray-500 mt-1 leading-tight">
                Manage your payment gateways, API keys, and global configurations.
              </p>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <form onSubmit={handleSave} className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Payment Gateway (Zinipay)</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Zinipay API Key
                </label>
                <input
                  type="text"
                  value={zinipayKey}
                  onChange={(e) => setZinipayKey(e.target.value)}
                  placeholder="Enter your ZiniPay API Key..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This key is used to authenticate with the ZiniPay payment gateway for all transactions.
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] text-white text-sm font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
