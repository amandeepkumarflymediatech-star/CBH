'use client';

import React, { useState, useEffect, useId } from 'react';
import {
  SlidersHorizontal,
  Search,
  CheckCircle2,
  Scale,
  Truck,
  Percent,
  RotateCcw,
  Sparkles,
  X,
  Filter,
  Layers,
  Hexagon,
  Component,
  Wrench,
  CircleDot,
  Anchor,
  Ruler,
  LucideIcon,
} from 'lucide-react';

export interface FastenerFilters {
  tab: string;
  category: string;
  standard: string;
  grade: string;
  diameter: string;
  length: string;
  finish: string;
  inStockOnly: boolean;
  search?: string;
}

interface FastenerFinderProps {
  onFilterChange: (filters: FastenerFilters) => void;
  productsCount?: number;
  totalProductsCount?: number;
}

interface TabOption {
  id: string;
  label: string;
  sub: string;
  icon: LucideIcon;
  defaultStandard?: string;
  defaultCategory?: string;
}

const FINDER_TABS: TabOption[] = [
  { id: 'all', label: 'All Fasteners', sub: '2,00,000+ SKUs', icon: Layers },
  { id: 'hex-screws', label: 'Hex Screws', sub: 'DIN 933 Full Thread', icon: Hexagon, defaultStandard: 'din933', defaultCategory: 'hex-screws' },
  { id: 'hex-bolts', label: 'Hex Bolts', sub: 'DIN 931 Half Thread', icon: Component, defaultStandard: 'din931', defaultCategory: 'hex-bolts' },
  { id: 'socket-cap', label: 'Socket Allen', sub: 'DIN 912 Grade 12.9', icon: Wrench, defaultStandard: 'din912', defaultCategory: 'socket-cap' },
  { id: 'nuts', label: 'Nuts & Washers', sub: 'DIN 934 / DIN 125', icon: CircleDot, defaultStandard: 'din934', defaultCategory: 'nuts' },
  { id: 'anchors', label: 'Anchors & Fixings', sub: 'Concrete Expansion', icon: Anchor, defaultStandard: 'eta', defaultCategory: 'anchors' },
  { id: 'threaded-rods', label: 'Threaded Rods', sub: 'ASTM A193 B7 / Studs', icon: Ruler, defaultStandard: 'astma193', defaultCategory: 'threaded-rods' },
];

