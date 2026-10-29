'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled for optimal mobile client storage & simulated viewport
const MobileApp = dynamic(() => import('../../../mobile/App'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B0F19',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #0052CC 0%, #003685 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '18px',
          marginBottom: '16px',
          boxShadow: '0 4px 14px rgba(0, 82, 204, 0.4)',
        }}
      >
        CBH
      </div>
      <div style={{ fontSize: '15px', fontWeight: 700 }}>Initializing Mobile Experience...</div>
      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
        Loading Admin &amp; Customer responsive interfaces
      </div>
    </div>
  ),
});

export default function MobilePage() {
  return <MobileApp />;
}

