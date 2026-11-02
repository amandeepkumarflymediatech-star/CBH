'use client';

import React from 'react';
import { Headset, Phone, Mail, MessageCircle } from 'lucide-react';

export default function ConsultationBar() {
  return (
    <div className="consultation-strip" role="region" aria-label="Fastener Helpline and WhatsApp Support">
      <div className="consult-left">
        <div className="consult-icon" aria-hidden="true">
          <Headset size={24} />
        </div>
        <div className="consult-text">
          <div className="consult-badge">
            <span className="live-dot" />
            <span>Fastener Sizing &amp; Pricing Helpline</span>
          </div>
          <h3>Need Help Finding the Right Bolt, Nut or Price?</h3>
          <p>
            साइज या ग्रेड समझ नहीं आ रहा? Call our technical engineers directly or send a photo of your sample bolt / list on WhatsApp for instant quote.
          </p>
        </div>
      </div>

      <div className="consult-actions">
        <a 
          href="https://wa.me/919888021000?text=Hi%20CBH%20Fasteners,%20I%20am%20sending%20a%20photo%20of%20the%20fasteners%20I%20need.%20Please%20help%20me%20with%20rates." 
          target="_blank"
          rel="noopener noreferrer"
          className="consult-btn"
          style={{ background: '#25D366', color: '#FFFFFF', borderColor: '#25D366' }}
          title="Send photo on WhatsApp (+91 98880 21000)"
        >
          <div className="consult-btn-icon" style={{ background: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}>
            <MessageCircle size={16} />
          </div>
          <div className="consult-btn-text">
            <span className="consult-btn-label" style={{ color: 'rgba(255,255,255,0.9)' }}>WhatsApp Help Desk</span>
            <span className="consult-btn-val" style={{ color: '#FFFFFF' }}>+91 98880 21000</span>
          </div>
        </a>

        <a 
          href="tel:+919888021000" 
          className="consult-btn consult-btn-phone"
          title="Call Direct Helpline (+91 98880 21000)"
        >
          <div className="consult-btn-icon">
            <Phone size={16} />
          </div>
          <div className="consult-btn-text">
            <span className="consult-btn-label">Toll-Free Helpline</span>
            <span className="consult-btn-val">+91 98880 21000</span>
          </div>
        </a>

        <a 
          href="mailto:sales@capitalbolts.co" 
          className="consult-btn consult-btn-email hide-mobile"
          title="Email Drawings to sales@capitalbolts.co"
        >
          <div className="consult-btn-icon">
            <Mail size={16} />
          </div>
          <div className="consult-btn-text">
            <span className="consult-btn-label">Technical RFQ Desk</span>
            <span className="consult-btn-val">sales@capitalbolts.co</span>
          </div>
        </a>
      </div>
    </div>
  );
}
