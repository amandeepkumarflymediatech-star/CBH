'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TablePagination from '@/components/common/TablePagination';
import { Product } from '@/lib/types';
import { formatINR } from '@/lib/rfq-calculator';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Flame,
  CheckCircle2,
  AlertTriangle,
  X,
  Filter,
  UploadCloud,
  ImageIcon,
  Loader2,
  Check,
  FileSpreadsheet,
  Layers,
  ExternalLink,
  Eye,
  SlidersHorizontal,
  Package,
  Boxes,
  LayoutGrid,
  ZoomIn,
  ArrowUpDown,
  Copy,
  ChevronRight,
  Info,
  PackageOpen,
  RotateCcw,
  Upload
} from 'lucide-react';

const FASTENER_IMAGE_PRESETS = [
  { label: 'Hex Bolt (DIN 933 Zinc)', url: '/assets/bolt_zinc.jpg' },
  { label: 'Anchor Bolt (Heavy Duty)', url: '/assets/anchor_bolt.jpg' },
  { label: 'Socket Cap (DIN 912)', url: '/assets/products/1U_Tqo_2VpVxvv1P7BUPGeHXZe2akS68g.png' },
  { label: 'Flange Bolt (High-Tensile)', url: '/assets/products/1ITZ9-R797BC3OIbAZD4utchxvf4eUwRT.png' },
  { label: 'Stud Bolt & Heavy Hex Nut', url: '/assets/products/1cM0hddDO7TQq_s7ceszHilx-XZYgqnHE.png' },
  { label: 'HDG Structural Bolt', url: '/assets/products/13HRW3hq2RbTFB-gMmEZuvPDxL4hItUrY.png' },
];

interface ImageUploaderProps {
  currentUrl: string;
  onUrlChange: (url: string) => void;
  label?: string;
}

