'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import MainHeader from '@/components/header/MainHeader';
import CartDrawer from '@/components/cart/CartDrawer';
import { Product, GlobalUnit, RfqLineItem } from '@/lib/types';
import { formatINR } from '@/lib/rfq-calculator';
import {
  CheckCircle2,
  ShieldCheck,
  FileText,
  Truck,
  RotateCcw,
  Zap,
  MessageSquare,
  FileDown,
  Layers,
  ChevronRight,
  Maximize2,
  Share2,
  Award,
  Plus,
  ShoppingCart,
  X,
  ZoomIn,
  Copy,
  ExternalLink,
  Box,
  Sparkles,
  Check,
  ArrowRight,
  PhoneCall,
  Clock,
  Flame
} from 'lucide-react';
import { showToast, showSuccessAlert, showInfoAlert } from '@/lib/swal';

export default function ProductDetailPage() {
  const params = useParams();
  const rawId = params?.id ? decodeURIComponent(String(params.id)) : '1';

  // State: All catalog products (from API / memory)
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  // Configurator Interactive State
  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');
  const [selectedDiameter, setSelectedDiameter] = useState('M10');
  const [selectedLength, setSelectedLength] = useState('100');
  const [selectedGrade, setSelectedGrade] = useState('8.8');
  const [selectedFinish, setSelectedFinish] = useState('Black Passivated (BP)');
  const [quantity, setQuantity] = useState(500);

  // Tab States
  const [activeMediaTab, setActiveMediaTab] = useState<'photo' | 'cad' | 'cert'>('photo');
  const [activeSpecsTab, setActiveSpecsTab] = useState<'excel_master' | 'mechanical' | 'chemical' | 'torque' | 'downloads'>('excel_master');

  // Modal & Notification States
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedSku, setCopiedSku] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Pincode Delivery Estimator
  const [pincode, setPincode] = useState('400001');
  const [pincodeMsg, setPincodeMsg] = useState('Estimated Delivery in 24-48 Hours to Mumbai Metropolitan Region');

  // Fetch dynamic products from live API / ERPNext cache on mount
  useEffect(() => {
    setIsLoading(true);
    const isNumeric = /^\d+$/.test(rawId);
    const queryUrl = isNumeric
      ? `/api/products?id=${encodeURIComponent(rawId)}`
      : `/api/products?sku=${encodeURIComponent(rawId)}`;

    fetch(queryUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setAllProducts(data.data);
          const apiFound = data.data[0];
          if (apiFound) {
            setProduct(apiFound);
            setSelectedDiameter(apiFound.diameter || 'M10');
            setSelectedLength(String(apiFound.lengthMm || 100));
            setSelectedGrade(apiFound.grade || '8.8');
            setSelectedFinish(apiFound.finish || 'Black Passivated (BP)');
            if (apiFound.pcsPerBox) {
              const b = typeof apiFound.pcsPerBox === 'number' ? apiFound.pcsPerBox : parseInt(String(apiFound.pcsPerBox)) || 500;
              setQuantity(b);
            }
            setNotFound(false);
            return;
          }
        }
        
        // Fallback search
        return fetch(`/api/products?search=${encodeURIComponent(rawId)}&limit=5`)
          .then((r) => r.json())
          .then((fallbackData) => {
            if (fallbackData.success && Array.isArray(fallbackData.data) && fallbackData.data.length > 0) {
              const match = fallbackData.data.find(
                (p: Product) =>
                  String(p.id).toLowerCase() === rawId.toLowerCase() ||
                  p.sku.toLowerCase() === rawId.toLowerCase()
              ) || fallbackData.data[0];
              setProduct(match);
              setSelectedDiameter(match.diameter || 'M10');
              setSelectedLength(String(match.lengthMm || 100));
              setSelectedGrade(match.grade || '8.8');
              setSelectedFinish(match.finish || 'Black Passivated (BP)');
              setNotFound(false);
            } else {
              setProduct(null);
              setNotFound(true);
            }
          });
      })
      .catch((err) => {
        console.error('Failed fetching dynamic product detail:', err);
        setProduct(null);
        setNotFound(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [rawId]);

  // Extract sister variations (other diameters & lengths in the same category / standard family)
  const { availableDiameters, availableLengths } = useMemo(() => {
    const diaSet = new Set<string>();
    const lenSet = new Set<string>();

    if (!product) {
      return { availableDiameters: [], availableLengths: [] };
    }

    if (product.diameter) diaSet.add(product.diameter);
    if (product.lengthMm) lenSet.add(String(product.lengthMm));

    // Look for siblings in allProducts
    allProducts.forEach((p) => {
      const matchFamily =
        (product.category && p.category === product.category) ||
        (product.standard && p.standard === product.standard) ||
        (product.subGroup && p.subGroup === product.subGroup);

      if (matchFamily) {
        if (p.diameter) diaSet.add(p.diameter);
        if (p.lengthMm) lenSet.add(String(p.lengthMm));
      }
    });

    // Fallbacks if only 1 item exists in family
    if (diaSet.size < 4) {
      ['M3', 'M4', 'M5', 'M6', 'M8', 'M10', 'M12', 'M16', 'M20'].forEach((d) => diaSet.add(d));
    }
    if (lenSet.size < 4) {
      ['4', '6', '10', '16', '20', '25', '35', '50', '80', '100'].forEach((l) => lenSet.add(l));
    }

    const sortDia = Array.from(diaSet).sort((a, b) => {
      const na = parseInt(a.replace(/\D/g, '')) || 0;
      const nb = parseInt(b.replace(/\D/g, '')) || 0;
      return na - nb;
    });

    const sortLen = Array.from(lenSet).sort((a, b) => {
      const na = parseInt(a) || 0;
      const nb = parseInt(b) || 0;
      return na - nb;
    });

    return {
      availableDiameters: sortDia,
      availableLengths: sortLen,
    };
  }, [allProducts, product]);

  // Volume Slab Calculations
  const getVolumeDiscount = (qty: number) => {
    if (qty >= 20000) return { pct: 26, label: 'Master OEM Wholesale (-26%)' };
    if (qty >= 5000) return { pct: 20, label: 'Contractor Volume Tier (-20%)' };
    if (qty >= 1000) return { pct: 10, label: 'Bulk Batch Tier (-10%)' };
    return { pct: 0, label: 'Standard Rate' };
  };

  const currentDiscount = getVolumeDiscount(quantity);
  const basePrice = product ? (globalUnit === 'PCS' ? product.pricePerPiece : product.pricePerKg) : 0;
  const discountedRate = basePrice * (1 - currentDiscount.pct / 100);
  const grossTotal = quantity * discountedRate;
  const weightTotalKg = product ? quantity * (product.weightPerPcKg || 0.06) : 0;

  // Add to RFQ Cart
  const handleAddToCart = () => {
    if (!product) return;
    const newItem: RfqLineItem = {
      id: Date.now(),
      productId: product.id,
      sku: product.sku,
      name: product.name,
      standard: product.standard,
      unit: globalUnit,
      unitRate: discountedRate,
      quantity: quantity,
      weightPerPcKg: product.weightPerPcKg || 0.06,
      totalWeightKg: weightTotalKg,
      rowTotal: grossTotal,
    };

    setCartItems((prev) => [newItem, ...prev]);
    setIsCartOpen(true);
    showToast(`Added ${quantity.toLocaleString()} ${globalUnit} of ${product.sku} to RFQ Cart!`, 'success');
  };

  // Add companion hardware to RFQ
  const handleAddCompanion = (companionName: string, standard: string, rate: number) => {
    if (!product) return;
    const newItem: RfqLineItem = {
      id: Date.now(),
      productId: product.id + 9000,
      sku: `${standard}-${selectedDiameter}-G8`,
      name: `${companionName} (${selectedDiameter})`,
      standard: standard,
      unit: 'PCS',
      unitRate: rate,
      quantity: quantity,
      weightPerPcKg: 0.02,
      totalWeightKg: quantity * 0.02,
      rowTotal: quantity * rate,
    };
    setCartItems((prev) => [newItem, ...prev]);
    setIsCartOpen(true);
    showToast(`Added matching ${companionName} to RFQ!`, 'success');
  };

  // Copy SKU / Link
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedSku(true);
      setTimeout(() => setCopiedSku(false), 2500);
      showToast('Product link copied to clipboard!');
    }
  };

  // Format box and carton numbers
  const boxQty = product ? (typeof product.pcsPerBox === 'number' ? product.pcsPerBox : parseInt(String(product.pcsPerBox)) || 500) : 500;
  const ctnQty = product ? (typeof product.pcsPerMasterCtn === 'number' ? product.pcsPerMasterCtn : parseInt(String(product.pcsPerMasterCtn)) || 4000) : 4000;

  if (isLoading) {
    return (
      <div className="pdp-page" style={{ background: '#F8FAFC', minHeight: '100vh' }}>
        <MainHeader
          unit={globalUnit}
          onUnitToggle={setGlobalUnit}
          cartCount={cartItems.length}
          onOpenCart={() => setIsCartOpen(true)}
        />
        <div style={{ maxWidth: '800px', margin: '120px auto', textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#64748B', fontSize: '15px', fontWeight: 500 }}>Loading fastener specifications...</p>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="pdp-page" style={{ background: '#F8FAFC', minHeight: '100vh' }}>
        <MainHeader
          unit={globalUnit}
          onUnitToggle={setGlobalUnit}
          cartCount={cartItems.length}
          onOpenCart={() => setIsCartOpen(true)}
        />
        <div style={{ maxWidth: '640px', margin: '80px auto', textAlign: 'center', padding: '48px 24px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px' }}>
            📦
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Product Not Found</h2>
          <p style={{ color: '#64748B', fontSize: '14px', maxWidth: '440px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            The requested fastener item <code style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', color: '#334155' }}>{rawId}</code> does not exist in the active database or has been removed from the catalog.
          </p>
          <Link
            href="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#0F172A', color: '#FFFFFF', borderRadius: '8px', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
          >
            ← Return to Fastener Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pdp-page" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '90px' }}>
      <MainHeader
        unit={globalUnit}
        onUnitToggle={setGlobalUnit}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Top Breadcrumb Navigation */}
      <div className="pdp-breadcrumb-bar" style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '12px 0' }}>
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <nav className="pdp-breadcrumbs" aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', fontSize: '12px', color: '#64748B' }}>
              <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>Home</Link>
              <span className="separator" style={{ color: '#CBD5E1' }}>/</span>
              <Link href="/products" style={{ color: '#64748B', textDecoration: 'none' }}>Catalog</Link>
              {product.subGroup && (
                <>
                  <span className="separator" style={{ color: '#CBD5E1' }}>/</span>
                  <span style={{ color: '#64748B' }}>{product.subGroup}</span>
                </>
              )}
              {product.category && (
                <>
                  <span className="separator" style={{ color: '#CBD5E1' }}>/</span>
                  <span style={{ color: '#64748B', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {product.category}
                  </span>
                </>
              )}
              <span className="separator" style={{ color: '#CBD5E1' }}>/</span>
              <span className="current" style={{ color: '#0F172A', fontWeight: 700 }}>
                {product.sizeFormatted || `${product.diameter}x${product.lengthMm}`}
              </span>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  color: '#475569',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Copy shareable product URL"
              >
                {copiedSku ? <Check size={13} color="#059669" /> : <Share2 size={13} />}
                <span>{copiedSku ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main PDP Core Section */}
      <main className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        <div className="pdp-main-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'flex-start' }}>
          
          {/* ================================================================ */}
          {/* LEFT COLUMN: Technical Viewport & CAD Drawing Visualizer        */}
          {/* ================================================================ */}
          <div className="pdp-gallery-card" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            
            {/* Badges Strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="badge badge-din" style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 700 }}>
                  {product.standard || 'DIN STD'}
                </span>
                {product.grade && (
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, background: '#F1F5F9', color: '#1E293B', padding: '2px 7px', borderRadius: '4px', border: '1px solid #CBD5E1' }}>
                    {product.grade}
                  </span>
                )}
                {product.isSurplus && (
                  <span style={{ fontSize: '11px', fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '2px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Flame size={12} /> -{product.surplusDiscountPct}% SURPLUS
                  </span>
                )}
              </div>

              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                <CheckCircle2 size={13} />
                BIS / ISO Calibrated
              </span>
            </div>

            {/* Main Visualizer Window */}
            <div
              className="pdp-main-viewport"
              style={{
                width: '100%',
                height: '340px',
                background: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                cursor: activeMediaTab === 'photo' ? 'zoom-in' : 'default'
              }}
              onClick={() => {
                if (activeMediaTab === 'photo') setIsLightboxOpen(true);
              }}
            >
              {/* TAB 1: HIGH-RES DYNAMIC PHOTO */}
              {activeMediaTab === 'photo' && (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                  <img
                    src={product.imageUrl || '/assets/bolt_zinc.jpg'}
                    alt={product.name}
                    style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', transition: 'transform 0.3s ease' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/bolt_zinc.jpg';
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      background: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(4px)',
                      color: '#FFFFFF',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <ZoomIn size={12} />
                    <span>Click to Zoom</span>
                  </div>
                </div>
              )}

              {/* TAB 2: CAD BLUEPRINT & DRAWINGS */}
              {activeMediaTab === 'cad' && (
                <div style={{ width: '100%', height: '100%', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'center' }}>
                  <div style={{
                    border: '1px dashed #CBD5E1',
                    padding: '16px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    fontFamily: 'var(--font-mono)',
                    color: '#0F172A'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0052CC', marginBottom: '10px' }}>
                      ENGINEERING 2D BLUEPRINT // {product.standard}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '11px', textAlign: 'left' }}>
                      <div><strong>Diameter (d):</strong> {product.diameter}</div>
                      <div><strong>Length (l):</strong> {product.lengthMm} mm</div>
                      <div><strong>Pitch (P):</strong> {product.pitchMm} mm</div>
                      <div><strong>Grade:</strong> {product.grade}</div>
                      <div><strong>Finish:</strong> {product.finish}</div>
                      <div><strong>Size:</strong> {product.sizeFormatted}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {product.drawingUrl ? (
                      <a
                        href={product.drawingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                      >
                        <ExternalLink size={14} />
                        <span>Open AutoCAD Drawing (CAD / Drive)</span>
                      </a>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#64748B' }}>CAD Drawing Available on Factory Order</span>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: NABL MILL CERTIFICATE */}
              {activeMediaTab === 'cert' && (
                <div style={{ textAlign: 'center', padding: '24px', background: '#FFFFFF', borderRadius: '8px', width: '90%', border: '1px solid #E2E8F0' }}>
                  <Award size={44} color="#0052CC" style={{ margin: '0 auto 10px' }} />
                  <h4 style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px', color: '#0F172A' }}>
                    NABL 3.1 Mill Test Certificate
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748B', maxWidth: '320px', margin: '0 auto 12px' }}>
                    Certified EN 10204 Type 3.1 chemical & mechanical stress calibration for Grade {product.grade}.
                  </p>
                  <span className="badge badge-certified" style={{ fontSize: '11px' }}>
                    100% Traceable Heat Melt
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Navigation Row */}
            <div className="pdp-thumbs-row" style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                className={`pdp-thumb-btn ${activeMediaTab === 'photo' ? 'active' : ''}`}
                onClick={() => setActiveMediaTab('photo')}
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '8px',
                  border: activeMediaTab === 'photo' ? '2px solid #0052CC' : '1px solid #E2E8F0',
                  background: activeMediaTab === 'photo' ? '#EFF6FF' : '#F8FAFC',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="View High-Res Photo"
              >
                <img
                  src={product.imageUrl || '/assets/bolt_zinc.jpg'}
                  alt="Thumb"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/bolt_zinc.jpg'; }}
                />
              </button>

              <button
                type="button"
                className={`pdp-thumb-btn ${activeMediaTab === 'cad' ? 'active' : ''}`}
                onClick={() => setActiveMediaTab('cad')}
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '8px',
                  border: activeMediaTab === 'cad' ? '2px solid #0052CC' : '1px solid #E2E8F0',
                  background: activeMediaTab === 'cad' ? '#EFF6FF' : '#F8FAFC',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: activeMediaTab === 'cad' ? '#0052CC' : '#64748B'
                }}
                title="View CAD Blueprint"
              >
                <Layers size={20} color={activeMediaTab === 'cad' ? '#0052CC' : '#64748B'} />
                <span>CAD 2D</span>
              </button>

              <button
                type="button"
                className={`pdp-thumb-btn ${activeMediaTab === 'cert' ? 'active' : ''}`}
                onClick={() => setActiveMediaTab('cert')}
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '8px',
                  border: activeMediaTab === 'cert' ? '2px solid #059669' : '1px solid #E2E8F0',
                  background: activeMediaTab === 'cert' ? '#ECFDF5' : '#F8FAFC',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: activeMediaTab === 'cert' ? '#059669' : '#64748B'
                }}
                title="View Inspection Certificate"
              >
                <Award size={20} color={activeMediaTab === 'cert' ? '#059669' : '#64748B'} />
                <span>CERT 3.1</span>
              </button>
            </div>

            {/* Quality Certifications Strip */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #F1F5F9', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '6px' }}>
                <strong style={{ color: '#0F172A', display: 'block' }}>ISO 9001:2015</strong>
                <span style={{ color: '#64748B', fontSize: '10px' }}>Quality Audit</span>
              </div>
              <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '6px' }}>
                <strong style={{ color: '#0F172A', display: 'block' }}>RoHS / REACH</strong>
                <span style={{ color: '#64748B', fontSize: '10px' }}>Non-Toxic Finish</span>
              </div>
              <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '6px' }}>
                <strong style={{ color: '#0F172A', display: 'block' }}>NABL LAB</strong>
                <span style={{ color: '#64748B', fontSize: '10px' }}>Batch Tested</span>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* RIGHT COLUMN: Product Intelligence & Commerce Engine            */}
          {/* ================================================================ */}
          <div className="pdp-info-col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Title & SKU Header Block */}
            <div className="pdp-title-block" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#0052CC', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  DIRECT FACTORY FASTENERS • RAW INDUSTRIAL HARDWARE
                </span>
                <span style={{ fontSize: '11px', background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                  {product.subGroup || 'FASTENER'}
                </span>
              </div>

              {/* Real Dynamic Product Name */}
              <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '24px', fontWeight: 900, lineHeight: '1.25', color: '#0F172A', margin: '4px 0 12px' }}>
                {product.name}
              </h1>

              <div className="pdp-sku-meta" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '12px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                <span>SKU: <strong style={{ color: '#0F172A' }}>{product.sku}</strong></span>
                <span>•</span>
                <span>Standard: <strong style={{ color: '#0F172A' }}>{product.standard}</strong></span>
                {product.din && <span>({product.din})</span>}
                <span>•</span>
                <span style={{ color: product.stockPcs > 0 ? '#059669' : '#D97706', fontWeight: 700 }}>
                  {product.stockPcs > 0 ? `${product.stockPcs.toLocaleString()} ${product.stockUom || 'Pcs'} Ready in Warehouse` : 'Made to Order'}
                </span>
              </div>
            </div>

            {/* Interactive Parametric Dimension Selectors */}
            <div className="pdp-params-box" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Diameter Selector */}
              <div className="param-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Thread Diameter (DIA):</span>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0052CC' }}>{selectedDiameter}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {availableDiameters.map((dia) => (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => setSelectedDiameter(dia)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: selectedDiameter === dia ? '2px solid #0052CC' : '1px solid #CBD5E1',
                        background: selectedDiameter === dia ? '#EFF6FF' : '#FFFFFF',
                        color: selectedDiameter === dia ? '#0052CC' : '#334155',
                        fontSize: '12px',
                        fontWeight: selectedDiameter === dia ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {dia}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length Selector */}
              <div className="param-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Nominal Length (L):</span>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0052CC' }}>{selectedLength} mm</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {availableLengths.map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setSelectedLength(len)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: selectedLength === len ? '2px solid #0052CC' : '1px solid #CBD5E1',
                        background: selectedLength === len ? '#EFF6FF' : '#FFFFFF',
                        color: selectedLength === len ? '#0052CC' : '#334155',
                        fontSize: '12px',
                        fontWeight: selectedLength === len ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {len} mm
                    </button>
                  ))}
                </div>
              </div>

              {/* Material Grade & Finish Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '4px' }}>Property Class / Grade:</span>
                  <div style={{ padding: '6px 10px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                    {product.grade || selectedGrade}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '4px' }}>Surface Coating / Finish:</span>
                  <div style={{ padding: '6px 10px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                    {product.finish || selectedFinish}
                  </div>
                </div>
              </div>
            </div>

            {/* Dual Pricing & Volume Discount Calculation Card */}
            <div className="pdp-price-card" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              
              {/* Price Head & Dual Unit Switcher */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-headline)', fontSize: '32px', fontWeight: 900, color: '#0052CC' }}>
                      {formatINR(discountedRate)}
                    </span>
                    <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>
                      / {globalUnit === 'PCS' ? 'Piece' : 'Kg'}
                    </span>
                    {currentDiscount.pct > 0 && (
                      <span style={{ fontSize: '14px', color: '#94A3B8', textDecoration: 'line-through', fontFamily: 'var(--font-mono)' }}>
                        {formatINR(basePrice)}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                    Excluding GST (18%) • Unit Net Weight: ~{(product.weightPerPcKg * 1000).toFixed(2)}g / pc
                  </span>
                </div>

                {/* PCS vs KGS Unit Switcher */}
                <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <button
                    type="button"
                    onClick={() => setGlobalUnit('PCS')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      background: globalUnit === 'PCS' ? '#0052CC' : 'transparent',
                      color: globalUnit === 'PCS' ? '#FFFFFF' : '#475569',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    PCS
                  </button>
                  <button
                    type="button"
                    onClick={() => setGlobalUnit('KGS')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      background: globalUnit === 'KGS' ? '#0052CC' : 'transparent',
                      color: globalUnit === 'KGS' ? '#FFFFFF' : '#475569',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    KGS
                  </button>
                </div>
              </div>

              {/* Wholesale Volume Discount Slabs Table */}
              <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                <table className="volume-slabs-table" style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: '11px' }}>Order Volume Tier</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: '11px' }}>Discount Slab</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '11px' }}>Effective Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: quantity < 1000 ? '#EFF6FF' : '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: quantity < 1000 ? 700 : 500 }}>100 – 999 {globalUnit}</td>
                      <td style={{ padding: '8px 12px' }}>Base Catalog Rate</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatINR(basePrice)} / {globalUnit === 'PCS' ? 'Pc' : 'Kg'}</td>
                    </tr>
                    <tr style={{ background: quantity >= 1000 && quantity < 5000 ? '#EFF6FF' : '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: quantity >= 1000 && quantity < 5000 ? 700 : 500 }}>1,000 – 4,999 {globalUnit}</td>
                      <td style={{ padding: '8px 12px', color: '#0052CC', fontWeight: 700 }}>10% OFF (Contractor)</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatINR(basePrice * 0.9)} / {globalUnit === 'PCS' ? 'Pc' : 'Kg'}</td>
                    </tr>
                    <tr style={{ background: quantity >= 5000 && quantity < 20000 ? '#EFF6FF' : '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: quantity >= 5000 && quantity < 20000 ? 700 : 500 }}>5,000 – 19,999 {globalUnit}</td>
                      <td style={{ padding: '8px 12px', color: '#059669', fontWeight: 700 }}>20% OFF (OEM Bulk)</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatINR(basePrice * 0.8)} / {globalUnit === 'PCS' ? 'Pc' : 'Kg'}</td>
                    </tr>
                    <tr style={{ background: quantity >= 20000 ? '#EFF6FF' : '#FFFFFF' }}>
                      <td style={{ padding: '8px 12px', fontWeight: quantity >= 20000 ? 700 : 500 }}>20,000+ {globalUnit}</td>
                      <td style={{ padding: '8px 12px', color: '#B45309', fontWeight: 800 }}>26% OFF (Factory Master)</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#B45309' }}>{formatINR(basePrice * 0.74)} / {globalUnit === 'PCS' ? 'Pc' : 'Kg'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Quantity Stepper & Add to RFQ Button */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', borderRadius: '8px', border: '1px solid #CBD5E1', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(100, q - 500))}
                    style={{ width: '38px', height: '42px', background: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '18px', fontWeight: 700, cursor: 'pointer', color: '#0F172A' }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(10, parseInt(e.target.value) || 10))}
                    style={{ width: '80px', height: '42px', border: 'none', background: 'transparent', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 500)}
                    style={{ width: '38px', height: '42px', background: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '18px', fontWeight: 700, cursor: 'pointer', color: '#0F172A' }}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleAddToCart}
                  style={{ flex: 1, minWidth: '220px', padding: '12px 20px', fontSize: '14px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Zap size={18} />
                  <span>Add to RFQ Cart ({formatINR(grossTotal)})</span>
                </button>
              </div>

              {/* Quick Preset Buttons (From Actual Box/Carton Sizes) */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', fontSize: '11px', color: '#64748B' }}>
                <span>Quick Quantities:</span>
                <button
                  type="button"
                  onClick={() => setQuantity(boxQty)}
                  style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer' }}
                >
                  Box ({boxQty.toLocaleString()} {globalUnit})
                </button>
                <button
                  type="button"
                  onClick={() => setQuantity(ctnQty)}
                  style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer' }}
                >
                  Carton ({ctnQty.toLocaleString()} {globalUnit})
                </button>
                <button
                  type="button"
                  onClick={() => setQuantity(10000)}
                  style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer' }}
                >
                  Bulk (10k)
                </button>
                <button
                  type="button"
                  onClick={() => setQuantity(25000)}
                  style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer' }}
                >
                  Pallet (25k)
                </button>
              </div>

              {/* Secondary Action Strip (WhatsApp + Datasheet) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                <a
                  href={`https://wa.me/919888021000?text=Hello%20CBH%20Fasteners%2C%20inquiry%20regarding%20SKU%3A%20${encodeURIComponent(product.sku)}%20(${encodeURIComponent(product.name)})%20Qty%3A%20${quantity}%20${globalUnit}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#25D366',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px',
                    textDecoration: 'none'
                  }}
                >
                  <MessageSquare size={16} />
                  <span>WhatsApp Inquiry</span>
                </a>

                <button
                  type="button"
                  onClick={() => showSuccessAlert('Datasheet Generated', `Generating technical engineering specification sheet for ${product.sku}...`, 2000)}
                  className="btn-outline"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 14px', fontSize: '13px' }}
                >
                  <FileDown size={16} />
                  <span>Download Spec Sheet (PDF)</span>
                </button>
              </div>
            </div>

            {/* Warehouse Stock & Pincode Telemetry */}
            <div className="pdp-telemetry-card" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Truck size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>
                    Pan-India Heavy Logistics Carrier Dispatch
                  </strong>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 8px' }}>
                    Same-day dispatch for confirmed orders before 3:00 PM IST via BlueDart, SafeXpress, or Dedicated Full Truck Load.
                  </p>
                  
                  {/* Pincode Checker */}
                  <div style={{ display: 'flex', gap: '6px', maxWidth: '320px' }}>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="6-Digit PIN"
                      style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setPincodeMsg(`Estimated Delivery in 24-48 Hours to PIN: ${pincode}`)}
                      style={{ padding: '6px 12px', background: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Check PIN
                    </button>
                  </div>
                  {pincodeMsg && (
                    <span style={{ display: 'block', fontSize: '11px', color: '#059669', marginTop: '6px', fontWeight: 600 }}>
                      ✓ {pincodeMsg}
                    </span>
                  )}
                </div>
              </div>

              {/* Master Factory Packaging Telemetry */}
              <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '14px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#0F172A', letterSpacing: '0.5px' }}>
                    Factory Packaging & Dispatch Details
                  </span>
                  <span style={{ fontSize: '11px', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    HSN: {product.hsnCode || '73181500'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', fontSize: '11px' }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '10px' }}>Small Box:</span>
                    <strong>{product.pcsPerBox || 500} pcs ({product.smallBoxWeightKg || 2.5} kg)</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '10px' }}>Master Carton:</span>
                    <strong>{product.pcsPerMasterCtn || 4000} pcs ({product.masterCtnWeightKg || 20} kg)</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '10px' }}>Minimum Order (MOQ):</span>
                    <strong>{product.moq || '25 KGS'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '10px' }}>Lead Time:</span>
                    <strong>{product.leadTimeDays || 10} Days ({product.productionDays || 7}d + {product.packingDays || 3}d)</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================================================================ */}
        {/* SECTION: Tabbed Technical Engineering Specification Desk         */}
        {/* ================================================================ */}
        <div className="pdp-specs-desk" style={{ marginTop: '36px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          
          {/* Tabs Navigation (Horizontally scrollable for mobile) */}
          <div className="pdp-tabs-nav" style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', background: '#F8FAFC', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {[
              { id: 'excel_master', label: '1. Excel Master Specifications' },
              { id: 'mechanical', label: '2. Mechanical & Dimensions' },
              { id: 'chemical', label: '3. Chemical & Metallurgy' },
              { id: 'torque', label: '4. Torque & Fastening' },
              { id: 'downloads', label: '5. CAD & Downloads' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`pdp-tab-trigger ${activeSpecsTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveSpecsTab(tab.id as any)}
                style={{
                  padding: '14px 20px',
                  fontFamily: 'var(--font-headline)',
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  border: 'none',
                  borderBottom: activeSpecsTab === tab.id ? '3px solid #0052CC' : '3px solid transparent',
                  background: activeSpecsTab === tab.id ? '#FFFFFF' : 'transparent',
                  color: activeSpecsTab === tab.id ? '#0052CC' : '#64748B',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="pdp-tab-content" style={{ padding: '24px' }}>
            
            {/* TAB 1: ALL 30+ EXCEL MASTER SPECIFICATIONS */}
            {activeSpecsTab === 'excel_master' && (
              <div style={{ overflowX: 'auto' }}>
                <table className="specs-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ width: '30%', padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Item SKU / Code</th>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0052CC' }}>{product.sku}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Official Item Name</th>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>{product.name}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Sub-Group & Category</th>
                      <td style={{ padding: '10px 14px' }}>{product.subGroup || 'SCREW'} • {product.category} {product.subCategory ? `(${product.subCategory})` : ''}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Standards (DIN / ISO / BS / ASME)</th>
                      <td style={{ padding: '10px 14px' }}>
                        <strong>{product.standard}</strong>
                        {product.din && <span style={{ marginLeft: '8px' }}>• {product.din}</span>}
                        {product.isoStandard && <span style={{ marginLeft: '8px', color: '#059669', fontWeight: 600 }}>• {product.isoStandard}</span>}
                        {product.bsStandard && <span style={{ marginLeft: '8px', color: '#64748B' }}>• {product.bsStandard}</span>}
                        {product.asmeStandard && <span style={{ marginLeft: '8px', color: '#64748B' }}>• {product.asmeStandard}</span>}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Size Formatted</th>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{product.sizeFormatted || `${product.diameter}X${product.pitchMm}X${product.lengthMm}`}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Thread Diameter (DIA)</th>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>{product.diameter}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Thread Pitch (P)</th>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>{product.pitchMm} mm</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Nominal Length (L)</th>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>{product.lengthMm} mm</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Thread Length & Type</th>
                      <td style={{ padding: '10px 14px' }}>{product.threadLength || product.threadType || 'Full Thread'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Property Class / Grade</th>
                      <td style={{ padding: '10px 14px', fontWeight: 800 }}>{product.grade}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Surface Finish / Coating</th>
                      <td style={{ padding: '10px 14px' }}>{product.finish}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Unit Weight (Kg/Pc)</th>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>{product.weightPerPcKg} kg</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Weight / 1000 Pcs</th>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>{product.weightPer1000PcsKg || (product.weightPerPcKg * 1000).toFixed(3)} kg</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Commercial Pricing Structure</th>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>
                        <span style={{ color: '#0052CC', fontWeight: 800 }}>{formatINR(product.pricePerPiece)} / Pc</span>
                        <span style={{ marginLeft: '12px', color: '#059669', fontWeight: 800 }}>({formatINR(product.pricePerKg)} / Kg)</span>
                        <span style={{ marginLeft: '12px', color: '#64748B' }}>100 Pcs: {formatINR(product.price100Pcs || product.pricePerPiece * 100)}</span>
                        <span style={{ marginLeft: '12px', color: '#64748B' }}>1000 Pcs: {formatINR(product.price1000Pcs || product.pricePerPiece * 1000)}</span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Packaging & Box Units</th>
                      <td style={{ padding: '10px 14px' }}>
                        Small Box: <strong>{product.pcsPerBox || 500} pcs</strong> ({product.smallBoxWeightKg || 2.5} kg) • Master Carton: <strong>{product.pcsPerMasterCtn || 4000} pcs</strong> ({product.masterCtnWeightKg || 20} kg)
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>MOQ & Lead Time</th>
                      <td style={{ padding: '10px 14px' }}>
                        MOQ: <strong>{product.moq || '25 KGS'}</strong> • Lead Time: <strong>{product.leadTimeDays || 10} Days</strong> (Production: {product.productionDays || 7}d + Packing: {product.packingDays || 3}d)
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Brand & GST HSN Code</th>
                      <td style={{ padding: '10px 14px' }}>Brand: <strong>{product.brand || 'CBH'}</strong> • HSN Code: <strong>{product.hsnCode || '73181500'}</strong></td>
                    </tr>
                    <tr>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Engineering CAD & Media Links</th>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          {product.drawingUrl ? (
                            <a href={product.drawingUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0052CC', fontWeight: 700, textDecoration: 'underline' }}>
                              📐 Open AutoCAD CAD Drawing
                            </a>
                          ) : (
                            <span style={{ color: '#94A3B8' }}>CAD Drawing Available on Request</span>
                          )}
                          {product.gdriveImageUrl && (
                            <a href={product.gdriveImageUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#059669', fontWeight: 700, textDecoration: 'underline' }}>
                              📷 View Google Drive High-Res Photo
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Embedded HTML Specification Sheet from ERPNext if available */}
                {/* {product.descriptionHtml && (
                  <div style={{ marginTop: '20px', padding: '16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <strong style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#334155' }}>
                      ERPNext / Frappe Technical Specification Table:
                    </strong>
                    <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
                  </div>
                )} */}
              </div>
            )}

            {/* TAB 2: MECHANICAL & DIMENSIONS */}
            {activeSpecsTab === 'mechanical' && (
              <div style={{ overflowX: 'auto' }}>
                <table className="specs-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ width: '35%', padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B' }}>Manufacturing Standard</th>
                      <td style={{ padding: '10px 14px' }}>{product.standard} / {product.din || 'DIN STD'} / {product.isoStandard || 'ISO'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B' }}>Thread Pitch (P)</th>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>{product.pitchMm} mm (Standard ISO 965-2 Metric)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B' }}>Nominal Length (L)</th>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>{product.lengthMm} mm</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B' }}>Tensile Strength (Rm)</th>
                      <td style={{ padding: '10px 14px' }}>800 N/mm² minimum (Class 8.8) / 1040 N/mm² (Class 10.9)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B' }}>Yield Proof Stress (Sp)</th>
                      <td style={{ padding: '10px 14px' }}>640 N/mm² (80% Yield Ratio)</td>
                    </tr>
                    <tr>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B' }}>Elongation at Break (A5)</th>
                      <td style={{ padding: '10px 14px' }}>12% minimum guaranteed</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: CHEMICAL & METALLURGY */}
            {activeSpecsTab === 'chemical' && (
              <div style={{ overflowX: 'auto' }}>
                <table className="specs-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ width: '35%', padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B' }}>Base Raw Material Steel</th>
                      <td style={{ padding: '10px 14px' }}>Medium Carbon Alloy / Boron Steel (SAE 10B21 / 10B30)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B' }}>Carbon (C) Content</th>
                      <td style={{ padding: '10px 14px' }}>0.18% - 0.23% (Optimal ductile core)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B' }}>Manganese (Mn)</th>
                      <td style={{ padding: '10px 14px' }}>0.70% - 1.00%</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B' }}>Phosphorus (P) & Sulfur (S)</th>
                      <td style={{ padding: '10px 14px' }}>Max 0.030% (Low impurity vacuum degassed)</td>
                    </tr>
                    <tr>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B' }}>Mill Test Traceability</th>
                      <td style={{ padding: '10px 14px' }}>EN 10204 Type 3.1 Factory Inspection Certificate with Melt Heat Number</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 4: TORQUE & FASTENING */}
            {activeSpecsTab === 'torque' && (
              <div style={{ overflowX: 'auto' }}>
                <table className="specs-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ width: '35%', padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B' }}>Recommended Tightening Torque</th>
                      <td style={{ padding: '10px 14px' }}>32.0 Nm (Dry) / 28.5 Nm (Lubricated / Light Oil)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B' }}>Maximum Proof Load</th>
                      <td style={{ padding: '10px 14px' }}>33.7 kN (Yielding Threshold)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B' }}>Operating Temperature Range</th>
                      <td style={{ padding: '10px 14px' }}>-40°C to +200°C</td>
                    </tr>
                    <tr>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B' }}>Corrosion Protection Rating</th>
                      <td style={{ padding: '10px 14px' }}>Passes 96 Hours ASTM B117 Neutral Salt Spray Test without red rust</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 5: DOWNLOADS & CAD ASSETS */}
            {activeSpecsTab === 'downloads' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div style={{ border: '1px solid #E2E8F0', padding: '16px', borderRadius: '12px', background: '#F8FAFC' }}>
                  <FileText size={24} color="#0052CC" style={{ marginBottom: '8px' }} />
                  <strong style={{ display: 'block', fontSize: '13px', color: '#0F172A' }}>Technical Engineering Datasheet</strong>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block', margin: '4px 0 10px' }}>
                    PDF • 1.4 MB • Complete dimensional table
                  </span>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                    onClick={() => showToast('Downloading Technical Datasheet (PDF)...', 'info')}
                  >
                    Download PDF
                  </button>
                </div>

                <div style={{ border: '1px solid #E2E8F0', padding: '16px', borderRadius: '12px', background: '#F8FAFC' }}>
                  <Layers size={24} color="#0052CC" style={{ marginBottom: '8px' }} />
                  <strong style={{ display: 'block', fontSize: '13px', color: '#0F172A' }}>AutoCAD 2D/3D STEP Model</strong>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block', margin: '4px 0 10px' }}>
                    STEP / DWG • 3.2 MB • SolidWorks ready
                  </span>
                  {product.drawingUrl ? (
                    <a
                      href={product.drawingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline"
                      style={{ fontSize: '11px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                    >
                      <ExternalLink size={12} />
                      <span>Open CAD File</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="btn-outline"
                      style={{ fontSize: '11px', padding: '6px 12px' }}
                      onClick={() => showToast('Requesting CAD 3D STEP Model from factory...', 'info')}
                    >
                      Request CAD Model
                    </button>
                  )}
                </div>

                <div style={{ border: '1px solid #E2E8F0', padding: '16px', borderRadius: '12px', background: '#F8FAFC' }}>
                  <Award size={24} color="#059669" style={{ marginBottom: '8px' }} />
                  <strong style={{ display: 'block', fontSize: '13px', color: '#0F172A' }}>NABL 3.1 Mill Certificate Sample</strong>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block', margin: '4px 0 10px' }}>
                    PDF • 850 KB • Authentic lab test copy
                  </span>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                    onClick={() => showToast('Downloading NABL 3.1 Mill Certificate...', 'info')}
                  >
                    Download Cert
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================ */}
        {/* SECTION: Matching Companion Hardware Assembly Kit                */}
        {/* ================================================================ */}
        <div style={{ marginTop: '36px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', color: '#0F172A', margin: 0 }}>
                Frequently Procured Assembly Kit (Screw + Nut + Washer)
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                Engineered matching hardware calibrated for {selectedDiameter} diameter assembly.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div>
                <span className="badge badge-din" style={{ fontSize: '10px', marginBottom: '4px' }}>DIN 934</span>
                <strong style={{ fontSize: '13px', display: 'block', color: '#0F172A' }}>Hexagon Full Nuts Grade 8 ({selectedDiameter})</strong>
                <span style={{ fontSize: '12px', color: '#0052CC', fontWeight: 700 }}>₹ 1.84 / Pc</span>
              </div>
              <button
                type="button"
                className="btn-outline"
                onClick={() => handleAddCompanion('Hexagon Nut DIN 934', 'DIN 934', 1.84)}
                style={{ padding: '6px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={12} /> Add
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div>
                <span className="badge badge-din" style={{ fontSize: '10px', marginBottom: '4px' }}>DIN 125A</span>
                <strong style={{ fontSize: '13px', display: 'block', color: '#0F172A' }}>Form A Plain Flat Washers ({selectedDiameter})</strong>
                <span style={{ fontSize: '12px', color: '#0052CC', fontWeight: 700 }}>₹ 0.72 / Pc</span>
              </div>
              <button
                type="button"
                className="btn-outline"
                onClick={() => handleAddCompanion('Flat Washer DIN 125A', 'DIN 125A', 0.72)}
                style={{ padding: '6px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={12} /> Add
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div>
                <span className="badge badge-din" style={{ fontSize: '10px', marginBottom: '4px' }}>DIN 127B</span>
                <strong style={{ fontSize: '13px', display: 'block', color: '#0F172A' }}>Split Spring Lock Washers ({selectedDiameter})</strong>
                <span style={{ fontSize: '12px', color: '#0052CC', fontWeight: 700 }}>₹ 0.95 / Pc</span>
              </div>
              <button
                type="button"
                className="btn-outline"
                onClick={() => handleAddCompanion('Spring Washer DIN 127B', 'DIN 127B', 0.95)}
                style={{ padding: '6px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={12} /> Add
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={(id, qty) => {
          setCartItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantity: qty, rowTotal: qty * item.unitRate } : item))
          );
        }}
        onRemoveItem={(id) => {
          setCartItems((prev) => prev.filter((item) => item.id !== id));
        }}
      />

      {/* Toast Notification Container */}
      {toastMsg && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle2 size={18} color="#22C55E" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Full-Screen Lightbox Image Zoom Modal */}
      {isLightboxOpen && (
        <div className="modal-overlay active" onClick={() => setIsLightboxOpen(false)}>
          <div
            className="modal-window"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '24px', maxWidth: '700px', width: '95%', textAlign: 'center' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#0052CC', fontWeight: 700 }}>
                  {product.sku}
                </span>
                <h4 style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                  {product.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '20px', minHeight: '300px', maxHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              <img
                src={product.imageUrl || '/assets/bolt_zinc.jpg'}
                alt={product.name}
                style={{ maxWidth: '100%', maxHeight: '450px', objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/bolt_zinc.jpg'; }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                {product.sizeFormatted} • Grade {product.grade} • {product.finish}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {product.gdriveImageUrl && (
                  <a
                    href={product.gdriveImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline"
                    style={{ fontSize: '11px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  >
                    <ExternalLink size={12} />
                    <span>View Drive Original</span>
                  </a>
                )}
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setIsLightboxOpen(false)}
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  Close Zoom
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Commerce Dock */}
      <div className="pdp-mobile-sticky-dock show-mobile-only" style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '12px 16px', alignItems: 'center', justifyContent: 'space-between', gap: '12px', boxShadow: '0 -4px 16px rgba(0,0,0,0.08)' }}>
        <div>
          <span style={{ fontSize: '10px', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
            Unit Rate ({globalUnit}):
          </span>
          <strong style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', color: '#0052CC' }}>
            {formatINR(discountedRate)}
          </strong>
        </div>
        <button
          type="button"
          className="btn-primary"
          style={{ padding: '10px 18px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          onClick={handleAddToCart}
        >
          <ShoppingCart size={15} />
          <span>Add to RFQ ({quantity})</span>
        </button>
      </div>
    </div>
  );
}
