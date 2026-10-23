'use client';

import React from 'react';
import { Award, CheckCircle2, FileText, Shield } from 'lucide-react';

export default function TrustCertificates() {
  return (
    <div style={{ marginBottom: '48px' }}>
      <div className="section-intro">
        <span className="subhead">Certificates Of Recognitions</span>
        <h2>Honouring Our Milestones & Industrial Partnerships</h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
          Certified by premier national testing laboratories, audited for zero-defect metallurgical tolerances, and trusted across India's core EPC and manufacturing plants.
        </p>
      </div>

      <div className="trust-badges-grid">
        <div className="trust-badge-card">
          <div className="trust-badge-icon">
            <CheckCircle2 size={24} color="#059669" />
          </div>
          <h4>BIS Certified</h4>
          <p>Bureau of Indian Standards Tested & Stamped</p>
        </div>

        <div className="trust-badge-card">
          <div className="trust-badge-icon">
            <Award size={24} color="#D2051E" />
          </div>
          <h4>ISO 9001:2015</h4>
          <p>Quality Management System Audited Depot</p>
        </div>

        <div className="trust-badge-card">
          <div className="trust-badge-icon">
            <FileText size={24} color="#0284C7" />
          </div>
          <h4>EN 10204 3.1</h4>
          <p>NABL Accredited Mill Test Certificates</p>
        </div>

        <div className="trust-badge-card">
          <div className="trust-badge-icon">
            <Shield size={24} color="#D97706" />
          </div>
          <h4>Batch Traceability</h4>
          <p>Complete heat number etching and origin audit</p>
        </div>
      </div>
    </div>
  );
}
