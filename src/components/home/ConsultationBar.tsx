'use client';

import React from 'react';
import { Headset, Phone, Mail } from 'lucide-react';

export default function ConsultationBar() {
  return (
    <div className="consultation-strip">
      <div className="consult-left">
        <div className="consult-icon">
          <Headset size={24} />
        </div>
        <div>
          <h3>Need Technical Sizing or Batch Test Certification?</h3>
          <p>Speak directly with our Chief Fasteners Metallurgist or email your engineering drawings.</p>
        </div>
      </div>

      <div className="consult-actions">
        <a href="tel:+919888021000" className="btn-dark" style={{ background: '#242B35' }}>
          <Phone size={15} color="#D2051E" />
          <span>+91 98880 21000</span>
        </a>
        <a href="mailto:sales@capitalbolts.co" className="btn-dark" style={{ background: '#242B35' }}>
          <Mail size={15} color="#D2051E" />
          <span>sales@capitalbolts.co</span>
        </a>
      </div>
    </div>
  );
}
