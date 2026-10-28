import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface PhonePeConfig {
  merchantId: string;
  saltKey: string;
  saltIndex: string;
  environment: 'SANDBOX' | 'PRODUCTION';
  enableSimulator: boolean;
  defaultCallbackUrl: string;
  defaultRedirectUrl: string;
  autoConfirmOrders: boolean;
}

export interface PhonePePaymentRequest {
  merchantTransactionId: string;
  merchantUserId: string;
  amount: number; // in INR (will be converted to paise internally)
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  redirectUrl: string;
  callbackUrl?: string;
  notes?: Record<string, string>;
  companyName?: string;
  shippingAddress?: string;
  items?: Array<{ sku: string; name: string; quantity: number; rate: number; weightKg?: number }>;
}

export interface PhonePeTransactionRecord {
  transactionId: string;
  orderNumber: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'USER_CANCELLED';
  paymentMode?: string; // UPI, CARD, NETBANKING
  phonepeReferenceId?: string;
  createdAt: string;
  updatedAt: string;
  responseMessage?: string;
  companyName?: string;
  shippingAddress?: string;
  items?: Array<{ sku: string; name: string; quantity: number; rate: number; weightKg?: number }>;
  erpnextSalesOrderId?: string;
}

const CONFIG_FILE = path.join(process.cwd(), 'src', 'data', 'phonepe-config.json');
const TXNS_FILE = path.join(process.cwd(), 'src', 'data', 'phonepe-transactions.json');

let memoryConfig: PhonePeConfig | null = null;
let memoryTxns: PhonePeTransactionRecord[] | null = null;

// Default configuration
function resolveSaltKey(rawKey: string): string {
  const trimmed = (rawKey || '').trim();
  // If user pasted base64-encoded UUID (44 characters base64), decode it
  if (/^[A-Za-z0-9+/=]{44}$/.test(trimmed)) {
    try {
      const decoded = Buffer.from(trimmed, 'base64').toString('utf-8');
      if (/^[0-9a-fA-F-]{36}$/.test(decoded)) {
        return decoded;
      }
    } catch {
      // keep trimmed
    }
  }
  return trimmed;
}

// Default configuration
const rawEnv = (process.env.PHONEPE_ENV || 'SANDBOX').toUpperCase();
const DEFAULT_CONFIG: PhonePeConfig = {
  merchantId: process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT',
  saltKey: resolveSaltKey(process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399'),
  saltIndex: process.env.PHONEPE_SALT_INDEX || '1',
  environment: rawEnv === 'PRODUCTION' ? 'PRODUCTION' : 'SANDBOX',
  enableSimulator: process.env.PHONEPE_ENABLE_SIMULATOR === 'true',
  defaultCallbackUrl: process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/phonepe/callback`
    : 'https://cbh.store/api/payment/phonepe/callback',
  defaultRedirectUrl: process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/phonepe/redirect`
    : 'http://localhost:3000/api/payment/phonepe/redirect',
  autoConfirmOrders: true,
};

export function getPhonePeConfig(): PhonePeConfig {
  if (memoryConfig) return memoryConfig;

  let fileConfig: Partial<PhonePeConfig> = {};
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      fileConfig = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[PhonePe] Failed to read phonepe-config.json:', err);
  }

  // Environment variables take precedence if explicitly defined
  const envOverrides: Partial<PhonePeConfig> = {};
  if (process.env.PHONEPE_MERCHANT_ID) envOverrides.merchantId = process.env.PHONEPE_MERCHANT_ID.trim();
  if (process.env.PHONEPE_SALT_KEY) envOverrides.saltKey = resolveSaltKey(process.env.PHONEPE_SALT_KEY);
  if (process.env.PHONEPE_SALT_INDEX) envOverrides.saltIndex = process.env.PHONEPE_SALT_INDEX.trim();
  if (process.env.PHONEPE_ENV) {
    envOverrides.environment = process.env.PHONEPE_ENV.trim().toUpperCase() === 'PRODUCTION' ? 'PRODUCTION' : 'SANDBOX';
  }
  if (process.env.PHONEPE_ENABLE_SIMULATOR !== undefined) {
    envOverrides.enableSimulator = process.env.PHONEPE_ENABLE_SIMULATOR === 'true';
  }

  memoryConfig = {
    ...DEFAULT_CONFIG,
    ...fileConfig,
    ...envOverrides,
  };
  return memoryConfig;
}

export function savePhonePeConfig(updates: Partial<PhonePeConfig>): PhonePeConfig {
  const current = getPhonePeConfig();
  const merged: PhonePeConfig = { ...current, ...updates };
  memoryConfig = merged;

  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (err) {
    console.error('[PhonePe] Failed saving phonepe-config.json:', err);
  }

  return merged;
}

