'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  Bell,
  Mail,
  Phone,
  Save,
  CheckCircle2,
  LogOut,
  Settings,
  Loader2
} from 'lucide-react';
import { getStoredUser, setStoredUser, logout, AuthUser } from '@/lib/auth';
import { showToast } from '@/lib/swal';

export default function CustomerSettingsPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Notification Preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsDispatchAlerts, setSmsDispatchAlerts] = useState(true);
  const [rfqQuotations, setRfqQuotations] = useState(true);
  const [creditAlerts, setCreditAlerts] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);
    if (user) {
      setCompanyName(user.companyName || '');
      setContactName(user.fullName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setGstin(user.gstin || '');
      setAddress(user.address || '');

      if (user.notificationPreferences) {
        setEmailAlerts(user.notificationPreferences.emailAlerts ?? true);
        setSmsDispatchAlerts(user.notificationPreferences.smsDispatchAlerts ?? true);
        setRfqQuotations(user.notificationPreferences.rfqQuotations ?? true);
        setCreditAlerts(user.notificationPreferences.creditAlerts ?? true);
      }
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = getStoredUser() || currentUser;
    if (!user) return;

    setIsSaving(true);
    const notificationPreferences = {
      emailAlerts,
      smsDispatchAlerts,
      rfqQuotations,
      creditAlerts,
    };

    const updatedUser: AuthUser = {
      ...user,
      fullName: contactName.trim(),
      companyName: companyName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      gstin: gstin.trim().toUpperCase(),
      address: address.trim(),
      notificationPreferences,
    };

    setStoredUser(updatedUser);
    setCurrentUser(updatedUser);

    if (user.id) {
      try {
        await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.id,
            fullName: updatedUser.fullName,
            companyName: updatedUser.companyName,
            email: updatedUser.email,
            phone: updatedUser.phone,
            gstin: updatedUser.gstin,
            address: updatedUser.address,
            notificationPreferences,
          }),
        });
      } catch (err) {
        console.warn('Backend sync failed:', err);
      }
    }

    setIsSaving(false);
    setSavedSuccess(true);
    showToast('Company profile & preferences updated!', 'success');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const creditLimitFormatted = Number(currentUser?.creditLimit || 2500000).toLocaleString('en-IN');

  return (
    <div className="space-y-4 max-w-[1100px] mx-auto">
      {/* Sleek Single-Viewport Top Ops Bar */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
            <Settings size={18} />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-[#0F172A] leading-tight flex items-center gap-2">
              <span>Enterprise Account Settings</span>
              <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                Active Client
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Corporate credentials, delivery notification channels, and revolving credit ledger alerts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={() => logout('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-xs animate-in fade-in">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <span>Company profile and notification preferences successfully updated.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column (7 Cols): Company Info */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
            <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <Building2 size={14} className="text-[#5B4DF6]" />
              <span>Company Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Company Registered Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">GSTIN</label>
                <div className="relative">
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0F172A] bg-slate-50 font-mono focus:outline-none focus:border-[#5B4DF6]"
                  />
                  <ShieldCheck size={14} className="text-emerald-600 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Credit Facility</label>
                <div className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0F172A] bg-slate-50 font-bold flex items-center justify-between">
                  <span>₹{creditLimitFormatted}</span>
                  <span className="text-[9px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-extrabold">
                    NET-30
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Procurement Officer</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Official Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Phone / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#5B4DF6]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Commercial Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column (5 Cols): Real-time Logistics & Alerts */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <Bell size={14} className="text-[#5B4DF6]" />
                <span>Logistics &amp; RFQ Alerts</span>
              </h2>

              <div className="space-y-2.5">
                <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <div className="pr-3">
                    <div className="text-xs font-bold text-[#0F172A]">Fleet Dispatch &amp; Road LR</div>
                    <div className="text-[10px] text-slate-500">Instant SMS &amp; email when transporter leaves plant</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsDispatchAlerts}
                    onChange={(e) => setSmsDispatchAlerts(e.target.checked)}
                    className="w-4 h-4 accent-[#5B4DF6] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <div className="pr-3">
                    <div className="text-xs font-bold text-[#0F172A]">Formal RFQ Quotations</div>
                    <div className="text-[10px] text-slate-500">Alerts when CBH engineering formalizes custom quote</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={rfqQuotations}
                    onChange={(e) => setRfqQuotations(e.target.checked)}
                    className="w-4 h-4 accent-[#5B4DF6] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <div className="pr-3">
                    <div className="text-xs font-bold text-[#0F172A]">Credit Facility Utilization</div>
                    <div className="text-[10px] text-slate-500">Alerts when credit utilization crosses 75% limit</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={creditAlerts}
                    onChange={(e) => setCreditAlerts(e.target.checked)}
                    className="w-4 h-4 accent-[#5B4DF6] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <div className="pr-3">
                    <div className="text-xs font-bold text-[#0F172A]">Email Invoices &amp; MTCs</div>
                    <div className="text-[10px] text-slate-500">Send signed PDF certificates on order generation</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 accent-[#5B4DF6] rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Link
                href="/customer"
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors no-underline"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-[#5B4DF6] hover:bg-[#4D3FF0] text-white shadow-xs transition-all cursor-pointer"
              >
                {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
