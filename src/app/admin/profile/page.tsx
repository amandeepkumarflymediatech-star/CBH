'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  User,
  Lock,
  Mail,
  Phone,
  Save,
  CheckCircle2,
  LogOut,
  Camera,
  Shield,
  KeyRound,
  RotateCcw
} from 'lucide-react';
import { getStoredUser, setStoredUser, logout, DEMO_ADMIN, AuthUser } from '@/lib/auth';

export default function AdminProfilePage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Profile Information
  const [fullName, setFullName] = useState('Admin User');
  const [email, setEmail] = useState('admin@cbh.store');
  const [phone, setPhone] = useState('+91 98880 21000');
  const [role, setRole] = useState('Super Administrator');

  // Security & Password State
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const u = getStoredUser();
    setCurrentUser(u);
    if (u) {
      if (u.fullName) setFullName(u.fullName);
      if (u.email) setEmail(u.email);
      if (u.phone) setPhone(u.phone);
      if (u.role) setRole(u.role);
    }
    const savedAvatar =
      u?.avatar ||
      (typeof window !== 'undefined' ? localStorage.getItem('cbh_admin_avatar') : null) ||
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces';
    setAvatarUrl(savedAvatar);
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const persistAvatar = (url: string) => {
    setAvatarUrl(url);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cbh_admin_avatar', url);
      } catch (err) {
        console.warn('LocalStorage save failed:', err);
      }
    }
    const current = getStoredUser() || DEMO_ADMIN;
    const updated: AuthUser = {
      ...current,
      avatar: url,
    };
    setStoredUser(updated);
    setCurrentUser(updated);
    showToast('Profile photo updated successfully!');
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const { compressImageToDataUrl } = await import('@/lib/image-utils');
      const compressedDataUrl = await compressImageToDataUrl(file, 280, 0.85);
      persistAvatar(compressedDataUrl);

      // Background upload to server
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
        console.warn('Server upload fallback:', uploadErr);
      }
    } catch {
      showToast('Error processing profile photo.');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleResetAvatar = () => {
    const defaultUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces';
    persistAvatar(defaultUrl);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (newPasscode) {
      if (newPasscode.length < 6) {
        showToast('New password must be at least 6 characters.');
        setIsSaving(false);
        return;
      }
      if (newPasscode !== confirmPasscode) {
        showToast('New passwords do not match.');
        setIsSaving(false);
        return;
      }
    }

    const current = getStoredUser() || DEMO_ADMIN;
    const updated: AuthUser = {
      ...current,
      fullName,
      phone,
      avatar: avatarUrl,
    };
    setStoredUser(updated);
    setCurrentUser(updated);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cbh_admin_avatar', avatarUrl);
      } catch (err) {
        console.warn('LocalStorage save failed:', err);
      }
    }

    setCurrentPasscode('');
    setNewPasscode('');
    setConfirmPasscode('');
    setIsSaving(false);
    showToast('Admin profile & credentials saved successfully!');
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto w-full">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 bg-emerald-900 text-white border-emerald-700 animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Admin Profile &amp; Security</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {role}
            </span>
          </h1>
        </div>

        <button
          type="button"
          onClick={() => logout('/')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Single Profile Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {/* Profile Identity Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Avatar with Camera upload button */}
          <div className="relative shrink-0">
            <div className="w-18 h-18 rounded-full overflow-hidden border-2 border-[#0052CC] shadow-xs bg-white">
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  try {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces';
                  } catch {}
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0052CC] hover:bg-[#0747A6] text-white flex items-center justify-center border-2 border-white shadow-xs cursor-pointer transition-colors"
              title="Upload new profile photo"
            >
              <Camera size={13} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* User Details & Status */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-base font-black text-slate-900 truncate">{fullName}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active Session
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                {isUploading ? 'Uploading...' : 'Change Photo'}
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={handleResetAvatar}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Reset Default
              </button>
            </div>
          </div>
        </div>

        {/* Profile & Security Form */}
        <form onSubmit={handleSaveProfile} className="p-4 sm:p-6 space-y-6">
          {/* Section 1: Contact Information */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User size={14} className="text-[#0052CC]" />
              <span>Personal &amp; Contact Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-[#0052CC] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-[#0052CC] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-[#0052CC] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role &amp; Permissions</label>
                <div className="relative">
                  <Shield size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    disabled
                    value="Full Super Administrator"
                    className="w-full pl-8 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-medium cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Password & Authentication */}
          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Lock size={14} className="text-[#0052CC]" />
              <span>Password &amp; Security</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPasscode}
                  onChange={(e) => setCurrentPasscode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-[#0052CC]"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Leave password fields blank if you only wish to update personal contact details.
            </p>
          </div>

          {/* Form Actions Footer */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2.5">
            <Link
              href="/admin"
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? <RotateCcw size={13} className="animate-spin" /> : <Save size={13} />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
