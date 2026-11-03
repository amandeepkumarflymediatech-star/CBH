import { Platform } from 'react-native';

// 10.0.2.2 is the Android emulator's alias for the host machine's localhost (127.0.0.1)
const LOCAL_IP = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const PORT = '3000';

export type ApiEnvironment = 'local' | 'prod' | 'lan';

export const ENV = {
  // 1. Local Development (Android emulator or iOS simulator)
  LOCAL_HOST: `http://${LOCAL_IP}:${PORT}`,
  DEV_API_URL: `http://${LOCAL_IP}:${PORT}/api`,

  // 2. Local Area Network (Testing on a real physical phone connected to same Wi-Fi)
  LAN_HOST: 'http://192.168.1.146:3000',
  LAN_API_URL: 'http://192.168.1.146:3000/api',

  // 3. Live Production Server (Official deployed backend)
  PROD_HOST: 'https://cbh.socialflymediatech.com',
  PROD_API_URL: 'https://cbh.socialflymediatech.com/api',

  // Active environment toggle:
  // - 'local': Local Next.js server on computer (http://10.0.2.2:3000/api)
  // - 'lan': Physical phone on Wi-Fi (http://192.168.1.146:3000/api)
  // - 'prod': Live cloud production backend (https://cbh.socialflymediatech.com/api)
  ACTIVE_ENV: 'prod' as ApiEnvironment,

  // Legacy boolean flag (kept for backwards compatibility)
  IS_PROD: true,
};

// Runtime dynamic environment switch
let currentEnvironment: ApiEnvironment = ENV.ACTIVE_ENV;

/**
 * Switch API environment dynamically ('local' | 'prod' | 'lan')
 */
export function setApiEnvironment(env: ApiEnvironment) {
  currentEnvironment = env;
}

/**
 * Get the currently active API environment
 */
export function getApiEnvironment(): ApiEnvironment {
  return currentEnvironment;
}

/**
 * Returns the API base URL for the given environment (or current active environment).
 */
export function getApiBaseUrl(env?: ApiEnvironment): string {
  const target = env || currentEnvironment;
  switch (target) {
    case 'prod':
      return ENV.PROD_API_URL;
    case 'lan':
      return ENV.LAN_API_URL;
    case 'local':
    default:
      return ENV.DEV_API_URL;
  }
}

/**
 * Returns the host root URL (without /api) for resolving static assets and uploaded images
 */
export function getHostRootUrl(env?: ApiEnvironment): string {
  const target = env || currentEnvironment;
  switch (target) {
    case 'prod':
      return ENV.PROD_HOST;
    case 'lan':
      return ENV.LAN_HOST;
    case 'local':
    default:
      return ENV.LOCAL_HOST;
  }
}

// Active API Base URL export (backwards-compatible with all existing imports)
export const API_BASE_URL = getApiBaseUrl();
export const API_URL = API_BASE_URL;

export default {
  ENV,
  API_BASE_URL,
  API_URL,
  getApiBaseUrl,
  getHostRootUrl,
  setApiEnvironment,
  getApiEnvironment,
};
