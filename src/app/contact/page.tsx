'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import MainHeader from '@/components/header/MainHeader';
import CartDrawer from '@/components/cart/CartDrawer';
import { RfqLineItem } from '@/lib/types';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    category: 'Bulk Procurement RFQ',
    message: '',
    consent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>
      <MainHeader onOpenCart={() => setIsCartOpen(true)} cartCount={cartItems.length} />

      {/* Hero Header */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)',
          padding: '48px 0 44px',
          color: '#FFFFFF',
          borderBottom: '4px solid #FF6B00'
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#BFDBFE', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>
            <Link href="/" style={{ color: '#BFDBFE', textDecoration: 'none' }}>HOME</Link>
            <ChevronRight size={13} color="#FF6B00" />
            <span style={{ color: '#FF6B00', fontWeight: 700 }}>GET IN TOUCH</span>
            <ChevronRight size={13} color="#FF6B00" />
            <span style={{ color: '#FFFFFF', fontWeight: 700 }}>CONTACT US</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 107, 0, 0.2)', border: '1px solid rgba(255, 107, 0, 0.4)', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, color: '#FFB020', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
                <Clock size={14} color="#FF6B00" />
                <span>RAPID PROCUREMENT DESK // &lt; 15 MIN ESTIMATION SLA</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '40px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
                Contact Capital Bolts & Hardwares
              </h1>
              <p style={{ fontSize: '15px', color: '#E2E8F0', marginTop: '10px', maxWidth: '680px', lineHeight: 1.6 }}>
                Direct factory support, technical anchor engineering calculations, dealership network onboarding, and pan-India express freight dispatch.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href="tel:+919888021000"
                style={{
                  background: '#FF6B00',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  padding: '12px 22px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(255, 107, 0, 0.4)'
                }}
              >
                <Phone size={16} />
                <span>+91 98880 21000</span>
              </a>

              <a
                href="mailto:sales@capitalbolts.co"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Mail size={16} />
                <span>sales@capitalbolts.co</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: 3 Official Contact Cards */}
      <div className="container" style={{ padding: '48px 16px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {/* Card 1: Physical HQ */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 4px 20px rgba(0, 82, 204, 0.06)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#0052CC' }} />
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 82, 204, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <MapPin size={24} color="#0052CC" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Central Headquarters & Hub
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, marginBottom: '16px' }}>
              Capital Towers, Gill Rd, opp. SBI,<br />
              Miller Ganj, Ludhiana, Punjab 141003, India
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#0052CC' }}>
              <Clock size={14} />
              <span>Mon - Sat: 10:00 AM - 6:00 PM IST</span>
            </div>
          </div>

          {/* Card 2: Direct Telephony */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 4px 20px rgba(0, 82, 204, 0.06)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#FF6B00' }} />
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 107, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Phone size={24} color="#FF6B00" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Direct Telephony Lines
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, marginBottom: '16px' }}>
              Direct access to our dedicated enterprise fastener technical sales team.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <a href="tel:+919888021000" style={{ fontSize: '16px', fontWeight: 900, color: '#0052CC', textDecoration: 'none' }}>
                +91 98880 21000
              </a>
              <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                PAN-India Toll-Free Hotline
              </span>
            </div>
          </div>

          {/* Card 3: Official Email Desks */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 4px 20px rgba(0, 82, 204, 0.06)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#0052CC' }} />
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 82, 204, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Mail size={24} color="#0052CC" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Official Electronic Desks
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, marginBottom: '16px' }}>
              Send purchase orders, engineering blueprints, and tender specifications.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#94A3B8', fontSize: '11px', display: 'block' }}>SALES & RFQ:</span>
                <a href="mailto:sales@capitalbolts.co" style={{ color: '#0052CC', fontWeight: 800, textDecoration: 'none' }}>
                  sales@capitalbolts.co
                </a>
              </div>
              <div>
                <span style={{ color: '#94A3B8', fontSize: '11px', display: 'block' }}>GENERAL INQUIRIES:</span>
                <a href="mailto:info@capitalbolts.in" style={{ color: '#0052CC', fontWeight: 800, textDecoration: 'none' }}>
                  info@capitalbolts.in
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Form & Social Split Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', alignItems: 'start' }}>
          {/* Left: Interactive RFQ & Contact Form */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '36px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <MessageSquare size={18} color="#FF6B00" />
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-mono)' }}>
                DIRECT COMMERCIAL INQUIRY
              </span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', marginBottom: '6px' }}>
              Send an Instant Procurement Inquiry
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>
              Our sales engineering desk will respond with stock availability, unit rates (PCS/KGS), and MTC certificates within 15 minutes.
            </p>

            {isSubmitted ? (
              <div
                style={{
                  background: 'rgba(5, 150, 105, 0.08)',
                  border: '1px solid rgba(5, 150, 105, 0.3)',
                  borderRadius: '12px',
                  padding: '32px',
                  textAlign: 'center'
                }}
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#059669', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  Inquiry Dispatched Successfully!
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                  Thank you, <strong>{formData.name}</strong>. A dedicated CBH fastener specialist has been assigned to your request and will contact you shortly at <strong>{formData.phone || formData.email}</strong>.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  style={{
                    background: '#0052CC',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Official Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. procurement@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98880 XXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Company Name / GSTIN
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Larsen Infra Pvt Ltd"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Inquiry Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      background: '#FFFFFF',
                      outline: 'none'
                    }}
                  >
                    <option value="Bulk Procurement RFQ">Bulk Procurement RFQ (DIN / ISO Fasteners)</option>
                    <option value="Heavy Anchors & Fixings">Heavy Anchors & Seismic Fixings (FAZ II Plus)</option>
                    <option value="Dealership & Partner Onboarding">Dealership & Barcode Network Onboarding</option>
                    <option value="Surplus Stock Lot Purchase">Surplus Stock Lot Purchase</option>
                    <option value="MTC 3.1 & Technical Certificate">MTC 3.1 & Technical Certificate Verification</option>
                    <option value="Order Status & Dispatch Tracking">Order Status & Dispatch Tracking</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Message / Fastener Specifications & Quantities *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Enter Article Numbers, DIN standards, sizes (e.g. M12x100), grades (8.8, 10.9, A4-70), and required quantities..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="consentCheck"
                    required
                    checked={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                    style={{ marginTop: '3px' }}
                  />
                  <label htmlFor="consentCheck" style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5 }}>
                    I agree to receive emails, calls, SMS, and notifications from CBH in accordance with the{' '}
                    <Link href="/terms-and-conditions" target="_blank" style={{ color: '#FF6B00', fontWeight: 700, textDecoration: 'none' }}>
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy-policy" target="_blank" style={{ color: '#0052CC', fontWeight: 700, textDecoration: 'none' }}>
                      Privacy Policy
                    </Link>.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: '#0052CC',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(0, 82, 204, 0.35)',
                    opacity: isSubmitting ? 0.7 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'Dispatching Inquiry...' : 'Submit Procurement Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right: Social & Facility Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Social Channels Card */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '28px'
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                Follow CBH Fasteners
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px', lineHeight: 1.5 }}>
                Stay updated with factory surplus liquidation announcements, new DIN arrivals, and industry exhibitions.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a
                  href="https://www.instagram.com/capitalboltsandhardwares/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: '#0F172A',
                    fontWeight: 700,
                    fontSize: '13px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>📸</span>
                    <span>@capitalboltsandhardwares</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#FF6B00', fontWeight: 800 }}>INSTAGRAM ➔</span>
                </a>

                <a
                  href="https://www.facebook.com/CBHcapitalbolts/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: '#0F172A',
                    fontWeight: 700,
                    fontSize: '13px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>👥</span>
                    <span>CBHcapitalbolts</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#0052CC', fontWeight: 800 }}>FACEBOOK ➔</span>
                </a>
              </div>
            </div>

            {/* Direct Factory Pickup Notice */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(0, 82, 204, 0.04) 0%, rgba(255, 107, 0, 0.04) 100%)',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '28px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Building2 size={20} color="#0052CC" />
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Central Factory & Dispatch Works
                </h4>
              </div>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, marginBottom: '16px' }}>
                Visiting for physical material inspection or self-arranged container pickup? Please notify our dispatch desk 24 hours in advance.
              </p>
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 16px', fontSize: '12px', color: '#475569' }}>
                <div><strong>GSTIN:</strong> 03AAAC8492K1Z9</div>
                <div><strong>Standard Loading Hours:</strong> 09:00 AM - 07:00 PM IST</div>
              </div>
            </div>

            {/* Quick 3D Depot Link */}
            <div
              style={{
                background: '#0F172A',
                color: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: '#FF6B00', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>DIGITAL TWIN</span>
                <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '2px 0 0' }}>Tour Mega-Depot in 3D</h4>
              </div>
              <Link
                href="/virtual-store"
                style={{
                  background: '#0052CC',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Launch 3D</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
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
