'use client';

import React from 'react';
import Link from 'next/link';
import { Smartphone, ShieldCheck, Truck, Zap, QrCode, ArrowRight, Download, Package, Layers } from 'lucide-react';

export default function MobilePage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans flex flex-col justify-between p-6 sm:p-12">
      <div className="max-w-4xl mx-auto w-full space-y-10 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0052CC] to-[#003685] flex items-center justify-center font-black text-xl shadow-lg shadow-blue-900/40">
              CBH
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">CBH Fasteners Mobile Terminal</h1>
              <p className="text-xs text-slate-400">Android &amp; iOS Touch-First Industrial Procurement Client</p>
            </div>
          </div>

          <Link
            href="/products"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            Open Web Catalog
          </Link>
        </div>

        {/* Hero Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
              <Smartphone size={14} />
              <span>Mobile Architecture Ready</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Factory Dispatch &amp; Live Procurement in Your Pocket
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Native touch-first experience featuring real-time lorry LR docket tracking, NABL 3.1 Mill Test Certificate vault, instant PhonePe settlement, and RFQ generation.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/customer"
                className="px-5 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2"
              >
                <span>Customer Mobile Web</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                href="/admin"
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-2"
              >
                <span>Admin Mobile Console</span>
              </Link>
            </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs space-y-4 font-mono">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span>NATIVE_CLIENT_SPEC</span>
              <span className="text-emerald-400">BUILD_READY</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Platform:</span>
                <span>React Native / Android SDK 34</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">APIs:</span>
                <span>Live Next.js 14 REST Endpoints</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Local Build:</span>
                <span className="text-blue-400">npm run android</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Package:</span>
                <span>com.cbhmobile</span>
              </div>
            </div>

            <div className="p-3 bg-blue-950/40 border border-blue-900/50 rounded-xl text-[11px] text-blue-300 font-sans">
              To launch the native Android simulator or build APK, run:
              <code className="block mt-1 font-mono text-white bg-slate-900 p-2 rounded">
                npm --prefix mobile run android
              </code>
            </div>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <Truck className="w-5 h-5 text-indigo-400 mb-2" />
            <h4 className="font-bold text-white mb-1">Live Freight Dispatch</h4>
            <p className="text-slate-400 text-[11px]">Direct tracking for TCI Express, Gati, and V-Trans consignments.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
            <h4 className="font-bold text-white mb-1">NABL 3.1 MTC Vault</h4>
            <p className="text-slate-400 text-[11px]">Instant download and QR validation of mill chemical heat reports.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <Zap className="w-5 h-5 text-amber-400 mb-2" />
            <h4 className="font-bold text-white mb-1">Rapid RFQ Calculator</h4>
            <p className="text-slate-400 text-[11px]">Wholesale slab tariff generator with real-time steel index pricing.</p>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 pt-6">
        CBH Fasteners &copy; {new Date().getFullYear()} • Enterprise B2B Fastener E-Commerce Platform
      </div>
    </div>
  );
}
