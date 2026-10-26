'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  FileText,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  Percent,
  Truck,
  CreditCard,
  Award,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { setStoredUser, AuthUser } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tierPreference, setTierPreference] = useState<'GOLD' | 'PLATINUM' | 'DIAMOND'>('DIAMOND');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fillSampleEnterprise = () => {
    setFullName('Rajeshwar Singh');
    setCompanyName('Ludhiana Heavy Engineering Works');
    setGstin('03AABCL9876E1Z4');
    setEmail('purchase@ludhianaheavy.com');
    setPhone('+91 98765 43210');
    setPassword('Fastener@2025');
    setConfirmPassword('Fastener@2025');
    setTierPreference('DIAMOND');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your entries.');
      return;
    }

    if (gstin && gstin.length !== 15) {
      setErrorMsg('GSTIN must be exactly 15 characters (e.g. 03AABCL9876E1Z4).');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          companyName,
          gstin: gstin.toUpperCase(),
          email,
          phone,
          password,
          tierPreference,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      const registeredUser: AuthUser = {
        id: data.data?.id || Date.now(),
        email,
        fullName,
        companyName,
        gstin: gstin.toUpperCase(),
        phone,
        role: 'customer',
        tier: tierPreference,
        tierDiscountPct: tierPreference === 'DIAMOND' ? 18 : tierPreference === 'PLATINUM' ? 12 : 5,
      };
      setStoredUser(registeredUser);

      setSuccessMsg('Enterprise account approved! Preparing your customized procurement portal...');
      setTimeout(() => {
        router.push('/customer');
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating account. Please verify input.');
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
              ENTERPRISE ONBOARDING
            </span>
            <span style={{ fontSize: '11px', color: '#64748B' }}>• Client &amp; OEM Registration</span>
          </div>
        </div>

        {/* Support Hotline & Storefront Return */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '12px' }}>
            <Phone size={13} color="#FF6B00" />
            <span>Hotline: <strong style={{ color: '#0F172A' }}>+91 98880 21000</strong></span>
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
          maxWidth: '1180px',
          background: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.1), 0 0 0 1px #E2E8F0',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          minHeight: '680px'
        }}>
          
          {/* LEFT WING: Industrial OEM Privileges & Volume Slabs */}
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
            {/* Background Decorative Glow */}
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

            {/* Top Content */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '5px 12px', borderRadius: '30px', marginBottom: '20px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8', display: 'inline-block', boxShadow: '0 0 8px #38BDF8' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#BAE6FD', textTransform: 'uppercase' }}>
                  ENTERPRISE OEM PROCUREMENT
                </span>
              </div>

              <h2 style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '28px',
                fontWeight: 900,
                lineHeight: 1.25,
                letterSpacing: '-0.02em',
                marginBottom: '14px'
              }}>
                Unlock Factory-Direct <br />
                <span style={{ background: 'linear-gradient(90deg, #60A5FA, #93C5FD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Wholesale Fastener Slabs
                </span>
              </h2>

              <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6, maxWidth: '420px', marginBottom: '28px' }}>
                Join India’s premier network of verified EPC contractors, automotive manufacturers, and heavy engineering plants with direct mill pricing and batch traceability.
              </p>

              {/* Benefits Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                      Up to 25% Flat Volume Slabs
                    </h4>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                      Dynamic pricing slabs automatically discounted on full pallets, container lots, and monthly off-take agreements.
                    </p>
                  </div>
                </div>

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
                      NABL Lab &amp; MTC 3.1 Traceability
                    </h4>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                      Direct batch chemical composition, tensile pull test, and proof load test reports linked to each dispatched consignment.
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
                    <CreditCard size={17} color="#6EE7B7" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', margin: 0, marginBottom: '2px' }}>
                      Revolving 30-Day Credit Terms
                    </h4>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                      Instant credit evaluation for verified GST-registered manufacturers with flexible payment milestones.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Tier Overview */}
            <div style={{
              marginTop: '32px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Tier Slab Benchmarks
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#FCD34D' }}>GOLD</div>
                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>&lt; 5 MT/Yr</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>8% Off</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#E2E8F0' }}>PLATINUM</div>
                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>5-20 MT/Yr</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>12% Off</div>
                </div>
                <div style={{ background: 'rgba(0, 82, 204, 0.25)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(96, 165, 250, 0.4)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#93C5FD' }}>DIAMOND</div>
                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>20+ MT/Yr</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#34D399', marginTop: '2px' }}>18% Off</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT WING: Registration Form */}
          <div style={{
            padding: '40px 38px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: '#FFFFFF'
          }}>
            <div>
              {/* Form Title & Quick Fill Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '4px 10px', borderRadius: '6px', color: '#0052CC', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    <Building2 size={12} />
                    <span>CORPORATE ACCOUNT CREATION</span>
                  </div>
                  <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Register Enterprise Buyer
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={fillSampleEnterprise}
                  title="Automatically fill verified sample enterprise details"
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
                  <span>Sample Data</span>
                </button>
              </div>

              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '-6px', marginBottom: '20px', lineHeight: 1.5 }}>
                Enter your industrial enterprise details to activate your custom rate contract and digital PO portal.
              </p>

              {/* Alerts */}
              {errorMsg && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #F87171',
                  color: '#991B1B',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  marginBottom: '18px',
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
                  marginBottom: '18px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={16} color="#059669" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Row 1: Representative & Company */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                      Representative Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                        <User size={15} color="#0052CC" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rajeshwar Singh"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 12px 11px 38px',
                          background: '#F8FAFC',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: '8px',
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

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                      Enterprise / Company Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                        <Building2 size={15} color="#0052CC" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ludhiana Heavy Engg."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 12px 11px 38px',
                          background: '#F8FAFC',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: '8px',
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
                </div>

                {/* Row 2: 15-Digit GSTIN */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      15-Digit Indian GSTIN
                    </label>
                    <span style={{ fontSize: '10px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                      State Code + PAN + Entity
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                      <FileText size={15} color="#0052CC" />
                    </div>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="e.g. 03AABCL9876E1Z4 (Required for GST Input Tax Credit)"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      style={{
                        width: '100%',
                        padding: '11px 12px 11px 38px',
                        background: '#F8FAFC',
                        border: '1.5px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#0F172A',
                        textTransform: 'uppercase',
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
                        e.target.style.borderColor = '#E2E8F0';
                        e.target.style.background = '#F8FAFC';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Row 3: Email & Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                      Business Email
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                        <Mail size={15} color="#0052CC" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="purchase@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 12px 11px 38px',
                          background: '#F8FAFC',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: '8px',
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

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                      Mobile / WhatsApp
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                        <Phone size={15} color="#0052CC" />
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98880 21000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 12px 11px 38px',
                          background: '#F8FAFC',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: '8px',
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
                </div>

                {/* Row 4: Password & Confirm Password */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                      Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                        <Lock size={15} color="#0052CC" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 38px 11px 38px',
                          background: '#F8FAFC',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: '8px',
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
                          right: '10px',
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
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                      Confirm Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                        <Lock size={15} color="#0052CC" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 12px 11px 38px',
                          background: '#F8FAFC',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: '8px',
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
                </div>

                {/* Row 5: Procurement Scale */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                    Annual Procurement Volume Scale
                  </label>
                  <select
                    value={tierPreference}
                    onChange={(e: any) => setTierPreference(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      background: '#F8FAFC',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#0F172A',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="GOLD">Standard Fabricator / Workshop (Up to 5 MT/Year — 8% Slab)</option>
                    <option value="PLATINUM">Infrastructure Sub-Contractor (5-20 MT/Year — 12% Slab)</option>
                    <option value="DIAMOND">Heavy OEM / EPC Turnkey Project (20+ MT/Year — 18% Wholesale)</option>
                  </select>
                </div>

                {/* Terms Agreement */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', marginTop: '2px' }}>
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{ marginTop: '2px', accentColor: '#0052CC', cursor: 'pointer' }}
                  />
                  <label htmlFor="terms" style={{ color: '#475569', lineHeight: 1.4 }}>
                    I agree to the <Link href="/terms-and-conditions" style={{ color: '#0052CC', textDecoration: 'underline' }}>Terms &amp; Conditions</Link>, BIS 1364 metallurgical quality protocols, and NABL batch traceability terms.
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '13px 20px',
                    marginTop: '4px',
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
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
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
                  <span>{isLoading ? 'Creating Account...' : 'Submit & Activate Client Account'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>

            {/* Bottom Login Link */}
            <div style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid #F1F5F9',
              textAlign: 'center',
              fontSize: '13px',
              color: '#64748B'
            }}>
              Already have an active buyer account?{' '}
              <Link href="/login" style={{ color: '#0052CC', fontWeight: 700, textDecoration: 'none' }}>
                Sign In to Procurement &rarr;
              </Link>
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
