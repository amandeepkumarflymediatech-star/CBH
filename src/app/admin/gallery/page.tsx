'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Images,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  X,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  ExternalLink,
  Layers,
  Check
} from 'lucide-react';
import { GalleryItem } from '@/lib/types';
import { showSuccessAlert, showConfirmDialog, showWarningAlert } from '@/lib/swal';

const CATEGORIES = [
  { key: 'manufacturing', label: 'Forging & Plant' },
  { key: 'quality', label: 'Testing & Lab' },
  { key: 'logistics', label: 'Warehouse & Dispatch' },
  { key: 'applications', label: 'Project Sites' },
  { key: 'exhibitions', label: 'Exhibitions & Expos' },
];

const PRESET_IMAGES = [
  { label: 'Cold Forging Plant', url: '/assets/hero.jpg' },
  { label: 'Tensile Testing Lab', url: '/assets/quality_lab_tensile.jpg' },
  { label: 'Optical Sorting Bay', url: '/assets/quality_optical_sorting.jpg' },
  { label: 'Salt Spray Chamber', url: '/assets/quality_salt_spray.jpg' },
  { label: 'Spectrometry Lab', url: '/assets/quality_cert_inspection.jpg' },
  { label: 'Logistics Depot', url: '/assets/global_logistics_hub.jpg' },
  { label: 'Hex Bolts Finished', url: '/assets/bolt_zinc.jpg' },
  { label: 'Structural Anchors', url: '/assets/anchor_bolt.jpg' },
  { label: 'Bridge Infrastructure', url: '/assets/global_infra_bridge.jpg' },
  { label: 'Refinery Piping', url: '/assets/global_oil_gas.jpg' },
  { label: 'Solar & Wind Farm', url: '/assets/global_solar_wind.jpg' },
  { label: 'Exhibition Stand', url: '/assets/exhibitions/exhibition_stand_branded.jpg' },
  { label: 'Engineering Dialogue', url: '/assets/exhibitions/exhibition_conversation.jpg' },
  { label: 'Executive Showcase', url: '/assets/exhibitions/exhibition_stand_photo.jpg' },
];

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('manufacturing');
  const [formImage, setFormImage] = useState(PRESET_IMAGES[0].url);
  const [formLocation, setFormLocation] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSpecs, setFormSpecs] = useState('');
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview Modal
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);

  // Load items from API
  const loadGalleryItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gallery?all=true');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
      }
    } catch (err) {
      console.error('Failed to load gallery items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGalleryItems();
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (statusFilter === 'active' && item.isActive === false) return false;
      if (statusFilter === 'inactive' && item.isActive !== false) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesLoc = item.location?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesCategory = item.categoryLabel?.toLowerCase().includes(q);
        return matchesTitle || matchesLoc || matchesDesc || matchesCategory;
      }

      return true;
    });
  }, [items, selectedCategory, statusFilter, searchQuery]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCategory('manufacturing');
    setFormImage(PRESET_IMAGES[0].url);
    setFormLocation('Ludhiana Works, Punjab');
    setFormDate(new Date().getFullYear().toString());
    setFormDescription('');
    setFormSpecs('');
    setFormSortOrder(items.length + 1);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormImage(item.image);
    setFormLocation(item.location || '');
    setFormDate(item.date || '');
    setFormDescription(item.description || '');
    setFormSpecs(Array.isArray(item.specs) ? item.specs.join(', ') : '');
    setFormSortOrder(item.sortOrder || 0);
    setFormIsActive(item.isActive !== false);
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formImage.trim()) {
      showWarningAlert('Validation Error', 'Title and Image URL are required.');
      return;
    }

    setIsSubmitting(true);
    const categoryObj = CATEGORIES.find((c) => c.key === formCategory);
    const specsArray = formSpecs
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      id: editingItem ? editingItem.id : undefined,
      title: formTitle.trim(),
      category: formCategory,
      categoryLabel: categoryObj?.label || formCategory,
      image: formImage.trim(),
      location: formLocation.trim(),
      date: formDate.trim(),
      description: formDescription.trim(),
      specs: specsArray,
      sortOrder: Number(formSortOrder) || 0,
      isActive: formIsActive,
    };

    try {
      const url = '/api/gallery';
      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success && data.data) {
        if (editingItem) {
          setItems((prev) => prev.map((i) => (i.id === editingItem.id ? data.data : i)));
          showSuccessAlert('Updated!', `"${data.data.title}" updated successfully.`);
        } else {
          setItems((prev) => [data.data, ...prev]);
          showSuccessAlert('Created!', `"${data.data.title}" added to gallery.`);
        }
        setIsModalOpen(false);
      } else {
        showWarningAlert('Save Failed', data.error || 'Could not save gallery item.');
      }
    } catch (err: any) {
      showWarningAlert('Error', err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (item: GalleryItem) => {
    const confirmed = await showConfirmDialog(
      'Delete Media Item?',
      `Are you sure you want to remove "${item.title}" from the gallery?`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/gallery?id=${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        showSuccessAlert('Deleted', 'Media item removed successfully.');
      } else {
        showWarningAlert('Error', data.error || 'Failed to delete media item.');
      }
    } catch (err: any) {
      showWarningAlert('Error', err.message || 'Failed to delete media item.');
    }
  };

  // Toggle Active
  const handleToggleActive = async (item: GalleryItem) => {
    const updated = { ...item, isActive: !item.isActive };
    try {
      const res = await fetch('/api/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      }
    } catch {
      // ignore
    }
  };

  const totalCount = items.length;
  const activeCount = items.filter((i) => i.isActive !== false).length;
  const inactiveCount = items.filter((i) => i.isActive === false).length;

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* TOP HEADER & ACTION BAR                                         */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0052CC] dark:text-blue-400">
              <Images size={22} />
            </span>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Facility &amp; Media Gallery
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage high-resolution photo documentation across forging, NABL lab, automated warehouses, and expo showcases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadGalleryItems}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Refresh list"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0052CC] hover:bg-[#0043A6] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={16} />
            <span>Add Media Photo</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* QUICK STATS CARDS                                              */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Media</span>
          <strong className="text-xl font-black text-slate-900 dark:text-white mt-1 block">{totalCount}</strong>
        </div>
        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Live on Store</span>
          <strong className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{activeCount}</strong>
        </div>
        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Hidden / Draft</span>
          <strong className="text-xl font-black text-slate-500 mt-1 block">{inactiveCount}</strong>
        </div>
        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Categories</span>
          <strong className="text-xl font-black text-[#0052CC] dark:text-blue-400 mt-1 block">{CATEGORIES.length}</strong>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SEARCH & CATEGORY FILTER BAR                                   */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, location, or spec..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30"
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

          {/* Visibility filter */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'active'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'inactive'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Hidden ({inactiveCount})
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#0052CC] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => {
            const count = items.filter((i) => i.category === cat.key).length;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.key
                    ? 'bg-[#0052CC] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.key ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* MEDIA GRID LIST                                                */}
      {/* ============================================================== */}
      {isLoading ? (
        <div className="bg-white dark:bg-[#0F172A] p-12 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#0052CC] animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading media library...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
          <Images className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No media items found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No photographs matched your search query "${searchQuery}".`
              : 'Add your first facility photo using the button above.'}
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0052CC] text-white text-xs font-bold"
          >
            <Plus size={14} /> Add First Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-[#0F172A] rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col ${
                item.isActive === false
                  ? 'border-slate-200 dark:border-slate-800 opacity-70 bg-slate-50/50'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Media Thumbnail Container */}
              <div className="relative h-48 w-full bg-slate-900 group overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Category Badge */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/10">
                    {item.categoryLabel || item.category}
                  </span>
                </div>

                {/* Status Toggle on image */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(item)}
                  className={`absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm backdrop-blur-md cursor-pointer ${
                    item.isActive !== false
                      ? 'bg-emerald-500/90 text-white'
                      : 'bg-red-500/90 text-white'
                  }`}
                  title={item.isActive !== false ? 'Click to hide' : 'Click to publish'}
                >
                  {item.isActive !== false ? (
                    <>
                      <CheckCircle2 size={11} />
                      <span>Live</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={11} />
                      <span>Hidden</span>
                    </>
                  )}
                </button>

                {/* Date tag */}
                {item.date && (
                  <div className="absolute bottom-2 left-2.5 text-[10px] font-mono text-white/90 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded">
                    {item.date}
                  </div>
                )}

                {/* Quick preview button */}
                <button
                  type="button"
                  onClick={() => setPreviewItem(item)}
                  className="absolute bottom-2 right-2.5 w-7 h-7 rounded-lg bg-black/60 hover:bg-[#0052CC] text-white flex items-center justify-center transition-colors shadow-sm"
                  title="Preview"
                >
                  <Eye size={13} />
                </button>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {item.location && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1">
                      <MapPin size={11} className="text-[#FF6B00] shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  )}

                  <h3 className="font-bold text-slate-900 dark:text-white text-xs leading-snug line-clamp-2">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {item.specs && item.specs.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {item.specs.slice(0, 2).map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded"
                        >
                          {s}
                        </span>
                      ))}
                      {item.specs.length > 2 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{item.specs.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Controls: Edit / Delete */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    Order: #{item.sortOrder || 0}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit photo info"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Delete photo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD / EDIT MODAL                                               */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-left my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0052CC]">
                  <Images size={18} />
                </span>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  {editingItem ? 'Edit Media Photo' : 'Add New Media Photo'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="space-y-4 mt-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Photo Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Universal Tensile & Proof Load Testing Machine"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30"
                />
              </div>

              {/* Category & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Display Order (Sort)
                  </label>
                  <input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30"
                  />
                </div>
              </div>

              {/* Image URL & Preset Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Image Path / URL *
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="/assets/quality_lab_tensile.jpg"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30"
                  />

                  {/* Preset quick links */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">
                      Quick Pick From Facility Presets:
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                      {PRESET_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormImage(preset.url)}
                          className={`text-[10px] px-2 py-0.5 rounded transition-all ${
                            formImage === preset.url
                              ? 'bg-[#0052CC] text-white font-bold'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Image Preview */}
                  {formImage && (
                    <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mt-2">
                      <Image
                        src={formImage}
                        alt="Preview"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          // fallback
                        }}
                      />
                      <span className="absolute bottom-1 right-2 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                        Live Preview
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Facility Location / Unit
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Central Metallurgy Lab, Ludhiana Works"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date Tag / Badge
                  </label>
                  <input
                    type="text"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="e.g. Certified Q4 2025 or Daily QC"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Concise overview of what is depicted in this photo..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30 resize-none"
                />
              </div>

              {/* Technical Specs (comma separated) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Key Technical Highlights / Specs (Comma separated)
                </label>
                <input
                  type="text"
                  value={formSpecs}
                  onChange={(e) => setFormSpecs(e.target.value)}
                  placeholder="e.g. NABL certified, ISO 898-1 proof load, 1000 kN capacity"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="formIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-[#0052CC] focus:ring-[#0052CC]"
                />
                <label htmlFor="formIsActive" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Visible live in public gallery
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold bg-[#0052CC] hover:bg-[#0043A6] text-white rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Photo Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* QUICK PREVIEW LIGHTBOX                                         */}
      {/* ============================================================== */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-[#0F172A] rounded-2xl max-w-2xl w-full overflow-hidden text-white border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-72 sm:h-96 w-full bg-black">
              <Image
                src={previewItem.image}
                alt={previewItem.title}
                fill
                className="object-contain"
              />
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-white/20"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 sm:p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">
                {previewItem.categoryLabel || previewItem.category} • {previewItem.date}
              </span>
              <h3 className="text-base font-black mt-1">{previewItem.title}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{previewItem.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
