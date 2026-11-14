'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Building2,
  Plus,
  Phone,
  User,
  Truck,
  Trash2,
  X,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { getStoredUser, setStoredUser, AuthUser } from '@/lib/auth';
import { DeliverySite } from '@/lib/types';
import { showToast } from '@/lib/swal';

export default function CustomerSitesPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [sites, setSites] = useState<DeliverySite[]>([]);
  const [isNewSiteModalOpen, setIsNewSiteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newSite, setNewSite] = useState({ name: '', address: '', incharge: '', phone: '' });

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);
    if (user?.deliverySites && Array.isArray(user.deliverySites)) {
      setSites(user.deliverySites);
    }

    // Live refresh from API
    if (user?.id) {
      fetch(`/api/users?search=${encodeURIComponent(user.email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.users && data.users.length > 0) {
            const matched = data.users.find((u: any) => u.id === Number(user.id) || u.email === user.email);
            if (matched && Array.isArray(matched.deliverySites)) {
              setSites(matched.deliverySites);
              const updated = { ...user, deliverySites: matched.deliverySites };
              setStoredUser(updated);
              setCurrentUser(updated);
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  const persistSites = async (updatedSites: DeliverySite[]) => {
    setSites(updatedSites);
    const user = getStoredUser() || currentUser;
    if (user) {
      const updatedUser: AuthUser = { ...user, deliverySites: updatedSites };
      setStoredUser(updatedUser);
      setCurrentUser(updatedUser);

      if (user.id) {
        setIsSaving(true);
        try {
          await fetch('/api/users', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: user.id,
              deliverySites: updatedSites,
            }),
          });
        } catch (err) {
          console.warn('Background sync failed:', err);
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.name.trim() || !newSite.address.trim()) return;

    const added: DeliverySite = {
      id: `site-${Date.now()}`,
      name: newSite.name.trim(),
      address: newSite.address.trim(),
      incharge: newSite.incharge.trim() || (currentUser?.fullName || 'Site In-Charge'),
      phone: newSite.phone.trim() || (currentUser?.phone || '+91 98880 21000'),
      activeDeliveries: 0,
      isPrimary: sites.length === 0,
    };

    const updated = [added, ...sites];
    await persistSites(updated);
    setNewSite({ name: '', address: '', incharge: '', phone: '' });
    setIsNewSiteModalOpen(false);
    showToast(`Added delivery site "${added.name}"!`, 'success');
  };

  const handleDeleteSite = async (id: string) => {
    if (confirm('Are you sure you want to remove this project delivery location?')) {
      const updated = sites.filter((s) => s.id !== id);
      await persistSites(updated);
      showToast('Delivery location removed.', 'info');
    }
  };

  return (
    <div className="space-y-4">
      {/* Sleek Single-Viewport Top Ops Bar */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF6B00] flex items-center justify-center shrink-0 border border-orange-200">
            <MapPin size={18} />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-[#0F172A] leading-tight flex items-center gap-2">
              <span>Project Delivery Sites &amp; Yards</span>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {sites.length} {sites.length === 1 ? 'Site' : 'Sites'}
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Authorized unloading destinations for freight dispatches &amp; weighbridge tracking
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsNewSiteModalOpen(true)}
          className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
        >
          <Plus size={14} />
          <span>Add Delivery Site</span>
        </button>
      </div>

      {/* Sites Grid */}
      {sites.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center shadow-xs">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-xs font-bold text-[#0F172A]">No Delivery Sites Registered</h3>
          <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
            Register your project godowns or weighbridge yards for pre-authorized dispatches.
          </p>
          <button
            type="button"
            onClick={() => setIsNewSiteModalOpen(true)}
            className="mt-3 px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-lg shadow-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus size={13} />
            <span>Register First Yard</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sites.map((site) => (
            <div
              key={site.id}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF6B00] flex items-center justify-center shrink-0">
                      <Building2 size={14} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-[#0F172A] text-xs leading-snug truncate" title={site.name}>
                        {site.name}
                      </h3>
                      {site.isPrimary && (
                        <span className="text-[9px] font-extrabold text-[#5B4DF6] bg-[#EEF0FD] px-1.5 py-0.2 rounded uppercase">
                          Primary Depot
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {(site.activeDeliveries || 0) > 0 ? (
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#0052CC] text-[10px] font-bold">
                        {site.activeDeliveries} Truck
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px] font-medium">Idle</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteSite(site.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer rounded hover:bg-slate-100"
                      title="Remove site"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 mb-2.5 line-clamp-2 leading-relaxed">
                  {site.address}
                </p>

                <div className="bg-[#F8FAFC] px-2.5 py-2 rounded-lg border border-slate-100 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <User size={12} className="text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{site.incharge || 'Site In-Charge'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Phone size={12} className="text-slate-400 shrink-0" />
                    <span className="font-mono text-[10px] truncate">{site.phone || '+91 Contact on File'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-emerald-500" /> Pre-Authorized
                </span>
                <span className="text-slate-400 font-mono">HSN Gate Pass</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Site Modal */}
      {isNewSiteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-md w-full p-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-black text-[#0F172A] text-sm sm:text-base leading-tight">
                Add Project Delivery Yard
              </h3>
              <button
                type="button"
                onClick={() => setIsNewSiteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSite} className="py-3 space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                  Project / Yard Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar Park Phase IV Depot, Bhadla"
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-[#0052CC] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                  Full Dispatch Delivery Address *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Complete road address, plot number, nearest landmark, and pin code..."
                  value={newSite.address}
                  onChange={(e) => setNewSite({ ...newSite, address: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-[#0052CC] focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                    Site In-Charge
                  </label>
                  <input
                    type="text"
                    placeholder="Contact name"
                    value={newSite.incharge}
                    onChange={(e) => setNewSite({ ...newSite, incharge: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-[#0052CC] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                    Gate Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98000 00000"
                    value={newSite.phone}
                    onChange={(e) => setNewSite({ ...newSite, phone: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-[#0052CC] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewSiteModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                  <span>Save Yard</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
