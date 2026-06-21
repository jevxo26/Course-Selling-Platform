"use client";

import { CheckCircle, Copy, Check, Mail, KeyRound, MessageCircle, Send } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { useGetShopPurchaseDetailsQuery } from '@/lib/api/shopApi';
import { Suspense, useState } from 'react';

function ShopPurchaseSuccess({ purchaseId }: { purchaseId: number }) {
  const { data: purchase, isLoading, isError } = useGetShopPurchaseDetailsQuery(purchaseId);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (isLoading) {
    return <div className="text-sm text-slate-500 animate-pulse mt-4">Loading purchase details...</div>;
  }

  if (isError || !purchase) {
    return <div className="text-sm text-red-500 mt-4">Failed to load purchase details. Please check your dashboard.</div>;
  }

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="mt-6 text-left border-t border-slate-100 pt-6">
      <h3 className="font-bold text-lg text-slate-900 mb-4">Your Product Details</h3>
      
      {purchase.type === 'instant' ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 mb-2">Here are your access credentials for <strong>{purchase.name}</strong>:</p>
          
          {purchase.gmail && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Mail size={12} /> Email/Username
              </label>
              <div className="flex items-center justify-between gap-3">
                <code className="text-sm font-semibold text-slate-800 break-all">{purchase.gmail}</code>
                <button 
                  onClick={() => handleCopy(purchase.gmail, 'gmail')}
                  className="p-1.5 hover:bg-slate-200 rounded-md transition-colors"
                  title="Copy email"
                >
                  {copiedField === 'gmail' ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-slate-400" />}
                </button>
              </div>
            </div>
          )}

          {purchase.password && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <KeyRound size={12} /> Password
              </label>
              <div className="flex items-center justify-between gap-3">
                <code className="text-sm font-semibold text-slate-800 break-all">{purchase.password}</code>
                <button 
                  onClick={() => handleCopy(purchase.password, 'password')}
                  className="p-1.5 hover:bg-slate-200 rounded-md transition-colors"
                  title="Copy password"
                >
                  {copiedField === 'password' ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-slate-400" />}
                </button>
              </div>
            </div>
          )}

          {purchase.description && (
            <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Instructions</h4>
              <p className="text-sm text-blue-900 whitespace-pre-wrap">{purchase.description}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 mb-4">
            You have successfully purchased <strong>{purchase.name}</strong>. Please contact the seller to receive your product manually using the links below.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {purchase.whatsapp && (
              <a 
                href={`https://wa.me/${purchase.whatsapp.replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold rounded-xl transition-colors"
              >
                <MessageCircle size={18} />
                WhatsApp
              </a>
            )}
            
            {purchase.telegram && (
              <a 
                href={`https://t.me/${purchase.telegram.replace('@', '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#229ED9] hover:bg-[#1C8CC0] text-white font-bold rounded-xl transition-colors"
              >
                <Send size={18} />
                Telegram
              </a>
            )}
          </div>
          
          {(!purchase.whatsapp && !purchase.telegram) && (
            <div className="p-4 bg-orange-50 text-orange-800 text-sm rounded-xl border border-orange-200">
              The seller hasn't provided contact details. Please check your email or contact support.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const purchaseId = searchParams.get('purchaseId');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-950">
      <div className="max-w-xl w-full bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl text-center border border-gray-100 dark:border-gray-800">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
        </div>
        
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Payment Successful!
        </h2>
        
        {type === 'shop' && purchaseId ? (
          <ShopPurchaseSuccess purchaseId={parseInt(purchaseId)} />
        ) : (
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Thank you for your purchase. Your transaction has been completed successfully and your content is now available.
          </p>
        )}
        
        <div className="pt-8">
          <Link href="/student" className="block w-full">
            <Button size="lg" className="w-full h-12 text-[15px] font-bold rounded-xl">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
