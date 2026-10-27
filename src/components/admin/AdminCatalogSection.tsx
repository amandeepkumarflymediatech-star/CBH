'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TablePagination from '@/components/common/TablePagination';
import {
  CatalogCategory,
  CatalogSubcategory,
  CatalogProductFamily,
  TechnicalVariant
} from '@/lib/catalog-types';
import { formatINR } from '@/lib/rfq-calculator';
import {
  Layers,
  Wrench,
  TableProperties,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  X,
  Search,
  Filter,
  FolderPlus,
  Folder,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

// Preset industrial fast-pick images
const IMAGE_PRESETS = [
  { label: 'Steel Anchors', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80' },
  { label: 'Chemical Resin', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80' },
  { label: 'High Performance', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80' },
  { label: 'Nylon Plugs', url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80' },
  { label: 'Construction Yard', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80' },
  { label: 'Industrial Workshop', url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80' },
];

interface AdminCatalogSectionProps {
  initialSubTab?: 'categories' | 'subcategories' | 'families' | 'variants';
}

export default function AdminCatalogSection({ initialSubTab = 'categories' }: AdminCatalogSectionProps) {
  const [activeCatalogTab, setActiveCatalogTab] = useState<'categories' | 'subcategories' | 'families' | 'variants'>(initialSubTab);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [subcategories, setSubcategories] = useState<CatalogSubcategory[]>([]);
  const [families, setFamilies] = useState<CatalogProductFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFamilySlug, setSelectedFamilySlug] = useState<string>('bolt-anchor-faz-ii-plus');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Search and Filter states
  const [categorySearch, setCategorySearch] = useState('');
  const [subcategorySearch, setSubcategorySearch] = useState('');
  const [selectedParentCategoryFilter, setSelectedParentCategoryFilter] = useState('all');

  // Category Modal State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CatalogCategory | null>(null);
  const [catForm, setCatForm] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    bannerUrl: '',
    featured: false,
  });

  // Subcategory Modal State
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<CatalogSubcategory | null>(null);
  const [subForm, setSubForm] = useState({
    categorySlug: '',
    name: '',
    slug: '',
    tagline: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    bannerUrl: '',
    featured: false,
  });

  // Variant Modal State
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [newVarArtName, setNewVarArtName] = useState('');
  const [newVarItemNo, setNewVarItemNo] = useState('');
  const [newVarDrillDia, setNewVarDrillDia] = useState(10);
  const [newVarDepth, setNewVarDepth] = useState(60);
  const [newVarFixture, setNewVarFixture] = useState(10);
  const [newVarThread, setNewVarThread] = useState('M10 x 20');
  const [newVarPrice, setNewVarPrice] = useState(90);
  const [newVarPackQty, setNewVarPackQty] = useState(50);
  const [newVarMaterial, setNewVarMaterial] = useState('gvz');

  const notify = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, subRes, famRes] = await Promise.all([
        fetch('/api/catalog/categories').then((r) => r.json()),
        fetch('/api/catalog/subcategories').then((r) => r.json()),
        fetch('/api/catalog/families').then((r) => r.json()),
      ]);

      if (catRes.success) setCategories(catRes.data);
      if (subRes.success) setSubcategories(subRes.data);
      if (famRes.success) {
        setFamilies(famRes.data);
        if (famRes.data.length > 0 && !selectedFamilySlug) {
          setSelectedFamilySlug(famRes.data[0].slug);
        }
      }
    } catch (err: any) {
      console.error('Failed to load catalog data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper to generate clean slug
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // =========================================================================
  // CATEGORY HANDLERS
  // =========================================================================
  const openAddCategoryModal = () => {
    setCatForm({
      name: '',
      slug: '',
      tagline: '',
      description: '',
      imageUrl: IMAGE_PRESETS[0].url,
      bannerUrl: '',
      featured: false,
    });
    setEditingCategory(null);
    setIsAddingCategory(true);
  };

  const openEditCategoryModal = (cat: CatalogCategory) => {
    setCatForm({
      name: cat.name,
      slug: cat.slug,
      tagline: cat.tagline || '',
      description: cat.description || '',
      imageUrl: cat.imageUrl || IMAGE_PRESETS[0].url,
      bannerUrl: cat.bannerUrl || '',
      featured: Boolean(cat.featured),
    });
    setEditingCategory(cat);
    setIsAddingCategory(false);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) {
      notify('Category name is required.');
      return;
    }

    const finalSlug = catForm.slug.trim() || generateSlug(catForm.name);

    try {
      if (editingCategory) {
        // Edit existing
        const res = await fetch('/api/catalog/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingCategory.id,
            slug: editingCategory.slug,
            name: catForm.name.trim(),
            tagline: catForm.tagline.trim(),
            description: catForm.description.trim(),
            imageUrl: catForm.imageUrl.trim(),
            bannerUrl: catForm.bannerUrl.trim(),
            featured: catForm.featured,
          }),
        });
        const data = await res.json();
        if (data.success) {
          notify(`Category "${catForm.name}" updated successfully!`);
          setEditingCategory(null);
          loadData();
        } else {
          notify(data.error || 'Failed to update category.');
        }
      } else {
        // Create new
        const res = await fetch('/api/catalog/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: catForm.name.trim(),
            slug: finalSlug,
            tagline: catForm.tagline.trim(),
            description: catForm.description.trim(),
            imageUrl: catForm.imageUrl.trim(),
            bannerUrl: catForm.bannerUrl.trim(),
            featured: catForm.featured,
          }),
        });
        const data = await res.json();
        if (data.success) {
          notify(`Category "${catForm.name}" created successfully!`);
          setIsAddingCategory(false);
          loadData();
        } else {
          notify(data.error || 'Failed to create category.');
        }
      }
    } catch (err: any) {
      notify('Error saving category.');
    }
  };

  const handleDeleteCategory = async (slug: string, name: string) => {
    const childCount = subcategories.filter((s) => s.categorySlug === slug).length;
    const warning = childCount > 0 
      ? `Warning: This category currently has ${childCount} subcategories. Are you sure you want to delete "${name}"?`
      : `Are you sure you want to delete category "${name}"?`;

    if (!confirm(warning)) return;

    try {
      const res = await fetch(`/api/catalog/categories?slug=${encodeURIComponent(slug)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        notify(`Category "${name}" deleted.`);
        loadData();
      } else {
        notify(data.error || 'Failed to delete category.');
      }
    } catch (err) {
      notify('Failed to delete category.');
    }
  };

  // =========================================================================
  // SUBCATEGORY HANDLERS
  // =========================================================================
  const openAddSubcategoryModal = (defaultCatSlug?: string) => {
    const catSlug = defaultCatSlug || (categories.length > 0 ? categories[0].slug : '');
    setSubForm({
      categorySlug: catSlug,
      name: '',
      slug: '',
      tagline: '',
      description: '',
      imageUrl: IMAGE_PRESETS[1].url,
      bannerUrl: '',
      featured: false,
    });
    setEditingSubcategory(null);
    setIsAddingSubcategory(true);
  };

  const openEditSubcategoryModal = (sub: CatalogSubcategory) => {
    setSubForm({
      categorySlug: sub.categorySlug,
      name: sub.name,
      slug: sub.slug,
      tagline: sub.tagline || '',
      description: sub.description || '',
      imageUrl: sub.imageUrl || IMAGE_PRESETS[1].url,
      bannerUrl: sub.bannerUrl || '',
      featured: Boolean(sub.featured),
    });
    setEditingSubcategory(sub);
    setIsAddingSubcategory(false);
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.name.trim()) {
      notify('Subcategory name is required.');
      return;
    }
    if (!subForm.categorySlug.trim()) {
      notify('Please select a parent category.');
      return;
    }

    const finalSlug = subForm.slug.trim() || generateSlug(subForm.name);

    try {
      if (editingSubcategory) {
        // Edit existing
        const res = await fetch('/api/catalog/subcategories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingSubcategory.id,
            slug: editingSubcategory.slug,
            categorySlug: subForm.categorySlug.trim(),
            name: subForm.name.trim(),
            tagline: subForm.tagline.trim(),
            description: subForm.description.trim(),
            imageUrl: subForm.imageUrl.trim(),
            bannerUrl: subForm.bannerUrl.trim(),
            featured: subForm.featured,
          }),
        });
        const data = await res.json();
        if (data.success) {
          notify(`Subcategory "${subForm.name}" updated successfully!`);
          setEditingSubcategory(null);
          loadData();
        } else {
          notify(data.error || 'Failed to update subcategory.');
        }
      } else {
        // Create new
        const res = await fetch('/api/catalog/subcategories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: subForm.name.trim(),
            slug: finalSlug,
            categorySlug: subForm.categorySlug.trim(),
            tagline: subForm.tagline.trim(),
            description: subForm.description.trim(),
            imageUrl: subForm.imageUrl.trim(),
            bannerUrl: subForm.bannerUrl.trim(),
            featured: subForm.featured,
          }),
        });
        const data = await res.json();
        if (data.success) {
          notify(`Subcategory "${subForm.name}" created under ${subForm.categorySlug}!`);
          setIsAddingSubcategory(false);
          loadData();
        } else {
          notify(data.error || 'Failed to create subcategory.');
        }
      }
    } catch (err: any) {
      notify('Error saving subcategory.');
    }
  };

  const handleDeleteSubcategory = async (slug: string, name: string) => {
    if (!confirm(`Are you sure you want to delete subcategory "${name}"?`)) return;
    try {
      const res = await fetch(`/api/catalog/subcategories?slug=${encodeURIComponent(slug)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        notify(`Subcategory "${name}" deleted.`);
        loadData();
      } else {
        notify(data.error || 'Failed to delete subcategory.');
      }
    } catch (err) {
      notify('Failed to delete subcategory.');
    }
  };

  // =========================================================================
  // RESET CATALOG HANDLER
  // =========================================================================
  const handleResetCatalog = async () => {
    if (!confirm('Reset entire catalog hierarchy to default Fischer India structure? This will restore original categories, subcategories, families, and FAZ II Plus variants.')) {
      return;
    }
    try {
      const res = await fetch('/api/catalog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await res.json();
      if (data.success) {
        notify('Catalog restored to standard industrial defaults.');
        loadData();
      }
    } catch (err) {
      notify('Reset failed.');
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const q = categorySearch.toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q) || c.tagline.toLowerCase().includes(q)
    );
  }, [categories, categorySearch]);

  // Filtered subcategories
  const filteredSubcategories = useMemo(() => {
    let list = [...subcategories];
    if (selectedParentCategoryFilter !== 'all') {
      list = list.filter((s) => s.categorySlug === selectedParentCategoryFilter);
    }
    if (subcategorySearch.trim()) {
      const q = subcategorySearch.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q) ||
          s.categorySlug.toLowerCase().includes(q) ||
          s.tagline.toLowerCase().includes(q)
      );
    }
    return list;
  }, [subcategories, selectedParentCategoryFilter, subcategorySearch]);

  // Variant Actions
  const currentFamily = families.find((f) => f.slug === selectedFamilySlug) || families[0];
  const [variantsPage, setVariantsPage] = useState(1);
  const [variantsPerPage, setVariantsPerPage] = useState(10);

  useEffect(() => {
    setVariantsPage(1);
  }, [selectedFamilySlug]);

  const variantsList = useMemo(() => currentFamily?.variants || [], [currentFamily]);
  const paginatedVariants = useMemo(() => {
    const start = (variantsPage - 1) * variantsPerPage;
    return variantsList.slice(start, start + variantsPerPage);
  }, [variantsList, variantsPage, variantsPerPage]);

  const handleCreateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVarArtName || !newVarItemNo) return;
    try {
      const res = await fetch('/api/catalog/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familySlug: selectedFamilySlug,
          artName: newVarArtName,
          itemNo: newVarItemNo,
          materialCode: newVarMaterial,
          drillHoleDiameterMm: Number(newVarDrillDia),
          effectiveAnchorageDepthMm: Number(newVarDepth),
          maxFixtureThicknessMm: Number(newVarFixture),
          thread: newVarThread,
          unitPriceInr: Number(newVarPrice),
          packQty: Number(newVarPackQty),
        }),
      });
      const data = await res.json();
      if (data.success) {
        notify(`Variant "${newVarArtName}" added to ${currentFamily?.name || ''}!`);
        setIsAddingVariant(false);
        setNewVarArtName('');
        setNewVarItemNo('');
        loadData();
      }
    } catch (err) {
      notify('Failed to add variant.');
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this technical variant?')) return;
    try {
      const res = await fetch(
        `/api/catalog/variants?familySlug=${selectedFamilySlug}&id=${variantId}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        notify('Variant deleted from technical matrix.');
        loadData();
      }
    } catch (err) {
      notify('Failed to delete variant.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-3.5 rounded-xl border border-[#0052CC] flex items-center gap-2.5 text-xs font-semibold shadow-2xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Top Banner & Control Deck */}
      <div className="bg-white rounded-2xl p-6 border border-[#D8DFE7] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-extrabold text-[#0F172A]">Industrial Catalog &amp; Category Manager</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[rgba(0,82,204,0.1)] text-[#0052CC] text-[10px] font-bold uppercase tracking-wider">
              4-Level Architecture
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[rgba(255,107,0,0.12)] text-[#FF6B00] text-[10px] font-bold uppercase tracking-wider">
              {categories.length} Categories • {subcategories.length} Subcategories
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Create, organize, and edit Root Categories, Subcategories, Product Families, and Technical Variant Matrix tables.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={openAddCategoryModal}
            className="px-4 py-2 rounded-xl bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
          >
            <FolderPlus className="w-4 h-4" /> Add Category
          </button>
          <button
            type="button"
            onClick={() => openAddSubcategoryModal()}
            className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Subcategory
          </button>
          <Link
            href="/products"
            target="_blank"
            className="px-3 py-2 rounded-xl bg-[#F4F6F9] hover:bg-slate-200 text-[#14181E] border border-[#D8DFE7] text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#0052CC]" /> Storefront
          </Link>
          <button
            type="button"
            onClick={handleResetCatalog}
            className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Restore default catalog data"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Catalog Level Tabs */}
      <div className="flex border-b border-[#D8DFE7] bg-white rounded-xl px-4 shadow-sm overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveCatalogTab('categories')}
          className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeCatalogTab === 'categories'
              ? 'border-[#0052CC] text-[#0052CC]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Folder className="w-4 h-4" /> Level 1: Categories ({categories.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveCatalogTab('subcategories')}
          className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeCatalogTab === 'subcategories'
              ? 'border-[#0052CC] text-[#0052CC]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" /> Level 2: Subcategories ({subcategories.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveCatalogTab('families')}
          className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeCatalogTab === 'families'
              ? 'border-[#0052CC] text-[#0052CC]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Level 3: Families ({families.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveCatalogTab('variants')}
          className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeCatalogTab === 'variants'
              ? 'border-[#0052CC] text-[#0052CC]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TableProperties className="w-4 h-4" /> Level 4: Technical Matrix (Variants)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: CATEGORIES                                                        */}
      {/* ========================================================================= */}
      {activeCatalogTab === 'categories' && (
        <div className="space-y-4">
          {/* Top Search & Create Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#D8DFE7] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search categories by name, slug, or tagline..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500">
                {filteredCategories.length} Categories
              </span>
              <button
                type="button"
                onClick={openAddCategoryModal}
                className="px-3.5 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>
          </div>

          {/* Categories Table */}
          <div className="bg-white rounded-2xl border border-[#D8DFE7] shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-slate-600 uppercase text-[11px] font-bold border-b border-[#D8DFE7]">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Tagline &amp; Description</th>
                  <th className="py-3 px-3 text-center">Subcategories</th>
                  <th className="py-3 px-3 text-center">Featured</th>
                  <th className="py-3 px-4 text-center">Storefront</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8DFE7]">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Folder className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="font-semibold text-slate-600">No categories found.</p>
                      <button
                        type="button"
                        onClick={openAddCategoryModal}
                        className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#0052CC] text-white font-bold text-xs"
                      >
                        Create First Category
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 relative">
                            {c.imageUrl ? (
                              <Image
                                src={c.imageUrl}
                                alt={c.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Folder className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-extrabold text-[#0F172A] text-sm">{c.name}</div>
                            <div className="font-mono text-[11px] text-[#0052CC]">/products/{c.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-medium text-slate-700 line-clamp-1">{c.tagline || '—'}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{c.description || '—'}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedParentCategoryFilter(c.slug);
                            setActiveCatalogTab('subcategories');
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-[#0052CC] font-bold text-xs transition-colors"
                          title="View subcategories in this category"
                        >
                          <span>{c.subcategoriesCount ?? 0}</span>
                          <span className="text-[10px] uppercase font-semibold">Subcats</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {c.featured ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                            Featured
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-semibold">No</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/products/${c.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[#0052CC] hover:underline font-bold"
                        >
                          Preview <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openAddSubcategoryModal(c.slug)}
                            className="p-1.5 text-slate-500 hover:text-[#0052CC] hover:bg-blue-50 rounded-lg transition-colors"
                            title="Add subcategory to this category"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditCategoryModal(c)}
                            className="p-1.5 text-slate-500 hover:text-[#0052CC] hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit category"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(c.slug, c.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: SUBCATEGORIES                                                     */}
      {/* ========================================================================= */}
      {activeCatalogTab === 'subcategories' && (
        <div className="space-y-4">
          {/* Top Filter & Create Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#D8DFE7] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              {/* Category Filter Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter by Parent:</span>
                <select
                  value={selectedParentCategoryFilter}
                  onChange={(e) => setSelectedParentCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-bold text-slate-800 bg-[#F8FAFC] border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
                >
                  <option value="all">All Categories ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name} ({subcategories.filter((s) => s.categorySlug === c.slug).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Search Input */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search subcategories..."
                  value={subcategorySearch}
                  onChange={(e) => setSubcategorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500">
                {filteredSubcategories.length} Subcategories
              </span>
              <button
                type="button"
                onClick={() => openAddSubcategoryModal(selectedParentCategoryFilter !== 'all' ? selectedParentCategoryFilter : undefined)}
                className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Subcategory
              </button>
            </div>
          </div>

          {/* Subcategories Table */}
          <div className="bg-white rounded-2xl border border-[#D8DFE7] shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-slate-600 uppercase text-[11px] font-bold border-b border-[#D8DFE7]">
                <tr>
                  <th className="py-3 px-4">Subcategory</th>
                  <th className="py-3 px-4">Parent Category</th>
                  <th className="py-3 px-4">Tagline</th>
                  <th className="py-3 px-3 text-center">Families</th>
                  <th className="py-3 px-3 text-center">Featured</th>
                  <th className="py-3 px-4 text-center">Storefront</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8DFE7]">
                {filteredSubcategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Wrench className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="font-semibold text-slate-600">No subcategories match the filter.</p>
                      <button
                        type="button"
                        onClick={() => openAddSubcategoryModal(selectedParentCategoryFilter !== 'all' ? selectedParentCategoryFilter : undefined)}
                        className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#FF6B00] text-white font-bold text-xs"
                      >
                        Create Subcategory
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredSubcategories.map((s) => {
                    const parentCat = categories.find((c) => c.slug === s.categorySlug);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 relative">
                              {s.imageUrl ? (
                                <Image
                                  src={s.imageUrl}
                                  alt={s.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <Wrench className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-extrabold text-[#0F172A] text-sm">{s.name}</div>
                              <div className="font-mono text-[11px] text-[#0052CC]">{s.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => setSelectedParentCategoryFilter(s.categorySlug)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                          >
                            <Folder className="w-3 h-3 text-[#0052CC]" />
                            <span>{parentCat ? parentCat.name : s.categorySlug}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                          <div className="line-clamp-1 font-medium">{s.tagline || '—'}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{s.description || '—'}</div>
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-slate-700">
                          {s.familiesCount || families.filter((f) => f.subcategorySlug === s.slug).length || 0}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {s.featured ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                              Featured
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-semibold">No</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Link
                            href={`/products/${s.categorySlug}/${s.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[#0052CC] hover:underline font-bold"
                          >
                            Preview <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditSubcategoryModal(s)}
                              className="p-1.5 text-slate-500 hover:text-[#0052CC] hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit subcategory"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubcategory(s.slug, s.name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete subcategory"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: PRODUCT FAMILIES                                                  */}
      {/* ========================================================================= */}
      {activeCatalogTab === 'families' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {families.map((fam) => (
              <div key={fam.id} className="bg-white p-5 rounded-2xl border border-[#D8DFE7] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-[#0F172A] text-sm">{fam.name}</h4>
                      <div className="font-mono text-xs text-[#0052CC]">{fam.slug}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[rgba(255,107,0,0.1)] text-[#FF6B00] font-bold text-[10px]">
                      {fam.variants?.length || 0} Variants
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{fam.headline}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-[#EDF1F5] flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {fam.categorySlug} / {fam.subcategorySlug}
                  </span>
                  <Link
                    href={`/products/${fam.categorySlug}/${fam.subcategorySlug}/${fam.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-[#0052CC] hover:underline font-bold"
                  >
                    View Family Page <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: TECHNICAL MATRIX VARIANTS                                         */}
      {/* ========================================================================= */}
      {activeCatalogTab === 'variants' && (
        <div className="space-y-4">
          {/* Family Selector */}
          <div className="bg-white p-4 rounded-2xl border border-[#D8DFE7] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600">Select Family:</span>
              <select
                value={selectedFamilySlug}
                onChange={(e) => setSelectedFamilySlug(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#D8DFE7] text-xs font-bold text-slate-800 bg-[#F4F6F9] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
              >
                {families.map((f) => (
                  <option key={f.slug} value={f.slug}>
                    {f.name} ({f.variants?.length || 0} variants)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsAddingVariant(true)}
                className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Add Technical Variant
              </button>
              {currentFamily && (
                <Link
                  href={`/products/${currentFamily.categorySlug}/${currentFamily.subcategorySlug}/${currentFamily.slug}`}
                  target="_blank"
                  className="px-3 py-2 bg-[#F4F6F9] hover:bg-slate-200 text-[#14181E] border border-[#D8DFE7] rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  Storefront <ExternalLink className="w-3.5 h-3.5 text-[#0052CC]" />
                </Link>
              )}
            </div>
          </div>

          {/* Variants Table */}
          <div className="bg-white rounded-2xl border border-[#D8DFE7] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#D8DFE7] flex justify-between items-center bg-[#F8FAFC]">
              <div>
                <h4 className="font-extrabold text-[#0F172A] text-sm">{currentFamily?.name || 'Selected Family'}</h4>
                <p className="text-xs text-slate-500">
                  Total {variantsList.length} specification variants in technical sizing matrix.
                </p>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-slate-600 uppercase text-[11px] font-bold border-b border-[#D8DFE7]">
                <tr>
                  <th className="py-3 px-4">Item No / SKU</th>
                  <th className="py-3 px-4">Article Name</th>
                  <th className="py-3 px-3 text-center">Drill d0</th>
                  <th className="py-3 px-3 text-center">Depth hef</th>
                  <th className="py-3 px-3 text-center">Fixture tfix</th>
                  <th className="py-3 px-3 text-center">Thread</th>
                  <th className="py-3 px-3 text-right">Unit Rate</th>
                  <th className="py-3 px-3 text-center">Pack Qty</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8DFE7]">
                {paginatedVariants.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0052CC]">{v.itemNo}</td>
                    <td className="py-3 px-4 font-bold text-[#0F172A]">{v.artName}</td>
                    <td className="py-3 px-3 text-center font-mono">{v.drillHoleDiameterMm} mm</td>
                    <td className="py-3 px-3 text-center font-mono">{v.effectiveAnchorageDepthMm} mm</td>
                    <td className="py-3 px-3 text-center font-mono">{v.maxFixtureThicknessMm} mm</td>
                    <td className="py-3 px-3 text-center font-mono">{v.thread}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#0F172A]">
                      {formatINR(v.unitPriceInr)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">{v.packQty} pcs</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteVariant(v.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete variant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {variantsList.length > 0 && (
              <div className="p-4 border-t border-[#D8DFE7]">
                <TablePagination
                  currentPage={variantsPage}
                  totalItems={variantsList.length}
                  itemsPerPage={variantsPerPage}
                  onPageChange={(p) => setVariantsPage(p)}
                  onItemsPerPageChange={(n) => {
                    setVariantsPerPage(n);
                    setVariantsPage(1);
                  }}
                  itemLabel="variants"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT CATEGORY                                              */}
      {/* ========================================================================= */}
      {(isAddingCategory || editingCategory) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-xl w-full p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#0052CC]" />
                <h3 className="text-base font-extrabold text-[#0F172A]">
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCategory(false);
                  setEditingCategory(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={catForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setCatForm((prev) => ({
                        ...prev,
                        name,
                        slug: !editingCategory ? generateSlug(name) : prev.slug,
                      }));
                    }}
                    placeholder="e.g. Steel fixings"
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0052CC] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    URL Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={catForm.slug}
                    onChange={(e) => setCatForm((prev) => ({ ...prev, slug: generateSlug(e.target.value) }))}
                    placeholder="e.g. steel-fixings"
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#0052CC] outline-none"
                    disabled={!!editingCategory}
                    required
                  />
                  {editingCategory && (
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Slug cannot be modified once created</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Tagline</label>
                <input
                  type="text"
                  value={catForm.tagline}
                  onChange={(e) => setCatForm((prev) => ({ ...prev, tagline: e.target.value }))}
                  placeholder="e.g. High load capacity mechanical anchors for heavy duty construction"
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Description</label>
                <textarea
                  value={catForm.description}
                  onChange={(e) => setCatForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Technical overview of this category..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Image URL</label>
                <input
                  type="url"
                  value={catForm.imageUrl}
                  onChange={(e) => setCatForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Presets:</span>
                  {IMAGE_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setCatForm((prev) => ({ ...prev, imageUrl: p.url }))}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="cat-featured"
                  checked={catForm.featured}
                  onChange={(e) => setCatForm((prev) => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#0052CC] border-slate-300 focus:ring-[#0052CC]"
                />
                <label htmlFor="cat-featured" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Feature this category on storefront navigation and landing page
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCategory(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold shadow transition-colors"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT SUBCATEGORY                                           */}
      {/* ========================================================================= */}
      {(isAddingSubcategory || editingSubcategory) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-xl w-full p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="text-base font-extrabold text-[#0F172A]">
                  {editingSubcategory ? `Edit Subcategory: ${editingSubcategory.name}` : 'Create New Subcategory'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddingSubcategory(false);
                  setEditingSubcategory(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubcategory} className="space-y-4 pt-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Parent Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={subForm.categorySlug}
                  onChange={(e) => setSubForm((prev) => ({ ...prev, categorySlug: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold text-slate-800 bg-[#F8FAFC] focus:ring-2 focus:ring-[#FF6B00] outline-none"
                  required
                >
                  <option value="" disabled>Select parent category...</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name} ({c.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Subcategory Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setSubForm((prev) => ({
                        ...prev,
                        name,
                        slug: !editingSubcategory ? generateSlug(name) : prev.slug,
                      }));
                    }}
                    placeholder="e.g. Bolt anchor"
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#FF6B00] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    URL Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subForm.slug}
                    onChange={(e) => setSubForm((prev) => ({ ...prev, slug: generateSlug(e.target.value) }))}
                    placeholder="e.g. bolt-anchor"
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#FF6B00] outline-none"
                    disabled={!!editingSubcategory}
                    required
                  />
                  {editingSubcategory && (
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Slug cannot be modified once created</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Tagline</label>
                <input
                  type="text"
                  value={subForm.tagline}
                  onChange={(e) => setSubForm((prev) => ({ ...prev, tagline: e.target.value }))}
                  placeholder="e.g. Heavy-duty expansion anchors for fast push-through installation"
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#FF6B00] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Description</label>
                <textarea
                  value={subForm.description}
                  onChange={(e) => setSubForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Engineering applications and technical specifications..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#FF6B00] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Image URL</label>
                <input
                  type="url"
                  value={subForm.imageUrl}
                  onChange={(e) => setSubForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#FF6B00] outline-none"
                />
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Presets:</span>
                  {IMAGE_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setSubForm((prev) => ({ ...prev, imageUrl: p.url }))}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="sub-featured"
                  checked={subForm.featured}
                  onChange={(e) => setSubForm((prev) => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#FF6B00] border-slate-300 focus:ring-[#FF6B00]"
                />
                <label htmlFor="sub-featured" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Feature this subcategory in navigation dropdowns and catalog highlights
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingSubcategory(false);
                    setEditingSubcategory(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white rounded-xl text-xs font-bold shadow transition-colors"
                >
                  {editingSubcategory ? 'Update Subcategory' : 'Create Subcategory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD VARIANT                                                      */}
      {/* ========================================================================= */}
      {isAddingVariant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-lg w-full p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <h3 className="text-base font-extrabold text-[#0F172A]">
                Add Technical Variant to {currentFamily?.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingVariant(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVariant} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Item No / SKU</label>
                  <input
                    type="text"
                    value={newVarItemNo}
                    onChange={(e) => setNewVarItemNo(e.target.value)}
                    placeholder="e.g. 563458"
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#0052CC] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Article Name</label>
                  <input
                    type="text"
                    value={newVarArtName}
                    onChange={(e) => setNewVarArtName(e.target.value)}
                    placeholder="FAZ II Plus 10/10 gvz"
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0052CC] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Drill d0 (mm)</label>
                  <input
                    type="number"
                    value={newVarDrillDia}
                    onChange={(e) => setNewVarDrillDia(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Depth hef (mm)</label>
                  <input
                    type="number"
                    value={newVarDepth}
                    onChange={(e) => setNewVarDepth(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Fixture tfix</label>
                  <input
                    type="number"
                    value={newVarFixture}
                    onChange={(e) => setNewVarFixture(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Thread Spec</label>
                  <input
                    type="text"
                    value={newVarThread}
                    onChange={(e) => setNewVarThread(e.target.value)}
                    placeholder="M10 x 20"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Material</label>
                  <select
                    value={newVarMaterial}
                    onChange={(e) => setNewVarMaterial(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold bg-[#F8FAFC] focus:ring-2 focus:ring-[#0052CC] outline-none"
                  >
                    <option value="gvz">Zinc-plated steel (gvz)</option>
                    <option value="A4">Stainless steel A4</option>
                    <option value="C">High corrosion resistant (C)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Unit Price (INR)</label>
                  <input
                    type="number"
                    value={newVarPrice}
                    onChange={(e) => setNewVarPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Pack Qty (Pcs)</label>
                  <input
                    type="number"
                    value={newVarPackQty}
                    onChange={(e) => setNewVarPackQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddingVariant(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold shadow"
                >
                  Save Variant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
