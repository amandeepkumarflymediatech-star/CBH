'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MainHeader from '@/components/header/MainHeader';
import NavSubBar from '@/components/header/NavSubBar';
import { Mail, KeyRound, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send reset code');
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error requesting password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={{ background: 'var(--color-surface-bg)', minHeight: '100vh' }}>
      <MainHeader
        unit="PCS"
        onUnitToggle={() => {}}
        cartCount={0}
        onOpenCart={() => {}}
      />
      <NavSubBar />

      <div className="container" style={{ padding: '60px 24px 80px', maxWidth: '480px' }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--color-surface-border)',
          borderRadius: 'var(--radius-md)',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-md)',
          borderTop: '4px solid var(--color-primary)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Link href="/" style={{ display: 'inline-block', marginBottom: '14px' }}>
              <img
                src="/assets/logo_blue.png"
                alt="CBH Fasteners"
                style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
            <div style={{ display: 'block' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--color-surface-subtle)',
                color: 'var(--color-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
              }}>
                <KeyRound size={20} />
              </div>
            </div>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '24px', fontWeight: 800, color: 'var(--color-dark-900)' }}>
              Reset Enterprise Password
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Enter your registered business email or phone number. We will dispatch a 6-digit verification code and reset token.
            </p>
          </div>

          {errorMsg && (
            <div style={{
              background: '#FEE2E2',
              border: '1px solid #DC2626',
              color: '#991B1B',
              padding: '10px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              marginBottom: '16px',
              fontWeight: 600
            }}>
              {errorMsg}
            </div>
          )}

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #059669',
                borderRadius: '6px',
                padding: '18px',
                marginBottom: '20px'
              }}>
                <CheckCircle2 size={32} color="#059669" style={{ margin: '0 auto 8px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#065F46', marginBottom: '4px' }}>
                  Reset Token Dispatched
                </h3>
                <p style={{ fontSize: '13px', color: '#047857' }}>
                  Verification OTP and password reset link dispatched to <strong>{email}</strong>. Valid for 15 minutes.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  href={`/resend-verification?email=${encodeURIComponent(email)}`}
                  className="btn-outline"
                  style={{ width: '100%', padding: '10px' }}
                >
                  <span>Did not receive code? Resend OTP</span>
                </Link>

                <Link
                  href="/login"
                  className="btn-dark"
                  style={{ width: '100%', padding: '10px' }}
                >
                  <ArrowLeft size={16} />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="finder-field">
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={12} />
                  <span>Registered Email / Phone</span>
                </label>
                <input
                  type="text"
                  className="finder-select"
                  required
                  placeholder="e.g. procurement@apexinfra.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
                style={{ padding: '12px', marginTop: '6px' }}
              >
                <span>{isLoading ? 'Sending Instructions...' : 'Transmit Password Reset Code'}</span>
                <ArrowRight size={16} />
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', paddingTop: '10px' }}>
                <Link
                  href="/login"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-dark-800)', fontWeight: 600 }}
                >
                  <ArrowLeft size={14} />
                  <span>Back to Sign In</span>
                </Link>

                <Link
                  href="/resend-verification"
                  style={{ color: 'var(--color-primary)', fontWeight: 700 }}
                >
                  Resend Verification Code
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
