'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Building2,
  Plus,
  Phone,
  User,
  Truck,
  Trash2,
  X,
  CheckCircle2
} from 'lucide-react';

interface DeliverySite {
  id: string;
  name: string;
  address: string;
  incharge: string;
  phone: string;
  activeDeliveries: number;
}

const DEFAULT_SITES: DeliverySite[] = [
  { id: 'site-1', name: 'Delhi Metro Rail Project (DMRC Package 4)', address: 'Gate 2, Anand Vihar Depot, New Delhi - 110092', incharge: 'Vikram Joshi (Site Engineer)', phone: '+91 98112 45890', activeDeliveries: 2 },
  { id: 'site-2', name: 'Jamnagar Petrochem Expansion Unit', address: 'Plot 104, GIDC Estate Phase 3, Jamnagar, GJ - 361004', incharge: 'Karan Patel (Materials Manager)', phone: '+91 98250 88123', activeDeliveries: 1 },
  { id: 'site-3', name: 'Bengaluru Highway Elevated Corridor', address: 'NH-44 Flyover Works, Peenya, Bengaluru, KA - 560058', incharge: 'S. N. Rao (Project Head)', phone: '+91 98450 11994', activeDeliveries: 0 },
];

export default function CustomerSitesPage() {
  const [sites, setSites] = useState<DeliverySite[]>(DEFAULT_SITES);
  const [isNewSiteModalOpen, setIsNewSiteModalOpen] = useState(false);
  const [newSite, setNewSite] = useState({ name: '', address: '', incharge: '', phone: '' });

  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.name || !newSite.address) return;
    const added: DeliverySite = {
      id: `site-${Date.now()}`,
      name: newSite.name.trim(),
      address: newSite.address.trim(),
      incharge: newSite.incharge.trim() || 'Site In-Charge',
      phone: newSite.phone.trim() || '+91 98000 00000',
      activeDeliveries: 0,
    };
    setSites([added, ...sites]);
    setNewSite({ name: '', address: '', incharge: '', phone: '' });
    setIsNewSiteModalOpen(false);
  };

  const handleDeleteSite = (id: string) => {
    if (confirm('Are you sure you want to remove this project delivery location?')) {
      setSites(sites.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#FF6B00]" />
            <span>Infrastructure Project Delivery Sites</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered project consignee addresses for direct freight dispatches, transporter gate passes, and weighbridge destination tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewSiteModalOpen(true)}
          className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
        >
          <Plus size={14} />
          <span>+ Add Project Delivery Site</span>
        </button>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sites.map((site) => (
          <div key={site.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF6B00] flex items-center justify-center shrink-0">
                    <Building2 size={16} />
                  </div>
                  <h3 className="font-extrabold text-[#0F172A] text-sm leading-snug">{site.name}</h3>
                </div>
                {site.activeDeliveries > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0052CC] text-[10px] font-bold shrink-0">
                    {site.activeDeliveries} Active Truck
                  </span>
                ) : (
                  <span className="text-slate-400 text-[10px] shrink-0 font-medium">Idle</span>
                )}
              </div>

              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                {site.address}
              </p>

              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-slate-700">
                  <User size={13} className="text-slate-400" />
                  <span className="font-semibold">{site.incharge}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone size={13} className="text-slate-400" />
                  <span className="font-mono">{site.phone}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> Pre-Authorized for LR Delivery
              </span>
              <button
                type="button"
                onClick={() => handleDeleteSite(site.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                title="Remove site"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Site Modal */}
      {isNewSiteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <h3 className="font-extrabold text-[#0F172A] text-base">Add Project Consignee Location</h3>
              <button
                type="button"
                onClick={() => setIsNewSiteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSite} className="py-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai Coastal Road Highway Package 2"
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Full Site Delivery Address</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Exact unloading gate, yard, depot address with Pincode..."
                  value={newSite.address}
                  onChange={(e) => setNewSite({ ...newSite, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#0052CC] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Site In-Charge Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Anand Kulkarni"
                    value={newSite.incharge}
                    onChange={(e) => setNewSite({ ...newSite, incharge: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Mobile Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98000 00000"
                    value={newSite.phone}
                    onChange={(e) => setNewSite({ ...newSite, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#0052CC] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewSiteModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold shadow"
                >
                  Save Project Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
