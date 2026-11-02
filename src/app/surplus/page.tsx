'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import MainHeader from '@/components/header/MainHeader';
import SurplusSection from '@/components/home/SurplusSection';
import CartDrawer from '@/components/cart/CartDrawer';
import CustomProductRequestModal from '@/components/common/CustomProductRequestModal';
import { GlobalUnit, Product, RfqLineItem } from '@/lib/types';
import {
  Flame,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Sparkles,
  Plus,
  ArrowRight,
  ShoppingCart,
  Search,
  Filter,
  Building2,
  Truck,
  RotateCcw,
  X,
  Package,
  Layers,
  ChevronRight
} from 'lucide-react';
import { formatINR } from '@/lib/rfq-calculator';
import { showConfirmDialog, showSuccessAlert } from '@/lib/swal';

interface FormattedSurplusLot {
  id: string;
  productId?: number;
  sku: string;
  title: string;
  category: string;
  spec: string;
  location: string;
  weight: string;
  totalWeightKg: number;
  stockPcs: number;
  marketRate: number;
  clearanceRate: number;
  clearancePieceRate?: number;
  discount: number;
  status: string;
  isDynamic?: boolean;
  product?: Product;
}

const DEFAULT_VERIFIED_LOTS: FormattedSurplusLot[] = [
  {
    id: 'LOT-889',
    sku: 'SUR-STUD-B7-M24-HDG',
    title: 'ASTM A193 B7 Continuous Stud Rods + 2H Nuts',
    category: 'Studs & Rods',
    spec: 'M24 x 3000mm • Hot Dip Galvanized • Class 2A/2B',
    location: 'Hazira Logistics Depot, Gujarat',
    weight: '18.4 Metric Tonnes (4,200 Sets)',
    totalWeightKg: 18400,
    stockPcs: 4200,
    marketRate: 182,
    clearanceRate: 114,
    clearancePieceRate: 498.0,
    discount: 37,
    status: 'AVAILABLE',
  },
  {
    id: 'LOT-904',
    sku: 'SUR-HEX-DIN933-M16-BP',
    title: 'DIN 933 Grade 10.9 Structural Hex Screws BP',
    category: 'Hex Screws',
    spec: 'M16 x 2.0 x 120mm • Black Passivated • 10.9 HT',
    location: 'Peenya Industrial Yard, Bengaluru',
    weight: '9.2 Metric Tonnes (42,500 Pcs)',
    totalWeightKg: 9200,
    stockPcs: 42500,
    marketRate: 195,
    clearanceRate: 122,
    clearancePieceRate: 26.4,
    discount: 37,
    status: 'AVAILABLE',
  },
  {
    id: 'LOT-912',
    sku: 'SUR-SOC-DIN912-M12-SS316',
    title: 'Stainless Steel SS-316 Socket Cap Screws DIN 912',
    category: 'Socket Caps',
    spec: 'M12 x 1.75 x 80mm • Pickled & Passivated • Marine A4',
    location: 'Manesar Central Warehouse, NCR',
    weight: '4.8 Metric Tonnes (56,000 Pcs)',
    totalWeightKg: 4800,
    stockPcs: 56000,
    marketRate: 460,
    clearanceRate: 285,
    clearancePieceRate: 24.5,
    discount: 38,
    status: 'AVAILABLE',
  },
];

