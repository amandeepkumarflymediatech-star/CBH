'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Phone, CheckCircle, ShieldCheck } from 'lucide-react';
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
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Phone size={13} color="var(--color-accent)" />
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
