'use client';

import React, { useState } from 'react';
import AdminProductsSection from '@/components/admin/AdminProductsSection';
import { CheckCircle2 } from 'lucide-react';

export default function AdminProductsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div>
      <AdminProductsSection showToast={showToast} />

      {toastMessage && (
        <div className="admin-toast">
          <CheckCircle2 size={16} color="#059669" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
