'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  Loader2
} from 'lucide-react';
import { getStoredUser, setStoredUser, logout, DEMO_CLIENT, AuthUser } from '@/lib/auth';
import { showErrorAlert, showToast } from '@/lib/swal';

export default function CustomerProfilePage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [tan, setTan] = useState('');
  const [msme, setMsme] = useState('');
  const [address, setAddress] = useState('');
  const [totalSpend, setTotalSpend] = useState(0);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification / Toast
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const u = getStoredUser();
    setCurrentUser(u);
    if (u) {
      setFullName(u.fullName || '');
      setEmail(u.email || '');
      setCompanyName(u.companyName || '');
      setGstin(u.gstin || '');
      setPhone(u.phone || '');
      setDesignation(u.designation || 'Head of Procurement & Supply Chain');
      setPan(u.pan || '');
      setTan(u.tan || '');
      setMsme(u.msme || u.msmeRegistrationNumber || '');
      setAddress(u.address || '');
    }
    fetch('/api/orders').then(r => r.json()).then(d => {
      if (d.data && Array.isArray(d.data)) {
        const sum = d.data.reduce((acc: number, o: any) => acc + (o.netAmount || 0), 0);
        setTotalSpend(sum);
      }
    }).catch(() => {});
    const savedAvatar =
      u?.avatar ||
      (typeof window !== 'undefined' ? localStorage.getItem('cbh_customer_avatar') : null) ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces';
    setAvatarUrl(savedAvatar);
  }, []);

  const persistAvatar = (url: string) => {
    setAvatarUrl(url);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cbh_customer_avatar', url);
      } catch (err) {
        console.warn('LocalStorage save failed:', err);
      }
    }
    const current = getStoredUser() || DEMO_CLIENT;
    const updated: AuthUser = {
      ...current,
      avatar: url,
    };
    setStoredUser(updated);
    setCurrentUser(updated);
    showToast('Profile photo updated successfully!', 'success');
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const { compressImageToDataUrl } = await import('@/lib/image-utils');
      const compressedDataUrl = await compressImageToDataUrl(file, 280, 0.85);
      persistAvatar(compressedDataUrl);

      // Upload file to server endpoint in background
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.success && data.url) {
          persistAvatar(data.url);
        }
      } catch (uploadErr) {
        console.warn('Optional server upload skipped:', uploadErr);
      }
    } catch {
      showErrorAlert('Upload Failed', 'Could not process image. Please try a different JPG or PNG file.');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const current = getStoredUser() || DEMO_CLIENT;
    const finalAvatar = avatarUrl;

    const updated: AuthUser = {
      ...current,
      fullName,
      companyName,
      gstin,
      phone,
      designation,
      pan,
      tan,
      msme,
      address,
      avatar: finalAvatar,
    };
    setStoredUser(updated);
    setCurrentUser(updated);

    if (current?.id) {
      try {
        await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: current.id,
            fullName,
            companyName,
            gstin,
            phone,
            designation,
            pan,
            tan,
            msme,
            address,
          })
        });
      } catch (err) {
        console.warn('API sync warning:', err);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cbh_customer_avatar', finalAvatar);
      } catch (err) {
        console.warn('LocalStorage save failed:', err);
      }
    }
    setIsSaving(false);
    setSaveSuccess(true);
    showToast('Client profile and credentials saved!', 'success');
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const creditLimit = Number(currentUser?.creditLimit || 2500000);
  const creditAvail = Math.max(0, creditLimit - totalSpend);
  const creditPercent = Math.min(100, Math.round((totalSpend / Math.max(1, creditLimit)) * 100));

  return (
    <div className="space-y-4 max-w-[1200px] mx-auto">
      {/* Sleek Single-Viewport Top Ops Bar */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EEF0FD] text-[#5B4DF6] flex items-center justify-center shrink-0 border border-[#D5D8FA]">
            <User size={18} />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-[#0F172A] leading-tight flex items-center gap-2">
              <span>Enterprise Client Profile</span>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={11} /> GST Verified
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Corporate legal entity, authorized signatory, and revolving credit parameters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Link
            href="/customer/sites"
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors no-underline flex items-center gap-1.5"
          >
            <MapPin size={13} className="text-[#5B4DF6]" />
            <span>Sites</span>
          </Link>
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

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-xs animate-in fade-in">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <span>Profile credentials and authorized enterprise details saved!</span>
        </div>
      )}

      {/* Main Grid: Left Identity & Credit Widget + Right Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side (4 Cols): Avatar + Credit Facility */}
        <div className="lg:col-span-4 space-y-4">
          {/* Identity Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 text-center">
            <div className="relative inline-block mx-auto mb-2.5">
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-20 h-20 rounded-full border-2 border-slate-200 object-cover shadow-xs"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#5B4DF6] text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-[#4D3FF0] transition-colors border-2 border-white"
                title="Upload Photo"
              >
                {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <h2 className="text-sm font-black text-[#0F172A]">{fullName || 'Authorized Signatory'}</h2>
            <p className="text-[11px] text-slate-500">{designation}</p>
            <div className="text-xs font-bold text-[#5B4DF6] mt-0.5">{companyName}</div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-extrabold border border-amber-200">
                ⭐ VIP TIER • 8% REBATE
              </span>
            </div>
          </div>

          {/* Approved Credit Facility Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={14} className="text-[#5B4DF6]" />
                <span>Credit Facility</span>
              </span>
              <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                AAA RATED
              </span>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Available Balance</div>
              <div className="text-xl font-black text-[#0F172A] font-mono mt-0.5">
                ₹{creditAvail.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="space-y-1">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#5B4DF6] to-emerald-500 h-full transition-all"
                  style={{ width: `${creditPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>Utilized: ₹{totalSpend.toLocaleString('en-IN')} ({creditPercent}%)</span>
                <span>Limit: ₹{creditLimit.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Payment Terms:</span>
                <strong className="text-[#0F172A]">Net 30 Days</strong>
              </div>
              <div className="flex justify-between">
                <span>Direct Mill Rebate:</span>
                <strong className="text-emerald-600">8% on orders &gt; ₹5L</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side (8 Cols): Editable Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Officer Information Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                <User size={14} className="text-[#5B4DF6]" />
                <span>Authorized Procurement Signatory</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Corporate Title / Role</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Official Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Direct Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>
              </div>
            </div>

            {/* Corporate Entity & Tax Registrations */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                <Building2 size={14} className="text-[#5B4DF6]" />
                <span>Enterprise Business Entity &amp; Registrations</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Registered Entity Name</label>
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
                      required
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0F172A] font-mono bg-slate-50 focus:outline-none focus:border-[#5B4DF6]"
                    />
                    <ShieldCheck size={14} className="text-emerald-600 absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Company PAN</label>
                  <input
                    type="text"
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">MSME Udyam Registration</label>
                  <input
                    type="text"
                    value={msme}
                    onChange={(e) => setMsme(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Tax Deduction No (TAN)</label>
                  <input
                    type="text"
                    value={tan}
                    onChange={(e) => setTan(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Corporate HQ Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>
              </div>
            </div>

            {/* Security & Password */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                <Lock size={14} className="text-[#5B4DF6]" />
                <span>Security &amp; Portal Password</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4DF6]"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <Link
                href="/customer"
                className="px-4 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors no-underline"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg text-xs font-bold bg-[#5B4DF6] hover:bg-[#4D3FF0] text-white shadow-xs transition-all cursor-pointer"
              >
                {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
