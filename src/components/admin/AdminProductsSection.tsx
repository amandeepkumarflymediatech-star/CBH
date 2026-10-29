'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
        {/* Current Image Preview */}
        <div style={{
          width: '74px',
          height: '74px',
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
          {isUploading && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
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
  const [isSyncing, setIsSyncing] = useState(false);
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

  // Live Sync trigger with ERPNext
  const handleSyncErpNext = async () => {
    try {
      setIsSyncing(true);
      showToast('Fetching latest items & dynamic images from ERPNext Frappe Cloud...');
      const res = await fetch('/api/erpnext/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Successfully synced ${data.count} items from ERPNext with dynamic images!`);
        window.location.reload();
      } else {
        showToast(`ERPNext sync failed: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      showToast(`Sync error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

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

  const isAllPageSelected = useMemo(() => {
    if (serverProducts.length === 0) return false;
    return serverProducts.every((p) => selectedProductIds.has(p.id));
  }, [serverProducts, selectedProductIds]);

  const toggleSelectAllOnPage = () => {
    if (isAllPageSelected) {
      setSelectedProductIds((prev) => {
        const next = new Set(prev);
        serverProducts.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelectedProductIds((prev) => {
        const next = new Set(prev);
        serverProducts.forEach((p) => next.add(p.id));
        return next;
      });
    }
  };

  const selectAllFiltered = () => {
    const next = new Set<number>();
    serverProducts.forEach((p) => next.add(p.id));
    setSelectedProductIds(next);
  };

  const selectAllProducts = () => {
    const next = new Set<number>();
    serverProducts.forEach((p) => next.add(p.id));
    setSelectedProductIds(next);
  };

  const clearSelection = () => {
    setSelectedProductIds(new Set());
  };

  const handleExecuteBulkDelete = async () => {
    if (selectedProductIds.size === 0) return;
    const ids = Array.from(selectedProductIds);

    try {
      setIsDeletingBulk(true);
      if (onBulkDelete) {
        await onBulkDelete(ids);
      } else {
        const targetSkus = serverProducts.filter((p) => selectedProductIds.has(p.id)).map((p) => p.sku);
        const res = await fetch('/api/products', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids, skus: targetSkus }),
        });
        const data = await res.json();
        showToast(data.message || `Deleted ${ids.length} products successfully.`);
      }
      setSelectedProductIds(new Set());
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
    <div className="max-w-7xl mx-auto w-full" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. TOP METRIC TELEMETRY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.5px' }}>Total Fasteners</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0052CC' }}>
              <Boxes size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
            {stats.total.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
            {stats.screwsCount} Screws • {stats.boltsCount} Bolts
          </div>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.5px' }}>ERPNext Cloud Synced</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#059669', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
            {stats.erpSynced.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
            Dynamic Frappe Cloud Images
          </div>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.5px' }}>Ready Inventory</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155' }}>
              <Package size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
            {stats.inStock.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
            Available for immediate dispatch
          </div>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.5px' }}>Surplus Lots</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
              <Flame size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#D97706', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
            {stats.surplusCount}
          </div>
          <div style={{ fontSize: '11px', color: '#D97706', marginTop: '4px', fontWeight: 600 }}>
            Up to -35% OEM Clearance
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE CARD */}
      <div className="portal-main-card max-w-7xl mx-auto w-full">
        {/* Header bar with Excel view switch */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
                Fastener Master Inventory ({products.length} Items)
              </h3>
             
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
              Full dimensional engineering, packaging, weights, pricing, and ERPNext live inventory telemetry
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Table / Cards View Switcher */}
            <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'table' ? '#0052CC' : 'transparent',
                  color: viewMode === 'table' ? '#FFFFFF' : '#475569',
                  fontWeight: viewMode === 'table' ? 700 : 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Commercial table view"
              >
                <Layers size={14} />
                <span>Table View</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('grid')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'grid' ? '#0052CC' : 'transparent',
                  color: viewMode === 'grid' ? '#FFFFFF' : '#475569',
                  fontWeight: viewMode === 'grid' ? 700 : 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Card grid view (Optimized for all screen sizes & mobile)"
              >
                <LayoutGrid size={14} />
                <span>Cards Grid</span>
              </button>
            </div>

            {/* Quick ERPNext Sync */}
            <button
              type="button"
              className="btn-outline"
              style={{ padding: '8px 14px', fontSize: '12px' }}
              onClick={handleSyncErpNext}
              disabled={isSyncing}
              title="Pull latest live item images & prices directly from Frappe Cloud"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync ERPNext'}</span>
            </button>

            <button
              type="button"
              className="btn-outline"
              style={{ padding: '8px 14px', fontSize: '12px' }}
              onClick={handleExportCSV}
              title="Download full CSV with every Excel attribute"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            {/* Bulk Upload Products through Excel */}
            <button
              type="button"
              className="btn-outline"
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                borderColor: '#10B981',
                color: '#065F46',
                background: '#ECFDF5',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                boxShadow: '0 1px 2px rgba(16, 185, 129, 0.1)'
              }}
              onClick={() => {
                setIsBulkUploadOpen(true);
                if (!bulkFile) {
                  handleResetBulkUpload();
                }
              }}
              title="Upload bulk products through Excel file (.xlsx, .xls, .csv)"
            >
              <FileSpreadsheet size={15} color="#059669" />
              <span>Upload Excel</span>
            </button>

            <button
              type="button"
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
              onClick={() => {
                setAddForm(DEFAULT_ADD_FORM);
                setAddModalTab('basic');
                setIsAddOpen(true);
              }}
            >
              <Plus size={15} />
              <span>Add Fastener</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Category Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {[
            { id: 'all', label: `All Fasteners (${products.length})` },
            { id: 'screws', label: `Grub & Collar Screws (${stats.screwsCount})`, subGroup: 'SCREW' },
            { id: 'bolts', label: `Bolts & Structural (${stats.boltsCount})`, subGroup: 'BOLTS' },
            { id: 'in_stock', label: `In Stock Ready (${stats.inStock})`, stock: 'in_stock' },
            { id: 'surplus', label: `Surplus Deals (${stats.surplusCount})`, catalog: 'surplus' },
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
                style={{
                  padding: '5px 12px',
                  borderRadius: '999px',
                  border: isActive ? '1.5px solid #0052CC' : '1px solid #CBD5E1',
                  background: isActive ? '#EFF6FF' : '#FFFFFF',
                  color: isActive ? '#0052CC' : '#475569',
                  fontSize: '11px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar */}
        <div className="admin-filter-bar" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', alignItems: 'center' }}>
            <div className="admin-search-wrap" style={{ flex: '1 1 300px', minWidth: '240px' }}>
              <Search size={15} className="admin-search-icon" />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search SKU, Name, Standard (DIN/ISO), DIA, Grade, HSN, Size..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', flex: '2 1 500px' }}>
              <select
                className="admin-select"
                value={selectedSubGroup}
                onChange={(e) => setSelectedSubGroup(e.target.value)}
              >
                <option value="all">Sub-Group: All</option>
                {subGroups.map((sg) => (
                  <option key={sg} value={sg}>{sg}</option>
                ))}
              </select>

              <select
                className="admin-select"
                value={selectedStandard}
                onChange={(e) => setSelectedStandard(e.target.value)}
              >
                <option value="all">Standard: All</option>
                {standards.slice(0, 15).map((std) => (
                  <option key={std} value={std}>{std}</option>
                ))}
              </select>

              <select
                className="admin-select"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
              >
                <option value="all">Grade: All</option>
                {grades.map((grd) => (
                  <option key={grd} value={grd}>{grd}</option>
                ))}
              </select>

              <select
                className="admin-select"
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
              >
                <option value="all">Stock: All</option>
                <option value="in_stock">In Stock (&gt;5k pcs)</option>
                <option value="low_stock">Low Stock (1-5k pcs)</option>
                <option value="out_of_stock">Out of Stock (0)</option>
              </select>

              <select
                className="admin-select"
                value={selectedCatalog}
                onChange={(e) => setSelectedCatalog(e.target.value)}
              >
                <option value="all">Catalog: All</option>
                <option value="standard">Standard Catalog</option>
                <option value="surplus">Surplus Lots Only</option>
              </select>

              <select
                className="admin-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Sort: Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="stock_desc">Stock: High to Low</option>
                <option value="sku_asc">SKU: A to Z</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span className="admin-filter-count" style={{ fontSize: '12px' }}>
              Showing {totalCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–{Math.min(currentPage * itemsPerPage, totalCount)} of <strong>{totalCount.toLocaleString()}</strong> SKUs
              {viewMode === 'grid' && <span style={{ color: '#059669', marginLeft: '6px', fontWeight: 600 }}>• Card grid responsive layout</span>}
            </span>
            {(search || selectedSubGroup !== 'all' || selectedStandard !== 'all' || selectedGrade !== 'all' || selectedStock !== 'all' || selectedCatalog !== 'all' || sortBy !== 'default') && (
              <button
                type="button"
                className="btn-outline"
                style={{ padding: '4px 10px', fontSize: '11px' }}
                onClick={handleResetFilters}
              >
                <RefreshCw size={11} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* BATCH ACTIONS BAR (WHEN 1+ PRODUCTS ARE SELECTED) */}
        {selectedProductIds.size > 0 && (
          <div
            style={{
              marginBottom: '16px',
              background: '#0F172A',
              color: '#FFFFFF',
              borderRadius: '12px',
              padding: '12px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: '0 8px 20px rgba(15, 23, 42, 0.25)',
              border: '1px solid #334155',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: '#0052CC',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {selectedProductIds.size} Selected
              </span>
              <span style={{ fontSize: '13px', color: '#E2E8F0', fontWeight: 600 }}>
                {selectedProductIds.size === 1
                  ? '1 product selected'
                  : `${selectedProductIds.size} products selected`}
              </span>
              {selectedProductIds.size < serverProducts.length && (
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#60A5FA',
                    fontSize: '12px',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: 600,
                    padding: 0,
                  }}
                >
                  Select all {serverProducts.length} on current page
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={clearSelection}
                style={{
                  background: '#1E293B',
                  border: '1px solid #475569',
                  color: '#CBD5E1',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Deselect All
              </button>
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                style={{
                  background: '#DC2626',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)',
                }}
              >
                <Trash2 size={14} />
                <span>
                  {selectedProductIds.size === products.length && products.length > 0
                    ? `Delete Entire Catalog (${products.length} SKUs)`
                    : `Delete Selected (${selectedProductIds.size})`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW MODE 1: RESPONSIVE CARD GRID (FOR PHONES, TABLETS & MODERN BROWSING) */}
        {viewMode === 'grid' ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {isLoadingData ? (
                <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <Loader2 size={32} className="animate-spin" color="#FF6B00" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Loading Fastener SKUs...</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Querying central database catalog with limit pagination</div>
                </div>
              ) : totalCount === 0 && !search && selectedSubGroup === 'all' && selectedStandard === 'all' && selectedGrade === 'all' && selectedStock === 'all' && selectedCatalog === 'all' ? (
                <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', background: '#FFFFFF', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F1F5F9', color: '#64748B', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                    <PackageOpen size={28} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>Catalog Inventory is Empty (0 SKUs)</h3>
                  <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                    All fastener products have been removed from the central inventory. You can import new products using an Excel file, add a single SKU, or restore the demo fasteners.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button type="button" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => setIsBulkUploadOpen(true)}>
                      <Upload size={14} />
                      <span>Upload Products via Excel</span>
                    </button>
                    <button type="button" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => setIsAddOpen(true)}>
                      <Plus size={14} />
                      <span>Add Single SKU</span>
                    </button>
                    <button type="button" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0052CC', borderColor: '#BFDBFE', background: '#EFF6FF' }} onClick={handleRestoreDefaultsAction}>
                      <RotateCcw size={14} />
                      <span>Restore Demo Catalog (47 SKUs)</span>
                    </button>
                  </div>
                </div>
              ) : totalCount === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '40px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <AlertTriangle size={36} color="#D97706" style={{ margin: '0 auto 8px' }} />
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px' }}>No Fastener SKUs Matched</h4>
                  <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748B' }}>No products match your current search and filter combination.</p>
                  <button type="button" className="btn-outline" onClick={handleResetFilters}>
                    Clear All Filters
                  </button>
                </div>
              ) : (
                paginatedProducts.map((p) => {
                  const isLowStock = p.stockPcs > 0 && p.stockPcs <= 5000;
                  const isOutOfStock = p.stockPcs === 0;

                  return (
                    <div
                      key={p.id}
                      style={{
                        background: selectedProductIds.has(p.id) ? '#F0F7FF' : '#FFFFFF',
                        borderRadius: '12px',
                        border: selectedProductIds.has(p.id) ? '2px solid #0052CC' : p.isSurplus ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: selectedProductIds.has(p.id) ? '0 4px 14px rgba(0, 82, 204, 0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                    >
                      {/* Top Badges & Image */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="checkbox"
                              checked={selectedProductIds.has(p.id)}
                              onChange={() => toggleSelectProduct(p.id)}
                              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                              title="Select product for bulk action"
                            />
                            <span style={{
                              fontSize: '11px',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: '#EFF6FF',
                              color: '#0052CC',
                              border: '1px solid #BFDBFE'
                            }}>
                              {p.standard || 'DIN'}
                            </span>
                          </div>
                          {p.isSurplus ? (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: '#FEF3C7',
                              color: '#B45309',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              <Flame size={11} /> SURPLUS (-{p.surplusDiscountPct}%)
                            </span>
                          ) : (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: isOutOfStock ? '#FEE2E2' : isLowStock ? '#FEF3C7' : '#ECFDF5',
                              color: isOutOfStock ? '#DC2626' : isLowStock ? '#D97706' : '#059669',
                            }}>
                              {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'Ready Stock'}
                            </span>
                          )}
                        </div>

                        {/* Image Thumbnail Container */}
                        <div
                          style={{
                            height: '140px',
                            background: '#F8FAFC',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            position: 'relative',
                            marginBottom: '12px',
                            cursor: 'pointer'
                          }}
                          onClick={() => setPreviewProduct(p)}
                          title="Click to preview photo"
                        >
                          <img
                            src={p.imageUrl || '/assets/bolt_zinc.jpg'}
                            alt={p.sku}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/bolt_zinc.jpg';
                            }}
                          />
                          <span style={{
                            position: 'absolute',
                            bottom: '6px',
                            right: '6px',
                            background: 'rgba(15, 23, 42, 0.7)',
                            color: '#FFFFFF',
                            borderRadius: '4px',
                            padding: '3px 6px',
                            fontSize: '10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            <ZoomIn size={11} /> Zoom
                          </span>
                        </div>

                        {/* Title & SKU (Clickable to open pop-up bar) */}
                        <div
                          onClick={() => {
                            setInspectProduct(p);
                            setInspectTab('overview');
                          }}
                          style={{ cursor: 'pointer' }}
                          title="Click to view full product specs in pop-up bar"
                        >
                          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#0052CC', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <span>{p.sku}</span>
                            <ChevronRight size={11} />
                          </div>
                          <h4 style={{
                            margin: '4px 0 8px',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#0F172A',
                            lineHeight: '1.3',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {p.name}
                          </h4>
                        </div>

                        {/* Size & Grade Tags */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                          <span style={{ fontSize: '11px', background: '#F1F5F9', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            {p.sizeFormatted || `${p.diameter}x${p.lengthMm}`}
                          </span>
                          <span style={{ fontSize: '11px', background: '#F1F5F9', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            Gr. {p.grade}
                          </span>
                          {p.finish && (
                            <span style={{ fontSize: '10px', background: '#F1F5F9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>
                              {p.finish.split(' ')[0]}
                            </span>
                          )}
                        </div>

                        {/* Stats Grid */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '8px',
                          padding: '10px',
                          background: '#F8FAFC',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          marginBottom: '12px',
                          fontSize: '11px'
                        }}>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', fontSize: '10px' }}>Rate / Pc:</span>
                            <strong style={{ color: '#0052CC', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                              {formatINR(p.pricePerPiece)}
                            </strong>
                          </div>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', fontSize: '10px' }}>Rate / Kg:</span>
                            <strong style={{ color: '#059669', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                              {formatINR(p.pricePerKg)}
                            </strong>
                          </div>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', fontSize: '10px' }}>Stock:</span>
                            <strong style={{ fontFamily: 'var(--font-mono)' }}>
                              {p.stockPcs.toLocaleString()} pcs
                            </strong>
                          </div>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', fontSize: '10px' }}>Weight:</span>
                            <span style={{ fontFamily: 'var(--font-mono)' }}>
                              {p.weightPerPcKg} kg/pc
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions Bar */}
                      <div style={{ display: 'flex', gap: '6px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setInspectProduct(p);
                            setInspectTab('overview');
                          }}
                          className="btn-outline"
                          style={{ flex: 1, padding: '6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          title="Open Product Details Pop-up Bar"
                        >
                          <Eye size={12} />
                          <span>Specs</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditProduct({ ...p });
                            setEditModalTab('basic');
                          }}
                          className="btn-outline"
                          style={{ flex: 1, padding: '6px', fontSize: '11px', color: '#0052CC', borderColor: '#BFDBFE', background: '#EFF6FF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          title="Edit fastener"
                        >
                          <Edit size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleSurplus(p.id)}
                          className="btn-outline"
                          style={{ padding: '6px 8px', color: p.isSurplus ? '#B45309' : '#64748B' }}
                          title="Toggle surplus deal"
                        >
                          <Flame size={13} color={p.isSurplus ? '#F59E0B' : '#94A3B8'} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteProduct(p)}
                          className="btn-outline"
                          style={{ padding: '6px 8px', color: '#DC2626' }}
                          title="Delete SKU"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
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
        ) : (
          /* VIEW MODE: RESPONSIVE TABLE (NO HORIZONTAL SCROLL) */
          <div style={{ background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 10px 12px 16px', width: '38px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isAllPageSelected}
                      onChange={toggleSelectAllOnPage}
                      style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                      title={isAllPageSelected ? 'Deselect all on this page' : 'Select all on this page'}
                    />
                  </th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, width: '40%' }}>SKU & Product Details</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, width: '16%' }}>Grade & Coating</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, width: '16%' }}>Rate (Pc / Kg)</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, width: '14%' }}>Stock & Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, width: '12%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingData ? (
                  <tr>
                    <td colSpan={6}>
                      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <Loader2 size={32} className="animate-spin" color="#FF6B00" style={{ margin: '0 auto 12px' }} />
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Loading Fastener SKUs...</div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Querying central database catalog with limit pagination</div>
                      </div>
                    </td>
                  </tr>
                ) : totalCount === 0 && !search && selectedSubGroup === 'all' && selectedStandard === 'all' && selectedGrade === 'all' && selectedStock === 'all' && selectedCatalog === 'all' ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="admin-empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F1F5F9', color: '#64748B', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                          <PackageOpen size={28} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>Catalog Inventory is Empty (0 SKUs)</h3>
                        <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                          All fastener products have been removed from the central inventory. You can import new products using an Excel file, add a single SKU, or restore the demo fasteners.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button type="button" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => setIsBulkUploadOpen(true)}>
                            <Upload size={14} />
                            <span>Upload Products via Excel</span>
                          </button>
                          <button type="button" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => setIsAddOpen(true)}>
                            <Plus size={14} />
                            <span>Add Single SKU</span>
                          </button>
                          <button type="button" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0052CC', borderColor: '#BFDBFE', background: '#EFF6FF' }} onClick={handleRestoreDefaultsAction}>
                            <RotateCcw size={14} />
                            <span>Restore Demo Catalog (47 SKUs)</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : totalCount === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="admin-empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <AlertTriangle size={36} color="#D97706" style={{ margin: '0 auto 8px' }} />
                        <h4 style={{ margin: '0 0 4px', fontSize: '15px' }}>No Fastener SKUs Matched</h4>
                        <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748B' }}>No products match your current search and filter combination.</p>
                        <button type="button" className="btn-outline" onClick={handleResetFilters}>
                          Clear All Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((p) => {
                    const isLowStock = p.stockPcs > 0 && p.stockPcs <= 5000;
                    const isOutOfStock = p.stockPcs === 0;

                    return (
                      <tr
                        key={p.id}
                        className={p.isSurplus ? 'surplus-row' : ''}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          background: selectedProductIds.has(p.id) ? '#EFF6FF' : undefined,
                          transition: 'background 0.15s ease'
                        }}
                      >
                        {/* 0. Row Selection Checkbox */}
                        <td style={{ padding: '12px 10px 12px 16px', width: '38px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedProductIds.has(p.id)}
                            onChange={() => toggleSelectProduct(p.id)}
                            style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                            title="Select product for bulk action"
                          />
                        </td>

                        {/* 1. SKU & Product Details (Clickable Tab to open Pop up bar) */}
                        <td style={{ padding: '12px 16px' }}>
                          <div
                            onClick={() => {
                              setInspectProduct(p);
                              setInspectTab('overview');
                            }}
                            role="button"
                            tabIndex={0}
                            title="Click to view full product details & specs in pop up bar"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '6px',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <div style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '6px',
                              border: '1px solid #E2E8F0',
                              overflow: 'hidden',
                              flexShrink: 0,
                              background: '#F8FAFC',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative'
                            }}>
                              <Image
                                src={p.imageUrl || '/assets/bolt_zinc.jpg'}
                                alt={p.sku}
                                width={38}
                                height={38}
                                unoptimized={Boolean(p.imageUrl && p.imageUrl.startsWith('http'))}
                                style={{ objectFit: 'contain' }}
                                onError={(e) => {
                                  try {
                                    (e.target as any).src = '/assets/bolt_zinc.jpg';
                                  } catch {}
                                }}
                              />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '2px' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: '#EFF6FF',
                                  color: '#0052CC',
                                  fontWeight: 700,
                                  fontSize: '11px',
                                  fontFamily: 'var(--font-mono)',
                                  border: '1px solid #BFDBFE'
                                }}>
                                  {p.sku}
                                  <ChevronRight size={11} />
                                </span>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '1px 6px',
                                  borderRadius: '3px',
                                  background: '#F1F5F9',
                                  color: '#475569',
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  fontFamily: 'var(--font-mono)'
                                }}>
                                  {p.standard || p.din || 'DIN'}
                                </span>
                                {p.isSurplus && (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                    background: '#FEF3C7',
                                    color: '#B45309',
                                    fontSize: '9px',
                                    fontWeight: 700
                                  }}>
                                    <Flame size={10} /> -{p.surplusDiscountPct}%
                                  </span>
                                )}
                              </div>
                              <div style={{
                                fontWeight: 600,
                                fontSize: '13px',
                                color: '#0F172A',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '340px'
                              }}>
                                {p.name}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', gap: '8px', marginTop: '2px' }}>
                                <span>{p.sizeFormatted || `${p.diameter} × ${p.lengthMm}mm`}</span>
                                <span>•</span>
                                <span>{p.subGroup || p.category || 'Fastener'}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Grade & Coating */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span style={{
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono)',
                              fontSize: '12px',
                              color: '#1E293B'
                            }}>
                              {p.grade || 'Grade 8.8'}
                            </span>
                            <span style={{
                              fontSize: '11px',
                              color: '#64748B',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {p.finish || 'Zinc Plated'}
                            </span>
                          </div>
                        </td>

                        {/* 3. Rate (Pc / Kg) */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              fontSize: '13px',
                              color: '#0052CC'
                            }}>
                              {formatINR(p.pricePerPiece)} <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 500 }}>/ pc</span>
                            </span>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '11px',
                              color: '#059669',
                              fontWeight: 600
                            }}>
                              {formatINR(p.pricePerKg)} <span style={{ fontSize: '10px', color: '#64748B' }}>/ kg</span>
                            </span>
                          </div>
                        </td>

                        {/* 4. Stock & Status */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              fontSize: '12px',
                              color: isOutOfStock ? '#DC2626' : isLowStock ? '#D97706' : '#0F172A'
                            }}>
                              {p.stockPcs.toLocaleString()} <span style={{ fontSize: '10px', fontWeight: 500, color: '#64748B' }}>pcs</span>
                            </span>
                            <span style={{
                              display: 'inline-block',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 700,
                              width: 'fit-content',
                              background: isOutOfStock ? '#FEE2E2' : isLowStock ? '#FEF3C7' : '#ECFDF5',
                              color: isOutOfStock ? '#DC2626' : isLowStock ? '#D97706' : '#059669'
                            }}>
                              {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'Ready Stock'}
                            </span>
                          </div>
                        </td>

                        {/* 5. Actions */}
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectProduct(p);
                                setInspectTab('overview');
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '5px',
                                border: '1px solid #CBD5E1',
                                background: '#FFFFFF',
                                color: '#0052CC',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              title="Open Product Details Pop-up Bar"
                            >
                              <Eye size={12} />
                              <span>Specs</span>
                            </button>
                            <button
                              type="button"
                              className="admin-btn-action admin-btn-edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditProduct({ ...p });
                                setEditModalTab('basic');
                              }}
                              title="Edit fastener SKU parameters"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              type="button"
                              className="admin-btn-action admin-btn-delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteProduct(p);
                              }}
                              title="Delete SKU from catalog"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
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
        )}
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
                  <tr><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0', fontWeight: 700 }}>Small Box Packaging (Col 60)</td><td style={{ padding: '6px 12px', border: '1px solid #E2E8F0' }}>{inspectProduct.pcsPerBox || '500'} pcs ({inspectProduct.smallBoxWeightKg || 2.5} kg box)</td></tr>
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
                {selectedProductIds.size === products.length && products.length > 0
                  ? `Delete Entire Catalog (${products.length} SKUs)?`
                  : `Delete ${selectedProductIds.size} Selected ${selectedProductIds.size === 1 ? 'Product' : 'Products'}?`}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px' }}>
                {selectedProductIds.size === products.length && products.length > 0
                  ? 'CAUTION: You are about to permanently delete all products in the inventory. The catalog will become completely empty (0 SKUs) until new products are uploaded.'
                  : `Are you sure you want to permanently delete these ${selectedProductIds.size} fastener SKUs from the central database? They will be delisted from the catalog, search index, and the RFQ engine.`}
              </p>

              {/* Preview chips of selected SKUs */}
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
                  const p = products.find((item) => item.id === id);
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
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Yes, Delete {selectedProductIds.size} SKUs</span>
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
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#0052CC',
                    background: '#EFF6FF',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid #BFDBFE',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {inspectProduct.sku}
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
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A', lineHeight: '1.3' }}>
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
                        {inspectProduct.imageUrl && inspectProduct.imageUrl.includes('frappe.cloud') && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background: '#ECFDF5',
                            color: '#059669',
                            fontSize: '11px',
                            fontWeight: 600
                          }}>
                            <CheckCircle2 size={12} /> Frappe Cloud Synced
                          </span>
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
                          <td style={{ padding: '8px 14px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{inspectProduct.sku}</td>
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
                          <td style={{ padding: '8px 14px', fontWeight: 600 }}>{inspectProduct.pcsPerBox || '500'} pcs ({inspectProduct.smallBoxWeightKg || 2.5} kg)</td>
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
                <button
                  type="button"
                  className="btn-outline"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                  onClick={() => {
                    const prodToEdit = { ...inspectProduct };
                    setInspectProduct(null);
                    setEditProduct(prodToEdit);
                    setEditModalTab('basic');
                  }}
                >
                  <Edit size={13} />
                  <span>Edit Parameters</span>
                </button>
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
                  <FileSpreadsheet size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                    Bulk Fasteners Import via Excel
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748B' }}>
                    Upload Excel (.xlsx, .xls) or .csv workbooks to import fastener SKUs, specs, weights, and live rates.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

                <button
                  type="button"
                  disabled={isBulkImporting}
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
                    cursor: isBulkImporting ? 'not-allowed' : 'pointer',
                    color: '#64748B',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
                          Select a specific category sheet or import all sheets at once.
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
                          <option value="merge">Merge & Upsert (Update existing SKUs, create new) - Recommended</option>
                          <option value="append">Append Only (Add new SKUs, skip existing)</option>
                          <option value="replace">Replace Catalog (Overwrite entire inventory)</option>
                        </select>
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                          Ensures duplicate SKUs update existing records with the latest pricing and specs.
                        </span>
                      </div>

                      {/* Fallback Image Preset */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Default Image (If row lacks photo)
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
                          Assigned automatically when an item row has no photo URL.
                        </span>
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
            </div>

            {/* Footer */}
            {!bulkSuccessResult && !(activeJob && (activeJob.status === 'completed' || ['pending', 'parsing', 'syncing'].includes(activeJob.status))) && (
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
