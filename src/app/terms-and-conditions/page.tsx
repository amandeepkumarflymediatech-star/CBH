'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  Printer,
  CheckCircle2
} from 'lucide-react';
import MainHeader from '@/components/header/MainHeader';
import CartDrawer from '@/components/cart/CartDrawer';
import { RfqLineItem } from '@/lib/types';

const SECTIONS = [
  { id: 'section-1', title: '1. Introduction & Acceptance of Terms' },
  { id: 'section-2', title: '2. Eligibility & Account Obligations' },
  { id: 'section-3', title: '3. Products, Pricing & Availability' },
  { id: 'section-4', title: '4. Payment Terms & Invoicing' },
  { id: 'section-5', title: '5. Shipping, Delivery & Risk of Loss' },
  { id: 'section-6', title: '6. Returns, Cancellations & Refunds' },
  { id: 'section-7', title: '7. Intellectual Property & Platform Restrictions' },
  { id: 'section-8', title: '8. Limitation of Liability & Indemnity' },
  { id: 'section-9', title: '9. Termination & Suspension of Access' },
  { id: 'section-10', title: '10. Governing Law & Jurisdiction' },
  { id: 'section-11', title: '11. Consent to Communication & TRAI Regulations' },
  { id: 'section-12', title: '12. Miscellaneous Provisions & Grievance' }
];

