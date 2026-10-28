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
import { getStoredUser, setStoredUser, logout, DEMO_CLIENT, AuthUser } from '@/lib/auth';
import { showErrorAlert, showToast, showSuccessAlert } from '@/lib/swal';

export default function CustomerProfilePage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Profile Form State
  const [fullName, setFullName] = useState('Rajesh Sharma');
  const [designation, setDesignation] = useState('Senior VP Procurement & Supply Chain');
  const [email, setEmail] = useState('procurement@apexinfra.com');
  const [phone, setPhone] = useState('+91 98140 22345');
  const [altPhone, setAltPhone] = useState('+91 11 4059 8800');
  const [companyName, setCompanyName] = useState('Apex Infrastructure Corp');
  const [gstin, setGstin] = useState('07AAAAA0000A1Z5');
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
  const [successMessage, setSuccessMessage] = useState('Profile credentials and enterprise authorizations successfully updated!');
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces');
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces',
  ];

  React.useEffect(() => {
    const u = getStoredUser();
    setCurrentUser(u);
    if (u) {
      if (u.fullName) setFullName(u.fullName);
      if (u.email) setEmail(u.email);
      if (u.companyName) setCompanyName(u.companyName);
      if (u.gstin) setGstin(u.gstin);
      if (u.phone) setPhone(u.phone);
    }
    const savedAvatar =
      u?.avatar ||
      (typeof window !== 'undefined' ? localStorage.getItem('cbh_customer_avatar') : null) ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces';
    setAvatarUrl(savedAvatar);
    setCustomAvatarInput(savedAvatar);
  }, []);

  const persistAvatar = (url: string, notifyMsg = 'Profile photo saved and updated across portal!') => {
    setAvatarUrl(url);
    setCustomAvatarInput(url);
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
    setSuccessMessage(notifyMsg);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Dynamically import or call compressImageToDataUrl
      const { compressImageToDataUrl } = await import('@/lib/image-utils');
      // Create clean, lightweight ~25KB compressed JPEG
      const compressedDataUrl = await compressImageToDataUrl(file, 320, 0.85);

      // Persist immediately so image is saved and doesn't rely on transient blob
      persistAvatar(compressedDataUrl, 'Profile photo updated and saved!');

      // Also upload file to server endpoint in background
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.success && data.url) {
          // Upgrade to permanent static URL
          persistAvatar(data.url, 'Profile photo saved permanently!');
        }
      } catch (uploadErr) {
        console.warn('Server upload optional fallback active:', uploadErr);
      }
    } catch (err: any) {
      console.error('Image processing failed:', err);
      showErrorAlert('Image Processing Failed', 'Could not process image. Please try a different JPG or PNG file.');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleApplyCustomUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customAvatarInput.trim()) return;
    persistAvatar(customAvatarInput.trim(), 'Profile photo URL saved successfully!');
    setShowUrlInput(false);
  };

  const handleResetAvatar = () => {
    const defaultUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces';
    persistAvatar(defaultUrl, 'Profile photo reset to default.');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const current = getStoredUser() || DEMO_CLIENT;
    const finalAvatar = avatarUrl.startsWith('blob:') ? (current.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces') : avatarUrl;

    const updated: AuthUser = {
      ...current,
      fullName,
      companyName,
      gstin,
      phone,
      avatar: finalAvatar,
    };
    setStoredUser(updated);
    setCurrentUser(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cbh_customer_avatar', finalAvatar);
      } catch (err) {
        console.warn('LocalStorage save failed:', err);
      }
    }
    setSuccessMessage('Profile credentials and authorized enterprise details saved!');
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
          <span>{successMessage}</span>
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
              {/* Avatar Upload with live preview & click-to-upload */}
              <div className="relative inline-block mx-auto mb-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group block rounded-full focus:outline-none cursor-pointer"
                  title="Click to Change Photo"
                >
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className={`w-24 h-24 rounded-full border-4 border-white shadow-md object-cover transition-all group-hover:brightness-90 ${
                      isUploading ? 'opacity-50' : 'opacity-100'
                    }`}
                  />
                  <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                    Upload
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#5B4DF6] text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-[#4D3FF0] transition-colors border-2 border-white"
                  title="Upload New Photo"
                >
                  <Camera size={14} />
                </button>

                <input
                  ref={fileInputRef}
                  id="avatar-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {isUploading && (
                <div className="text-[11px] font-bold text-[#5B4DF6] animate-pulse mb-2">
                  Optimizing and saving photo...
                </div>
              )}

              {/* Avatar Control Buttons */}
              <div className="flex items-center justify-center gap-1.5 mb-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-2.5 py-1 rounded-lg bg-[#EEF0FD] hover:bg-[#E0E4FD] text-[#5B4DF6] text-[11px] font-bold transition-colors cursor-pointer"
                >
                  {showUrlInput ? 'Hide URL' : 'Paste Link'}
                </button>
                <button
                  type="button"
                  onClick={handleResetAvatar}
                  className="px-2 py-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 text-[11px] font-medium transition-colors cursor-pointer"
                  title="Reset to default photo"
                >
                  Reset
                </button>
              </div>

              {/* Optional Direct URL Input */}
              {showUrlInput && (
                <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-left animate-in fade-in">
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                    Image Link / CDN URL
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={customAvatarInput}
                      onChange={(e) => setCustomAvatarInput(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0F172A] bg-white focus:outline-none focus:border-[#5B4DF6]"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCustomUrl()}
                      className="px-3 py-1.5 rounded-lg bg-[#5B4DF6] text-white text-xs font-bold hover:bg-[#4D3FF0] cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              {/* Preset Avatars Selection */}
              <div className="mb-4 pt-3 border-t border-slate-100">
                <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">
                  Or Pick Corporate Avatar
                </div>
                <div className="flex items-center justify-center gap-2">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => persistAvatar(url, 'Selected avatar applied and saved!')}
                      className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 cursor-pointer ${
                        avatarUrl === url ? 'border-[#5B4DF6] ring-2 ring-[#5B4DF6]/30 scale-105' : 'border-slate-200'
                      }`}
                      title={`Select preset ${idx + 1}`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
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

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Officer Profile Photo URL</span>
                    <span className="text-[10px] text-slate-400 font-normal">Direct CDN or uploaded image link</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <img
                      src={avatarUrl}
                      alt="Thumbnail"
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover shrink-0"
                    />
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => {
                        setAvatarUrl(e.target.value);
                        setCustomAvatarInput(e.target.value);
                      }}
                      placeholder="https://..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#5B4DF6]"
                    />
                  </div>
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
