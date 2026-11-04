'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, CheckCircle2, PackageCheck, ArrowRight, Sparkles, Zap, Layers } from 'lucide-react';
import { Product, GlobalUnit } from '@/lib/types';
import { formatINR, clampQty, formatQtyDisplay, MIN_QTY_PCS, MIN_QTY_KGS, toTitleCase } from '@/lib/rfq-calculator';

interface CatalogMatrixProps {
  products: Product[];
  onAddToCart: (product: Product, qty: number, unit: GlobalUnit) => void;
}

interface CategoryTab {
  id: string;
  label: string;
  isSurplus?: boolean;
}

const CATEGORY_TABS: CategoryTab[] = [
  { id: 'all', label: 'All Fasteners' },
  { id: 'din933', label: 'Hex Screws (DIN 933 / ASME)' },
  { id: 'din931', label: 'Hex Bolts (DIN 931)' },
  { id: 'din6921', label: 'Flange Bolts (DIN 6921)' },
  { id: 'din912', label: 'Socket Caps (DIN 912)' },
  { id: 'nuts', label: 'Hex Nuts (DIN 934 / ASME)' },
  { id: 'washers', label: 'Washers (DIN / ASME)' },
  { id: 'anchors', label: 'Anchors & Fixings' },
  { id: 'rods', label: 'Threaded Rods / Studs' },
  { id: 'surplus', label: 'Surplus Lots', isSurplus: true },
];