export default function TermsAndConditionsPage() {
  const [activeSection, setActiveSection] = useState('section-1');
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
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#BFDBFE', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>
            <Link href="/" style={{ color: '#BFDBFE', textDecoration: 'none' }}>HOME</Link>
            <ChevronRight size={13} color="#FF6B00" />
            <span style={{ color: '#FF6B00', fontWeight: 700 }}>LEGAL & GOVERNANCE</span>
            <ChevronRight size={13} color="#FF6B00" />
            <span style={{ color: '#FFFFFF', fontWeight: 700 }}>TERMS AND CONDITIONS</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 107, 0, 0.2)', border: '1px solid rgba(255, 107, 0, 0.4)', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, color: '#FFB020', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
                <ShieldCheck size={14} color="#FF6B00" />
                <span>OFFICIAL STATUTORY POLICY // B2B COMMERCIAL COMPLIANCE</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '38px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
                Terms and Conditions
              </h1>
              <p style={{ fontSize: '14px', color: '#E2E8F0', marginTop: '8px', maxWidth: '700px', lineHeight: 1.6 }}>
                Capital Bolts & Hardwares (CBH) procurement platform, user eligibility, commercial order placement, payment terms, and legal governing rights.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: '#93C5FD' }}>VERSION:</span> <strong>2026.1 // OCT 2026</strong>
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
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="container" style={{ padding: '48px 16px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '40px', alignItems: 'start' }}>
          {/* Left Sticky Table of Contents Sidebar */}
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
              <FileText size={16} color="#0052CC" />
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Contents Index
              </span>
            </div>

            {SECTIONS.map((sec) => (
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
              Need urgent procurement help?
              <a href="tel:+919888021000" style={{ color: '#FF6B00', fontWeight: 800, display: 'block', marginTop: '4px', textDecoration: 'none' }}>
                📞 +91 98880 21000
              </a>
            </div>
          </aside>

          {/* Right Policy Body */}
          <main style={{ color: '#1E293B', lineHeight: 1.8, fontSize: '15px' }}>
            {/* Callout Notice */}
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
                <strong style={{ color: '#0052CC', fontSize: '14px' }}>Binding Commercial Agreement Notice</strong>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                By accessing, browsing, registering with, or purchasing from Capital Bolts & Hardwares (CBH) via <a href="https://cbh.store" target="_blank" rel="noreferrer" style={{ color: '#0052CC', fontWeight: 700 }}>cbh.store</a> or through authorized dealer portals, you agree to comply with all terms stated below.
              </p>
            </div>

            {/* Section 1 */}
            <section id="section-1" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                1. Introduction and Acceptance of Terms
              </h2>
              <p>
                These Terms and Conditions (&apos;Terms&apos;) constitute a legally binding agreement between the user (&apos;you&apos;, &apos;your&apos;, &apos;User&apos;, or &apos;Dealer&apos;) and <strong>Capital Bolts & Hardwares</strong> (&apos;CBH&apos;, &apos;we&apos;, &apos;us&apos;, or &apos;our&apos;), a company registered and operating under the laws of India, governing your access to and use of the website [<a href="https://cbh.store" style={{ color: '#0052CC' }}><u>https://cbh.store</u></a>], our online procurement platform, mobile applications, and any services, features, or content offered therein (collectively, the &apos;Platform&apos;).
              </p>
              <p>
                By accessing, browsing, registering with, or using the Platform in any manner, you acknowledge that you have read, understood, and agreed to be bound by these Terms and all applicable laws and regulations. If you do not agree to these Terms, you must immediately discontinue use of the Platform and any services offered by CBH.
              </p>
              <p>
                CBH reserves the right to modify or update these Terms at its sole discretion and without prior notice. Continued use of the Platform after such modifications shall constitute your consent to the revised Terms. We recommend reviewing this page periodically for updates.
              </p>
            </section>

            {/* Section 2 */}
            <section id="section-2" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                2. Eligibility and User Account Obligations
              </h2>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0052CC', marginTop: '16px' }}>2.1 Eligibility</h3>
              <p>Use of the Platform is intended solely for:</p>
              <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
                <li>Individuals who are at least 18 years of age and legally competent to enter into binding contracts under applicable laws;</li>
                <li>Authorized representatives of business entities, including dealers, resellers, procurement professionals, or institutional buyers acting within the scope of their employment or commercial capacity.</li>
              </ul>
              <p>By using the Platform, you represent and warrant that you are not prohibited under any applicable law or regulation from accessing the Platform, and that you have the necessary authority to bind your organization to these Terms.</p>

              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0052CC', marginTop: '16px' }}>2.2 User Account Registration</h3>
              <p>
                Certain features of the Platform (e.g., bulk order placement, dealer dashboards, real-time inventory and quotation tools) require you to register for an account by providing accurate and complete information including:
              </p>
              <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
                <li>Full name, official company name, and designation</li>
                <li>Email address and mobile verification number</li>
                <li>GSTIN/VAT registration number and billing/shipping addresses</li>
              </ul>
              <p>CBH reserves the right to approve, suspend, or deny account access at its sole discretion.</p>

              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0052CC', marginTop: '16px' }}>2.3 Account Security</h3>
              <p>
                You are solely responsible for maintaining the confidentiality of your login credentials, restricting access to your registered devices, and for all activities that occur under your account. You agree to notify CBH immediately of any unauthorized use or suspected breach of your account.
              </p>
            </section>

            {/* Section 3 */}
            <section id="section-3" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                3. Products, Pricing, and Availability
              </h2>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0052CC', marginTop: '16px' }}>3.1 Product Listings</h3>
              <p>
                All products listed on the Platform, including their descriptions, specifications, dimensions, finishes, standards (e.g., DIN 933, DIN 934, ISO 4017, ETA Option 1), and technical drawings, are published in good faith for general commercial procurement purposes. While CBH strives to ensure 100% accuracy, we reserve the right to correct any errors, inaccuracies, or omissions at any time without prior notice.
              </p>

              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0052CC', marginTop: '16px' }}>3.2 Custom Orders & Technical Specifications</h3>
              <p>
                Users may request custom-manufactured fasteners, OEM components, or bulk supply under specific technical parameters. It is the responsibility of the User to provide accurate CAD drawings, standards, and material grades. CBH disclaims liability for performance failures arising from incomplete or inaccurate instructions provided by the User.
              </p>

              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0052CC', marginTop: '16px' }}>3.3 Pricing and Currency</h3>
              <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
                <li>All prices listed on the Platform are subject to change without prior notice and are exclusive of applicable taxes (GST), duties, shipping charges, and levies unless explicitly stated otherwise.</li>
                <li>Pricing may vary depending on region, quantity slab tier (e.g., Gold, Platinum, Diamond, VIP OEM), dispatch method, or contractual status.</li>
                <li>Prices are quoted in INR (Indian Rupees) for domestic transactions and in USD or other currencies for international buyers as applicable.</li>
              </ul>

              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0052CC', marginTop: '16px' }}>3.4 Availability and Stock Status</h3>
              <p>
                Product availability is dynamic and subject to inventory movement. In case of unexpected stockouts, CBH reserves the right to cancel or delay the order in part or full, with prompt notification and refund/adjustment to the User.
              </p>
            </section>

            {/* Section 4 */}
            <section id="section-4" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                4. Payment Terms and Invoicing
              </h2>
              <p>CBH accepts the following payment methods for orders placed through its Platform:</p>
              <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
                <li>Online payment via authorized payment gateways (UPI, Net Banking, Credit/Debit Cards)</li>
                <li>Direct Bank Transfer via NEFT / RTGS / IMPS</li>
                <li>Letter of Credit (LC) or Telegraphic Transfer (TT) for international consignments</li>
                <li>Institutional credit terms (Net 15 / Net 30 days) for pre-approved corporate dealer accounts</li>
              </ul>
              <p>
                All transactions are accompanied by a tax-compliant electronic GST invoice issued under applicable Indian laws. For approved dealers with credit accounts, payment must be made strictly within the agreed credit term. Late payments may attract interest at prevailing commercial rates.
              </p>
            </section>

            {/* Section 5 */}
            <section id="section-5" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                5. Shipping, Delivery, and Risk of Loss
              </h2>
              <p>
                CBH offers shipping services across all industrial corridors in India and international destinations in over 50 countries. Dispatch timelines and delivery schedules are indicative and subject to product category, surface/air freight schedules, and weather/force majeure events.
              </p>
              <p>
                <strong>Transfer of Risk:</strong> Risk of loss or damage to goods passes to the User upon dispatch from CBH&apos;s facility or upon handover to the designated logistics carrier. For export shipments under EXW, FOB, or CIF, risk transfers in accordance with agreed Incoterms.
              </p>
              <p>
                <strong>Inspection & Claims:</strong> Users must inspect all shipments upon delivery and report visible damages or shortages within <strong>48 hours</strong> of receipt. Claims for concealed defects must be submitted within <strong>five (5) business days</strong> with photographic proof.
              </p>
            </section>

            {/* Section 6 */}
            <section id="section-6" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                6. Returns, Cancellations, and Refunds
              </h2>
              <p>
                Returns are accepted if products received are materially defective, damaged in transit, or significantly different from agreed specifications, and reported within <strong>seven (7) days</strong> of receipt.
              </p>
              <p>
                Custom-fabricated, hot-dip galvanized, or clearance surplus items are <strong>non-returnable</strong> unless proven defective. All returns require a written <strong>Return Material Authorization (RMA)</strong> prior to dispatch back to CBH. Approved refunds are processed within <strong>ten (10) business days</strong>.
              </p>
            </section>

            {/* Section 7 */}
            <section id="section-7" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                7. Intellectual Property and Platform Usage
              </h2>
              <p>
                All catalogs, 3D models, technical matrices, imagery, logos, brand trademarks, and software code on the Platform are the intellectual property of Capital Bolts & Hardwares (&apos;CBH&apos;) protected under the Indian Copyright Act, 1957, and the Trademarks Act, 1999. Unauthorized scraping, copying, framing, or commercial reproduction is strictly prohibited.
              </p>
            </section>

            {/* Section 8 */}
            <section id="section-8" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                8. Limitation of Liability and Indemnity
              </h2>
              <p>
                To the maximum extent permitted by applicable law, CBH shall not be liable for indirect, incidental, special, or consequential damages, including production loss or jobsite downtime. In no event shall CBH&apos;s aggregate liability exceed the total amount paid by the User for the specific purchase order giving rise to the claim.
              </p>
            </section>

            {/* Section 9 */}
            <section id="section-9" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                9. Termination and Suspension of Access
              </h2>
              <p>
                CBH reserves the right to suspend or terminate accounts for violations of these Terms, non-payment of invoices, fraudulent activity, or misuse of CBH digital assets.
              </p>
            </section>

            {/* Section 10 */}
            <section id="section-10" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                10. Governing Law and Jurisdiction
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the Republic of India. The courts located in <strong>Ludhiana, Punjab, India</strong> shall have exclusive jurisdiction over any disputes or claims.
              </p>
            </section>

            {/* Section 11 */}
            <section id="section-11" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                11. Consent to Communication & TRAI Regulations
              </h2>
              <p>
                You explicitly consent to CBH contacting you via SMS, email, telephone, and electronic notifications for order updates, RFQ quotations, and dispatch status. CBH strictly adheres to Telecom Regulatory Authority of India (TRAI) guidelines and respects National DND Registry preferences. Users may opt out at any time.
              </p>
            </section>

            {/* Section 12 */}
            <section id="section-12" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                12. Miscellaneous Provisions & Grievance Redressal
              </h2>
              <p>
                If you have any questions or grievances related to these Terms, please contact our grievance team:
              </p>

              {/* Official Grievance Contact Card */}
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
                  Capital Bolts & Hardwares (CBH) — Grievance Redressal
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
