import { Platform } from 'react-native';

// 10.0.2.2 is the Android emulator's alias for the host machine's localhost (127.0.0.1)
const LOCAL_IP = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const PORT = '3000';

export const ENV = {
  // Local emulator / localhost development URL
  DEV_API_URL: `http://${LOCAL_IP}:${PORT}/api`,
  // LAN development URL (uncomment / use when testing on a physical phone via Wi-Fi)
  LAN_API_URL: 'http://192.168.1.6:3000/api',
  // Production live backend API
  PROD_API_URL: 'https://cbh.socialflymediatech.com/api',
  // Toggle between Production and Development:
  // - Set to false to test against your local Next.js server (http://10.0.2.2:3000/api)
  // - Set to true for live production deployment (https://cbh.socialflymediatech.com/api)
  IS_PROD: false,
};

// Active API Base URL
export const API_BASE_URL = ENV.IS_PROD ? ENV.PROD_API_URL : ENV.DEV_API_URL;
export const API_URL = API_BASE_URL;

export default {
  ENV,
  API_BASE_URL,
  API_URL,
};

