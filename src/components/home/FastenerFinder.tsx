'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  Search,
  RotateCcw,
  X,
  ArrowRight,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { Product } from '@/lib/types';
import { toTitleCase } from '@/lib/rfq-calculator';

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
  filterOptions?: FilterOptionsData | null;
  isLoading?: boolean;
}

const DEFAULT_STANDARDS = [
  'DIN 933',
  'DIN 931',
  'DIN 912',
  'DIN 934',
  'DIN 125',
  'DIN 6921',
  'DIN 603',
  'IS 3757',
  'ISO 4017',
  'ASTM A193 B7',
];

const DEFAULT_GRADES = [
  '4.6',
  '8.8',
  '10.9',
  '12.9',
  'SS 304 (A2-70)',
  'SS 316 (A4-80)',
  'ASTM A193 B7',
  'ASTM A194 2H',
];

const DEFAULT_DIAMETERS = [
  'M4',
  'M5',
  'M6',
  'M8',
  'M10',
  'M12',
  'M14',
  'M16',
  'M18',
  'M20',
  'M22',
  'M24',
  'M27',
  'M30',
  'M36',
  'M42',
  'M48',
];

const DEFAULT_LENGTHS = [
  10, 12, 16, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 90, 100, 110, 120, 130, 140, 150, 160, 180, 200, 250, 300,
];

const DEFAULT_FINISHES = [
  'Black Passivated (BP)',
  'Zinc Plated (ZP)',
  'Yellow Zinc (YZP)',
  'Hot Dip Galvanized (HDG)',
  'Stainless Steel (Plain)',
];

