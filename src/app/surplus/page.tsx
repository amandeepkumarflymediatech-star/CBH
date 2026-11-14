'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import MainHeader from '@/components/header/MainHeader';
import CartDrawer from '@/components/cart/CartDrawer';
import CustomProductRequestModal from '@/components/common/CustomProductRequestModal';
import { GlobalUnit, Product, RfqLineItem } from '@/lib/types';
import {
  Flame,
  MapPin,
  Plus,
  ShoppingCart,
  Search,
  Building2,
  RotateCcw,
  X,
  Package,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { formatINR, clampQty } from '@/lib/rfq-calculator';
import { showSuccessAlert } from '@/lib/swal';
import { getStoredCart, setStoredCart } from '@/lib/cart';

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

export default function SurplusPage() {
  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);
  const [isCustomRequestOpen, setIsCustomRequestOpen] = useState(false);
  const [modalContext, setModalContext] = useState<'SURPLUS' | 'SURPLUS_VENDOR'>('SURPLUS');

  // Hydrate cart from storage and sync across tabs/pages
  useEffect(() => {
    setCartItems(getStoredCart());
    const onCartChange = (e: any) => {
      if (e.detail?.items) setCartItems(e.detail.items);
    };
    window.addEventListener('cbh_cart_change', onCartChange);
    return () => window.removeEventListener('cbh_cart_change', onCartChange);
  }, []);

  // Dynamic Data State (100% Live Database Lots)
  const [lots, setLots] = useState<FormattedSurplusLot[]>([]);
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
            if (!dynamicLots.some((d) => d.sku === sl.sku)) {
              let lotCat = sl.category || 'Industrial Fasteners';
              const stdLower = (sl.standard || '').toLowerCase();
              const nameLower = (sl.name || '').toLowerCase();
              if (stdLower.includes('934') || nameLower.includes('nut')) {
                lotCat = 'Hex Nuts';
              } else if (stdLower.includes('933') || nameLower.includes('screw')) {
                lotCat = 'Hex Screws';
              } else if (stdLower.includes('931') || nameLower.includes('bolt')) {
                lotCat = 'Hex Bolts';
              } else if (stdLower.includes('b7') || nameLower.includes('stud') || nameLower.includes('rod')) {
                lotCat = 'Studs & Rods';
              } else if (stdLower.includes('912') || nameLower.includes('socket')) {
                lotCat = 'Socket Caps';
              }

              const totalKg = Number(sl.excessQtyKg) || 1000;
              const totalPcs = Number(sl.excessQtyPcs) || 10000;
              const estWeightPerPc = totalKg / Math.max(1, totalPcs);
              const clRateKg = Number(sl.clearancePriceKg) || 110;
              const clPieceRate = +(clRateKg * estWeightPerPc).toFixed(2);

              dynamicLots.push({
                id: sl.sku || `LOT-${sl.id}`,
                sku: sl.sku || `LOT-${sl.id}`,
                title: sl.name,
                category: lotCat,
                spec: sl.grade ? `${sl.standard} • Grade ${sl.grade}` : sl.standard,
                location: sl.locationHub || 'Central Clearance Yard',
                weight: `${(totalKg / 1000).toFixed(2)} MT (${totalPcs.toLocaleString()} Pcs)`,
                totalWeightKg: totalKg,
                stockPcs: totalPcs,
                marketRate: Number(sl.regularPriceKg) || Math.round(clRateKg * 1.5),
                clearanceRate: clRateKg,
                clearancePieceRate: clPieceRate,
                discount: Number(sl.clearanceDiscountPct) || 35,
                status: sl.isActive ? 'AVAILABLE' : 'ALLOCATED',
                isDynamic: true,
              });
            }
          });
        }

        setLots(dynamicLots);
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

    const rawQty = isPcs ? Math.min(lot.stockPcs || 1000, 1000) : 50;
    const qty = clampQty(rawQty, globalUnit);
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
      let updated: RfqLineItem[];
      const existingIdx = prev.findIndex((item) => item.sku === newItem.sku && item.unit === newItem.unit);
      if (existingIdx > -1) {
        updated = [...prev];
        const nextQty = updated[existingIdx].quantity + qty;
        const nextWeight = isPcs ? nextQty * weightPerPc : nextQty;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: nextQty,
          totalWeightKg: nextWeight,
          rowTotal: nextQty * unitRate,
        };
      } else {
        updated = [newItem, ...prev];
      }
      setStoredCart(updated);
      return updated;
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
      {/* COMPACT CLEAN TOP BAR (Hero & Actions Merged)                  */}
      {/* ============================================================== */}
      <section className="bg-[#0B132B] text-white pt-4 pb-5 px-4 sm:px-6 lg:px-8 border-b-2 border-[#FF6B00]">
        <div className="max-w-7xl mx-auto space-y-3.5">
          {/* Breadcrumb & Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight size={12} className="text-slate-500 shrink-0" />
              <Link href="/products" className="hover:text-white transition-colors">Catalog</Link>
              <ChevronRight size={12} className="text-slate-500 shrink-0" />
              <span className="text-[#FF6B00] font-bold">Surplus Clearance</span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setModalContext('SURPLUS_VENDOR');
                  setIsCustomRequestOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs shadow-xs transition-colors"
              >
                <Building2 size={13} />
                <span>Sell Excess Stock</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setModalContext('SURPLUS');
                  setIsCustomRequestOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors"
              >
                <Plus size={13} />
                <span>Custom Inquiry</span>
              </button>
            </div>
          </div>

          {/* Title & Description */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Surplus Fastener Liquidation
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40 text-[10px] font-bold flex items-center gap-1">
                  <Flame size={11} /> Up to 60% Off
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Factory overruns, dead stock &amp; project clearance lots. Fully certified with Mill Test Certificates.
              </p>
            </div>

            {/* Pricing Unit Switcher */}
            <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/10 self-start md:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setGlobalUnit('PCS')}
                className={`py-1 px-2.5 rounded-md text-xs font-bold transition-all ${
                  globalUnit === 'PCS' ? 'bg-[#FF6B00] text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Pcs
              </button>
              <button
                type="button"
                onClick={() => setGlobalUnit('KGS')}
                className={`py-1 px-2.5 rounded-md text-xs font-bold transition-all ${
                  globalUnit === 'KGS' ? 'bg-[#FF6B00] text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Kg
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full max-w-xl">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by SKU, Standard (DIN 933, B7), size (M12, M24), or depot..."
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-white/95 text-slate-900 text-xs placeholder-slate-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* MAIN CATALOG BODY & LOTS GRID                                  */}
      {/* ============================================================== */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 flex flex-col gap-4">
        {/* Category Pills Strip */}
        <div className="flex items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: `All Lots (${filteredLots.length})` },
              { id: 'nuts', label: 'Hex Nuts' },
              { id: 'screws', label: 'Hex Screws' },
              { id: 'bolts', label: 'Hex Bolts' },
              { id: 'studs', label: 'Stud Rods' },
              { id: 'socket', label: 'Socket Caps' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-[#0052CC] text-white shadow-xs'
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
              className="text-rose-600 font-semibold hover:underline text-xs flex items-center gap-1 shrink-0"
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Lots Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 h-48 animate-pulse" />
            ))}
          </div>
        ) : filteredLots.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-8 text-center space-y-2.5">
            <Package size={32} className="mx-auto text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800">No surplus lots matched your search</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Looking for a custom size or need to liquidate dead stock? We inspect and list lots within 24 hours.
            </p>
            <button
              type="button"
              onClick={() => {
                setModalContext('SURPLUS_VENDOR');
                setIsCustomRequestOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg font-bold text-xs shadow-xs"
            >
              Submit Surplus Request
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
                  className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        className="bg-blue-50 text-[#0052CC] border border-blue-200/80 px-2 py-0.5 rounded font-mono text-[10px] font-bold truncate max-w-[170px]"
                        title={lot.sku || lot.id}
                      >
                        {lot.sku || lot.id}
                      </span>
                      <span className="bg-orange-50 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-0.5 shrink-0">
                        <Flame size={10} /> -{lot.discount}%
                      </span>
                    </div>

                    {/* Lot Title */}
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug" title={lot.title}>
                      {lot.title}
                    </h3>

                    {/* Spec Summary */}
                    <p className="text-[11px] font-mono text-slate-600 truncate">
                      {lot.spec}
                    </p>

                    {/* Depot Location */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      <span className="truncate">{lot.location}</span>
                    </div>

                    {/* Commercials Box */}
                    <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/80 space-y-1 text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="text-slate-500 text-[11px]">Stock:</span>
                        <strong className="text-slate-800 font-mono text-xs">{lot.weight}</strong>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-slate-500 text-[11px]">Standard Tariff:</span>
                        <span className="line-through text-slate-400 font-mono text-[11px]">
                          {formatINR(lot.marketRate)}/Kg
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline pt-1 border-t border-slate-200">
                        <span className="text-[11px] font-semibold text-slate-700">Clearance Rate:</span>
                        <strong className="text-sm font-black text-orange-600 font-mono">
                          {formatINR(displayRate)} <span className="text-[10px] font-normal text-slate-500">/{globalUnit === 'PCS' ? 'pc' : 'kg'}</span>
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions Strip */}
                  <div className="pt-2.5 mt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleClaimLot(lot)}
                      className="w-full bg-[#0052CC] hover:bg-[#0747A6] text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <ShoppingCart size={13} />
                      <span>Claim Lot Allocation</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={(id, qty) => {
          setCartItems((prev) => {
            const updated = prev.map((item) => {
              if (item.id === id) {
                const nextQty = clampQty(qty, item.unit);
                const nextWeight = item.unit === 'PCS' ? nextQty * (item.weightPerPcKg || 0.05) : nextQty;
                return {
                  ...item,
                  quantity: nextQty,
                  totalWeightKg: nextWeight,
                  rowTotal: nextQty * item.unitRate,
                };
              }
              return item;
            });
            setStoredCart(updated);
            return updated;
          });
        }}
        onRemoveItem={(id) => {
          setCartItems((prev) => {
            const updated = prev.filter((item) => item.id !== id);
            setStoredCart(updated);
            return updated;
          });
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
