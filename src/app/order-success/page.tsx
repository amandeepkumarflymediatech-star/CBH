'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import MainHeader from '@/components/header/MainHeader';
import {
  CheckCircle2,
  Download,
  Truck,
  ArrowRight,
  ShieldCheck,
  FileText,
  Printer,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { formatINR } from '@/lib/rfq-calculator';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const txnId = searchParams.get('txnId') || searchParams.get('orderNumber') || `CBH-TXN-${Date.now()}`;
  const orderNumber = searchParams.get('orderNumber') || `CBH-ORD-${Date.now()}`;
  const amountStr = searchParams.get('amount') || '56935';
  const amount = parseFloat(amountStr) || 56935;
  const isSimulated = searchParams.get('simulated') === 'true';

  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Success Hero Card */}
      <div className="bg-white rounded-3xl border border-[#D8DFE7] p-8 sm:p-10 shadow-lg text-center relative overflow-hidden">
        {/* Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0052CC] via-[#5f259f] to-[#10B981]" />

        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-sm">
          <CheckCircle2 size={36} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5f259f]/10 text-[#5f259f] text-xs font-black mb-3">
          <Sparkles size={13} />
          <span>PhonePe Payment Settlement Confirmed</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
          Procurement Order Placed Successfully!
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mt-2 leading-relaxed">
          Your payment has been settled via PhonePe Gateway. Chemical and tensile metallurgical calibration for your order has begun at CBH Works (Ludhiana).
        </p>

        {isSimulated && (
          <div className="mt-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium max-w-md mx-auto">
            ⚡ PhonePe Sandbox Simulation Active: Test payment verified without debiting live bank account.
          </div>
        )}

        {/* Transaction Telemetry Pill */}
        <div className="mt-8 p-5 rounded-2xl bg-slate-50 border border-slate-200 max-w-xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4 text-left text-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Order ID</span>
            <span className="font-mono font-bold text-[#0F172A] break-all">{orderNumber}</span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Amount Settled</span>
            <span className="font-mono font-black text-[#0052CC] text-sm">{formatINR(amount)}</span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">PhonePe Reference</span>
            <div className="flex items-center gap-1 font-mono font-bold text-slate-700">
              <span className="truncate">{txnId.slice(0, 12)}...</span>
              <button
                type="button"
                onClick={() => handleCopy(txnId)}
                className="text-slate-400 hover:text-black"
                title="Copy Transaction ID"
              >
                {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        </div>

        {/* 5-Stage Freight Tracker */}
        <div className="mt-10 pt-8 border-t border-slate-100 text-left">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
              5-Stage Live Dispatch Telemetry
            </h3>
            <span className="text-xs font-bold text-[#0052CC]">Carrier: TCI Freight / Blue Dart</span>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center text-[10px] sm:text-xs">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto mb-1" />
              <span>1. Order Placed</span>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[#0052CC] font-bold">
              <div className="w-2 h-2 rounded-full bg-[#0052CC] mx-auto mb-1 animate-ping" />
              <span>2. Lab Testing</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 font-medium">
              <div className="w-2 h-2 rounded-full bg-slate-300 mx-auto mb-1" />
              <span>3. Dispatched</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 font-medium">
              <div className="w-2 h-2 rounded-full bg-slate-300 mx-auto mb-1" />
              <span>4. In Transit</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 font-medium">
              <div className="w-2 h-2 rounded-full bg-slate-300 mx-auto mb-1" />
              <span>5. Delivered</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/customer"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold flex items-center justify-center gap-2 shadow transition-colors"
          >
            <Truck size={16} />
            <span>Track Freight in Enterprise Portal</span>
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Printer size={16} />
            <span>Print Tax Invoice &amp; MTC</span>
          </button>

          <Link
            href="/products"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Return to Catalog</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <MainHeader unit="PCS" onUnitToggle={() => {}} cartCount={0} onOpenCart={() => {}} />
      <Suspense fallback={<div className="text-center py-20 text-xs font-bold">Verifying Settlement...</div>}>
        <OrderSuccessContent />
      </Suspense>
    </main>
  );
}