// Transaction history store
export function getPhonePeTransactions(): PhonePeTransactionRecord[] {
  if (memoryTxns) return memoryTxns;

  try {
    if (fs.existsSync(TXNS_FILE)) {
      const raw = fs.readFileSync(TXNS_FILE, 'utf-8');
      memoryTxns = JSON.parse(raw);
      return memoryTxns!;
    }
  } catch {
    // ignore
  }

  memoryTxns = [];
  return memoryTxns;
}

export function savePhonePeTransaction(txn: PhonePeTransactionRecord): void {
  const txns = getPhonePeTransactions();
  const idx = txns.findIndex((t) => t.transactionId === txn.transactionId);

  if (idx >= 0) {
    txns[idx] = { ...txns[idx], ...txn, updatedAt: new Date().toISOString() };
  } else {
    txns.unshift({ ...txn, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }

  memoryTxns = txns;
  try {
    const dir = path.dirname(TXNS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(TXNS_FILE, JSON.stringify(txns, null, 2), 'utf-8');
  } catch (err) {
    console.error('[PhonePe] Failed saving transactions:', err);
  }
}

/**
 * Generate PhonePe SHA256 Checksum Signature
 * Format: SHA256(Base64_Payload + Endpoint + SaltKey) + "###" + SaltIndex
 */
export function generatePhonePeChecksum(base64Payload: string, endpoint: string, saltKey: string, saltIndex: string): string {
  const stringToHash = base64Payload + endpoint + saltKey;
  const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
  return `${hash}###${saltIndex}`;
}

/**
 * Verify incoming callback checksum
 */
export function verifyPhonePeCallbackChecksum(
  base64Response: string,
  receivedChecksum: string,
  saltKey: string,
  saltIndex: string
): boolean {
  const expectedChecksum = generatePhonePeChecksum(base64Response, '/pg/v1/status', saltKey, saltIndex);
  return expectedChecksum === receivedChecksum;
}

/**
 * Initiate Payment Order with PhonePe Gateway
 */
export async function initiatePhonePePayment(req: PhonePePaymentRequest): Promise<{
  success: boolean;
  paymentUrl?: string;
  transactionId: string;
  orderNumber: string;
  isSimulated?: boolean;
  error?: string;
}> {
  const config = getPhonePeConfig();
  const amountInPaise = Math.round(req.amount * 100);
  const transactionId = req.merchantTransactionId || `CBH-TXN-${Date.now()}`;
  const orderNumber = req.merchantTransactionId || `CBH-ORD-${Date.now()}`;

  // Log transaction as PENDING
  savePhonePeTransaction({
    transactionId,
    orderNumber,
    amount: req.amount,
    customerName: req.customerName,
    customerPhone: req.customerPhone,
    customerEmail: req.customerEmail,
    companyName: req.companyName,
    shippingAddress: req.shippingAddress,
    items: req.items,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const baseUrl =
    config.environment === 'PRODUCTION'
      ? 'https://api.phonepe.com/apis/hermes'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

  const redirectUrl = req.redirectUrl || config.defaultRedirectUrl;
  const callbackUrl = req.callbackUrl || config.defaultCallbackUrl;

  const cleanUserId = (req.merchantUserId || `USER-${req.customerPhone || 'GUEST'}`).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 36) || 'CUST_DEFAULT';
  const cleanPhone = (req.customerPhone || '9999999999').replace(/[^0-9]/g, '').slice(-10) || '9999999999';

  const normalPayload = {
    merchantId: config.merchantId,
    merchantTransactionId: transactionId,
    merchantUserId: cleanUserId,
    amount: amountInPaise,
    redirectUrl: `${redirectUrl}?txnId=${transactionId}&orderNumber=${orderNumber}&amount=${req.amount}`,
    redirectMode: 'REDIRECT',
    callbackUrl,
    mobileNumber: cleanPhone,
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };

  const base64Payload = Buffer.from(JSON.stringify(normalPayload)).toString('base64');
  const xVerify = generatePhonePeChecksum(base64Payload, '/pg/v1/pay', config.saltKey, config.saltIndex);

  try {
    const response = await fetch(`${baseUrl}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ request: base64Payload }),
      cache: 'no-store',
    });

    const resJson = await response.json().catch(() => null);

    if (response.ok && resJson?.success && resJson?.data?.instrumentResponse?.redirectInfo?.url) {
      const payUrl = resJson.data.instrumentResponse.redirectInfo.url;
      return {
        success: true,
        paymentUrl: payUrl,
        transactionId,
        orderNumber,
        isSimulated: false,
      };
    }

    console.warn('[PhonePe API Non-Success Response]', {
      status: response.status,
      code: resJson?.code,
      message: resJson?.message,
      environment: config.environment,
      merchantId: config.merchantId,
    });

    // Only fallback to simulator if explicitly enabled in configuration
    if (config.enableSimulator) {
      console.warn('[PhonePe] Using simulator fallback because enableSimulator is true');
      const simulatedUrl = `${redirectUrl}?txnId=${transactionId}&orderNumber=${orderNumber}&amount=${req.amount}&status=SUCCESS&mode=UPI&simulated=true`;
      
      savePhonePeTransaction({
        transactionId,
        orderNumber,
        amount: req.amount,
        customerName: req.customerName,
        customerPhone: req.customerPhone,
        customerEmail: req.customerEmail,
        status: 'SUCCESS',
        paymentMode: 'UPI (PhonePe Simulator)',
        phonepeReferenceId: `T${Date.now()}`,
        responseMessage: 'Payment Completed via PhonePe UAT Simulator',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return {
        success: true,
        paymentUrl: simulatedUrl,
        transactionId,
        orderNumber,
        isSimulated: true,
      };
    }

    return {
      success: false,
      transactionId,
      orderNumber,
      error: resJson?.message || resJson?.code || `PhonePe PG responded with status ${response.status}`,
    };
  } catch (err: any) {
    console.error('[PhonePe Connection Exception]', err);

    if (config.enableSimulator) {
      const simulatedUrl = `${redirectUrl}?txnId=${transactionId}&orderNumber=${orderNumber}&amount=${req.amount}&status=SUCCESS&mode=UPI&simulated=true`;
      return {
        success: true,
        paymentUrl: simulatedUrl,
        transactionId,
        orderNumber,
        isSimulated: true,
      };
    }

    return {
      success: false,
      transactionId,
      orderNumber,
      error: err.message || 'Network error connecting to PhonePe Gateway',
    };
  }
}

/**
 * Check Payment Status with PhonePe
 */
export async function checkPhonePePaymentStatus(transactionId: string): Promise<{
  success: boolean;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  transactionId: string;
  amount?: number;
  paymentMode?: string;
  responseMessage?: string;
}> {
  const config = getPhonePeConfig();
  const baseUrl =
    config.environment === 'PRODUCTION'
      ? 'https://api.phonepe.com/apis/hermes'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

  const endpoint = `/pg/v1/status/${config.merchantId}/${transactionId}`;
  const stringToHash = endpoint + config.saltKey;
  const xVerify = `${crypto.createHash('sha256').update(stringToHash).digest('hex')}###${config.saltIndex}`;

  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'X-MERCHANT-ID': config.merchantId,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.code === 'PAYMENT_SUCCESS') {
      savePhonePeTransaction({
        transactionId,
        orderNumber: transactionId,
        amount: data?.data?.amount ? data.data.amount / 100 : 0,
        customerName: 'Customer',
        customerPhone: '',
        status: 'SUCCESS',
        paymentMode: data?.data?.paymentInstrument?.type || 'UPI',
        phonepeReferenceId: data?.data?.transactionId,
        responseMessage: data?.message || 'Payment Successful',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return {
        success: true,
        status: 'SUCCESS',
        transactionId,
        amount: data?.data?.amount ? data.data.amount / 100 : 0,
        paymentMode: data?.data?.paymentInstrument?.type,
        responseMessage: data?.message,
      };
    }

    // Check existing records in local store
    const existing = getPhonePeTransactions().find((t) => t.transactionId === transactionId);
    if (existing && existing.status === 'SUCCESS') {
      return {
        success: true,
        status: 'SUCCESS',
        transactionId,
        amount: existing.amount,
        paymentMode: existing.paymentMode || 'UPI',
        responseMessage: existing.responseMessage || 'Payment confirmed',
      };
    }

    return {
      success: false,
      status: (data?.code === 'PAYMENT_PENDING' ? 'PENDING' : 'FAILED') as any,
      transactionId,
      responseMessage: data?.message || 'Transaction not found or failed',
    };
  } catch (err: any) {
    const existing = getPhonePeTransactions().find((t) => t.transactionId === transactionId);
    if (existing && existing.status === 'SUCCESS') {
      return {
        success: true,
        status: 'SUCCESS',
        transactionId,
        amount: existing.amount,
        paymentMode: existing.paymentMode || 'UPI',
      };
    }

    return {
      success: false,
      status: 'FAILED',
      transactionId,
      responseMessage: err.message,
    };
  }
}
