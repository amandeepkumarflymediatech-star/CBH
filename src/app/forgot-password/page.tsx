'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainHeader from '@/components/header/MainHeader';
import {
  Mail,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck,
  Lock,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Steps: 1 = Email, 2 = OTP & New Password, 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [dispatchedOtp, setDispatchedOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  // Handle countdown timers
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (step !== 3) return;
    if (redirectCountdown <= 0) {
      router.push(`/login?email=${encodeURIComponent(email)}&reset=success`);
      return;
    }
    const timer = setInterval(() => {
      setRedirectCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, redirectCountdown, router, email]);

  // Step 1: Send Reset Code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setErrorMsg('');
    setInfoMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch reset code.');
      }

      if (data.otp) {
        setDispatchedOtp(data.otp);
      }
      setStep(2);
      setResendCooldown(45);
      setInfoMsg(`A 6-digit verification code has been dispatched to ${cleanEmail}.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error requesting password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to resend code.');
      }

      if (data.otp) {
        setDispatchedOtp(data.otp);
        setOtpCode(data.otp);
      }
      setResendCooldown(45);
      setInfoMsg('A fresh 6-digit verification code has been dispatched.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error resending verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and Save New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      setErrorMsg('Please enter a valid 6-digit verification code.');
      return;
    }

    if (!newPassword.trim() || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: cleanOtp,
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update credentials.');
      }

      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating password. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <MainHeader
        unit="PCS"
        onUnitToggle={() => {}}
        cartCount={0}
        onOpenCart={() => {}}
      />

      <div className="max-w-lg mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8">
          {/* Brand & Heading */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-block mb-3">
              <img
                src="/assets/cbh-logo-stacked.png"
                alt="CBH.STORE"
                className="h-10 w-auto object-contain mx-auto"
              />
            </Link>

            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-2">
              <KeyRound size={20} />
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {step === 1 && 'Reset Enterprise Password'}
              {step === 2 && 'Verify Code & Set Password'}
              {step === 3 && 'Password Reset Complete'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {step === 1 && 'Enter your registered email address to receive a 6-digit recovery code.'}
              {step === 2 && `Enter the 6-digit recovery code sent to ${email} and choose a new password.`}
              {step === 3 && 'Your credentials have been updated securely in the database.'}
            </p>

            {/* Stepper Dots */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className={`w-8 h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-blue-700' : 'bg-slate-200'}`} />
              <div className={`w-8 h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-blue-700' : 'bg-slate-200'}`} />
              <div className={`w-8 h-1.5 rounded-full transition-all ${step === 3 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
            </div>
          </div>

          {/* Feedback Banners */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && step !== 3 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs font-semibold flex items-start gap-2">
              <Sparkles size={16} className="shrink-0 mt-0.5 text-blue-600" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 1: EMAIL INPUT                                           */}
          {/* ============================================================== */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Mail size={13} className="text-blue-700" />
                  <span>Registered Business Email</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="e.g. dosebox@yopmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                  />
                </div>
              </div>

              {/* Quick Test Demo Chips */}
              <div className="pt-1">
                <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
                  Quick Demo Accounts
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEmail('dosebox@yopmail.com')}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors"
                  >
                    dosebox@yopmail.com
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmail('admin@cbh.store')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                  >
                    admin@cbh.store
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Transmitting Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* STEP 2: VERIFICATION OTP & NEW PASSWORD                       */}
          {/* ============================================================== */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Recipient Details & Change Email */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] text-slate-400 block font-medium">Resetting Password For</span>
                  <span className="text-xs font-bold text-slate-800 truncate block font-mono">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-blue-700 hover:underline shrink-0"
                >
                  Change
                </button>
              </div>

              {/* Dev/Demo Quick Fill OTP Banner */}
              {dispatchedOtp ? (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                  <div className="flex items-center gap-1.5 text-amber-900 text-xs font-bold">
                    <span>Dispatched OTP:</span>
                    <span className="font-mono bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-950 text-sm tracking-wider font-extrabold">
                      {dispatchedOtp}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpCode(dispatchedOtp)}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Quick Fill
                  </button>
                </div>
              ) : null}

              {/* 6-Digit OTP */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-blue-700" />
                    <span>6-Digit Verification Code</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setOtpCode('892104')}
                    className="text-[11px] font-bold text-slate-500 hover:text-blue-700"
                  >
                    Use Demo Code (892104)
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 892104"
                  className="w-full text-center tracking-[0.3em] font-mono font-bold text-lg px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Lock size={13} className="text-blue-700" />
                  <span>New Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Lock size={13} className="text-blue-700" />
                  <span>Confirm New Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Reset */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Verifying &amp; Updating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Reset Password &amp; Update Account</span>
                  </>
                )}
              </button>

              {/* Resend & Back Row */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                >
                  <ArrowLeft size={13} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || isLoading}
                  onClick={handleResendCode}
                  className={`font-bold transition-colors ${
                    resendCooldown > 0
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-blue-700 hover:text-blue-800'
                  }`}
                >
                  {resendCooldown > 0
                    ? `Resend Code in ${resendCooldown}s`
                    : 'Resend Verification Code'}
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* STEP 3: SUCCESS & REDIRECT                                    */}
          {/* ============================================================== */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 size={36} />
              </div>

              <h2 className="text-lg font-extrabold text-slate-900 mb-1">
                Password Successfully Reset!
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Your new enterprise password is active in the database. You can now access your account and procurement tools.
              </p>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-6 text-xs text-slate-600">
                Redirecting to sign in page in <strong className="text-blue-700 font-mono text-sm">{redirectCountdown}s</strong>...
              </div>

              <Link
                href={`/login?email=${encodeURIComponent(email)}&reset=success`}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all no-underline shadow-sm"
              >
                <span>Sign In Now</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
