'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import MainHeader from '@/components/header/MainHeader';
import CartDrawer from '@/components/cart/CartDrawer';
import { Product, GlobalUnit, RfqLineItem } from '@/lib/types';
import { formatINR, clampQty, formatQtyDisplay, getMinQty, MIN_QTY_PCS, MIN_QTY_KGS, toTitleCase } from '@/lib/rfq-calculator';
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
  Flame,
  Heading4
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
  const [quantityInput, setQuantityInput] = useState<string>('500');

  const updateQuantity = (newQty: number) => {
    setQuantity(newQty);
    setQuantityInput(String(newQty));
  };

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
              updateQuantity(b);
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
  const getVolumeDiscount = (qty: number, unit: GlobalUnit) => {
    if (unit === 'KGS') {
      if (qty >= 1000) return { pct: 26, label: 'Master OEM Wholesale (-26%)' };
      if (qty >= 250) return { pct: 20, label: 'Contractor Volume Tier (-20%)' };
      if (qty >= 50) return { pct: 10, label: 'Bulk Batch Tier (-10%)' };
      return { pct: 0, label: 'Standard Rate' };
    }
    // PCS
    if (qty >= 20000) return { pct: 26, label: 'Master OEM Wholesale (-26%)' };
    if (qty >= 5000) return { pct: 20, label: 'Contractor Volume Tier (-20%)' };
    if (qty >= 1000) return { pct: 10, label: 'Bulk Batch Tier (-10%)' };
    return { pct: 0, label: 'Standard Rate' };
  };

  const currentDiscount = getVolumeDiscount(quantity, globalUnit);
  const basePrice = product ? (globalUnit === 'PCS' ? product.pricePerPiece : product.pricePerKg) : 0;
  const discountedRate = basePrice * (1 - currentDiscount.pct / 100);
  const grossTotal = quantity * discountedRate;
  const weightTotalKg = product
    ? globalUnit === 'PCS'
      ? quantity * (product.weightPerPcKg || 0.06)
      : quantity
    : 0;

  // Toggle Unit with smart conversion so user is never annoyed
  const handleUnitToggle = (newUnit: GlobalUnit) => {
    if (newUnit === globalUnit) return;
    setGlobalUnit(newUnit);
    if (newUnit === 'KGS') {
      // Switching from PCS to KGS: convert approx weight or default to min 0.25 KG (250 gm)
      const approxKg = Math.round((quantity * (product?.weightPerPcKg || 0.05)) * 100) / 100;
      const nextKg = approxKg >= MIN_QTY_KGS ? approxKg : MIN_QTY_KGS;
      updateQuantity(nextKg);
    } else {
      // Switching from KGS to PCS: convert approx pieces or default to min 100 PCS rounded to 10s
      const approxPcs = Math.round(quantity / (product?.weightPerPcKg || 0.05));
      const roundedPcs = Math.round(approxPcs / 10) * 10;
      const nextPcs = roundedPcs >= MIN_QTY_PCS ? roundedPcs : MIN_QTY_PCS;
      updateQuantity(nextPcs);
    }
  };

  const handleStepPDPQty = (delta: number) => {
    if (globalUnit === 'KGS') {
      if (delta < 0) {
        if (quantity <= MIN_QTY_KGS) return;
        const step = quantity <= 1 ? 0.25 : 0.5;
        const next = Math.max(MIN_QTY_KGS, Math.round((quantity - step) * 100) / 100);
        updateQuantity(next);
      } else {
        const step = quantity < 1 ? 0.25 : 0.5;
        const next = Math.round((quantity + step) * 100) / 100;
        updateQuantity(next);
      }
    } else {
      // Step PCS by 10 (100 -> 110 -> 120 -> 130...)
      const step = 10;
      if (delta < 0) {
        if (quantity <= MIN_QTY_PCS) return;
        const next = Math.max(MIN_QTY_PCS, quantity - step);
        updateQuantity(next);
      } else {
        const next = Math.max(MIN_QTY_PCS, quantity + step);
        updateQuantity(next);
      }
    }
  };

  // Add to RFQ Cart
  const handleAddToCart = () => {
    if (!product) return;
    const finalQty = clampQty(quantity, globalUnit);
    if (finalQty !== quantity) {
      setQuantity(finalQty);
    }
    const finalGrossTotal = finalQty * discountedRate;
    const finalWeightTotalKg = globalUnit === 'PCS' ? finalQty * (product.weightPerPcKg || 0.06) : finalQty;

    const newItem: RfqLineItem = {
      id: Date.now(),
      productId: product.id,
      sku: product.sku,
      name: product.name,
      standard: product.standard,
      unit: globalUnit,
      unitRate: discountedRate,
      quantity: finalQty,
      weightPerPcKg: product.weightPerPcKg || 0.06,
      totalWeightKg: finalWeightTotalKg,
      rowTotal: finalGrossTotal,
    };

    setCartItems((prev) => [newItem, ...prev]);
    setIsCartOpen(true);
    showToast(`Added ${formatQtyDisplay(finalQty, globalUnit)} of ${product.sku} to RFQ Cart!`, 'success');
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
      {/* Breadcrumbs Banner */}
      <div className="pdp-breadcrumb-bar bg-white border-b border-slate-200 py-2.5 sm:py-3">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <nav className="pdp-breadcrumbs flex items-center flex-wrap gap-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-blue-700 transition-colors">Home</Link>
              <span className="text-slate-300">/</span>
              <Link href="/products" className="hover:text-blue-700 transition-colors">Catalog</Link>
              {product.subGroup && (
                <>
                  <span className="text-slate-300">/</span>
                  <span>{toTitleCase(product.subGroup)}</span>
                </>
              )}
              {product.category && (
                <>
                  <span className="text-slate-300">/</span>
                  <span className="max-w-[140px] sm:max-w-[200px] truncate">
                    {toTitleCase(product.category)}
                  </span>
                </>
              )}
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-bold">
                {product.sizeFormatted || `${product.diameter}x${product.lengthMm}`}
              </span>
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg py-1 px-2.5 text-xs text-slate-600 font-semibold cursor-pointer transition-colors"
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
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 pb-28 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ================================================================ */}
          {/* LEFT COLUMN: Technical Viewport & CAD Drawing Visualizer        */}
          {/* ================================================================ */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="pdp-gallery-card bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
              
              {/* Badges Strip */}
              <div className="flex justify-between items-center flex-wrap gap-2 mb-3 sm:mb-3.5">
                <div className="flex gap-1.5 flex-wrap items-center">
                  <span className="badge badge-din py-1 px-2 text-[11px] font-bold">
                    {product.standard || 'DIN STD'}
                  </span>
                  {product.grade && (
                    <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-800 py-0.5 px-2 rounded border border-slate-300">
                      {product.grade}
                    </span>
                  )}
                  {product.isSurplus && (
                    <span className="text-[11px] font-extrabold bg-amber-100 text-amber-800 py-0.5 px-2 rounded inline-flex items-center gap-1">
                      <Flame size={12} /> -{product.surplusDiscountPct}% Surplus
                    </span>
                  )}
                </div>

                <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-mono font-semibold">
                  <CheckCircle2 size={13} />
                  BIS / ISO Calibrated
                </span>
              </div>

              {/* Main Visualizer Window */}
              <div
                className="pdp-main-viewport w-full h-64 sm:h-80 md:h-[340px] bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden flex items-center justify-center"
                style={{ cursor: activeMediaTab === 'photo' ? 'zoom-in' : 'default' }}
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
                      Engineering 2D Blueprint // {product.standard}
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
                  <h4 style={{ fontFamily: 'var(--font-headline)', fontSize: '16px', fontWeight: 800, marginBottom: '4px', color: '#0F172A' }}>
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
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  border: activeMediaTab === 'photo' ? '2px solid #0052CC' : '1px solid #E2E8F0',
                  background: activeMediaTab === 'photo' ? '#EFF6FF' : '#F8FAFC',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
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
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  border: activeMediaTab === 'cad' ? '2px solid #0052CC' : '1px solid #E2E8F0',
                  background: activeMediaTab === 'cad' ? '#EFF6FF' : '#F8FAFC',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  fontSize: '9.5px',
                  fontFamily: 'var(--font-mono)',
                  color: activeMediaTab === 'cad' ? '#0052CC' : '#64748B',
                  flexShrink: 0
                }}
                title="View CAD Blueprint"
              >
                <Layers size={18} color={activeMediaTab === 'cad' ? '#0052CC' : '#64748B'} />
                <span>CAD 2D</span>
              </button>

              <button
                type="button"
                className={`pdp-thumb-btn ${activeMediaTab === 'cert' ? 'active' : ''}`}
                onClick={() => setActiveMediaTab('cert')}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  border: activeMediaTab === 'cert' ? '2px solid #059669' : '1px solid #E2E8F0',
                  background: activeMediaTab === 'cert' ? '#ECFDF5' : '#F8FAFC',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  fontSize: '9.5px',
                  fontFamily: 'var(--font-mono)',
                  color: activeMediaTab === 'cert' ? '#059669' : '#64748B',
                  flexShrink: 0
                }}
                title="View Inspection Certificate"
              >
                <Award size={18} color={activeMediaTab === 'cert' ? '#059669' : '#64748B'} />
                <span>CERT 3.1</span>
              </button>
            </div>

            {/* Quality Certifications Strip */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-[10px] sm:text-xs font-mono">
              <div className="bg-slate-50 p-2 rounded-lg">
                <strong className="text-slate-900 block truncate">ISO 9001:2015</strong>
                <span className="text-slate-500 text-[9px] sm:text-[10px]">Quality Audit</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <strong className="text-slate-900 block truncate">RoHS / REACH</strong>
                <span className="text-slate-500 text-[9px] sm:text-[10px]">Non-Toxic</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <strong className="text-slate-900 block truncate">NABL LAB</strong>
                <span className="text-slate-500 text-[9px] sm:text-[10px]">Tested</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* RIGHT COLUMN: Product Intelligence & Commerce Engine            */}
        {/* ================================================================ */}
        <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5">
          
          {/* Title & SKU Header Block */}
          <div className="pdp-title-block bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-[10.5px] sm:text-xs text-blue-700 font-bold tracking-wide">
                Direct Factory Fasteners • Raw Industrial Hardware
              </span>
              <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                {toTitleCase(product.subGroup || 'Fastener')}
              </span>
            </div>

            {/* Real Dynamic Product Name */}
            <h4 className=" text-sm sm:text-md md:text-lg font-bold text-slate-900 ">
              {toTitleCase(product.name)}
            </h4>

            <div className="pdp-sku-meta flex items-center flex-wrap gap-2 text-xs sm:text-[13px] text-slate-500 font-mono mt-2">
              <span>SKU: <strong className="text-slate-900">{product.sku}</strong></span>
              <span>•</span>
              <span>Standard: <strong className="text-slate-900">{product.standard}</strong></span>
              {product.din && <span>({product.din})</span>}
              <span>•</span>
              <span className={`font-bold ${product.stockPcs > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {product.stockPcs > 0 ? `${product.stockPcs.toLocaleString()} ${product.stockUom || 'Pcs'} Ready in Warehouse` : 'Made to Order'}
              </span>
            </div>
          </div>

          {/* Interactive Parametric Dimension Selectors */}
          <div className="pdp-params-box bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col gap-3.5 sm:gap-4">
            
            {/* Diameter Selector */}
            <div className="param-group">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs sm:text-sm font-bold text-slate-700">Thread Diameter (DIA):</span>
                <span className="text-xs sm:text-sm font-mono font-black text-blue-700">{selectedDiameter}</span>
              </div>
              <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                {availableDiameters.map((dia) => (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => setSelectedDiameter(dia)}
                    className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                      selectedDiameter === dia
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-2xs'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {dia}
                  </button>
                ))}
              </div>
            </div>

            {/* Length Selector */}
            <div className="param-group">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs sm:text-sm font-bold text-slate-700">Nominal Length (L):</span>
                <span className="text-xs sm:text-sm font-mono font-black text-blue-700">{selectedLength} mm</span>
              </div>
              <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                {availableLengths.map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setSelectedLength(len)}
                    className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                      selectedLength === len
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-2xs'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                    }`}
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
                    {toTitleCase(product.grade || selectedGrade)}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '4px' }}>Surface Coating / Finish:</span>
                  <div style={{ padding: '6px 10px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                    {toTitleCase(product.finish || selectedFinish)}
                  </div>
                </div>
              </div>
            </div>

            {/* Dual Pricing & Volume Discount Calculation Card */}
            <div className="pdp-price-card bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
              
              {/* Price Head & Dual Unit Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-headline text-2xl sm:text-3xl font-black text-blue-700">
                      {formatINR(discountedRate)}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-500 font-semibold">
                      / {globalUnit === 'PCS' ? 'Piece' : 'Kg'}
                    </span>
                    {currentDiscount.pct > 0 && (
                      <span className="text-xs sm:text-sm text-slate-400 line-through font-mono">
                        {formatINR(basePrice)}
                      </span>
                    )}
                  </div>
                  <span className="text-[10.5px] sm:text-xs text-slate-500 font-mono block mt-1">
                    Excl. GST (18%) • Unit Net Wt: ~{(product.weightPerPcKg * 1000).toFixed(2)}g/pc
                  </span>
                </div>

                {/* PCS vs KGS Unit Switcher */}
                <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 self-start">
                  <button
                    type="button"
                    onClick={() => handleUnitToggle('PCS')}
                    className={`py-1.5 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      globalUnit === 'PCS' ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    PCS
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnitToggle('KGS')}
                    className={`py-1.5 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      globalUnit === 'KGS' ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    KGS
                  </button>
                </div>
              </div>

              {/* Wholesale Volume Discount Slabs Table */}
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-4">
                <table className="volume-slabs-table min-w-[300px] w-full text-xs border-collapse rounded-lg overflow-hidden border border-slate-200">
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: '11px' }}>Order Volume Tier</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: '11px' }}>Discount Slab</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '11px' }}>Effective Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {globalUnit === 'KGS' ? (
                      <>
                        <tr style={{ background: quantity < 50 ? '#EFF6FF' : '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: quantity < 50 ? 700 : 500 }}>250 gm – 49.9 Kg</td>
                          <td style={{ padding: '8px 12px' }}>Base Catalog Rate</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatINR(basePrice)} / Kg</td>
                        </tr>
                        <tr style={{ background: quantity >= 50 && quantity < 250 ? '#EFF6FF' : '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: quantity >= 50 && quantity < 250 ? 700 : 500 }}>50 – 249 Kg</td>
                          <td style={{ padding: '8px 12px', color: '#0052CC', fontWeight: 700 }}>10% OFF (Contractor)</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatINR(basePrice * 0.9)} / Kg</td>
                        </tr>
                        <tr style={{ background: quantity >= 250 && quantity < 1000 ? '#EFF6FF' : '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: quantity >= 250 && quantity < 1000 ? 700 : 500 }}>250 – 999 Kg</td>
                          <td style={{ padding: '8px 12px', color: '#059669', fontWeight: 700 }}>20% OFF (OEM Bulk)</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatINR(basePrice * 0.8)} / Kg</td>
                        </tr>
                        <tr style={{ background: quantity >= 1000 ? '#EFF6FF' : '#FFFFFF' }}>
                          <td style={{ padding: '8px 12px', fontWeight: quantity >= 1000 ? 700 : 500 }}>1,000+ Kg</td>
                          <td style={{ padding: '8px 12px', color: '#B45309', fontWeight: 800 }}>26% OFF (Factory Master)</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#B45309' }}>{formatINR(basePrice * 0.74)} / Kg</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr style={{ background: quantity < 1000 ? '#EFF6FF' : '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: quantity < 1000 ? 700 : 500 }}>100 – 999 Pcs</td>
                          <td style={{ padding: '8px 12px' }}>Base Catalog Rate</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatINR(basePrice)} / Pc</td>
                        </tr>
                        <tr style={{ background: quantity >= 1000 && quantity < 5000 ? '#EFF6FF' : '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: quantity >= 1000 && quantity < 5000 ? 700 : 500 }}>1,000 – 4,999 Pcs</td>
                          <td style={{ padding: '8px 12px', color: '#0052CC', fontWeight: 700 }}>10% OFF (Contractor)</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatINR(basePrice * 0.9)} / Pc</td>
                        </tr>
                        <tr style={{ background: quantity >= 5000 && quantity < 20000 ? '#EFF6FF' : '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: quantity >= 5000 && quantity < 20000 ? 700 : 500 }}>5,000 – 19,999 Pcs</td>
                          <td style={{ padding: '8px 12px', color: '#059669', fontWeight: 700 }}>20% OFF (OEM Bulk)</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatINR(basePrice * 0.8)} / Pc</td>
                        </tr>
                        <tr style={{ background: quantity >= 20000 ? '#EFF6FF' : '#FFFFFF' }}>
                          <td style={{ padding: '8px 12px', fontWeight: quantity >= 20000 ? 700 : 500 }}>20,000+ Pcs</td>
                          <td style={{ padding: '8px 12px', color: '#B45309', fontWeight: 800 }}>26% OFF (Factory Master)</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#B45309' }}>{formatINR(basePrice * 0.74)} / Pc</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Quantity Stepper & Add to RFQ Button */}
              <div className="flex flex-col gap-2.5 mb-3.5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                  
                  {/* Stepper */}
                  <div className="flex items-center justify-between sm:justify-start bg-slate-100 rounded-xl border border-slate-300 p-1">
                    <button
                      type="button"
                      disabled={quantity <= (globalUnit === 'KGS' ? MIN_QTY_KGS : MIN_QTY_PCS)}
                      onClick={() => handleStepPDPQty(-1)}
                      className="w-10 h-10 bg-white rounded-lg font-bold text-slate-800 text-lg hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shadow-2xs"
                      title={quantity <= (globalUnit === 'KGS' ? MIN_QTY_KGS : MIN_QTY_PCS) ? `Minimum order reached (${globalUnit === 'KGS' ? '250 gm' : '100 pcs'})` : `Decrease by ${globalUnit === 'KGS' ? '0.25 Kg' : '10 Pcs'}`}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step={globalUnit === 'KGS' ? '0.25' : '10'}
                      min={globalUnit === 'KGS' ? 0.25 : 100}
                      value={quantityInput}
                      onChange={(e) => {
                        setQuantityInput(e.target.value);
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val > 0) {
                          setQuantity(val);
                        }
                      }}
                      onBlur={() => {
                        const parsed = parseFloat(quantityInput);
                        const clamped = isNaN(parsed) ? (globalUnit === 'KGS' ? MIN_QTY_KGS : MIN_QTY_PCS) : clampQty(parsed, globalUnit);
                        updateQuantity(clamped);
                        if (!isNaN(parsed) && clamped !== parsed) {
                          showToast(`Minimum order is ${formatQtyDisplay(clamped, globalUnit)}`, 'info');
                        }
                      }}
                      placeholder={globalUnit === 'KGS' ? 'Kg' : 'Pcs'}
                      className="flex-1 sm:w-24 h-10 text-center font-mono font-bold text-sm sm:text-base text-slate-900 bg-transparent outline-none px-2"
                      title="Type any custom quantity directly"
                    />
                    <button
                      type="button"
                      onClick={() => handleStepPDPQty(1)}
                      className="w-10 h-10 bg-white rounded-lg font-bold text-slate-800 text-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center shadow-2xs"
                      title={`Increase by ${globalUnit === 'KGS' ? '0.25 Kg' : '10 Pcs'}`}
                    >
                      +
                    </button>
                  </div>

                  {/* Add to RFQ Button */}
                  <button
                    type="button"
                    className="btn-primary flex-1 py-3 px-5 text-sm sm:text-base font-extrabold flex items-center justify-center gap-2 rounded-xl shadow-sm cursor-pointer"
                    onClick={handleAddToCart}
                  >
                    <Zap size={18} />
                    <span>Add to RFQ Cart ({formatINR(grossTotal)})</span>
                  </button>
                </div>

                {/* Clear MOQ Helper Hint */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                  <span className="font-bold text-blue-700">
                    {globalUnit === 'KGS' ? '⚡ Minimum Order: 250 gm (0.25 Kg)' : '⚡ Minimum Order: 100 Pcs (Step +10)'}
                  </span>
                  <span>•</span>
                  <span>Configured: <strong>{formatQtyDisplay(quantity, globalUnit)}</strong></span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">Click number to edit</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', fontSize: '11px', color: '#64748B' }}>
                <span style={{ fontWeight: 600 }}>Quick Quantities:</span>
                {globalUnit === 'KGS' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => updateQuantity(0.25)}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '6px',
                        border: quantity === 0.25 ? '1.5px solid #0052CC' : '1px solid #CBD5E1',
                        background: quantity === 0.25 ? '#EFF6FF' : '#FFFFFF',
                        color: quantity === 0.25 ? '#0052CC' : '#334155',
                        fontWeight: quantity === 0.25 ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      250 gm (Min)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateQuantity(0.5)}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '6px',
                        border: quantity === 0.5 ? '1.5px solid #0052CC' : '1px solid #CBD5E1',
                        background: quantity === 0.5 ? '#EFF6FF' : '#FFFFFF',
                        color: quantity === 0.5 ? '#0052CC' : '#334155',
                        fontWeight: quantity === 0.5 ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      500 gm
                    </button>
                    <button
                      type="button"
                      onClick={() => updateQuantity(1)}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '6px',
                        border: quantity === 1 ? '1.5px solid #0052CC' : '1px solid #CBD5E1',
                        background: quantity === 1 ? '#EFF6FF' : '#FFFFFF',
                        color: quantity === 1 ? '#0052CC' : '#334155',
                        fontWeight: quantity === 1 ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      1 Kg
                    </button>
                    <button
                      type="button"
                      onClick={() => updateQuantity(5)}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '6px',
                        border: quantity === 5 ? '1.5px solid #0052CC' : '1px solid #CBD5E1',
                        background: quantity === 5 ? '#EFF6FF' : '#FFFFFF',
                        color: quantity === 5 ? '#0052CC' : '#334155',
                        fontWeight: quantity === 5 ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      5 Kg
                    </button>
                    <button
                      type="button"
                      onClick={() => updateQuantity(25)}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '6px',
                        border: quantity === 25 ? '1.5px solid #0052CC' : '1px solid #CBD5E1',
                        background: quantity === 25 ? '#EFF6FF' : '#FFFFFF',
                        color: quantity === 25 ? '#0052CC' : '#334155',
                        fontWeight: quantity === 25 ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      25 Kg (Bag)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateQuantity(50)}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '6px',
                        border: quantity === 50 ? '1.5px solid #0052CC' : '1px solid #CBD5E1',
                        background: quantity === 50 ? '#EFF6FF' : '#FFFFFF',
                        color: quantity === 50 ? '#0052CC' : '#334155',
                        fontWeight: quantity === 50 ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      50 Kg (Drum)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => updateQuantity(100)}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '6px',
                        border: quantity === 100 ? '1.5px solid #0052CC' : '1px solid #CBD5E1',
                        background: quantity === 100 ? '#EFF6FF' : '#FFFFFF',
                        color: quantity === 100 ? '#0052CC' : '#334155',
                        fontWeight: quantity === 100 ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      100 Pcs (Min)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateQuantity(boxQty)}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '6px',
                        border: quantity === boxQty ? '1.5px solid #0052CC' : '1px solid #CBD5E1',
                        background: quantity === boxQty ? '#EFF6FF' : '#FFFFFF',
                        color: quantity === boxQty ? '#0052CC' : '#334155',
                        fontWeight: quantity === boxQty ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      Box ({boxQty.toLocaleString()} Pcs)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateQuantity(ctnQty)}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '6px',
                        border: quantity === ctnQty ? '1.5px solid #0052CC' : '1px solid #CBD5E1',
                        background: quantity === ctnQty ? '#EFF6FF' : '#FFFFFF',
                        color: quantity === ctnQty ? '#0052CC' : '#334155',
                        fontWeight: quantity === ctnQty ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      Carton ({ctnQty.toLocaleString()} Pcs)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateQuantity(10000)}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '6px',
                        border: quantity === 10000 ? '1.5px solid #0052CC' : '1px solid #CBD5E1',
                        background: quantity === 10000 ? '#EFF6FF' : '#FFFFFF',
                        color: quantity === 10000 ? '#0052CC' : '#334155',
                        fontWeight: quantity === 10000 ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      10,000 Pcs
                    </button>
                  </>
                )}
              </div>

              {/* Secondary Action Strip (WhatsApp + Datasheet) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 pt-4 border-t border-slate-100">
                <a
                  href={`https://wa.me/919888021000?text=Hello%20CBH%20Fasteners%2C%20inquiry%20regarding%20SKU%3A%20${encodeURIComponent(product.sku)}%20(${encodeURIComponent(product.name)})%20Qty%3A%20${quantity}%20${globalUnit}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl bg-[#25D366] text-white font-bold text-xs sm:text-sm no-underline shadow-2xs hover:opacity-95 transition-opacity"
                >
                  <MessageSquare size={16} />
                  <span>WhatsApp Inquiry</span>
                </a>

                <button
                  type="button"
                  onClick={() => showSuccessAlert('Datasheet Generated', `Generating technical engineering specification sheet for ${product.sku}...`, 2000)}
                  className="btn-outline flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  <FileDown size={16} />
                  <span>Download Spec Sheet (PDF)</span>
                </button>
              </div>
            </div>

            {/* Warehouse Stock & Pincode Telemetry */}
            <div className="pdp-telemetry-card bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
              
              <div className="flex gap-3 items-start mb-3.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Truck size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <strong className="text-xs sm:text-sm text-slate-900 block font-bold">
                    Pan-India Heavy Logistics Carrier Dispatch
                  </strong>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 mb-2 leading-relaxed">
                    Same-day dispatch for confirmed orders before 3:00 PM IST via BlueDart, SafeXpress, or Dedicated Full Truck Load.
                  </p>
                  
                  {/* Pincode Checker */}
                  <div className="flex gap-2 w-full max-w-sm">
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="6-Digit PIN"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setPincodeMsg(`Estimated Delivery in 24-48 Hours to PIN: ${pincode}`)}
                      className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      Check PIN
                    </button>
                  </div>
                  {pincodeMsg && (
                    <span className="block text-[11px] text-emerald-700 mt-1.5 font-semibold">
                      ✓ {pincodeMsg}
                    </span>
                  )}
                </div>
              </div>

              {/* Master Factory Packaging Telemetry */}
              <div className="bg-slate-50 rounded-xl p-3 sm:p-3.5 border border-slate-200">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-1">
                  <span className="text-[11px] font-bold text-slate-800">
                    Factory Packaging & Dispatch Details
                  </span>
                  <span className="text-[10.5px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                    HSN: {product.hsnCode || '73181500'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Small Box:</span>
                    <strong className="text-slate-900 block truncate">{Math.round(Number(product.pcsPerBox)) || 500} pcs ({product.smallBoxWeightKg || 2.5} kg)</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Master Carton:</span>
                    <strong className="text-slate-900 block truncate">{Math.round(Number(product.pcsPerMasterCtn)) || 4000} pcs ({product.masterCtnWeightKg || 20} kg)</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Min Order (MOQ):</span>
                    <strong className="text-slate-900 block truncate">{product.moq || '25 KGS'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Lead Time:</span>
                    <strong className="text-slate-900 block truncate">{product.leadTimeDays || 10} Days ({product.productionDays || 7}d + {product.packingDays || 3}d)</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================================================================ */}
        {/* SECTION: Tabbed Technical Engineering Specification Desk         */}
        {/* ================================================================ */}
        <div className="pdp-specs-desk mt-6 sm:mt-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          
          {/* Tabs Navigation (Horizontally scrollable for mobile) */}
          <div className="pdp-tabs-nav flex border-b-2 border-slate-200 bg-slate-50 overflow-x-auto scrollbar-none">
            {[
              { id: 'excel_master', label: '1. Master Specifications' },
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
                  padding: '12px 18px',
                  fontFamily: 'var(--font-headline)',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  letterSpacing: '0.3px',
                  border: 'none',
                  borderBottom: activeSpecsTab === tab.id ? '3px solid #0052CC' : '3px solid transparent',
                  background: activeSpecsTab === tab.id ? '#FFFFFF' : 'transparent',
                  color: activeSpecsTab === tab.id ? '#0052CC' : '#64748B',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="pdp-tab-content p-4 sm:p-6">
            
            {/* TAB 1: ALL 30+ EXCEL MASTER SPECIFICATIONS */}
            {activeSpecsTab === 'excel_master' && (
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="specs-table min-w-[480px] sm:min-w-full w-full border-collapse text-xs sm:text-sm">
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ width: '30%', padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Item SKU / Code</th>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0052CC' }}>{product.sku}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Official Item Name</th>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>{toTitleCase(product.name)}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Sub-Group & Category</th>
                      <td style={{ padding: '10px 14px' }}>{toTitleCase(product.subGroup || 'Screw')} • {toTitleCase(product.category)} {product.subCategory ? `(${toTitleCase(product.subCategory)})` : ''}</td>
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
                      <td style={{ padding: '10px 14px' }}>{toTitleCase(product.threadLength || product.threadType || 'Full Thread')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Property Class / Grade</th>
                      <td style={{ padding: '10px 14px', fontWeight: 800 }}>{toTitleCase(product.grade)}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '10px 14px', background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '12px' }}>Surface Finish / Coating</th>
                      <td style={{ padding: '10px 14px' }}>{toTitleCase(product.finish)}</td>
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
                        Small Box: <strong>{Math.round(Number(product.pcsPerBox)) || 500} pcs</strong> ({product.smallBoxWeightKg || 2.5} kg) • Master Carton: <strong>{Math.round(Number(product.pcsPerMasterCtn)) || 4000} pcs</strong> ({product.masterCtnWeightKg || 20} kg)
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
        <div className="mt-6 sm:mt-8 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs">
          <div className="flex justify-between items-center mb-3.5 sm:mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-headline text-base sm:text-lg font-bold text-slate-900 m-0">
                Frequently Procured Assembly Kit (Screw + Nut + Washer)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Engineered matching hardware calibrated for {selectedDiameter} diameter assembly.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex justify-between items-center bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200">
              <div className="min-w-0 flex-1 mr-2">
                <span className="badge badge-din text-[10px] mb-1 inline-block">DIN 934</span>
                <strong className="text-xs sm:text-sm block text-slate-900 truncate">Hexagon Full Nuts Grade 8 ({selectedDiameter})</strong>
                <span className="text-xs text-blue-700 font-bold">₹ 1.84 / Pc</span>
              </div>
              <button
                type="button"
                className="btn-outline shrink-0 py-1.5 px-2.5 text-xs inline-flex items-center gap-1 cursor-pointer"
                onClick={() => handleAddCompanion('Hexagon Nut DIN 934', 'DIN 934', 1.84)}
              >
                <Plus size={12} /> Add
              </button>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200">
              <div className="min-w-0 flex-1 mr-2">
                <span className="badge badge-din text-[10px] mb-1 inline-block">DIN 125A</span>
                <strong className="text-xs sm:text-sm block text-slate-900 truncate">Form A Plain Flat Washers ({selectedDiameter})</strong>
                <span className="text-xs text-blue-700 font-bold">₹ 0.72 / Pc</span>
              </div>
              <button
                type="button"
                className="btn-outline shrink-0 py-1.5 px-2.5 text-xs inline-flex items-center gap-1 cursor-pointer"
                onClick={() => handleAddCompanion('Flat Washer DIN 125A', 'DIN 125A', 0.72)}
              >
                <Plus size={12} /> Add
              </button>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200">
              <div className="min-w-0 flex-1 mr-2">
                <span className="badge badge-din text-[10px] mb-1 inline-block">DIN 127B</span>
                <strong className="text-xs sm:text-sm block text-slate-900 truncate">Split Spring Lock Washers ({selectedDiameter})</strong>
                <span className="text-xs text-blue-700 font-bold">₹ 0.95 / Pc</span>
              </div>
              <button
                type="button"
                className="btn-outline shrink-0 py-1.5 px-2.5 text-xs inline-flex items-center gap-1 cursor-pointer"
                onClick={() => handleAddCompanion('Spring Washer DIN 127B', 'DIN 127B', 0.95)}
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
            prev.map((item) => {
              if (item.id === id) {
                const nextQty = clampQty(qty, item.unit);
                const nextWeight = item.unit === 'PCS' ? nextQty * item.weightPerPcKg : nextQty;
                return {
                  ...item,
                  quantity: nextQty,
                  totalWeightKg: nextWeight,
                  rowTotal: nextQty * item.unitRate,
                };
              }
              return item;
            })
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
            className="modal-window max-w-2xl w-[94%] max-h-[92vh] overflow-y-auto p-4 sm:p-6 text-center rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="text-left min-w-0 flex-1 mr-2">
                <span className="text-xs font-mono text-blue-700 font-bold block">
                  {product.sku}
                </span>
                <h4 className="m-0 text-sm sm:text-base font-bold text-slate-900 truncate">
                  {toTitleCase(product.name)}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 sm:p-5 min-h-[200px] max-h-[50vh] flex items-center justify-center overflow-hidden border border-slate-200">
              <img
                src={product.imageUrl || '/assets/bolt_zinc.jpg'}
                alt={product.name}
                className="max-w-full max-h-[46vh] object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/bolt_zinc.jpg'; }}
              />
            </div>

            <div className="flex justify-between items-center mt-3.5 flex-wrap gap-2">
              <div className="text-xs text-slate-500 font-mono">
                {product.sizeFormatted} • Grade {product.grade} • {toTitleCase(product.finish)}
              </div>
              <div className="flex gap-2">
                {product.gdriveImageUrl && (
                  <a
                    href={product.gdriveImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline text-xs py-1.5 px-3 inline-flex items-center gap-1 no-underline"
                  >
                    <ExternalLink size={12} />
                    <span>View Drive Original</span>
                  </a>
                )}
                <button
                  type="button"
                  className="btn-primary text-xs py-1.5 px-3.5 cursor-pointer"
                  onClick={() => setIsLightboxOpen(false)}
                >
                  Close Zoom
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Commerce Dock */}
      <div className="pdp-mobile-sticky-dock show-mobile-only fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2.5 shadow-lg flex items-center justify-between gap-3 z-50">
        <div className="min-w-0">
          <span className="text-[10px] text-slate-500 block font-semibold leading-tight">
            Unit Rate ({globalUnit}):
          </span>
          <strong className="font-headline text-lg sm:text-xl text-blue-700 leading-tight">
            {formatINR(discountedRate)}
          </strong>
        </div>
        <button
          type="button"
          className="btn-primary py-2.5 px-4 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 shrink-0 shadow-sm"
          onClick={handleAddToCart}
        >
          <ShoppingCart size={15} />
          <span>Add to RFQ ({quantity})</span>
        </button>
      </div>
    </div>
  );
}
