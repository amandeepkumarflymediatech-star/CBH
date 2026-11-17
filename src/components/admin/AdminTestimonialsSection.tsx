'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Testimonial } from '@/lib/types';
import TablePagination from '@/components/common/TablePagination';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
  Sparkles,
  Building,
  MapPin,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  X,
  MessageSquare,
  Award,
  Layers,
  ArrowUpDown,
  Upload,
  ImageIcon,
  Loader2,
  User
} from 'lucide-react';

interface AdminTestimonialsSectionProps {
  testimonials: Testimonial[];
  onAdd: (data: Partial<Testimonial>) => Promise<void>;
  onUpdate: (id: string | number, data: Partial<Testimonial>) => Promise<void>;
  onDelete: (id: string | number) => Promise<void>;
  showToast: (msg: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const CATEGORIES = [
  'All',
  'Heavy Engineering',
  'Automotive',
  'Infrastructure',
  'Solar & PEB',
  'Stainless Steel',
  'General',
];

export default function AdminTestimonialsSection({
  testimonials,
  onAdd,
  onUpdate,
  onDelete,
  showToast,
  isLoading = false,
  onRefresh,
}: AdminTestimonialsSectionProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'ACTIVE' | 'HIDDEN'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Avatar upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for Add/Edit
  const [formData, setFormData] = useState<Partial<Testimonial>>({
    name: '',
    role: '',
    company: '',
    location: '',
    avatar: '',
    rating: 5,
    feedback: '',
    verifiedPurchase: '',
    badge: 'OEM Buyer',
    category: 'Heavy Engineering',
    featured: false,
    status: 'ACTIVE',
    displayOrder: 1,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      company: '',
      location: '',
      avatar: '',
      rating: 5,
      feedback: '',
      verifiedPurchase: '',
      badge: 'OEM Buyer',
      category: 'Heavy Engineering',
      featured: false,
      status: 'ACTIVE',
      displayOrder: testimonials.length + 1,
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: Testimonial) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      role: item.role,
      company: item.company,
      location: item.location,
      avatar: item.avatar || '',
      rating: item.rating,
      feedback: item.feedback,
      verifiedPurchase: item.verifiedPurchase,
      badge: item.badge,
      category: item.category,
      featured: item.featured,
      status: item.status,
      displayOrder: item.displayOrder,
    });
    setIsAddModalOpen(true);
  };

