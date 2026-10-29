'use client';

import React, { useState, useEffect } from 'react';
import AdminErpNextSection from '@/components/admin/AdminErpNextSection';
import { Product } from '@/lib/types';
import { CheckCircle2 } from 'lucide-react';

export default function AdminErpNextPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDeleteProduct = async (id: number) => {
    try {
      const target = products.find((p) => p.id === id);
      const skuParam = target?.sku ? `&sku=${encodeURIComponent(target.sku)}` : '';
      const res = await fetch(`/api/products?id=${id}${skuParam}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id && (!target?.sku || p.sku !== target.sku)));
        showToast(data.message || 'Item removed from database.');
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast('Item removed.');
      }
    } catch {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('Item removed.');
    }
  };

  const handleBulkDeleteProducts = async (ids: number[]) => {
    if (!ids || ids.length === 0) return;
    try {
      const isAll = ids.length >= products.length;
      const targetSkus = products.filter((p) => ids.includes(p.id)).map((p) => p.sku);
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isAll ? { all: true } : { ids, skus: targetSkus }),
      });
      const data = await res.json();
      if (isAll) {
        setProducts([]);
      } else {
        const idSet = new Set(ids);
        const skuSet = new Set(targetSkus);
        setProducts((prev) => prev.filter((p) => !idSet.has(p.id) && !skuSet.has(p.sku)));
      }
      showToast(data.message || `Deleted ${ids.length} items successfully.`);
    } catch {
      const isAll = ids.length >= products.length;
      if (isAll) {
        setProducts([]);
      } else {
        const idSet = new Set(ids);
        setProducts((prev) => prev.filter((p) => !idSet.has(p.id)));
      }
      showToast(`Removed ${ids.length} items.`);
    }
  };

  return (
    <div>
      <AdminErpNextSection
        products={products}
        onProductsSync={(newProds) => {
          setProducts(newProds);
          showToast(`Catalog updated with ${newProds.length} items from ERPNext.`);
        }}
        onDeleteProduct={handleDeleteProduct}
        onBulkDeleteProducts={handleBulkDeleteProducts}
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
