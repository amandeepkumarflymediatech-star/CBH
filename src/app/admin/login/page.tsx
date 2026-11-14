'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import { getStoredUser, setStoredUser, DEMO_ADMIN, AuthUser } from '@/lib/auth';

const DEFAULT_ADMIN_SECURITY_KEY =
  process.env.NEXT_PUBLIC_ADMIN_SECURITY_KEY || 'CBH-HQ-OP-901';

export default function AdminPortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const user = getStoredUser();
    if (user && user.role === 'admin') {
      router.replace('/admin');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          role: 'admin',
          securityKey: DEFAULT_ADMIN_SECURITY_KEY,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Administrator credentials invalid. Access denied.');
      }

      // Persist admin session
      const authUser: AuthUser = data.user || DEMO_ADMIN;
      setStoredUser(authUser, data.token);

      setSuccessMsg('Authentication successful. Redirecting to admin console...');
      setTimeout(() => {
        router.push('/admin');
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Access denied. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Header with Company Logo on the Left */}
      <header className="w-full bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90 no-underline"
          title="CBH Fasteners Home"
        >
          <img
            src="/assets/cbh-logo-stacked.png"
            alt="CBH Fasteners"
            className="h-8 sm:h-9 w-auto object-contain"
          />
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 tracking-wider">
            ADMIN
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors no-underline"
        >
          <ArrowLeft size={14} />
          <span>Back to Store</span>
        </Link>
      </header>

      {/* Main Login Stage */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-14">
        <div className="w-full max-w-[420px]">
          {/* Login Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-9">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-[#0052CC] flex items-center justify-center mx-auto mb-3 shadow-xs">
                <ShieldCheck size={26} strokeWidth={2.2} />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Admin Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Sign in to access your administrative dashboard
              </p>
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2.5">
                <ShieldAlert size={16} className="shrink-0 text-red-600" />
                <span className="flex-1">{errorMsg}</span>
              </div>
            )}

            {/* Success Alert */}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2.5">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                <span className="flex-1">{successMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    autoFocus
                    placeholder="Please Enter Email ID"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-slate-50 border border-slate-300 focus:border-[#0052CC] focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-900 text-sm font-medium outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-slate-50 border border-slate-300 focus:border-[#0052CC] focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-900 text-sm font-medium outline-none transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003685] text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {/* Discreet Footer */}
          <p className="text-center text-xs text-slate-400 mt-6">
            Protected Admin Area • CBH Fasteners
          </p>
        </div>
      </main>
    </div>
  );
}
