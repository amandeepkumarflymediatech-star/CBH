'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Phone, CheckCircle, ShieldCheck, MessageCircle, Factory } from 'lucide-react';
import { getStoredUser, AuthUser } from '@/lib/auth';

export default function TopOpsBar() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());

    const handleAuthChange = () => {
      setUser(getStoredUser());
    };

    window.addEventListener('cbh_auth_change', handleAuthChange);
    return () => window.removeEventListener('cbh_auth_change', handleAuthChange);
  }, []);

  // Hide top operations bar on admin, customer portals, auth routes, and full-screen 3D virtual store
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/customer') || pathname === '/login' || pathname === '/register' || pathname === '/virtual-store') {
    return null;
  }

  return (
    <div className="top-ops-bar">
      <div className="container top-ops-inner">
        <div className="ops-tags">
          <a
            href="tel:+919888021000"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'inherit', textDecoration: 'none' }}
            title="Call Support Helpline"
          >
            <Phone size={13} color="var(--color-accent)" />
            <span>Help: <strong>+91 98880 21000</strong></span>
          </a>
          <span style={{ color: '#2C3440' }}>|</span>
          <a
            href="https://wa.me/919888021000?text=Hi%20CBH%20Fasteners,%20I%20am%20sending%20a%20photo/list%20of%20fasteners%20I%20need.%20Please%20give%20me%20the%20wholesale%20rate."
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#25D366', textDecoration: 'none', fontWeight: 700 }}
            title="WhatsApp Helpline"
          >
            <MessageCircle size={13} />
            <span>WhatsApp Orders</span>
          </a>
          <span className="hide-mobile" style={{ color: '#2C3440' }}>|</span>
          <span className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#059669' }}>
            <Factory size={13} />
            <span>Direct Factory Wholesale (सीधे फैक्टरी रेट)</span>
          </span>
          <span className="hide-tablet" style={{ color: '#2C3440' }}>|</span>
          <span className="hide-tablet" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <CheckCircle size={13} color="#059669" />
            <span>2,00,000+ Fasteners In Stock</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#8896A6', fontSize: '11px' }}>Tier Status:</span>
            <span className="badge badge-vip">
              <ShieldCheck size={12} />
              {user?.tier ? `${user.tier} OEM` : 'DIAMOND OEM (-18%)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
