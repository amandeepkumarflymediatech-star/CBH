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
  FileCheck2,
} from 'lucide-react';
import { getStoredUser, setStoredUser, logout, DEMO_ADMIN, AuthUser } from '@/lib/auth';
import { showErrorAlert, showToast, showSuccessAlert } from '@/lib/swal';

export default function AdminProfilePage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Operator State
  const [fullName, setFullName] = useState('Harpreet Singh');
  const [roleTitle, setRoleTitle] = useState('Chief Operations Officer & Fastener Plant Master');
  const [email, setEmail] = useState('admin@cbh.store');
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
  const [successMessage, setSuccessMessage] = useState('Operator credentials, station security protocols, and permissions successfully updated!');
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces');
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=faces',
  ];

  React.useEffect(() => {
    const u = getStoredUser();
    setCurrentUser(u);
    if (u) {
      if (u.fullName) setFullName(u.fullName);
      if (u.email) setEmail(u.email);
      if (u.phone) setPhone(u.phone);
    }
    const savedAvatar =
      u?.avatar ||
      (typeof window !== 'undefined' ? localStorage.getItem('cbh_admin_avatar') : null) ||
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces';
    setAvatarUrl(savedAvatar);
    setCustomAvatarInput(savedAvatar);
  }, []);

  const persistAvatar = (url: string, notifyMsg = 'Operator clearance photo saved and updated across terminal!') => {
    setAvatarUrl(url);
    setCustomAvatarInput(url);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cbh_admin_avatar', url);
      } catch (err) {
        console.warn('LocalStorage save failed:', err);
      }
    }
    const current = getStoredUser() || DEMO_ADMIN;
    const updated: AuthUser = {
      ...current,
      avatar: url,
    };
    setStoredUser(updated);
    setCurrentUser(updated);
    setSuccessMessage(notifyMsg);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const { compressImageToDataUrl } = await import('@/lib/image-utils');
      // Compress to lightweight, durable JPEG (< 25 KB)
      const compressedDataUrl = await compressImageToDataUrl(file, 280, 0.85);

      // Save instantly to avoid transient blob URL death
      persistAvatar(compressedDataUrl, 'Operator photo updated and saved!');

      // Background upload to server
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.success && data.url) {
          persistAvatar(data.url, 'Operator photo saved permanently to server!');
        }
      } catch (uploadErr) {
        console.warn('Server upload background fallback:', uploadErr);
      }
    } catch (err) {
      console.error('Image compression failed:', err);
      showErrorAlert('Image Processing Failed', 'Could not process image. Please try a different JPG or PNG file.');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleApplyCustomUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customAvatarInput.trim()) return;
    persistAvatar(customAvatarInput.trim(), 'Operator photo URL applied and saved!');
    setShowUrlInput(false);
  };

  const handleResetAvatar = () => {
    const defaultUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces';
    persistAvatar(defaultUrl, 'Operator photo reset to default clearance portrait.');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const current = getStoredUser() || DEMO_ADMIN;
    const finalAvatar = avatarUrl.startsWith('blob:') ? (current.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces') : avatarUrl;

    const updated: AuthUser = {
      ...current,
      fullName,
      phone,
      avatar: finalAvatar,
    };
    setStoredUser(updated);
    setCurrentUser(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cbh_admin_avatar', finalAvatar);
      } catch (err) {
        console.warn('LocalStorage save failed:', err);
      }
    }
    setSuccessMessage('Operator credentials and terminal security clearance saved!');
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
          <span>{successMessage}</span>
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
            {/* Avatar Upload with Click to Change */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'block',
                  borderRadius: '50%'
                }}
                title="Click to Upload Local Photo"
              >
                <img
                  src={avatarUrl}
                  alt={fullName}
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #0052CC',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                    opacity: isUploading ? 0.5 : 1,
                    transition: 'all 0.2s'
                  }}
                />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
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
                title="Upload Photo from Computer"
              >
                <Camera size={13} />
              </button>

              <input
                ref={fileInputRef}
                id="admin-avatar-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>

            {isUploading && (
              <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 700, marginBottom: '8px' }}>
                Optimizing &amp; saving clearance photo...
              </div>
            )}

            {/* Avatar Control Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                style={{
                  background: 'rgba(0, 82, 204, 0.3)',
                  border: '1px solid rgba(0, 82, 204, 0.5)',
                  color: '#38BDF8',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {showUrlInput ? 'Hide' : 'Paste Link'}
              </button>
              <button
                type="button"
                onClick={handleResetAvatar}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 6px',
                  cursor: 'pointer'
                }}
                title="Reset to default photo"
              >
                Reset
              </button>
            </div>

            {/* Direct URL Input */}
            {showUrlInput && (
              <div style={{
                marginBottom: '14px',
                padding: '10px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                textAlign: 'left'
              }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#94A3B8', marginBottom: '4px' }}>
                  IMAGE URL OR CDN LINK
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={customAvatarInput}
                    onChange={(e) => setCustomAvatarInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid #334155',
                      background: '#0F172A',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCustomUrl()}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: '#0052CC',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Preset Avatars Selection */}
            <div style={{ marginBottom: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em', marginBottom: '8px' }}>
                OR SELECT PRESET PORTRAIT
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => persistAvatar(url, 'Clearance portrait applied and saved!')}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: avatarUrl === url ? '2px solid #38BDF8' : '2px solid rgba(255, 255, 255, 0.2)',
                      padding: 0,
                      cursor: 'pointer',
                      transform: avatarUrl === url ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.15s'
                    }}
                    title={`Preset portrait ${idx + 1}`}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
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

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                  OPERATOR CLEARANCE PHOTO URL / ASSET
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img
                    src={avatarUrl}
                    alt="Thumbnail"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #0052CC',
                      flexShrink: 0
                    }}
                  />
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => {
                      setAvatarUrl(e.target.value);
                      setCustomAvatarInput(e.target.value);
                    }}
                    placeholder="https://..."
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      color: '#0F172A',
                      fontFamily: 'var(--font-mono)',
                      outline: 'none'
                    }}
                  />
                </div>
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
