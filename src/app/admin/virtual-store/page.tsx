'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Box,
  Sparkles,
  ExternalLink,
  Edit,
  Save,
  RotateCcw,
  CheckCircle2,
  X,
  Search,
  Plus,
  Eye,
  Sliders,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { VirtualStoreZone } from '@/lib/virtual-store-types';

export default function AdminVirtualStorePage() {
  const [zones, setZones] = useState<VirtualStoreZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [editingZone, setEditingZone] = useState<VirtualStoreZone | null>(null);

  // SKU Search modal state for picking real products
  const [isSkuPickerOpen, setIsSkuPickerOpen] = useState(false);
  const [skuSearchQuery, setSkuSearchQuery] = useState('');
  const [skuSearchResults, setSkuSearchResults] = useState<any[]>([]);
  const [searchingSku, setSearchingSku] = useState(false);

  const notify = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const loadZones = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/virtual-store');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setZones(data.data);
      }
    } catch (err: any) {
      notify('Failed to load virtual store zones: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  // Search products when SKU picker is active
  useEffect(() => {
    if (!isSkuPickerOpen || !skuSearchQuery.trim()) {
      setSkuSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setSearchingSku(true);
        const res = await fetch(`/api/products?search=${encodeURIComponent(skuSearchQuery)}&limit=12`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setSkuSearchResults(data.data);
        }
      } catch {
        setSkuSearchResults([]);
      } finally {
        setSearchingSku(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [skuSearchQuery, isSkuPickerOpen]);

  const handleSelectProductForZone = (product: any) => {
    if (!editingZone) return;

    setEditingZone({
      ...editingZone,
      featuredSku: product.sku,
      featuredProduct: {
        sku: product.sku,
        name: product.name,
        standard: product.standard || product.din || 'DIN 933',
        grade: product.grade || '8.8',
        price: parseFloat(product.pricePerPiece || product.price_per_piece) || 10,
        weightKg: parseFloat(product.weightPerPcKg || product.weight_per_pc_kg) || 0.05,
        stock: `${(product.stockPcs || product.stock_pcs || 10000).toLocaleString()} pcs in stock`,
        leadTime: 'Dispatch in 24-48 Hours',
        details: product.description || `${product.name} - premium industrial specification.`,
        approvals: [product.standard, product.grade, 'BIS Certified'].filter(Boolean),
        imageUrl: product.imageUrl || product.image_url || '/assets/bolt_zinc.jpg',
      },
    });

    setIsSkuPickerOpen(false);
    setSkuSearchQuery('');
    notify(`Assigned SKU: ${product.sku} to ${editingZone.name}`);
  };

  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone) return;

    try {
      const res = await fetch('/api/virtual-store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingZone),
      });
      const data = await res.json();
      if (data.success) {
        notify(`Zone "${editingZone.name}" updated successfully!`);
        setEditingZone(null);
        loadZones();
      } else {
        notify(data.error || 'Failed to update zone.');
      }
    } catch (err: any) {
      notify('Failed to save: ' + err.message);
    }
  };

  const handleToggleZoneActive = async (zone: VirtualStoreZone) => {
    const nextState = !zone.isActive;
    try {
      const res = await fetch('/api/virtual-store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: zone.id, isActive: nextState }),
      });
      const data = await res.json();
      if (data.success) {
        notify(`"${zone.name}" is now ${nextState ? 'Active' : 'Disabled'}.`);
        loadZones();
      }
    } catch (err: any) {
      notify('Toggle failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-[#FF6B00]" />
          <span className="text-xs font-bold">{statusMessage}</span>
        </div>
      )}

      {/* Header Deck */}
      <div className="bg-white rounded-2xl p-6 border border-[#D8DFE7] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
              <Box className="w-5 h-5 text-[#0052CC]" />
              <span>3D Virtual Depot Manager</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0052CC] text-[10px] font-bold uppercase tracking-wider border border-blue-200">
              Interactive 3D Digital Twin
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
              {zones.filter((z) => z.isActive).length} Active Zones
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-3xl">
            Configure the 3D warehouse zones, spotlighted products, categories, and technical specs displayed on{' '}
            <code className="text-[#0052CC] font-mono">/virtual-store</code>. Link products directly to live SKUs from your 54,000+ catalog.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/virtual-store"
            target="_blank"
            className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Eye size={14} />
            <span>Launch Live 3D Store</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className={`bg-white rounded-2xl border ${
              zone.isActive ? 'border-slate-200/90 shadow-sm' : 'border-slate-200 opacity-60'
            } p-5 flex flex-col justify-between transition-all hover:shadow-md`}
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-[#0052CC] border border-blue-200">
                      Zone #{zone.sortOrder} • {zone.aisleCode || 'AISLE'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-50 text-[#FF6B00] border border-orange-200">
                      {zone.category}
                    </span>
                    {zone.skuCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {zone.skuCount.toLocaleString()} SKUs
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">{zone.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{zone.subtitle}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleZoneActive(zone)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer border ${
                      zone.isActive
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {zone.isActive ? 'Active' : 'Disabled'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingZone(zone)}
                    className="p-1.5 text-slate-600 hover:text-[#0052CC] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Zone Details"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              </div>

              {/* Spotlighted Product Preview */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 overflow-hidden relative shrink-0">
                    <Image
                      src={zone.featuredProduct?.imageUrl || '/assets/bolt_zinc.jpg'}
                      alt={zone.featuredProduct?.name || 'Product'}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-mono text-xs font-bold text-[#0052CC] truncate">
                        {zone.featuredProduct?.sku || 'NO SKU ASSIGNED'}
                      </span>
                      {zone.featuredProduct?.price > 0 && (
                        <span className="font-bold text-xs text-slate-900">
                          ₹{zone.featuredProduct.price.toFixed(2)}/pc
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 line-clamp-1">
                      {zone.featuredProduct?.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 font-semibold flex-wrap">
                      <span>Std: {zone.featuredProduct?.standard || 'DIN'}</span>
                      <span>•</span>
                      <span>Grade: {zone.featuredProduct?.grade || '8.8'}</span>
                      <span>•</span>
                      <span className="text-emerald-700">{zone.featuredProduct?.stock || 'In Stock'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-[11px] text-slate-400 font-mono">
                Cam: [{zone.camPos.join(', ')}]
              </span>
              <button
                type="button"
                onClick={() => setEditingZone(zone)}
                className="text-xs font-bold text-[#0052CC] hover:text-[#0747A6] flex items-center gap-1 cursor-pointer"
              >
                <span>Customize Zone &amp; SKU</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================== */}
      {/* EDIT ZONE MODAL                                                */}
      {/* ============================================================== */}
      {editingZone && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl border border-slate-300 max-w-2xl w-full p-4 sm:p-6 shadow-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-[#0052CC]" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Configure {editingZone.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingZone(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveZone} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Zone Display Name
                  </label>
                  <input
                    type="text"
                    value={editingZone.name}
                    onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#0052CC] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Aisle Code
                  </label>
                  <input
                    type="text"
                    value={editingZone.aisleCode || ''}
                    onChange={(e) => setEditingZone({ ...editingZone, aisleCode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-[#0052CC] outline-none"
                    placeholder="AISLE 1-A"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Catalog Category (For Bay Browser)
                  </label>
                  <select
                    value={editingZone.category}
                    onChange={(e) => setEditingZone({ ...editingZone, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0052CC] outline-none bg-white cursor-pointer"
                  >
                    <option value="HEX BOLTS">Hex Bolts</option>
                    <option value="HEX SCREWS">Hex Screws</option>
                    <option value="SOCKET HEAD">Socket Head Allen</option>
                    <option value="HSFG BOLTS">HSFG Structural Bolts</option>
                    <option value="CARRIAGE BOLTS">Carriage Bolts</option>
                    <option value="HEX FLANGE BOLTS">Hex Flange Bolts</option>
                    <option value="THREADED RODS">Threaded Rods &amp; Studs</option>
                    <option value="SURPLUS">Surplus Fasteners (-60%)</option>
                    <option value="NUTS">Hex Nuts</option>
                    <option value="WASHERS">Industrial Washers</option>
                    <option value="ROOFING BOLTS">Roofing Bolts</option>
                    <option value="ANTI THEFT BOLTS">Anti-Theft Security Bolts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Zone Subtitle &amp; Technical Scope
                </label>
                <input
                  type="text"
                  value={editingZone.subtitle}
                  onChange={(e) => setEditingZone({ ...editingZone, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#0052CC] outline-none"
                  required
                />
              </div>

              {/* Spotlighted Product Section with Live SKU Picker */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                      Spotlighted Fastener SKU
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Product showcased when visitors click this zone in the 3D depot
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSkuSearchQuery(editingZone.category || 'M16');
                      setIsSkuPickerOpen(true);
                    }}
                    className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Search size={12} />
                    <span>Pick from Catalog</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Product SKU</label>
                    <input
                      type="text"
                      value={editingZone.featuredProduct?.sku || ''}
                      onChange={(e) =>
                        setEditingZone({
                          ...editingZone,
                          featuredSku: e.target.value,
                          featuredProduct: { ...editingZone.featuredProduct, sku: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Estimated Unit Rate (₹/pc)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingZone.featuredProduct?.price || 0}
                      onChange={(e) =>
                        setEditingZone({
                          ...editingZone,
                          featuredProduct: {
                            ...editingZone.featuredProduct,
                            price: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Article Name</label>
                    <input
                      type="text"
                      value={editingZone.featuredProduct?.name || ''}
                      onChange={(e) =>
                        setEditingZone({
                          ...editingZone,
                          featuredProduct: { ...editingZone.featuredProduct, name: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Stock Indicator Text</label>
                    <input
                      type="text"
                      value={editingZone.featuredProduct?.stock || ''}
                      onChange={(e) =>
                        setEditingZone({
                          ...editingZone,
                          featuredProduct: { ...editingZone.featuredProduct, stock: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Fastener Technical Details</label>
                  <textarea
                    rows={2}
                    value={editingZone.featuredProduct?.details || ''}
                    onChange={(e) =>
                      setEditingZone({
                        ...editingZone,
                        featuredProduct: { ...editingZone.featuredProduct, details: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Active Toggle & Sort */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={editingZone.isActive}
                    onChange={(e) => setEditingZone({ ...editingZone, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0052CC]"
                  />
                  <span>Show this zone in 3D depot navigation</span>
                </label>

                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <span>Sort:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editingZone.sortOrder}
                    onChange={(e) => setEditingZone({ ...editingZone, sortOrder: parseInt(e.target.value) || 1 })}
                    className="w-14 px-2 py-1 border rounded-lg text-center"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingZone(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save size={14} />
                  <span>Save Zone Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SKU SEARCH & PICKER MODAL                                      */}
      {/* ============================================================== */}
      {isSkuPickerOpen && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-xl w-full p-5 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-[#0052CC]" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Select Product from 54,000+ Fastener Database
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSkuPickerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by SKU, M10, DIN 933, Hex Bolt, Grade 10.9..."
                  value={skuSearchQuery}
                  onChange={(e) => setSkuSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0052CC] outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-[260px]">
              {searchingSku ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Searching catalog...
                </div>
              ) : skuSearchResults.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  {skuSearchQuery ? 'No products match your search' : 'Type to search products...'}
                </div>
              ) : (
                skuSearchResults.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectProductForZone(prod)}
                    className="p-3 hover:bg-blue-50/70 cursor-pointer transition-colors flex items-center justify-between gap-3 group rounded-lg"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs font-black text-[#0052CC] group-hover:underline">
                          {prod.sku}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                          {prod.standard || 'DIN'}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800">
                          {prod.grade || '8.8'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 font-bold truncate">{prod.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {prod.diameter} • {prod.lengthMm}mm • {prod.finish}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-black text-sm text-slate-900">
                        ₹{(parseFloat(prod.pricePerPiece || prod.price_per_piece) || 0).toFixed(2)}
                      </div>
                      <button
                        type="button"
                        className="mt-1 px-2.5 py-1 bg-[#0052CC] text-white text-[10px] font-bold rounded-md group-hover:bg-[#0747A6]"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
