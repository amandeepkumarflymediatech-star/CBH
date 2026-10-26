'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Printer,
  CheckCircle2,
  AlertTriangle,
  FileCheck2
} from 'lucide-react';
import MainHeader from '@/components/header/MainHeader';
import CartDrawer from '@/components/cart/CartDrawer';
import { RfqLineItem } from '@/lib/types';

const REFUND_SECTIONS = [
  { id: 'ref-1', title: '1. Introduction and Scope' },
  { id: 'ref-2', title: '2. Eligibility for Returns' },
  { id: 'ref-3', title: '3. Return Procedure & RMA' },
  { id: 'ref-4', title: '4. Inspection, Approval & Replacement' },
  { id: 'ref-5', title: '5. Refund Terms & 10-Day Timeline' },
  { id: 'ref-6', title: '6. Contact & Dispute Resolution' }
];

export default function CancellationAndRefundPolicyPage() {
  const [activeSection, setActiveSection] = useState('ref-1');
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
            <span style={{ color: '#FF6B00', fontWeight: 700 }}>CUSTOMER ASSURANCE</span>
            <ChevronRight size={13} color="#FF6B00" />
            <span style={{ color: '#FFFFFF', fontWeight: 700 }}>CANCELLATION & REFUND POLICY</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 107, 0, 0.2)', border: '1px solid rgba(255, 107, 0, 0.4)', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, color: '#FFB020', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
                <RotateCcw size={14} color="#FF6B00" />
                <span>RMA PROTOCOL // 7-DAY RETURN WINDOW // 100% ACCOUNTABILITY</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '38px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
                Cancellation & Refund Policy
              </h1>
              <p style={{ fontSize: '14px', color: '#E2E8F0', marginTop: '8px', maxWidth: '700px', lineHeight: 1.6 }}>
                Clear, transparent guidelines for return requests, replacements, material inspection, RMA issuance, and refund processing timelines.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: '#93C5FD' }}>STATUS:</span> <strong>ACTIVE // 2026</strong>
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
              <RotateCcw size={16} color="#0052CC" />
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Returns Index
              </span>
            </div>

            {REFUND_SECTIONS.map((sec) => (
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
              Returns & RMA Support:
              <a href="mailto:sales@capitalbolts.co" style={{ color: '#0052CC', fontWeight: 700, display: 'block', marginTop: '4px', textDecoration: 'none' }}>
                sales@capitalbolts.co
              </a>
              <a href="tel:+919888021000" style={{ color: '#FF6B00', fontWeight: 800, display: 'block', marginTop: '4px', textDecoration: 'none' }}>
                📞 +91 98880 21000
              </a>
            </div>
          </aside>

          {/* Right Policy Body */}
          <main style={{ color: '#1E293B', lineHeight: 1.8, fontSize: '15px' }}>
            {/* Highlights Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#0052CC', fontFamily: 'var(--font-mono)' }}>DOMESTIC WINDOW</span>
                <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '4px 0' }}>7 Calendar Days</h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>From delivery date to initiate an RMA claim</p>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#0052CC', fontFamily: 'var(--font-mono)' }}>EXPORT WINDOW</span>
                <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '4px 0' }}>10 Calendar Days</h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>For international consignments & sea freight</p>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#FF6B00', fontFamily: 'var(--font-mono)' }}>REFUND SPEED</span>
                <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#FF6B00', margin: '4px 0' }}>10 Business Days</h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Direct bank credit or ledger credit note</p>
              </div>
            </div>

            {/* Section 1 */}
            <section id="ref-1" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                1. Introduction and Scope
              </h2>
              <p>
                This Return & Refund Policy (&apos;Policy&apos;) governs the return, replacement, and refund terms applicable to products purchased from <strong>Capital Bolts & Hardwares</strong> (&apos;CBH&apos;, &apos;we&apos;, &apos;our&apos;, or &apos;us&apos;) through our official website [<a href="https://cbh.store" style={{ color: '#0052CC' }}><u>https://cbh.store</u></a>], digital platforms, or authorized dealer portals.
              </p>
              <p>This Policy applies to:</p>
              <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
                <li>Direct customers (industrial infrastructure buyers, contractors, automotive OEMs, structural fabricators);</li>
                <li>Registered channel partners and authorized distribution dealers;</li>
                <li>International buyers, overseas importers, and export procurement clients.</li>
              </ul>
              <p>
                CBH is committed to maintaining quality and accountability in all aspects of procurement. While all efforts are made to ensure accurate, defect-free, and timely delivery, this Policy outlines the procedure to be followed in the event of a return request or refund claim arising from damaged goods, dispatch errors, or order cancellations under applicable terms.
              </p>
            </section>

            {/* Section 2 */}
            <section id="ref-2" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                2. Eligibility for Returns
              </h2>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0052CC', marginTop: '16px' }}>2.1 Returnable Items</h3>
              <p>The following categories of products may be eligible for return:</p>
              <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
                <li>Products received in a <strong>damaged or broken condition</strong> during transit;</li>
                <li>Products that are <strong>defective in material or workmanship</strong> upon delivery (verified against DIN/ISO tolerance standards);</li>
                <li>Items <strong>wrongly shipped</strong> (i.e., SKU mismatch, incorrect size, diameter, pitch, or material grade);</li>
                <li>Items that do not match the <strong>technical specifications</strong> agreed upon at the time of order confirmation (e.g., surface treatment, grade, thread tolerance).</li>
              </ul>

              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#D97706', marginTop: '16px' }}>2.2 Non-Returnable Items</h3>
              <p>The following categories are <strong>not eligible</strong> for return unless proven manufacturing defect:</p>
              <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
                <li><strong>Custom-fabricated fasteners</strong> manufactured per user CAD drawings or custom thread pitches;</li>
                <li><strong>Hot-dip galvanized, electroplated, or special-coated</strong> products made to order;</li>
                <li><strong>Surplus clearance lots</strong> sold under as-is liquidation pricing;</li>
                <li>Fasteners damaged due to improper jobsite installation or excessive tightening torque beyond DIN limits;</li>
                <li>Items returned beyond the prescribed return window.</li>
              </ul>

              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0052CC', marginTop: '16px' }}>2.3 Return Timeline</h3>
              <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
                <li>Domestic returns within India must be reported within <strong>7 (seven) calendar days</strong> from the date of physical delivery.</li>
                <li>International export returns must be reported within <strong>10 (ten) calendar days</strong> from customs arrival.</li>
              </ul>

              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0052CC', marginTop: '16px' }}>2.4 Product Condition</h3>
              <p>
                Products must be unused, uninstalled, and returned in their <strong>original master packaging</strong>, along with all labels, barcode tags, and manufacturer certificates.
              </p>
            </section>

            {/* Section 3 */}
            <section id="ref-3" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                3. Return Procedure and Documentation
              </h2>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0052CC', marginTop: '16px' }}>3.1 Initiating a Return Request</h3>
              <p>
                Contact CBH Customer Support via email at <a href="mailto:sales@capitalbolts.co" style={{ color: '#0052CC', fontWeight: 700 }}>sales@capitalbolts.co</a> or call <a href="tel:+919888021000" style={{ color: '#FF6B00', fontWeight: 800 }}>+91 98880 21000</a> with:
              </p>
              <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
                <li>Invoice number and PO reference</li>
                <li>Product SKU(s) and quantity</li>
                <li>Detailed reason for return with high-resolution photos showing defect or damage</li>
                <li>Date of receipt and transport delivery challan</li>
              </ul>
              <p>CBH will acknowledge receipt within <strong>two (2) business days</strong> and issue an official <strong>Return Material Authorization (RMA)</strong>.</p>

              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0052CC', marginTop: '16px' }}>3.3 Physical Return Facility Address</h3>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '8px' }}>
                <strong style={{ color: '#0F172A', display: 'block', marginBottom: '4px' }}>Capital Bolts & Hardwares (Returns & QC Hub)</strong>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                  Capital Towers, Gill Rd, opp. SBI, Miller Ganj, Ludhiana, Punjab 141003<br />
                  Phone: +91 98880 21000 | Email: sales@capitalbolts.co
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section id="ref-4" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                4. Inspection, Approval, and Replacement
              </h2>
              <p>
                Returned goods undergo quality control inspection by CBH metallurgy specialists within <strong>five (5) business days</strong> of receipt. If the defect or discrepancy is verified, CBH will issue a priority like-for-like replacement at no additional cost, or offer a refund/credit adjustment if stock is exhausted.
              </p>
            </section>

            {/* Section 5 */}
            <section id="ref-5" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                5. Refund Terms and Processing Timeline
              </h2>
              <p>Approved refunds are processed via:</p>
              <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
                <li><strong>Bank Transfer (NEFT/RTGS):</strong> Transferred back to the original verified bank account;</li>
                <li><strong>Ledger Credit Adjustment:</strong> Adjusted against pending or future purchase invoices for registered dealers;</li>
                <li><strong>Credit Note:</strong> Issued electronically with 1-year validity for procurement.</li>
              </ul>
              <p>
                Processing is completed within <strong>ten (10) business days</strong> from the date of inspection approval.
              </p>
            </section>

            {/* Section 6 */}
            <section id="ref-6" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                6. Contact and Dispute Resolution
              </h2>
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '24px'
                }}
              >
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
                  Returns & Grievance Department
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
                    <Clock size={18} color="#0052CC" />
                    <span>Mon - Sat: 10:00 AM - 6:00 PM IST</span>
                  </div>
                </div>
              </div>
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
