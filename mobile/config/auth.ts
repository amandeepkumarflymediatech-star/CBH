// ============================================================================
// CBH FASTENERS MOBILE APP - AUTHENTICATION & SESSION CONFIG
// ============================================================================

import { MobileAuthUser, UserRole } from '../types';

const MOBILE_AUTH_USER_KEY = 'cbh_mobile_auth_user';
const MOBILE_AUTH_TOKEN_KEY = 'cbh_mobile_auth_token';

// Demo Customer for instantaneous 1-tap testing on mobile
export const DEMO_MOBILE_CUSTOMER: MobileAuthUser = {
  id: 101,
  email: 'procurement@apexinfra.com',
  fullName: 'Rajesh Sharma',
  companyName: 'Apex Heavy Infrastructure Ltd.',
  gstin: '29AABCA1234F1Z5',
  phone: '+91 98880 21000',
  role: 'customer',
  tier: 'DIAMOND',
  tierDiscountPct: 18,
  creditLimit: 2500000,
  address: 'Plot 42, Peenya Industrial Area Phase II, Bengaluru, KA - 560058',
};

// Demo Admin Operator for instantaneous 1-tap testing on mobile
export const DEMO_MOBILE_ADMIN: MobileAuthUser = {
  id: 1,
  email: 'admin@cbh.store',
  fullName: 'Harpreet Singh (Chief Operations)',
  companyName: 'CBH Fasteners Tech Pvt. Ltd.',
  gstin: '03AABCC1234F1Z0',
  phone: '+91 98880 21000',
  role: 'admin',
  tier: 'VIP',
  tierDiscountPct: 25,
  creditLimit: 10000000,
};

let memoryUser: MobileAuthUser | null = null;
let memoryToken: string | null = null;

export function getMobileStoredUser(): MobileAuthUser | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(MOBILE_AUTH_USER_KEY);
      if (raw) return JSON.parse(raw) as MobileAuthUser;
    } catch {}
  }
  return memoryUser;
}

export function setMobileStoredUser(user: MobileAuthUser | null, token?: string): void {
  memoryUser = user;
  if (token) memoryToken = token;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (user) {
        localStorage.setItem(MOBILE_AUTH_USER_KEY, JSON.stringify(user));
        if (token) localStorage.setItem(MOBILE_AUTH_TOKEN_KEY, token);
        document.cookie = `cbh_mobile_role=${user.role}; path=/; max-age=604800; SameSite=Lax`;
      } else {
        localStorage.removeItem(MOBILE_AUTH_USER_KEY);
        localStorage.removeItem(MOBILE_AUTH_TOKEN_KEY);
        document.cookie = `cbh_mobile_role=; path=/; max-age=0; SameSite=Lax`;
      }
      window.dispatchEvent(new Event('cbh_mobile_auth_change'));
    } catch (err) {
      console.error('[Mobile Auth] Failed to persist user session:', err);
    }
  }
}

export function getMobileAuthToken(): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return localStorage.getItem(MOBILE_AUTH_TOKEN_KEY) || null;
    } catch {}
  }
  return memoryToken;
}

export function isMobileAdmin(user: MobileAuthUser | null): boolean {
  return user?.role === 'admin';
}

export function isMobileCustomer(user: MobileAuthUser | null): boolean {
  return user?.role === 'customer';
}