export default function FastenerFinder({
  onFilterChange,
  productsCount = 0,
  totalProductsCount = 0,
  filterOptions = null,
  isLoading = false,
}: FastenerFinderProps) {
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
    if (!filterOptions) {
      fetch('/api/products/paginated?limit=1')
        .then((res) => res.json())
        .then((data) => {
          if (data.filterOptions) {
            setInternalFilterOptions(data.filterOptions);
          }
        })
        .catch(() => {});
    }
  }, [filterOptions]);

  const activeOptions = filterOptions || internalFilterOptions;

  // 1. DYNAMIC CATEGORIES: Merge Master Catalog + Database Categories
  const dynamicCategories = useMemo(() => {
    const list: { key: string; name: string }[] = [
      { key: 'all', name: 'All Categories' },
      { key: 'HEX SCREWS', name: 'Hexagon Head Screws (DIN 933)' },
      { key: 'HEX BOLTS', name: 'Hex Bolts & Screws (DIN 931)' },
      { key: 'SOCKET HEAD', name: 'Socket Allen Screws (DIN 912)' },
      { key: 'HEX FLANGE BOLTS', name: 'Hex Flange & Frame Bolts' },
      { key: 'HSFG BOLTS', name: 'HSFG Structural Bolts (IS 3757)' },
      { key: 'CARRIAGE BOLTS', name: 'Carriage & Coach Bolts' },
      { key: 'NUTS', name: 'Hex Nuts & Lock Nuts (DIN 934)' },
      { key: 'WASHERS', name: 'Industrial Washers (Plain/Spring)' },
      { key: 'THREADED RODS', name: 'Threaded Rods & Studs' },
      { key: 'ROOFING BOLTS', name: 'Roofing & Cladding Bolts' },
      { key: 'ANTI THEFT BOLTS', name: 'Anti-Theft Security Bolts' },
      { key: 'surplus', name: '⚡ Surplus Lots (-60% Off)' },
    ];

    if (activeOptions?.categories) {
      activeOptions.categories.forEach((cat) => {
        const trimmed = cat.trim();
        if (!trimmed) return;
        const exists = list.some(
          (m) =>
            m.key.toLowerCase() === trimmed.toLowerCase() ||
            m.name.toLowerCase().includes(trimmed.toLowerCase())
        );
        if (!exists) {
          list.push({ key: trimmed, name: toTitleCase(trimmed) });
        }
      });
    }

    return list;
  }, [activeOptions]);

  // 2. DYNAMIC STANDARDS
  const dynamicStandards = useMemo(() => {
    const set = new Set<string>();
    if (activeOptions?.standards && activeOptions.standards.length > 0) {
      activeOptions.standards.forEach((s) => set.add(s.trim()));
    }
    DEFAULT_STANDARDS.forEach((s) => set.add(s));
    return Array.from(set).filter(Boolean).sort();
  }, [activeOptions]);

  // 3. DYNAMIC GRADES
  const dynamicGrades = useMemo(() => {
    const set = new Set<string>();
    if (activeOptions?.grades && activeOptions.grades.length > 0) {
      activeOptions.grades.forEach((g) => set.add(g.trim()));
    }
    DEFAULT_GRADES.forEach((g) => set.add(g));
    return Array.from(set).filter(Boolean).sort();
  }, [activeOptions]);

  // 4. DYNAMIC DIAMETERS (Naturally sorted: M4, M5, M6, M8, M10, M12...)
  const dynamicDiameters = useMemo(() => {
    const set = new Set<string>();
    if (activeOptions?.diameters && activeOptions.diameters.length > 0) {
      activeOptions.diameters.forEach((d) => set.add(d.trim()));
    }
    DEFAULT_DIAMETERS.forEach((d) => set.add(d));

    return Array.from(set)
      .filter(Boolean)
      .sort((a, b) => {
        const numA = parseFloat(a.replace(/[^0-9.]/g, '')) || 0;
        const numB = parseFloat(b.replace(/[^0-9.]/g, '')) || 0;
        return numA - numB;
      });
  }, [activeOptions]);

  // 5. DYNAMIC LENGTHS (Numerically sorted: 10, 12, 16, 20, 25...)
  const dynamicLengths = useMemo(() => {
    const set = new Set<number>();
    if (activeOptions?.lengths && activeOptions.lengths.length > 0) {
      activeOptions.lengths.forEach((l) => {
        const n = Number(l);
        if (!isNaN(n) && n > 0) set.add(n);
      });
    }
    DEFAULT_LENGTHS.forEach((l) => set.add(l));

    return Array.from(set).sort((a, b) => a - b);
  }, [activeOptions]);

  // 6. DYNAMIC FINISHES
  const dynamicFinishes = useMemo(() => {
    const set = new Set<string>();
    if (activeOptions?.finishes && activeOptions.finishes.length > 0) {
      activeOptions.finishes.forEach((f) => set.add(f.trim()));
    }
    DEFAULT_FINISHES.forEach((f) => set.add(f));
    return Array.from(set).filter(Boolean).sort();
  }, [activeOptions]);

  // Trigger parent filter change
  const applyFilters = useCallback(
    (overrides?: Partial<FastenerFilters>) => {
      const nextCat = overrides?.category ?? category;
      const nextStd = overrides?.standard ?? standard;
      const nextGrd = overrides?.grade ?? grade;
      const nextDia = overrides?.diameter ?? diameter;
      const nextLen = overrides?.length ?? length;
      const nextFin = overrides?.finish ?? finish;
      const nextStk = overrides?.inStockOnly ?? inStockOnly;

      const currentFilters: FastenerFilters = {
        tab: 'all',
        category: nextCat,
        standard: nextStd,
        grade: nextGrd,
        diameter: nextDia,
        length: nextLen,
        finish: nextFin,
        inStockOnly: nextStk,
      };
      onFilterChange(currentFilters);
    },
    [category, standard, grade, diameter, length, finish, inStockOnly, onFilterChange]
  );

  // Reset all filters
  const handleReset = () => {
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

  // Construct target link for /products catalog page
  const fullCatalogUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    if (standard && standard !== 'all') params.set('standard', standard);
    if (grade && grade !== 'all') params.set('grade', grade);
    if (diameter && diameter !== 'all') params.set('diameter', diameter);
    if (length && length !== 'all') params.set('length', length);
    if (finish && finish !== 'all') params.set('finish', finish);
    if (inStockOnly) params.set('inStockOnly', 'true');
    const qs = params.toString();
    return qs ? `/products?${qs}` : '/products';
  }, [category, standard, grade, diameter, length, finish, inStockOnly]);

  const hasActiveFilters =
    category !== 'all' ||
    standard !== 'all' ||
    grade !== 'all' ||
    diameter !== 'all' ||
    length !== 'all' ||
    finish !== 'all' ||
    inStockOnly;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-10">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-4 sm:p-5 md:p-6 transition-all">
        {/* Finder Header with Telemetry */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base md:text-lg font-black text-slate-900 tracking-tight leading-tight flex items-center gap-2 flex-wrap">
                <span>Find Fasteners by Size &amp; Type</span>
                <span className="text-blue-700 text-xs sm:text-sm font-bold">(साइज अनुसार खोजें)</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Precision technical parameters with instant factory dispatch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {/* Live Inventory Telemetry Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200 text-xs font-bold text-slate-700 font-mono shadow-2xs">
              {isLoading ? (
                <>
                  <Loader2 size={13} className="animate-spin text-blue-600" />
                  <span className="text-blue-700">Filtering Catalog...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    <strong className="text-slate-900">{productsCount.toLocaleString()}</strong> SKUs Active{' '}
                    <span className="text-slate-400 font-normal">
                      ({(totalProductsCount || 54392).toLocaleString()} Live)
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>


        {/* Active Filters Summary Strip */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 mb-3.5 bg-rose-50/70 border border-rose-200/80 rounded-xl">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-rose-800 tracking-wider mr-1">
                Filtered By:
              </span>
              {category !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-white border border-rose-300 text-rose-900 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                  Category: {dynamicCategories.find((c) => c.key === category)?.name || category}
                  <button
                    type="button"
                    onClick={() => {
                      setCategory('all');
                      applyFilters({ category: 'all' });
                    }}
                    className="hover:text-rose-600 ml-0.5 cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
              {standard !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-white border border-rose-300 text-rose-900 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                  Standard: {standard}
                  <button
                    type="button"
                    onClick={() => {
                      setStandard('all');
                      applyFilters({ standard: 'all' });
                    }}
                    className="hover:text-rose-600 ml-0.5 cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
              {grade !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-white border border-rose-300 text-rose-900 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                  Grade: {grade}
                  <button
                    type="button"
                    onClick={() => {
                      setGrade('all');
                      applyFilters({ grade: 'all' });
                    }}
                    className="hover:text-rose-600 ml-0.5 cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
              {diameter !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-white border border-rose-300 text-rose-900 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                  Dia: {diameter.toUpperCase()}
                  <button
                    type="button"
                    onClick={() => {
                      setDiameter('all');
                      applyFilters({ diameter: 'all' });
                    }}
                    className="hover:text-rose-600 ml-0.5 cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
              {length !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-white border border-rose-300 text-rose-900 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                  Length: {length}mm
                  <button
                    type="button"
                    onClick={() => {
                      setLength('all');
                      applyFilters({ length: 'all' });
                    }}
                    className="hover:text-rose-600 ml-0.5 cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
              {finish !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-white border border-rose-300 text-rose-900 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                  Finish: {finish}
                  <button
                    type="button"
                    onClick={() => {
                      setFinish('all');
                      applyFilters({ finish: 'all' });
                    }}
                    className="hover:text-rose-600 ml-0.5 cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 bg-white border border-rose-300 text-rose-900 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                  Live Stock Only
                  <button
                    type="button"
                    onClick={() => {
                      setInStockOnly(false);
                      applyFilters({ inStockOnly: false });
                    }}
                    className="hover:text-rose-600 ml-0.5 cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={fullCatalogUrl}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 hover:underline"
              >
                <span>View Full Catalog</span>
                <ArrowRight size={11} />
              </Link>
              <button
                type="button"
                className="text-[11px] font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 hover:underline cursor-pointer"
                onClick={handleReset}
              >
                <RotateCcw size={11} />
                <span>Reset All</span>
              </button>
            </div>
          </div>
        )}

        {/* 6-Field Fully Responsive Parametric Filter Grid */}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-[repeat(6,1fr)_120px] gap-2.5 sm:gap-3 items-end">
          {/* 1. Category */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Category</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => {
                  const val = e.target.value;
                  setCategory(val);
                  applyFilters({ category: val });
                }}
                className="w-full appearance-none pl-3 pr-7 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 focus:border-blue-600 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 shadow-2xs cursor-pointer truncate transition-all"
              >
                {dynamicCategories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* 2. Standard */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Standard</label>
            <div className="relative">
              <select
                value={standard}
                onChange={(e) => {
                  const val = e.target.value;
                  setStandard(val);
                  applyFilters({ standard: val });
                }}
                className="w-full appearance-none pl-3 pr-7 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 focus:border-blue-600 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 shadow-2xs cursor-pointer truncate transition-all"
              >
                <option value="all">All Standards ({dynamicStandards.length})</option>
                {dynamicStandards.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* 3. Grade */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Grade</label>
            <div className="relative">
              <select
                value={grade}
                onChange={(e) => {
                  const val = e.target.value;
                  setGrade(val);
                  applyFilters({ grade: val });
                }}
                className="w-full appearance-none pl-3 pr-7 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 focus:border-blue-600 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 shadow-2xs cursor-pointer truncate transition-all"
              >
                <option value="all">All Grades ({dynamicGrades.length})</option>
                {dynamicGrades.map((g) => {
                  const label = g.toUpperCase().startsWith('GRADE') ? g : `Grade ${g}`;
                  return (
                    <option key={g} value={g}>
                      {label}
                    </option>
                  );
                })}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* 4. Diameter (d) */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Diameter (d)</label>
            <div className="relative">
              <select
                value={diameter}
                onChange={(e) => {
                  const val = e.target.value;
                  setDiameter(val);
                  applyFilters({ diameter: val });
                }}
                className="w-full appearance-none pl-3 pr-7 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 focus:border-blue-600 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 shadow-2xs cursor-pointer truncate transition-all"
              >
                <option value="all">All Diameters ({dynamicDiameters.length})</option>
                {dynamicDiameters.map((d) => (
                  <option key={d} value={d}>
                    {d.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* 5. Length (L) */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Length (L)</label>
            <div className="relative">
              <select
                value={length}
                onChange={(e) => {
                  const val = e.target.value;
                  setLength(val);
                  applyFilters({ length: val });
                }}
                className="w-full appearance-none pl-3 pr-7 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 focus:border-blue-600 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 shadow-2xs cursor-pointer truncate transition-all"
              >
                <option value="all">All Lengths ({dynamicLengths.length})</option>
                {dynamicLengths.map((l) => (
                  <option key={l} value={String(l)}>
                    {l} mm
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* 6. Coating / Finish */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Coating / Finish</label>
            <div className="relative">
              <select
                value={finish}
                onChange={(e) => {
                  const val = e.target.value;
                  setFinish(val);
                  applyFilters({ finish: val });
                }}
                className="w-full appearance-none pl-3 pr-7 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 focus:border-blue-600 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 shadow-2xs cursor-pointer truncate transition-all"
              >
                <option value="all">All Coatings ({dynamicFinishes.length})</option>
                {dynamicFinishes.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* 7. Filter Action Button (Responsive across all screens) */}
          <div className="col-span-2 sm:col-span-3 xl:col-span-1 min-w-0">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[42px] rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-98 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              title="Filter and show matching fasteners in catalog"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Filter</span>
                  <Search size={15} className="stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
