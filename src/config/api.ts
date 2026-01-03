// config/api.ts - Mobile App Configuration
import Constants from "expo-constants"

// Get configuration from app.json extra field
const extra = Constants.expoConfig?.extra || {}

// API Base URL
export const API_BASE_URL = extra.apiBaseUrl || "https://prawiratobacco.shop"

// API Endpoints
export const API_ENDPOINTS = {
  // Products
  PRODUCTS: "/api/mobile/products",
  
  // Orders
  ORDERS: "/api/orders",
  
  // Customers
  CUSTOMERS: "/api/mobile/customers",
  
  // Payment
  PAYMENT_SNAP: "/api/payment/snap",
  
  // Authentication
  AUTH_LOGIN: "/api/auth/login",
  AUTH_REGISTER: "/api/auth/register",
  AUTH_ME: "/api/auth/me",
  AUTH_LOGOUT: "/api/auth/logout",
  
  // RajaOngkir - Fixed typo and consistent naming
  SHIPPING_PROVINCE: "api/rajaongkir/province",
  SHIPPING_CITY: "api/rajaongkir/city",       
  SHIPPING_DISTRICT: "api/rajaongkir/district",
  SHIPPING_COST: "api/rajaongkir/cost",        // Renamed from RATES for consistency
  
  // Promo
  PROMO_VALIDATE: "api/mobile/promo/validate", // Renamed from PROMO for clarity
  PAYMENT_CASHIFY: "/payment/cashify",
}

// Midtrans Configuration
export const MIDTRANS_CONFIG = {
  CLIENT_KEY: extra.midtransClientKey || "Mid-client-DxTef6Y9VTBxb3vR",
  IS_PRODUCTION: extra.midtransIsProduction || true,
}

// RajaOngkir Configuration
export const RAJAONGKIR_CONFIG = {

  ORIGIN_DISTRICT_ID: 1195,
  
  // Supported couriers
  COURIERS: ['jne', 'pos', 'tiki'],
}

// App Configuration
export const APP_CONFIG = {
  // Request timeout (milliseconds)
  REQUEST_TIMEOUT: 10000, // 10 seconds
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Cache duration (milliseconds)
  CACHE_DURATION: {
    PRODUCTS: 5 * 60 * 1000,      // 5 minutes
    PROVINCES: 24 * 60 * 60 * 1000, // 24 hours
    CITIES: 24 * 60 * 60 * 1000,    // 24 hours
    DISTRICTS: 24 * 60 * 60 * 1000, // 24 hours
  },
}

// Helper function to build full URL
export function buildApiUrl(endpoint: string, params?: Record<string, any>): string {
  // Remove leading slash if exists to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  let url = `${API_BASE_URL}${cleanEndpoint}`
  
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }
  
  return url
}

// Helper function to check if we're in development mode
export const isDevelopment = __DEV__

// Log configuration on app start (development only)
if (isDevelopment) {
  console.log('=== API Configuration ===')
  console.log('Base URL:', API_BASE_URL)
  console.log('Environment:', extra.environment || 'production')
  console.log('Midtrans Mode:', MIDTRANS_CONFIG.IS_PRODUCTION ? 'Production' : 'Sandbox')
  console.log('Origin District ID:', RAJAONGKIR_CONFIG.ORIGIN_DISTRICT_ID)
  console.log('========================')
}

// Export all configurations
export default {
  API_BASE_URL,
  API_ENDPOINTS,
  MIDTRANS_CONFIG,
  RAJAONGKIR_CONFIG,
  APP_CONFIG,
  buildApiUrl,
  isDevelopment,
}