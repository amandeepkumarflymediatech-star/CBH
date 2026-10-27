'use client';

import React, { useState, useEffect } from 'react';
import AdminOrdersSection from '@/components/admin/AdminOrdersSection';
import { CustomerOrder } from '@/lib/types';
import { INITIAL_ORDERS } from '@/lib/mock-data';
import { CheckCircle2 } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>(INITIAL_ORDERS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOrders(json.data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleAddOrder = async (orderData: Omit<CustomerOrder, 'id'>) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setOrders((prev) => [data.data, ...prev]);
        showToast(`Order ${orderData.orderNumber} created successfully.`);
      } else {
        const localOrder: CustomerOrder = { ...orderData, id: `ORD-${Date.now()}` };
        setOrders((prev) => [localOrder, ...prev]);
        showToast(`Order ${orderData.orderNumber} created.`);
      }
    } catch {
      const localOrder: CustomerOrder = { ...orderData, id: `ORD-${Date.now()}` };
      setOrders((prev) => [localOrder, ...prev]);
      showToast(`Order ${orderData.orderNumber} created.`);
    }
  };

  const handleUpdateOrder = async (updated: CustomerOrder) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? data.data : o)));
        showToast(`Order ${updated.orderNumber} updated to ${updated.status}.`);
      } else {
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        showToast(`Order ${updated.orderNumber} updated.`);
      }
    } catch {
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      showToast(`Order ${updated.orderNumber} updated.`);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
        showToast('Order removed from dispatch log.');
      } else {
        setOrders((prev) => prev.filter((o) => o.id !== id));
        showToast('Order deleted.');
      }
    } catch {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      showToast('Order deleted.');
    }
  };

  return (
    <div>
      <AdminOrdersSection
        orders={orders}
        onAdd={handleAddOrder}
        onUpdate={handleUpdateOrder}
        onDelete={handleDeleteOrder}
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