function formatCardTitle(rawName?: string | null): string {
  if (!rawName) return '';
  const spaced = rawName
    .replace(/-(?=[A-Za-z(])/g, ' ')
    .replace(/\s*-\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return toTitleCase(spaced);
}

const matchesTab = (p: Product, tabId: string): boolean => {
  if (tabId === 'all') return true;
  if (tabId === 'surplus') return Boolean(p.isSurplus);

  const name = (p.name || '').toLowerCase();
  const std = (p.standard || '').toUpperCase();
  const cat = (p.category || '').toLowerCase();
  const isAssemblyOrBolt =
    std.includes('6921') ||
    cat.includes('bolt') ||
    name.startsWith('hex flange bolt') ||
    name.startsWith('hex bolt') ||
    name.startsWith('hex screw');

  switch (tabId) {
    case 'din933':
      return (
        std.includes('933') ||
        std.includes('B18.2.1') ||
        std.includes('4017') ||
        (cat.includes('screw') && !std.includes('912') && !std.includes('6921')) ||
        (name.includes('screw') && !name.includes('socket'))
      );
    case 'din931':
      return (
        std.includes('931') ||
        std.includes('4014') ||
        (cat.includes('bolt') && !std.includes('6921') && !std.includes('933') && !name.includes('flange'))
      );
    case 'din6921':
      return std.includes('6921') || std.includes('6922') || cat.includes('flange') || name.includes('flange bolt');
    case 'din912':
      return std.includes('912') || std.includes('4762') || cat.includes('socket') || name.includes('socket') || name.includes('allen');
    case 'nuts':
      return (
        !isAssemblyOrBolt &&
        (std.includes('934') ||
          std.includes('B18.2.2') ||
          std.includes('4032') ||
          cat.includes('nut') ||
          name.includes('hex nut'))
      );
    case 'washers':
      return (
        !isAssemblyOrBolt &&
        (std.includes('125') ||
          std.includes('127') ||
          std.includes('B18.21') ||
          std.includes('7089') ||
          cat.includes('washer') ||
          name.includes('washer'))
      );
    case 'anchors':
      return cat.includes('anchor') || std.includes('ETA') || name.includes('anchor') || name.includes('fixing');
    case 'rods':
      return cat.includes('rod') || std.includes('A193') || std.includes('975') || std.includes('976') || name.includes('rod') || name.includes('stud');
    default:
      return true;
  }
};

export default function CatalogMatrix({ products, onAddToCart }: CatalogMatrixProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [cardUnits, setCardUnits] = useState<{ [id: number]: GlobalUnit }>({});
  const [cardQtys, setCardQtys] = useState<{ [id: number]: number }>({});

  // Dynamic count calculation per tab
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORY_TABS.forEach((tab) => {
      counts[tab.id] = products.filter((p) => matchesTab(p, tab.id)).length;
    });
    return counts;
  }, [products]);

  // Only display tabs that have inventory or are essential
  const availableTabs = useMemo(() => {
    return CATEGORY_TABS.filter((tab) => {
      if (tab.id === 'all' || tab.id === 'surplus') return true;
      return (tabCounts[tab.id] || 0) > 0;
    });
  }, [tabCounts]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => matchesTab(p, activeTab));
  }, [products, activeTab]);

  // Limit to exactly 8 cards on homepage
  const visibleProducts = filteredProducts.slice(0, 8);

  const getUnit = (id: number): GlobalUnit => cardUnits[id] || 'PCS';
  const getQty = (id: number): number => {
    const unit = getUnit(id);
    if (cardQtys[id] !== undefined) return cardQtys[id];
    return unit === 'PCS' ? MIN_QTY_PCS : MIN_QTY_KGS;
  };

  const toggleUnit = (id: number, unit: GlobalUnit) => {
    if (getUnit(id) === unit) return;
    setCardUnits((prev) => ({ ...prev, [id]: unit }));
    setCardQtys((prev) => ({
      ...prev,
      [id]: unit === 'PCS' ? MIN_QTY_PCS : MIN_QTY_KGS,
    }));
  };

  const adjustQty = (id: number, delta: number) => {
    const current = getQty(id);
    const unit = getUnit(id);
    if (unit === 'KGS') {
      if (delta < 0) {
        if (current <= MIN_QTY_KGS) return;
        const step = current <= 1 ? 0.25 : 0.5;
        const nextVal = Math.max(MIN_QTY_KGS, Math.round((current - step) * 100) / 100);
        setCardQtys((prev) => ({ ...prev, [id]: nextVal }));
      } else {
        const step = current < 1 ? 0.25 : 0.5;
        const nextVal = Math.round((current + step) * 100) / 100;
        setCardQtys((prev) => ({ ...prev, [id]: nextVal }));
      }
    } else {
      if (delta < 0) {
        if (current <= MIN_QTY_PCS) return;
        const step = current > 1000 ? 500 : 100;
        const nextVal = Math.max(MIN_QTY_PCS, current - step);
        setCardQtys((prev) => ({ ...prev, [id]: nextVal }));
      } else {
        const step = current >= 1000 ? 500 : 100;
        setCardQtys((prev) => ({ ...prev, [id]: current + step }));
      }
    }
  };

  return (
    <section className="py-8 sm:py-12 bg-[#F8FAFC]" id="catalog">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Categories Filter Section */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-500 font-medium tracking-wide">
                <span className="text-blue-700 font-extrabold">READY STOCK INVENTORY</span>
                <span>•</span>
                <span>DISPATCH IN 24-48 HRS</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  Pan-India Express
                </span>
              </div>
              <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Popular Fasteners In Stock <span className="text-blue-700 text-lg sm:text-xl font-bold">(फैक्टरी में तैयार सामान)</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Direct mill pricing with certified proof load test certs, DIN/ISO standards, and instant dispatch.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all border border-blue-200 no-underline shadow-2xs hover:shadow-xs"
              >
                <Layers size={14} />
                <span>All 2,00,000+ SKUs Catalog</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Filter Tabs Bar (Horizontal scrolling with counts) */}
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {availableTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const count = tabCounts[tab.id] ?? 0;

              if (tab.isSurplus) {
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border cursor-pointer shrink-0 inline-flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-amber-50/70 text-amber-800 hover:bg-amber-100 border-amber-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-amber-500'}`} />
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                        isActive ? 'bg-amber-700/60 text-white' : 'bg-amber-200/80 text-amber-900'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border cursor-pointer shrink-0 inline-flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? 'bg-blue-800/60 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 8 Product Cards Grid */}
        {visibleProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto my-6 shadow-xs">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <PackageCheck size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No items currently in this category</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              We manufacture custom sizes and standards on demand. Explore our full catalog or reset the filter.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              View All Fasteners
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {visibleProducts.map((p) => {
              const currentUnit = getUnit(p.id);
              const currentQty = getQty(p.id);
              const currentPrice = currentUnit === 'PCS' ? p.pricePerPiece : p.pricePerKg;
              const pcsPerBox = p.pcsPerBox || 500;
              const leadDays = p.leadTimeDays || 2;

              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-xl border ${
                    p.isSurplus
                      ? 'border-amber-300 ring-1 ring-amber-200'
                      : 'border-slate-200'
                  } p-3.5 sm:p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 relative h-full`}
                >
                  <div className="flex flex-col flex-1">
                    {/* Top Badges */}
                    <div className="flex justify-between items-center mb-2 gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-extrabold font-mono tracking-wider">
                          {p.standard}
                        </span>

                        {p.isSurplus ? (
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide">
                            -{p.surplusDiscountPct || 60}% SURPLUS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-[10px] sm:text-[11px] font-bold">
                            <CheckCircle2 size={12} />
                            <span>In Stock</span>
                          </span>
                        )}
                      </div>

                      <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold font-mono border border-blue-200 whitespace-nowrap">
                        MOQ: 100 Pcs / 250g
                      </span>
                    </div>

                    {/* Product Image */}
                    <Link href={`/product/${p.id}`} className="block text-center my-1.5 group">
                      <div className="relative w-full h-28 sm:h-32 bg-slate-50/70 rounded-lg p-2 transition-transform group-hover:scale-102 duration-200 flex items-center justify-center">
                        <Image
                          src={p.imageUrl || '/assets/bolt_zinc.jpg'}
                          alt={p.name}
                          fill
                          unoptimized={Boolean(p.imageUrl && p.imageUrl.startsWith('http'))}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-contain p-1"
                          onError={(e) => {
                            try {
                              (e.target as any).src = '/assets/bolt_zinc.jpg';
                            } catch {}
                          }}
                        />
                      </div>
                    </Link>

                    {/* Specs Matrix Strip */}
                    <div className="grid grid-cols-3 text-center bg-slate-50/90 rounded-lg p-1.5 text-[10px] font-mono border border-slate-100 mb-2">
                      <div>
                        <span className="text-slate-400 block text-[9px] font-sans font-medium">Grade</span>
                        <strong className="text-slate-900 truncate block">{toTitleCase(p.grade)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] font-sans font-medium">Size</span>
                        <strong className="text-slate-900 truncate block" title={p.sizeFormatted || `${p.diameter}x${p.lengthMm}`}>
                          {p.sizeFormatted || `${p.diameter}x${p.lengthMm}`}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] font-sans font-medium">Pitch</span>
                        <strong className="text-slate-900 truncate block">{p.pitchMm}mm</strong>
                      </div>
                    </div>

                    {/* Title (exact 2-line height, no descender overflow) */}
                    <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 line-clamp-2 h-[34px] leading-[17px] mb-2 overflow-hidden">
                      <Link href={`/product/${p.id}`} className="hover:text-blue-700 transition-colors" title={p.name}>
                        {formatCardTitle(p.name)}
                      </Link>
                    </h3>

                    {/* Packaging, Lead & Finish - 3-Column Micro Strip */}
                    <div className="grid grid-cols-3 gap-1 text-[10px] text-center font-mono text-slate-600 mb-2">
                      <div className="bg-slate-100/90 rounded py-0.5 px-1 truncate" title={`Small Box: ${pcsPerBox.toLocaleString()} pcs`}>
                        Box: <strong>{pcsPerBox.toLocaleString()}</strong>
                      </div>
                      <div className="bg-slate-100/90 rounded py-0.5 px-1 truncate" title={`Dispatch Lead Time: ${leadDays} days`}>
                        Lead: <strong>{leadDays}d</strong>
                      </div>
                      <div className="bg-slate-100/90 rounded py-0.5 px-1 truncate" title={`Finish: ${p.finish || 'Standard'}`}>
                        <strong>{toTitleCase(p.finish || 'Self')}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Commercial Section */}
                  <div className="mt-auto pt-2.5 border-t border-slate-100 space-y-2">
                    {/* Dual Pricing Box */}
                    <div className="bg-slate-50/90 rounded-lg p-2.5 border border-slate-200/80">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[10px] sm:text-[11px] text-slate-600 font-bold">
                          {currentUnit === 'PCS' ? 'Rate / Pc:' : 'Rate / Kg:'}
                        </span>
                        <div className="text-right">
                          <span className="text-base sm:text-lg font-black text-blue-700 font-mono">
                            {formatINR(currentPrice)}
                          </span>
                          {((currentUnit === 'PCS' && p.originalPricePerPiece && p.originalPricePerPiece > p.pricePerPiece) ||
                            (currentUnit === 'KGS' && p.originalPricePerKg && p.originalPricePerKg > p.pricePerKg)) && (
                            <span className="text-[10px] text-slate-400 line-through ml-1 font-mono">
                              {formatINR(currentUnit === 'PCS' ? p.originalPricePerPiece! : p.originalPricePerKg!)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200/60">
                        <span className="whitespace-nowrap">
                          Alt: <strong className="text-slate-700">{formatINR(currentUnit === 'PCS' ? p.pricePerKg : p.pricePerPiece)}</strong>/{currentUnit === 'PCS' ? 'kg' : 'pc'}
                        </span>
                        <span className="whitespace-nowrap text-slate-400">
                          {((p.weightPerPcKg || 0.05) * 1000).toFixed(1)}g/pc
                        </span>
                      </div>
                    </div>

                    {/* Procurement Configurator */}
                    <div className="space-y-1.5">
                      {/* Segmented Unit Selector */}
                      <div className="grid grid-cols-2 bg-slate-100 p-0.5 rounded-lg text-xs font-bold border border-slate-200/60">
                        <button
                          type="button"
                          disabled={currentUnit === 'PCS'}
                          onClick={() => {
                            if (currentUnit !== 'PCS') {
                              toggleUnit(p.id, 'PCS');
                            }
                          }}
                          className={`py-1 rounded-md text-[11px] font-bold transition-all text-center ${
                            currentUnit === 'PCS'
                              ? 'bg-white text-blue-700 shadow-xs font-black cursor-default pointer-events-none'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer'
                          }`}
                          title={currentUnit === 'PCS' ? 'Pieces (Pcs) already selected' : 'Switch to Pieces (Pcs)'}
                        >
                          Pieces (Pcs)
                        </button>
                        <button
                          type="button"
                          disabled={currentUnit === 'KGS'}
                          onClick={() => {
                            if (currentUnit !== 'KGS') {
                              toggleUnit(p.id, 'KGS');
                            }
                          }}
                          className={`py-1 rounded-md text-[11px] font-bold transition-all text-center ${
                            currentUnit === 'KGS'
                              ? 'bg-white text-blue-700 shadow-xs font-black cursor-default pointer-events-none'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer'
                          }`}
                          title={currentUnit === 'KGS' ? 'Weight (Kg) already selected' : 'Switch to Weight (Kg)'}
                        >
                          Weight (Kg)
                        </button>
                      </div>

                      {/* Full-Width Quantity Stepper */}
                      <div className="flex items-center justify-between border border-slate-300 rounded-lg bg-white px-2 py-1 shadow-2xs">
                        <button
                          type="button"
                          disabled={currentQty <= (currentUnit === 'KGS' ? MIN_QTY_KGS : MIN_QTY_PCS)}
                          onClick={() => adjustQty(p.id, -1)}
                          className="w-7 h-7 flex items-center justify-center font-black text-slate-700 hover:bg-slate-100 rounded disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer text-sm transition-colors"
                          aria-label="Decrease quantity"
                          title={currentQty <= (currentUnit === 'KGS' ? MIN_QTY_KGS : MIN_QTY_PCS) ? `Minimum order reached (${currentUnit === 'KGS' ? '250 gm' : '100 pcs'})` : 'Decrease quantity'}
                        >
                          &minus;
                        </button>

                        <div className="flex flex-col items-center justify-center min-w-0 px-2">
                          <span className="font-mono font-bold text-slate-900 text-xs sm:text-[13px] leading-tight truncate">
                            {currentUnit === 'KGS' ? (currentQty === 0.25 ? '250 gm' : `${currentQty} Kg`) : `${currentQty.toLocaleString()} Pcs`}
                          </span>
                          <span className="text-[9px] text-blue-600 font-semibold leading-none">
                            {currentUnit === 'KGS' ? 'Min: 250 gm (0.25 Kg)' : 'Min: 100 Pcs'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => adjustQty(p.id, 1)}
                          className="w-7 h-7 flex items-center justify-center font-black text-slate-700 hover:bg-slate-100 rounded cursor-pointer text-sm transition-colors"
                          aria-label="Increase quantity"
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Add to RFQ Button */}
                    <button
                      type="button"
                      onClick={() => onAddToCart(p, clampQty(currentQty, currentUnit), currentUnit)}
                      className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 sm:py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                    >
                      <ShoppingCart size={14} />
                      <span>Add to RFQ Quote</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Redirect CTA */}
        <div className="flex flex-col items-center justify-center mt-9 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2.5 bg-blue-700 hover:bg-blue-800 text-white py-3.5 px-8 rounded-xl text-sm sm:text-base font-extrabold shadow-md hover:shadow-lg transition-all no-underline"
          >
            <span>View All Fasteners ({products.length > 0 ? products.length : '57+'} Products)</span>
            <ArrowRight size={18} />
          </Link>
          <span className="text-xs text-slate-500 mt-2.5">
            Browse full procurement catalog with parametric filters, diameter sizes &amp; DIN/ISO standard drawings
          </span>
        </div>

        {/* Custom Engineering Pitch Banner */}
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex items-center justify-between flex-wrap gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <PackageCheck size={24} />
            </div>
            <div>
              <strong className="text-sm sm:text-base text-slate-900 block font-bold">
                Need customized thread pitch or non-standard metric lengths?
              </strong>
              <span className="text-xs sm:text-sm text-slate-500 font-medium">
                We forge M6 to M64 in 4.6, 5.8, 8.8, 10.9, 12.9, and Stainless A2/A4 with certified mill tolerances.
              </span>
            </div>
          </div>

          <Link
            href="/products"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-xl transition-colors no-underline"
          >
            <span>Explore Entire Fastener Catalog</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
