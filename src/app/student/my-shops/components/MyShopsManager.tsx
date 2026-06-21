"use client";

import React, { useState } from "react";
import { Package, Search, ShoppingBag, Eye, Copy, Check, Mail, KeyRound, MessageCircle, Send, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useGetMyShopPurchasesQuery } from "@/lib/api/shopApi";

export default function MyShopsManager() {
  const { data: purchases, isLoading, isError } = useGetMyShopPurchasesQuery();
  const [search, setSearch] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState<any | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filteredPurchases = (purchases || []).filter((p: any) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-50/50 min-h-screen pb-10">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              My Purchased Shops
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Manage your purchased shop products and access credentials
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        {/* Search Bar */}
        <div className="mb-6 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 ml-2" />
          <input
            type="text"
            placeholder="Search purchased products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none"
          />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-white rounded-3xl border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
            <p className="text-red-500 font-semibold">Failed to load purchases</p>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No Purchases Found</h3>
            <p className="text-sm text-slate-500 mt-1">You haven't purchased any shop items yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPurchases.map((p: any) => (
              <div key={p.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {p.purchaseStatus === "completed" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    )}
                    {p.purchaseStatus === "pending" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-md uppercase tracking-wider">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                    {p.purchaseStatus === "failed" || p.purchaseStatus === "rejected" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-1 rounded-md uppercase tracking-wider">
                        <XCircle className="w-3 h-3" /> {p.purchaseStatus}
                      </span>
                    ) : null}
                    
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(p.purchasedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-[15px] font-bold text-slate-900 line-clamp-1 mb-1">{p.name}</h3>
                <p className="text-[13px] font-semibold text-slate-500 mb-4 line-clamp-2 flex-1">
                  {p.description || "No description provided."}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedPurchase(p)}
                    className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold transition-colors flex items-center justify-center gap-2 border border-slate-200"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedPurchase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{selectedPurchase.name}</h3>
              <p className="text-sm text-slate-500 mb-6 pb-6 border-b border-slate-100">
                {selectedPurchase.description || "No description available."}
              </p>

              {selectedPurchase.purchaseStatus !== "completed" ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm font-medium">
                  Your purchase is currently {selectedPurchase.purchaseStatus}. Credentials or access links will be available once the purchase is completed.
                </div>
              ) : selectedPurchase.type === "instant" ? (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Access Credentials</h4>
                  
                  {selectedPurchase.gmail && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                        <Mail size={12} /> Email/Username
                      </label>
                      <div className="flex items-center justify-between gap-3">
                        <code className="text-[13px] font-semibold text-slate-800 break-all">{selectedPurchase.gmail}</code>
                        <button 
                          onClick={() => handleCopy(selectedPurchase.gmail, 'gmail')}
                          className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors flex-shrink-0"
                        >
                          {copiedField === 'gmail' ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-slate-400" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedPurchase.password && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                        <KeyRound size={12} /> Password
                      </label>
                      <div className="flex items-center justify-between gap-3">
                        <code className="text-[13px] font-semibold text-slate-800 break-all">{selectedPurchase.password}</code>
                        <button 
                          onClick={() => handleCopy(selectedPurchase.password, 'password')}
                          className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors flex-shrink-0"
                        >
                          {copiedField === 'password' ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-slate-400" />}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {!selectedPurchase.gmail && !selectedPurchase.password && (
                    <p className="text-sm text-slate-500">No credentials attached to this purchase.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Seller</h4>
                  <p className="text-sm text-slate-600">Please contact the seller via the links below to receive your product.</p>
                  
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {selectedPurchase.whatsapp ? (
                      <a 
                        href={`https://wa.me/${selectedPurchase.whatsapp.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold rounded-xl transition-colors text-sm"
                      >
                        <MessageCircle size={16} /> WhatsApp
                      </a>
                    ) : null}
                    
                    {selectedPurchase.telegram ? (
                      <a 
                        href={`https://t.me/${selectedPurchase.telegram.replace('@', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#229ED9] hover:bg-[#1C8CC0] text-white font-bold rounded-xl transition-colors text-sm"
                      >
                        <Send size={16} /> Telegram
                      </a>
                    ) : null}
                  </div>

                  {!selectedPurchase.whatsapp && !selectedPurchase.telegram && (
                    <div className="p-3 bg-orange-50 text-orange-800 text-sm rounded-xl border border-orange-200">
                      The seller hasn't provided contact details.
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setSelectedPurchase(null)}
                className="mt-8 w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors text-sm shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
