"use client";

import React, { useMemo, useState } from "react";
import { CreditCard, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useGetAffiliatePaymentMethodsQuery,
  useCreateAffiliatePaymentMethodMutation,
} from "@/lib/api/affiliateApi";

export default function AffiliatePaymentMethodsPage() {
  const { data: methodsData, isLoading: methodsLoading, isError } = useGetAffiliatePaymentMethodsQuery();
  const [createMethod, { isLoading: isCreating }] = useCreateAffiliatePaymentMethodMutation();

  const [createType, setCreateType] = useState<string>("zinipay");
  const [accountNumber, setAccountNumber] = useState("");
  const [nameOnAccount, setNameOnAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");

  const methodsList = useMemo(() => {
    if (!methodsData) return [];
    if (Array.isArray(methodsData)) return methodsData;
    if (Array.isArray(methodsData?.items)) return methodsData.items;
    if (Array.isArray(methodsData?.data)) return methodsData.data;
    return [];
  }, [methodsData]);

  const canSubmit = accountNumber.trim().length > 0 && nameOnAccount.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const toastId = toast.loading("Submitting payment method...");

    try {
      const payload: any = {
        type: createType,
        accountNumber,
        accountHolderName: nameOnAccount,
      };

      if (createType === "bank") {
        payload.bankName = bankName;
        payload.branchName = branchName;
      }

      await createMethod(payload).unwrap();
      toast.success("Payment method added successfully!", { id: toastId });

      setAccountNumber("");
      setNameOnAccount("");
      setBankName("");
      setBranchName("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add payment method", { id: toastId });
    }
  };

  if (methodsLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-zinc-500">Loading payment methods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1 sm:p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white leading-none">Payment Methods</h2>
          <p className="text-xs text-zinc-400 mt-1.5">Setup ZiniPay, Nagad, or Bank Account details for commission payouts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Creation Form */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-black text-zinc-900 dark:text-white">Add Payout Method</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Please provide correct account details.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Account Type</label>
              <select
                value={createType}
                onChange={(e) => setCreateType(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm font-bold text-zinc-800 dark:text-zinc-200 outline-none focus:border-blue-500"
              >
                <option value="zinipay">ZiniPay</option>
                <option value="nagad">Nagad</option>
                <option value="bank">Bank Account</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {createType === "bank" ? "Account Number" : "Wallet / Phone Number"}
              </label>
              <input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={createType === "bank" ? "e.g. 123456789012" : "e.g. 017XXXXXXXX"}
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Name on Account</label>
              <input
                value={nameOnAccount}
                onChange={(e) => setNameOnAccount(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-blue-500"
              />
            </div>

            {createType === "bank" && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Bank Name</label>
                  <input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Dutch Bangla Bank"
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Branch Name</label>
                  <input
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="e.g. Mirpur Branch"
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-blue-500"
                  />
                </div>
              </>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isCreating}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 text-white py-3 text-sm font-bold disabled:opacity-60 disabled:pointer-events-none hover:brightness-105 transition"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>Submit Method</>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: List Table */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-base font-black text-zinc-900 dark:text-white mb-4">Payout Accounts</h3>

          {methodsList.length === 0 ? (
            <div className="text-center py-14 text-sm text-zinc-400 font-semibold">
              No payout methods configured yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-100 dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-950">
                  <tr>
                    {["Type", "Account", "Owner", "Status"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {methodsList.map((m: any, idx: number) => {
                    const status = String(m?.status ?? "pending").toLowerCase();
                    return (
                      <tr key={m.id ?? idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/30 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            m.type === "bank"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-pink-50 text-pink-700 border-pink-200"
                          }`}>
                            {String(m.type).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                          {m.accountNumber || m.account || "—"}
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                          {m.accountHolderName || "—"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            status === "approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : status === "rejected"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
