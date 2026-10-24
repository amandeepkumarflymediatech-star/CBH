'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  X
} from 'lucide-react';

export default function AdminCatalogSection() {
  const [activeCatalogTab, setActiveCatalogTab] = useState<'categories' | 'subcategories' | 'families' | 'variants'>('categories');
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [subcategories, setSubcategories] = useState<CatalogSubcategory[]>([]);
  const [families, setFamilies] = useState<CatalogProductFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFamilySlug, setSelectedFamilySlug] = useState<string>('bolt-anchor-faz-ii-plus');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Modal / form state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatTagline, setNewCatTagline] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

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

  // Category Actions
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatSlug) return;
    try {
      const res = await fetch('/api/catalog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName,
          slug: newCatSlug,
          tagline: newCatTagline,
          description: newCatDesc,
        }),
      });
      const data = await res.json();
      if (data.success) {
        notify(`Category "${newCatName}" created successfully!`);
        setIsAddingCategory(false);
        setNewCatName('');
        setNewCatSlug('');
        setNewCatTagline('');
        setNewCatDesc('');
        loadData();
      }
    } catch (err) {
      notify('Failed to create category.');
    }
  };

  const handleDeleteCategory = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete category "${slug}"?`)) return;
    try {
      const res = await fetch(`/api/catalog/categories?slug=${slug}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        notify('Category deleted.');
        loadData();
      }
    } catch (err) {
      notify('Failed to delete.');
    }
  };

  // Variant Actions
  const currentFamily = families.find((f) => f.slug === selectedFamilySlug) || families[0];

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

  const handleResetCatalog = async () => {
    if (!confirm('Reset entire catalog to Fischer India defaults? (Categories, subcategories, families, FAZ II Plus variants)')) {
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
        notify('Catalog reset to Fischer India defaults.');
        loadData();
      }
    } catch (err) {
      notify('Reset failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {statusMessage && (
        <div className="bg-[#121518] text-white px-4 py-3 rounded-xl border border-[#0052CC]/40 flex items-center gap-2 text-xs font-semibold shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Top Controls Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#D8DFE7] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#14181E]">Fischer Dynamic Catalog Manager</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[rgba(255,107,0,0.12)] text-[#FF6B00] text-[10px] font-bold uppercase tracking-wider">
              4-Level Architecture
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage Categories, Subcategories, Product Families, and Technical Variant Matrix tables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/products"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-[#F4F6F9] hover:bg-slate-200 text-[#14181E] border border-[#D8DFE7] text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#0052CC]" /> View Storefront
          </Link>
          <button
            onClick={handleResetCatalog}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Restore Fischer demo catalog"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Catalog
          </button>
        </div>
      </div>

      {/* Catalog Level Sub-Tabs */}
      <div className="flex border-b border-[#D8DFE7] bg-white rounded-xl px-4 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveCatalogTab('categories')}
          className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeCatalogTab === 'categories'
              ? 'border-[#0052CC] text-[#0052CC]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Level 1: Categories ({categories.length})
        </button>
        <button
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
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500">Root Categories</span>
            <button
              onClick={() => setIsAddingCategory(true)}
              className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          {isAddingCategory && (
            <form onSubmit={handleCreateCategory} className="bg-white p-6 rounded-2xl border border-[#D8DFE7] shadow-md space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-[#14181E]">Add New Product Category</h4>
                <button type="button" onClick={() => setIsAddingCategory(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Category Name</label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => {
                      setNewCatName(e.target.value);
                      if (!newCatSlug) {
                        setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }
                    }}
                    placeholder="e.g. Chemical fixings"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#0052CC] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    placeholder="e.g. chemical-fixings"
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#0052CC] outline-none"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Tagline</label>
                  <input
                    type="text"
                    value={newCatTagline}
                    onChange={(e) => setNewCatTagline(e.target.value)}
                    placeholder="Brief highlight claim"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Description</label>
                  <textarea
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Engineering description"
                    rows={2}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold shadow"
                >
                  Save Category
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-2xl border border-[#D8DFE7] shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F6F9] text-slate-600 uppercase text-[11px] border-b border-[#D8DFE7]">
                <tr>
                  <th className="py-3 px-4">Name & Slug</th>
                  <th className="py-3 px-4">Tagline</th>
                  <th className="py-3 px-3 text-center">Subcategories</th>
                  <th className="py-3 px-4 text-center">Storefront Link</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8DFE7]">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#14181E]">{c.name}</div>
                      <div className="font-mono text-[11px] text-[#0052CC]">/products/{c.slug}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{c.tagline}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-700">{c.subcategoriesCount || 4}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/products/${c.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[#0052CC] hover:underline font-semibold"
                      >
                        Preview <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteCategory(c.slug)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
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
          <div className="bg-white rounded-2xl border border-[#D8DFE7] shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F6F9] text-slate-600 uppercase text-[11px] border-b border-[#D8DFE7]">
                <tr>
                  <th className="py-3 px-4">Subcategory</th>
                  <th className="py-3 px-4">Parent Category</th>
                  <th className="py-3 px-4">Tagline</th>
                  <th className="py-3 px-4 text-center">Storefront Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8DFE7]">
                {subcategories.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#14181E]">{s.name}</div>
                      <div className="font-mono text-[11px] text-[#0052CC]">{s.slug}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{s.categorySlug}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-sm truncate">{s.tagline}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/products/${s.categorySlug}/${s.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[#0052CC] hover:underline font-semibold"
                      >
                        Preview <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
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
                      <h4 className="font-bold text-[#14181E] text-sm">{fam.name}</h4>
                      <div className="font-mono text-xs text-[#0052CC]">{fam.slug}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[rgba(255,107,0,0.1)] text-[#FF6B00] font-bold text-[10px]">
                      {fam.variants?.length || 0} Variants
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{fam.headline}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-[#EDF1F5] flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Category: {fam.categorySlug} / {fam.subcategorySlug}
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

          {/* Add Variant Form */}
          {isAddingVariant && (
            <form onSubmit={handleCreateVariant} className="bg-white p-6 rounded-2xl border border-[#D8DFE7] shadow-md space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-[#14181E]">Add Variant to {currentFamily?.name}</h4>
                <button type="button" onClick={() => setIsAddingVariant(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Article Name</label>
                  <input
                    type="text"
                    value={newVarArtName}
                    onChange={(e) => setNewVarArtName(e.target.value)}
                    placeholder="e.g. FAZ II Plus 12/30 gvz"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#0052CC] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Art / Item No.</label>
                  <input
                    type="text"
                    value={newVarItemNo}
                    onChange={(e) => setNewVarItemNo(e.target.value)}
                    placeholder="e.g. 563464"
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#0052CC] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Drill Dia d0 [mm]</label>
                  <input
                    type="number"
                    value={newVarDrillDia}
                    onChange={(e) => setNewVarDrillDia(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#0052CC] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Anchorage hef [mm]</label>
                  <input
                    type="number"
                    value={newVarDepth}
                    onChange={(e) => setNewVarDepth(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#0052CC] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Fixture tfix [mm]</label>
                  <input
                    type="number"
                    value={newVarFixture}
                    onChange={(e) => setNewVarFixture(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#0052CC] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Thread</label>
                  <input
                    type="text"
                    value={newVarThread}
                    onChange={(e) => setNewVarThread(e.target.value)}
                    placeholder="e.g. M12 x 25"
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#0052CC] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Unit Price [INR]</label>
                  <input
                    type="number"
                    value={newVarPrice}
                    onChange={(e) => setNewVarPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#0052CC] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Pack Quantity</label>
                  <input
                    type="number"
                    value={newVarPackQty}
                    onChange={(e) => setNewVarPackQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#0052CC] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingVariant(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold shadow"
                >
                  Save Technical Variant
                </button>
              </div>
            </form>
          )}

          {/* Variants Table */}
          <div className="bg-white rounded-2xl border border-[#D8DFE7] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121518] text-white uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Item No. / Article</th>
                    <th className="py-3 px-3 text-center">d0 [mm]</th>
                    <th className="py-3 px-3 text-center">hef [mm]</th>
                    <th className="py-3 px-3 text-center">tfix [mm]</th>
                    <th className="py-3 px-3 text-center">Thread</th>
                    <th className="py-3 px-3 text-center">Material</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-3 text-center">Pack Qty</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8DFE7]">
                  {currentFamily?.variants?.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#14181E]">{v.artName}</div>
                        <div className="font-mono text-[11px] text-[#0052CC]">Art. {v.itemNo}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">{v.drillHoleDiameterMm}</td>
                      <td className="py-3 px-3 text-center text-slate-600">{v.effectiveAnchorageDepthMm}</td>
                      <td className="py-3 px-3 text-center font-semibold text-[#0052CC]">{v.maxFixtureThicknessMm}</td>
                      <td className="py-3 px-3 text-center font-mono text-slate-700">{v.thread}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-[#F4F6F9] border border-[#D8DFE7] text-[10px] font-bold uppercase">
                          {v.materialCode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#0052CC]">
                        {formatINR(v.unitPriceInr)}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600">{v.packQty}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteVariant(v.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete variant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
