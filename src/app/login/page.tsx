'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainHeader from '@/components/header/MainHeader';
import NavSubBar from '@/components/header/NavSubBar';
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, User, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [email, setEmail] = useState('procurement@apexinfra.com');
  const [password, setPassword] = useState('Password@123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleQuickFill = (targetRole: 'customer' | 'admin') => {
    setRole(targetRole);
    if (targetRole === 'admin') {
      setEmail('admin@cbh.store');
      setPassword('Admin@Fastener2025');
    } else {
      setEmail('procurement@apexinfra.com');
      setPassword('Password@123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      setSuccessMsg('Session verified! Redirecting to operations portal...');
      setTimeout(() => {
        router.push(data.redirectTo || (role === 'admin' ? '/admin' : '/customer'));
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please check your credentials.');
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

      <div className="container" style={{ padding: '60px 24px 80px', maxWidth: '520px' }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--color-surface-border)',
          borderRadius: 'var(--radius-md)',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-md)',
          borderTop: '4px solid var(--color-primary)'
        }}>
          {/* Brand & Heading */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Link href="/" style={{ display: 'inline-block', marginBottom: '14px' }}>
              <img
                src="/assets/logo_blue.png"
                alt="CBH Fasteners"
                style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '26px', fontWeight: 800, color: 'var(--color-dark-900)' }}>
              Sign In to CBH Fasteners
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Secure enterprise access for contractors, OEMs, and central depot administration.
            </p>
          </div>

          {/* Role Switcher Pill */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--color-surface-bg)',
            padding: '3px',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid var(--color-surface-border)'
          }}>
            <button
              type="button"
              style={{
                padding: '8px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '3px',
                transition: 'all 0.2s',
                background: role === 'customer' ? 'var(--color-dark-800)' : 'transparent',
                color: role === 'customer' ? '#FFFFFF' : 'var(--color-text-muted)',
              }}
              onClick={() => handleQuickFill('customer')}
            >
              Contractor / Client
            </button>
            <button
              type="button"
              style={{
                padding: '8px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '3px',
                transition: 'all 0.2s',
                background: role === 'admin' ? '#D2051E' : 'transparent',
                color: role === 'admin' ? '#FFFFFF' : 'var(--color-text-muted)',
              }}
              onClick={() => handleQuickFill('admin')}
            >
              Operations Admin
            </button>
          </div>

          {/* Quick Demo Pre-fill Hint */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)',
            marginBottom: '16px',
            padding: '6px 10px',
            background: 'var(--color-surface-subtle)',
            borderRadius: '4px'
          }}>
            <span>Quick Fill Demo:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleQuickFill('customer')}
                style={{ color: '#0284C7', fontWeight: 700, textDecoration: 'underline' }}
              >
                Client PO
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                style={{ color: '#D2051E', fontWeight: 700, textDecoration: 'underline' }}
              >
                HQ Admin
              </button>
            </div>
          </div>

          {/* Alerts */}
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

          {successMsg && (
            <div style={{
              background: '#ECFDF5',
              border: '1px solid #059669',
              color: '#065F46',
              padding: '10px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              marginBottom: '16px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle2 size={15} />
              {successMsg}
            </div>
          )}

          {/* Login Form */}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com or +91 98880..."
              />
            </div>

            <div className="finder-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={12} />
                  <span>Password</span>
                </label>
                <Link
                  href="/forgot-password"
                  style={{ fontSize: '11px', color: '#D2051E', fontWeight: 700 }}
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                className="finder-select"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--color-dark-800)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Keep workstation authorized (30 days)</span>
              </label>

              <Link
                href="/resend-verification"
                style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}
              >
                Resend OTP / Token
              </Link>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ padding: '12px', marginTop: '6px' }}
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Operations Console'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Register Link */}
          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--color-surface-subtle)',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--color-text-muted)'
          }}>
            Don't have an enterprise account?{' '}
            <Link href="/register" style={{ color: '#D2051E', fontWeight: 700 }}>
              Register OEM / Contractor Account
            </Link>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '16px',
            fontSize: '11px',
            color: '#059669',
            fontFamily: 'var(--font-mono)'
          }}>
            <ShieldCheck size={14} />
            <span>256-Bit SSL Encrypted B2B Industrial Gateway</span>
          </div>
        </div>
      </div>
    </main>
  );
}
