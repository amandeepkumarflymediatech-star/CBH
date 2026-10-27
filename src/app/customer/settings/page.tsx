'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  Bell,
  Lock,
  Mail,
  Phone,
  MapPin,
  Save,
  CheckCircle2,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { getStoredUser, logout } from '@/lib/auth';

export default function CustomerSettingsPage() {
  const user = getStoredUser();
  const [companyName, setCompanyName] = useState(user?.companyName || 'Apex Infrastructure Corp');
  const [contactName, setContactName] = useState(user?.fullName || 'Rajesh Sharma');
  const [email, setEmail] = useState(user?.email || 'procurement@apexinfra.com');
  const [phone, setPhone] = useState('+91 98140 22345');
  const [gstin, setGstin] = useState(user?.gstin || '07AAAAA0000A1Z5');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Notification Preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsDispatchAlerts, setSmsDispatchAlerts] = useState(true);
  const [rfqQuotations, setRfqQuotations] = useState(true);
  const [creditAlerts, setCreditAlerts] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/customer"
              className="text-xs font-bold text-slate-500 hover:text-[#5B4DF6] flex items-center gap-1 no-underline"
            >
              <ArrowLeft size={13} />
              <span>Back to Overview</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-1">
            Enterprise Account Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your company procurement credentials, delivery site contacts, and billing notifications.
          </p>
        </div>

        <button
          type="button"
          onClick={() => logout('/')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition-colors cursor-pointer"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Company profile and notification preferences successfully updated.</span>
        </div>
      )}

      {/* Main Settings Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section: Company Profile */}
          <div>
            <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Building2 size={16} className="text-[#5B4DF6]" />
              <span>Company Information</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company Registered Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN (Verified)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] bg-slate-50 font-mono focus:outline-none focus:border-[#5B4DF6]"
                  />
                  <ShieldCheck size={16} className="text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Procurement Officer</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Work Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp Alerts</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#5B4DF6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Approved Credit Facility</label>
                <div className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] bg-slate-50 font-bold flex items-center justify-between">
                  <span>₹50,00,000 (30 Days Revolving)</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-extrabold">ACTIVE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Notification Preferences */}
          <div>
            <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Bell size={16} className="text-[#5B4DF6]" />
              <span>Real-Time Logistics &amp; RFQ Alerts</span>
            </h2>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">Fleet Dispatch &amp; Road LR Notifications</div>
                  <div className="text-[11px] text-slate-500">Receive instant SMS and email when transport truck departs factory</div>
                </div>
                <input
                  type="checkbox"
                  checked={smsDispatchAlerts}
                  onChange={(e) => setSmsDispatchAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#5B4DF6] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">Formal RFQ Quotations Ready</div>
                  <div className="text-[11px] text-slate-500">Get notified when CBH pricing team formalizes custom BOM quote</div>
                </div>
                <input
                  type="checkbox"
                  checked={rfqQuotations}
                  onChange={(e) => setRfqQuotations(e.target.checked)}
                  className="w-4 h-4 accent-[#5B4DF6] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">Credit Facility Utilization Warnings</div>
                  <div className="text-[11px] text-slate-500">Alerts when credit utilization exceeds 70% threshold</div>
                </div>
                <input
                  type="checkbox"
                  checked={creditAlerts}
                  onChange={(e) => setCreditAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#5B4DF6] rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/customer"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors no-underline"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#5B4DF6] hover:bg-[#4D3FF0] text-white shadow-sm transition-all cursor-pointer"
            >
              <Save size={14} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
