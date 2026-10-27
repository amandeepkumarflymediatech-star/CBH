'use client';

import React, { useState, useEffect } from 'react';
import AdminErpNextSection from '@/components/admin/AdminErpNextSection';
import { Product } from '@/lib/types';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';
import { CheckCircle2 } from 'lucide-react';

export default function AdminErpNextPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
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

  return (
    <div>
      <AdminErpNextSection
        products={products}
        onProductsSync={(newProds) => {
          setProducts(newProds);
          showToast(`Catalog updated with ${newProds.length} items from ERPNext.`);
        }}
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
