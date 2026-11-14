'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import FastenerForm from '@/components/admin/FastenerForm';

export default function EditFastenerByPathPage() {
  const params = useParams();
  const id = params?.id ? Number(params.id) : undefined;

  return <FastenerForm mode="edit" productId={id} />;
}
