'use client';

export interface AuthUser {
  id: number | string;
  email: string;
  fullName: string;
  companyName: string;
  gstin?: string;
  phone?: string;
  role: 'customer' | 'admin';
  tier?: string;
  tierDiscountPct?: number;
  creditLimit?: number;
}

const STORAGE_KEY = 'cbh_auth_user';
const TOKEN_KEY = 'cbh_auth_token';

// Default mock users for instant one-click testing
export const DEMO_CLIENT: AuthUser = {
  id: 101,
  email: 'procurement@apexinfra.com',
  fullName: 'Rajesh Sharma (Head of Procurement)',
  companyName: 'Apex Heavy Infrastructure Ltd.',
  gstin: '29AABCA1234F1Z5',
  phone: '+91 98880 21000',
  role: 'customer',
  tier: 'DIAMOND',
  tierDiscountPct: 18,
  creditLimit: 2500000,
};

export const DEMO_ADMIN: AuthUser = {
  id: 1,
  email: 'admin@cbh.store',
  fullName: 'Harpreet Singh (Chief Operations)',
  companyName: 'CBH Fasteners Tech Pvt. Ltd.',
  gstin: '03AABCC1234F1Z0',
  phone: '+91 98880 21000',
  role: 'admin',
  tier: 'VIP',
  tierDiscountPct: 25,
};

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser | null, token?: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      if (token) localStorage.setItem(TOKEN_KEY, token);
      document.cookie = `cbh_role=${user.role}; path=/; max-age=604800; SameSite=Lax`;
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      document.cookie = `cbh_role=; path=/; max-age=0; SameSite=Lax`;
    }
    window.dispatchEvent(new Event('cbh_auth_change'));
  } catch (err) {
    console.error('Failed to persist auth user:', err);
  }
}

export function logout(): void {
  setStoredUser(null);
}

export function isCustomer(user: AuthUser | null): boolean {
  return user?.role === 'customer';
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'admin';
}