export default function SurplusPage() {
  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);
  const [isCustomRequestOpen, setIsCustomRequestOpen] = useState(false);
  const [modalContext, setModalContext] = useState<'SURPLUS' | 'SURPLUS_VENDOR'>('SURPLUS');

  // Dynamic Data State
  const [lots, setLots] = useState<FormattedSurplusLot[]>(DEFAULT_VERIFIED_LOTS);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch Live Dynamic Surplus Products & Lots
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/products?surplus=true').then((res) => res.json()).catch(() => ({ data: [] })),
      fetch('/api/surplus').then((res) => res.json()).catch(() => ({ data: [] }))
    ])
      .then(([prodRes, surplusRes]) => {
        const dynamicLots: FormattedSurplusLot[] = [];

        // 1. Process Live Dynamic Products marked with isSurplus = 1
        if (prodRes && prodRes.success && Array.isArray(prodRes.data)) {
          prodRes.data.forEach((p: Product) => {
            const weightKg = p.stockKg || (p.stockPcs * (p.weightPerPcKg || 0.05));
            const marketKg = p.originalPricePerKg && p.originalPricePerKg > p.pricePerKg
              ? p.originalPricePerKg
              : Math.round(p.pricePerKg * 1.55);

            dynamicLots.push({
              id: `LOT-${p.sku}`,
              productId: p.id,
              sku: p.sku,
              title: p.name,
              category: p.category || 'Surplus Fasteners',
              spec: `${p.sizeFormatted || `${p.diameter}x${p.lengthMm}mm`} • ${p.finish} • Grade ${p.grade}`,
              location: p.brand === 'Vendor' ? 'Vendor Consignment Depot' : 'Hazira Regional Hub, Gujarat',
              weight: `${(weightKg / 1000).toFixed(2)} MT (${(p.stockPcs || 1000).toLocaleString()} Pcs)`,
              totalWeightKg: weightKg,
              stockPcs: p.stockPcs || 1000,
              marketRate: marketKg,
              clearanceRate: p.pricePerKg,
              clearancePieceRate: p.pricePerPiece,
              discount: p.surplusDiscountPct || 40,
              status: p.stockPcs > 0 ? 'AVAILABLE' : 'ALLOCATED',
              isDynamic: true,
              product: p,
            });
          });
        }

        // 2. Process Dedicated Surplus Lots Table
        if (surplusRes && surplusRes.success && Array.isArray(surplusRes.data)) {
          surplusRes.data.forEach((sl: any) => {
            // Avoid duplicate SKUs if already added from products
            if (!dynamicLots.some((d) => d.sku === sl.sku)) {
              dynamicLots.push({
                id: sl.sku || `LOT-${sl.id}`,
                sku: sl.sku || `LOT-${sl.id}`,
                title: sl.name,
                category: sl.category || 'Industrial Fasteners',
                spec: `${sl.standard} • Grade ${sl.grade}`,
                location: sl.locationHub || 'Central Clearance Yard',
                weight: `${((sl.excessQtyKg || 5000) / 1000).toFixed(2)} MT (${(sl.excessQtyPcs || 10000).toLocaleString()} Pcs)`,
                totalWeightKg: sl.excessQtyKg || 5000,
                stockPcs: sl.excessQtyPcs || 10000,
                marketRate: sl.regularPriceKg || 180,
                clearanceRate: sl.clearancePriceKg || 110,
                clearancePieceRate: +(sl.clearancePriceKg * 0.05).toFixed(2),
                discount: sl.clearanceDiscountPct || 35,
                status: sl.isActive ? 'AVAILABLE' : 'ALLOCATED',
                isDynamic: true,
              });
            }
          });
        }

        // Merge: Dynamic Live Lots first, then Verified Platform Lots
        const merged = [...dynamicLots, ...DEFAULT_VERIFIED_LOTS];
        setLots(merged);
      })
      .catch((err) => {
        console.error('Failed to load dynamic surplus lots:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Filtered Lots
  const filteredLots = useMemo(() => {
    return lots.filter((lot) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          lot.id.toLowerCase().includes(q) ||
          lot.sku.toLowerCase().includes(q) ||
          lot.title.toLowerCase().includes(q) ||
          lot.spec.toLowerCase().includes(q) ||
          lot.location.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Category Filter
      if (selectedCategory !== 'all') {
        const cat = selectedCategory.toLowerCase();
        const titleAndSpec = `${lot.title} ${lot.spec} ${lot.category}`.toLowerCase();
        if (cat === 'nuts') {
          return titleAndSpec.includes('nut') || titleAndSpec.includes('din 934');
        } else if (cat === 'screws') {
          return titleAndSpec.includes('screw') || titleAndSpec.includes('din 933');
        } else if (cat === 'bolts') {
          return titleAndSpec.includes('bolt') || titleAndSpec.includes('din 931');
        } else if (cat === 'studs') {
          return titleAndSpec.includes('stud') || titleAndSpec.includes('rod') || titleAndSpec.includes('b7');
        } else if (cat === 'socket') {
          return titleAndSpec.includes('socket') || titleAndSpec.includes('din 912');
        }
      }

      return true;
    });
  }, [lots, searchQuery, selectedCategory]);

  // Claim Lot Allocation & Add Directly to RFQ Cart Drawer
  const handleClaimLot = async (lot: FormattedSurplusLot) => {
    const isPcs = globalUnit === 'PCS';
    const unitRate = isPcs
      ? (lot.clearancePieceRate || +(lot.clearanceRate * 0.05).toFixed(2))
      : lot.clearanceRate;

    const qty = isPcs ? Math.min(lot.stockPcs || 1000, 1000) : 50;
    const weightPerPc = lot.product?.weightPerPcKg || (lot.totalWeightKg / Math.max(1, lot.stockPcs)) || 0.05;
    const totalWeight = isPcs ? qty * weightPerPc : qty;

    const newItem: RfqLineItem = {
      id: Date.now(),
      productId: lot.productId || Date.now(),
      sku: lot.sku || lot.id,
      name: `${lot.title} [SURPLUS LOT -${lot.discount}%]`,
      standard: lot.spec,
      unit: globalUnit,
      unitRate: unitRate,
      quantity: qty,
      weightPerPcKg: weightPerPc,
      totalWeightKg: totalWeight,
      rowTotal: qty * unitRate,
    };

    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.sku === newItem.sku && item.unit === newItem.unit);
      if (existingIdx > -1) {
        const updated = [...prev];
        const nextQty = updated[existingIdx].quantity + qty;
        const nextWeight = isPcs ? nextQty * weightPerPc : nextQty;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: nextQty,
          totalWeightKg: nextWeight,
          rowTotal: nextQty * unitRate,
        };
        return updated;
      }
      return [newItem, ...prev];
    });

    setIsCartOpen(true);
    showSuccessAlert(
      'Surplus Lot Added to Quote!',
      `${lot.title} allocated at factory clearance tariff (${formatINR(unitRate)} / ${globalUnit}). Proforma quote ready in cart.`,
      2500
    );
  };

  return (
    <main className="bg-slate-50 min-h-screen flex flex-col antialiased">
      <MainHeader
        unit={globalUnit}
        onUnitToggle={(u) => setGlobalUnit(u)}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* ============================================================== */}
      {/* HERO BANNER: CERTIFIED SURPLUS CLEARANCE DEPOT                 */}
      {/* ============================================================== */}
      <section className="bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#0A192F] text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-b-2 border-[#FF6B00]">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-300 mb-3 sm:mb-4 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={13} className="text-slate-400 shrink-0" />
            <Link href="/products" className="hover:text-white transition-colors">Catalog</Link>
            <ChevronRight size={13} className="text-slate-400 shrink-0" />
            <span className="text-[#FF6B00] font-bold">Surplus Depot</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-[#FF6B00]/20 border border-[#FF6B00]/40 px-3 py-1 rounded-full text-[11px] font-bold text-[#FF6B00] mb-3 tracking-wide">
                <Flame size={14} />
                <span>CERTIFIED FACTORY CLEARANCE &amp; DEAD-STOCK LIQUIDATION DEPOT</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Verified Industrial Fastener Surplus Batches
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Direct access to authentic factory over-runs, project surplus inventory, and EPC clearances at up to <strong>60% below standard tariffs</strong>. 100% verified with authentic EN 10204 3.1 Mill Test Certificates.
              </p>
            </div>

            {/* Header Two-Way Action Hub */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
              {/* Option A: Vendor Sell Surplus Button */}
              <button
                type="button"
                onClick={() => {
                  setModalContext('SURPLUS_VENDOR');
                  setIsCustomRequestOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs shadow-md transition-all active:scale-[0.98]"
                title="Have 1,000 nuts or excess project inventory? List and sell on CBH Surplus Depot."
              >
                <Building2 size={16} />
                <span>Sell Your Surplus Stock (Vendor Inward)</span>
              </button>

              {/* Option B: Buyer Custom Inquiry Button */}
              <button
                type="button"
                onClick={() => {
                  setModalContext('SURPLUS');
                  setIsCustomRequestOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all backdrop-blur-sm"
              >
                <Plus size={16} />
                <span>Request Specific Clearance Lot</span>
              </button>
            </div>
          </div>

          {/* Search & Pricing Unit Strip */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search surplus lots by SKU (LOT-889), Standard (DIN 934, B7), Diameter (M12, M24), or Hub location..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/95 text-slate-900 text-xs placeholder-slate-400 border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Pricing Switcher */}
            <div className="flex bg-black/40 p-1 rounded-xl shrink-0 w-full sm:w-auto border border-white/10">
              <button
                type="button"
                onClick={() => setGlobalUnit('PCS')}
                className={`flex-1 sm:flex-initial py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  globalUnit === 'PCS' ? 'bg-[#FF6B00] text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Pieces (Pcs)
              </button>
              <button
                type="button"
                onClick={() => setGlobalUnit('KGS')}
                className={`flex-1 sm:flex-initial py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  globalUnit === 'KGS' ? 'bg-[#FF6B00] text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Kilograms (Kg)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* VENDOR CLEARANCE CALLOUT (FLYMEDIA SCENARIO)                    */}
      {/* ============================================================== */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-4 z-10">
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] rounded-2xl p-4 sm:p-5 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 bg-black/20 rounded-xl shrink-0 mt-0.5 sm:mt-0">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                Have Excess Project Inventory or Dead Fastener Stock? (e.g. 1,000 Nuts or Leftover Bolts)
              </h2>
              <p className="text-xs text-orange-100 leading-relaxed mt-0.5">
                Companies like <strong>Flymedia</strong> can list excess fasteners on the CBH Clearinghouse. We inspect, certify, and match your dead stock with 5,000+ infrastructure contractors across India.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setModalContext('SURPLUS_VENDOR');
              setIsCustomRequestOpen(true);
            }}
            className="self-start md:self-center shrink-0 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus size={14} />
            <span>List Your Surplus Stock (Vendor Inward)</span>
          </button>
        </div>
      </section>

      {/* ============================================================== */}
      {/* MAIN CATALOG BODY & LOTS GRID                                  */}
      {/* ============================================================== */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col gap-6">
        
        {/* Category Pills & Count Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap py-0.5">
            {[
              { id: 'all', label: `All Clearance Lots (${filteredLots.length})` },
              { id: 'nuts', label: 'Hex Nuts (DIN 934)' },
              { id: 'screws', label: 'Hex Screws (DIN 933)' },
              { id: 'bolts', label: 'Hex Bolts (DIN 931)' },
              { id: 'studs', label: 'Stud Rods (B7/2H)' },
              { id: 'socket', label: 'Socket Caps (DIN 912)' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-red-600 font-semibold hover:underline text-xs flex items-center gap-1"
            >
              <RotateCcw size={12} />
              <span>Reset filter</span>
            </button>
          )}
        </div>

        {/* Lots Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 h-64 animate-pulse" />
            ))}
          </div>
        ) : filteredLots.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center space-y-3">
            <Package size={40} className="mx-auto text-slate-400" />
            <h3 className="text-base font-extrabold text-slate-900">No surplus lots matched your search</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Looking for a custom size or need to liquidate a dead-stock lot? Our engineering desk will verify and onboard your lot in under 24 hours.
            </p>
            <button
              type="button"
              onClick={() => {
                setModalContext('SURPLUS_VENDOR');
                setIsCustomRequestOpen(true);
              }}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-xs"
            >
              Submit Surplus Inquiry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLots.map((lot) => {
              const isPcs = globalUnit === 'PCS';
              const displayRate = isPcs
                ? (lot.clearancePieceRate || +(lot.clearanceRate * 0.05).toFixed(2))
                : lot.clearanceRate;

              const altRate = isPcs
                ? lot.clearanceRate
                : (lot.clearancePieceRate || +(lot.clearanceRate * 0.05).toFixed(2));

              return (
                <div
                  key={lot.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between border-t-4 border-t-blue-700 relative"
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="bg-slate-900 text-white px-2.5 py-0.5 rounded font-mono text-[11px] font-extrabold tracking-wider">
                        {lot.id}
                      </span>
                      <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded font-bold text-[11px]">
                        -{lot.discount}% SURPLUS OFF
                      </span>
                    </div>

                    {/* Lot Title */}
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 mb-1.5">
                      {lot.title}
                    </h3>

                    {/* Spec Summary */}
                    <p className="text-xs font-bold text-blue-700 font-mono mb-2.5 leading-relaxed">
                      {lot.spec}
                    </p>

                    {/* Depot Location */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{lot.location}</span>
                    </div>

                    {/* Commercials Matrix */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1.5 font-mono text-xs mb-4">
                      <div className="flex justify-between text-slate-600">
                        <span>Available Volume:</span>
                        <strong className="text-slate-900">{lot.weight}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Regular Market Tariff:</span>
                        <span className="line-through text-slate-400">
                          {formatINR(lot.marketRate)} / Kg
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-200">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                          Clearance Rate ({globalUnit}):
                        </span>
                        <strong className="text-base font-black text-[#FF6B00]">
                          {formatINR(displayRate)} / {globalUnit === 'PCS' ? 'Pc' : 'Kg'}
                        </strong>
                      </div>
                      <div className="text-[10px] text-slate-500 text-right">
                        Alt Rate: {formatINR(altRate)} / {globalUnit === 'PCS' ? 'Kg' : 'Pc'}
                      </div>
                    </div>
                  </div>

                  {/* Actions Strip */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleClaimLot(lot)}
                      className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
                    >
                      <ShoppingCart size={14} />
                      <span>Claim Lot Allocation</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Existing High-Impact Surplus Section Graphic Component */}
        <SurplusSection />
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={(id, qty) => {
          setCartItems((prev) =>
            prev.map((item) => {
              if (item.id === id) {
                const nextQty = Math.max(1, qty);
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

      {/* Custom & Surplus Request Modal */}
      <CustomProductRequestModal
        isOpen={isCustomRequestOpen}
        onClose={() => setIsCustomRequestOpen(false)}
        sourceContext={modalContext}
        initialCategory={modalContext === 'SURPLUS_VENDOR' ? 'HEX NUTS' : 'Hex Screws'}
        initialStandard={modalContext === 'SURPLUS_VENDOR' ? 'DIN 934' : 'DIN 933'}
        initialDiameter={modalContext === 'SURPLUS_VENDOR' ? 'M12' : undefined}
      />
    </main>
  );
}
