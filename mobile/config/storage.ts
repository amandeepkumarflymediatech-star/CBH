// ============================================================================
// CBH FASTENERS MOBILE APP - PERSISTENT STORAGE (ASYNCSTORAGE + FALLBACK)
// ============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MobileAuthUser } from '../types';

const STORAGE_KEYS = {
  HAS_SEEN_WELCOME: 'cbh_mobile_has_seen_welcome_v1',
  AUTH_USER: 'cbh_mobile_auth_user',
  AUTH_TOKEN: 'cbh_mobile_auth_token',
} as const;

// In-memory fallback for hot-reload or edge scenarios
const memoryStore: Record<string, string> = {};

/**
 * Checks if the user has already seen and dismissed the Welcome Onboarding screen.
 * New users will return false (showing the welcome screen once).
 * Returning users will return true (skipping straight to the storefront).
 */
export async function getHasSeenWelcome(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_WELCOME);
    if (val !== null) {
      return val === 'true';
    }
  } catch (err) {
    console.warn('[Storage] Error reading hasSeenWelcome:', err);
  }

  // Fallback to memory
  return memoryStore[STORAGE_KEYS.HAS_SEEN_WELCOME] === 'true';
}

/**
 * Marks that the user has seen the Welcome Onboarding screen.
 * Once marked true, the welcome screen will never be shown again.
 */
export async function setHasSeenWelcome(seen: boolean = true): Promise<void> {
  const strVal = seen ? 'true' : 'false';
  memoryStore[STORAGE_KEYS.HAS_SEEN_WELCOME] = strVal;
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_WELCOME, strVal);
  } catch (err) {
    console.warn('[Storage] Error setting hasSeenWelcome:', err);
  }
}

/**
 * Persists the logged-in user in native device storage.
 */
export async function setPersistedUser(user: MobileAuthUser | null, token?: string): Promise<void> {
  try {
    if (user) {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      if (token) {
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      }
      // Having an active account also automatically marks welcome as seen
      await setHasSeenWelcome(true);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  } catch (err) {
    console.warn('[Storage] Error persisting user:', err);
  }
}

/**
 * Retrieves the persisted user from native storage.
 */
export async function getPersistedUser(): Promise<MobileAuthUser | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (raw) {
      return JSON.parse(raw) as MobileAuthUser;
    }
  } catch (err) {
    console.warn('[Storage] Error retrieving persisted user:', err);
  }
  return null;
}

/**
 * Retrieves the persisted auth token from native storage.
 */
export async function getPersistedToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch {
    return null;
  }
}

