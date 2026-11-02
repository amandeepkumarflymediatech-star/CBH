'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, Phone, FileSpreadsheet, ShieldCheck, Truck, ArrowRight, MessageCircle } from 'lucide-react';

export default function SimpleHowItWorks() {
  return (
    <section className="py-12 bg-slate-50 border-b border-slate-200" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <span>HOW TO ORDER // ऑर्डर करना बेहद आसान है</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Order in 3 Simple Steps <span className="text-emerald-700">(केवल 3 सरल कदम)</span>
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            No technical knowledge or engineering jargon required. Order online or simply send your handwritten list or fastener photo on WhatsApp.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Step 1 */}
          <div className="bg-white border-2 border-slate-200 hover:border-[#0052CC] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all relative">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#0052CC] flex items-center justify-center font-black text-lg mb-4">
              1
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
              Choose or Send Photo
            </h3>
            <span className="text-xs font-bold text-[#0052CC] block mb-2">
              सामान चुनें या फोटो भेजें
            </span>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Browse our catalog online, OR take a picture of your sample bolt / handwritten paper list with your phone and send it on WhatsApp.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <Camera size={14} className="text-[#0052CC]" />
              <span>Mobile Photo / Paper List Accepted</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white border-2 border-slate-200 hover:border-[#FF6B00] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all relative">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center font-black text-lg mb-4">
              2
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
              Get Factory Wholesale Rate
            </h3>
            <span className="text-xs font-bold text-orange-700 block mb-2">
              तुरंत फैक्टरी रेट पाएं
            </span>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Zero middlemen markups. Our team checks real-time inventory and sends you the lowest mill-direct rate per Kg or Piece in 15 minutes.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <ShieldCheck size={14} className="text-[#FF6B00]" />
              <span>Transparent Price per Kg / Pc</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white border-2 border-slate-200 hover:border-emerald-600 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg mb-4">
              3
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
              Fast Doorstep Delivery
            </h3>
            <span className="text-xs font-bold text-emerald-700 block mb-2">
              सीधे आपकी दुकान या साइट पर डिलीवरी
            </span>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dispatched within 24-48 hours anywhere in India via trusted fleet. Comes with genuine GST invoice and NABL 3.1 test certificate.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <Truck size={14} className="text-emerald-600" />
              <span>Pan-India 24-48 Hr Dispatch</span>
            </div>
          </div>

        </div>

        {/* WhatsApp & Call Direct Help Banner */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0A192F] rounded-2xl p-5 sm:p-7 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 border border-white/10">
          
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <MessageCircle size={28} />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-1">
                <span>EASY WHATSAPP ORDERING // साइज नहीं पता?</span>
              </div>
              <h3 className="text-base sm:text-xl font-extrabold text-white">
                Don&apos;t know the exact size? Just WhatsApp a photo!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                पुराने नट-बोल्ट की फोटो या पर्ची खींचकर <strong>+91 98880 21000</strong> पर भेजें। हमारे इंजीनियर 5 मिनट में सही साइज और सबसे सस्ता फैक्टरी रेट बता देंगे।
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
            <a
              href="https://wa.me/919888021000?text=Hi%20CBH%20Fasteners,%20I%20am%20sending%20a%20photo/list%20of%20fasteners%20I%20need.%20Please%20give%20me%20the%20wholesale%20rate."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-xs sm:text-sm shadow-lg transition-all active:scale-95"
            >
              <MessageCircle size={18} />
              <span>Send Photo on WhatsApp</span>
            </a>

            <a
              href="tel:+919888021000"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all"
            >
              <Phone size={16} />
              <span>Call +91 98880 21000</span>
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}

