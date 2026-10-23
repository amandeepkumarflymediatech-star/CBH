'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import MainHeader from '@/components/header/MainHeader';
import NavSubBar from '@/components/header/NavSubBar';
import { RefreshCw, Mail, CheckCircle2, ArrowLeft, Send } from 'lucide-react';

export default function ResendVerificationPage() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams ? searchParams.get('email') || '' : '';

  const [email, setEmail] = useState(initialEmail);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (countdown > 0) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to resend code');
      }

      setFeedback({
        type: 'success',
        text: `Fresh 6-digit verification code transmitted to ${email}.`,
      });
      setCountdown(60);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Error transmitting code. Please try again.',
      });
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
                color: '#D2051E',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
              }}>
                <RefreshCw size={20} />
              </div>
            </div>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '24px', fontWeight: 800, color: 'var(--color-dark-900)' }}>
              Resend Verification Code
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Enter your registered enterprise email or phone to receive a fresh verification OTP or activation token.
            </p>
          </div>

          {feedback && (
            <div style={{
              background: feedback.type === 'success' ? '#ECFDF5' : '#FEE2E2',
              border: `1px solid ${feedback.type === 'success' ? '#059669' : '#DC2626'}`,
              color: feedback.type === 'success' ? '#065F46' : '#991B1B',
              padding: '10px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              marginBottom: '16px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {feedback.type === 'success' && <CheckCircle2 size={16} />}
              <span>{feedback.text}</span>
            </div>
          )}

          <form onSubmit={handleResend} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="finder-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={12} />
                <span>Registered Email / Mobile</span>
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
              disabled={isLoading || countdown > 0}
              style={{ padding: '12px', marginTop: '6px' }}
            >
              <Send size={15} />
              <span>
                {isLoading
                  ? 'Transmitting...'
                  : countdown > 0
                  ? `Resend in ${countdown}s`
                  : 'Transmit Verification OTP'}
              </span>
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
                href="/register"
                style={{ color: '#D2051E', fontWeight: 700 }}
              >
                Create Account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
