'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Lock,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Printer,
  FileCheck2,
  CheckCircle2,
  Globe2
} from 'lucide-react';
import MainHeader from '@/components/header/MainHeader';
import CartDrawer from '@/components/cart/CartDrawer';
import { RfqLineItem } from '@/lib/types';

const PRIVACY_SECTIONS = [
  { id: 'priv-1', title: '1. Introduction' },
  { id: 'priv-2', title: '2. Definitions' },
  { id: 'priv-3', title: '3. Information We Collect' },
  { id: 'priv-4', title: '4. Purpose & Lawful Basis of Processing' },
  { id: 'priv-5', title: '5. Disclosure to Third Parties' },
  { id: 'priv-6', title: '6. Data Retention & Storage' },
  { id: 'priv-7', title: '7. Data Security Measures' },
  { id: 'priv-8', title: '8. Data Subject Rights' },
  { id: 'priv-9', title: '9. Cookies & Tracking Technologies' },
  { id: 'priv-10', title: '10. International Data Transfers' },
  { id: 'priv-11', title: '11. DPO Contact & Complaints' },
  { id: 'priv-12', title: '12. Updates to This Policy' }
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('priv-1');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>
      <MainHeader onOpenCart={() => setIsCartOpen(true)} cartCount={cartItems.length} />

      {/* Hero Header */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)',
          padding: '48px 0 40px',
          color: '#FFFFFF',
          borderBottom: '4px solid #FF6B00'
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#BFDBFE', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>
            <Link href="/" style={{ color: '#BFDBFE', textDecoration: 'none' }}>HOME</Link>
            <ChevronRight size={13} color="#FF6B00" />
            <span style={{ color: '#FF6B00', fontWeight: 700 }}>DATA PRIVACY & SECURITY</span>
            <ChevronRight size={13} color="#FF6B00" />
            <span style={{ color: '#FFFFFF', fontWeight: 700 }}>PRIVACY POLICY</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 107, 0, 0.2)', border: '1px solid rgba(255, 107, 0, 0.4)', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, color: '#FFB020', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
                <Lock size={14} color="#FF6B00" />
                <span>GDPR & IT ACT 2000 COMPLIANT // ISO 27001 FRAMEWORK</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '38px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
                Privacy Policy
              </h1>
              <p style={{ fontSize: '14px', color: '#E2E8F0', marginTop: '8px', maxWidth: '700px', lineHeight: 1.6 }}>
                How Capital Bolts & Hardwares (CBH) collects, processes, stores, and protects personal and commercial procurement data.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: '#93C5FD' }}>EFFECTIVE:</span> <strong>OCTOBER 2026</strong>
              </div>
              <button
                onClick={() => window.print()}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Printer size={14} />
                <span>Print Policy</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="container" style={{ padding: '48px 16px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '40px', alignItems: 'start' }}>
          {/* Left Table of Contents */}
          <aside
            style={{
              position: 'sticky',
              top: '90px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
            className="hide-mobile"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
              <Shield size={16} color="#0052CC" />
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Privacy Index
              </span>
            </div>

            {PRIVACY_SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                style={{
                  textAlign: 'left',
                  background: activeSection === sec.id ? 'rgba(0, 82, 204, 0.08)' : 'transparent',
                  color: activeSection === sec.id ? '#0052CC' : '#475569',
                  border: 'none',
                  borderLeft: activeSection === sec.id ? '3px solid #0052CC' : '3px solid transparent',
                  padding: '8px 12px',
                  borderRadius: '0 6px 6px 0',
                  fontSize: '12px',
                  fontWeight: activeSection === sec.id ? 800 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  lineHeight: 1.4
                }}
              >
                {sec.title}
              </button>
            ))}

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E2E8F0', fontSize: '11px', color: '#64748B' }}>
              Data Protection Officer:
              <a href="mailto:sales@capitalbolts.co" style={{ color: '#0052CC', fontWeight: 700, display: 'block', marginTop: '4px', textDecoration: 'none' }}>
                sales@capitalbolts.co
              </a>
            </div>
          </aside>

          {/* Right Policy Body */}
          <main style={{ color: '#1E293B', lineHeight: 1.8, fontSize: '15px' }}>
            <div
              style={{
                background: 'rgba(0, 82, 204, 0.04)',
                border: '1px solid rgba(0, 82, 204, 0.2)',
                borderLeft: '4px solid #0052CC',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '36px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <CheckCircle2 size={18} color="#0052CC" />
                <strong style={{ color: '#0052CC', fontSize: '14px' }}>Commitment to Customer & Enterprise Privacy</strong>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                Capital Bolts & Hardwares (CBH) is dedicated to protecting the confidentiality and security of personal, commercial, and financial information collected across our website (<a href="https://cbh.store" target="_blank" rel="noreferrer" style={{ color: '#0052CC', fontWeight: 700 }}>cbh.store</a>), mobile applications, and barcode-integrated dealer procurement portals.
              </p>
            </div>

            {/* Section 1 */}
            <section id="priv-1" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                1. Introduction
              </h2>
              <p>
                This Privacy Policy (&apos;Policy&apos;) outlines the practices of <strong>Capital Bolts & Hardwares</strong> (&apos;CBH&apos;, &apos;we&apos;, &apos;our&apos;, or &apos;us&apos;) regarding the collection, use, storage, disclosure, and protection of personal and business-related data. CBH is committed to ensuring the privacy and protection of information collected from users of our website [<a href="https://cbh.store" style={{ color: '#0052CC' }}><u>https://cbh.store</u></a>], our digital platform CBH.Store, and associated services offered through web, mobile, and dealer-based applications.
              </p>
              <p>
                By accessing or using our services, you consent to the terms set forth in this Privacy Policy. This Policy is designed under applicable data protection regulations, including but not limited to the Information Technology Act, 2000 (India), the General Data Protection Regulation (EU) 2016/679 (&quot;GDPR&quot;), and any other jurisdiction-specific rules where CBH operates.
              </p>
            </section>

            {/* Section 2 */}
            <section id="priv-2" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                2. Definitions
              </h2>
              <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
                <li><strong>&apos;Personal Data&apos;:</strong> Any information that identifies or can reasonably be used to identify an individual, including name, email, phone number, billing/shipping address, and tax identification numbers.</li>
                <li><strong>&apos;Dealer&apos;:</strong> Authorized distribution partner, reseller, or entity enrolled in CBH&apos;s barcode-integrated dealership network or registered on our proprietary digital platform.</li>
                <li><strong>&apos;Platform(s)&apos;:</strong> All websites, digital interfaces, APIs, and systems operated by CBH, including cbh.store.</li>
                <li><strong>&apos;Processing&apos;:</strong> Any operation performed on Personal Data such as collection, recording, storage, retrieval, disclosure, or deletion.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="priv-3" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                3. Information We Collect
              </h2>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0052CC', marginTop: '16px' }}>3.1 Personally Identifiable Information (PII)</h3>
              <p>Full name, company name, designation, email address, mobile phone number, billing and shipping address, and GSTIN/VAT business registration identifiers.</p>

              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0052CC', marginTop: '16px' }}>3.2 Account & Commercial Data</h3>
              <p>Login credentials, purchase history, order invoices, SKU-level procurement behavior, RFQ requests, and payment gateway references (CBH does not store raw credit/debit card numbers directly).</p>

              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0052CC', marginTop: '16px' }}>3.3 Technical & Logistics Data</h3>
              <p>IP addresses, browser and device type, referring URLs, warehouse dispatch tracking, and delivery confirmation records.</p>
            </section>

            {/* Section 4 */}
            <section id="priv-4" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                4. Purpose and Use of Collected Information
              </h2>
              <p>CBH processes collected information for:</p>
              <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
                <li>Executing and confirming orders, dispatching shipments, and managing logistics across India and globally;</li>
                <li>Facilitating dealer account credit limits, real-time stock dashboards, and dual unit (PCS/KGS) invoicing;</li>
                <li>Statutory tax compliance, GST e-way billing, customs export declarations, and audit records;</li>
                <li>Customer support, EN 10204 3.1 Mill Test Certificate delivery, and warranty claim tracking;</li>
                <li>Security, fraud prevention, and firewalls.</li>
              </ul>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0052CC', marginTop: '16px' }}>4.8 Legal Basis under GDPR (EU/EEA Clients)</h3>
              <p>
                For clients in the European Union or European Economic Area, data is processed lawfully under Article 6 of the GDPR based on Contractual Performance, Legal Obligation (customs and tax laws), and Legitimate Commercial Interests.
              </p>
            </section>

            {/* Section 5 */}
            <section id="priv-5" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                5. Disclosure of Information to Third Parties
              </h2>
              <p>
                CBH discloses data only where strictly necessary for operational execution:
              </p>
              <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
                <li><strong>Logistics Providers:</strong> Freight forwarders and surface cargo partners for order dispatch;</li>
                <li><strong>Customs & Ports:</strong> Customs clearance agencies, port operators, and trade regulators for cross-border export shipments;</li>
                <li><strong>Technology Providers:</strong> Cloud infrastructure, ERP, and payment processing gateways bound by strict confidentiality;</li>
                <li><strong>Legal Disclosures:</strong> In response to court orders or statutory government requests.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="priv-6" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                6. Data Retention and Storage
              </h2>
              <p>
                Transactional records, tax invoices, and shipping logs are retained for a minimum of <strong>seven (7) years</strong> in compliance with Indian commercial, GST, and export laws. Dealer account data is retained for the duration of the commercial relationship plus <strong>three (3) years</strong> for financial reconciliation.
              </p>
            </section>

            {/* Section 7 */}
            <section id="priv-7" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                7. Data Security Measures
              </h2>
              <p>
                CBH deploys multi-layered technical controls including 256-bit SSL encryption, Role-Based Access Control (RBAC), multi-factor authentication (MFA) on dealer portals, real-time intrusion monitoring (IDS/IPS), and physical access controls at our central facilities.
              </p>
            </section>

            {/* Section 8 */}
            <section id="priv-8" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                8. Data Subject Rights
              </h2>
              <p>
                Users have the right to access, rectify, or request deletion of their personal data, restrict processing, or request data portability under applicable laws. To exercise these rights, please email our Data Protection Desk at <a href="mailto:sales@capitalbolts.co" style={{ color: '#0052CC', fontWeight: 700 }}>sales@capitalbolts.co</a>.
              </p>
            </section>

            {/* Section 9 */}
            <section id="priv-9" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                9. Cookies and Tracking Technologies
              </h2>
              <p>
                We use strictly necessary cookies for session management and shopping cart persistence, performance cookies for analytics, and preference cookies to remember user units (PCS / KGS). Users can manage cookie preferences via browser settings.
              </p>
            </section>

            {/* Section 10 */}
            <section id="priv-10" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                10. International Data Transfers
              </h2>
              <p>
                For international transactions, cross-border data transfers are executed under approved Standard Contractual Clauses (SCCs) to ensure the same high level of protection across jurisdictions.
              </p>
            </section>

            {/* Section 11 */}
            <section id="priv-11" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                11. Data Protection Contact & Complaints
              </h2>
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '24px',
                  marginTop: '16px'
                }}
              >
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
                  Capital Bolts & Hardwares (CBH) — Data Privacy Desk
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={18} color="#0052CC" />
                    <span>Capital Towers, Gill Rd, opp. SBI, Miller Ganj, Ludhiana, Punjab 141003</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Phone size={18} color="#FF6B00" />
                    <a href="tel:+919888021000" style={{ color: '#0052CC', fontWeight: 700, textDecoration: 'none' }}>+91 98880 21000</a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Mail size={18} color="#0052CC" />
                    <a href="mailto:sales@capitalbolts.co" style={{ color: '#0052CC', fontWeight: 700, textDecoration: 'none' }}>sales@capitalbolts.co</a>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 12 */}
            <section id="priv-12" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                12. Updates to This Privacy Policy
              </h2>
              <p>
                CBH reserves the right to amend this Privacy Policy from time to time. All changes take effect immediately upon being published on [<a href="https://cbh.store" style={{ color: '#0052CC' }}><u>https://cbh.store</u></a>].
              </p>
            </section>
          </main>
        </div>
      </div>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={() => {}}
        onRemoveItem={() => {}}
      />
    </div>
  );
}
