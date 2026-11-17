'use client';

import React from 'react';
import {
  Headset,
  Phone,
  Mail,
  MessageCircle,
  Camera,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function ConsultationBar() {
  return (
    <section className="relative my-10 sm:my-14 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-700/80 shadow-2xl overflow-hidden p-6 sm:p-8 lg:p-10">
      {/* Background ambient lighting effects */}
      <div
        className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Column (7 cols on lg): Headline, Bilingual explanation, Trust Tags */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5">
          {/* Live Helpline Eyebrow Badge */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-bold tracking-wide">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 font-extrabold uppercase text-[11px]">
              Live Application Engineers Online
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-300 font-mono text-[11px] hidden sm:inline">
              Fastener Sizing &amp; Pricing Helpline
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Need Help Finding the Right Bolt, Nut or Price?
            </h3>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              <span className="text-amber-400 font-semibold block sm:inline sm:mr-1">
                साइज, थ्रेड पिच या टेन्साइल ग्रेड समझ नहीं आ रहा?
              </span>
              Call our technical engineers directly or send a photo of your sample bolt / BOQ list on WhatsApp for an instant wholesale rate.
            </p>
          </div>

          {/* Capabilities & Speed Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-200 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl font-medium">
              <Camera size={14} className="text-emerald-400 shrink-0" />
              <span>WhatsApp Sample Photo Match</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-200 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl font-medium">
              <Clock size={14} className="text-amber-400 shrink-0" />
              <span>&lt; 2-Minute Response</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-200 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl font-medium">
              <FileSpreadsheet size={14} className="text-blue-400 shrink-0" />
              <span>Excel BOM / PDF Intake</span>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols on lg): Interactive Direct Channels */}
        <div className="lg:col-span-5 flex flex-col gap-3 sm:gap-3.5">
          {/* 1. WhatsApp Button (Primary High-Impact Action) */}
          <a
            href="https://wa.me/919888021000?text=Hi%20CBH%20Fasteners,%20I%20am%20sending%20a%20photo%20of%20the%20fasteners%20I%20need.%20Please%20help%20me%20with%20rates."
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-lg shadow-emerald-950/40 transition-all duration-200 hover:-translate-y-0.5 no-underline"
            title="Send bolt photo on WhatsApp (+91 98880 21000)"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <MessageCircle size={22} className="text-white" />
              </div>
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-100">
                    WhatsApp Help Desk
                  </span>
                  <span className="text-[10px] bg-white/25 px-1.5 py-0.2 rounded font-bold">
                    FASTEST
                  </span>
                </div>
                <div className="text-sm sm:text-base font-black text-white font-mono leading-tight mt-0.5">
                  +91 98880 21000
                </div>
                <div className="text-[11px] text-emerald-50 truncate mt-0.5">
                  फोटो भेजें • Photo / BOM Direct Order
                </div>
              </div>
            </div>
            <ArrowRight size={18} className="text-white shrink-0 group-hover:translate-x-1 transition-transform ml-2" />
          </a>

          {/* 2. Direct Call Helpline */}
          <a
            href="tel:+919888021000"
            className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-white border border-slate-700 shadow-md transition-all duration-200 hover:-translate-y-0.5 no-underline"
            title="Call Direct Helpline (+91 98880 21000)"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Phone size={20} />
              </div>
              <div className="min-w-0 text-left">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Application Engineering Call Desk
                </span>
                <div className="text-sm sm:text-base font-black text-white font-mono leading-tight mt-0.5">
                  +91 98880 21000
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  सीधे बात करें • Mon-Sat 9:00 AM - 8:00 PM IST
                </div>
              </div>
            </div>
            <ArrowRight size={18} className="text-slate-400 shrink-0 group-hover:text-white group-hover:translate-x-1 transition-all ml-2" />
          </a>

          {/* 3. Technical RFQ & CAD Email Desk */}
          <a
            href="mailto:sales@capitalbolts.co"
            className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 text-slate-200 border border-slate-700/60 shadow-xs transition-all duration-200 hover:-translate-y-0.5 no-underline"
            title="Email Drawings to sales@capitalbolts.co"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Mail size={20} />
              </div>
              <div className="min-w-0 text-left">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Technical Drawings &amp; Large Tenders
                </span>
                <div className="text-xs sm:text-sm font-bold text-slate-100 font-mono leading-tight mt-0.5 truncate">
                  sales@capitalbolts.co
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  Submit 2D/3D CAD, DWG &amp; Mill Cert Requirements
                </div>
              </div>
            </div>
            <ArrowRight size={18} className="text-slate-400 shrink-0 group-hover:text-white group-hover:translate-x-1 transition-all ml-2" />
          </a>
        </div>
      </div>
    </section>
  );
}
