'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainHeader from '@/components/header/MainHeader';
import NavSubBar from '@/components/header/NavSubBar';
import { Building2, User, Mail, Phone, Lock, FileText, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tierPreference, setTierPreference] = useState<'GOLD' | 'PLATINUM' | 'DIAMOND'>('DIAMOND');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (gstin && gstin.length !== 15) {
      setErrorMsg('GSTIN must be exactly 15 characters (e.g. 29AABCA1234F1Z5).');
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
        throw new Error(data.error || 'Registration failed');
      }

      setSuccessMsg('Enterprise account registered successfully! Initializing Client Portal...');
      setTimeout(() => {
        router.push('/customer');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating account. Please verify input.');
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

      <div className="container" style={{ padding: '50px 24px 80px', maxWidth: '640px' }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--color-surface-border)',
          borderRadius: 'var(--radius-md)',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-md)',
          borderTop: '4px solid var(--color-primary)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Link href="/" style={{ display: 'inline-block', marginBottom: '14px' }}>
              <img
                src="/assets/logo_blue.png"
                alt="CBH Fasteners"
                style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
            <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#D2051E', fontWeight: 800, textTransform: 'uppercase' }}>
              B2B & B2C PROCUREMENT REGISTRATION
            </span>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '28px', fontWeight: 800, color: 'var(--color-dark-900)', marginTop: '4px' }}>
              Create Enterprise Account
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Unlock wholesale volume discount slabs (up to 25% OFF), NABL 3.1 Mill Test certificates, and 30-day PO credit line.
            </p>
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="finder-field">
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={12} />
                  <span>Authorized Representative</span>
                </label>
                <input
                  type="text"
                  className="finder-select"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="finder-field">
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Building2 size={12} />
                  <span>Company / Enterprise Name</span>
                </label>
                <input
                  type="text"
                  className="finder-select"
                  required
                  placeholder="e.g. Apex Heavy Infra Ltd."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            </div>

            <div className="finder-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText size={12} />
                  <span>15-Digit Indian GSTIN</span>
                </label>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  State Code + PAN + Entity
                </span>
              </div>
              <input
                type="text"
                className="finder-select"
                maxLength={15}
                placeholder="e.g. 29AABCA1234F1Z5 (Optional for retail)"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="finder-field">
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={12} />
                  <span>Business Email</span>
                </label>
                <input
                  type="email"
                  className="finder-select"
                  required
                  placeholder="procurement@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="finder-field">
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={12} />
                  <span>Contact Mobile / WhatsApp</span>
                </label>
                <input
                  type="tel"
                  className="finder-select"
                  required
                  placeholder="+91 98880 21000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="finder-field">
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={12} />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  className="finder-select"
                  required
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="finder-field">
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={12} />
                  <span>Confirm Password</span>
                </label>
                <input
                  type="password"
                  className="finder-select"
                  required
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="finder-field">
              <label>Procurement Volume Scale</label>
              <select
                className="finder-select"
                value={tierPreference}
                onChange={(e: any) => setTierPreference(e.target.value)}
              >
                <option value="GOLD">Standard Fabricator / Workshop (Up to 5 MT/Year - 8% Slab)</option>
                <option value="PLATINUM">Infrastructure Sub-Contractor (5-20 MT/Year - 12% Slab)</option>
                <option value="DIAMOND">Heavy OEM / EPC Turnkey Project (20+ MT/Year - 18% Wholesale)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', marginTop: '6px' }}>
              <input
                type="checkbox"
                id="terms"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{ marginTop: '2px' }}
              />
              <label htmlFor="terms" style={{ color: 'var(--color-dark-800)' }}>
                I agree to the <Link href="#" style={{ color: '#D2051E', textDecoration: 'underline' }}>Terms & Conditions</Link>, BIS 1364 metallurgical quality protocols, and NABL batch traceability terms.
              </label>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ padding: '12px', marginTop: '8px' }}
            >
              <span>{isLoading ? 'Registering Account...' : 'Submit & Activate Client Account'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Bottom */}
          <div style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--color-surface-subtle)',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--color-text-muted)'
          }}>
            Already have an active account?{' '}
            <Link href="/login" style={{ color: '#D2051E', fontWeight: 700 }}>
              Sign In to Console
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
