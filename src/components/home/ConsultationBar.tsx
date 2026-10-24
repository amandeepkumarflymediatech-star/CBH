'use client';

import React from 'react';
import { Headset, Phone, Mail } from 'lucide-react';

export default function ConsultationBar() {
  return (
    <div className="consultation-strip" role="region" aria-label="Technical Fastener Engineering Consultation">
      <div className="consult-left">
        <div className="consult-icon" aria-hidden="true">
          <Headset size={24} />
        </div>
        <div className="consult-text">
          <div className="consult-badge">
            <span className="live-dot" />
            <span>NABL Metallurgical Support</span>
          </div>
          <h3>Need Technical Sizing or Batch Test Certification?</h3>
          <p>
            Speak directly with our Chief Fasteners Metallurgist or email your CAD drawings for custom OEM sizing.
          </p>
        </div>
      </div>

      <div className="consult-actions">
        <a 
          href="tel:+919888021000" 
          className="consult-btn consult-btn-phone"
          title="Call Direct Metallurgical Helpline (+91 98880 21000)"
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
          className="consult-btn consult-btn-email"
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
