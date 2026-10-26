'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  ShieldCheck,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Printer,
  CheckCircle2,
  Globe2,
  Anchor,
  Plane,
  PackageCheck
} from 'lucide-react';
import MainHeader from '@/components/header/MainHeader';
import CartDrawer from '@/components/cart/CartDrawer';
import { RfqLineItem } from '@/lib/types';

const SHIPPING_SECTIONS = [
  { id: 'ship-1', title: '1. Introduction and Scope' },
  { id: 'ship-2', title: '2. Shipping Methods & Coverage' },
  { id: 'ship-3', title: '3. Order Processing & Tracking' },
  { id: 'ship-4', title: '4. Freight Charges, Taxes & Duties' },
  { id: 'ship-5', title: '5. Timelines, Delays & Risk Transfer' },
  { id: 'ship-6', title: '6. Delivery Acceptance & Claims' }
];

export default function ShippingAndDeliveryPolicyPage() {
  const [activeSection, setActiveSection] = useState('ship-1');
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
            <span style={{ color: '#FF6B00', fontWeight: 700 }}>LOGISTICS & FULFILLMENT</span>
            <ChevronRight size={13} color="#FF6B00" />
            <span style={{ color: '#FFFFFF', fontWeight: 700 }}>SHIPPING & DELIVERY POLICY</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 107, 0, 0.2)', border: '1px solid rgba(255, 107, 0, 0.4)', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, color: '#FFB020', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
                <Truck size={14} color="#FF6B00" />
                <span>PAN-INDIA DISPATCH // 50+ COUNTRIES EXPORT // INCOTERMS COMPLIANT</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '38px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
                Shipping and Delivery Policy
              </h1>
              <p style={{ fontSize: '14px', color: '#E2E8F0', marginTop: '8px', maxWidth: '700px', lineHeight: 1.6 }}>
                Comprehensive terms covering domestic express freight, container export logistics, Incoterms (EXW/FOB/CIF), dispatch timelines, and inspection claims.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: '#93C5FD' }}>POLICY CODE:</span> <strong>CBH-LOG-2026</strong>
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
              <Truck size={16} color="#0052CC" />
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Logistics Index
              </span>
            </div>

            {SHIPPING_SECTIONS.map((sec) => (
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
              Direct Dispatch Hotline:
              <a href="tel:+919888021000" style={{ color: '#FF6B00', fontWeight: 800, display: 'block', marginTop: '4px', textDecoration: 'none' }}>
                📞 +91 98880 21000
              </a>
            </div>
          </aside>

          {/* Right Policy Body */}
          <main style={{ color: '#1E293B', lineHeight: 1.8, fontSize: '15px' }}>
            {/* 3 Logistics Modes Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '36px' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Truck size={20} color="#0052CC" />
                  <strong style={{ fontSize: '14px', color: '#0F172A' }}>Domestic Surface / Air</strong>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#0052CC', marginBottom: '4px' }}>
                  3 to 10 Days
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                  Door-to-door delivery across all 28 states with live tracking & electronic E-Way bills.
                </p>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Anchor size={20} color="#0052CC" />
                  <strong style={{ fontSize: '14px', color: '#0F172A' }}>Sea Freight (FCL / LCL)</strong>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#0052CC', marginBottom: '4px' }}>
                  15 to 45 Days
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                  Containerized cargo to over 50 countries via Nhava Sheva & Mundra sea ports.
                </p>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Plane size={20} color="#FF6B00" />
                  <strong style={{ fontSize: '14px', color: '#0F172A' }}>Express Air Cargo</strong>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#FF6B00', marginBottom: '4px' }}>
                  7 to 14 Days
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                  Expedited air freight for urgent infrastructure projects and shut-down emergencies.
                </p>
              </div>
            </div>

            {/* Section 1 */}
            <section id="ship-1" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                1. Introduction and Scope
              </h2>
              <p>
                This Shipping & Delivery Policy (&apos;Policy&apos;) sets forth the terms and conditions governing the shipment, dispatch, and delivery of products supplied by <strong>Capital Bolts & Hardwares</strong> (&apos;CBH&apos;, &apos;we&apos;, &apos;our&apos;, or &apos;us&apos;) through its website [<a href="https://cbh.store" style={{ color: '#0052CC' }}><u>https://cbh.store</u></a>], digital platforms, and authorized dealer channels.
              </p>
              <p>
                CBH is committed to delivering precision fasteners, wedge anchors, and heavy-duty structural hardware in a timely, secure, and transparent manner. This Policy outlines our standard freight practices, responsibilities of each party, applicable timelines, and key obligations related to delivery and acceptance.
              </p>
            </section>

            {/* Section 2 */}
            <section id="ship-2" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                2. Shipping Methods and Service Coverage
              </h2>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0052CC', marginTop: '16px' }}>2.1 Domestic Shipping (Within India)</h3>
              <p>CBH provides delivery across all major industrial belts and cities in India through:</p>
              <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
                <li>Dedicated internal fleet and logistics hubs (Bhiwandi & Ludhiana depots);</li>
                <li>Reputed third-party logistics providers (surface line-haul and express cargo);</li>
                <li>Dealer-arranged transport partners where contractual pickup terms exist.</li>
              </ul>
              <p>Standard delivery timelines range between <strong>3 to 10 business days</strong> from warehouse dispatch.</p>

              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0052CC', marginTop: '16px' }}>2.2 International Shipping (Exports to 50+ Countries)</h3>
              <p>Export consignments are shipped in accordance with International Commercial Terms (Incoterms 2020):</p>
              <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
                <li><strong>EXW (Ex-Works):</strong> Buyer arranges pickup and bears all transit risks from CBH factory;</li>
                <li><strong>FOB (Free on Board):</strong> CBH delivers to Indian port of departure and handles export customs clearance;</li>
                <li><strong>CIF (Cost, Insurance & Freight):</strong> CBH covers maritime freight and transit insurance up to the overseas destination port.</li>
              </ul>

              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0052CC', marginTop: '16px' }}>2.3 Self-Pickup Facility</h3>
              <p>
                Approved institutional buyers and dealers may self-arrange vehicle loading at our central Bhiwandi or Ludhiana facilities with prior scheduling.
              </p>
            </section>

            {/* Section 3 */}
            <section id="ship-3" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                3. Order Processing, Dispatch, and Tracking
              </h2>
              <p>
                Standard catalogue stock orders are processed within <strong>2 to 5 business days</strong> following payment confirmation or PO authorization. For made-to-order, hot-dip galvanized, or custom structural anchor items, manufacturing lead times are agreed during quotation.
              </p>
              <p>
                Upon dispatch, customers receive an automated electronic Dispatch Confirmation including:
              </p>
              <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
                <li>Tax invoice, packing list, and barcode manifest</li>
                <li>Lorry Receipt (LR) number, Air Waybill (AWB), or Bill of Lading (BL)</li>
                <li>Live carrier tracking link and driver contact details where applicable</li>
                <li>EN 10204 3.1 Mill Test Certificates (MTC)</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="ship-4" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                4. Shipping Charges, Taxes, and Duties
              </h2>
              <p>
                Domestic shipping charges are calculated transparently based on gross consignment weight (KGS) and destination pin code. Invoices clearly reflect Goods & Services Tax (GST). For export orders, destination import tariffs, customs VAT, and port demurrage remain the responsibility of the overseas importer.
              </p>
            </section>

            {/* Section 5 */}
            <section id="ship-5" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                5. Delivery Timelines, Delays, and Risk Transfer
              </h2>
              <p>
                All estimated delivery dates are indicative. CBH cannot be held liable for delays caused by force majeure events such as port congestion, customs inspections, natural disasters, or labor strikes.
              </p>
              <p>
                <strong>Transfer of Risk:</strong> Risk of damage or loss passes to the buyer upon handover to the designated transport carrier (for FOB/EXW) or delivery at buyer premises (for prepaid delivered freight).
              </p>
            </section>

            {/* Section 6 */}
            <section id="ship-6" style={{ marginBottom: '40px', scrollMarginTop: '100px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                6. Delivery Acceptance and Claims
              </h2>
              <div
                style={{
                  background: 'rgba(255, 107, 0, 0.05)',
                  border: '1px solid rgba(255, 107, 0, 0.3)',
                  borderLeft: '4px solid #FF6B00',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '20px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <PackageCheck size={18} color="#FF6B00" />
                  <strong style={{ color: '#FF6B00', fontSize: '14px' }}>Mandatory 48-Hour Inspection Requirement</strong>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                  Buyers must inspect all delivered pallets, carton seals, and hardware immediately. Any visible tampering or shortfall must be noted on the transport proof of delivery (POD) and reported to CBH in writing within <strong>48 hours</strong> with photographs.
                </p>
              </div>

              <p>
                For concealed discrepancies not immediately visible, claims must be registered within <strong>five (5) business days</strong>.
              </p>

              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '24px',
                  marginTop: '24px'
                }}
              >
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
                  Dispatch Support Desk
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
