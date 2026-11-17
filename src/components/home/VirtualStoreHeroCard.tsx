'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Box, ArrowRight, CheckCircle2, Cpu, Sparkles } from 'lucide-react';

export default function VirtualStoreHeroCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg hover:shadow-xl transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between">
      {/* 1. Header: Live Status & Digital Twin Tag */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0052CC] font-mono text-xs font-extrabold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>3D VIRTUAL STORE</span>
          </span>
          {/* <span className="hidden sm:inline-block text-[11px] font-mono text-slate-500 font-semibold">
            Bhiwandi Hub
          </span> */}
        </div>

        <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          54,000+ In Stock
        </span>
      </div>

      {/* 2. Visual Preview Window (Clickable into 3D Store) */}
      <Link
        href="/virtual-store"
        className="relative w-full h-52 sm:h-56 rounded-xl overflow-hidden bg-slate-900 block group border border-slate-200/80 shadow-inner no-underline cursor-pointer mb-4"
      >
        <Image
          src="/assets/hero.jpg"
          alt="CBH 3D Virtual Depot"
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />

        {/* Top-Right 60 FPS Badge */}
        <div className="absolute top-3 right-3 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white font-mono text-[10px] font-bold flex items-center gap-1 shadow-sm">
            <Sparkles size={11} className="text-amber-400" />
            <span>Interactive 3D</span>
          </span>
        </div>

        {/* Bottom Banner */}
        {/* <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200 shadow-md flex items-center justify-between text-slate-900">
            <div className="flex items-center gap-2">
              <Box size={16} className="text-[#0052CC]" />
              <span className="text-xs font-black">40,000 Sq.Ft Bhiwandi Mega-Depot</span>
            </div>
            <span className="text-[11px] font-bold text-[#FF6B00] flex items-center gap-1">
              <span>EXPLORE</span>
              <ArrowRight size={12} />
            </span>
          </div>
        </div> */}
      </Link>

      {/* 3. Title & Description */}
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
          Walk Through Our Fastener Depot in 3D
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
          Navigate 8 warehouse racking bays, inspect cold-forged bolts in 3D CAD, and request wholesale mill rates directly from the racks.
        </p>
      </div>

      {/* 4. Simple Clean Bullet Points */}
      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-2.5 text-xs text-slate-700">
          <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
          <span><strong>8 Pallet Racking Bays:</strong> Hex Bolts, Screws, HSFG & Anchors</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-slate-700">
          <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
          <span><strong>3D CAD Inspector:</strong> Exploded view assembly of nuts & washers</span>
        </div>
       
      </div>

      {/* 5. Clean Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <Link
          href="/virtual-store"
          className="flex-1 py-3 px-4 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all no-underline text-center cursor-pointer"
        >
          <Box size={16} />
          <span>Enter 3D Virtual Depot </span>
          <ArrowRight size={14} />
        </Link>

        {/* <Link
          href="/virtual-store?mode=inspector"
          className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors no-underline text-center cursor-pointer border border-slate-200"
        >
          <Cpu size={15} className="text-[#0052CC]" />
          <span>CAD Inspector</span>
        </Link> */}
      </div>
    </div>
  );
}
