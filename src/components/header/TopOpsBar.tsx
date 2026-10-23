'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, CheckCircle, ShieldCheck, User, Settings, LogIn, UserPlus } from 'lucide-react';

export default function TopOpsBar() {
  return (
    <div className="top-ops-bar">
      <div className="container top-ops-inner">
        <div className="ops-tags">
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Phone size={13} color="#D2051E" />
            <span>Toll-Free: <strong>+91 98880 21000</strong></span>
          </span>
          <span className="hide-mobile" style={{ color: '#2C3440' }}>|</span>
          <span className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#059669' }}>
            <CheckCircle size={13} />
            <span>BIS Certified Fasteners</span>
          </span>
          <span className="hide-tablet" style={{ color: '#2C3440' }}>|</span>
          <span className="hide-tablet">2,00,000+ SKUs DIN/ISO/ASTM</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="hide-tablet" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#8896A6', fontSize: '11px' }}>Tier Status:</span>
            <span className="badge badge-vip">
              <ShieldCheck size={12} />
              DIAMOND OEM (-18%)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            <Link 
              href="/login" 
              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DCE2E8' }}
              title="Sign in to your account"
            >
              <LogIn size={13} />
              <span>Login</span>
            </Link>
            <span style={{ color: '#333D4B' }}>|</span>
            <Link 
              href="/register" 
              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DCE2E8' }}
              title="Register OEM / Contractor Account"
            >
              <UserPlus size={13} />
              <span>Register</span>
            </Link>
            <span className="hide-mobile" style={{ color: '#333D4B' }}>|</span>
            <Link 
              href="/customer" 
              className="hide-mobile"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DCE2E8' }}
            >
              <User size={13} />
              <span>Client Portal</span>
            </Link>
            <span className="hide-mobile" style={{ color: '#333D4B' }}>|</span>
            <Link 
              href="/admin" 
              className="hide-mobile"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DCE2E8' }}
            >
              <Settings size={13} />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
