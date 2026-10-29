'use client';

import React, { useState, useEffect } from 'react';
import AdminProductsSection from '@/components/admin/AdminProductsSection';
import { Product } from '@/lib/types';
import { CheckCircle2 } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProducts((prev) => [data.data, ...prev]);
        showToast(`SKU "${productData.sku}" registered in central inventory.`);
      } else {
        const localProduct: Product = { ...productData, id: Date.now() };
        setProducts((prev) => [localProduct, ...prev]);
        showToast(`SKU "${productData.sku}" added locally.`);
      }
    } catch {
      const localProduct: Product = { ...productData, id: Date.now() };
      setProducts((prev) => [localProduct, ...prev]);
      showToast(`SKU "${productData.sku}" added.`);
    }
  };

  const handleUpdateProduct = async (updated: Product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? data.data : p)));
        showToast(`SKU "${updated.sku}" updated successfully.`);
      } else {
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showToast(`SKU "${updated.sku}" updated.`);
      }
    } catch {
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      showToast(`SKU "${updated.sku}" updated.`);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const target = products.find((p) => p.id === id);
      const skuParam = target?.sku ? `&sku=${encodeURIComponent(target.sku)}` : '';
      const res = await fetch(`/api/products?id=${id}${skuParam}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id && (!target?.sku || p.sku !== target.sku)));
        showToast(data.message || 'Product deleted from database.');
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast('SKU removed from active inventory.');
      }
    } catch {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('SKU removed from active inventory.');
    }
  };

  const handleBulkDeleteProducts = async (ids: number[]) => {
    if (!ids || ids.length === 0) return;
    try {
      const isDeletingAll = ids.length >= products.length;
      const targetSkus = products.filter((p) => ids.includes(p.id)).map((p) => p.sku);
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isDeletingAll ? { all: true } : { ids, skus: targetSkus }),
      });
      const data = await res.json();
      if (isDeletingAll) {
        setProducts([]);
      } else {
        const idSet = new Set(ids);
        const skuSet = new Set(targetSkus);
        setProducts((prev) => prev.filter((p) => !idSet.has(p.id) && !skuSet.has(p.sku)));
      }
      showToast(data.message || `Deleted ${ids.length} products successfully.`);
    } catch {
      const isDeletingAll = ids.length >= products.length;
      if (isDeletingAll) {
        setProducts([]);
      } else {
        const idSet = new Set(ids);
        setProducts((prev) => prev.filter((p) => !idSet.has(p.id)));
      }
      showToast(`Removed ${ids.length} products from active inventory.`);
    }
  };

  const handleRestoreDefaults = async () => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_defaults' }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
        showToast(`Demo catalog restored (${data.data.length} SKUs).`);
      } else {
        showToast('Failed to restore demo catalog.');
      }
    } catch {
      showToast('Error restoring demo catalog.');
    }
  };

  const handleToggleSurplus = async (id: number) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const updated = { ...target, isSurplus: !target.isSurplus };
    await handleUpdateProduct(updated);
  };

  return (
    <div>
      <AdminProductsSection
        products={products}
        onAdd={handleAddProduct}
        onUpdate={handleUpdateProduct}
        onDelete={handleDeleteProduct}
        onBulkDelete={handleBulkDeleteProducts}
        onRestoreDefaults={handleRestoreDefaults}
        onToggleSurplus={handleToggleSurplus}
        showToast={showToast}
        onRefreshProducts={loadProducts}
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