  // Avatar upload handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB.');
      return;
    }

    try {
      setIsUploading(true);
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (json.success && json.url) {
        setFormData((prev) => ({ ...prev, avatar: json.url }));
        showToast('Profile image uploaded successfully.');
      } else {
        showToast(json.error || 'Failed to upload profile image.');
      }
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      showToast('Error uploading profile image.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.company?.trim() || !formData.feedback?.trim()) {
      showToast('Please fill in Name, Company, and Feedback.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingItem) {
        await onUpdate(editingItem.id, formData);
        showToast('Testimonial updated successfully.');
      } else {
        await onAdd(formData);
        showToast('Testimonial added successfully.');
      }
      setIsAddModalOpen(false);
      resetForm();
    } catch {
      showToast('Failed to save testimonial.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: Testimonial) => {
    const nextStatus = item.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE';
    try {
      await onUpdate(item.id, { status: nextStatus });
      showToast(`Testimonial status changed to ${nextStatus}.`);
    } catch {
      showToast('Failed to update status.');
    }
  };

  const handleToggleFeatured = async (item: Testimonial) => {
    const nextFeatured = !item.featured;
    try {
      await onUpdate(item.id, { featured: nextFeatured });
      showToast(nextFeatured ? 'Marked as Featured on Homepage.' : 'Removed from Featured.');
    } catch {
      showToast('Failed to toggle featured state.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      setIsSubmitting(true);
      await onDelete(deletingId);
      showToast('Testimonial removed.');
      setDeletingId(null);
    } catch {
      showToast('Failed to delete testimonial.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = testimonials.length;
    const active = testimonials.filter((t) => t.status === 'ACTIVE').length;
    const featured = testimonials.filter((t) => t.featured).length;
    const avgRating = total > 0
      ? (testimonials.reduce((sum, t) => sum + (t.rating || 5), 0) / total).toFixed(1)
      : '5.0';
    return { total, active, featured, avgRating };
  }, [testimonials]);

  // Filtering
  const filteredList = useMemo(() => {
    let result = [...testimonials];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.company.toLowerCase().includes(q) ||
          (t.role && t.role.toLowerCase().includes(q)) ||
          t.feedback.toLowerCase().includes(q) ||
          (t.verifiedPurchase && t.verifiedPurchase.toLowerCase().includes(q)) ||
          (t.location && t.location.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter((t) => (t.category || '').toLowerCase() === selectedCategory.toLowerCase());
    }

    if (selectedStatus !== 'All') {
      result = result.filter((t) => t.status === selectedStatus);
    }

    return result.sort((a, b) => {
      if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      }
      return 0;
    });
  }, [testimonials, search, selectedCategory, selectedStatus]);

  // Reset to first page when search, category, or status changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedStatus]);

  // Paginated List
  const totalItems = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedList = useMemo(() => {
    const start = (validCurrentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, validCurrentPage, itemsPerPage]);

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Reviews</span>
            <span className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <MessageSquare size={16} />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{metrics.total}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Industrial buyer feedback</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active On Store</span>
            <span className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">{metrics.active}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Published & live on website</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Rating</span>
            <span className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-lg">
              <Star size={16} fill="currentColor" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">{metrics.avgRating} / 5.0</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Overall client satisfaction</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Featured Frontpage</span>
            <span className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-lg">
              <Sparkles size={16} />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">{metrics.featured}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Highlighted on homepage</p>
        </div>
      </div>

      {/* Control Bar: Search, Category, Status, Add Button */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by client name, company, verified fastener spec, feedback..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                title="Refresh Testimonials"
              >
                <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Add Testimonial</span>
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Industry:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Status:</span>
            {(['All', 'ACTIVE', 'HIDDEN'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 hover:text-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main List Table / Cards */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-2">
            <Award className="text-blue-600" size={17} />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Live Testimonials ({filteredList.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Click star to toggle Featured • Click eye to toggle Active / Hidden
          </span>
        </div>

        {filteredList.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No testimonials found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or click "Add Testimonial" above.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {paginatedList.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Profile & Verification */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Profile Avatar / Initials */}
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-2xs">
                    {item.avatar ? (
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.avatar-initials');
                          if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div
                      className={`avatar-initials w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-sm flex items-center justify-center ${
                        item.avatar ? 'hidden' : ''
                      }`}
                    >
                      {item.name ? item.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    {/* Name, Role, Company, Location */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                        {item.name}
                      </h4>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {item.badge}
                        </span>
                      )}
                      {item.category && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {item.category}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{item.role || 'Executive'}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Building size={12} className="text-slate-400" />
                        {item.company}
                      </span>
                      {item.location && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} className="text-slate-400" />
                            {item.location}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Feedback Quote */}
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic line-clamp-2 bg-slate-50/80 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      "{item.feedback}"
                    </p>

                    {/* Verified Purchase pill */}
                    {item.verifiedPurchase && (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                        <CheckCircle2 size={13} className="shrink-0" />
                        <span>Verified Fastener Purchase: <strong className="font-bold">{item.verifiedPurchase}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Rating, Status, Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-700/60">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-900">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < (item.rating || 5) ? 'currentColor' : 'none'}
                        className={i < (item.rating || 5) ? 'text-amber-500' : 'text-slate-300'}
                      />
                    ))}
                    <span className="text-[11px] font-black text-amber-700 dark:text-amber-400 ml-1">
                      {item.rating || 5}.0
                    </span>
                  </div>

                  {/* Featured Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(item)}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      item.featured
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    title={item.featured ? 'Featured on Homepage' : 'Click to feature on homepage'}
                  >
                    <Sparkles size={16} fill={item.featured ? 'currentColor' : 'none'} />
                  </button>

                  {/* Status Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(item)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                      item.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                    title="Click to toggle Active / Hidden"
                  >
                    {item.status === 'ACTIVE' ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span>{item.status}</span>
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
                    title="Edit Testimonial"
                  >
                    <Edit2 size={15} />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setDeletingId(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                    title="Delete Testimonial"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table Pagination */}
        {filteredList.length > 0 && (
          <TablePagination
            currentPage={validCurrentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={(p) => setCurrentPage(p)}
            onItemsPerPageChange={(n) => {
              setItemsPerPage(n);
              setCurrentPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 50]}
            itemLabel="testimonials"
          />
        )}
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  {editingItem ? <Edit2 size={16} /> : <Plus size={16} />}
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {editingItem ? 'Edit Testimonial' : 'Add New Testimonial'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              {/* Profile Image / Avatar Upload */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-blue-600" />
                    <span>Client Profile Photo</span>
                  </label>
                  {formData.avatar && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: '' })}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-1 transition-colors"
                    >
                      <Trash2 size={12} />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
                  {/* Thumbnail Preview */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0 shadow-2xs flex items-center justify-center">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                        <User size={24} />
                        <span className="text-[8px] font-bold uppercase mt-0.5 tracking-wider">No Photo</span>
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center text-white">
                        <Loader2 size={18} className="animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Upload button & URL input */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        className="hidden"
                        id="testimonial-avatar-upload"
                      />
                      <label
                        htmlFor="testimonial-avatar-upload"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                          isUploading
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                        }`}
                      >
                        {isUploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                        <span>{isUploading ? 'Uploading...' : 'Upload Profile Photo'}</span>
                      </label>
                      <span className="text-[11px] text-slate-400">PNG, JPG, WebP (up to 5MB)</span>
                    </div>

                    <input
                      type="text"
                      placeholder="Or paste direct image URL (e.g. /assets/products/... or https://...)"
                      value={formData.avatar || ''}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohit Malhotra"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                  />
                </div>

                {/* Designation / Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Designation / Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chief Works Engineer"
                    value={formData.role || ''}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Malhotra Heavy Fabrication Ltd."
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pune, Maharashtra"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Rating */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Rating (Stars)
                  </label>
                  <select
                    value={formData.rating || 5}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white cursor-pointer"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5.0 Excellent)</option>
                    <option value={4}>⭐⭐⭐⭐ (4.0 Very Good)</option>
                    <option value={3}>⭐⭐⭐ (3.0 Good)</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Industry Category
                  </label>
                  <select
                    value={formData.category || 'Heavy Engineering'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Trust Badge */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Buyer Badge
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. OEM Tier-1, Metro Infra"
                    value={formData.badge || ''}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              {/* Verified Purchase Specification */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Verified Purchase Fastener Specification
                </label>
                <input
                  type="text"
                  placeholder="e.g. DIN 933 High Tensile 8.8 Hex (M16 x 65 - 12,000 Pcs)"
                  value={formData.verifiedPurchase || ''}
                  onChange={(e) => setFormData({ ...formData, verifiedPurchase: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>

              {/* Feedback Quote */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Client Review / Feedback Quote *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write client testimonial quote detailing fastener quality, tensile strength, coating, delivery speed, or MTC compliance..."
                  value={formData.feedback || ''}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white leading-relaxed"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.featured)}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Feature on Homepage (Frontpage Banner)
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Status:</span>
                  <select
                    value={formData.status || 'ACTIVE'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-bold dark:text-white"
                  >
                    <option value="ACTIVE">ACTIVE (Published)</option>
                    <option value="HIDDEN">HIDDEN (Draft)</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update Testimonial' : 'Save Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={22} />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Delete Testimonial?</h4>
            <p className="text-xs text-slate-500 mt-1">
              This client review will be permanently deleted from the database and storefront.
            </p>
            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
