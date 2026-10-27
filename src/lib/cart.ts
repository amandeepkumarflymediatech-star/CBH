'use client';

import { RfqLineItem } from './types';

const CART_STORAGE_KEY = 'cbh_cart_items';

export function getStoredCart(): RfqLineItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setStoredCart(items: RfqLineItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    if (items && items.length > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent('cbh_cart_change', { detail: { items } }));
  } catch (err) {
    console.error('Failed to persist cart items:', err);
  }
}
