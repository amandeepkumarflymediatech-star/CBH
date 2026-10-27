'use client';

import React, { useState, useEffect } from 'react';
import AdminSurplusSection from '@/components/admin/AdminSurplusSection';
import { SurplusLot } from '@/lib/types';
import { INITIAL_SURPLUS_LOTS } from '@/lib/mock-data';
import { CheckCircle2 } from 'lucide-react';

export default function AdminSurplusPage() {
  const [lots, setLots] = useState<SurplusLot[]>(INITIAL_SURPLUS_LOTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadSurplus = async () => {
    try {
      const res = await fetch('/api/surplus');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setLots(json.data);
      }
    } catch (err) {
      console.error('Failed to load surplus lots:', err);
    }
  };

  useEffect(() => {
    loadSurplus();
  }, []);

  const handleAddSurplusLot = async (lotData: Omit<SurplusLot, 'id'>) => {
    try {
      const res = await fetch('/api/surplus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lotData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setLots((prev) => [data.data, ...prev]);
        showToast(`Surplus Lot ${lotData.sku} listed.`);
      } else {
        const localLot: SurplusLot = { ...lotData, id: Date.now() };
        setLots((prev) => [localLot, ...prev]);
        showToast(`Surplus Lot ${lotData.sku} added.`);
      }
    } catch {
      const localLot: SurplusLot = { ...lotData, id: Date.now() };
      setLots((prev) => [localLot, ...prev]);
      showToast(`Surplus Lot ${lotData.sku} added.`);
    }
  };

  const handleUpdateSurplusLot = async (updated: SurplusLot) => {
    try {
      const res = await fetch('/api/surplus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setLots((prev) => prev.map((l) => (l.id === updated.id ? data.data : l)));
        showToast(`Lot ${updated.sku} updated.`);
      } else {
        setLots((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
        showToast(`Lot ${updated.sku} updated.`);
      }
    } catch {
      setLots((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      showToast(`Lot ${updated.sku} updated.`);
    }
  };

  const handleDeleteSurplusLot = async (id: number) => {
    try {
      const res = await fetch(`/api/surplus?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setLots((prev) => prev.filter((l) => l.id !== id));
        showToast('Lot removed.');
      } else {
        setLots((prev) => prev.filter((l) => l.id !== id));
        showToast('Lot removed.');
      }
    } catch {
      setLots((prev) => prev.filter((l) => l.id !== id));
      showToast('Lot removed.');
    }
  };

  const handleToggleSurplusActive = async (lot: SurplusLot) => {
    await handleUpdateSurplusLot({ ...lot, isActive: !lot.isActive });
  };

  return (
    <div>
      <AdminSurplusSection
        lots={lots}
        onAdd={handleAddSurplusLot}
        onUpdate={handleUpdateSurplusLot}
        onDelete={handleDeleteSurplusLot}
        onToggleActive={handleToggleSurplusActive}
        showToast={showToast}
      />

      {toastMessage && (
        <div className="admin-toast">
          <CheckCircle2 size={16} color="#059669" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
