'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  User,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Building2,
  Terminal,
  Save,
  CheckCircle2,
  LogOut,
  ArrowLeft,
  Camera,
  Activity,
  Zap,
  Boxes,
  Database,
  Truck,
  FileCheck2
} from 'lucide-react';
import { getStoredUser, logout } from '@/lib/auth';

export default function AdminProfilePage() {
  const user = getStoredUser();

  // Operator State
  const [fullName, setFullName] = useState(user?.fullName || 'Harpreet Singh');
  const [roleTitle, setRoleTitle] = useState('Chief Operations Officer & Fastener Plant Master');
  const [email, setEmail] = useState(user?.email || 'admin@cbh.store');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [stationKey, setStationKey] = useState('CBH-HQ-OP-901');
  const [plantLocation, setPlantLocation] = useState('Ludhiana Central Works • Factory Unit #1');

  // Security Passcode State
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');

  // 2FA & Notification Toggles
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [rfqSmsAlerts, setRfqSmsAlerts] = useState(true);
  const [inventoryDiscrepancyAlerts, setInventoryDiscrepancyAlerts] = useState(true);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Link
              href="/admin"
              style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <ArrowLeft size={13} />
              <span>Back to Operations Terminal</span>
            </Link>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', marginTop: '4px' }}>
            Operator Profile &amp; Terminal Clearance
          </h1>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
            Master operator clearance credentials, station security keys, and privileged inventory overrides.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            background: '#FF6B00',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: '12px'
          }}>
            SUPER ADMIN
          </span>
          <button
            type="button"
            onClick={() => logout('/')}
            style={{
              padding: '7px 12px',
              borderRadius: '6px',
              background: '#FEE2E2',
              color: '#DC2626',
              border: '1px solid #FECACA',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div style={{
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          color: '#065F46',
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} color="#059669" />
          <span>Operator credentials, station security protocols, and permissions successfully updated!</span>
        </div>
      )}

      {/* Main Grid: Left Side (Clearance Badge) + Right Side (Editable Profile & Keys) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Left Card: Clearance Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Operator Station Badge */}
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            borderRadius: '16px',
            padding: '28px 24px',
            textAlign: 'center',
            position: 'relative',
            boxShadow: '0 8px 25px rgba(15, 23, 42, 0.12)'
          }}>
            {/* Avatar Upload */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
              <img
                src={avatarUrl}
                alt={fullName}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #0052CC',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)'
                }}
              />
              <label
                htmlFor="admin-avatar-upload"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#0052CC',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '2px solid #0F172A'
                }}
                title="Change Operator Photo"
              >
                <Camera size={13} />
                <input
                  id="admin-avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
              {fullName}
            </h2>
            <div style={{ fontSize: '12px', color: '#38BDF8', fontWeight: 700 }}>
              {roleTitle}
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
              {plantLocation}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <span style={{ background: '#0052CC', color: '#FFFFFF', padding: '3px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>
                STATION: {stationKey}
              </span>
              <span style={{ background: 'rgba(5, 150, 105, 0.2)', color: '#34D399', padding: '3px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={11} />
                <span>ACTIVE SESSION</span>
              </span>
            </div>
          </div>

          {/* Operational Clearance Privileges */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <ShieldCheck size={16} color="#0052CC" />
              <span>Privilege &amp; Override Clearance</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', borderRadius: '6px', background: '#F8FAFC' }}>
                <span style={{ color: '#475569' }}>Fastener SKU Inventory Mutation:</span>
                <strong style={{ color: '#059669' }}>UNRESTRICTED</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', borderRadius: '6px', background: '#F8FAFC' }}>
                <span style={{ color: '#475569' }}>Commercial Pricing Multipliers:</span>
                <strong style={{ color: '#059669' }}>AUTHORIZED</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', borderRadius: '6px', background: '#F8FAFC' }}>
                <span style={{ color: '#475569' }}>Bulk RFQ Price Approval:</span>
                <strong style={{ color: '#059669' }}>MAX CLEARANCE</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', borderRadius: '6px', background: '#F8FAFC' }}>
                <span style={{ color: '#475569' }}>ERPNext 2-Way Sync Engine:</span>
                <strong style={{ color: '#0052CC' }}>ROOT SYNC</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form details */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Operator Information */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
              <User size={16} color="#0052CC" />
              <span>Operator Profile Information</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                  OPERATOR FULL NAME
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    color: '#0F172A',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                  OPERATIONAL TITLE
                </label>
                <input
                  type="text"
                  required
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    color: '#0F172A',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                  OFFICIAL OPERATOR EMAIL
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    color: '#0F172A',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                  DIRECT DESK CONTACT
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    color: '#0F172A',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                  CENTRAL PLANT / FACTORY UNIT
                </label>
                <input
                  type="text"
                  value={plantLocation}
                  onChange={(e) => setPlantLocation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    color: '#0F172A',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Terminal Master Passcode */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
              <Lock size={16} color="#FF6B00" />
              <span>Terminal Passcode &amp; Security Clearance</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                  CURRENT OPERATOR PASSCODE
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={currentPasscode}
                  onChange={(e) => setCurrentPasscode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                  NEW TERMINAL PASSCODE
                </label>
                <input
                  type="password"
                  placeholder="Min 10 characters"
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                  CONFIRM NEW PASSCODE
                </label>
                <input
                  type="password"
                  placeholder="Re-enter passcode"
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Link
              href="/admin"
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              style={{
                padding: '10px 22px',
                borderRadius: '8px',
                background: '#0052CC',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0, 82, 204, 0.3)'
              }}
            >
              <Save size={14} />
              <span>Save Clearance Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
