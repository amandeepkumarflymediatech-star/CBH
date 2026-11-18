'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import MainHeader from '@/components/header/MainHeader';
import CartDrawer from '@/components/cart/CartDrawer';
import { Product, GlobalUnit, RfqLineItem } from '@/lib/types';
import { formatINR, clampQty, formatQtyDisplay, getMinQty, MIN_QTY_PCS, MIN_QTY_KGS, toTitleCase } from '@/lib/rfq-calculator';
import { getStoredCart, setStoredCart } from '@/lib/cart';
import {
  Search,
  CheckCircle2,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
  SlidersHorizontal,
  X,
  Plus,
  HelpCircle,
  Link2,
  PackageCheck,
  Compass,
  Check,
  Ruler,
  Tag,
  RotateCcw,
  ChevronDown,
  LayoutGrid
} from 'lucide-react';
import CustomProductRequestModal from '@/components/common/CustomProductRequestModal';

// ============================================================================
// SEARCH QUERY PARSER & ATTRIBUTE DETECTOR
// ============================================================================

interface DetectedFastenerAttributes {
  rawQuery: string;
  cleanQuery: string;
  tokens: string[];
  diameter?: string;
  lengthMm?: number;
  standard?: string;
  grade?: string;
  finish?: string;
  category?: string;
}