function FastenerImageUploader({ currentUrl, onUrlChange, label = 'Fastener Product Photo' }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCustomUrlOpen, setIsCustomUrlOpen] = useState(false);
  const [withWatermark, setWithWatermark] = useState(true);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP, SVG)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size should be under 10MB');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      const formData = new FormData();
      formData.append('file', file);
      if (withWatermark) {
        formData.append('watermark', 'true');
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        onUrlChange(data.url);
      } else {
        setUploadError(data.error || 'Failed to upload image');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      handleFileChange({ target: { files: dataTransfer.files } } as any);
    }
  };

  return (
    <div className="admin-form-group" style={{ marginTop: '14px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label style={{ margin: 0, fontWeight: 700, fontSize: '13px' }}>{label}</label>
        <button
          type="button"
          onClick={() => setIsCustomUrlOpen(!isCustomUrlOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            fontSize: '11px',
            cursor: 'pointer',
            fontWeight: 700,
            textDecoration: 'underline'
          }}
        >
          {isCustomUrlOpen ? 'Hide URL input' : 'Enter direct URL'}
        </button>
      </div>

      {/* Upload & Preview Row */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Current Image Preview with Transparent Center Watermark Overlay */}
        <div style={{
          width: '78px',
          height: '78px',
          borderRadius: '10px',
          border: '1.5px solid var(--color-border)',
          background: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          {currentUrl ? (
            <img
              src={currentUrl}
              alt="Fastener Preview"
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/bolt_zinc.jpg';
              }}
            />
          ) : (
            <ImageIcon size={26} color="#94A3B8" />
          )}

          {/* Watermark overlay - transparent & centered */}
          {withWatermark && currentUrl && (
            <div
              title="Transparent center CBH Watermark applied"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '46%',
                pointerEvents: 'none',
                opacity: 0.32,
                zIndex: 2,
              }}
            >
              <img
                src="/assets/cbh-watermark.png"
                alt="CBH Watermark"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          )}

          {isUploading && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3
            }}>
              <Loader2 size={22} className="animate-spin" color="#0052CC" />
            </div>
          )}
        </div>

        {/* Dropzone & Browse button */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            flex: 1,
            minWidth: '220px',
            border: '2px dashed #CBD5E1',
            borderRadius: '10px',
            padding: '12px 14px',
            background: '#F8FAFC',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'border-color 0.15s ease',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <UploadCloud size={18} color="#0052CC" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
              {isUploading ? 'Uploading SKU Photo...' : 'Click or Drag & Drop Photo Here'}
            </span>
          </div>
          <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#64748B' }}>
            PNG, JPG, WEBP, or SVG (Up to 10MB)
          </p>
        </div>
      </div>

      {/* Watermark Option Checkbox / Banner */}
      <div style={{
        marginTop: '8px',
        padding: '7px 12px',
        background: withWatermark ? '#EFF6FF' : '#F8FAFC',
        border: `1px solid ${withWatermark ? '#BFDBFE' : '#E2E8F0'}`,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          margin: 0,
          fontSize: '12px',
          fontWeight: 700,
          color: withWatermark ? '#1E40AF' : '#475569'
        }}>
          <input
            type="checkbox"
            checked={withWatermark}
            onChange={(e) => setWithWatermark(e.target.checked)}
            style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#0052CC' }}
          />
          <span>Apply Transparent Center CBH Watermark</span>
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <img
            src="/assets/cbh-watermark.png"
            alt="Watermark preview"
            style={{ height: '16px', width: 'auto', objectFit: 'contain' }}
          />
          <span style={{
            fontSize: '10px',
            fontWeight: 800,
            color: withWatermark ? '#2563EB' : '#94A3B8',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {withWatermark ? 'Watermark Active' : 'No Watermark'}
          </span>
        </div>
      </div>

      {uploadError && (
        <div style={{ marginTop: '6px', fontSize: '11px', color: '#DC2626', fontWeight: 600 }}>
          ⚠ {uploadError}
        </div>
      )}

      {/* Manual URL Input */}
      {isCustomUrlOpen && (
        <div style={{ marginTop: '8px' }}>
          <input
            type="text"
            placeholder="e.g. /assets/bolt_zinc.jpg or https://cdn.example.com/bolt.jpg"
            value={currentUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            style={{ fontSize: '12px', padding: '8px 10px', width: '100%', borderRadius: '8px' }}
          />
        </div>
      )}

      {/* Preset Fastener Catalog Images */}
      <div style={{ marginTop: '8px' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>
          Quick Fastener Photo Templates:
        </span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {FASTENER_IMAGE_PRESETS.map((preset) => {
            const isSelected = currentUrl === preset.url;
            return (
              <button
                key={preset.url}
                type="button"
                onClick={() => onUrlChange(preset.url)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: isSelected ? '1.5px solid #0052CC' : '1px solid #CBD5E1',
                  background: isSelected ? '#EFF6FF' : '#FFFFFF',
                  color: isSelected ? '#0052CC' : '#334155',
                  fontSize: '11px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <img
                  src={preset.url}
                  alt={preset.label}
                  style={{ width: '14px', height: '14px', objectFit: 'contain' }}
                />
                <span>{preset.label}</span>
                {isSelected && <Check size={11} color="#0052CC" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface AdminProductsSectionProps {
  products?: Product[];
  onAdd?: (product: Omit<Product, 'id'>) => Promise<void>;
  onUpdate?: (product: Product) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  onBulkDelete?: (ids: number[]) => Promise<void>;
  onRestoreDefaults?: () => Promise<void> | void;
  onToggleSurplus?: (id: number) => Promise<void>;
  showToast: (msg: string) => void;
  onRefreshProducts?: () => Promise<void> | void;
}

export default function AdminProductsSection({
  products: initialProducts,
  onAdd,
  onUpdate,
  onDelete,
  onBulkDelete,
  onRestoreDefaults,
  onToggleSurplus,
  showToast,
  onRefreshProducts,
}: AdminProductsSectionProps) {
  // Table View Mode: 'table' (Clean commercial table) vs 'grid' (Mobile/Tablet Card Grid)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  // Server-side Paginated Data State
  const [serverProducts, setServerProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [serverStats, setServerStats] = useState<{
    total: number;
    inStock: number;
    surplusCount: number;
    erpSynced: number;
    screwsCount: number;
    boltsCount: number;
  }>({
    total: 0,
    inStock: 0,
    surplusCount: 0,
    erpSynced: 0,
    screwsCount: 0,
    boltsCount: 0,
  });
  const [apiFilterOptions, setApiFilterOptions] = useState<{
    subGroups: string[];
    standards: string[];
    grades: string[];
  }>({
    subGroups: [],
    standards: [],
    grades: [],
  });

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSubGroup, setSelectedSubGroup] = useState('all');
  const [selectedStandard, setSelectedStandard] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedStock, setSelectedStock] = useState('all');
  const [selectedCatalog, setSelectedCatalog] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addModalTab, setAddModalTab] = useState<'basic' | 'standards' | 'dimensions' | 'metallurgy' | 'pricing' | 'packaging' | 'media'>('basic');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editModalTab, setEditModalTab] = useState<'basic' | 'standards' | 'dimensions' | 'metallurgy' | 'pricing' | 'packaging' | 'media'>('basic');
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [inspectProduct, setInspectProduct] = useState<Product | null>(null);
  const [inspectTab, setInspectTab] = useState<'overview' | 'dimensions' | 'pricing' | 'inventory'>('overview');
  const [copiedSku, setCopiedSku] = useState(false);

  // Multiple Products Selection & Bulk Delete States
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());
  const [isSelectAllCatalog, setIsSelectAllCatalog] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  // Bulk Excel Upload Modal States
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [isBulkInspecting, setIsBulkInspecting] = useState(false);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkInspection, setBulkInspection] = useState<{
    fileName: string;
    fileSize: number;
    sheets: Array<{ name: string; totalRows: number; estimatedProducts: number }>;
    totalSheets: number;
    firstSheetWithProducts: string;
  } | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('all');
  const [upsertMode, setUpsertMode] = useState<'merge' | 'append' | 'replace'>('merge');
  const [defaultImagePreset, setDefaultImagePreset] = useState<string>('/assets/bolt_zinc.jpg');
  const [bulkPreviewItems, setBulkPreviewItems] = useState<Array<Product & { isExistingSku?: boolean }>>([]);
  const [bulkPreviewStats, setBulkPreviewStats] = useState<{
    totalProcessed: number;
    validCount: number;
    invalidCount: number;
  } | null>(null);
  const [bulkUploadError, setBulkUploadError] = useState<string | null>(null);
  const [bulkSuccessResult, setBulkSuccessResult] = useState<{
    totalCatalogCount: number;
    importedCount: number;
    addedCount: number;
    updatedCount: number;
    skippedCount?: number;
    sheetsProcessed?: string[];
  } | null>(null);
  const [previewFilter, setPreviewFilter] = useState('');
  const bulkFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const previewAbortControllerRef = React.useRef<AbortController | null>(null);

  // Bulk Watermark & Bulk Images State
  const [bulkWatermark, setBulkWatermark] = useState<boolean>(true);
  const [bulkUploadTab, setBulkUploadTab] = useState<'excel' | 'images'>('excel');
  const [bulkImagePreviews, setBulkImagePreviews] = useState<Array<{ id: string; name: string; size: number; previewUrl: string; file: File }>>([]);
  const [bulkImageResults, setBulkImageResults] = useState<Array<{ id: string; name: string; url: string; success: boolean; error?: string }>>([]);
  const [isBulkUploadingImages, setIsBulkUploadingImages] = useState(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [copiedUrlIndex, setCopiedUrlIndex] = useState<number | null>(null);
  const bulkMultipleImagesInputRef = React.useRef<HTMLInputElement | null>(null);

  // Background Bulk Upload Job State & Tracking
  const [activeJob, setActiveJob] = useState<{
    id: string;
    status: 'pending' | 'parsing' | 'syncing' | 'completed' | 'failed';
    fileName: string;
    totalRows: number;
    processedRows: number;
    progressPercent: number;
    addedCount: number;
    updatedCount: number;
    skippedCount?: number;
    catalogTotal?: number;
    message?: string;
    error?: string;
  } | null>(null);
  const [isDismissedJobBanner, setIsDismissedJobBanner] = useState(false);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page to 1 when filters or debounced search change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedSubGroup, selectedStandard, selectedGrade, selectedStock, selectedCatalog, sortBy]);

  // Fetch paginated products directly from server
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
      });

      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      if (selectedSubGroup && selectedSubGroup !== 'all') params.set('subGroup', selectedSubGroup);
      if (selectedStandard && selectedStandard !== 'all') params.set('standard', selectedStandard);
      if (selectedGrade && selectedGrade !== 'all') params.set('grade', selectedGrade);
      if (selectedStock && selectedStock !== 'all') params.set('stockStatus', selectedStock);
      if (selectedCatalog && selectedCatalog !== 'all') params.set('surplus', selectedCatalog);
      if (sortBy && sortBy !== 'default') params.set('sortBy', sortBy);

      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setServerProducts(json.data);
        setTotalCount(json.total || 0);
        if (json.stats) setServerStats(json.stats);
        if (json.filterOptions) setApiFilterOptions(json.filterOptions);
      }
    } catch (err) {
      console.error('Failed to load paginated products:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearch, selectedSubGroup, selectedStandard, selectedGrade, selectedStock, selectedCatalog, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Check for existing active background import job on initial load
  useEffect(() => {
    let isMounted = true;
    const checkActiveJob = async () => {
      try {
        const res = await fetch('/api/products/bulk-upload?action=active');
        const data = await res.json();
        if (isMounted && data.success && data.job) {
          setActiveJob(data.job);
        }
      } catch (err) {
        // Silent failure if offline or initial load
      }
    };
    checkActiveJob();
    return () => {
      isMounted = false;
    };
  }, []);

  // Poll background job progress while active
  useEffect(() => {
    if (!activeJob || !['pending', 'parsing', 'syncing'].includes(activeJob.status)) {
      return;
    }

    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/products/bulk-upload?jobId=${activeJob.id}`);
        const data = await res.json();
        if (data.success && data.job) {
          setActiveJob(data.job);
          if (data.job.status === 'completed') {
            showToast(
              `Bulk import completed: +${data.job.addedCount.toLocaleString()} added, ${data.job.updatedCount.toLocaleString()} updated!`
            );
            fetchProducts();
            if (onRefreshProducts) onRefreshProducts();
          } else if (data.job.status === 'failed') {
            showToast(`Bulk import error: ${data.job.error || 'Import operation failed'}`);
          }
        }
      } catch (err) {
        console.warn('Background import poll error:', err);
      }
    }, 1500);

    return () => clearInterval(timer);
  }, [activeJob?.id, activeJob?.status, fetchProducts, onRefreshProducts]);

  // Active products & global metrics
  const paginatedProducts = serverProducts;
  const products = serverProducts;
  const filteredProducts = serverProducts;
  const stats = serverStats;

  // Default Add Form containing ALL Excel Sheet Attributes
  const DEFAULT_ADD_FORM = {
    sku: '',
    name: '',
    subGroup: 'SCREW',
    category: 'Hex Screws',
    subCategory: 'SOCKET SET SCREWS',
    standard: 'DIN 933',
    din: 'DIN 933',
    isoStandard: 'ISO 4017',
    bsStandard: '',
    asmeStandard: '',
    threadType: 'Full Thread',
    threadLength: 'FULL THREAD',
    diameter: 'M10',
    pitchMm: '1.5',
    lengthMm: '100',
    sizeFormatted: 'M10X1.5X100',
    grade: '8.8',
    finish: 'Black Passivated (BP)',
    weightPerPcKg: '0.0601',
    weightPer1000PcsKg: '60.1',
    pricePerPiece: '6.50',
    pricePerKg: '108.00',
    price100Pcs: '650.00',
    price1000Pcs: '6500.00',
    pcsPerBox: '500',
    smallBoxWeightKg: '2.5',
    pcsPerMasterCtn: '4000',
    masterCtnWeightKg: '20.0',
    moq: '25 KGS',
    leadTimeDays: '10',
    productionDays: '7',
    packingDays: '3',
    stockPcs: '15000',
    isSurplus: false,
    surplusDiscountPct: '35',
    brand: 'CBH',
    hsnCode: '73181500',
    drawingUrl: '',
    gdriveImageUrl: '',
    imageUrl: '/assets/bolt_zinc.jpg',
    descriptionHtml: '',
  };

  const [addForm, setAddForm] = useState(DEFAULT_ADD_FORM);

  // Dynamic filter lists from data & API
  const subGroups = useMemo(() => {
    const set = new Set<string>(['BOLTS', 'SCREWS', 'NUTS', 'WASHERS', 'STUDS', 'ANCHORS', ...(apiFilterOptions.subGroups || [])]);
    serverProducts.forEach((p) => { if (p.subGroup) set.add(p.subGroup); });
    return Array.from(set).sort();
  }, [apiFilterOptions, serverProducts]);

  const standards = useMemo(() => {
    const set = new Set<string>(['DIN 933', 'DIN 931', 'DIN 6921', 'DIN 912', 'DIN 7991', 'ISO 4014', 'ISO 4017', ...(apiFilterOptions.standards || [])]);
    serverProducts.forEach((p) => {
      if (p.standard) set.add(p.standard);
      if (p.din) set.add(p.din);
      if (p.isoStandard) set.add(p.isoStandard);
    });
    return Array.from(set).sort();
  }, [apiFilterOptions, serverProducts]);

  const grades = useMemo(() => {
    const set = new Set<string>(['4.6', '8.8', '10.9', '12.9', 'SS 304', 'SS 316', 'B7', ...(apiFilterOptions.grades || [])]);
    serverProducts.forEach((p) => { if (p.grade) set.add(p.grade); });
    return Array.from(set).sort();
  }, [apiFilterOptions, serverProducts]);

  // Multiple selection helpers
  const toggleSelectProduct = (id: number) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      debouncedSearch.trim() ||
      selectedSubGroup !== 'all' ||
      selectedStandard !== 'all' ||
      selectedGrade !== 'all' ||
      selectedStock !== 'all' ||
      selectedCatalog !== 'all'
    );
  }, [debouncedSearch, selectedSubGroup, selectedStandard, selectedGrade, selectedStock, selectedCatalog]);

  const isAllPageSelected = useMemo(() => {
    if (serverProducts.length === 0) return false;
    return serverProducts.every((p) => selectedProductIds.has(p.id));
  }, [serverProducts, selectedProductIds]);

  const toggleSelectAllOnPage = () => {
    if (isAllPageSelected || isSelectAllCatalog) {
      setSelectedProductIds(new Set());
      setIsSelectAllCatalog(false);
    } else {
      const next = new Set<number>();
      serverProducts.forEach((p) => next.add(p.id));
      setSelectedProductIds(next);
      setIsSelectAllCatalog(false);
    }
  };

  const selectEntireCatalog = () => {
    const next = new Set<number>();
    serverProducts.forEach((p) => next.add(p.id));
    setSelectedProductIds(next);
    setIsSelectAllCatalog(true);
  };

  const selectAllFiltered = () => {
    selectEntireCatalog();
  };

  const selectAllProducts = () => {
    selectEntireCatalog();
  };

  const clearSelection = () => {
    setSelectedProductIds(new Set());
    setIsSelectAllCatalog(false);
  };

  const handleExecuteBulkDelete = async () => {
    if (selectedProductIds.size === 0 && !isSelectAllCatalog) return;

    try {
      setIsDeletingBulk(true);
      if (isSelectAllCatalog) {
        const payload: any = { allMatching: true };
        if (debouncedSearch.trim()) payload.search = debouncedSearch.trim();
        if (selectedSubGroup !== 'all') payload.subGroup = selectedSubGroup;
        if (selectedStandard !== 'all') payload.standard = selectedStandard;
        if (selectedGrade !== 'all') payload.grade = selectedGrade;
        if (selectedStock !== 'all') payload.stockStatus = selectedStock;
        if (selectedCatalog !== 'all') payload.surplus = selectedCatalog;

        if (!hasActiveFilters) {
          payload.all = true;
        }

        const res = await fetch('/api/products', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        showToast(data.message || `Deleted all ${totalCount.toLocaleString()} products successfully.`);
      } else {
        const ids = Array.from(selectedProductIds);
        const targetSkus = serverProducts.filter((p) => selectedProductIds.has(p.id)).map((p) => p.sku);
        if (onBulkDelete) {
          await onBulkDelete(ids);
        } else {
          const res = await fetch('/api/products', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids, skus: targetSkus }),
          });
          const data = await res.json();
          showToast(data.message || `Deleted ${ids.length} products successfully.`);
        }
      }
      clearSelection();
      setIsBulkDeleteModalOpen(false);
      await fetchProducts();
    } catch (err: any) {
      showToast(`Error deleting products: ${err.message || 'Operation failed'}`);
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedSubGroup('all');
    setSelectedStandard('all');
    setSelectedGrade('all');
    setSelectedStock('all');
    setSelectedCatalog('all');
    setSortBy('default');
    setCurrentPage(1);
  };

  // Full 100% Excel Column Export
  const handleExportCSV = async () => {
    let exportItems = serverProducts;
    if (totalCount > serverProducts.length) {
      showToast(`Generating export for all ${totalCount.toLocaleString()} matching SKUs...`);
      try {
        const params = new URLSearchParams({ limit: 'all' });
        if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
        if (selectedSubGroup !== 'all') params.set('subGroup', selectedSubGroup);
        if (selectedStandard !== 'all') params.set('standard', selectedStandard);
        if (selectedGrade !== 'all') params.set('grade', selectedGrade);
        if (selectedStock !== 'all') params.set('stockStatus', selectedStock);
        if (selectedCatalog !== 'all') params.set('surplus', selectedCatalog);
        if (sortBy !== 'default') params.set('sortBy', sortBy);

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          exportItems = data.data;
        }
      } catch (err) {
        console.warn('Failed to fetch all products for export, falling back to loaded page:', err);
      }
    }

    const headers = [
      'SKU', 'Item Name', 'Sub-Group', 'Category', 'Sub-Category',
      'Standard', 'DIN', 'ISO Standard', 'BS Standard', 'ASME Standard',
      'Diameter (DIA)', 'Pitch (mm)', 'Length (mm)', 'Size Formatted',
      'Thread Length', 'Thread Type', 'Property Class / Grade', 'Finish / Coating',
      'Weight Per Pc (kg)', 'Weight Per 1000 Pcs (kg)',
      'Rate Per Pc (INR)', 'Rate Per Kg (INR)', 'Price 100 Pcs (INR)', 'Price 1000 Pcs (INR)',
      'Small Box Packaging (Pcs)', 'Small Box Weight (kg)',
      'Master Carton Packaging (Pcs)', 'Master Carton Weight (kg)',
      'MOQ', 'Lead Time Days', 'Production Days', 'Packing Days',
      'Stock Pcs', 'Stock Kg', 'Stock UOM',
      'Brand', 'GST HSN Code', 'Drawing CAD URL', 'GDrive Image URL', 'Surplus Deal'
    ];

    const rows = exportItems.map((p) => [
      `"${p.sku}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.subGroup || ''}"`,
      `"${p.category || ''}"`,
      `"${p.subCategory || ''}"`,
      `"${p.standard || ''}"`,
      `"${p.din || ''}"`,
      `"${p.isoStandard || ''}"`,
      `"${p.bsStandard || ''}"`,
      `"${p.asmeStandard || ''}"`,
      `"${p.diameter || ''}"`,
      p.pitchMm,
      p.lengthMm,
      `"${p.sizeFormatted || ''}"`,
      `"${p.threadLength || ''}"`,
      `"${p.threadType || ''}"`,
      `"${p.grade || ''}"`,
      `"${p.finish || ''}"`,
      p.weightPerPcKg,
      p.weightPer1000PcsKg || (p.weightPerPcKg * 1000).toFixed(3),
      p.pricePerPiece,
      p.pricePerKg,
      p.price100Pcs || (p.pricePerPiece * 100).toFixed(2),
      p.price1000Pcs || (p.pricePerPiece * 1000).toFixed(2),
      `"${p.pcsPerBox || ''}"`,
      p.smallBoxWeightKg || 2.5,
      `"${p.pcsPerMasterCtn || ''}"`,
      p.masterCtnWeightKg || 20,
      `"${p.moq || ''}"`,
      p.leadTimeDays || 10,
      p.productionDays || 7,
      p.packingDays || 3,
      p.stockPcs,
      p.stockKg.toFixed(2),
      `"${p.stockUom || 'Nos'}"`,
      `"${p.brand || 'CBH'}"`,
      `"${p.hsnCode || '73181500'}"`,
      `"${p.drawingUrl || ''}"`,
      `"${p.gdriveImageUrl || ''}"`,
      p.isSurplus ? `Yes (-${p.surplusDiscountPct}%)` : 'No',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cbh_master_fastener_excel_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported all Excel columns for ${exportItems.length} fastener SKUs`);
  };

  // Bulk Excel Import Handlers
  const handleDownloadTemplate = () => {
    window.location.href = '/api/products/bulk-upload';
  };

  const handleResetBulkUpload = () => {
    setBulkFile(null);
    setBulkInspection(null);
    setBulkPreviewItems([]);
    setBulkPreviewStats(null);
    setBulkUploadError(null);
    setBulkSuccessResult(null);
    if (activeJob?.status === 'completed' || activeJob?.status === 'failed') {
      setActiveJob(null);
    }
    setSelectedSheet('all');
    setPreviewFilter('');
    if (bulkFileInputRef.current) bulkFileInputRef.current.value = '';
  };

  const handleInspectAndPreviewFile = async (file: File, sheetToSelect: string = 'all') => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(ext)) {
      setBulkUploadError('Please select a valid Excel (.xlsx, .xls) or .csv spreadsheet file.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setBulkUploadError('File size exceeds 50MB limit.');
      return;
    }

    // Set file immediately so the user can click "Import Products Now" without waiting!
    setBulkFile(file);
    setBulkUploadError(null);
    setBulkSuccessResult(null);

    // Cancel any previous pending preview request
    if (previewAbortControllerRef.current) {
      previewAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    previewAbortControllerRef.current = controller;

    try {
      setIsBulkInspecting(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'preview');
      formData.append('sheetName', sheetToSelect);
      formData.append('defaultImage', defaultImagePreset);

      const res = await fetch('/api/products/bulk-upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setBulkUploadError(data.error || 'Failed to parse Excel file.');
        return;
      }

      setBulkInspection(data.inspection || null);
      setSelectedSheet(sheetToSelect);
      setBulkPreviewItems(data.preview || []);
      setBulkPreviewStats({
        totalProcessed: data.totalRowsProcessed || 0,
        validCount: data.validCount || 0,
        invalidCount: data.invalidCount || 0,
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setBulkUploadError(err.message || 'Error parsing file.');
      }
    } finally {
      setIsBulkInspecting(false);
    }
  };

  const handleSheetChange = async (newSheet: string) => {
    setSelectedSheet(newSheet);
    if (!bulkFile) return;
    await handleInspectAndPreviewFile(bulkFile, newSheet);
  };

  const handleExecuteBulkImport = async () => {
    if (!bulkFile) {
      setBulkUploadError('No file selected for import.');
      return;
    }

    // Immediately abort preview fetch if still running so import has full bandwidth
    if (previewAbortControllerRef.current) {
      previewAbortControllerRef.current.abort();
    }
    setIsBulkInspecting(false);

    try {
      setIsBulkImporting(true);
      setBulkUploadError(null);

      const formData = new FormData();
      formData.append('file', bulkFile);
      formData.append('action', 'import');
      formData.append('sheetName', selectedSheet);
      formData.append('upsertMode', upsertMode);
      formData.append('defaultImage', defaultImagePreset);
      formData.append('applyWatermark', bulkWatermark ? 'true' : 'false');

      const res = await fetch('/api/products/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setBulkUploadError(data.error || 'Bulk import failed.');
        return;
      }

      if (data.background && data.job) {
        setActiveJob(data.job);
        setIsDismissedJobBanner(false);
        showToast('Bulk import started in background! You can close this window.');
      } else {
        setBulkSuccessResult(data.stats);
        showToast(data.message || 'Bulk products imported successfully!');

        if (onRefreshProducts) {
          await onRefreshProducts();
        }
        await fetchProducts();
      }
    } catch (err: any) {
      setBulkUploadError(err.message || 'Failed to complete bulk import.');
    } finally {
      setIsBulkImporting(false);
    }
  };

  // Bulk Multiple Images Upload with Watermark Handlers
  const handleBulkImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newPreviews = Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: file.name,
      size: file.size,
      previewUrl: URL.createObjectURL(file),
      file,
    }));
    setBulkImagePreviews((prev) => [...prev, ...newPreviews]);
    if (bulkMultipleImagesInputRef.current) {
      bulkMultipleImagesInputRef.current.value = '';
    }
  };

  const handleBulkImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      showToast('Please drop valid image files (PNG, JPG, WEBP, etc.)');
      return;
    }
    const newPreviews = imageFiles.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: file.name,
      size: file.size,
      previewUrl: URL.createObjectURL(file),
      file,
    }));
    setBulkImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemovePreviewImage = (id: string) => {
    setBulkImagePreviews((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item && item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleClearAllPreviewImages = () => {
    bulkImagePreviews.forEach((p) => {
      if (p.previewUrl.startsWith('blob:')) URL.revokeObjectURL(p.previewUrl);
    });
    setBulkImagePreviews([]);
    setBulkImageResults([]);
  };

  const handleExecuteBulkImagesUpload = async () => {
    if (bulkImagePreviews.length === 0) return;
    setIsBulkUploadingImages(true);
    setBulkUploadProgress({ current: 0, total: bulkImagePreviews.length });
    const results: Array<{ id: string; name: string; url: string; success: boolean; error?: string }> = [];

    for (let i = 0; i < bulkImagePreviews.length; i++) {
      const item = bulkImagePreviews[i];
      try {
        const formData = new FormData();
        formData.append('file', item.file);
        if (bulkWatermark) {
          formData.append('watermark', 'true');
        }
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.success && data.url) {
          results.push({
            id: item.id,
            name: item.name,
            url: data.url,
            success: true,
          });
        } else {
          results.push({
            id: item.id,
            name: item.name,
            url: '',
            success: false,
            error: data.error || 'Upload failed',
          });
        }
      } catch (err: any) {
        results.push({
          id: item.id,
          name: item.name,
          url: '',
          success: false,
          error: err.message || 'Upload error',
        });
      }
      setBulkUploadProgress({ current: i + 1, total: bulkImagePreviews.length });
    }

    setBulkImageResults(results);
    setIsBulkUploadingImages(false);
    showToast(`Uploaded ${results.filter((r) => r.success).length} of ${bulkImagePreviews.length} images with watermark stamped!`);
  };

  const handleCopyUrl = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedUrlIndex(index);
    setTimeout(() => setCopiedUrlIndex(null), 2000);
    showToast('Image URL copied to clipboard');
  };

  const handleCopyAllUrls = () => {
    const successfulUrls = bulkImageResults.filter((r) => r.success && r.url).map((r) => r.url).join('\n');
    if (!successfulUrls) return;
    navigator.clipboard.writeText(successfulUrls);
    showToast(`Copied ${bulkImageResults.filter((r) => r.success).length} image URLs to clipboard`);
  };

  const submitAddForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(addForm.weightPerPcKg) || 0.06;
    const stockPcs = parseInt(addForm.stockPcs) || 10000;
    const pricePc = parseFloat(addForm.pricePerPiece) || 5.0;
    const priceKg = parseFloat(addForm.pricePerKg) || 100.0;
    const prodDays = parseInt(addForm.productionDays) || 7;
    const packDays = parseInt(addForm.packingDays) || 3;
    const leadTime = parseInt(addForm.leadTimeDays) || (prodDays + packDays);

    const generatedSku = addForm.sku.trim() || `CBH-${(addForm.din || addForm.standard || 'STD').replace(/\s+/g, '')}-${addForm.diameter}-${addForm.lengthMm}-${Math.floor(100 + Math.random() * 900)}`;
    const formattedSize = addForm.sizeFormatted.trim() || `${addForm.diameter}X${addForm.pitchMm}X${addForm.lengthMm}`;

    const newProductPayload = {
      sku: generatedSku.toUpperCase(),
      name: addForm.name.trim() || `${addForm.standard} ${addForm.diameter}x${addForm.lengthMm}mm Grade ${addForm.grade} ${addForm.finish}`,
      subGroup: addForm.subGroup,
      category: addForm.category,
      subCategory: addForm.subCategory,
      standard: addForm.standard,
      din: addForm.din,
      isoStandard: addForm.isoStandard,
      bsStandard: addForm.bsStandard,
      asmeStandard: addForm.asmeStandard,
      grade: addForm.grade,
      finish: addForm.finish,
      threadType: addForm.threadType,
      threadLength: addForm.threadLength,
      diameter: addForm.diameter,
      lengthMm: parseInt(addForm.lengthMm) || 100,
      pitchMm: parseFloat(addForm.pitchMm) || 1.5,
      sizeFormatted: formattedSize,
      weightPerPcKg: weight,
      weightPer1000PcsKg: parseFloat(addForm.weightPer1000PcsKg) || +(weight * 1000).toFixed(3),
      pricePerPiece: pricePc,
      originalPricePerPiece: +(pricePc * 1.15).toFixed(2),
      pricePerKg: priceKg,
      originalPricePerKg: +(priceKg * 1.15).toFixed(2),
      price100Pcs: parseFloat(addForm.price100Pcs) || +(pricePc * 100).toFixed(2),
      price1000Pcs: parseFloat(addForm.price1000Pcs) || +(pricePc * 1000).toFixed(2),
      stockPcs: stockPcs,
      stockKg: +(stockPcs * weight).toFixed(2),
      stockUom: 'Nos',
      isInStock: stockPcs > 0,
      isSurplus: addForm.isSurplus,
      surplusDiscountPct: addForm.isSurplus ? (parseInt(addForm.surplusDiscountPct) || 35) : 0,
      pcsPerBox: addForm.pcsPerBox,
      smallBoxWeightKg: parseFloat(addForm.smallBoxWeightKg) || 2.5,
      pcsPerMasterCtn: addForm.pcsPerMasterCtn,
      masterCtnWeightKg: parseFloat(addForm.masterCtnWeightKg) || 20.0,
      moq: addForm.moq || '25 KGS',
      leadTimeDays: leadTime,
      productionDays: prodDays,
      packingDays: packDays,
      brand: addForm.brand || 'CBH',
      hsnCode: addForm.hsnCode || '73181500',
      drawingUrl: addForm.drawingUrl,
      gdriveImageUrl: addForm.gdriveImageUrl,
      imageUrl: addForm.imageUrl || '/assets/bolt_zinc.jpg',
    };

    if (onAdd) {
      await onAdd(newProductPayload);
    } else {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProductPayload),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`SKU "${generatedSku}" registered in central inventory.`);
      } else {
        showToast(data.error || 'Failed to add SKU.');
      }
    }

    await fetchProducts();
    setIsAddOpen(false);
    setAddForm(DEFAULT_ADD_FORM);
    setAddModalTab('basic');
  };

  const submitEditForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    if (onUpdate) {
      await onUpdate(editProduct);
    } else {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProduct),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`SKU "${editProduct.sku}" updated successfully.`);
      } else {
        showToast(data.error || 'Failed to update SKU.');
      }
    }
    setServerProducts((prev) => prev.map((p) => (p.id === editProduct.id ? editProduct : p)));
    setEditProduct(null);
    await fetchProducts();
  };

  const confirmDelete = async () => {
    if (!deleteProduct) return;
    if (onDelete) {
      await onDelete(deleteProduct.id);
    } else {
      const skuParam = deleteProduct.sku ? `&sku=${encodeURIComponent(deleteProduct.sku)}` : '';
      const res = await fetch(`/api/products?id=${deleteProduct.id}${skuParam}`, { method: 'DELETE' });
      const data = await res.json();
      showToast(data.message || 'Product deleted from database.');
    }
    setDeleteProduct(null);
    await fetchProducts();
  };

  const handleToggleSurplus = async (id: number) => {
    if (onToggleSurplus) {
      await onToggleSurplus(id);
    } else {
      const target = serverProducts.find((p) => p.id === id);
      if (!target) return;
      const updated = { ...target, isSurplus: !target.isSurplus };
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Surplus status updated for SKU "${target.sku}".`);
      }
    }
    setServerProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isSurplus: !p.isSurplus } : p)));
    await fetchProducts();
  };

  const handleRestoreDefaultsAction = async () => {
    if (onRestoreDefaults) {
      await onRestoreDefaults();
    } else {
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reset_defaults' }),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Demo catalog restored.');
        } else {
          showToast('Failed to restore demo catalog.');
        }
      } catch {
        showToast('Error restoring demo catalog.');
      }
    }
    await fetchProducts();
  };

  return (
    <div className="space-y-4">
      {/* MAIN PRODUCTS & CATALOG CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {/* 1. TOP HEADER & QUICK KPI STATUS TABS (Mobile-First, Clean, No Overflow) */}
        <div className="p-3 sm:p-4 md:p-5 border-b border-slate-200/80 bg-white">
          {/* Row A: Title & Primary Actions */}
          <div className="flex items-center justify-between gap-2 pb-2 sm:pb-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5 sm:gap-2">
                <span>Fasteners</span>
                <span className="hidden xs:inline">Inventory</span>
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {totalCount.toLocaleString()}
                </span>
              </h2>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Table / Grid Switcher */}
              <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                    viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Commercial table view"
                >
                  <Layers size={13} />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                    viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Card grid view"
                >
                  <LayoutGrid size={13} />
                  <span className="hidden sm:inline">Grid</span>
                </button>
              </div>

              {/* Upload Excel */}
              <button
                type="button"
                onClick={() => {
                  setBulkUploadTab('excel');
                  setIsBulkUploadOpen(true);
                  if (!bulkFile) handleResetBulkUpload();
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors shadow-xs"
                title="Upload products via Excel (.xlsx, .csv)"
              >
                <FileSpreadsheet size={13} className="text-emerald-600" />
                <span className="hidden sm:inline">Upload Excel</span>
                <span className="sm:hidden">Excel</span>
              </button>

              {/* Watermark Bulk Images */}
              <button
                type="button"
                onClick={() => {
                  setBulkUploadTab('images');
                  setIsBulkUploadOpen(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 text-xs font-bold hover:bg-blue-100 transition-colors shadow-xs"
                title="Upload bulk product photos with CBH watermark"
              >
                <ImageIcon size={13} className="text-blue-600" />
                <span className="hidden sm:inline">Watermark Images</span>
                <span className="sm:hidden">Watermark</span>
              </button>

              {/* Add Fastener */}
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Add Fastener</span>
                <span className="sm:hidden">Add</span>
              </Link>

              {/* Export CSV (Icon only on mobile) */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                title="Download full CSV"
              >
                <Download size={13} />
                <span className="hidden md:inline">Export</span>
              </button>

              {/* Bulk Delete */}
              {totalCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    selectEntireCatalog();
                    setIsBulkDeleteModalOpen(true);
                  }}
                  className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
                  title="Bulk delete entire catalog"
                >
                  <Trash2 size={13} />
                  <span>Bulk Delete</span>
                </button>
              )}
            </div>
          </div>

          {/* Row B: Horizontal Scrollable Status / Category Tabs (Single row on mobile, swipes smoothly!) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-1 px-1 flex-nowrap">
            {[
              { id: 'all', label: 'All', count: stats.total || totalCount },
              { id: 'bolts', label: 'Bolts', count: stats.boltsCount, subGroup: 'BOLTS' },
              { id: 'screws', label: 'Screws', count: stats.screwsCount, subGroup: 'SCREW' },
              { id: 'in_stock', label: 'Ready Stock', count: stats.inStock, stock: 'in_stock' },
              { id: 'surplus', label: 'Surplus', count: stats.surplusCount, catalog: 'surplus', isFlame: true },
            ].map((pill) => {
              const isActive =
                (pill.id === 'all' && selectedSubGroup === 'all' && selectedStock === 'all' && selectedCatalog === 'all') ||
                (pill.subGroup && selectedSubGroup === pill.subGroup) ||
                (pill.stock && selectedStock === pill.stock) ||
                (pill.catalog && selectedCatalog === pill.catalog);

              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => {
                    if (pill.id === 'all') {
                      handleResetFilters();
                    } else if (pill.subGroup) {
                      setSelectedSubGroup(pill.subGroup);
                    } else if (pill.stock) {
                      setSelectedStock(pill.stock);
                    } else if (pill.catalog) {
                      setSelectedCatalog(pill.catalog);
                    }
                  }}
                  className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
                  }`}
                >
                  {pill.isFlame && <Flame size={11} className={isActive ? 'text-amber-300' : 'text-amber-500'} />}
                  <span>{pill.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-500 border border-slate-200'
                    }`}
                  >
                    {pill.count.toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. UNIFIED ACTION & FILTER TOOLBAR (Mobile-First Responsive) */}
        <div className="p-3 sm:px-4 sm:py-2.5 bg-slate-50/60 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
            {/* Search Input - Full width on mobile */}
            <div className="relative w-full sm:w-auto sm:min-w-[200px] sm:max-w-xs sm:flex-1">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search SKU, name, DIN/ISO, grade..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Filter Dropdowns - Horizontal swipe on mobile, flex wrap on desktop */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 flex-nowrap sm:flex-wrap sm:overflow-visible">
              <select
                value={selectedSubGroup}
                onChange={(e) => setSelectedSubGroup(e.target.value)}
                className="shrink-0 h-8 text-xs bg-white border border-slate-200 rounded-lg px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Sub-Group: All</option>
                {subGroups.map((sg) => (
                  <option key={sg} value={sg}>{sg}</option>
                ))}
              </select>

              <select
                value={selectedStandard}
                onChange={(e) => setSelectedStandard(e.target.value)}
                className="shrink-0 h-8 text-xs bg-white border border-slate-200 rounded-lg px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Standard: All</option>
                {standards.slice(0, 15).map((std) => (
                  <option key={std} value={std}>{std}</option>
                ))}
              </select>

              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="shrink-0 h-8 text-xs bg-white border border-slate-200 rounded-lg px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Grade: All</option>
                {grades.map((grd) => (
                  <option key={grd} value={grd}>{grd}</option>
                ))}
              </select>

              <select
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                className="shrink-0 h-8 text-xs bg-white border border-slate-200 rounded-lg px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Stock: All</option>
                <option value="in_stock">In Stock (&gt;5k)</option>
                <option value="low_stock">Low Stock (1-5k)</option>
                <option value="out_of_stock">Out of Stock (0)</option>
              </select>

              <select
                value={selectedCatalog}
                onChange={(e) => setSelectedCatalog(e.target.value)}
                className="shrink-0 h-8 text-xs bg-white border border-slate-200 rounded-lg px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Catalog: All</option>
                <option value="standard">Standard</option>
                <option value="surplus">Surplus Lots</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="shrink-0 h-8 text-xs bg-white border border-slate-200 rounded-lg px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="default">Sort: Default</option>
                <option value="price_asc">Price: Low→High</option>
                <option value="price_desc">Price: High→Low</option>
                <option value="stock_desc">Stock: High→Low</option>
                <option value="sku_asc">SKU: A→Z</option>
              </select>

              {/* Reset button if active */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
                  title="Clear all filters"
                >
                  <RotateCcw size={11} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Showing Count */}
          <div className="text-[11px] sm:text-xs text-slate-500 font-medium whitespace-nowrap self-end md:self-center">
            Showing {totalCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–{Math.min(currentPage * itemsPerPage, totalCount)} of{' '}
            <strong className="text-slate-800 font-bold">{totalCount.toLocaleString()}</strong> SKUs
          </div>
        </div>

        {/* 3. BATCH ACTIONS BAR (WHEN 1+ PRODUCTS OR ENTIRE CATALOG IS SELECTED) */}
        {(selectedProductIds.size > 0 || isSelectAllCatalog) && (
          <div className="mx-4 my-2.5 bg-slate-900 text-white rounded-xl px-4 py-2.5 flex items-center justify-between flex-wrap gap-2.5 shadow-md">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono text-white ${isSelectAllCatalog ? 'bg-rose-600' : 'bg-blue-600'}`}>
                {isSelectAllCatalog ? `${totalCount.toLocaleString()} (ALL)` : `${selectedProductIds.size} Selected`}
              </span>
              <span className="text-xs text-slate-200 font-medium">
                {isSelectAllCatalog
                  ? `All ${totalCount.toLocaleString()} products ${hasActiveFilters ? 'matching filter' : 'in catalog'} selected`
                  : `${selectedProductIds.size} product${selectedProductIds.size > 1 ? 's' : ''} selected`}
              </span>
              {!isSelectAllCatalog && totalCount > selectedProductIds.size && (
                <button
                  type="button"
                  onClick={selectEntireCatalog}
                  className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500/30 text-xs rounded-md px-2.5 py-1 font-semibold transition-colors"
                >
                  ⚡ Select all {totalCount.toLocaleString()} products in catalog
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearSelection}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-md text-xs font-semibold transition-colors"
              >
                Deselect All
              </button>
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded-md text-xs font-bold transition-colors shadow-xs"
              >
                <Trash2 size={13} />
                <span>
                  {isSelectAllCatalog
                    ? `Delete Entire Catalog (${totalCount.toLocaleString()})`
                    : `Delete Selected (${selectedProductIds.size})`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* 4. SELECT ALL CATALOG BANNER */}
        {(isAllPageSelected || isSelectAllCatalog) && totalCount > serverProducts.length && !selectedProductIds.size && (
          <div className="mx-4 my-2 bg-blue-50 border border-blue-200 rounded-lg px-3.5 py-2 flex items-center justify-between text-xs text-blue-900 font-medium">
            <div className="flex items-center gap-2">
              <Info size={15} className="text-blue-600 shrink-0" />
              <span>All <strong>{serverProducts.length}</strong> products on this page are selected.</span>
            </div>
            <button
              type="button"
              onClick={selectEntireCatalog}
              className="text-blue-700 font-bold hover:underline"
            >
              Select all {totalCount.toLocaleString()} products in catalog
            </button>
          </div>
        )}

        {/* 5. VIEW MODE: GRID OR HIGH-DENSITY TABLE */}
        {viewMode === 'grid' ? (
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 mb-4">
              {isLoadingData ? (
                <div className="col-span-full py-16 text-center bg-white rounded-xl border border-slate-200">
                  <Loader2 size={26} className="animate-spin text-blue-600 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-800">Loading Fastener SKUs...</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Querying central database</div>
                </div>
              ) : totalCount === 0 ? (
                <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <AlertTriangle size={24} className="text-amber-500 mx-auto mb-1.5" />
                  <div className="text-xs font-bold text-slate-800">No Fasteners Matched</div>
                  <button type="button" onClick={handleResetFilters} className="mt-2 text-xs font-semibold text-blue-600 hover:underline">
                    Clear Filters
                  </button>
                </div>
              ) : (
                paginatedProducts.map((p) => {
                  const isLowStock = p.stockPcs > 0 && p.stockPcs <= 5000;
                  const isOutOfStock = p.stockPcs === 0;
                  const isSelected = selectedProductIds.has(p.id);

                  return (
                    <div
                      key={p.id}
                      className={`bg-white rounded-xl border p-3 flex flex-col justify-between transition-all group ${
                        isSelected
                          ? 'border-blue-600 ring-1 ring-blue-600 shadow-sm bg-blue-50/20'
                          : p.isSurplus
                          ? 'border-amber-200 hover:border-amber-400 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      {/* Top Media & Floating Badges */}
                      <div className="relative mb-2.5">
                        <div
                          className="relative h-32 bg-slate-50/80 rounded-lg border border-slate-100 flex items-center justify-center p-2 cursor-pointer hover:border-blue-300 transition-colors overflow-hidden"
                          onClick={() => setPreviewProduct(p)}
                          title="Click to preview photo"
                        >
                          <img
                            src={p.imageUrl || '/assets/bolt_zinc.jpg'}
                            alt={p.sku}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              try { (e.target as any).src = '/assets/bolt_zinc.jpg'; } catch {}
                            }}
                          />
                          {/* Centered Transparent Watermark Overlay */}
                          <div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10"
                            style={{ opacity: 0.22 }}
                          >
                            <img
                              src="/assets/cbh-watermark.png"
                              alt="CBH"
                              className="w-20 max-w-[55%] h-auto object-contain pointer-events-none"
                            />
                          </div>
                        </div>

                        {/* Top-Left Floating Checkbox */}
                        <div className="absolute top-2 left-2 z-10">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectProduct(p.id)}
                            className="w-4 h-4 rounded text-blue-600 bg-white shadow-xs cursor-pointer"
                          />
                        </div>

                        {/* Top-Right Floating Status Badge */}
                        <div className="absolute top-2 right-2 z-10">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs ${
                              isOutOfStock
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : isLowStock
                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'Ready'}
                          </span>
                        </div>
                      </div>

                      {/* Middle Details */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        {/* SKU & Standard Tag Bar */}
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/80 truncate max-w-[130px] inline-block"
                            title={p.sku}
                          >
                            {p.sku}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                            {p.standard || p.din || 'DIN'}
                          </span>
                          {p.isSurplus && (
                            <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-100 text-amber-700 shrink-0 flex items-center gap-0.5">
                              <Flame size={9} /> -{p.surplusDiscountPct}%
                            </span>
                          )}
                        </div>

                        {/* Product Title */}
                        <h4
                          className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug cursor-pointer hover:text-blue-600 transition-colors"
                          title={p.name}
                          onClick={() => {
                            setInspectProduct(p);
                            setInspectTab('overview');
                          }}
                        >
                          {p.name}
                        </h4>

                        {/* Size & Metallurgy */}
                        <p className="text-[11px] text-slate-500 truncate">
                          {p.sizeFormatted || `${p.diameter} × ${p.lengthMm}mm`} • {p.grade || 'Grade 8.8'}
                        </p>
                      </div>

                      {/* Bottom Pricing & Actions */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-[9px] font-semibold uppercase text-slate-400 block leading-tight">Rate</span>
                            <span className="font-mono font-bold text-xs text-blue-700">
                              {formatINR(p.pricePerPiece)} <span className="text-[9px] font-normal text-slate-400">/pc</span>
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-semibold uppercase text-slate-400 block leading-tight">Stock</span>
                            <span className="font-mono font-bold text-xs text-slate-800">
                              {p.stockPcs.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setInspectProduct(p);
                              setInspectTab('overview');
                            }}
                            className="flex-1 py-1 text-center rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          >
                            Specs
                          </button>
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Fastener"
                          >
                            <Edit size={12} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteProduct(p)}
                            className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* HIGH-DENSITY COMMERCIAL TABLE */
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 text-center w-9">
                    <input
                      type="checkbox"
                      checked={isAllPageSelected}
                      onChange={toggleSelectAllOnPage}
                      className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer"
                      title={isAllPageSelected ? 'Deselect all on this page' : 'Select all on this page'}
                    />
                  </th>
                  <th className="py-2.5 px-3.5 font-bold">SKU &amp; Fastener Details</th>
                  <th className="py-2.5 px-3 font-bold w-36">Grade &amp; Finish</th>
                  <th className="py-2.5 px-3 font-bold w-36">Rate (Pc / Kg)</th>
                  <th className="py-2.5 px-3 font-bold w-36">Stock &amp; Status</th>
                  <th className="py-2.5 px-3 font-bold w-28 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingData ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Loader2 size={26} className="animate-spin text-blue-600 mx-auto mb-2" />
                      <div className="text-xs font-bold text-slate-800">Loading Fastener SKUs...</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Querying central database catalog with limit pagination</div>
                    </td>
                  </tr>
                ) : totalCount === 0 && !search && selectedSubGroup === 'all' && selectedStandard === 'all' && selectedGrade === 'all' && selectedStock === 'all' && selectedCatalog === 'all' ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                        <PackageOpen size={20} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">Catalog Inventory is Empty</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-3">All fastener products have been removed. You can upload via Excel or restore demo catalog.</p>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsBulkUploadOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
                        >
                          <Upload size={13} />
                          <span>Upload Excel</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                        >
                          <Plus size={13} />
                          <span>Add Single SKU</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRestoreDefaultsAction}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100"
                        >
                          <RotateCcw size={13} />
                          <span>Restore Demo</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : totalCount === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <AlertTriangle size={24} className="text-amber-500 mx-auto mb-1.5" />
                      <div className="text-xs font-bold text-slate-800">No Fasteners Matched</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 mb-2.5">No products match your current search and filter combination.</div>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Clear Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((p) => {
                    const isLowStock = p.stockPcs > 0 && p.stockPcs <= 5000;
                    const isOutOfStock = p.stockPcs === 0;
                    const isSelected = selectedProductIds.has(p.id);

                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelected ? 'bg-blue-50/60' : p.isSurplus ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectProduct(p.id)}
                            className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer"
                          />
                        </td>

                        {/* SKU & Product Details */}
                        <td className="py-2 px-3.5">
                          <div
                            onClick={() => {
                              setInspectProduct(p);
                              setInspectTab('overview');
                            }}
                            className="flex items-center gap-2.5 cursor-pointer group"
                            title="Click to view specifications"
                          >
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewProduct(p);
                              }}
                              className="w-8 h-8 rounded-md border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0 hover:border-blue-400 transition-colors"
                              title="Click to preview photo"
                            >
                              <Image
                                src={p.imageUrl || '/assets/bolt_zinc.jpg'}
                                alt={p.sku}
                                width={32}
                                height={32}
                                unoptimized={Boolean(p.imageUrl && p.imageUrl.startsWith('http'))}
                                className="w-full h-full object-contain p-0.5"
                                onError={(e) => {
                                  try {
                                    (e.target as any).src = '/assets/bolt_zinc.jpg';
                                  } catch {}
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className="font-mono font-bold text-[11px] text-blue-600 bg-blue-50 border border-blue-200/70 px-1.5 py-0.5 rounded group-hover:bg-blue-100 transition-colors truncate max-w-[140px] sm:max-w-[180px] inline-block align-middle"
                                  title={p.sku}
                                >
                                  {p.sku}
                                </span>
                                <span className="font-mono text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                                  {p.standard || p.din || 'DIN'}
                                </span>
                                {p.isSurplus && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-100 px-1 py-0.2 rounded">
                                    <Flame size={9} /> -{p.surplusDiscountPct}%
                                  </span>
                                )}
                                <span className="text-[11px] text-slate-500 font-medium truncate">
                                  {p.sizeFormatted || `${p.diameter} × ${p.lengthMm}mm`}
                                </span>
                              </div>
                              <div className="text-xs font-semibold text-slate-900 truncate max-w-[280px] lg:max-w-[420px]">
                                {p.name}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Grade & Coating */}
                        <td className="py-2 px-3">
                          <div className="font-mono font-bold text-xs text-slate-800">
                            {p.grade || 'Grade 8.8'}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[120px]">
                            {p.finish || 'Zinc Plated'}
                          </div>
                        </td>

                        {/* Rate (Pc / Kg) */}
                        <td className="py-2 px-3">
                          <div className="font-mono font-bold text-xs text-blue-700">
                            {formatINR(p.pricePerPiece)} <span className="text-[10px] font-normal text-slate-500">/ pc</span>
                          </div>
                          <div className="font-mono font-semibold text-[11px] text-emerald-700">
                            {formatINR(p.pricePerKg)} <span className="text-[10px] font-normal text-slate-500">/ kg</span>
                          </div>
                        </td>

                        {/* Stock & Status */}
                        <td className="py-2 px-3">
                          <div className="font-mono font-bold text-xs text-slate-900">
                            {p.stockPcs.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">pcs</span>
                          </div>
                          <div>
                            <span
                              className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                isOutOfStock
                                  ? 'bg-rose-100 text-rose-700'
                                  : isLowStock
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'Ready Stock'}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-2 px-3 text-right pr-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectProduct(p);
                                setInspectTab('overview');
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                              title="Specs & dimensional telemetry"
                            >
                              <Eye size={12} />
                              <span className="hidden xl:inline">Specs</span>
                            </button>
                            <Link
                              href={`/admin/products/${p.id}/edit`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit fastener SKU"
                            >
                              <Edit size={13} />
                            </Link>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteProduct(p);
                              }}
                              className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete SKU"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. COMPACT PAGINATION FOOTER */}
        <div className="p-3 bg-slate-50/60 border-t border-slate-200">
          <TablePagination
            currentPage={currentPage}
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(limit) => {
              setItemsPerPage(limit);
              setCurrentPage(1);
            }}
            itemLabel="fastener SKUs"
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </div>
      </div>

      {/* MODAL 1: ADD FASTENER MODAL WITH ALL EXCEL INPUT FIELDS */}
      {isAddOpen && (
        <div className="modal-overlay active" onClick={() => setIsAddOpen(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '780px', width: '95%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-dark-900)', margin: 0 }}>
                  Register New Fastener (Excel Master Fields)
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Enter complete dimensional, standards, packaging, and commercial fields
                </span>
              </div>
              <button type="button" onClick={() => setIsAddOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
              {[
                { id: 'basic', label: '1. Classification & Brand' },
                { id: 'standards', label: '2. Standards (DIN/ISO)' },
                { id: 'dimensions', label: '3. Dimensions & Size' },
                { id: 'metallurgy', label: '4. Grade & Finish' },
                { id: 'pricing', label: '5. Weights & Pricing' },
                { id: 'packaging', label: '6. Packaging & Supply' },
                { id: 'media', label: '7. Photo & CAD' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAddModalTab(tab.id as any)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: addModalTab === tab.id ? '#0052CC' : '#F1F5F9',
                    color: addModalTab === tab.id ? '#FFFFFF' : '#475569',
                    fontSize: '11px',
                    fontWeight: addModalTab === tab.id ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={submitAddForm}>
              {/* TAB 1: CLASSIFICATION */}
              {addModalTab === 'basic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>SKU Code</label>
                      <input
                        type="text"
                        placeholder="e.g. CBH-933-M10-100-8.8"
                        value={addForm.sku}
                        onChange={(e) => setAddForm({ ...addForm, sku: e.target.value })}
                      />
                      <span className="hint">Auto-generated if left blank</span>
                    </div>

                    <div className="admin-form-group">
                      <label>Sub-Group (Excel Col 1)</label>
                      <input
                        type="text"
                        placeholder="e.g. SCREW, BOLTS, NUTS"
                        value={addForm.subGroup}
                        onChange={(e) => setAddForm({ ...addForm, subGroup: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Category (Excel Col 2)</label>
                      <input
                        type="text"
                        placeholder="e.g. SOCKET HEAD, HEX BOLTS"
                        value={addForm.category}
                        onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Sub-Category (Excel Col 3)</label>
                      <input
                        type="text"
                        placeholder="e.g. BUTTON COLLAR SCREWS, GRUB SCREWS"
                        value={addForm.subCategory}
                        onChange={(e) => setAddForm({ ...addForm, subCategory: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Official Fastener Item Name (Excel Col 8)</label>
                    <input
                      type="text"
                      placeholder="e.g. Socket Button Head Screw With Collar ISO 7380-2 M10X1.5X100 Grade 10.9 WZP"
                      value={addForm.name}
                      onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    />
                  </div>

                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Brand</label>
                      <input
                        type="text"
                        value={addForm.brand}
                        onChange={(e) => setAddForm({ ...addForm, brand: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>GST HSN Code</label>
                      <input
                        type="text"
                        placeholder="73181500"
                        value={addForm.hsnCode}
                        onChange={(e) => setAddForm({ ...addForm, hsnCode: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STANDARDS */}
              {addModalTab === 'standards' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Primary Standard Spec</label>
                      <input
                        type="text"
                        placeholder="DIN 933 or ISO 7380"
                        value={addForm.standard}
                        onChange={(e) => setAddForm({ ...addForm, standard: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>DIN Standard (Excel Col 8)</label>
                      <input
                        type="text"
                        placeholder="e.g. DIN 913, DIN 916, DIN 933"
                        value={addForm.din}
                        onChange={(e) => setAddForm({ ...addForm, din: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>ISO Standard (Excel Col 9)</label>
                      <input
                        type="text"
                        placeholder="e.g. ISO 4017, ISO 4029, ISO 7380-2"
                        value={addForm.isoStandard}
                        onChange={(e) => setAddForm({ ...addForm, isoStandard: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>BS Standard (Excel Col 17) / ASME</label>
                      <input
                        type="text"
                        placeholder="e.g. BS 4168 or ASME B18.3"
                        value={addForm.bsStandard}
                        onChange={(e) => setAddForm({ ...addForm, bsStandard: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Thread Length (Excel Col 4)</label>
                      <select
                        value={addForm.threadLength}
                        onChange={(e) => setAddForm({ ...addForm, threadLength: e.target.value, threadType: e.target.value })}
                      >
                        <option value="FULL THREAD">FULL THREAD</option>
                        <option value="HALF THREAD">HALF THREAD / PARTIAL</option>
                        <option value="COARSE THREAD">COARSE THREAD</option>
                        <option value="FINE THREAD">FINE THREAD</option>
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label>Thread Pitch Type</label>
                      <select
                        value={addForm.threadType}
                        onChange={(e) => setAddForm({ ...addForm, threadType: e.target.value })}
                      >
                        <option value="Metric Coarse">Metric Coarse</option>
                        <option value="Metric Fine">Metric Fine</option>
                        <option value="UNC">UNC (Inch)</option>
                        <option value="UNF">UNF (Inch)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DIMENSIONS */}
              {addModalTab === 'dimensions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Diameter (DIA) (Excel Col 22)</label>
                      <input
                        type="text"
                        placeholder="e.g. M3, M4, M6, M8, M10, M12"
                        value={addForm.diameter}
                        onChange={(e) => {
                          const dia = e.target.value;
                          setAddForm({
                            ...addForm,
                            diameter: dia,
                            sizeFormatted: `${dia}X${addForm.pitchMm}X${addForm.lengthMm}`
                          });
                        }}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Pitch / TPI (Excel Col 23)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 1.5, 1.25, 1.0, 0.5"
                        value={addForm.pitchMm}
                        onChange={(e) => {
                          const pitch = e.target.value;
                          setAddForm({
                            ...addForm,
                            pitchMm: pitch,
                            sizeFormatted: `${addForm.diameter}X${pitch}X${addForm.lengthMm}`
                          });
                        }}
                      />
                    </div>
                  </div>

                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Length (mm) (Excel Col 24)</label>
                      <input
                        type="number"
                        placeholder="e.g. 100, 50, 25, 10"
                        value={addForm.lengthMm}
                        onChange={(e) => {
                          const len = e.target.value;
                          setAddForm({
                            ...addForm,
                            lengthMm: len,
                            sizeFormatted: `${addForm.diameter}X${addForm.pitchMm}X${len}`
                          });
                        }}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Formatted Size (Excel Col 99)</label>
                      <input
                        type="text"
                        placeholder="e.g. M10X1.5X100"
                        value={addForm.sizeFormatted}
                        onChange={(e) => setAddForm({ ...addForm, sizeFormatted: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: METALLURGY */}
              {addModalTab === 'metallurgy' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Property Class / Grade (Excel Col 26)</label>
                      <input
                        type="text"
                        placeholder="e.g. 8.8, 10.9, 12.9, 45H, SS 304, SS 316"
                        value={addForm.grade}
                        onChange={(e) => setAddForm({ ...addForm, grade: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Surface Finish / Coating (Excel Col 31)</label>
                      <input
                        type="text"
                        placeholder="e.g. Black Passivated (BP), White Zinc (WZP), HDG"
                        value={addForm.finish}
                        onChange={(e) => setAddForm({ ...addForm, finish: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: PRICING & WEIGHTS */}
              {addModalTab === 'pricing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Unit Weight (Kg/Pc) (Excel Col 30)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={addForm.weightPerPcKg}
                        onChange={(e) => {
                          const w = parseFloat(e.target.value) || 0;
                          setAddForm({
                            ...addForm,
                            weightPerPcKg: e.target.value,
                            weightPer1000PcsKg: (w * 1000).toFixed(3)
                          });
                        }}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Weight / 1000 Pcs (Kg) (Excel Col 77)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={addForm.weightPer1000PcsKg}
                        onChange={(e) => setAddForm({ ...addForm, weightPer1000PcsKg: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Rate / Piece (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={addForm.pricePerPiece}
                        onChange={(e) => {
                          const pc = parseFloat(e.target.value) || 0;
                          setAddForm({
                            ...addForm,
                            pricePerPiece: e.target.value,
                            price100Pcs: (pc * 100).toFixed(2),
                            price1000Pcs: (pc * 1000).toFixed(2)
                          });
                        }}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Rate / Kg (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={addForm.pricePerKg}
                        onChange={(e) => setAddForm({ ...addForm, pricePerKg: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Price 100 Pcs (₹) (Excel Col 136)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={addForm.price100Pcs}
                        onChange={(e) => setAddForm({ ...addForm, price100Pcs: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Price 1000 Pcs (₹) (Excel Col 137)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={addForm.price1000Pcs}
                        onChange={(e) => setAddForm({ ...addForm, price1000Pcs: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: PACKAGING & LOGISTICS */}
              {addModalTab === 'packaging' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Pcs Per Small Box (Excel Col 60)</label>
                      <input
                        type="text"
                        placeholder="e.g. 500 or 1000"
                        value={addForm.pcsPerBox}
                        onChange={(e) => setAddForm({ ...addForm, pcsPerBox: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Small Box Weight (Kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={addForm.smallBoxWeightKg}
                        onChange={(e) => setAddForm({ ...addForm, smallBoxWeightKg: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Pcs Per Master Carton (Excel Col 63)</label>
                      <input
                        type="text"
                        placeholder="e.g. 4000 or 8000"
                        value={addForm.pcsPerMasterCtn}
                        onChange={(e) => setAddForm({ ...addForm, pcsPerMasterCtn: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Master Carton Weight (Kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={addForm.masterCtnWeightKg}
                        onChange={(e) => setAddForm({ ...addForm, masterCtnWeightKg: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>MOQ (Excel Col 69)</label>
                      <input
                        type="text"
                        placeholder="e.g. 25 KGS or 1000 Pcs"
                        value={addForm.moq}
                        onChange={(e) => setAddForm({ ...addForm, moq: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Lead Time (Days) [Prod: 7d + Pack: 3d = 10d]</label>
                      <input
                        type="number"
                        value={addForm.leadTimeDays}
                        onChange={(e) => setAddForm({ ...addForm, leadTimeDays: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Inventory Warehouse Stock (Pcs)</label>
                      <input
                        type="number"
                        value={addForm.stockPcs}
                        onChange={(e) => setAddForm({ ...addForm, stockPcs: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Surplus Clearance Lot</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '40px' }}>
                        <input
                          type="checkbox"
                          id="addSurplusCheck"
                          checked={addForm.isSurplus}
                          onChange={(e) => setAddForm({ ...addForm, isSurplus: e.target.checked })}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <label htmlFor="addSurplusCheck" style={{ margin: 0, textTransform: 'none', cursor: 'pointer', fontSize: '13px' }}>
                          Mark as Surplus (-{addForm.surplusDiscountPct}%)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: MEDIA & ATTACHMENTS */}
              {addModalTab === 'media' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <FastenerImageUploader
                    currentUrl={addForm.imageUrl}
                    onUrlChange={(url) => setAddForm({ ...addForm, imageUrl: url })}
                    label="Fastener Product Photo (New SKU)"
                  />

                  <div className="admin-form-group">
                    <label>AutoCAD 2D / 3D Drawing Link (Excel Col 74)</label>
                    <input
                      type="text"
                      placeholder="https://drive.google.com/file/... or /cad/drawing.dwg"
                      value={addForm.drawingUrl}
                      onChange={(e) => setAddForm({ ...addForm, drawingUrl: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Original Google Drive Image Link (Excel Col 73)</label>
                    <input
                      type="text"
                      placeholder="https://drive.google.com/file/... or direct photo link"
                      value={addForm.gdriveImageUrl}
                      onChange={(e) => setAddForm({ ...addForm, gdriveImageUrl: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {addModalTab !== 'basic' && (
                    <button
                      type="button"
                      className="btn-outline"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => {
                        const tabs = ['basic', 'standards', 'dimensions', 'metallurgy', 'pricing', 'packaging', 'media'];
                        const idx = tabs.indexOf(addModalTab);
                        if (idx > 0) setAddModalTab(tabs[idx - 1] as any);
                      }}
                    >
                      ← Previous
                    </button>
                  )}
                  {addModalTab !== 'media' && (
                    <button
                      type="button"
                      className="btn-outline"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => {
                        const tabs = ['basic', 'standards', 'dimensions', 'metallurgy', 'pricing', 'packaging', 'media'];
                        const idx = tabs.indexOf(addModalTab);
                        if (idx < tabs.length - 1) setAddModalTab(tabs[idx + 1] as any);
                      }}
                    >
                      Next Step →
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setIsAddOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    <Plus size={15} />
                    <span>Save New Fastener SKU</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT FASTENER MODAL WITH ALL EXCEL INPUT FIELDS */}
      {editProduct && (
        <div className="modal-overlay active" onClick={() => setEditProduct(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '780px', width: '95%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-dark-900)', margin: 0 }}>
                  Edit Fastener: {editProduct.sku}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Update engineering specifications, packaging counts, rates, or drawing attachments
                </span>
              </div>
              <button type="button" onClick={() => setEditProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
              {[
                { id: 'basic', label: '1. Classification & Brand' },
                { id: 'standards', label: '2. Standards (DIN/ISO)' },
                { id: 'dimensions', label: '3. Dimensions & Size' },
                { id: 'metallurgy', label: '4. Grade & Finish' },
                { id: 'pricing', label: '5. Weights & Pricing' },
                { id: 'packaging', label: '6. Packaging & Supply' },
                { id: 'media', label: '7. Photo & CAD' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setEditModalTab(tab.id as any)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: editModalTab === tab.id ? '#0052CC' : '#F1F5F9',
                    color: editModalTab === tab.id ? '#FFFFFF' : '#475569',
                    fontSize: '11px',
                    fontWeight: editModalTab === tab.id ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={submitEditForm}>
              {/* TAB 1: BASIC & HIERARCHY */}
              {editModalTab === 'basic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="admin-form-group">
                    <label>Official Product Name (Excel Col 8)</label>
                    <input
                      type="text"
                      value={editProduct.name}
                      onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                    />
                  </div>

                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Sub-Group (Excel Col 1)</label>
                      <input
                        type="text"
                        value={editProduct.subGroup || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, subGroup: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Category (Excel Col 2)</label>
                      <input
                        type="text"
                        value={editProduct.category}
                        onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Sub-Category (Excel Col 3)</label>
                      <input
                        type="text"
                        value={editProduct.subCategory || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, subCategory: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>GST HSN Code</label>
                      <input
                        type="text"
                        value={editProduct.hsnCode || '73181500'}
                        onChange={(e) => setEditProduct({ ...editProduct, hsnCode: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STANDARDS */}
              {editModalTab === 'standards' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Primary Standard</label>
                      <input
                        type="text"
                        value={editProduct.standard}
                        onChange={(e) => setEditProduct({ ...editProduct, standard: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>DIN Standard (Excel Col 8)</label>
                      <input
                        type="text"
                        value={editProduct.din || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, din: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>ISO Standard (Excel Col 9)</label>
                      <input
                        type="text"
                        value={editProduct.isoStandard || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, isoStandard: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>BS Standard (Excel Col 17)</label>
                      <input
                        type="text"
                        value={editProduct.bsStandard || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, bsStandard: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Thread Length (Excel Col 4)</label>
                      <input
                        type="text"
                        value={editProduct.threadLength || editProduct.threadType}
                        onChange={(e) => setEditProduct({ ...editProduct, threadLength: e.target.value, threadType: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Thread Pitch Standard</label>
                      <input
                        type="text"
                        value={editProduct.threadType}
                        onChange={(e) => setEditProduct({ ...editProduct, threadType: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DIMENSIONS */}
              {editModalTab === 'dimensions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Diameter (DIA) (Excel Col 22)</label>
                      <input
                        type="text"
                        value={editProduct.diameter}
                        onChange={(e) => setEditProduct({ ...editProduct, diameter: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Pitch (mm) (Excel Col 23)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editProduct.pitchMm}
                        onChange={(e) => setEditProduct({ ...editProduct, pitchMm: parseFloat(e.target.value) || 1.5 })}
                      />
                    </div>
                  </div>

                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Length (mm) (Excel Col 24)</label>
                      <input
                        type="number"
                        value={editProduct.lengthMm}
                        onChange={(e) => setEditProduct({ ...editProduct, lengthMm: parseInt(e.target.value) || 100 })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Formatted Size (Excel Col 99)</label>
                      <input
                        type="text"
                        value={editProduct.sizeFormatted || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, sizeFormatted: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: METALLURGY */}
              {editModalTab === 'metallurgy' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Property Class / Grade (Excel Col 26)</label>
                      <input
                        type="text"
                        value={editProduct.grade}
                        onChange={(e) => setEditProduct({ ...editProduct, grade: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Surface Finish / Coating (Excel Col 31)</label>
                      <input
                        type="text"
                        value={editProduct.finish}
                        onChange={(e) => setEditProduct({ ...editProduct, finish: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: PRICING & WEIGHTS */}
              {editModalTab === 'pricing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Rate / Piece (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editProduct.pricePerPiece}
                        onChange={(e) => {
                          const pc = parseFloat(e.target.value) || 0;
                          setEditProduct({
                            ...editProduct,
                            pricePerPiece: pc,
                            price100Pcs: +(pc * 100).toFixed(2),
                            price1000Pcs: +(pc * 1000).toFixed(2)
                          });
                        }}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Rate / Kg (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editProduct.pricePerKg}
                        onChange={(e) => setEditProduct({ ...editProduct, pricePerKg: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Unit Weight (Kg/Pc) (Excel Col 30)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={editProduct.weightPerPcKg}
                        onChange={(e) => {
                          const w = parseFloat(e.target.value) || 0;
                          setEditProduct({
                            ...editProduct,
                            weightPerPcKg: w,
                            weightPer1000PcsKg: +(w * 1000).toFixed(3)
                          });
                        }}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Weight / 1000 Pcs (Kg) (Excel Col 77)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={editProduct.weightPer1000PcsKg || (editProduct.weightPerPcKg * 1000).toFixed(3)}
                        onChange={(e) => setEditProduct({ ...editProduct, weightPer1000PcsKg: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Price 100 Pcs (₹) (Excel Col 136)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editProduct.price100Pcs || (editProduct.pricePerPiece * 100).toFixed(2)}
                        onChange={(e) => setEditProduct({ ...editProduct, price100Pcs: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Price 1000 Pcs (₹) (Excel Col 137)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editProduct.price1000Pcs || (editProduct.pricePerPiece * 1000).toFixed(2)}
                        onChange={(e) => setEditProduct({ ...editProduct, price1000Pcs: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: PACKAGING & LOGISTICS */}
              {editModalTab === 'packaging' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Pcs Per Small Box (Excel Col 60)</label>
                      <input
                        type="text"
                        value={editProduct.pcsPerBox || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, pcsPerBox: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Small Box Weight (Kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editProduct.smallBoxWeightKg || 2.5}
                        onChange={(e) => setEditProduct({ ...editProduct, smallBoxWeightKg: parseFloat(e.target.value) || 2.5 })}
                      />
                    </div>
                  </div>

                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Pcs Per Master Carton (Excel Col 63)</label>
                      <input
                        type="text"
                        value={editProduct.pcsPerMasterCtn || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, pcsPerMasterCtn: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Master Carton Weight (Kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editProduct.masterCtnWeightKg || 20}
                        onChange={(e) => setEditProduct({ ...editProduct, masterCtnWeightKg: parseFloat(e.target.value) || 20 })}
                      />
                    </div>
                  </div>

                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>MOQ (Excel Col 69)</label>
                      <input
                        type="text"
                        value={editProduct.moq || '25 KGS'}
                        onChange={(e) => setEditProduct({ ...editProduct, moq: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Lead Time (Days)</label>
                      <input
                        type="number"
                        value={editProduct.leadTimeDays || 10}
                        onChange={(e) => setEditProduct({ ...editProduct, leadTimeDays: parseInt(e.target.value) || 10 })}
                      />
                    </div>
                  </div>

                  <div className="admin-modal-grid">
                    <div className="admin-form-group">
                      <label>Inventory Stock (Pcs)</label>
                      <input
                        type="number"
                        value={editProduct.stockPcs}
                        onChange={(e) => setEditProduct({ ...editProduct, stockPcs: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Surplus Status</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '40px' }}>
                        <input
                          type="checkbox"
                          id="editSurplusCheck"
                          checked={Boolean(editProduct.isSurplus)}
                          onChange={(e) => setEditProduct({ ...editProduct, isSurplus: e.target.checked, surplusDiscountPct: e.target.checked ? 35 : 0 })}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <label htmlFor="editSurplusCheck" style={{ margin: 0, textTransform: 'none', cursor: 'pointer', fontSize: '13px' }}>
                          Mark as Surplus Clearance (-{editProduct.surplusDiscountPct || 35}%)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: MEDIA & ATTACHMENTS */}
              {editModalTab === 'media' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <FastenerImageUploader
                    currentUrl={editProduct.imageUrl || '/assets/bolt_zinc.jpg'}
                    onUrlChange={(url) => setEditProduct({ ...editProduct, imageUrl: url })}
                    label="Fastener Product Photo (Update SKU)"
                  />

                  <div className="admin-form-group">
                    <label>AutoCAD 2D/3D Drawing URL (Excel Col 74)</label>
                    <input
                      type="text"
                      value={editProduct.drawingUrl || ''}
                      onChange={(e) => setEditProduct({ ...editProduct, drawingUrl: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Google Drive High-Res Photo URL (Excel Col 73)</label>
                    <input
                      type="text"
                      value={editProduct.gdriveImageUrl || ''}
                      onChange={(e) => setEditProduct({ ...editProduct, gdriveImageUrl: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {editModalTab !== 'basic' && (
                    <button
                      type="button"
                      className="btn-outline"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => {
                        const tabs = ['basic', 'standards', 'dimensions', 'metallurgy', 'pricing', 'packaging', 'media'];
                        const idx = tabs.indexOf(editModalTab);
                        if (idx > 0) setEditModalTab(tabs[idx - 1] as any);
                      }}
                    >
                      ← Previous
                    </button>
                  )}
                  {editModalTab !== 'media' && (
                    <button
                      type="button"
                      className="btn-outline"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => {
                        const tabs = ['basic', 'standards', 'dimensions', 'metallurgy', 'pricing', 'packaging', 'media'];
                        const idx = tabs.indexOf(editModalTab);
                        if (idx < tabs.length - 1) setEditModalTab(tabs[idx + 1] as any);
                      }}
                    >
                      Next Step →
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setEditProduct(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    <CheckCircle2 size={15} />
                    <span>Save SKU Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: FULL EXCEL MASTER ROW INSPECTOR */}
      {/* {inspectProduct && (
        <div className="modal-overlay active" onClick={() => setInspectProduct(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '820px', width: '95%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #CBD5E1', background: '#F8FAFC' }}>
                  <img src={inspectProduct.imageUrl || '/assets/bolt_zinc.jpg'} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '18px', fontWeight: 800, margin: 0 }}>
                    {inspectProduct.sku}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    {inspectProduct.name}
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setInspectProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '4px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <tbody>
                  <tr style={{ background: '#F8FAFC' }}><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', width: '35%', fontWeight: 700 }}>Sub-Group (Col 1)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0' }}>{inspectProduct.subGroup || 'SCREW'}</td></tr>
                  <tr><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Category (Col 2)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0' }}>{inspectProduct.category}</td></tr>
                  <tr style={{ background: '#F8FAFC' }}><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Sub-Category (Col 3)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0' }}>{inspectProduct.subCategory || 'ALLEN GRUB SCREWS'}</td></tr>
                  <tr><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Thread Length (Col 4)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0' }}>{inspectProduct.threadLength || inspectProduct.threadType}</td></tr>
                  <tr style={{ background: '#F8FAFC' }}><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>DIN Standard (Col 8)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0' }}>{inspectProduct.din || inspectProduct.standard}</td></tr>
                  <tr><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>ISO Standard (Col 9)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0' }}>{inspectProduct.isoStandard || '—'}</td></tr>
                  <tr style={{ background: '#F8FAFC' }}><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>BS / ASME Standard (Col 16-17)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0' }}>{inspectProduct.bsStandard || inspectProduct.asmeStandard || '—'}</td></tr>
                  <tr><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Diameter (DIA) (Col 22)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontFamily: 'var(--font-mono)' }}>{inspectProduct.diameter}</td></tr>
                  <tr style={{ background: '#F8FAFC' }}><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Pitch (Col 23)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontFamily: 'var(--font-mono)' }}>{inspectProduct.pitchMm} mm</td></tr>
                  <tr><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Length (Col 24)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontFamily: 'var(--font-mono)' }}>{inspectProduct.lengthMm} mm</td></tr>
                  <tr style={{ background: '#F8FAFC' }}><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Formatted Size (Col 99)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{inspectProduct.sizeFormatted || `${inspectProduct.diameter}X${inspectProduct.pitchMm}X${inspectProduct.lengthMm}`}</td></tr>
                  <tr><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Material Grade (Col 26)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>{inspectProduct.grade}</td></tr>
                  <tr style={{ background: '#F8FAFC' }}><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Surface Finish (Col 31)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0' }}>{inspectProduct.finish}</td></tr>
                  <tr><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Per Piece Weight (Col 30)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontFamily: 'var(--font-mono)' }}>{inspectProduct.weightPerPcKg} kg</td></tr>
                  <tr style={{ background: '#F8FAFC' }}><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Weight / 1000 Pcs (Col 77)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontFamily: 'var(--font-mono)' }}>{inspectProduct.weightPer1000PcsKg || (inspectProduct.weightPerPcKg * 1000).toFixed(3)} kg</td></tr>
                  <tr><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Rate / Piece</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0052CC' }}>{formatINR(inspectProduct.pricePerPiece)}</td></tr>
                  <tr style={{ background: '#F8FAFC' }}><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Rate / Kg</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#059669' }}>{formatINR(inspectProduct.pricePerKg)}</td></tr>
                  <tr><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Price 100 Pcs (Col 136)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontFamily: 'var(--font-mono)' }}>{formatINR(inspectProduct.price100Pcs || inspectProduct.pricePerPiece * 100)}</td></tr>
                  <tr style={{ background: '#F8FAFC' }}><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Price 1000 Pcs (Col 137)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontFamily: 'var(--font-mono)' }}>{formatINR(inspectProduct.price1000Pcs || inspectProduct.pricePerPiece * 1000)}</td></tr>
                  <tr><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Small Box Packaging (Col 60)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0' }}>{Math.round(Number(inspectProduct.pcsPerBox)) || '500'} pcs ({inspectProduct.smallBoxWeightKg || 2.5} kg box)</td></tr>
                  <tr style={{ background: '#F8FAFC' }}><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Master Carton Packaging (Col 63)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0' }}>{inspectProduct.pcsPerMasterCtn || '4000'} pcs ({inspectProduct.masterCtnWeightKg || 20} kg carton)</td></tr>
                  <tr><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>MOQ (Col 69)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>{inspectProduct.moq || '25 KGS'}</td></tr>
                  <tr style={{ background: '#F8FAFC' }}><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Lead Time (Col 33/35)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0' }}>{inspectProduct.leadTimeDays || 10} Days (Production: {inspectProduct.productionDays || 7}d, Packing: {inspectProduct.packingDays || 3}d)</td></tr>
                  <tr><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Warehouse Stock</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontFamily: 'var(--font-mono)' }}>{inspectProduct.stockPcs.toLocaleString()} pcs ({inspectProduct.stockKg.toFixed(2)} Kg)</td></tr>
                  <tr style={{ background: '#F8FAFC' }}><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Brand & GST HSN Code</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0' }}>{inspectProduct.brand || 'CBH'} • HSN {inspectProduct.hsnCode || '73181500'}</td></tr>
                  <tr>
                    <td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>CAD Drawing (Col 74)</td>
                    <td style={{ padding: '6px 12px', border: '1px solid #E2E8F0' }}>
                      {inspectProduct.drawingUrl ? (
                        <a href={inspectProduct.drawingUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0052CC', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          Open Drawing CAD <ExternalLink size={12} />
                        </a>
                      ) : 'No drawing link attached'}
                    </td>
                  </tr>
                  <tr style={{ background: '#F8FAFC' }}>
                    <td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Google Drive Photo (Col 73)</td>
                    <td style={{ padding: '6px 12px', border: '1px solid #E2E8F0' }}>
                      {inspectProduct.gdriveImageUrl ? (
                        <a href={inspectProduct.gdriveImageUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          View High-Res Photo <ExternalLink size={12} />
                        </a>
                      ) : 'No external photo link attached'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {inspectProduct.descriptionHtml && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <strong style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#334155' }}>Raw HTML Technical Specification Sheet:</strong>
                  <div dangerouslySetInnerHTML={{ __html: inspectProduct.descriptionHtml }} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setInspectProduct(null)}
              >
                Close Inspector
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  const target = inspectProduct;
                  setInspectProduct(null);
                  setEditProduct({ ...target });
                  setEditModalTab('basic');
                }}
              >
                <Edit size={14} />
                <span>Edit this SKU</span>
              </button>
            </div>
          </div>
        </div>
      )} */}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {deleteProduct && (
        <div className="modal-overlay active" onClick={() => setDeleteProduct(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '440px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#FEE2E2',
                color: '#DC2626',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
              }}>
                <Trash2 size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '18px', fontWeight: 800, margin: '0 0 6px', color: 'var(--color-dark-900)' }}>
                Delete Fastener SKU?
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                Are you sure you want to delete <strong>{deleteProduct.sku}</strong> ({deleteProduct.name})?
                This will delist the product from both the public catalog matrix and the RFQ engine.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-outline"
                style={{ flex: 1 }}
                onClick={() => setDeleteProduct(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1, background: '#DC2626' }}
                onClick={confirmDelete}
              >
                Yes, Delete SKU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4B: BULK DELETE MULTIPLE PRODUCTS CONFIRMATION */}
      {isBulkDeleteModalOpen && (
        <div
          className="modal-overlay active"
          onClick={() => {
            if (!isDeletingBulk) setIsBulkDeleteModalOpen(false);
          }}
        >
          <div
            className="modal-window"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '24px', maxWidth: '480px', width: '95%' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px',
                }}
              >
                <Trash2 size={24} />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: '18px',
                  fontWeight: 800,
                  margin: '0 0 6px',
                  color: '#0F172A',
                }}
              >
                {isSelectAllCatalog
                  ? `Delete All ${totalCount.toLocaleString()} Products in Catalog?`
                  : `Delete ${selectedProductIds.size} Selected ${selectedProductIds.size === 1 ? 'Product' : 'Products'}?`}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px', lineHeight: '1.5' }}>
                {isSelectAllCatalog
                  ? `CAUTION: You are about to permanently delete all ${totalCount.toLocaleString()} fastener products from the central database${hasActiveFilters ? ' matching your active filter parameters' : ''}. The catalog will be completely emptied until new products are uploaded.`
                  : `Are you sure you want to permanently delete these ${selectedProductIds.size} fastener SKUs from the central database? They will be delisted from the catalog, search index, and the RFQ engine.`}
              </p>

              {/* Preview chips or Entire Catalog Badge */}
              {isSelectAllCatalog ? (
                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1.5px solid #FCA5A5',
                    borderRadius: '10px',
                    padding: '14px',
                    color: '#991B1B',
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertTriangle size={18} color="#DC2626" />
                  <span>Entire Catalog Target: All {totalCount.toLocaleString()} SKUs across all pages</span>
                </div>
              ) : (
                <div
                  style={{
                    maxHeight: '140px',
                    overflowY: 'auto',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '10px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    justifyContent: 'center',
                  }}
                >
                  {Array.from(selectedProductIds).slice(0, 16).map((id) => {
                    const p = serverProducts.find((item) => item.id === id);
                    return (
                      <span
                        key={id}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          color: '#334155',
                        }}
                      >
                        {p?.sku || `SKU #${id}`}
                      </span>
                    );
                  })}
                  {selectedProductIds.size > 16 && (
                    <span style={{ fontSize: '11px', color: '#64748B', alignSelf: 'center', fontWeight: 600 }}>
                      + {selectedProductIds.size - 16} more
                    </span>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-outline"
                style={{ flex: 1 }}
                onClick={() => setIsBulkDeleteModalOpen(false)}
                disabled={isDeletingBulk}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{
                  flex: 1,
                  background: '#DC2626',
                  borderColor: '#DC2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onClick={handleExecuteBulkDelete}
                disabled={isDeletingBulk}
              >
                {isDeletingBulk ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting Products...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>
                      Yes, Delete {isSelectAllCatalog ? `All ${totalCount.toLocaleString()} Products` : `${selectedProductIds.size} SKUs`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: DYNAMIC IMAGE & CAD BLUEPRINT PREVIEW LIGHTBOX */}
      {previewProduct && (
        <div className="modal-overlay active" onClick={() => setPreviewProduct(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '640px', width: '95%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#0052CC', fontWeight: 700, padding: '2px 8px', background: '#EFF6FF', borderRadius: '4px', border: '1px solid #BFDBFE' }}>
                  {previewProduct.sku}
                </span>
                <h3 style={{ margin: '8px 0 2px', fontSize: '16px', fontWeight: 800, color: '#0F172A', lineHeight: '1.4' }}>
                  {previewProduct.name}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {previewProduct.category} • {previewProduct.standard}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Main High-Res Image Display */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              textAlign: 'center',
              minHeight: '260px',
              maxHeight: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              marginBottom: '16px',
              position: 'relative'
            }}>
              <img
                src={previewProduct.imageUrl || '/assets/bolt_zinc.jpg'}
                alt={previewProduct.sku}
                style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/bolt_zinc.jpg';
                }}
              />
              {/* Centered Transparent Watermark Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '180px',
                  maxWidth: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.22,
                  pointerEvents: 'none',
                }}
              >
                <img
                  src="/assets/cbh-watermark.png"
                  alt="CBH Watermark"
                  style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                />
              </div>
            </div>

            {/* Live Image Source Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F1F5F9', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '11px', color: '#475569' }}>
              <span style={{ fontWeight: 600 }}>Image Location:</span>
              <span style={{ fontFamily: 'var(--font-mono)', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {previewProduct.imageUrl || 'Default Local Asset'}
              </span>
            </div>

            {/* Quick Specs Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '16px', fontSize: '11px' }}>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '10px' }}>Size:</span>
                <strong>{previewProduct.sizeFormatted || `${previewProduct.diameter}x${previewProduct.lengthMm}`}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '10px' }}>Grade:</span>
                <strong>{previewProduct.grade}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '10px' }}>Rate / Pc:</span>
                <strong style={{ color: '#0052CC', fontFamily: 'var(--font-mono)' }}>{formatINR(previewProduct.pricePerPiece)}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '10px' }}>Stock:</span>
                <strong style={{ color: '#059669', fontFamily: 'var(--font-mono)' }}>{previewProduct.stockPcs.toLocaleString()} pcs</strong>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {previewProduct.drawingUrl && (
                <a
                  href={previewProduct.drawingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', textDecoration: 'none' }}
                >
                  <ExternalLink size={13} />
                  <span>Technical CAD Drawing</span>
                </a>
              )}
              {previewProduct.gdriveImageUrl && (
                <a
                  href={previewProduct.gdriveImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', textDecoration: 'none' }}
                >
                  <ExternalLink size={13} />
                  <span>High-Res Drive Photo</span>
                </a>
              )}
              <button
                type="button"
                className="btn-primary"
                onClick={() => setPreviewProduct(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: PRODUCT DETAILS POP-UP BAR / SLIDE-OVER DRAWER */}
      {inspectProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'flex-end',
            transition: 'all 0.25s ease'
          }}
          onClick={() => setInspectProduct(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '600px',
              height: '100%',
              background: '#FFFFFF',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Pop-up Bar Header */}
            <div style={{
              padding: '18px 20px',
              borderBottom: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#0052CC',
                    background: '#EFF6FF',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid #BFDBFE',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    maxWidth: '280px'
                  }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={inspectProduct.sku}>
                      {inspectProduct.sku}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(inspectProduct.sku);
                        setCopiedSku(true);
                        setTimeout(() => setCopiedSku(false), 2000);
                      }}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#0052CC', display: 'flex', alignItems: 'center' }}
                      title="Copy SKU code"
                    >
                      {copiedSku ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                    </button>
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    background: '#F1F5F9',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    color: '#475569'
                  }}>
                    {inspectProduct.standard || inspectProduct.din || 'DIN'}
                  </span>
                  {inspectProduct.isSurplus && (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      background: '#FEF3C7',
                      color: '#B45309',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      <Flame size={11} /> -{inspectProduct.surplusDiscountPct}% SURPLUS
                    </span>
                  )}
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#0F172A',
                    lineHeight: '1.35',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                  title={inspectProduct.name}
                >
                  {inspectProduct.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectProduct(null)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748B'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Pop-up Bar Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #E2E8F0',
              background: '#FFFFFF',
              padding: '0 16px',
              flexShrink: 0,
              gap: '4px',
              overflowX: 'auto'
            }}>
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'dimensions', label: 'Dimensions & Specs' },
                { id: 'pricing', label: 'Pricing & Packaging' },
                { id: 'inventory', label: 'Stock Telemetry' },
              ].map((tab) => {
                const isActive = inspectTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setInspectTab(tab.id as any)}
                    style={{
                      padding: '10px 14px',
                      border: 'none',
                      borderBottom: isActive ? '2px solid #0052CC' : '2px solid transparent',
                      background: 'none',
                      color: isActive ? '#0052CC' : '#64748B',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '12px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Pop-up Bar Scrollable Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {inspectTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Photo & CAD preview */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '14px',
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '6px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Image
                        src={inspectProduct.imageUrl || '/assets/bolt_zinc.jpg'}
                        alt={inspectProduct.sku}
                        width={72}
                        height={72}
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
                        {inspectProduct.category} • {inspectProduct.subGroup || 'Standard Fastener'}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A', marginBottom: '8px' }}>
                        {inspectProduct.sizeFormatted || `${inspectProduct.diameter} × ${inspectProduct.lengthMm}mm`}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {inspectProduct.drawingUrl ? (
                          <a
                            href={inspectProduct.drawingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              background: '#EDE9FE',
                              color: '#6D28D9',
                              fontSize: '11px',
                              fontWeight: 700,
                              textDecoration: 'none'
                            }}
                          >
                            <ExternalLink size={12} />
                            <span>CAD Blueprint</span>
                          </a>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>No CAD uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Overview Data Table */}
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', background: '#F8FAFC', fontWeight: 700, fontSize: '12px', borderBottom: '1px solid #E2E8F0', color: '#334155' }}>
                      Fastener Identification
                    </div>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 14px', color: '#64748B', width: '40%' }}>Product SKU</td>
                          <td style={{ padding: '8px 14px', fontWeight: 700, fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{inspectProduct.sku}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 14px', color: '#64748B' }}>Sub-Group / Family</td>
                          <td style={{ padding: '8px 14px', fontWeight: 600 }}>{inspectProduct.subGroup || inspectProduct.category}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 14px', color: '#64748B' }}>Sub-Category</td>
                          <td style={{ padding: '8px 14px' }}>{inspectProduct.subCategory || 'ALLEN SCREWS / FASTENERS'}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 14px', color: '#64748B' }}>Primary Standard</td>
                          <td style={{ padding: '8px 14px', fontWeight: 700, color: '#0052CC', fontFamily: 'var(--font-mono)' }}>
                            {inspectProduct.din || inspectProduct.standard || 'DIN'}
                          </td>
                        </tr>
                        {inspectProduct.isoStandard && (
                          <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '8px 14px', color: '#64748B' }}>ISO Standard</td>
                            <td style={{ padding: '8px 14px', fontFamily: 'var(--font-mono)' }}>{inspectProduct.isoStandard}</td>
                          </tr>
                        )}
                        {inspectProduct.bsStandard && (
                          <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '8px 14px', color: '#64748B' }}>BS / ASME Standard</td>
                            <td style={{ padding: '8px 14px', fontFamily: 'var(--font-mono)' }}>{inspectProduct.bsStandard}</td>
                          </tr>
                        )}
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 14px', color: '#64748B' }}>Property Class / Grade</td>
                          <td style={{ padding: '8px 14px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{inspectProduct.grade}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 14px', color: '#64748B' }}>Surface Coating / Finish</td>
                          <td style={{ padding: '8px 14px' }}>{inspectProduct.finish}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {inspectTab === 'dimensions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', background: '#F8FAFC', fontWeight: 700, fontSize: '12px', borderBottom: '1px solid #E2E8F0', color: '#334155' }}>
                      Engineering Dimensions & Geometry
                    </div>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 14px', color: '#64748B', width: '45%' }}>Formatted Size</td>
                          <td style={{ padding: '8px 14px', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                            {inspectProduct.sizeFormatted || `${inspectProduct.diameter}X${inspectProduct.pitchMm}X${inspectProduct.lengthMm}`}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 14px', color: '#64748B' }}>Nominal Diameter (DIA)</td>
                          <td style={{ padding: '8px 14px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{inspectProduct.diameter}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 14px', color: '#64748B' }}>Nominal Length</td>
                          <td style={{ padding: '8px 14px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{inspectProduct.lengthMm} mm</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 14px', color: '#64748B' }}>Thread Pitch</td>
                          <td style={{ padding: '8px 14px', fontFamily: 'var(--font-mono)' }}>{inspectProduct.pitchMm} mm</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 14px', color: '#64748B' }}>Thread Length</td>
                          <td style={{ padding: '8px 14px' }}>{inspectProduct.threadLength || 'FULL THREAD'}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 14px', color: '#64748B' }}>Thread Type / Pitch Spec</td>
                          <td style={{ padding: '8px 14px' }}>{inspectProduct.threadType || 'Metric Coarse'}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 14px', color: '#64748B' }}>Weight Per Piece</td>
                          <td style={{ padding: '8px 14px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{inspectProduct.weightPerPcKg} kg</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 14px', color: '#64748B' }}>Weight Per 1,000 Pcs</td>
                          <td style={{ padding: '8px 14px', fontWeight: 700, color: '#059669', fontFamily: 'var(--font-mono)' }}>
                            {inspectProduct.weightPer1000PcsKg || (inspectProduct.weightPerPcKg * 1000).toFixed(2)} kg
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {inspectTab === 'pricing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Highlight pricing cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    <div style={{ padding: '14px', borderRadius: '8px', background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                      <div style={{ fontSize: '11px', color: '#1D4ED8', fontWeight: 600, marginBottom: '2px' }}>RATE PER PIECE</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#0052CC', fontFamily: 'var(--font-mono)' }}>
                        {formatINR(inspectProduct.pricePerPiece)}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>Ex-factory bulk price</div>
                    </div>
                    <div style={{ padding: '14px', borderRadius: '8px', background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                      <div style={{ fontSize: '11px', color: '#047857', fontWeight: 600, marginBottom: '2px' }}>RATE PER KG</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)' }}>
                        {formatINR(inspectProduct.pricePerKg)}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>Industrial weight tier</div>
                    </div>
                  </div>

                  {/* Packaging breakdown */}
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', background: '#F8FAFC', fontWeight: 700, fontSize: '12px', borderBottom: '1px solid #E2E8F0', color: '#334155' }}>
                      Industrial B2B Packaging & Order Limits
                    </div>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 14px', color: '#64748B', width: '45%' }}>Small Box Pack</td>
                          <td style={{ padding: '8px 14px', fontWeight: 600 }}>{Math.round(Number(inspectProduct.pcsPerBox)) || '500'} pcs ({inspectProduct.smallBoxWeightKg || 2.5} kg)</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 14px', color: '#64748B' }}>Master Carton Pack</td>
                          <td style={{ padding: '8px 14px', fontWeight: 600 }}>{inspectProduct.pcsPerMasterCtn || '4000'} pcs ({inspectProduct.masterCtnWeightKg || 20} kg)</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 14px', color: '#64748B' }}>Minimum Order (MOQ)</td>
                          <td style={{ padding: '8px 14px', fontWeight: 700, color: '#0F172A' }}>{inspectProduct.moq || '25 KGS'}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 14px', color: '#64748B' }}>Total Lead Time</td>
                          <td style={{ padding: '8px 14px', fontWeight: 600 }}>{inspectProduct.leadTimeDays || 10} Days ({inspectProduct.productionDays || 7}d prod + {inspectProduct.packingDays || 3}d pack)</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 14px', color: '#64748B' }}>100 Pcs Rate</td>
                          <td style={{ padding: '8px 14px', fontFamily: 'var(--font-mono)' }}>{formatINR(inspectProduct.price100Pcs || inspectProduct.pricePerPiece * 100)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 14px', color: '#64748B' }}>1,000 Pcs Rate</td>
                          <td style={{ padding: '8px 14px', fontFamily: 'var(--font-mono)' }}>{formatINR(inspectProduct.price1000Pcs || inspectProduct.pricePerPiece * 1000)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {inspectTab === 'inventory' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    <div style={{ padding: '14px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginBottom: '2px' }}>STOCK PIECES</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                        {inspectProduct.stockPcs.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>Units on hand</div>
                    </div>
                    <div style={{ padding: '14px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginBottom: '2px' }}>STOCK WEIGHT</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                        {inspectProduct.stockKg.toFixed(1)} <span style={{ fontSize: '13px' }}>Kg</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>Total mass in warehouse</div>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', background: '#F8FAFC', fontWeight: 700, fontSize: '12px', borderBottom: '1px solid #E2E8F0', color: '#334155' }}>
                      Inventory Telemetry & Tax Compliance
                    </div>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 14px', color: '#64748B', width: '45%' }}>Stock Health Status</td>
                          <td style={{ padding: '8px 14px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: inspectProduct.stockPcs === 0 ? '#FEE2E2' : inspectProduct.stockPcs <= 5000 ? '#FEF3C7' : '#ECFDF5',
                              color: inspectProduct.stockPcs === 0 ? '#DC2626' : inspectProduct.stockPcs <= 5000 ? '#D97706' : '#059669'
                            }}>
                              {inspectProduct.stockPcs === 0 ? 'Out of Stock' : inspectProduct.stockPcs <= 5000 ? 'Low Stock Alert' : 'Ready Stock In Warehouse'}
                            </span>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 14px', color: '#64748B' }}>GST HSN Code</td>
                          <td style={{ padding: '8px 14px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{inspectProduct.hsnCode || '73181500'}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 14px', color: '#64748B' }}>Manufacturer / Brand</td>
                          <td style={{ padding: '8px 14px', fontWeight: 600 }}>{inspectProduct.brand || 'CBH'}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 14px', color: '#64748B' }}>Surplus Liquidation Deal</td>
                          <td style={{ padding: '8px 14px' }}>
                            {inspectProduct.isSurplus ? (
                              <span style={{ color: '#B45309', fontWeight: 700 }}>
                                Active (-{inspectProduct.surplusDiscountPct}% off)
                              </span>
                            ) : (
                              <span style={{ color: '#64748B' }}>Standard Catalog Rate</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 14px', color: '#64748B' }}>Unit of Measure (UOM)</td>
                          <td style={{ padding: '8px 14px' }}>{inspectProduct.stockUom || 'Nos'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Pop-up Bar Footer with Actions */}
            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              gap: '10px',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <button
                type="button"
                onClick={() => {
                  handleToggleSurplus(inspectProduct.id);
                  setInspectProduct({
                    ...inspectProduct,
                    isSurplus: !inspectProduct.isSurplus
                  });
                }}
                className={`badge ${inspectProduct.isSurplus ? 'badge-surplus' : 'badge-certified'}`}
                style={{ padding: '6px 12px', fontSize: '11px', cursor: 'pointer', border: 'none' }}
              >
                {inspectProduct.isSurplus ? 'Disable Surplus Deal' : 'Mark as Surplus Deal'}
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  href={`/admin/products/${inspectProduct.id}/edit`}
                  className="btn-outline"
                  style={{ padding: '6px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                  onClick={() => setInspectProduct(null)}
                >
                  <Edit size={13} />
                  <span>Edit Parameters</span>
                </Link>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                  onClick={() => setInspectProduct(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: BULK PRODUCTS UPLOAD VIA EXCEL MODAL */}
      {isBulkUploadOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => {
            if (!isBulkImporting) setIsBulkUploadOpen(false);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '1100px',
              maxHeight: '92vh',
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #E2E8F0',
                background: '#F8FAFC',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#ECFDF5',
                    border: '1.5px solid #A7F3D0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669',
                    flexShrink: 0,
                  }}
                >
                  {bulkUploadTab === 'excel' ? <FileSpreadsheet size={24} /> : <ImageIcon size={24} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                    Bulk Products & Media Watermark Studio
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748B' }}>
                    Upload Excel spreadsheets or batch process product photos with official CBH watermark stamped semi-transparently in the center.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {bulkUploadTab === 'excel' && (
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="btn-outline"
                    style={{
                      padding: '8px 14px',
                      fontSize: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#FFFFFF',
                    }}
                    title="Download standard template with sample rows and column instructions"
                  >
                    <Download size={14} color="#0052CC" />
                    <span style={{ fontWeight: 600 }}>Download Template (.xlsx)</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={isBulkImporting || isBulkUploadingImages}
                  onClick={() => setIsBulkUploadOpen(false)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isBulkImporting || isBulkUploadingImages ? 'not-allowed' : 'pointer',
                    color: '#64748B',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '0 24px',
                background: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => setBulkUploadTab('excel')}
                style={{
                  padding: '12px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  borderBottom: bulkUploadTab === 'excel' ? '2.5px solid #0052CC' : '2.5px solid transparent',
                  color: bulkUploadTab === 'excel' ? '#0052CC' : '#64748B',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <FileSpreadsheet size={16} />
                <span>Excel Spreadsheet Import</span>
              </button>

              <button
                type="button"
                onClick={() => setBulkUploadTab('images')}
                style={{
                  padding: '12px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  borderBottom: bulkUploadTab === 'images' ? '2.5px solid #0052CC' : '2.5px solid transparent',
                  color: bulkUploadTab === 'images' ? '#0052CC' : '#64748B',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <ImageIcon size={16} />
                <span>Bulk Images with Watermark</span>
                {bulkImagePreviews.length > 0 && (
                  <span
                    style={{
                      background: '#0052CC',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '999px',
                    }}
                  >
                    {bulkImagePreviews.length}
                  </span>
                )}
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {bulkUploadTab === 'excel' ? (
                <>
                  {/* STATE 1: ACTIVE BACKGROUND IMPORT IN PROGRESS */}
              {activeJob && ['pending', 'parsing', 'syncing'].includes(activeJob.status) ? (
                <div
                  style={{
                    background: '#F0F9FF',
                    border: '1.5px solid #0284C7',
                    borderRadius: '14px',
                    padding: '32px 24px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#0284C7',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                    }}
                  >
                    <Loader2 size={32} className="animate-spin" />
                  </div>

                  <h4 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800, color: '#0369A1' }}>
                    Bulk Import Running in Background
                  </h4>
                  <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#0284C7' }}>
                    {activeJob.message || 'Processing Excel workbook and inserting products into database...'}
                  </p>

                  {/* Animated Progress Bar */}
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '560px',
                      margin: '0 auto 12px',
                      background: '#E0F2FE',
                      borderRadius: '999px',
                      height: '14px',
                      overflow: 'hidden',
                      border: '1px solid #BAE6FD',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.max(5, activeJob.progressPercent || 0)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #0284C7, #0052CC)',
                        borderRadius: '999px',
                        transition: 'width 0.4s ease-out',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '20px',
                      fontSize: '12px',
                      color: '#0369A1',
                      fontWeight: 700,
                      marginBottom: '24px',
                    }}
                  >
                    <span>{activeJob.progressPercent}% Complete</span>
                    {activeJob.totalRows > 0 && (
                      <span>
                        {activeJob.processedRows?.toLocaleString() || 0} / {activeJob.totalRows?.toLocaleString()} Rows
                      </span>
                    )}
                    <span>File: {activeJob.fileName}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => setIsBulkUploadOpen(false)}
                      style={{ padding: '10px 24px', background: '#0284C7', borderColor: '#0284C7', fontSize: '13px' }}
                    >
                      Continue Working in Admin (Run in Background)
                    </button>
                  </div>
                </div>
              ) : bulkSuccessResult || (activeJob && activeJob.status === 'completed') ? (
                /* STATE 2: SUCCESS RESULT SCREEN */
                <div
                  style={{
                    background: '#ECFDF5',
                    border: '1.5px solid #10B981',
                    borderRadius: '14px',
                    padding: '28px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#10B981',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                    }}
                  >
                    <CheckCircle2 size={34} />
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800, color: '#064E3B' }}>
                    Bulk Import Completed Successfully!
                  </h4>
                  <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#047857' }}>
                    Your fastener catalog has been synchronized with the uploaded Excel data.
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '12px',
                      maxWidth: '750px',
                      margin: '0 auto 28px',
                    }}
                  >
                    <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#065F46', textTransform: 'uppercase' }}>Items Processed</span>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#064E3B', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                        {(bulkSuccessResult?.importedCount || activeJob?.totalRows || 0).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#065F46', textTransform: 'uppercase' }}>New SKUs Added</span>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                        +{(bulkSuccessResult?.addedCount || activeJob?.addedCount || 0).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#065F46', textTransform: 'uppercase' }}>Existing SKUs Updated</span>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#0284C7', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                        {(bulkSuccessResult?.updatedCount || activeJob?.updatedCount || 0).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#065F46', textTransform: 'uppercase' }}>Active Catalog Total</span>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                        {(bulkSuccessResult?.totalCatalogCount || activeJob?.catalogTotal || totalCount || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={handleResetBulkUpload}
                      style={{ padding: '10px 20px', background: '#FFFFFF' }}
                    >
                      Upload Another Spreadsheet
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => setIsBulkUploadOpen(false)}
                      style={{ padding: '10px 24px', background: '#059669', borderColor: '#059669' }}
                    >
                      Done & View Master Catalog
                    </button>
                  </div>
                </div>
              ) : activeJob && activeJob.status === 'failed' ? (
                /* STATE 3: ERROR SCREEN */
                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1.5px solid #F87171',
                    borderRadius: '14px',
                    padding: '28px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#DC2626',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <AlertTriangle size={34} />
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800, color: '#991B1B' }}>
                    Bulk Import Failed
                  </h4>
                  <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#B91C1C' }}>
                    {activeJob.error || 'An unexpected error occurred during database import.'}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleResetBulkUpload}
                      style={{ padding: '10px 20px', background: '#DC2626', borderColor: '#DC2626' }}
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* STEP 1: DROPZONE / FILE SELECTOR */}
                  <input
                    ref={bulkFileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleInspectAndPreviewFile(file, 'all');
                    }}
                    style={{ display: 'none' }}
                  />

                  {!bulkFile ? (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleInspectAndPreviewFile(file, 'all');
                      }}
                      onClick={() => bulkFileInputRef.current?.click()}
                      style={{
                        border: '2px dashed #94A3B8',
                        borderRadius: '14px',
                        padding: '40px 24px',
                        background: '#F8FAFC',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          background: '#EFF6FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#0052CC',
                          margin: '0 auto 14px',
                        }}
                      >
                        <UploadCloud size={28} />
                      </div>
                      <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                        Drag & drop your Excel file here, or click to browse
                      </h4>
                      <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#64748B' }}>
                        Supports .XLSX, .XLS, or .CSV (multi-sheet master workbooks or standard product lists up to 50MB)
                      </p>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          bulkFileInputRef.current?.click();
                        }}
                        style={{ padding: '8px 20px', fontSize: '13px' }}
                      >
                        Select Spreadsheet File
                      </button>
                    </div>
                  ) : (
                    /* FILE CHIP & CONTROLS */
                    <div
                      style={{
                        background: '#F1F5F9',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '14px',
                        border: '1px solid #CBD5E1',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            background: '#059669',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <FileSpreadsheet size={22} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '14px', color: '#0F172A' }}>{bulkFile.name}</strong>
                            <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                              ({(bulkFile.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
                            {bulkInspection?.sheets?.length
                              ? `${bulkInspection.sheets.length} Sheet(s) detected • ${bulkPreviewStats?.validCount || 0} valid products parsed`
                              : 'Excel workbook loaded'}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={() => bulkFileInputRef.current?.click()}
                          style={{ padding: '6px 12px', fontSize: '12px', background: '#FFFFFF' }}
                          disabled={isBulkImporting || isBulkInspecting}
                        >
                          Change File
                        </button>
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={handleResetBulkUpload}
                          style={{ padding: '6px 12px', fontSize: '12px', color: '#DC2626', borderColor: '#FCA5A5', background: '#FFFFFF' }}
                          disabled={isBulkImporting || isBulkInspecting}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ERROR MESSAGE */}
                  {bulkUploadError && (
                    <div
                      style={{
                        background: '#FEF2F2',
                        border: '1px solid #F87171',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: '#991B1B',
                        fontSize: '13px',
                      }}
                    >
                      <AlertTriangle size={18} color="#DC2626" />
                      <span>{bulkUploadError}</span>
                    </div>
                  )}

                  {/* STEP 2: CONFIGURATION ROW (When file is chosen) */}
                  {bulkFile && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                        gap: '16px',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '16px',
                      }}
                    >
                      {/* Sheet Selector */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Target Spreadsheet Sheet
                        </label>
                        {bulkInspection && bulkInspection.sheets.length > 1 ? (
                          <select
                            value={selectedSheet}
                            onChange={(e) => handleSheetChange(e.target.value)}
                            disabled={isBulkImporting || isBulkInspecting}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              fontSize: '13px',
                              background: '#F8FAFC',
                              fontWeight: 600,
                            }}
                          >
                            <option value="all">All Sheets Combined ({bulkInspection.sheets.length} sheets)</option>
                            {bulkInspection.sheets.map((s) => (
                              <option key={s.name} value={s.name}>
                                {s.name} ({s.estimatedProducts.toLocaleString()} items / {s.totalRows.toLocaleString()} rows)
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div
                            style={{
                              fontSize: '13px',
                              padding: '8px 12px',
                              background: '#F8FAFC',
                              borderRadius: '8px',
                              border: '1px solid #E2E8F0',
                              color: '#475569',
                              fontWeight: 600,
                            }}
                          >
                            {bulkInspection?.sheets?.[0]?.name || 'Sheet1'} (Single Sheet)
                          </div>
                        )}
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                          Select category sheet or import all sheets.
                        </span>
                      </div>

                      {/* Upsert Strategy */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Import Strategy
                        </label>
                        <select
                          value={upsertMode}
                          onChange={(e) => setUpsertMode(e.target.value as any)}
                          disabled={isBulkImporting}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            fontSize: '13px',
                            background: '#F8FAFC',
                            fontWeight: 600,
                          }}
                        >
                          <option value="merge">Merge & Upsert (Recommended)</option>
                          <option value="append">Append Only (Skip existing)</option>
                          <option value="replace">Replace Catalog (Overwrite)</option>
                        </select>
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                          Ensures duplicate SKUs update existing records.
                        </span>
                      </div>

                      {/* Fallback Image Preset */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Default Image Preset
                        </label>
                        <select
                          value={defaultImagePreset}
                          onChange={(e) => setDefaultImagePreset(e.target.value)}
                          disabled={isBulkImporting}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            fontSize: '13px',
                            background: '#F8FAFC',
                            fontWeight: 600,
                          }}
                        >
                          {FASTENER_IMAGE_PRESETS.map((p) => (
                            <option key={p.url} value={p.url}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                          Assigned when item row has no photo URL.
                        </span>
                      </div>

                      {/* Apply Watermark in Center */}
                      <div
                        onClick={() => !isBulkImporting && setBulkWatermark(!bulkWatermark)}
                        style={{
                          background: bulkWatermark ? '#F0FDF4' : '#F8FAFC',
                          border: bulkWatermark ? '1.5px solid #86EFAC' : '1px solid #CBD5E1',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          cursor: isBulkImporting ? 'default' : 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <label style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Layers size={13} color={bulkWatermark ? '#16A34A' : '#64748B'} />
                              <span>Apply CBH Watermark</span>
                            </label>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: bulkWatermark ? '#DCFCE7' : '#E2E8F0',
                                color: bulkWatermark ? '#15803D' : '#64748B',
                                textTransform: 'uppercase',
                              }}
                            >
                              {bulkWatermark ? 'Center' : 'Off'}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', color: '#64748B', display: 'block', lineHeight: 1.3 }}>
                            Auto-stamp semi-transparent CBH logo in the <strong>center</strong> of imported Drive product photos.
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                          <input
                            type="checkbox"
                            id="bulkWatermarkExcel"
                            checked={bulkWatermark}
                            onChange={(e) => setBulkWatermark(e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            disabled={isBulkImporting}
                            style={{ width: '15px', height: '15px', accentColor: '#16A34A', cursor: 'pointer' }}
                          />
                          <label htmlFor="bulkWatermarkExcel" style={{ fontSize: '11px', fontWeight: 600, color: '#0F172A', cursor: 'pointer' }}>
                            Watermark in Center (Transparent)
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: LIVE PREVIEW & INSPECTION TABLE */}
                  {isBulkInspecting ? (
                    <div
                      style={{
                        padding: '24px 20px',
                        textAlign: 'center',
                        background: '#F8FAFC',
                        borderRadius: '12px',
                        border: '1px dashed #CBD5E1',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <Loader2 size={20} className="animate-spin" color="#0052CC" />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                          Loading sample items preview...
                        </span>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#64748B' }}>
                        No need to wait! You can click <strong>&quot;Import Products Now&quot;</strong> below to start importing directly in the background.
                      </p>
                    </div>
                  ) : bulkPreviewItems.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Parsed Items Preview ({bulkPreviewItems.length} Sample Rows)
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              background: '#ECFDF5',
                              color: '#059669',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              border: '1px solid #A7F3D0',
                            }}
                          >
                            ✓ {bulkPreviewStats?.validCount || bulkPreviewItems.length} Valid Fasteners Ready
                          </span>
                        </div>

                        {/* Search input in preview */}
                        <div style={{ position: 'relative', width: '220px' }}>
                          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                          <input
                            type="text"
                            placeholder="Filter preview rows..."
                            value={previewFilter}
                            onChange={(e) => setPreviewFilter(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px 10px 6px 30px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              fontSize: '12px',
                            }}
                          />
                        </div>
                      </div>

                      {/* Interactive Preview Table */}
                      <div
                        style={{
                          border: '1px solid #E2E8F0',
                          borderRadius: '10px',
                          overflow: 'auto',
                          maxHeight: '340px',
                          background: '#FFFFFF',
                        }}
                      >
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #CBD5E1', position: 'sticky', top: 0, zIndex: 1 }}>
                              <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>Status</th>
                              <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>Photo (Center WM)</th>
                              <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>SKU Code</th>
                              <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>Item Name</th>
                              <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>Standard</th>
                              <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>Dia x Length</th>
                              <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>Grade & Finish</th>
                              <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>Rate / Pc</th>
                              <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bulkPreviewItems
                              .filter((p) => {
                                if (!previewFilter) return true;
                                const q = previewFilter.toLowerCase();
                                return (
                                  p.sku.toLowerCase().includes(q) ||
                                  p.name.toLowerCase().includes(q) ||
                                  p.standard.toLowerCase().includes(q) ||
                                  p.diameter.toLowerCase().includes(q)
                                );
                              })
                              .map((p, idx) => (
                                <tr
                                  key={idx}
                                  style={{
                                    borderBottom: '1px solid #F1F5F9',
                                    background: idx % 2 === 0 ? '#FFFFFF' : '#FBFCFD',
                                  }}
                                >
                                  <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                                    {p.isExistingSku ? (
                                      <span
                                        style={{
                                          fontSize: '10px',
                                          fontWeight: 700,
                                          background: '#EFF6FF',
                                          color: '#0052CC',
                                          padding: '2px 6px',
                                          borderRadius: '4px',
                                          border: '1px solid #BFDBFE',
                                        }}
                                      >
                                        Update SKU
                                      </span>
                                    ) : (
                                      <span
                                        style={{
                                          fontSize: '10px',
                                          fontWeight: 700,
                                          background: '#ECFDF5',
                                          color: '#059669',
                                          padding: '2px 6px',
                                          borderRadius: '4px',
                                          border: '1px solid #A7F3D0',
                                        }}
                                      >
                                        New SKU
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: '6px 12px', whiteSpace: 'nowrap' }}>
                                    <div
                                      style={{
                                        position: 'relative',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '6px',
                                        border: '1px solid #CBD5E1',
                                        background: '#F8FAFC',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                      }}
                                      title={p.gdriveImageUrl ? `Google Drive Photo: ${p.gdriveImageUrl}` : 'Product Image'}
                                    >
                                      <img
                                        src={p.imageUrl || '/assets/bolt_zinc.jpg'}
                                        alt={p.sku}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }}
                                        onError={(e) => {
                                          try { (e.target as any).src = '/assets/bolt_zinc.jpg'; } catch {}
                                        }}
                                      />
                                      {bulkWatermark && (
                                        <div
                                          style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: '60%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: 0.35,
                                            pointerEvents: 'none',
                                          }}
                                        >
                                          <img
                                            src="/assets/cbh-watermark.png"
                                            alt="CBH"
                                            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0052CC', whiteSpace: 'nowrap' }}>
                                    {p.sku}
                                  </td>
                                  <td style={{ padding: '8px 12px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.name}>
                                    {p.name}
                                  </td>
                                  <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                                    <span style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, color: '#334155' }}>
                                      {p.standard || p.din || 'DIN'}
                                    </span>
                                  </td>
                                  <td style={{ padding: '8px 12px', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                                    {p.sizeFormatted || `${p.diameter}x${p.lengthMm}mm`}
                                  </td>
                                  <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                                    {p.grade} • {p.finish}
                                  </td>
                                  <td style={{ padding: '8px 12px', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0052CC' }}>
                                    {formatINR(p.pricePerPiece)}
                                  </td>
                                  <td style={{ padding: '8px 12px', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', color: '#059669', fontWeight: 700 }}>
                                    {p.stockPcs.toLocaleString()} pcs
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </>
          ) : (
            /* TAB 2: BULK IMAGES WITH WATERMARK STUDIO */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Top Watermark Control Banner */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #F0FDF4 0%, #EFF6FF 100%)',
                      border: '1px solid #BBF7D0',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', maxWidth: '620px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: '#059669',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <ImageIcon size={22} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#064E3B' }}>
                          Bulk Product Photos Watermark Studio
                        </h4>
                        <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#047857', lineHeight: 1.4 }}>
                          Upload multiple product photos in one go. The CBH Fasteners brand logo is composited <strong>semi-transparently in the center</strong> of each photo and saved to your store storage.
                        </p>
                      </div>
                    </div>

                    {/* Watermark toggle card */}
                    <div
                      onClick={() => setBulkWatermark(!bulkWatermark)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: '#FFFFFF',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: bulkWatermark ? '1.5px solid #10B981' : '1px solid #CBD5E1',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          width: '42px',
                          height: '28px',
                          background: '#F1F5F9',
                          borderRadius: '4px',
                          border: '1px solid #CBD5E1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '2px',
                        }}
                      >
                        {bulkWatermark ? (
                          <img
                            src="/assets/cbh-watermark.png"
                            alt="Watermark preview"
                            style={{ height: '14px', width: 'auto', objectFit: 'contain', opacity: 0.6 }}
                          />
                        ) : (
                          <span style={{ fontSize: '7px', color: '#94A3B8', fontWeight: 700 }}>NONE</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#0F172A',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            margin: 0,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={bulkWatermark}
                            onChange={(e) => setBulkWatermark(e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: '16px', height: '16px', accentColor: '#059669', cursor: 'pointer' }}
                          />
                          <span>Apply Transparent Center CBH Watermark</span>
                        </label>
                        <span style={{ fontSize: '10px', color: bulkWatermark ? '#059669' : '#64748B', fontWeight: 700 }}>
                          {bulkWatermark ? '✓ Watermark Active (Semi-Transparent Center)' : 'Watermark Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hidden Multi-file input */}
                  <input
                    ref={bulkMultipleImagesInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleBulkImageSelect}
                    style={{ display: 'none' }}
                  />

                  {/* Dropzone for Bulk Images */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleBulkImageDrop}
                    onClick={() => bulkMultipleImagesInputRef.current?.click()}
                    style={{
                      border: '2px dashed #94A3B8',
                      borderRadius: '14px',
                      padding: '36px 20px',
                      background: '#F8FAFC',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0052CC',
                        margin: '0 auto 12px',
                      }}
                    >
                      <UploadCloud size={26} />
                    </div>
                    <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                      Drag & drop multiple product photos here, or click to browse
                    </h4>
                    <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#64748B' }}>
                      Select multiple images (PNG, JPG, JPEG, WEBP up to 10MB each).
                    </p>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        bulkMultipleImagesInputRef.current?.click();
                      }}
                      style={{ padding: '8px 20px', fontSize: '13px' }}
                    >
                      Select Images
                    </button>
                  </div>

                  {/* Upload Progress Bar */}
                  {isBulkUploadingImages && (
                    <div
                      style={{
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: '10px',
                        padding: '14px 18px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#1E40AF', marginBottom: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Loader2 size={14} className="animate-spin" />
                          Processing & Stamping Transparent Center Watermark...
                        </span>
                        <span>
                          {bulkUploadProgress.current} / {bulkUploadProgress.total} Files
                        </span>
                      </div>
                      <div style={{ background: '#DBEAFE', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.round((bulkUploadProgress.current / Math.max(1, bulkUploadProgress.total)) * 100)}%`,
                            height: '100%',
                            background: '#0052CC',
                            transition: 'width 0.2s ease',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Selected Previews Grid */}
                  {bulkImagePreviews.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                            Selected Photos ({bulkImagePreviews.length})
                          </span>
                          <span style={{ fontSize: '11px', background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                            Total {(bulkImagePreviews.reduce((acc, p) => acc + p.size, 0) / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <span style={{ fontSize: '11px', background: bulkWatermark ? '#DCFCE7' : '#F1F5F9', color: bulkWatermark ? '#15803D' : '#64748B', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                            {bulkWatermark ? 'Watermark: Center (Transparent)' : 'Original (No Watermark)'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn-outline"
                            onClick={() => bulkMultipleImagesInputRef.current?.click()}
                            disabled={isBulkUploadingImages}
                            style={{ padding: '6px 12px', fontSize: '12px', background: '#FFFFFF' }}
                          >
                            <Plus size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                            Add More
                          </button>
                          <button
                            type="button"
                            className="btn-outline"
                            onClick={handleClearAllPreviewImages}
                            disabled={isBulkUploadingImages}
                            style={{ padding: '6px 12px', fontSize: '12px', color: '#DC2626', borderColor: '#FCA5A5', background: '#FFFFFF' }}
                          >
                            <Trash2 size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                            Clear All
                          </button>
                        </div>
                      </div>

                      {/* Grid of Preview Cards with Live Transparent Center Watermark Overlay */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                          gap: '12px',
                          maxHeight: '360px',
                          overflowY: 'auto',
                          padding: '4px',
                        }}
                      >
                        {bulkImagePreviews.map((img) => (
                          <div
                            key={img.id}
                            style={{
                              border: '1px solid #E2E8F0',
                              borderRadius: '10px',
                              background: '#FFFFFF',
                              padding: '8px',
                              display: 'flex',
                              flexDirection: 'column',
                              position: 'relative',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            }}
                          >
                            {/* Thumbnail Box */}
                            <div
                              style={{
                                position: 'relative',
                                width: '100%',
                                height: '130px',
                                borderRadius: '8px',
                                background: '#F8FAFC',
                                overflow: 'hidden',
                                border: '1px solid #F1F5F9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <img
                                src={img.previewUrl}
                                alt={img.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  padding: '6px',
                                }}
                              />

                              {/* LIVE WATERMARK OVERLAY IN CENTER */}
                              {bulkWatermark && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '56%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0.32,
                                    pointerEvents: 'none',
                                  }}
                                >
                                  <img
                                    src="/assets/cbh-watermark.png"
                                    alt="CBH Watermark"
                                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                                  />
                                </div>
                              )}

                              {/* Remove X Button */}
                              {!isBulkUploadingImages && (
                                <button
                                  type="button"
                                  onClick={() => handleRemovePreviewImage(img.id)}
                                  style={{
                                    position: 'absolute',
                                    top: '5px',
                                    right: '5px',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    border: '1px solid #CBD5E1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#64748B',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                  }}
                                  title="Remove image"
                                >
                                  <X size={13} />
                                </button>
                              )}
                            </div>

                            {/* Metadata */}
                            <div style={{ marginTop: '8px' }}>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  color: '#0F172A',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                title={img.name}
                              >
                                {img.name}
                              </p>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                                <span style={{ fontSize: '10px', color: '#64748B' }}>
                                  {(img.size / 1024).toFixed(0)} KB
                                </span>
                                <span style={{ fontSize: '10px', color: bulkWatermark ? '#059669' : '#94A3B8', fontWeight: 600 }}>
                                  {bulkWatermark ? 'Watermarked' : 'Original'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Uploaded Results Section */}
                  {bulkImageResults.length > 0 && (
                    <div
                      style={{
                        background: '#F0FDF4',
                        border: '1.5px solid #86EFAC',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle2 size={18} color="#059669" />
                          <span style={{ fontSize: '14px', fontWeight: 800, color: '#064E3B' }}>
                            Uploaded & Watermarked ({bulkImageResults.filter((r) => r.success).length} Ready)
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={handleCopyAllUrls}
                          style={{ padding: '6px 14px', fontSize: '12px', background: '#059669', borderColor: '#059669' }}
                        >
                          <Copy size={13} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                          Copy All URLs for Excel
                        </button>
                      </div>

                      <div
                        style={{
                          maxHeight: '220px',
                          overflowY: 'auto',
                          border: '1px solid #BBF7D0',
                          borderRadius: '8px',
                          background: '#FFFFFF',
                        }}
                      >
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <tbody>
                            {bulkImageResults.map((res, idx) => (
                              <tr key={res.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                <td style={{ padding: '8px 12px', width: '40px' }}>
                                  {res.url ? (
                                    <div style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                                      <img src={res.url} alt={res.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                  ) : (
                                    <AlertTriangle size={18} color="#DC2626" />
                                  )}
                                </td>
                                <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0F172A', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {res.name}
                                </td>
                                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: '#0052CC', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {res.url || res.error || 'Failed'}
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                  {res.success && res.url ? (
                                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                                      <a
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-outline"
                                        style={{ padding: '4px 8px', fontSize: '11px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                      >
                                        <ExternalLink size={11} />
                                        View
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyUrl(res.url, idx)}
                                        className="btn-outline"
                                        style={{
                                          padding: '4px 8px',
                                          fontSize: '11px',
                                          background: copiedUrlIndex === idx ? '#ECFDF5' : '#FFFFFF',
                                          borderColor: copiedUrlIndex === idx ? '#10B981' : '#CBD5E1',
                                          color: copiedUrlIndex === idx ? '#059669' : '#0F172A',
                                        }}
                                      >
                                        {copiedUrlIndex === idx ? (
                                          <>
                                            <Check size={11} /> Copied!
                                          </>
                                        ) : (
                                          <>
                                            <Copy size={11} /> Copy
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 600 }}>Failed</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {bulkUploadTab === 'excel' ? (
              !bulkSuccessResult && !(activeJob && (activeJob.status === 'completed' || ['pending', 'parsing', 'syncing'].includes(activeJob.status))) && (
                <div
                  style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0,
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0052CC',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        textDecoration: 'underline',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Download size={13} />
                      <span>Download CBH Fasteners Excel Template (.xlsx)</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => setIsBulkUploadOpen(false)}
                      disabled={isBulkImporting}
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleExecuteBulkImport}
                      disabled={!bulkFile || isBulkImporting}
                      style={{
                        padding: '8px 24px',
                        fontSize: '13px',
                        background: '#059669',
                        borderColor: '#059669',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {isBulkImporting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Starting Background Import...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={16} />
                          <span>
                            {bulkPreviewStats?.validCount
                              ? `Import ${bulkPreviewStats.validCount.toLocaleString()} Products Now`
                              : 'Import Products Now (Background)'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            ) : (
              /* Footer for Bulk Images Tab */
              <div
                style={{
                  padding: '16px 24px',
                  borderTop: '1px solid #E2E8F0',
                  background: '#F8FAFC',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexShrink: 0,
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src="/assets/cbh-watermark.png" alt="CBH" style={{ height: '18px', width: 'auto', opacity: 0.6 }} />
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    {bulkWatermark
                      ? 'Watermark will be burned semi-transparently in the center of the image.'
                      : 'Uploading original images without watermark.'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setIsBulkUploadOpen(false)}
                    disabled={isBulkUploadingImages}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleExecuteBulkImagesUpload}
                    disabled={bulkImagePreviews.length === 0 || isBulkUploadingImages}
                    style={{
                      padding: '8px 24px',
                      fontSize: '13px',
                      background: '#059669',
                      borderColor: '#059669',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {isBulkUploadingImages ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Uploading ({bulkUploadProgress.current}/{bulkUploadProgress.total})...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={16} />
                        <span>
                          {bulkImagePreviews.length > 0
                            ? `Upload & Stamp ${bulkImagePreviews.length} Images`
                            : 'Upload & Stamp Images'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FLOATING BACKGROUND JOB NOTIFIER WIDGET */}
      {activeJob && !isDismissedJobBanner && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9998,
            background: '#FFFFFF',
            borderRadius: '14px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.18)',
            border: `1.5px solid ${
              activeJob.status === 'completed'
                ? '#10B981'
                : activeJob.status === 'failed'
                ? '#EF4444'
                : '#0052CC'
            }`,
            padding: '16px',
            maxWidth: '380px',
            width: 'calc(100vw - 48px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '10px',
              marginBottom: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {['pending', 'parsing', 'syncing'].includes(activeJob.status) ? (
                <Loader2 size={18} className="animate-spin" color="#0052CC" />
              ) : activeJob.status === 'completed' ? (
                <CheckCircle2 size={18} color="#10B981" />
              ) : (
                <AlertTriangle size={18} color="#EF4444" />
              )}
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                {activeJob.status === 'completed'
                  ? 'Import Completed'
                  : activeJob.status === 'failed'
                  ? 'Import Failed'
                  : 'Importing in Background'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {!isBulkUploadOpen && (
                <button
                  type="button"
                  onClick={() => setIsBulkUploadOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '2px 4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#0052CC',
                    textDecoration: 'underline',
                  }}
                >
                  View
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsDismissedJobBanner(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '2px',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
            {activeJob.message || activeJob.fileName}
          </p>

          {['pending', 'parsing', 'syncing'].includes(activeJob.status) && (
            <div>
              <div
                style={{
                  background: '#E2E8F0',
                  borderRadius: '999px',
                  height: '8px',
                  overflow: 'hidden',
                  marginBottom: '6px',
                }}
              >
                <div
                  style={{
                    width: `${Math.max(5, activeJob.progressPercent || 0)}%`,
                    height: '100%',
                    background: '#0052CC',
                    borderRadius: '999px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: '#64748B',
                }}
              >
                <span>{activeJob.progressPercent}% complete</span>
                {activeJob.totalRows > 0 && (
                  <span>
                    {activeJob.processedRows?.toLocaleString() || 0} / {activeJob.totalRows?.toLocaleString()} rows
                  </span>
                )}
              </div>
            </div>
          )}

          {activeJob.status === 'completed' && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: '1px solid #E2E8F0',
              }}
            >
              <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                +{activeJob.addedCount?.toLocaleString()} added, {activeJob.updatedCount?.toLocaleString()} updated
              </span>
              <button
                type="button"
                onClick={() => {
                  fetchProducts();
                  setIsDismissedJobBanner(true);
                }}
                className="btn-outline"
                style={{ padding: '3px 10px', fontSize: '11px', background: '#FFFFFF' }}
              >
                Refresh View
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
