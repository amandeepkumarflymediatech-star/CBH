'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import MainHeader from '@/components/header/MainHeader';
import CartDrawer from '@/components/cart/CartDrawer';
import { ALL_STATIC_PRODUCTS, findProductByIdOrSku } from '@/lib/catalog-products-all';
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
  ShoppingCart
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id ? String(params.id) : '1';

  // Find product from repository data or default to first
  const [product, setProduct] = useState<Product>(() => {
    return findProductByIdOrSku(productId) || ALL_STATIC_PRODUCTS[0];
  });

  // Configurator Interactive State
  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');
  const [selectedDiameter, setSelectedDiameter] = useState(product.diameter || 'M10');
  const [selectedLength, setSelectedLength] = useState(String(product.lengthMm || 100));
  const [selectedGrade, setSelectedGrade] = useState(product.grade || '5.8 BP');
  const [selectedFinish, setSelectedFinish] = useState(product.finish || 'Black Passivated (BP)');
  const [quantity, setQuantity] = useState(500);

  // Fetch dynamic catalog on mount or when productId changes
  useEffect(() => {
    const staticFound = findProductByIdOrSku(productId);
    if (staticFound) {
      setProduct(staticFound);
      setSelectedDiameter(staticFound.diameter || 'M10');
      setSelectedLength(String(staticFound.lengthMm || 100));
      setSelectedGrade(staticFound.grade || '5.8 BP');
      setSelectedFinish(staticFound.finish || 'Black Passivated (BP)');
    }

    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const apiFound = findProductByIdOrSku(productId, data.data);
          if (apiFound) {
            setProduct(apiFound);
            setSelectedDiameter(apiFound.diameter || 'M10');
            setSelectedLength(String(apiFound.lengthMm || 100));
            setSelectedGrade(apiFound.grade || '5.8 BP');
            setSelectedFinish(apiFound.finish || 'Black Passivated (BP)');
          }
        }
      })
      .catch((err) => console.error('Failed fetching dynamic product detail:', err));
  }, [productId]);
  const [activeMediaTab, setActiveMediaTab] = useState<'photo' | 'cad' | 'cert'>('photo');
  const [activeSpecsTab, setActiveSpecsTab] = useState<'mechanical' | 'chemical' | 'torque' | 'downloads'>('mechanical');
  
  // Cart state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Pincode state
  const [pincode, setPincode] = useState('400001');
  const [pincodeMsg, setPincodeMsg] = useState('Delivery in 24-48 Hours to Mumbai Metropolitan Region');

  // Volume Slab Calculations
  const getVolumeDiscount = (qty: number) => {
    if (qty >= 20000) return { pct: 26, label: 'Master OEM Wholesale (-26%)' };
    if (qty >= 5000) return { pct: 20, label: 'Contractor Volume Tier (-20%)' };
    if (qty >= 1000) return { pct: 10, label: 'Bulk Batch Tier (-10%)' };
    return { pct: 0, label: 'Standard Rate' };
  };

  const currentDiscount = getVolumeDiscount(quantity);
  const basePrice = globalUnit === 'PCS' ? product.pricePerPiece : product.pricePerKg;
  const discountedRate = basePrice * (1 - currentDiscount.pct / 100);
  const grossTotal = quantity * discountedRate;
  const weightTotalKg = quantity * product.weightPerPcKg;

  // Add to Cart
  const handleAddToCart = () => {
    const newItem: RfqLineItem = {
      id: Date.now(),
      productId: product.id,
      sku: `${product.standard}-${selectedDiameter}-${selectedLength}-${selectedGrade}`,
      name: `${product.standard} Hex Fastener ${selectedDiameter}x${selectedLength}mm (${selectedGrade})`,
      standard: product.standard,
      unit: globalUnit,
      unitRate: discountedRate,
      quantity: quantity,
      weightPerPcKg: product.weightPerPcKg,
      totalWeightKg: weightTotalKg,
      rowTotal: grossTotal,
    };

    setCartItems((prev) => [newItem, ...prev]);
    setIsCartOpen(true);
    setToastMsg(`Added ${quantity.toLocaleString()} ${globalUnit} of ${newItem.name} to RFQ Cart!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="pdp-page">
      <MainHeader
        unit={globalUnit}
        onUnitToggle={setGlobalUnit}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Breadcrumb Navigation */}
      <div className="pdp-breadcrumb-bar">
        <div className="container">
          <nav className="pdp-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="separator">/</span>
            <Link href="/#catalog">Catalog</Link>
            <span className="separator">/</span>
            <Link href="/#catalog">{product.category}</Link>
            <span className="separator">/</span>
            <span className="separator">{product.standard}</span>
            <span className="separator">/</span>
            <span className="current">{selectedDiameter} × {selectedLength}mm</span>
          </nav>
        </div>
      </div>

      {/* Main PDP Core Section */}
      <main className="container">
        <div className="pdp-main-grid">
          
          {/* LEFT: Technical Viewport & CAD Drawing Visualizer */}
          <div className="pdp-gallery-card">
            <div className="pdp-badge-strip">
              <span className="badge badge-din">{product.standard} // ISO 4017</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#059669', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                <CheckCircle2 size={13} />
                BIS Certified (IS 1364)
              </span>
            </div>

            {/* Main Visualizer Window */}
            <div className="pdp-main-viewport">
              {activeMediaTab === 'photo' && (
                <Image
                  src={product.imageUrl || '/assets/bolt_zinc.jpg'}
                  alt={product.name}
                  width={380}
                  height={280}
                  style={{ objectFit: 'contain' }}
                  priority
                />
              )}

              {activeMediaTab === 'cad' && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{
                    border: '1px dashed #BDC7D3',
                    padding: '24px',
                    borderRadius: '4px',
                    background: '#FFFFFF',
                    fontFamily: 'var(--font-mono)',
                    color: '#242B35'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '8px' }}>
                      ENGINEERING 2D BLUEPRINT // {product.standard}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '12px', textAlign: 'left', marginTop: '14px' }}>
                      <div><strong>d:</strong> {selectedDiameter}</div>
                      <div><strong>l:</strong> {selectedLength} mm</div>
                      <div><strong>k:</strong> 6.4 mm (Head Ht)</div>
                      <div><strong>s:</strong> 17.0 mm (Hex A/F)</div>
                      <div><strong>e:</strong> 18.9 mm (Min)</div>
                      <div><strong>P:</strong> 1.50 mm (Pitch)</div>
                    </div>
                  </div>
                  <span className="cad-overlay-badge">
                    <Layers size={13} />
                    AutoCAD 2D Blueprint Callouts Active
                  </span>
                </div>
              )}

              {activeMediaTab === 'cert' && (
                <div style={{ textAlign: 'center', padding: '24px', background: '#FFFFFF', borderRadius: '4px', border: '1px solid #D8DFE7' }}>
                  <Award size={48} color="var(--color-primary)" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ fontFamily: 'var(--font-headline)', fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                    NABL 3.1 Mill Test Certificate
                  </h4>
                  <p style={{ fontSize: '12px', color: '#5A6678', maxWidth: '320px', margin: '0 auto 12px' }}>
                    Heat No: <strong>#CBH-2026-HT-9941</strong> • Calibrated chemical and mechanical stress validation.
                  </p>
                  <span className="badge badge-certified">EN 10204 3.1 Compliant</span>
                </div>
              )}

              <div className="cad-overlay-badge">
                <Maximize2 size={13} />
                Click to inspect CAD details
              </div>
            </div>

            {/* Thumbnail Navigation */}
            <div className="pdp-thumbs-row">
              <button
                type="button"
                className={`pdp-thumb-btn ${activeMediaTab === 'photo' ? 'active' : ''}`}
                onClick={() => setActiveMediaTab('photo')}
                title="View High-Res Photo"
              >
                <Image
                  src={product.imageUrl || '/assets/bolt_zinc.jpg'}
                  alt="Thumb"
                  width={60}
                  height={60}
                  style={{ objectFit: 'contain' }}
                />
              </button>

              <button
                type="button"
                className={`pdp-thumb-btn ${activeMediaTab === 'cad' ? 'active' : ''}`}
                onClick={() => setActiveMediaTab('cad')}
                title="View CAD Blueprint"
                style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10px', fontFamily: 'var(--font-mono)' }}
              >
                <Layers size={20} color="var(--color-primary)" />
                <span>CAD 2D</span>
              </button>

              <button
                type="button"
                className={`pdp-thumb-btn ${activeMediaTab === 'cert' ? 'active' : ''}`}
                onClick={() => setActiveMediaTab('cert')}
                title="View Inspection Certificate"
                style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10px', fontFamily: 'var(--font-mono)' }}
              >
                <Award size={20} color="#059669" />
                <span>CERT 3.1</span>
              </button>
            </div>

            {/* Quality Certifications Strip */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-surface-subtle)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-dark-700)' }}>
              <div>
                <strong>ISO 9001:2015</strong>
                <span style={{ display: 'block', color: 'var(--color-text-muted)' }}>Quality Audit</span>
              </div>
              <div>
                <strong>RoHS / REACH</strong>
                <span style={{ display: 'block', color: 'var(--color-text-muted)' }}>Heavy Metal Free</span>
              </div>
              <div>
                <strong>NABL LAB</strong>
                <span style={{ display: 'block', color: 'var(--color-text-muted)' }}>Traceable Mill</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Intelligence, Parametric Selectors, and Pricing */}
          <div className="pdp-info-col">
            <div className="pdp-title-block">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-accent)', fontWeight: 800, textTransform: 'uppercase' }}>
                DIRECT FACTORY OEM FASTENERS • RAW METRIC HARDWARE
              </span>
              <h1>
                {product.standard} Hexagon Head Full Thread Set Screws ({selectedDiameter} × {selectedLength}mm)
              </h1>
              <div className="pdp-sku-meta">
                <span>SKU: <strong>{product.standard}-{selectedDiameter}-{selectedLength}-{selectedGrade.split(' ')[0]}</strong></span>
                <span>•</span>
                <span>Standard: <strong>{product.standard} / ISO 4017</strong></span>
                <span>•</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>48,500 Pcs Ready at Depot</span>
              </div>
            </div>

            {/* Interactive Parametric Dimension Selectors */}
            <div className="pdp-params-box">
              {/* Diameter Selector */}
              <div className="param-group">
                <div className="param-group-label">
                  <span>Thread Diameter (d):</span>
                  <span className="selected-val">{selectedDiameter}</span>
                </div>
                <div className="param-pills">
                  {['M6', 'M8', 'M10', 'M12', 'M16', 'M20', 'M24'].map((dia) => (
                    <button
                      key={dia}
                      type="button"
                      className={`param-pill ${selectedDiameter === dia ? 'active' : ''}`}
                      onClick={() => setSelectedDiameter(dia)}
                    >
                      {dia}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length Selector */}
              <div className="param-group">
                <div className="param-group-label">
                  <span>Nominal Length (l):</span>
                  <span className="selected-val">{selectedLength} mm</span>
                </div>
                <div className="param-pills">
                  {['25', '50', '75', '100', '120', '140', '150', '200'].map((len) => (
                    <button
                      key={len}
                      type="button"
                      className={`param-pill ${selectedLength === len ? 'active' : ''}`}
                      onClick={() => setSelectedLength(len)}
                    >
                      {len} mm
                    </button>
                  ))}
                </div>
              </div>

              {/* Material Grade Selector */}
              <div className="param-group">
                <div className="param-group-label">
                  <span>Property Class / Grade:</span>
                  <span className="selected-val">{selectedGrade}</span>
                </div>
                <div className="param-pills">
                  {[
                    '4.6 Mild Steel',
                    '5.8 BP',
                    '8.8 High Tensile',
                    '10.9 Structural',
                    'A2-70 Stainless',
                    'A4-80 Marine SS'
                  ].map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      className={`param-pill ${selectedGrade === grade ? 'active' : ''}`}
                      onClick={() => setSelectedGrade(grade)}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>

              {/* Finish Selector */}
              <div className="param-group">
                <div className="param-group-label">
                  <span>Surface Finish / Coating:</span>
                  <span className="selected-val">{selectedFinish}</span>
                </div>
                <div className="param-pills">
                  {[
                    'Black Passivated (BP)',
                    'Zinc Plated (Clear Cr3+)',
                    'Hot Dip Galvanized (HDG)',
                    'Zinc Flake Geomet'
                  ].map((fin) => (
                    <button
                      key={fin}
                      type="button"
                      className={`param-pill ${selectedFinish === fin ? 'active' : ''}`}
                      onClick={() => setSelectedFinish(fin)}
                    >
                      {fin}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dual Pricing & Volume Discount Calculation Card */}
            <div className="pdp-price-card">
              <div className="pdp-price-head">
                <div>
                  <div className="pdp-main-price">
                    <span className="price-figure">{formatINR(discountedRate)}</span>
                    <span className="price-unit">/ {globalUnit === 'PCS' ? 'Piece' : 'Kg'}</span>
                    {currentDiscount.pct > 0 && (
                      <span className="strike-price">{formatINR(basePrice)}</span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Excluding 18% GST • Net Weight: ~{(product.weightPerPcKg * 1000).toFixed(1)}g per piece
                  </span>
                </div>

                {/* Local Unit Switcher */}
                <div className="unit-switcher">
                  <button
                    type="button"
                    className={globalUnit === 'PCS' ? 'active' : ''}
                    onClick={() => setGlobalUnit('PCS')}
                  >
                    PCS
                  </button>
                  <button
                    type="button"
                    className={globalUnit === 'KGS' ? 'active' : ''}
                    onClick={() => setGlobalUnit('KGS')}
                  >
                    KGS
                  </button>
                </div>
              </div>

              {/* Wholesale Volume Discount Slabs Table */}
              <table className="volume-slabs-table">
                <thead>
                  <tr>
                    <th>Volume Batch</th>
                    <th>Discount Slab</th>
                    <th>Effective Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={quantity < 1000 ? 'active' : ''}>
                    <td>100 – 999 {globalUnit}</td>
                    <td>Base Rate</td>
                    <td>{formatINR(basePrice)} / {globalUnit === 'PCS' ? 'Pc' : 'Kg'}</td>
                  </tr>
                  <tr className={quantity >= 1000 && quantity < 5000 ? 'active' : ''}>
                    <td>1,000 – 4,999 {globalUnit}</td>
                    <td><strong>10% OFF</strong></td>
                    <td>{formatINR(basePrice * 0.9)} / {globalUnit === 'PCS' ? 'Pc' : 'Kg'}</td>
                  </tr>
                  <tr className={quantity >= 5000 && quantity < 20000 ? 'active' : ''}>
                    <td>5,000 – 19,999 {globalUnit}</td>
                    <td><strong>20% OFF (Contractor)</strong></td>
                    <td>{formatINR(basePrice * 0.8)} / {globalUnit === 'PCS' ? 'Pc' : 'Kg'}</td>
                  </tr>
                  <tr className={quantity >= 20000 ? 'active' : ''}>
                    <td>20,000+ {globalUnit}</td>
                    <td><strong>26% OFF (OEM Master)</strong></td>
                    <td>{formatINR(basePrice * 0.74)} / {globalUnit === 'PCS' ? 'Pc' : 'Kg'}</td>
                  </tr>
                </tbody>
              </table>

              {/* Quantity Controls & Add to Cart */}
              <div className="pdp-action-strip">
                <div className="pdp-qty-stepper">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(100, q - 500))}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(100, parseInt(e.target.value) || 100))}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 500)}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-add-rfq-large"
                  onClick={handleAddToCart}
                >
                  <Zap size={18} />
                  <span>Add to RFQ Cart ({formatINR(grossTotal)})</span>
                </button>
              </div>

              {/* Quick Pack Buttons */}
              <div className="quick-packs">
                <span style={{ color: 'var(--color-text-muted)' }}>Quick Quantities:</span>
                <button type="button" className="quick-pack-btn" onClick={() => setQuantity(500)}>
                  Box (500)
                </button>
                <button type="button" className="quick-pack-btn" onClick={() => setQuantity(2000)}>
                  Carton (2,000)
                </button>
                <button type="button" className="quick-pack-btn" onClick={() => setQuantity(10000)}>
                  Bulk (10,000)
                </button>
                <button type="button" className="quick-pack-btn" onClick={() => setQuantity(25000)}>
                  Pallet (25,000)
                </button>
              </div>

              {/* Secondary Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                <a
                  href={`https://wa.me/919888021000?text=Hello%20CBH%20Fasteners%2C%20inquiring%20about%20${encodeURIComponent(product.name)}%20Qty%3A%20${quantity}%20${globalUnit}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp-rfq"
                  style={{ textDecoration: 'none', fontSize: '13px', padding: '10px' }}
                >
                  <MessageSquare size={16} />
                  <span>WhatsApp Inquire</span>
                </a>

                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => alert(`Downloaded DIN 933 Technical Datasheet & NABL 3.1 Mill Spec for ${selectedDiameter}x${selectedLength}mm`)}
                  style={{ fontSize: '13px', justifyContent: 'center' }}
                >
                  <FileDown size={16} />
                  <span>Technical Datasheet (PDF)</span>
                </button>
              </div>
            </div>

            {/* Warehouse Stock & Pincode Delivery Telemetry */}
            <div className="pdp-telemetry-card">
              <div className="telemetry-row">
                <div className="telemetry-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
                  <Truck size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '13px', color: 'var(--color-dark-900)' }}>
                    Pan-India Heavy Logistics Carrier Dispatch
                  </strong>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 6px' }}>
                    Same-day dispatch for orders confirmed before 3:00 PM IST from Mumbai Central Logistics Hub.
                  </p>
                  
                  {/* Pincode check */}
                  <div className="pincode-checker">
                    <input
                      type="text"
                      className="pincode-input"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Enter 6-digit Pincode"
                    />
                    <button
                      type="button"
                      className="pincode-btn"
                      onClick={() => setPincodeMsg(`Estimated Delivery in 24-48 Hours to PIN: ${pincode} via BlueDart / SafeXpress`)}
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

              <div className="telemetry-row" style={{ paddingTop: '12px', borderTop: '1px solid var(--color-surface-subtle)' }}>
                <div className="telemetry-icon">
                  <ShieldCheck size={18} color="var(--color-primary)" />
                </div>
                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--color-dark-900)' }}>
                    100% Quality & Thread-Gauge Guarantee
                  </strong>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                    Every lot is physically calibrated with calibrated go/no-go ring gauges before packing. Free 30-day return on metallurgical variance.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION: Tabbed Technical Engineering Specification Desk */}
        <div className="pdp-specs-desk">
          <div className="pdp-tabs-nav">
            <button
              type="button"
              className={`pdp-tab-trigger ${activeSpecsTab === 'mechanical' ? 'active' : ''}`}
              onClick={() => setActiveSpecsTab('mechanical')}
            >
              Mechanical & Dimensions
            </button>
            <button
              type="button"
              className={`pdp-tab-trigger ${activeSpecsTab === 'chemical' ? 'active' : ''}`}
              onClick={() => setActiveSpecsTab('chemical')}
            >
              Chemical & Metallurgy
            </button>
            <button
              type="button"
              className={`pdp-tab-trigger ${activeSpecsTab === 'torque' ? 'active' : ''}`}
              onClick={() => setActiveSpecsTab('torque')}
            >
              Torque & Fastening
            </button>
            <button
              type="button"
              className={`pdp-tab-trigger ${activeSpecsTab === 'downloads' ? 'active' : ''}`}
              onClick={() => setActiveSpecsTab('downloads')}
            >
              CAD 3D & Cert Downloads
            </button>
          </div>

          <div className="pdp-tab-content">
            {activeSpecsTab === 'mechanical' && (
              <table className="specs-table">
                <tbody>
                  <tr>
                    <th>Manufacturing Standard</th>
                    <td>DIN 933 / ISO 4017 / IS 1364 (Part 2)</td>
                  </tr>
                  <tr>
                    <th>Thread Pitch (P)</th>
                    <td>1.50 mm (Metric Coarse Standard ISO 965-2)</td>
                  </tr>
                  <tr>
                    <th>Head Height (k)</th>
                    <td>6.40 mm (Tolerance js14)</td>
                  </tr>
                  <tr>
                    <th>Width Across Flats (s)</th>
                    <td>17.00 mm (Standard Hex Socket Wrench Size)</td>
                  </tr>
                  <tr>
                    <th>Width Across Corners (e)</th>
                    <td>18.90 mm minimum</td>
                  </tr>
                  <tr>
                    <th>Tensile Strength (Rm)</th>
                    <td>500 N/mm² minimum (Class 5.8) / 800 N/mm² (Class 8.8)</td>
                  </tr>
                  <tr>
                    <th>Proof Stress (Sp)</th>
                    <td>400 N/mm² (Yield Ratio 80%)</td>
                  </tr>
                  <tr>
                    <th>Elongation at Break (A5)</th>
                    <td>12% minimum</td>
                  </tr>
                </tbody>
              </table>
            )}

            {activeSpecsTab === 'chemical' && (
              <table className="specs-table">
                <tbody>
                  <tr>
                    <th>Base Raw Material</th>
                    <td>Low to Medium Carbon Steel (SAE 1018 / 10B21 Boron Steel)</td>
                  </tr>
                  <tr>
                    <th>Carbon Content (C)</th>
                    <td>0.15% - 0.40% (Guaranteed Grain Structure)</td>
                  </tr>
                  <tr>
                    <th>Manganese (Mn)</th>
                    <td>0.60% - 0.90%</td>
                  </tr>
                  <tr>
                    <th>Phosphorus (P) max</th>
                    <td>0.035% maximum (Low impurity melt)</td>
                  </tr>
                  <tr>
                    <th>Sulfur (S) max</th>
                    <td>0.035% maximum</td>
                  </tr>
                  <tr>
                    <th>Mill Test Traceability</th>
                    <td>EN 10204 Type 3.1 Factory Inspection Certificate with Melt Heat Number</td>
                  </tr>
                </tbody>
              </table>
            )}

            {activeSpecsTab === 'torque' && (
              <table className="specs-table">
                <tbody>
                  <tr>
                    <th>Recommended Tightening Torque</th>
                    <td>32.0 Nm (Dry) / 28.5 Nm (Lubricated / Light Oil)</td>
                  </tr>
                  <tr>
                    <th>Maximum Proof Load</th>
                    <td>33.7 kN (Yielding threshold)</td>
                  </tr>
                  <tr>
                    <th>Recommended Wrench Size</th>
                    <td>17 mm Combination / Hex Socket Wrench</td>
                  </tr>
                  <tr>
                    <th>Shear Strength</th>
                    <td>Approx 310 N/mm²</td>
                  </tr>
                  <tr>
                    <th>Operating Temperature Range</th>
                    <td>-40°C to +200°C</td>
                  </tr>
                </tbody>
              </table>
            )}

            {activeSpecsTab === 'downloads' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div style={{ border: '1px solid var(--color-surface-border)', padding: '16px', borderRadius: '4px', background: 'var(--color-surface-bg)' }}>
                  <FileText size={24} color="var(--color-primary)" style={{ marginBottom: '8px' }} />
                  <strong style={{ display: 'block', fontSize: '13px' }}>DIN 933 Technical Datasheet</strong>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', margin: '4px 0 10px' }}>
                    PDF • 1.4 MB • Complete dimensional table
                  </span>
                  <button type="button" className="btn-outline" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={() => alert('Downloading PDF...')}>
                    Download PDF
                  </button>
                </div>

                <div style={{ border: '1px solid var(--color-surface-border)', padding: '16px', borderRadius: '4px', background: 'var(--color-surface-bg)' }}>
                  <Layers size={24} color="var(--color-primary)" style={{ marginBottom: '8px' }} />
                  <strong style={{ display: 'block', fontSize: '13px' }}>3D CAD Model (STEP / IGES)</strong>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', margin: '4px 0 10px' }}>
                    STEP • 3.2 MB • SolidWorks & AutoCAD ready
                  </span>
                  <button type="button" className="btn-outline" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={() => alert('Downloading CAD Model...')}>
                    Download 3D CAD
                  </button>
                </div>

                <div style={{ border: '1px solid var(--color-surface-border)', padding: '16px', borderRadius: '4px', background: 'var(--color-surface-bg)' }}>
                  <Award size={24} color="#059669" style={{ marginBottom: '8px' }} />
                  <strong style={{ display: 'block', fontSize: '13px' }}>NABL 3.1 Mill Certificate Sample</strong>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', margin: '4px 0 10px' }}>
                    PDF • 850 KB • Authentic lab test copy
                  </span>
                  <button type="button" className="btn-outline" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={() => alert('Downloading Certificate...')}>
                    Download Cert
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION: Matching Companion Hardware (Frequently Bought Together) */}
        <div style={{ marginTop: '40px', background: '#FFFFFF', border: '1px solid var(--color-surface-border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '16px', color: 'var(--color-dark-900)' }}>
            Frequently Procured Assembly Kit (Screw + Nut + Washer)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--color-surface-bg)', padding: '12px', borderRadius: '4px' }}>
              <span className="badge badge-din">DIN 934</span>
              <div>
                <strong style={{ fontSize: '13px', display: 'block' }}>Hexagon Full Nuts Grade 8 (M10)</strong>
                <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 700 }}>₹ 1.84 / Pc</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--color-surface-bg)', padding: '12px', borderRadius: '4px' }}>
              <span className="badge badge-din">DIN 125A</span>
              <div>
                <strong style={{ fontSize: '13px', display: 'block' }}>Form A Flat Plain Washers (M10)</strong>
                <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 700 }}>₹ 0.72 / Pc</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--color-surface-bg)', padding: '12px', borderRadius: '4px' }}>
              <span className="badge badge-din">DIN 127B</span>
              <div>
                <strong style={{ fontSize: '13px', display: 'block' }}>Split Spring Lock Washers (M10)</strong>
                <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 700 }}>₹ 0.95 / Pc</span>
              </div>
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

      {/* Toast Notification */}
      {toastMsg && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle2 size={18} color="#22C55E" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Commerce Dock */}
      <div className="pdp-mobile-sticky-dock show-mobile-only">
        <div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>
            Unit Rate ({globalUnit}):
          </span>
          <strong style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', color: 'var(--color-primary)' }}>
            {formatINR(discountedRate)}
          </strong>
        </div>
        <button
          type="button"
          className="btn-primary"
          style={{ padding: '10px 18px', fontSize: '13px' }}
          onClick={handleAddToCart}
        >
          <ShoppingCart size={15} />
          <span>Add to RFQ ({quantity})</span>
        </button>
      </div>
    </div>
  );
}