function parseFastenerQuery(query: string): DetectedFastenerAttributes {
  const rawQuery = (query || '').trim();
  if (!rawQuery) {
    return { rawQuery: '', cleanQuery: '', tokens: [] };
  }

  // Normalize common variations:
  // "DIN-933" -> "DIN 933", "ISO-4017" -> "ISO 4017", "M 10" -> "M10"
  let clean = rawQuery
    .replace(/DIN[-\s]?(\d{3,4})/gi, 'DIN $1')
    .replace(/ISO[-\s]?(\d{4,5})/gi, 'ISO $1')
    .replace(/\bM\s*(\d{1,2})\b/gi, 'M$1')
    .replace(/,/g, ' ')
    .replace(/[()]/g, ' ')
    .trim();

  const tokens = clean
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  let diameter: string | undefined;
  let lengthMm: number | undefined;
  let standard: string | undefined;
  let grade: string | undefined;
  let finish: string | undefined;
  let category: string | undefined;

  // 1. Diameter (e.g. M4..M48, 1/4", 1/2", 3/4", 1")
  const diaMatch = clean.match(/\b(M\d{1,2}|(?:\d+\/)?\d+["'])\b/i);
  if (diaMatch) {
    diameter = diaMatch[1].toUpperCase();
  }

  // 2. Length (e.g. M10X50, M12x75, 50mm, or x 50)
  const lengthMatch = clean.match(/(?:x|\*|\s)\s*(\d{2,3})(?:mm)?\b/i) || clean.match(/\b(\d{2,3})mm\b/i);
  if (lengthMatch) {
    lengthMm = parseInt(lengthMatch[1], 10);
  }

  // 3. Standard
  const stdMatch = clean.match(/\b(DIN\s*\d{3,4}|ISO\s*\d{4,5}|ASTM\s*[A-Z0-9]+|ASME\s*[A-Z0-9.]+)\b/i);
  if (stdMatch) {
    standard = stdMatch[1].toUpperCase();
  }

  // 4. Grade
  const gradeMatch = clean.match(/\b(4\.6|8\.8|10\.9|12\.9|SS\s*304|SS\s*316|304|316|A2-70|A4-80|A2|A4|B7)\b/i);
  if (gradeMatch) {
    grade = gradeMatch[1].toUpperCase();
  }

  // 5. Finish
  const finishMatch = clean.match(/\b(zinc|wzp|yzp|hdg|galvanized|galvanised|black|bp|passivated|geomet|dacromet)\b/i);
  if (finishMatch) {
    finish = finishMatch[1].toLowerCase();
  }

  // 6. Category
  if (/\b(nut|nuts)\b/i.test(clean)) category = 'Hex Nuts';
  else if (/\b(washer|washers)\b/i.test(clean)) category = 'Washers';
  else if (/\b(socket|cap)\b/i.test(clean)) category = 'Socket Caps';
  else if (/\b(flange)\b/i.test(clean)) category = 'HEX FLANGE BOLTS';
  else if (/\b(bolt|screw)\b/i.test(clean)) category = 'Hex Screws';

  return {
    rawQuery,
    cleanQuery: clean,
    tokens,
    diameter,
    lengthMm,
    standard,
    grade,
    finish,
    category,
  };
}

// ============================================================================
// PRODUCT CARD COMPONENT
// ============================================================================

interface FastenerCardProps {
  product: Product;
  currentUnit: GlobalUnit;
  currentQty: number;
  onToggleUnit: (u: GlobalUnit) => void;
  onAdjustQty: (delta: number) => void;
  onAddToCart: (p: Product) => void;
  relatedBadge?: string;
  badgeTone?: 'blue' | 'amber' | 'emerald' | 'purple';
}

function FastenerCard({
  product: p,
  currentUnit,
  currentQty,
  onToggleUnit,
  onAdjustQty,
  onAddToCart,
  relatedBadge,
  badgeTone = 'blue',
}: FastenerCardProps) {
  const currentPrice = currentUnit === 'PCS' ? p.pricePerPiece : p.pricePerKg;
  const pcsPerBox = Math.round(Number(p.pcsPerBox)) || 500;
  const leadDays = p.leadTimeDays || 10;

  const toneClass = {
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
  }[badgeTone];

  return (
    <div
      className={`bg-white rounded-2xl border ${
        p.isSurplus
          ? 'border-amber-300 ring-1 ring-amber-200'
          : relatedBadge
          ? 'border-blue-200 shadow-xs'
          : 'border-slate-200/90'
      } p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 relative h-full`}
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

        {/* Optional Related Reason Badge */}
        {relatedBadge && (
          <div className={`mb-2 px-2 py-1 rounded-md text-[10px] font-extrabold border ${toneClass} flex items-center gap-1 leading-tight`}>
            <Sparkles size={11} className="shrink-0" />
            <span className="truncate">{relatedBadge}</span>
          </div>
        )}

        {/* Product Image */}
        <Link href={`/product/${p.id}`} className="block text-center my-1.5 group">
          <div className="relative w-full h-28 sm:h-32 bg-white rounded-lg p-2 transition-transform group-hover:scale-102 duration-200">
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
            {/* CBH Brand Watermark - Transparent & Center */}
            <div
              className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 select-none"
              style={{ opacity: 0.28 }}
            >
              <img
                src="/assets/cbh-watermark.png"
                alt=""
                className="w-16 sm:w-20 max-w-[55%] h-auto object-contain"
                style={{ filter: 'drop-shadow(0 1px 4px rgba(0, 0, 0, 0.12))' }}
              />
            </div>
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
            {toTitleCase(p.name)}
          </Link>
        </h3>

        {/* Packaging, Lead & Finish - 3-Column Micro Strip (Never wraps) */}
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
            <span className="text-base sm:text-lg font-black text-blue-700 font-mono">
              {formatINR(currentPrice)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200/60">
            <span className="whitespace-nowrap">
              Alt: <strong className="text-slate-700">{formatINR(currentUnit === 'PCS' ? p.pricePerKg : p.pricePerPiece)}</strong>/{currentUnit === 'PCS' ? 'kg' : 'pc'}
            </span>
            <span className="whitespace-nowrap text-slate-400">
              {(p.weightPerPcKg * 1000).toFixed(1)}g/pc
            </span>
          </div>
        </div>

        {/* Procurement Configurator (Full Width Stacked - Zero Overflow) */}
        <div className="space-y-1.5">
          {/* Segmented Unit Selector */}
          <div className="grid grid-cols-2 bg-slate-100 p-0.5 rounded-lg text-xs font-bold border border-slate-200/60">
            <button
              type="button"
              disabled={currentUnit === 'PCS'}
              onClick={() => {
                if (currentUnit !== 'PCS') {
                  onToggleUnit('PCS');
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
                  onToggleUnit('KGS');
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
              onClick={() => onAdjustQty(-1)}
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
              onClick={() => onAdjustQty(1)}
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
          onClick={() => onAddToCart(p)}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 sm:py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
        >
          <ShoppingCart size={14} />
          <span>Add to RFQ Quote</span>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MASTER CATALOG CATEGORIES (OFFICIAL CBH FASTENER FAMILIES)
// ============================================================================

interface CategoryOption {
  key: string;
  name: string;
  shortName: string;
  badge?: string;
}

const MASTER_CATEGORIES: CategoryOption[] = [
  { key: 'HEX BOLTS', name: 'Hex Bolts & Screws', shortName: 'Hex Bolts', badge: 'DIN 931/933' },
  { key: 'HEX SCREWS', name: 'Hexagon Head Screws', shortName: 'Hex Screws', badge: '16k+ Sizes' },
  { key: 'SOCKET HEAD', name: 'Socket Allen Screws', shortName: 'Socket/Allen', badge: 'Grade 12.9' },
  { key: 'HSFG BOLTS', name: 'HSFG Structural Bolts', shortName: 'HSFG Structural', badge: 'IS 3757' },
  { key: 'CARRIAGE BOLTS', name: 'Carriage & Coach Bolts', shortName: 'Carriage', badge: 'DIN 603' },
  { key: 'HEX FLANGE BOLTS', name: 'Hex Flange & Frame Bolts', shortName: 'Flange Bolts', badge: 'DIN 6921' },
  { key: 'THREADED RODS', name: 'Threaded Rods & Studs', shortName: 'Threaded Rods', badge: 'ASTM B7' },
  { key: 'NUTS', name: 'Hex Nuts & Lock Nuts', shortName: 'Hex & Lock Nuts', badge: 'DIN 934' },
  { key: 'WASHERS', name: 'Industrial Washers', shortName: 'Washers', badge: 'Plain/Spring' },
  { key: 'ROOFING BOLTS', name: 'Roofing & Cladding Bolts', shortName: 'Roofing Bolts', badge: 'Mushroom' },
  { key: 'ANTI THEFT BOLTS', name: 'Anti-Theft Security Bolts', shortName: 'Anti-Theft', badge: 'Tamper-Proof' },
];

// ============================================================================
// MAIN INNER CATALOG COMPONENT (CONSUMES URL SEARCH PARAMS)
// ============================================================================

function ProductsPageInner() {
  const searchParams = useSearchParams();

  const [globalUnit, setGlobalUnit] = useState<GlobalUnit>('PCS');
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [relatedProducts, setRelatedProducts] = useState<
    { product: Product; reason: string; tone: 'blue' | 'amber' | 'emerald' | 'purple' }[]
  >([]);
  const [filterOptions, setFilterOptions] = useState<{
    categories?: string[];
    standards: string[];
    grades: string[];
    finishes: string[];
    diameters: string[];
  }>({
    categories: [],
    standards: [],
    grades: [],
    finishes: [],
    diameters: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomRequestOpen, setIsCustomRequestOpen] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStandard, setSelectedStandard] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedFinish, setSelectedFinish] = useState('all');
  const [selectedDiameter, setSelectedDiameter] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'stock_desc'>('featured');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [autoRelaxedInfo, setAutoRelaxedInfo] = useState<{
    type: 'category' | 'subfilter';
    message: string;
    originalCategory?: string;
  } | null>(null);

  // Category Carousel & Modal States
  const [isAllCategoriesModalOpen, setIsAllCategoriesModalOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const categoryTrackRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Show all related products toggle when search has direct matches
  const [showAllRelated, setShowAllRelated] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Card Unit & Quantity Overrides
  const [cardUnits, setCardUnits] = useState<{ [id: number]: GlobalUnit }>({});
  const [cardQtys, setCardQtys] = useState<{ [id: number]: number }>({});

  // Cart State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<RfqLineItem[]>([]);

  // Hydrate cart from storage and sync across tabs/pages
  useEffect(() => {
    setCartItems(getStoredCart());
    const onCartChange = (e: any) => {
      if (e.detail?.items) setCartItems(e.detail.items);
    };
    window.addEventListener('cbh_cart_change', onCartChange);
    return () => window.removeEventListener('cbh_cart_change', onCartChange);
  }, []);

  // Sync state from URL query parameters on load / update
  // Unconditionally synchronizes all filter states to the current URL searchParams
  // This completely eliminates ghost filters when switching categories or subcategories
  useEffect(() => {
    const q = searchParams.get('search') || searchParams.get('q') || '';
    setSearchQuery(q);

    const cat = searchParams.get('category') || 'all';
    setSelectedCategory(cat);

    const std = searchParams.get('standard') || 'all';
    setSelectedStandard(std);

    const grd = searchParams.get('grade') || 'all';
    setSelectedGrade(grd);

    const dia = searchParams.get('diameter') || 'all';
    setSelectedDiameter(dia);

    const fin = searchParams.get('finish') || 'all';
    setSelectedFinish(fin);

    const inStock = searchParams.get('inStockOnly') === 'true';
    setInStockOnly(inStock);

    setCurrentPage(1);
  }, [searchParams]);

  // Debounce search query to prevent excessive queries while typing
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearch,
    selectedCategory,
    selectedStandard,
    selectedGrade,
    selectedFinish,
    selectedDiameter,
    inStockOnly,
    sortBy,
    itemsPerPage,
  ]);

  // Fetch paginated products from separate /api/products/paginated endpoint
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
      });

      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedStandard && selectedStandard !== 'all') params.set('standard', selectedStandard);
      if (selectedGrade && selectedGrade !== 'all') params.set('grade', selectedGrade);
      if (selectedDiameter && selectedDiameter !== 'all') params.set('diameter', selectedDiameter);
      if (selectedFinish && selectedFinish !== 'all') params.set('finish', selectedFinish);
      if (inStockOnly) params.set('inStockOnly', 'true');
      if (sortBy && sortBy !== 'featured') params.set('sortBy', sortBy);

      const res = await fetch(`/api/products/paginated?${params.toString()}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
        setTotalCount(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
        setAutoRelaxedInfo(data.autoRelaxed || null);
        if (data.filterOptions) {
          setFilterOptions(data.filterOptions);
        }
        if (Array.isArray(data.relatedProducts)) {
          setRelatedProducts(data.relatedProducts);
        } else {
          setRelatedProducts([]);
        }
      }
    } catch (err) {
      console.error('Failed fetching paginated products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearch,
    selectedCategory,
    selectedStandard,
    selectedGrade,
    selectedDiameter,
    selectedFinish,
    inStockOnly,
    sortBy,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Parsed Search Attributes
  const parsedSearch = useMemo(() => {
    return parseFastenerQuery(searchQuery);
  }, [searchQuery]);

  // Page Numbers generator
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  // Unit and Qty Helpers with strict MOQ compliance
  const handleGlobalUnitChange = (u: GlobalUnit) => {
    if (u === globalUnit) return;
    setGlobalUnit(u);
    setCardUnits({});
    setCardQtys({});
  };

  const getCardUnit = (id: number): GlobalUnit => cardUnits[id] || globalUnit;
  const getCardQty = (id: number): number => {
    const u = getCardUnit(id);
    if (cardQtys[id] !== undefined) return cardQtys[id];
    return u === 'PCS' ? MIN_QTY_PCS : MIN_QTY_KGS;
  };

  const toggleCardUnit = (id: number, u: GlobalUnit) => {
    // Prevent trigger if unit is already active (preserves user adjusted quantity)
    if (getCardUnit(id) === u) return;
    setCardUnits((prev) => ({ ...prev, [id]: u }));
    setCardQtys((prev) => ({ ...prev, [id]: u === 'PCS' ? MIN_QTY_PCS : MIN_QTY_KGS }));
  };

  const adjustCardQty = (id: number, delta: number) => {
    const u = getCardUnit(id);
    const current = getCardQty(id);
    if (u === 'KGS') {
      if (delta < 0) {
        if (current <= MIN_QTY_KGS) return;
        const step = current <= 1 ? 0.25 : 0.5;
        const next = Math.max(MIN_QTY_KGS, Math.round((current - step) * 100) / 100);
        setCardQtys((prev) => ({ ...prev, [id]: next }));
      } else {
        const step = current < 1 ? 0.25 : 0.5;
        const next = Math.round((current + step) * 100) / 100;
        setCardQtys((prev) => ({ ...prev, [id]: next }));
      }
    } else {
      if (delta < 0) {
        if (current <= MIN_QTY_PCS) return;
        const step = current > 1000 ? 500 : 100;
        const next = Math.max(MIN_QTY_PCS, current - step);
        setCardQtys((prev) => ({ ...prev, [id]: next }));
      } else {
        const step = current >= 1000 ? 500 : 100;
        setCardQtys((prev) => ({ ...prev, [id]: current + step }));
      }
    }
  };

  // Add To Quote Cart
  const handleAddToCart = (product: Product) => {
    const unit = getCardUnit(product.id);
    const rawQty = getCardQty(product.id);
    const qty = clampQty(rawQty, unit);
    const rate = unit === 'PCS' ? product.pricePerPiece : product.pricePerKg;
    const weight = unit === 'PCS' ? qty * (product.weightPerPcKg || 0.05) : qty;

    const existingIndex = cartItems.findIndex((it) => it.sku === product.sku && it.unit === unit);
    setCartItems((prev) => {
      let updated: RfqLineItem[];
      if (existingIndex > -1) {
        updated = [...prev];
        const nextQty = updated[existingIndex].quantity + qty;
        const nextWeight = unit === 'PCS' ? nextQty * (product.weightPerPcKg || 0.05) : nextQty;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: nextQty,
          totalWeightKg: nextWeight,
          rowTotal: nextQty * rate,
        };
      } else {
        const newItem: RfqLineItem = {
          id: Date.now(),
          productId: product.id,
          sku: product.sku,
          name: product.name,
          standard: product.standard,
          unit,
          unitRate: rate,
          quantity: qty,
          weightPerPcKg: product.weightPerPcKg || 0.05,
          totalWeightKg: weight,
          rowTotal: qty * rate,
        };
        updated = [newItem, ...prev];
      }
      setStoredCart(updated);
      return updated;
    });

    setIsCartOpen(true);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStandard('all');
    setSelectedGrade('all');
    setSelectedFinish('all');
    setSelectedDiameter('all');
    setInStockOnly(false);
    setSortBy('featured');
    setAutoRelaxedInfo(null);
    setCurrentPage(1);
    setIsFilterDrawerOpen(false);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/products');
    }
  };

  const activeFilterCount =
    (searchQuery !== '' ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedStandard !== 'all' ? 1 : 0) +
    (selectedGrade !== 'all' ? 1 : 0) +
    (selectedFinish !== 'all' ? 1 : 0) +
    (selectedDiameter !== 'all' ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

  // Dynamic specification options from database
  const dynamicDiameters = filterOptions.diameters || [];
  const dynamicGrades = filterOptions.grades || [];
  const dynamicStandards = filterOptions.standards || [];
  const dynamicFinishes = filterOptions.finishes || [];
  const dynamicCategories = filterOptions.categories || [];

  // Master + Dynamic Categories merge (Official catalog families + dynamic DB categories)
  const allCategoryOptions = useMemo<CategoryOption[]>(() => {
    const list: CategoryOption[] = [...MASTER_CATEGORIES];
    dynamicCategories.forEach((cat) => {
      const trimmed = cat.trim();
      if (!trimmed) return;
      const lower = trimmed.toLowerCase();
      const alreadyExists = list.some(
        (m) =>
          m.key.toLowerCase() === lower ||
          m.name.toLowerCase() === lower ||
          m.shortName.toLowerCase() === lower ||
          m.key.toLowerCase().includes(lower) ||
          lower.includes(m.key.toLowerCase())
      );
      if (!alreadyExists) {
        list.push({
          key: trimmed,
          name: toTitleCase(trimmed),
          shortName: toTitleCase(trimmed),
        });
      }
    });
    return list;
  }, [dynamicCategories]);

  const isCategoryActive = useCallback(
    (key: string) => {
      if (!selectedCategory || selectedCategory === 'all') return false;
      const sel = selectedCategory.trim().toLowerCase();
      const target = key.trim().toLowerCase();
      if (sel === target) return true;
      if (sel.replace(/\s+/g, ' ') === target.replace(/\s+/g, ' ')) return true;
      return false;
    },
    [selectedCategory]
  );

  const getCategoryLabel = useCallback(
    (catKey: string) => {
      if (catKey === 'all') return 'All Fasteners';
      if (catKey === 'surplus') return 'Surplus Deals (-60%)';
      const matched = allCategoryOptions.find(
        (c) => isCategoryActive(c.key) || c.key.toLowerCase() === catKey.toLowerCase()
      );
      return matched ? matched.name : catKey;
    },
    [allCategoryOptions, isCategoryActive]
  );

  const handleCategorySelect = (key: string) => {
    const nextCategory = isCategoryActive(key) ? 'all' : key;
    setSelectedCategory(nextCategory);
    // When switching category on the page, automatically clear conflicting sub-filters so zero ghost dead-ends occur
    setSelectedStandard('all');
    setSelectedDiameter('all');
    setSelectedGrade('all');
    setSelectedFinish('all');
    setSearchQuery('');
    setCurrentPage(1);
    if (isAllCategoriesModalOpen) {
      setIsAllCategoriesModalOpen(false);
    }
    if (typeof window !== 'undefined') {
      const url = nextCategory !== 'all' ? `/products?category=${encodeURIComponent(nextCategory)}` : '/products';
      window.history.pushState({}, '', url);
    }
  };

  const checkTrackScroll = useCallback(() => {
    const el = categoryTrackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  const handleTrackScroll = (direction: 'left' | 'right') => {
    const el = categoryTrackRef.current;
    if (!el) return;
    const scrollAmount = Math.max(240, Math.floor(el.clientWidth * 0.75));
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const el = categoryTrackRef.current;
    if (!el) return;
    checkTrackScroll();
    el.addEventListener('scroll', checkTrackScroll, { passive: true });
    window.addEventListener('resize', checkTrackScroll);
    return () => {
      el.removeEventListener('scroll', checkTrackScroll);
      window.removeEventListener('resize', checkTrackScroll);
    };
  }, [checkTrackScroll, allCategoryOptions]);

  // Auto-scroll active category button into view when selected
  useEffect(() => {
    if (!categoryTrackRef.current || selectedCategory === 'all') return;
    const activeEl = categoryTrackRef.current.querySelector<HTMLElement>('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedCategory]);

  const quickDiameters = dynamicDiameters.slice(0, 6);
  const quickGrades = dynamicGrades.slice(0, 6);
  const quickStandards = dynamicStandards.slice(0, 6);
  const quickFinishes = dynamicFinishes.slice(0, 6);
  const quickCategories = allCategoryOptions.slice(0, 6);

  const hasFilterSpecifications =
    allCategoryOptions.length > 0 ||
    dynamicDiameters.length > 0 ||
    dynamicGrades.length > 0 ||
    dynamicStandards.length > 0 ||
    dynamicFinishes.length > 0;

  // Render Filter Form Content
  const renderFilterControls = () => (
    <div className="space-y-4">
      {/* Active Filter Pills Strip */}
      {hasActiveFilters && (
        <div className="bg-blue-50/80 border border-blue-200/90 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-blue-900 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Applied Filters ({activeFilterCount})
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="text-[10px] font-bold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1"
            >
              <RotateCcw size={10} />
              Reset All
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-blue-200 text-blue-900 text-xs font-bold shadow-xs">
                <Search size={11} className="text-blue-600" />
                &ldquo;{searchQuery}&rdquo;
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-rose-600 ml-0.5 p-0.5 rounded cursor-pointer"
                  title="Remove search query"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-blue-200 text-blue-900 text-xs font-bold shadow-xs">
                <Layers size={11} className="text-blue-600" />
                {getCategoryLabel(selectedCategory)}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="hover:text-rose-600 ml-0.5 p-0.5 rounded cursor-pointer"
                  title="Remove category filter"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {selectedDiameter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-blue-200 text-blue-900 text-xs font-bold shadow-xs">
                <Ruler size={11} className="text-blue-600" />
                {selectedDiameter}
                <button
                  type="button"
                  onClick={() => setSelectedDiameter('all')}
                  className="hover:text-rose-600 ml-0.5 p-0.5 rounded cursor-pointer"
                  title="Remove diameter filter"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {selectedStandard !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-blue-200 text-blue-900 text-xs font-bold shadow-xs">
                <Tag size={11} className="text-blue-600" />
                {selectedStandard}
                <button
                  type="button"
                  onClick={() => setSelectedStandard('all')}
                  className="hover:text-rose-600 ml-0.5 p-0.5 rounded cursor-pointer"
                  title="Remove standard filter"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {selectedGrade !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-blue-200 text-blue-900 text-xs font-bold shadow-xs">
                <ShieldCheck size={11} className="text-blue-600" />
                {selectedGrade}
                <button
                  type="button"
                  onClick={() => setSelectedGrade('all')}
                  className="hover:text-rose-600 ml-0.5 p-0.5 rounded cursor-pointer"
                  title="Remove grade filter"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {selectedFinish !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-blue-200 text-blue-900 text-xs font-bold shadow-xs">
                <Sparkles size={11} className="text-blue-600" />
                {selectedFinish}
                <button
                  type="button"
                  onClick={() => setSelectedFinish('all')}
                  className="hover:text-rose-600 ml-0.5 p-0.5 rounded cursor-pointer"
                  title="Remove finish filter"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-xs">
                <Zap size={11} className="text-emerald-600" />
                In Stock Only
                <button
                  type="button"
                  onClick={() => setInStockOnly(false)}
                  className="hover:text-rose-600 ml-0.5 p-0.5 rounded cursor-pointer"
                  title="Remove in-stock filter"
                >
                  <X size={11} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Ready Dispatch In-Stock Toggle */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setInStockOnly(!inStockOnly)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setInStockOnly(!inStockOnly);
          }
        }}
        className={`group relative p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between ${
          inStockOnly
            ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
            : 'bg-slate-50 hover:bg-slate-100/90 border-slate-200/90'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
              inStockOnly
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-200 text-slate-500 group-hover:text-slate-700'
            }`}
          >
            <Zap size={15} />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>Ready Dispatch Only</span>
              {inStockOnly && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800">
                  Live Stock
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Pan-India 24-48h dispatch</p>
          </div>
        </div>

        {/* Animated Switch Pill */}
        <div
          className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 p-0.5 ${
            inStockOnly ? 'bg-emerald-600' : 'bg-slate-300'
          }`}
        >
          <div
            className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              inStockOnly ? 'translate-x-4.5' : 'translate-x-0'
            }`}
          />
        </div>
      </div>

      {!hasFilterSpecifications && !isLoading ? (
        <div className="text-center py-6 px-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <SlidersHorizontal className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-600">No filter specifications available</p>
          <p className="text-[10px] text-slate-400 mt-1">Filters will appear dynamically as products are added to the database.</p>
        </div>
      ) : (
        <>
          {/* Category Filter */}
          {allCategoryOptions.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                  <Layers size={13} className="text-blue-600" />
                  <span>Category</span>
                </label>
                {selectedCategory !== 'all' && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    {getCategoryLabel(selectedCategory)}
                  </span>
                )}
              </div>

              {/* Quick Category Chips */}
              {quickCategories.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5">
                  {quickCategories.map((c) => {
                    const isSelected = isCategoryActive(c.key);
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => handleCategorySelect(c.key)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center border cursor-pointer truncate ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200/90'
                        }`}
                        title={c.name}
                      >
                        {c.shortName}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* All Categories Dropdown */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    const nextCat = e.target.value;
                    setSelectedCategory(nextCat);
                    setSelectedStandard('all');
                    setSelectedDiameter('all');
                    setSelectedGrade('all');
                    setSelectedFinish('all');
                    setSearchQuery('');
                    setCurrentPage(1);
                    if (typeof window !== 'undefined') {
                      const url = nextCat !== 'all' ? `/products?category=${encodeURIComponent(nextCat)}` : '/products';
                      window.history.pushState({}, '', url);
                    }
                  }}
                  className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all cursor-pointer"
                >
                  <option value="all">
                    All Categories ({allCategoryOptions.length} Families)
                  </option>
                  {allCategoryOptions.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.name}
                    </option>
                  ))}
                  <option value="surplus">⚡ Surplus Deals (-60% Off)</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>
          )}

          {/* 1. Metric Diameter */}
          {dynamicDiameters.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                  <Ruler size={13} className="text-blue-600" />
                  <span>Metric Diameter (Size)</span>
                </label>
                {selectedDiameter !== 'all' && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    {selectedDiameter}
                  </span>
                )}
              </div>

              {/* Quick Diameter Chips */}
              {quickDiameters.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {quickDiameters.map((d) => {
                    const isSelected = selectedDiameter.toUpperCase() === d.toUpperCase();
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDiameter(isSelected ? 'all' : d)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center border cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200/90'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* All Diameters Dropdown */}
              <div className="relative">
                <select
                  value={selectedDiameter}
                  onChange={(e) => setSelectedDiameter(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all cursor-pointer"
                >
                  <option value="all">
                    All Metric Diameters ({dynamicDiameters.length} Sizes)
                  </option>
                  {dynamicDiameters.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>
          )}

          {/* 2. Property Class / Grade */}
          {dynamicGrades.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-blue-600" />
                  <span>Grade & Tensile Strength</span>
                </label>
                {selectedGrade !== 'all' && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    {selectedGrade}
                  </span>
                )}
              </div>

              {/* Quick Grade Chips */}
              {quickGrades.length > 0 && (
                <div className="grid grid-cols-3 gap-1.5">
                  {quickGrades.map((g) => {
                    const isSelected = selectedGrade.toLowerCase() === g.toLowerCase();
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setSelectedGrade(isSelected ? 'all' : g)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center border cursor-pointer truncate ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200/90'
                        }`}
                        title={g}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* All Grades Dropdown */}
              <div className="relative">
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all cursor-pointer"
                >
                  <option value="all">
                    All Property Classes ({dynamicGrades.length} Grades)
                  </option>
                  {dynamicGrades.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>
          )}

          {/* 3. Fastener Standard */}
          {dynamicStandards.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                  <Tag size={13} className="text-blue-600" />
                  <span>Standard (DIN / ISO / IS)</span>
                </label>
                {selectedStandard !== 'all' && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    {selectedStandard}
                  </span>
                )}
              </div>

              {/* Quick Standard Chips */}
              {quickStandards.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5">
                  {quickStandards.map((s) => {
                    const isSelected = selectedStandard.toLowerCase() === s.toLowerCase();
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedStandard(isSelected ? 'all' : s)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center border cursor-pointer truncate ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200/90'
                        }`}
                        title={s}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* All Standards Dropdown */}
              <div className="relative">
                <select
                  value={selectedStandard}
                  onChange={(e) => setSelectedStandard(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all cursor-pointer"
                >
                  <option value="all">
                    All Standards ({dynamicStandards.length} Standards)
                  </option>
                  {dynamicStandards.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>
          )}

          {/* 4. Surface Coating / Finish */}
          {dynamicFinishes.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-blue-600" />
                  <span>Surface Coating / Finish</span>
                </label>
                {selectedFinish !== 'all' && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    {selectedFinish}
                  </span>
                )}
              </div>

              {/* Quick Finish Chips */}
              {quickFinishes.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5">
                  {quickFinishes.map((f) => {
                    const isSelected = selectedFinish.toLowerCase() === f.toLowerCase();
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setSelectedFinish(isSelected ? 'all' : f)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center border cursor-pointer truncate ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200/90'
                        }`}
                        title={f}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* All Finishes Dropdown */}
              <div className="relative">
                <select
                  value={selectedFinish}
                  onChange={(e) => setSelectedFinish(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all cursor-pointer"
                >
                  <option value="all">
                    All Coatings ({dynamicFinishes.length} Finishes)
                  </option>
                  {dynamicFinishes.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col antialiased">
      <MainHeader
        unit={globalUnit}
        onUnitToggle={handleGlobalUnitChange}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* ============================================================== */}
      {/* HERO BANNER & SEARCH                                           */}
      {/* ============================================================== */}
      <section className="bg-gradient-to-br from-[#0A192F] via-[#0F2A4A] to-[#0052CC] text-white py-6 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-300 mb-3 sm:mb-4 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={13} className="text-slate-400 shrink-0" />
            <span className="text-[#FF6B00] font-bold">Fasteners Catalog</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold mb-3 border border-white/15">
                <ShieldCheck size={14} className="text-[#FF6B00]" />
                <span className="tracking-wide">Direct Factory Wholesale • 100% BIS / NABL Certified</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                All Nuts, Bolts &amp; Fasteners <span className="text-[#FF6B00]">(सभी नट-बोल्ट)</span>
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
                Direct factory supply of high-tensile Hex Bolts, Hex Nuts, Socket Cap Fasteners, Washers and Anchors. Order in <strong>Pieces (Pcs)</strong> or <strong>Kilograms (Kg)</strong> with fast doorstep delivery across India.
              </p>
            </div>

            {/* Global Pricing Unit Switcher */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3.5 sm:p-4 self-start lg:self-center shrink-0 w-full sm:w-auto sm:min-w-[240px]">
              <span className="text-[11px] text-slate-300 font-bold block mb-2">
                Procurement Pricing Unit:
              </span>
              <div className="flex bg-black/30 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleGlobalUnitChange('PCS')}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all text-center ${
                    globalUnit === 'PCS'
                      ? 'bg-[#FF6B00] text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Pieces (Pcs)
                </button>
                <button
                  type="button"
                  onClick={() => handleGlobalUnitChange('KGS')}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all text-center ${
                    globalUnit === 'KGS'
                      ? 'bg-[#FF6B00] text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Kilograms (Kg)
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 sm:mt-6 relative max-w-3xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, SKU, Standard (DIN 933), Diameter (M10), Grade (8.8), or Finish..."
              className="w-full pl-11 pr-10 py-3 sm:py-3.5 rounded-xl border border-white/20 bg-white text-slate-900 text-xs sm:text-sm placeholder-slate-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-200 hover:bg-slate-300 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                title="Clear search"
              >
                <X size={13} className="text-slate-600" />
              </button>
            )}
          </div>

          {/* Quick search hints */}
          <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] text-blue-200 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-300">Popular searches:</span>
              {['Hex Bolt M10', 'DIN 933 8.8', 'Socket Cap M8', 'DIN 934 Nut M12', 'SS 304 Bolt', 'Zinc Plated M16'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setSearchQuery(term)}
                  className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
                >
                  {term}
                </button>
              ))}
            </div>

            <a
              href="https://wa.me/919888021000?text=Hi%20CBH%20Fasteners,%20I%20am%20looking%20for%20fasteners/nuts/bolts.%20Please%20help%20me%20find%20the%20right%20size%20and%20rates."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-[11px] shadow-sm transition-all"
              title="Don't know the exact size? Send a photo on WhatsApp"
            >
              <span>Need Help? Send Photo on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* CATEGORY TABS & MOBILE FILTER TRIGGER                         */}
      {/* ============================================================== */}
      <div className="bg-white border-b border-slate-200 shadow-xs relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {/* Desktop Left Scroll Chevron */}
            <button
              type="button"
              onClick={() => handleTrackScroll('left')}
              disabled={!canScrollLeft}
              className={`hidden sm:flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-100 hover:text-slate-900 transition-all shrink-0 cursor-pointer disabled:opacity-20 disabled:pointer-events-none`}
              aria-label="Scroll categories left"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Category Horizontal Scrolling Track */}
            <div className="relative flex-1 min-w-0 overflow-hidden">
              {/* Fade masks */}
              {canScrollLeft && (
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 sm:w-8 bg-gradient-to-r from-white to-transparent z-10" />
              )}
              {canScrollRight && (
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 sm:w-8 bg-gradient-to-l from-white to-transparent z-10" />
              )}

              <div
                ref={categoryTrackRef}
                className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto whitespace-nowrap py-1 px-0.5 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {/* 1. All Fasteners Pill */}
                <button
                  type="button"
                  onClick={() => handleCategorySelect('all')}
                  data-active={selectedCategory === 'all'}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer border flex items-center gap-1.5 ${
                    selectedCategory === 'all'
                      ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80'
                  }`}
                >
                  <span>All Fasteners</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {totalCount.toLocaleString()}
                  </span>
                </button>

                {/* 2. Master & Dynamic Categories Pills */}
                {allCategoryOptions.map((cat) => {
                  const isActive = isCategoryActive(cat.key);
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => handleCategorySelect(cat.key)}
                      data-active={isActive}
                      className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer border flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-blue-700 text-white border-blue-700 shadow-xs ring-2 ring-blue-700/20'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80'
                      }`}
                      title={cat.name}
                    >
                      <span>{cat.shortName}</span>
                      {cat.badge && (
                        <span
                          className={`hidden md:inline text-[9px] px-1 py-0.2 rounded font-semibold ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-500'
                          }`}
                        >
                          {cat.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* 3. Surplus Deals Pill */}
                <button
                  type="button"
                  onClick={() => handleCategorySelect('surplus')}
                  data-active={selectedCategory === 'surplus'}
                  className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                    selectedCategory === 'surplus'
                      ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-xs ring-2 ring-[#FF6B00]/20'
                      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <Zap size={12} className={selectedCategory === 'surplus' ? 'text-white' : 'text-[#FF6B00]'} />
                  <span>Surplus Deals (-60%)</span>
                </button>

                {/* 4. All Categories Catalog Matrix Button (In-Track) */}
                <button
                  type="button"
                  onClick={() => setIsAllCategoriesModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors shrink-0 cursor-pointer"
                  title="View all fastener product families in full grid"
                >
                  <LayoutGrid size={13} className="text-blue-600" />
                  <span>All Categories ({allCategoryOptions.length})</span>
                </button>
              </div>
            </div>

            {/* Desktop Right Scroll Chevron */}
            <button
              type="button"
              onClick={() => handleTrackScroll('right')}
              disabled={!canScrollRight}
              className={`hidden sm:flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-100 hover:text-slate-900 transition-all shrink-0 cursor-pointer disabled:opacity-20 disabled:pointer-events-none`}
              aria-label="Scroll categories right"
            >
              <ChevronRight size={16} />
            </button>

            {/* Right Action Cluster (Desktop & Tablet) */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              {/* Filter Specs Button */}
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(true)}
                className={`group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer shrink-0 border ${
                  hasActiveFilters
                    ? 'bg-gradient-to-r from-[#0052CC] to-[#0A192F] text-white border-blue-400 ring-2 ring-[#FF6B00]/40'
                    : 'bg-[#0A192F] hover:bg-[#132A4A] text-white border-[#0A192F]'
                }`}
                title="Open Fastener Technical Specifications Filter (Diameter, Grade, Standard, Finish)"
              >
                <span
                  className={`w-5 h-5 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
                    hasActiveFilters ? 'bg-white/20 text-[#FF6B00]' : 'bg-white/10 text-[#FF6B00]'
                  }`}
                >
                  <SlidersHorizontal size={13} className="stroke-[2.5]" />
                </span>
                <span className="tracking-tight">Filter Specs</span>
                {hasActiveFilters ? (
                  <span className="bg-[#FF6B00] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-4.5 text-center shadow-xs">
                    {activeFilterCount}
                  </span>
                ) : (
                  <span className="hidden lg:inline-flex items-center text-[10px] font-bold text-slate-300 bg-white/10 px-1.5 py-0.5 rounded-md border border-white/10">
                    Specs
                  </span>
                )}
              </button>

              {/* Sort Dropdown (Desktop & Tablet) */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-semibold hidden md:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer shadow-2xs"
                >
                  <option value="featured">Featured Fasteners</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="stock_desc">Highest Stock First</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Tier 2 Action Sub-Bar (Mobile-only: gives mobile users instant access to Filter Specs, Sort, & Category Grid) */}
        <div className="sm:hidden flex items-center justify-between gap-2 px-3 py-2 bg-slate-50/90 border-t border-slate-200/80">
          <button
            type="button"
            onClick={() => setIsAllCategoriesModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-700 bg-white border border-slate-200 shadow-2xs cursor-pointer active:scale-95 transition-transform"
          >
            <LayoutGrid size={13} className="text-blue-600" />
            <span>Categories</span>
            <span className="bg-blue-50 text-blue-700 text-[10px] px-1 py-0.2 rounded font-black">
              {allCategoryOptions.length}
            </span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-2.5 pr-6 py-1.5 rounded-lg border border-slate-300 text-[11px] font-bold text-slate-700 bg-white focus:outline-none shadow-2xs cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="stock_desc">High Stock</option>
              </select>
              <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Mobile Filter Specs Button */}
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all shadow-xs cursor-pointer border ${
                hasActiveFilters
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-[#0A192F] text-white border-[#0A192F]'
              }`}
            >
              <SlidersHorizontal size={12} className="text-[#FF6B00] stroke-[2.5]" />
              <span>Filter</span>
              {hasActiveFilters && (
                <span className="bg-[#FF6B00] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-4 text-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ALL FASTENER CATEGORIES MODAL (Responsive Touch Matrix)        */}
      {/* ============================================================== */}
      {isAllCategoriesModalOpen && (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAllCategoriesModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <LayoutGrid size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    Fastener Categories Catalog
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Select any category to instantly filter all {totalCount.toLocaleString()} products
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAllCategoriesModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center transition-colors cursor-pointer text-slate-600 hover:text-slate-900"
                title="Close categories catalog"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Search inside Categories Modal */}
            <div className="p-3 sm:px-5 border-b border-slate-100 bg-white shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  placeholder="Search categories (e.g. Hex, Socket, Structural, Washers)..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
                />
                {categorySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCategorySearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Categories Grid List */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
              {/* Special Quick Actions */}
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={() => handleCategorySelect('all')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20 text-blue-900'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <div>
                    <div className="text-xs font-black">All Fasteners</div>
                    <div className="text-[10px] text-slate-500 font-medium">Entire inventory ({totalCount.toLocaleString()})</div>
                  </div>
                  {selectedCategory === 'all' && <Check size={16} className="text-blue-600 shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleCategorySelect('surplus')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    selectedCategory === 'surplus'
                      ? 'bg-amber-50 border-[#FF6B00] ring-2 ring-[#FF6B00]/20 text-amber-950'
                      : 'bg-amber-50/50 hover:bg-amber-100/70 border-amber-200/80 text-amber-900'
                  }`}
                >
                  <div>
                    <div className="text-xs font-black flex items-center gap-1">
                      <Zap size={12} className="text-[#FF6B00]" />
                      Surplus Deals
                    </div>
                    <div className="text-[10px] text-amber-700 font-medium">Up to 60% off bulk surplus</div>
                  </div>
                  {selectedCategory === 'surplus' && <Check size={16} className="text-[#FF6B00] shrink-0" />}
                </button>
              </div>

              {/* Master Catalog Categories Grid */}
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 px-1">
                  Fastener Product Families
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {allCategoryOptions
                    .filter((cat) => {
                      if (!categorySearchQuery) return true;
                      const q = categorySearchQuery.toLowerCase();
                      return (
                        cat.name.toLowerCase().includes(q) ||
                        cat.shortName.toLowerCase().includes(q) ||
                        cat.key.toLowerCase().includes(q) ||
                        (cat.badge && cat.badge.toLowerCase().includes(q))
                      );
                    })
                    .map((cat) => {
                      const isActive = isCategoryActive(cat.key);
                      return (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => handleCategorySelect(cat.key)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 group ${
                            isActive
                              ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-600/30'
                              : 'bg-white hover:bg-blue-50/50 border-slate-200 text-slate-800 hover:border-blue-300'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className={`text-xs font-black truncate ${isActive ? 'text-white' : 'text-slate-900 group-hover:text-blue-700'}`}>
                              {cat.name}
                            </div>
                            {cat.badge && (
                              <div className={`text-[10px] font-semibold mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                                {cat.badge}
                              </div>
                            )}
                          </div>
                          {isActive ? (
                            <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0 mt-0.5">
                              <Check size={12} className="stroke-[3]" />
                            </span>
                          ) : (
                            <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600 shrink-0 mt-1 transition-colors" />
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:px-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="text-[11px] text-slate-500 font-semibold">
                Active: <span className="font-bold text-slate-800">{getCategoryLabel(selectedCategory)}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAllCategoriesModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SLIDE-OVER FILTER SPECIFICATIONS DRAWER (Desktop & Mobile)     */}
      {/* ============================================================== */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-[2000] flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsFilterDrawerOpen(false)}
          />

          {/* Slide-in Sheet */}
          <div className="relative ml-auto w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shadow-xs">
                    <SlidersHorizontal size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-900">Filter Specifications</h3>
                      {hasActiveFilters && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white">
                          {activeFilterCount} Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold">Technical fastener parameters</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors"
                  title="Close filters"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mobile Sort Option */}
              <div className="sm:hidden mb-5 pb-5 border-b border-slate-100">
                <label className="block text-[11px] font-extrabold text-slate-500 mb-1.5">
                  Sort Fasteners
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white font-semibold"
                >
                  <option value="featured">Featured Fasteners</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="stock_desc">Highest Stock First</option>
                </select>
              </div>

              {/* Form Controls */}
              {renderFilterControls()}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center gap-2.5 sticky bottom-0">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-[2] py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                View ({totalCount.toLocaleString()}) Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MAIN CATALOG BODY (FULL-WIDTH EXPANDED PRODUCT CARDS)          */}
      {/* ============================================================== */}
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex-1">
        <main className="w-full flex flex-col gap-5">
          
          {/* Status strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-500 bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              {searchQuery ? (
                <span>
                  Search results for &ldquo;<strong className="text-slate-900">{searchQuery}</strong>&rdquo;: <strong className="text-blue-700">{totalCount}</strong> direct {totalCount === 1 ? 'match' : 'matches'}
                  {relatedProducts.length > 0 && (
                    <span className="text-slate-500 ml-1.5">
                      (+ <strong className="text-amber-700 font-semibold">{relatedProducts.length}</strong> related specifications)
                    </span>
                  )}
                </span>
              ) : (
                <span>
                  Showing <strong className="text-slate-900">{totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> - <strong className="text-slate-900">{Math.min(currentPage * itemsPerPage, totalCount)}</strong> of <strong className="text-slate-900">{totalCount.toLocaleString()}</strong> matching fasteners
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Redesigned Filter Specs Button */}
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(true)}
                className={`group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer border ${
                  hasActiveFilters
                    ? 'bg-[#0052CC] hover:bg-[#0747A6] text-white border-blue-600 ring-2 ring-[#FF6B00]/40'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 hover:border-slate-400'
                }`}
                title="Filter by Metric Diameter, Material Grade, Standard, Finish, and Category"
              >
                <span className={`w-5 h-5 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
                  hasActiveFilters
                    ? 'bg-white/20 text-[#FF6B00]'
                    : 'bg-orange-50 text-[#FF6B00] border border-orange-200/70'
                }`}>
                  <SlidersHorizontal size={13} className="stroke-[2.5]" />
                </span>
                <span className="tracking-tight">Filter Specs</span>
                {hasActiveFilters ? (
                  <span className="bg-[#FF6B00] text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-5 text-center shadow-xs">
                    {activeFilterCount} Active
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    All Specs
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsCustomRequestOpen(true)}
                className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition-colors border border-slate-200 flex items-center gap-1 cursor-pointer"
                title="Can't find your required fastener? Request custom dimensions."
              >
                <Plus size={13} />
                <span className="hidden sm:inline">Request Custom Spec</span>
                <span className="sm:hidden">Custom</span>
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-red-600 font-semibold hover:underline flex items-center gap-1 text-xs cursor-pointer ml-1"
                >
                  <span>Clear all</span>
                  <span>&times;</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Badges Strip on Main Page */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 bg-blue-50/70 border border-blue-200/80 rounded-xl px-4 py-2.5">
              <span className="text-xs font-black text-blue-900 flex items-center gap-1.5 mr-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Applied:
              </span>
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-900 text-xs font-bold shadow-xs">
                  <Search size={12} className="text-blue-600" />
                  Search: &ldquo;{searchQuery}&rdquo;
                  <button type="button" onClick={() => setSearchQuery('')} className="hover:text-rose-600 ml-1 p-0.5 rounded cursor-pointer" title="Remove search query">
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-900 text-xs font-bold shadow-xs">
                  <Layers size={12} className="text-blue-600" />
                  Category: {getCategoryLabel(selectedCategory)}
                  <button type="button" onClick={() => setSelectedCategory('all')} className="hover:text-rose-600 ml-1 p-0.5 rounded cursor-pointer" title="Remove category">
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedDiameter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-900 text-xs font-bold shadow-xs">
                  <Ruler size={12} className="text-blue-600" />
                  Size: {selectedDiameter}
                  <button type="button" onClick={() => setSelectedDiameter('all')} className="hover:text-rose-600 ml-1 p-0.5 rounded cursor-pointer" title="Remove size">
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedStandard !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-900 text-xs font-bold shadow-xs">
                  <Tag size={12} className="text-blue-600" />
                  Standard: {selectedStandard}
                  <button type="button" onClick={() => setSelectedStandard('all')} className="hover:text-rose-600 ml-1 p-0.5 rounded cursor-pointer" title="Remove standard">
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedGrade !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-900 text-xs font-bold shadow-xs">
                  <ShieldCheck size={12} className="text-blue-600" />
                  Grade: {selectedGrade}
                  <button type="button" onClick={() => setSelectedGrade('all')} className="hover:text-rose-600 ml-1 p-0.5 rounded cursor-pointer" title="Remove grade">
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedFinish !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-900 text-xs font-bold shadow-xs">
                  <Sparkles size={12} className="text-blue-600" />
                  Finish: {selectedFinish}
                  <button type="button" onClick={() => setSelectedFinish('all')} className="hover:text-rose-600 ml-1 p-0.5 rounded cursor-pointer" title="Remove finish">
                    <X size={12} />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-xs">
                  <Zap size={12} className="text-emerald-600" />
                  In Stock Only
                  <button type="button" onClick={() => setInStockOnly(false)} className="hover:text-rose-600 ml-1 p-0.5 rounded cursor-pointer" title="Remove in-stock filter">
                    <X size={12} />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={resetFilters}
                className="ml-auto text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={11} />
                Reset All
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* CASE 1: ZERO DIRECT MATCHES -> HELPFUL RELATED RECOMMENDATIONS  */}
          {/* ============================================================== */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 h-80 animate-pulse" />
              ))}
            </div>
          ) : totalCount === 0 ? (
            <div className="space-y-6">
              {/* Notice Banner */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/90 p-4 sm:p-6 shadow-sm">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
                    <HelpCircle size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900 mb-1">
                      No exact catalog match for &ldquo;{searchQuery || 'selected criteria'}&rdquo;
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                      {relatedProducts.length > 0 ? (
                        <>
                          We could not find an exact catalog item with that identical name or dimension. However, we found{' '}
                          <strong className="text-slate-900 font-bold">{relatedProducts.length} related fasteners</strong>{' '}
                          matching your specifications
                          {parsedSearch.diameter ? ` (Metric Diameter: ${parsedSearch.diameter})` : ''}
                          {parsedSearch.standard ? ` (Standard: ${parsedSearch.standard})` : ''}
                          {parsedSearch.grade ? ` (Grade: ${parsedSearch.grade})` : ''}:
                        </>
                      ) : (
                        <>
                          Looking for a non-standard length, custom thread pitch, or special alloy grade? Our manufacturing facility forges custom fasteners and onboards new ERP specs.
                        </>
                      )}
                    </p>

                    {/* Action buttons inside banner */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Smart Recovery: If search query + category conflict, 1-click search across entire catalog */}
                      {selectedCategory !== 'all' && searchQuery.trim() && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory('all');
                            if (typeof window !== 'undefined') {
                              window.history.pushState({}, '', `/products?search=${encodeURIComponent(searchQuery.trim())}`);
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <Search size={13} />
                          <span>Search &ldquo;{searchQuery}&rdquo; in All Categories</span>
                        </button>
                      )}

                      {/* Smart Recovery: If category + standard conflict, 1-click view all category items */}
                      {selectedCategory !== 'all' && selectedStandard !== 'all' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStandard('all');
                            if (typeof window !== 'undefined') {
                              window.history.pushState({}, '', `/products?category=${encodeURIComponent(selectedCategory)}`);
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <Layers size={13} />
                          <span>Show All {getCategoryLabel(selectedCategory)}</span>
                        </button>
                      )}

                      {/* Clear search query keeping category */}
                      {searchQuery && selectedCategory !== 'all' && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <X size={13} />
                          <span>Clear Search &amp; Show All {getCategoryLabel(selectedCategory)}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={resetFilters}
                        className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={13} />
                        <span>Reset All Filters</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsCustomRequestOpen(true)}
                        className="bg-slate-900 hover:bg-black text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles size={13} />
                        <span>Request Custom Specification (1-Click)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Render Related Products when zero direct matches */}
              {relatedProducts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Compass size={17} className="text-[#0052CC]" />
                      <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                        Related Fasteners &amp; Alternative Specifications ({relatedProducts.length})
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      Similar diameter, standard, or mating nuts/washers
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                    {relatedProducts.map(({ product: p, reason, tone }) => (
                      <FastenerCard
                        key={`zero-rel-${p.id}`}
                        product={p}
                        currentUnit={getCardUnit(p.id)}
                        currentQty={getCardQty(p.id)}
                        onToggleUnit={(u) => toggleCardUnit(p.id, u)}
                        onAdjustQty={(delta) => adjustCardQty(p.id, delta)}
                        onAddToCart={handleAddToCart}
                        relatedBadge={reason}
                        badgeTone={tone}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ============================================================== */
            /* CASE 2: DIRECT MATCHES GRID + RELATED SPECIFICATIONS SECTION    */
            /* ============================================================== */
            <div className="space-y-8">
              {/* Auto-Relaxation Self-Healing Notice Bar */}
              {autoRelaxedInfo && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 rounded-2xl p-4 sm:p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
                      <Sparkles size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                        {autoRelaxedInfo.message}
                      </h4>
                      <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                        Conflicting criteria were automatically resolved so you don&apos;t have to clear your filters manually.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>Reset All</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Direct Matches Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                {products.map((p) => (
                  <FastenerCard
                    key={p.id}
                    product={p}
                    currentUnit={getCardUnit(p.id)}
                    currentQty={getCardQty(p.id)}
                    onToggleUnit={(u) => toggleCardUnit(p.id, u)}
                    onAdjustQty={(delta) => adjustCardQty(p.id, delta)}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {/* Responsive Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm">
                  {/* Items Per Page Selector */}
                  <div className="flex items-center gap-2 text-xs text-slate-600 w-full sm:w-auto justify-between sm:justify-start">
                    <span>Fasteners per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none"
                    >
                      <option value={12}>12 / page</option>
                      <option value={24}>24 / page</option>
                      <option value={48}>48 / page</option>
                      <option value={totalCount || 48}>All ({totalCount})</option>
                    </select>
                    <span className="text-slate-400 text-[11px]">
                      (Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>)
                    </span>
                  </div>

                  {/* Page Navigation Buttons */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage((prev) => Math.max(1, prev - 1));
                        window.scrollTo({ top: 380, behavior: 'smooth' });
                      }}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                        currentPage === 1
                          ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <ChevronLeft size={14} />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((page, idx) => {
                        if (page === '...') {
                          return (
                            <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs">
                              ...
                            </span>
                          );
                        }
                        const isCurrent = page === currentPage;
                        return (
                          <button
                            key={`page-${page}`}
                            type="button"
                            onClick={() => {
                              setCurrentPage(Number(page));
                              window.scrollTo({ top: 380, behavior: 'smooth' });
                            }}
                            className={`min-w-[32px] sm:min-w-[34px] h-8 sm:h-8.5 px-2 rounded-lg text-xs font-extrabold flex items-center justify-center transition-colors ${
                              isCurrent
                                ? 'bg-blue-700 text-white shadow-sm'
                                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                        window.scrollTo({ top: 380, behavior: 'smooth' });
                      }}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                        currentPage === totalPages
                          ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* DEDICATED RELATED FASTENERS & COMPLEMENTARY SECTION            */}
              {/* ============================================================== */}
              {searchQuery && relatedProducts.length > 0 && (
                <div className="pt-6 border-t-2 border-slate-200/80">
                  <div className="bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/80 rounded-2xl border border-blue-200/70 p-4 sm:p-5 mb-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Link2 size={18} className="text-[#0052CC]" />
                          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                            Related Fasteners &amp; Complementary Specifications
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Fasteners with compatible {parsedSearch.diameter || 'matching'} diameter, mating hex nuts &amp; washers, and alternative DIN lengths for &ldquo;{searchQuery}&rdquo;.
                        </p>
                      </div>

                      {relatedProducts.length > 8 && (
                        <button
                          type="button"
                          onClick={() => setShowAllRelated((prev) => !prev)}
                          className="self-start sm:self-center px-3 py-1.5 bg-white border border-blue-200 hover:bg-blue-50 text-[#0052CC] font-bold text-xs rounded-xl transition-colors shadow-2xs whitespace-nowrap"
                        >
                          {showAllRelated ? 'Show Fewer' : `View All (${relatedProducts.length})`}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                    {(showAllRelated ? relatedProducts : relatedProducts.slice(0, 8)).map(
                      ({ product: p, reason, tone }) => (
                        <FastenerCard
                          key={`related-${p.id}`}
                          product={p}
                          currentUnit={getCardUnit(p.id)}
                          currentQty={getCardQty(p.id)}
                          onToggleUnit={(u) => toggleCardUnit(p.id, u)}
                          onAdjustQty={(delta) => adjustCardQty(p.id, delta)}
                          onAddToCart={handleAddToCart}
                          relatedBadge={reason}
                          badgeTone={tone}
                        />
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
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

      {/* Custom Fastener Request Modal */}
      <CustomProductRequestModal
        isOpen={isCustomRequestOpen}
        onClose={() => setIsCustomRequestOpen(false)}
        sourceContext="CATALOG"
        initialCategory={parsedSearch.category || (selectedCategory !== 'all' ? selectedCategory : undefined)}
        initialDiameter={parsedSearch.diameter}
        initialLengthMm={parsedSearch.lengthMm}
        initialStandard={parsedSearch.standard}
        initialSearchQuery={searchQuery || undefined}
      />
    </div>
  );
}

// ============================================================================
// MAIN PAGE EXPORT WITH SUSPENSE BOUNDARY (NEXT.JS APP ROUTER)
// ============================================================================

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-bold text-slate-600 font-mono">Loading Fasteners Catalog Grid...</p>
        </div>
      }
    >
      <ProductsPageInner />
    </Suspense>
  );
}
