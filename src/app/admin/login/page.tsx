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
  KeyRound,
  Terminal,
  Activity,
  Cpu,
  Zap,
  Eye,
  EyeOff,
  Server,
  ArrowLeft
} from 'lucide-react';
import { getStoredUser, setStoredUser, DEMO_ADMIN, AuthUser } from '@/lib/auth';

const DEFAULT_ADMIN_SECURITY_KEY =
  process.env.NEXT_PUBLIC_ADMIN_SECURITY_KEY || 'CBH-HQ-OP-901';

export default function AdminPortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stationKey, setStationKey] = useState(DEFAULT_ADMIN_SECURITY_KEY);
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

  const fillDemoAdmin = () => {
    setEmail('admin@cbh.store');
    setPassword('Admin@Fastener2025');
    setStationKey(DEFAULT_ADMIN_SECURITY_KEY);
    setErrorMsg('');
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
        body: JSON.stringify({ email, password, role: 'admin', securityKey: stationKey }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Administrator credentials invalid. Access denied.');
      }

      // Persist admin session
      const authUser: AuthUser = data.user || DEMO_ADMIN;
      setStoredUser(authUser, data.token);

      setSuccessMsg(`Operator clearance verified for ${authUser.fullName}! Initializing control matrix...`);
      setTimeout(() => {
        router.push('/admin');
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Access denied. Security protocol triggered.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={{
      background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF2F6 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      color: '#0F172A',
      fontFamily: 'var(--font-sans)'
    }}>
      {/* Blueprint Grid Background Pattern */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `
          radial-gradient(#CBD5E1 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
        opacity: 0.6,
        pointerEvents: 'none'
      }} />

      {/* TOP TELEMETRY BAR (WHITE/LIGHT ENTERPRISE THEME) */}
      <header style={{
        position: 'relative',
        zIndex: 10,
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '12px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Left: Console Node & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0052CC 0%, #003685 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0, 82, 204, 0.3)'
            }}>
              <Terminal size={16} color="#FFFFFF" />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', color: '#0F172A' }}>CBH FASTENERS</span>
              <span style={{ fontSize: '11px', color: '#0052CC', marginLeft: '6px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                OPERATIONS ENCLAVE
              </span>
            </div>
          </Link>

          <span style={{ color: '#E2E8F0' }}>|</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
            <Server size={13} color="#0052CC" />
            <span>NODE: LUDHIANA-CENTRAL-DC1</span>
          </div>
        </div>

        {/* Right: Security Telemetry */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            padding: '4px 10px',
            borderRadius: '20px'
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span style={{ color: '#065F46', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              CLEARANCE LEVEL 4 ACTIVE
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <Activity size={12} color="#0052CC" />
            <span>TLS 1.3 / AES-256</span>
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
              fontSize: '12px',
              fontWeight: 600,
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

      {/* CENTER CONSOLE STAGE */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              boxShadow: '0 4px 12px rgba(0, 82, 204, 0.12)',
              marginBottom: '14px'
            }}>
              <Cpu size={26} color="#0052CC" />
            </div>

            <h1 style={{
              fontSize: '25px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#0F172A',
              margin: '0 0 6px 0'
            }}>
              CBH Operations Terminal
            </h1>

            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              Authorized dispatch controllers, plant supervisors &amp; administrators only.
            </p>
          </div>

          {/* Command Card Chassis (White / Crisp Theme) */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderTop: '4px solid #0052CC',
            borderRadius: '18px',
            padding: '36px 32px',
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(226, 232, 240, 0.8)',
            position: 'relative'
          }}>

            {/* Quick Demo Operator Shortcut */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '14px',
              borderBottom: '1px solid #F1F5F9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#0052CC', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0052CC' }} />
                <span>OPERATOR CLEARANCE</span>
              </div>

              {/* <button
                type="button"
                onClick={fillDemoAdmin}
                style={{
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#0052CC',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#DBEAFE';
                  e.currentTarget.style.borderColor = '#93C5FD';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#EFF6FF';
                  e.currentTarget.style.borderColor = '#BFDBFE';
                }}
              >
                <Zap size={12} color="#FF6B00" />
                <span>Fill Lead Operator</span>
              </button> */}
            </div>

            {/* Alerts */}
            {errorMsg && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #F87171',
                color: '#991B1B',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                marginBottom: '20px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <ShieldAlert size={16} color="#DC2626" />
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
                fontSize: '12px',
                marginBottom: '20px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <CheckCircle2 size={16} color="#059669" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Operator Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Field 1: Operator Email */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#334155',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '7px'
                }}>
                  <Mail size={13} color="#0052CC" />
                  <span>Command Operator ID / Email</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: '#F8FAFC',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#0F172A',
                      fontSize: '13px',
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0052CC';
                      e.target.style.background = '#FFFFFF';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 82, 204, 0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#CBD5E1';
                      e.target.style.background = '#F8FAFC';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#334155',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '7px'
                }}>
                  <Lock size={13} color="#0052CC" />
                  <span>Security Master Passcode</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 42px 12px 14px',
                      background: '#F8FAFC',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#0F172A',
                      fontSize: '13px',
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0052CC';
                      e.target.style.background = '#FFFFFF';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 82, 204, 0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#CBD5E1';
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
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={15} color="#64748B" /> : <Eye size={15} color="#64748B" />}
                  </button>
                </div>
              </div>

              {/* Field 3: Hardware Security Key */}
              {/* <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#334155',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    <KeyRound size={13} color="#0052CC" />
                    <span>Station Token / Hardware Key</span>
                  </label>
                  <span style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    color: '#059669',
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}>
                    ENV CONFIGURED
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={stationKey}
                    onChange={(e) => setStationKey(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: '#F0F7FF',
                      border: '1.5px solid #93C5FD',
                      borderRadius: '8px',
                      color: '#0052CC',
                      fontSize: '13px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0052CC';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 82, 204, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#93C5FD';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div> */}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  marginTop: '6px',
                  background: 'linear-gradient(135deg, #0052CC 0%, #003685 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 6px 20px rgba(0, 82, 204, 0.35)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 82, 204, 0.45)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 82, 204, 0.35)';
                  }
                }}
              >
                <span>{isLoading ? 'Decrypting Session Handshake...' : 'Authorize Terminal Session'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Bottom Security Footer */}
            <div style={{
              marginTop: '24px',
              paddingTop: '18px',
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#64748B',
              fontFamily: 'var(--font-mono)'
            }}>
              <span>STATION: CENTRAL HUB #1</span>
              <span>GEO: IN-PB-LDH</span>
            </div>
          </div>

          {/* Compliance Tagline */}
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#64748B' }}>
            CBH Fasteners Tech Pvt. Ltd. • ISO 9001:2015 Operations Enclave
          </div>
        </div>
      </div>
    </main>
  );
}
