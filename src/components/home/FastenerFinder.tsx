'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  SlidersHorizontal,
  Search,
  RotateCcw,
  X,
  Layers,
  Hexagon,
  Component,
  Wrench,
  CircleDot,
  Anchor,
  Ruler,
  LucideIcon,
  Sparkles,
} from 'lucide-react';
import { Product } from '@/lib/types';

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

interface FilterOptionsData {
  categories?: string[];
  subGroups?: string[];
  standards?: string[];
  grades?: string[];
  diameters?: string[];
  lengths?: number[];
  finishes?: string[];
}

interface FastenerFinderProps {
  onFilterChange: (filters: FastenerFilters) => void;
  productsCount?: number;
  totalProductsCount?: number;
  allProducts?: Product[];
  filterOptions?: FilterOptionsData | null;
}

interface TabOption {
  id: string;
  label: string;
  sub: string;
  icon: LucideIcon;
  defaultStandard?: string;
  defaultCategory?: string;
}

export default function FastenerFinder({
  onFilterChange,
  productsCount = 0,
  totalProductsCount = 0,
  allProducts = [],
  filterOptions = null,
}: FastenerFinderProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  const [standard, setStandard] = useState<string>('all');
  const [grade, setGrade] = useState<string>('all');
  const [diameter, setDiameter] = useState<string>('all');
  const [length, setLength] = useState<string>('all');
  const [finish, setFinish] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Fallback internal fetch for filter options if not supplied by parent
  const [internalFilterOptions, setInternalFilterOptions] = useState<FilterOptionsData | null>(null);

  useEffect(() => {
    if (!filterOptions && allProducts.length === 0) {
      fetch('/api/products?limit=1')
        .then((res) => res.json())
        .then((data) => {
          if (data.filterOptions) {
            setInternalFilterOptions(data.filterOptions);
          }
        })
        .catch(() => {});
    }
  }, [filterOptions, allProducts.length]);

  const activeOptions = filterOptions || internalFilterOptions;

  // 1. DYNAMIC CATEGORIES & COUNTS
  const dynamicCategories = useMemo(() => {
    if (allProducts && allProducts.length > 0) {
      const counts = new Map<string, number>();
      allProducts.forEach((p) => {
        if (p.category) {
          counts.set(p.category, (counts.get(p.category) || 0) + 1);
        }
      });
      return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));
    }
    if (activeOptions?.categories && activeOptions.categories.length > 0) {
      return activeOptions.categories.map((c) => ({ name: c, count: 0 }));
    }
    return [];
  }, [allProducts, activeOptions]);

  // 2. DYNAMIC STANDARDS
  const dynamicStandards = useMemo(() => {
    if (allProducts && allProducts.length > 0) {
      const counts = new Map<string, number>();
      allProducts.forEach((p) => {
        if (p.standard) {
          counts.set(p.standard, (counts.get(p.standard) || 0) + 1);
        }
      });
      return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));
    }
    if (activeOptions?.standards && activeOptions.standards.length > 0) {
      return activeOptions.standards.map((s) => ({ name: s, count: 0 }));
    }
    return [];
  }, [allProducts, activeOptions]);

  // 3. DYNAMIC GRADES
  const dynamicGrades = useMemo(() => {
    if (allProducts && allProducts.length > 0) {
      const counts = new Map<string, number>();
      allProducts.forEach((p) => {
        if (p.grade) {
          counts.set(p.grade, (counts.get(p.grade) || 0) + 1);
        }
      });
      return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));
    }
    if (activeOptions?.grades && activeOptions.grades.length > 0) {
      return activeOptions.grades.map((g) => ({ name: g, count: 0 }));
    }
    return [];
  }, [allProducts, activeOptions]);

  // 4. DYNAMIC DIAMETERS (Naturally sorted: M6, M8, M10, M12...)
  const dynamicDiameters = useMemo(() => {
    if (allProducts && allProducts.length > 0) {
      const counts = new Map<string, number>();
      allProducts.forEach((p) => {
        if (p.diameter) {
          counts.set(p.diameter, (counts.get(p.diameter) || 0) + 1);
        }
      });
      return Array.from(counts.entries())
        .sort((a, b) => {
          const numA = parseFloat(a[0].replace(/[^0-9.]/g, '')) || 0;
          const numB = parseFloat(b[0].replace(/[^0-9.]/g, '')) || 0;
          return numA - numB;
        })
        .map(([name, count]) => ({ name, count }));
    }
    if (activeOptions?.diameters && activeOptions.diameters.length > 0) {
      return activeOptions.diameters
        .map((d) => ({ name: d, count: 0 }))
        .sort((a, b) => {
          const numA = parseFloat(a.name.replace(/[^0-9.]/g, '')) || 0;
          const numB = parseFloat(b.name.replace(/[^0-9.]/g, '')) || 0;
          return numA - numB;
        });
    }
    return [];
  }, [allProducts, activeOptions]);

  // 5. DYNAMIC LENGTHS (Numerically sorted)
  const dynamicLengths = useMemo(() => {
    if (allProducts && allProducts.length > 0) {
      const counts = new Map<number, number>();
      allProducts.forEach((p) => {
        const len = Number(p.lengthMm);
        if (len && len > 0) {
          counts.set(len, (counts.get(len) || 0) + 1);
        }
      });
      return Array.from(counts.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([val, count]) => ({ val, count }));
    }
    if (activeOptions?.lengths && activeOptions.lengths.length > 0) {
      return activeOptions.lengths
        .filter((n) => !isNaN(n) && n > 0)
        .sort((a, b) => a - b)
        .map((val) => ({ val, count: 0 }));
    }
    return [];
  }, [allProducts, activeOptions]);

  // 6. DYNAMIC FINISHES
  const dynamicFinishes = useMemo(() => {
    if (allProducts && allProducts.length > 0) {
      const counts = new Map<string, number>();
      allProducts.forEach((p) => {
        if (p.finish) {
          counts.set(p.finish, (counts.get(p.finish) || 0) + 1);
        }
      });
      return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));
    }
    if (activeOptions?.finishes && activeOptions.finishes.length > 0) {
      return activeOptions.finishes.map((f) => ({ name: f, count: 0 }));
    }
    return [];
  }, [allProducts, activeOptions]);

  // DYNAMIC TABS BASED ON ACTUAL DATABASE CATEGORIES
  const dynamicTabs = useMemo(() => {
    const tabs: TabOption[] = [
      {
        id: 'all',
        label: 'All Fasteners',
        sub: totalProductsCount > 0 ? `${totalProductsCount.toLocaleString()} SKUs` : 'Empty Catalog',
        icon: Layers,
      },
    ];

    const getIconForCategory = (name: string): LucideIcon => {
      const lower = name.toLowerCase();
      if (lower.includes('screw')) return Hexagon;
      if (lower.includes('bolt')) return Component;
      if (lower.includes('socket') || lower.includes('allen')) return Wrench;
      if (lower.includes('nut') || lower.includes('washer')) return CircleDot;
      if (lower.includes('anchor')) return Anchor;
      if (lower.includes('rod') || lower.includes('stud')) return Ruler;
      return Layers;
    };

    dynamicCategories.forEach((cat) => {
      tabs.push({
        id: cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        label: cat.name,
        sub: cat.count > 0 ? `${cat.count.toLocaleString()} Products` : 'Available',
        icon: getIconForCategory(cat.name),
        defaultCategory: cat.name,
      });
    });

    return tabs;
  }, [dynamicCategories, totalProductsCount]);

  // DYNAMIC QUICK CHIPS FROM REAL ATTRIBUTES IN INVENTORY
  const dynamicQuickChips = useMemo(() => {
    if (totalProductsCount === 0) return [];
    const chips: Array<{ type: 'diameter' | 'grade' | 'finish' | 'inStock'; value: string; label: string }> = [];

    // Top diameter
    if (dynamicDiameters.length > 0) {
      const topDia = dynamicDiameters[0].name;
      chips.push({ type: 'diameter', value: topDia, label: `${topDia.toUpperCase()} Diameter` });
    }

    // Top grades (up to 2)
    dynamicGrades.slice(0, 2).forEach((g) => {
      const gName = g.name.toUpperCase().startsWith('GRADE') ? g.name : `Grade ${g.name}`;
      chips.push({ type: 'grade', value: g.name, label: gName });
    });

    // Top coating/finish
    if (dynamicFinishes.length > 0) {
      chips.push({ type: 'finish', value: dynamicFinishes[0].name, label: dynamicFinishes[0].name });
    }

    // In-Stock Only Chip
    const inStockCount = allProducts.filter((p) => p.isInStock && p.stockPcs > 0).length;
    chips.push({
      type: 'inStock',
      value: 'true',
      label: inStockCount > 0 ? `⚡ In-Stock Only (${inStockCount})` : '⚡ In-Stock Only',
    });

    return chips;
  }, [totalProductsCount, dynamicDiameters, dynamicGrades, dynamicFinishes, allProducts]);

  // Trigger parent filter change
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
    const nextCategory = tab.defaultCategory || (tab.id === 'all' ? 'all' : tab.label);
    const nextStandard = tab.defaultStandard || 'all';

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
              <strong>{productsCount.toLocaleString()}</strong> SKUs Active in Catalog{' '}
              <span style={{ color: '#8898AA', fontWeight: 400 }}>({totalProductsCount.toLocaleString()} Live)</span>
            </span>
          </div>
        </div>

        {/* Dynamic Category Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-3 mb-4 border-b border-slate-200/80 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {dynamicTabs.map((tab) => {
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

        {/* Dynamic Quick Spec Chips */}
        {dynamicQuickChips.length > 0 && (
          <div className="finder-quick-row">
            <span className="finder-quick-label">Quick Filters:</span>
            {dynamicQuickChips.map((chip, idx) => {
              let isActive = false;
              if (chip.type === 'diameter') isActive = diameter === chip.value;
              else if (chip.type === 'grade') isActive = grade === chip.value;
              else if (chip.type === 'finish') isActive = finish === chip.value;
              else if (chip.type === 'inStock') isActive = inStockOnly;

              return (
                <button
                  key={idx}
                  type="button"
                  className={`finder-chip ${isActive ? 'active' : ''}`}
                  onClick={() => handleQuickChip(chip.type, chip.value)}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Active Filters Summary Strip */}
        {hasActiveFilters && (
          <div className="finder-active-bar">
            <div className="finder-active-tags">
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#9F1239', textTransform: 'uppercase' }}>
                Filtered By:
              </span>
              {activeTab !== 'all' && (
                <span className="finder-active-tag">
                  Tab: {dynamicTabs.find((t) => t.id === activeTab)?.label || activeTab}
                  <button type="button" onClick={() => handleTabClick(dynamicTabs[0])}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {category !== 'all' && (
                <span className="finder-active-tag">
                  Category: {category}
                  <button
                    type="button"
                    onClick={() => {
                      setCategory('all');
                      applyFilters({ category: 'all' });
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {standard !== 'all' && (
                <span className="finder-active-tag">
                  Standard: {standard}
                  <button
                    type="button"
                    onClick={() => {
                      setStandard('all');
                      applyFilters({ standard: 'all' });
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {grade !== 'all' && (
                <span className="finder-active-tag">
                  Grade: {grade}
                  <button
                    type="button"
                    onClick={() => {
                      setGrade('all');
                      applyFilters({ grade: 'all' });
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {diameter !== 'all' && (
                <span className="finder-active-tag">
                  Diameter: {diameter.toUpperCase()}
                  <button
                    type="button"
                    onClick={() => {
                      setDiameter('all');
                      applyFilters({ diameter: 'all' });
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {length !== 'all' && (
                <span className="finder-active-tag">
                  Length: {length}mm
                  <button
                    type="button"
                    onClick={() => {
                      setLength('all');
                      applyFilters({ length: 'all' });
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {finish !== 'all' && (
                <span className="finder-active-tag">
                  Finish: {finish}
                  <button
                    type="button"
                    onClick={() => {
                      setFinish('all');
                      applyFilters({ finish: 'all' });
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="finder-active-tag">
                  In-Stock Only
                  <button
                    type="button"
                    onClick={() => {
                      setInStockOnly(false);
                      applyFilters({ inStockOnly: false });
                    }}
                  >
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

        {/* 6-Field Fully Dynamic Parametric Filter Grid */}
        <form onSubmit={handleSubmit} className="finder-grid">
          {/* 1. Category */}
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
              <option value="all">
                {dynamicCategories.length > 0 ? `All Categories (${dynamicCategories.length})` : 'All Categories'}
              </option>
              {dynamicCategories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} {c.count > 0 ? `(${c.count})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Standard */}
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
              <option value="all">
                {dynamicStandards.length > 0 ? `All Standards (${dynamicStandards.length})` : 'All Standards'}
              </option>
              {dynamicStandards.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} {s.count > 0 ? `(${s.count})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Grade */}
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
              <option value="all">
                {dynamicGrades.length > 0 ? `All Grades (${dynamicGrades.length})` : 'All Grades'}
              </option>
              {dynamicGrades.map((g) => {
                const label = g.name.toUpperCase().startsWith('GRADE') ? g.name : `Grade ${g.name}`;
                return (
                  <option key={g.name} value={g.name}>
                    {label} {g.count > 0 ? `(${g.count})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 4. Diameter */}
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
              <option value="all">
                {dynamicDiameters.length > 0 ? `All Diameters (${dynamicDiameters.length})` : 'All Diameters'}
              </option>
              {dynamicDiameters.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name.toUpperCase()} {d.count > 0 ? `(${d.count})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Length */}
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
              <option value="all">
                {dynamicLengths.length > 0 ? `All Lengths (${dynamicLengths.length})` : 'All Lengths'}
              </option>
              {dynamicLengths.map((l) => (
                <option key={l.val} value={String(l.val)}>
                  {l.val} mm {l.count > 0 ? `(${l.count})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Coating / Finish */}
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
              <option value="all">
                {dynamicFinishes.length > 0 ? `All Coatings (${dynamicFinishes.length})` : 'All Coatings'}
              </option>
              {dynamicFinishes.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name} {f.count > 0 ? `(${f.count})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Action */}
          <button type="submit" className="finder-submit-btn" title="View matching products in catalog">
            <span>Filter</span>
            <Search size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
