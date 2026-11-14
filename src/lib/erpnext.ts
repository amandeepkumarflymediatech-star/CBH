/**
 * ERPNext Integration Stub (Disabled)
 * All ERPNext and Frappe sync workflows have been detached from the website.
 * Orders, catalog, and RFQs operate directly via MySQL and local catalog storage.
 */

export interface ErpNextConfig {
  erpnextUrl: string;
  apiKey: string;
  apiSecret: string;
  company: string;
  defaultPriceList: string;
  defaultWarehouse: string;
  autoSync: boolean;
  lastSyncTime: string | null;
  lastSyncStatus: 'CONNECTED' | 'STANDBY' | 'ERROR' | 'DISABLED';
  lastError: string | null;
  syncedItemsCount: number;
}

export function getErpNextConfig(): ErpNextConfig {
  return {
    erpnextUrl: '',
    apiKey: '',
    apiSecret: '',
    company: 'CBC Technologies Private Limited',
    defaultPriceList: 'Standard Selling',
    defaultWarehouse: 'Stores - CTPL',
    autoSync: false,
    lastSyncTime: null,
    lastSyncStatus: 'DISABLED',
    lastError: null,
    syncedItemsCount: 0,
  };
}

export function saveErpNextConfig(updates: Partial<ErpNextConfig>): ErpNextConfig {
  return { ...getErpNextConfig(), ...updates };
}

export async function testErpNextConnection(): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'ERPNext integration is disabled' };
}

export async function fetchErpNextProducts(): Promise<{ success: boolean; products: any[]; count: number }> {
  return { success: true, products: [], count: 0 };
}

export async function ensureCustomerInErpNext(): Promise<string> {
  return 'LOCAL-CUSTOMER';
}

export async function ensureItemInErpNext(): Promise<string> {
  return 'LOCAL-ITEM';
}

export async function pushSalesOrderToErpNext(): Promise<{ success: boolean }> {
  return { success: true };
}

export async function pushRfqToErpNext(): Promise<{ success: boolean }> {
  return { success: true };
}

export async function convertRfqToSalesOrder(): Promise<{ success: boolean }> {
  return { success: true };
}
