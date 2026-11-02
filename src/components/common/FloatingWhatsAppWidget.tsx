'use client';

import React, { useState } from 'react';
import { MessageCircle, Phone, X, HelpCircle } from 'lucide-react';

export default function FloatingWhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside aria-label="Customer Support Assistant" className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[999] flex flex-col items-end pointer-events-auto">
      {/* Popover Card */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[#0052CC] to-[#0A192F] p-4 text-white relative">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-white/70 hover:text-white p-1"
              aria-label="Close assistance dialog"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                <MessageCircle size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">CBH Support Desk</h3>
                <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Engineers Online
                </span>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 bg-slate-50 space-y-3">
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              नमस्ते! Need help with nut-bolt sizing, prices, or ordering? Send us a message or photo on WhatsApp.
            </p>

            <a
              href="https://wa.me/919888021000?text=Hi%20CBH%20Fasteners,%20I%20need%20help%20with%20fasteners/nuts/bolts."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <MessageCircle size={16} />
              <span>Chat on WhatsApp (व्हाट्सएप करें)</span>
            </a>

            <a
              href="tel:+919888021000"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs transition-colors"
            >
              <Phone size={15} className="text-[#0052CC]" />
              <span>Call Helpline: +91 98880 21000</span>
            </a>
          </div>

          <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 font-semibold">
              Instant quote in 15 minutes • All India delivery
            </span>
          </div>
        </div>
      )}

      {/* Floating Action Pill / Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-4 py-3 sm:px-4 sm:py-3 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-white"
          title="Instant WhatsApp & Call Help"
          aria-label="Instant WhatsApp & Call Help"
        >
          <MessageCircle size={22} className="animate-bounce" />
          <span className="font-extrabold text-xs sm:text-sm tracking-wide">
            Need Help? WhatsApp Us
          </span>
        </button>
      </div>
    </aside>
  );
}

