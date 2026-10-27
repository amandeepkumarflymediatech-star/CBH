'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  CheckCircle2,
  LogOut,
  ArrowLeft,
  Camera,
  Award,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { getStoredUser, logout } from '@/lib/auth';

export default function CustomerProfilePage() {
  const user = getStoredUser();

  // Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || 'Rajesh Sharma');
  const [designation, setDesignation] = useState('Senior VP Procurement & Supply Chain');
  const [email, setEmail] = useState(user?.email || 'procurement@apexinfra.com');
  const [phone, setPhone] = useState('+91 98140 22345');
  const [altPhone, setAltPhone] = useState('+91 11 4059 8800');
  const [companyName, setCompanyName] = useState(user?.companyName || 'Apex Infrastructure Corp');
  const [gstin, setGstin] = useState(user?.gstin || '07AAAAA0000A1Z5');
  const [pan, setPan] = useState('AAACA1234D');
  const [tan, setTan] = useState('DELA98765E');
  const [msme, setMsme] = useState('UDYAM-DL-03-0019284');
  const [address, setAddress] = useState('Tower B, 7th Floor, Cyber City, DLF Phase II, Gurugram, Haryana - 122002');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification / Toast
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/customer"
              className="text-xs font-bold text-slate-500 hover:text-[#5B4DF6] flex items-center gap-1 no-underline"
            >
              <ArrowLeft size={13} />
              <span>Back to Customer Overview</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-1">
            Enterprise Client Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your verified company identity, authorized signatory profile, and revolving procurement facility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/customer/sites"
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors no-underline flex items-center gap-1.5"
          >
            <MapPin size={13} className="text-[#5B4DF6]" />
            <span>Delivery Sites</span>
          </Link>
          <button
            type="button"
            onClick={() => logout('/')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-2.5 text-xs font-bold shadow-xs animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Profile credentials and enterprise authorizations successfully updated!</span>
        </div>
      )}

      {/* Main Grid: Left Column (Profile & Company) + Right Column (Credit & Credentials) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Avatar Card + Credit Summary */}
        <div className="space-y-6">
          {/* Identity Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-[#5B4DF6] to-[#7B73FF]" />

            <div className="relative pt-6">
              {/* Avatar Upload with live preview */}
              <div className="relative inline-block mx-auto mb-3">
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#5B4DF6] text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-[#4D3FF0] transition-colors"
                  title="Upload New Photo"
                >
                  <Camera size={14} />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              <h2 className="text-lg font-black text-[#0F172A]">{fullName}</h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{designation}</p>
              <div className="text-xs font-bold text-[#5B4DF6] mt-1">{companyName}</div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-extrabold border border-amber-200 flex items-center gap-1">
                  ⭐ VIP TIER • 8% REBATE
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck size={13} /> GST Verified
                </span>
              </div>
            </div>
          </div>

          {/* Approved Credit Facility Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={15} className="text-[#5B4DF6]" />
                <span>Procurement Credit</span>
              </span>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                AAA RATED
              </span>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-bold uppercase">Available Balance</div>
              <div className="text-2xl font-black text-[#0F172A] font-mono mt-0.5">₹37,50,000</div>
            </div>

            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#5B4DF6] to-emerald-500 h-full w-[25%]" />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Utilized: ₹12.50L (25%)</span>
                <span>Limit: ₹50.00L</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>Payment Terms:</span>
                <strong className="text-[#0F172A]">30-Day Revolving Net</strong>
              </div>
              <div className="flex justify-between">
                <span>Direct Mill Rebate:</span>
                <strong className="text-emerald-600">8% on invoices &gt; ₹5L</strong>
              </div>
              <div className="flex justify-between">
                <span>Key Account Manager:</span>
                <strong className="text-[#0F172A]">Harpreet Singh (CBH)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Editable Profile & Company Details */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Officer Information Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 pb-3 border-b border-slate-100">
                <User size={16} className="text-[#5B4DF6]" />
                <span>Authorized Procurement Signatory</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Title / Role</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Direct Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Office Desk / Extension</label>
                  <input
                    type="text"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>
              </div>
            </div>

            {/* Corporate Entity & Tax Registrations */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 pb-3 border-b border-slate-100">
                <Building2 size={16} className="text-[#5B4DF6]" />
                <span>Enterprise Business Entity &amp; Statutory Registrations</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Registered Entity Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN (Goods &amp; Services Tax ID)</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] font-mono bg-slate-50 focus:outline-none focus:border-[#5B4DF6]"
                    />
                    <ShieldCheck size={16} className="text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company PAN Card</label>
                  <input
                    type="text"
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tax Deduction Number (TAN)</label>
                  <input
                    type="text"
                    value={tan}
                    onChange={(e) => setTan(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">MSME Udyam Registration</label>
                  <input
                    type="text"
                    value={msme}
                    onChange={(e) => setMsme(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Corporate HQ Registered Address</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>
              </div>
            </div>

            {/* Security & Password Update */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 pb-3 border-b border-slate-100">
                <Lock size={16} className="text-[#5B4DF6]" />
                <span>Security &amp; Portal Password</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/customer"
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors no-underline"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#5B4DF6] hover:bg-[#4D3FF0] text-white shadow-sm transition-all cursor-pointer"
              >
                <Save size={14} />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