export default function FastenerFinder({
  onFilterChange,
  productsCount = 9,
  totalProductsCount = 9,
}: FastenerFinderProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  const [standard, setStandard] = useState<string>('all');
  const [grade, setGrade] = useState<string>('all');
  const [diameter, setDiameter] = useState<string>('all');
  const [length, setLength] = useState<string>('all');
  const [finish, setFinish] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Trigger parent filter change whenever any filter state changes
  const applyFilters = (overrides?: Partial<FastenerFilters>) => {
    const currentFilters: FastenerFilters = {
      tab: overrides?.tab ?? activeTab,
      category: overrides?.category ?? category,
      standard: overrides?.standard ?? standard,
      grade: overrides?.grade ?? grade,
      diameter: overrides?.diameter ?? diameter,
      length: overrides?.length ?? length,
      finish: overrides?.finish ?? finish,
      inStockOnly: overrides?.inStockOnly ?? inStockOnly,
    };
    onFilterChange(currentFilters);
  };

  // Handle Tab Switch
  const handleTabClick = (tab: TabOption) => {
    setActiveTab(tab.id);

    let nextCategory = 'all';
    let nextStandard = 'all';

    if (tab.defaultCategory) {
      nextCategory = tab.defaultCategory;
    }
    if (tab.defaultStandard) {
      nextStandard = tab.defaultStandard;
    }

    setCategory(nextCategory);
    setStandard(nextStandard);

    applyFilters({
      tab: tab.id,
      category: nextCategory,
      standard: nextStandard,
    });
  };

  // Handle Quick Chips
  const handleQuickChip = (type: 'diameter' | 'grade' | 'finish' | 'inStock', val: string) => {
    if (type === 'diameter') {
      const next = diameter === val ? 'all' : val;
      setDiameter(next);
      applyFilters({ diameter: next });
    } else if (type === 'grade') {
      const next = grade === val ? 'all' : val;
      setGrade(next);
      applyFilters({ grade: next });
    } else if (type === 'finish') {
      const next = finish === val ? 'all' : val;
      setFinish(next);
      applyFilters({ finish: next });
    } else if (type === 'inStock') {
      const next = !inStockOnly;
      setInStockOnly(next);
      applyFilters({ inStockOnly: next });
    }
  };

  // Reset all filters
  const handleReset = () => {
    setActiveTab('all');
    setCategory('all');
    setStandard('all');
    setGrade('all');
    setDiameter('all');
    setLength('all');
    setFinish('all');
    setInStockOnly(false);

    onFilterChange({
      tab: 'all',
      category: 'all',
      standard: 'all',
      grade: 'all',
      diameter: 'all',
      length: 'all',
      finish: 'all',
      inStockOnly: false,
    });
  };

  // Form submit -> scroll to catalog
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
    const catalogElement = document.getElementById('catalog');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const hasActiveFilters =
    activeTab !== 'all' ||
    category !== 'all' ||
    standard !== 'all' ||
    grade !== 'all' ||
    diameter !== 'all' ||
    length !== 'all' ||
    finish !== 'all' ||
    inStockOnly;

  return (
    <div className="container" style={{ marginTop: '-24px', position: 'relative', zIndex: 10 }}>
      <div className="finder-bar">
        {/* Finder Header with Dynamic Telemetry */}
        <div className="finder-header">
          <div className="finder-title">
            <SlidersHorizontal size={20} color="var(--color-primary)" />
            <span>Find Fasteners by Size &amp; Type (साइज अनुसार खोजें)</span>
          </div>

          <div className="finder-telemetry-badge">
            <span className="pulse-dot" />
            <span>
              <strong>{productsCount}</strong> SKUs Active in Catalog{' '}
              <span style={{ color: '#8898AA', fontWeight: 400 }}>({totalProductsCount} Live)</span>
            </span>
          </div>
        </div>

        {/* Dynamic Interactive Category Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-3 mb-4 border-b border-slate-200/80 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {FINDER_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabClick(tab)}
                className={`group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 shrink-0 text-left cursor-pointer border select-none ${
                  isActive
                    ? 'bg-[#0052CC] text-white border-[#0052CC] shadow-md shadow-blue-900/25 -translate-y-0.5'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 hover:border-blue-400 hover:shadow-xs'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-50 group-hover:bg-blue-100 text-[#0052CC]'
                  }`}
                >
                  <IconComp size={16} />
                </div>

                <div className="flex flex-col pr-1">
                  <span
                    className={`text-xs font-black tracking-tight leading-tight ${
                      isActive ? 'text-white' : 'text-slate-900 group-hover:text-[#0052CC]'
                    }`}
                  >
                    {tab.label}
                  </span>
                  <span
                    className={`text-[10px] font-semibold mt-0.5 ${
                      isActive ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {tab.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Spec Pills */}
        <div className="finder-quick-row">
          <span className="finder-quick-label">Quick Filters:</span>
          <button
            type="button"
            className={`finder-chip ${diameter === 'm10' ? 'active' : ''}`}
            onClick={() => handleQuickChip('diameter', 'm10')}
          >
            M10 Diameter
          </button>
          <button
            type="button"
            className={`finder-chip ${grade === '5.8' ? 'active' : ''}`}
            onClick={() => handleQuickChip('grade', '5.8')}
          >
            Grade 5.8
          </button>
          <button
            type="button"
            className={`finder-chip ${grade === '8.8' ? 'active' : ''}`}
            onClick={() => handleQuickChip('grade', '8.8')}
          >
            Grade 8.8 High-Tensile
          </button>
          <button
            type="button"
            className={`finder-chip ${finish === 'bp' ? 'active' : ''}`}
            onClick={() => handleQuickChip('finish', 'bp')}
          >
            Black Passivated (BP)
          </button>
          <button
            type="button"
            className={`finder-chip ${finish === 'blkzp' ? 'active' : ''}`}
            onClick={() => handleQuickChip('finish', 'blkzp')}
          >
            Black Zinc (Blkzp)
          </button>
          <button
            type="button"
            className={`finder-chip ${inStockOnly ? 'active' : ''}`}
            onClick={() => handleQuickChip('inStock', 'true')}
          >
            ⚡ In-Stock Only
          </button>
        </div>

        {/* Active Filters Summary Strip */}
        {hasActiveFilters && (
          <div className="finder-active-bar">
            <div className="finder-active-tags">
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#9F1239', textTransform: 'uppercase' }}>
                Filtered By:
              </span>
              {activeTab !== 'all' && (
                <span className="finder-active-tag">
                  Tab: {FINDER_TABS.find((t) => t.id === activeTab)?.label}
                  <button type="button" onClick={() => handleTabClick(FINDER_TABS[0])}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {category !== 'all' && (
                <span className="finder-active-tag">
                  Category: {category}
                  <button type="button" onClick={() => { setCategory('all'); applyFilters({ category: 'all' }); }}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {standard !== 'all' && (
                <span className="finder-active-tag">
                  Standard: {standard.toUpperCase()}
                  <button type="button" onClick={() => { setStandard('all'); applyFilters({ standard: 'all' }); }}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {grade !== 'all' && (
                <span className="finder-active-tag">
                  Grade: {grade}
                  <button type="button" onClick={() => { setGrade('all'); applyFilters({ grade: 'all' }); }}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {diameter !== 'all' && (
                <span className="finder-active-tag">
                  Diameter: {diameter.toUpperCase()}
                  <button type="button" onClick={() => { setDiameter('all'); applyFilters({ diameter: 'all' }); }}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {length !== 'all' && (
                <span className="finder-active-tag">
                  Length: {length}mm
                  <button type="button" onClick={() => { setLength('all'); applyFilters({ length: 'all' }); }}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {finish !== 'all' && (
                <span className="finder-active-tag">
                  Finish: {finish.toUpperCase()}
                  <button type="button" onClick={() => { setFinish('all'); applyFilters({ finish: 'all' }); }}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="finder-active-tag">
                  In-Stock Only
                  <button type="button" onClick={() => { setInStockOnly(false); applyFilters({ inStockOnly: false }); }}>
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>

            <button type="button" className="finder-reset-btn" onClick={handleReset}>
              <RotateCcw size={12} />
              <span>Reset All</span>
            </button>
          </div>
        )}

        {/* 6-Field Parametric Filter Grid */}
        <form onSubmit={handleSubmit} className="finder-grid">
          {/* Category */}
          <div className="finder-field">
            <label>Category</label>
            <select
              className="finder-select"
              value={category}
              onChange={(e) => {
                const val = e.target.value;
                setCategory(val);
                applyFilters({ category: val });
              }}
            >
              <option value="all">All Categories</option>
              <option value="hex-screws">Hex Screws</option>
              <option value="hex-bolts">Heavy Hex Bolts</option>
              <option value="socket-cap">Socket Cap Screws</option>
              <option value="anchors">Anchors & Fixings</option>
              <option value="threaded-rods">Threaded Rods</option>
              <option value="nuts">Industrial Hex Nuts</option>
            </select>
          </div>

          {/* Standard */}
          <div className="finder-field">
            <label>Standard</label>
            <select
              className="finder-select"
              value={standard}
              onChange={(e) => {
                const val = e.target.value;
                setStandard(val);
                applyFilters({ standard: val });
              }}
            >
              <option value="all">All Standards</option>
              <option value="din933">DIN 933 (Full Thread)</option>
              <option value="din931">DIN 931 (Half Thread)</option>
              <option value="din912">DIN 912 (Socket Head)</option>
              <option value="din934">DIN 934 (Hex Nut)</option>
              <option value="astma193">ASTM A193 B7</option>
              <option value="eta">ETA Option 7 (Anchor)</option>
            </select>
          </div>

          {/* Grade */}
          <div className="finder-field">
            <label>Grade</label>
            <select
              className="finder-select"
              value={grade}
              onChange={(e) => {
                const val = e.target.value;
                setGrade(val);
                applyFilters({ grade: val });
              }}
            >
              <option value="all">All Grades</option>
              <option value="5.8">Grade 5.8 (Mild)</option>
              <option value="8.8">Grade 8.8 (High-Tensile)</option>
              <option value="10.9">Grade 10.9 (Structural)</option>
              <option value="ss304">SS 304 / A2-70</option>
              <option value="ss316">SS 316 / A4-80</option>
            </select>
          </div>

          {/* Diameter */}
          <div className="finder-field">
            <label>Diameter (d)</label>
            <select
              className="finder-select"
              value={diameter}
              onChange={(e) => {
                const val = e.target.value;
                setDiameter(val);
                applyFilters({ diameter: val });
              }}
            >
              <option value="all">All Diameters</option>
              <option value="m6">M6</option>
              <option value="m8">M8</option>
              <option value="m10">M10 (p=1.5)</option>
              <option value="m12">M12 (p=1.75)</option>
              <option value="m16">M16 (p=2.0)</option>
              <option value="m20">M20</option>
              <option value="m24">M24</option>
              <option value="m36">M36</option>
            </select>
          </div>

          {/* Length */}
          <div className="finder-field">
            <label>Length (L)</label>
            <select
              className="finder-select"
              value={length}
              onChange={(e) => {
                const val = e.target.value;
                setLength(val);
                applyFilters({ length: val });
              }}
            >
              <option value="all">All Lengths</option>
              <option value="12">12 mm</option>
              <option value="50">50 mm</option>
              <option value="100">100 mm</option>
              <option value="110">110 mm</option>
              <option value="116">116 mm</option>
              <option value="120">120 mm</option>
              <option value="125">125 mm</option>
              <option value="130">130 mm</option>
              <option value="140">140 mm</option>
              <option value="150">150 mm</option>
            </select>
          </div>

          {/* Finish */}
          <div className="finder-field">
            <label>Coating / Finish</label>
            <select
              className="finder-select"
              value={finish}
              onChange={(e) => {
                const val = e.target.value;
                setFinish(val);
                applyFilters({ finish: val });
              }}
            >
              <option value="all">All Coatings</option>
              <option value="blkzp">Black Zinc Phosphated</option>
              <option value="bp">Black Passivated</option>
              <option value="hdg">Hot Dip Galvanized</option>
              <option value="clear">Clear Zinc Cr3+</option>
              <option value="passivated">Clean Passivated</option>
            </select>
          </div>

          {/* Filter Action */}
          <button type="submit" className="finder-submit-btn" title="View matching products in catalog">
            <span>Filter  </span>
            <Search size={16} />
          </button>
        </form>

        {/* Trust Badges Strip Below Finder */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginTop: '16px',
            paddingTop: '14px',
            borderTop: '1px solid var(--color-surface-subtle)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-dark-800)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#059669" />
            <span>BIS Certified Lab Tested</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Scale size={16} color="var(--color-primary)" />
            <span>Dual Unit: PCS & KGS Live</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Truck size={16} color="#059669" />
            <span>Pan-India 24-48hr Dispatch</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Percent size={16} color="#D97706" />
            <span>25% Slabs on ₹1,00,000+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
