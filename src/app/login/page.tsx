'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  FileText,
  Truck,
  Percent,
  Eye,
  EyeOff,
  Zap,
  Phone,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Edit2
} from 'lucide-react';
import { getStoredUser, setStoredUser, DEMO_CLIENT, AuthUser } from '@/lib/auth';
import { showErrorAlert, showToast, showWarningAlert } from '@/lib/swal';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '';

  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [linkedUser, setLinkedUser] = useState<any | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      if (redirectParam) {
        router.replace(redirectParam);
      } else if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/customer');
      }
    }
  }, [router, redirectParam]);

  // Step 1: Check Email
  const handleEmailProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      const msg = 'Please enter a valid company email address.';
      setErrorMsg(msg);
      showWarningAlert('Invalid Email', msg);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Unable to check email. Please try again.');
      }

      if (data.exists) {
        // Linked with us -> proceed to password step
        setLinkedUser(data.user || null);
        setStep('password');
        showToast('Account found! Please enter your password.', 'info', 2000);
      } else {
        // Not linked with us -> go to signup page with email pre-filled and redirect preserved
        showToast('No existing account found. Directing to registration...', 'info', 2500);
        const targetUrl = `/register?email=${encodeURIComponent(cleanEmail)}${
          redirectParam ? `&redirect=${encodeURIComponent(redirectParam)}` : ''
        }`;
        router.push(targetUrl);
      }
    } catch (err: any) {
      const msg = err.message || 'Error checking account credentials.';
      setErrorMsg(msg);
      showErrorAlert('Account Verification Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Sign in with Password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
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
          role: linkedUser?.role || 'customer',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      // Persist auth user locally
      const authUser: AuthUser = data.user || DEMO_CLIENT;
      setStoredUser(authUser, data.token);

      showToast(`Welcome back, ${authUser.companyName || authUser.fullName}!`, 'success', 2500);
      setSuccessMsg(`Welcome back, ${authUser.companyName}! Loading your session...`);
      setTimeout(() => {
        if (redirectParam) {
          router.push(redirectParam);
        } else if (authUser.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/customer');
        }
      }, 700);
    } catch (err: any) {
      const msg = err.message || 'Invalid password. Please check your credentials or reset password.';
      setErrorMsg(msg);
      showErrorAlert('Authentication Denied', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={{
      background: 'linear-gradient(180deg, #F8FAFC 0%, #EDF2F7 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-sans)'
    }}>
      {/* BESPOKE TOP BRAND BAR */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 20,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img
              src="/assets/cbh-logo-stacked.png"
              alt="CBH.STORE"
              style={{ height: '44px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>
          <span style={{ color: '#CBD5E1' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', letterSpacing: '0.02em' }}>
              PROCUREMENT CLOUD
            </span>
            <span style={{ fontSize: '11px', color: '#64748B' }}>• Client &amp; OEM Portal</span>
          </div>
        </div>

        {/* Support Hotline & Storefront Return */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '12px' }}>
            <Phone size={13} color="#FF6B00" />
            <span>Toll-Free: <strong style={{ color: '#0F172A' }}>+91 98880 21000</strong></span>
          </div>

          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              padding: '6px 12px',
              borderRadius: '6px',
              color: '#334155',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '12px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E2E8F0';
              e.currentTarget.style.color = '#0F172A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F1F5F9';
              e.currentTarget.style.color = '#334155';
            }}
          >
            <ArrowLeft size={13} />
            <span>Storefront</span>
          </Link>
        </div>
      </header>

      {/* CENTER STAGE CONTAINER */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 20px 48px' }}>
        <div style={{
          width: '100%',
          maxWidth: '1120px',
          background: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.1), 0 0 0 1px #E2E8F0',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          minHeight: '620px'
        }}>
          
          {/* LEFT WING: Industrial Trust & Procurement Cloud Showcase */}
          <div style={{
            background: 'linear-gradient(145deg, #071329 0%, #0B1E44 50%, #003882 100%)',
            color: '#FFFFFF',
            padding: '44px 38px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Decorative Mesh & Radial Glow */}
            <div style={{
              position: 'absolute',
              top: '-80px',
              right: '-80px',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 82, 204, 0.35) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-60px',
              left: '-60px',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 107, 0, 0.2) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            {/* Top Brand Block */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '5px 12px', borderRadius: '30px', marginBottom: '22px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#93C5FD', textTransform: 'uppercase' }}>
                  B2B PROCUREMENT ENGINE
                </span>
              </div>

              <h2 style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '30px',
                fontWeight: 900,
                lineHeight: 1.22,
                letterSpacing: '-0.02em',
                marginBottom: '14px'
              }}>
                India’s Digital Fastener <br />
                <span style={{ background: 'linear-gradient(90deg, #60A5FA, #93C5FD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Supply Chain Gateway
                </span>
              </h2>

              <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6, maxWidth: '420px', marginBottom: '32px' }}>
                Direct factory-gate pricing, verified chemical-mechanical MTCs, and dynamic volume slabs engineered for EPC contractors, automotive Tier-1s, and heavy infrastructure builders.
              </p>

              {/* Trust Feature List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(0, 82, 204, 0.35)',
                    border: '1px solid rgba(96, 165, 250, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <FileText size={17} color="#93C5FD" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', margin: 0, marginBottom: '2px' }}>
                      MTC 3.1 &amp; NABL Test Certificates
                    </h4>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                      Instant digital downloads of batch chemistry and mechanical pull tests linked to your dispatched POs.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(255, 107, 0, 0.25)',
                    border: '1px solid rgba(255, 107, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Percent size={17} color="#FDBA74" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', margin: 0, marginBottom: '2px' }}>
                      Automated Bulk Tonnage Slabs
                    </h4>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                      Unlock tiered discounts up to 25% on container and bulk pallet orders with automated GST invoices.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.25)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Truck size={17} color="#6EE7B7" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', margin: 0, marginBottom: '2px' }}>
                      24-Hour Dispatch from Ludhiana Hub
                    </h4>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                      Multi-modal road &amp; rail logistics with live consignment tracking across 19,000+ Indian pincodes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Live Metrics */}
            <div style={{
              marginTop: '36px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              position: 'relative',
              zIndex: 2
            }}>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>2,00,000+</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Ready SKUs</div>
              </div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: '#34D399', fontFamily: 'var(--font-mono)' }}>99.8%</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>On-Time Rate</div>
              </div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: '#FDBA74', fontFamily: 'var(--font-mono)' }}>ISO 9001</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>BIS Certified</div>
              </div>
            </div>
          </div>

          {/* RIGHT WING: Buyer Login Form */}
          <div style={{
            padding: '44px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: '#FFFFFF'
          }}>
            <div>
              {/* Header inside form */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '4px 10px', borderRadius: '6px', color: '#0052CC', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    <Building2 size={12} />
                    <span>CLIENT &amp; OEM PORTAL</span>
                  </div>
                  <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Sign In to Procurement
                  </h1>
                </div>

                {/* Quick Demo Test Button */}
                {/* <button
                  type="button"
                  onClick={fillDemoBuyer}
                  title="Click to automatically fill verified demo buyer credentials"
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#0052CC',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#EFF6FF';
                    e.currentTarget.style.borderColor = '#0052CC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  <Zap size={13} color="#FF6B00" />
                  <span>Demo Buyer</span>
                </button> */}
              </div>

              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '-8px', marginBottom: '22px', lineHeight: 1.5 }}>
                Enter your company procurement credentials to manage quotations, live dispatches, and mill certificates.
              </p>

              {/* Status Alerts */}
              {errorMsg && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #F87171',
                  color: '#991B1B',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  marginBottom: '20px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#DC2626' }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div style={{
                  background: '#ECFDF5',
                  border: '1px solid #34D399',
                  color: '#065F46',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  marginBottom: '20px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={16} color="#059669" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Sign In Form: Step 1 (Email) or Step 2 (Password) */}
              {step === 'email' ? (
                <form onSubmit={handleEmailProceed} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Email Field */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '7px' }}>
                      Registered Company Email / GSTIN
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                        <Mail size={16} color="#0052CC" />
                      </div>
                      <input
                        type="email"
                        required
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. procurement@apexinfra.com"
                        style={{
                          width: '100%',
                          padding: '12px 14px 12px 42px',
                          background: '#F8FAFC',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: '10px',
                          fontSize: '13px',
                          color: '#0F172A',
                          outline: 'none',
                          transition: 'border-color 0.2s, box-shadow 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0052CC';
                          e.target.style.background = '#FFFFFF';
                          e.target.style.boxShadow = '0 0 0 3px rgba(0, 82, 204, 0.12)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#E2E8F0';
                          e.target.style.background = '#F8FAFC';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  {/* Proceed Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '13px 20px',
                      background: 'linear-gradient(135deg, #0052CC 0%, #0040A1 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 8px 20px rgba(0, 82, 204, 0.28)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      marginTop: '4px'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 82, 204, 0.35)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 82, 204, 0.28)';
                      }
                    }}
                  >
                    <span>{isLoading ? 'Checking Clearance...' : 'Proceed'}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Verified Email Summary Card */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 14px',
                    background: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1.5px solid #E2E8F0',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CheckCircle2 size={16} color="#0052CC" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {email}
                        </span>
                        {linkedUser?.companyName && (
                          <span style={{ fontSize: '11px', color: '#64748B', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {linkedUser.companyName}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setErrorMsg('');
                      }}
                      style={{
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#0052CC',
                        fontSize: '11px',
                        fontWeight: 700,
                        borderRadius: '6px',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      Change
                    </button>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        style={{ fontSize: '12px', color: '#0052CC', fontWeight: 700, textDecoration: 'none' }}
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                        <Lock size={16} color="#0052CC" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoFocus
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter account password"
                        style={{
                          width: '100%',
                          padding: '12px 44px 12px 42px',
                          background: '#F8FAFC',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: '10px',
                          fontSize: '13px',
                          color: '#0F172A',
                          outline: 'none',
                          transition: 'border-color 0.2s, box-shadow 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0052CC';
                          e.target.style.background = '#FFFFFF';
                          e.target.style.boxShadow = '0 0 0 3px rgba(0, 82, 204, 0.12)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#E2E8F0';
                          e.target.style.background = '#F8FAFC';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#64748B',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px'
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Session Persistence & OTP Help */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#475569', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: '#0052CC', cursor: 'pointer' }}
                      />
                      <span>Keep me signed in</span>
                    </label>

                    <Link href="/resend-verification" style={{ color: '#64748B', textDecoration: 'none', fontSize: '12px' }}>
                      Need OTP access?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '13px 20px',
                      background: 'linear-gradient(135deg, #0052CC 0%, #0040A1 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 8px 20px rgba(0, 82, 204, 0.28)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      marginTop: '4px'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 82, 204, 0.35)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 82, 204, 0.28)';
                      }
                    }}
                  >
                    <span>{isLoading ? 'Verifying Buyer Account...' : 'Sign In to Client Portal'}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Register Banner & Security Footer */}
            <div style={{ marginTop: '28px' }}>
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>New Procurement Buyer?</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Get wholesale credit terms &amp; customized price books.</div>
                </div>
                <Link
                  href="/register"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#0052CC',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>Register</span>
                  <ChevronRight size={13} />
                </Link>
              </div>

              {/* Encryption & Compliance */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '16px',
                fontSize: '11px',
                color: '#10B981',
                fontWeight: 600
              }}>
                <ShieldCheck size={14} />
                <span>256-Bit SSL Encrypted Enterprise Gateway</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* FOOTER STRIP */}
      <footer style={{
        textAlign: 'center',
        padding: '16px 20px',
        fontSize: '11px',
        color: '#64748B',
        borderTop: '1px solid #E2E8F0',
        background: '#FFFFFF'
      }}>
        © 2026 CBH Store – A Venture of CBH Tech Pvt. Ltd., India. • ISO 9001:2015 &amp; BIS Certified Works •{' '}
        <Link href="/terms-and-conditions" style={{ color: '#64748B', textDecoration: 'underline' }}>Terms</Link> •{' '}
        <Link href="/privacy-policy" style={{ color: '#64748B', textDecoration: 'underline' }}>Privacy</Link> •{' '}
        <Link href="/contact" style={{ color: '#FF6B00', textDecoration: 'none', fontWeight: 700 }}>Contact Support</Link>
      </footer>
    </main>
  );
}

export default function ClientLoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <p style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Loading Sign In Portal...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
