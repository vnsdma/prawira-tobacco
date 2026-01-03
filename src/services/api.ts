// services/api.ts - FIXED URLs untuk Next.js Backend

import { API_BASE_URL, API_ENDPOINTS} from "../config/api"
import type { Product, Order } from "../types"

// ============================================
// Types/Interfaces for RajaOngkir
// ============================================

export interface Province {
  id: number
  name: string
}

export interface City {
  id: number
  name: string
}

export interface District {
  id: number
  name: string
}

export interface ShippingCost {
  code: string
  name: string
  costs: Array<{
    service: string
    description: string
    cost: Array<{
      value: number
      etd: string
      note: string
    }>
  }>
}
export interface CashifyPaymentRequest {
  orderId: string
  amount: number
  ewalletType: string // 'dana', 'ovo', 'shopeepay', 'gopay'
  customerPhone: string
  customerEmail: string
}

export interface CashifyPaymentResponse {
  success: boolean
  redirectUrl?: string // URL untuk redirect ke aplikasi (Deep Link)
  qrContent?: string   // String QR jika responsenya berupa QR code
  transactionId: string
}

// ============================================
// API Helper Functions
// ============================================

const DEFAULT_TIMEOUT = 10000 // 10 seconds

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  // Get response text first for debugging
  const responseText = await response.text()
  
  // Check if response is HTML (404 page)
  if (responseText.startsWith('<!DOCTYPE html>') || responseText.startsWith('<html')) {
    console.error('❌ Received HTML instead of JSON - API endpoint not found')
    console.error('URL:', response.url)
    throw new Error(`API endpoint not found: ${response.url}`)
  }

  // Check HTTP status
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`
    
    try {
      const errorJson = JSON.parse(responseText)
      errorMessage = errorJson.error || errorJson.message || errorMessage
    } catch {
      errorMessage = responseText || errorMessage
    }
    
    throw new Error(errorMessage)
  }

  // Parse JSON
  let data
  try {
    data = JSON.parse(responseText)
  } catch (error) {
    console.error('❌ Failed to parse JSON:', responseText.substring(0, 200))
    throw new Error('Invalid JSON response from server')
  }
  
  // Check for success field if present
  if (data.hasOwnProperty('success') && !data.success) {
    throw new Error(data.error || 'API request failed')
  }

  return data
}

function buildUrl(endpoint: string, params?: Record<string, any>): string {
  let url = `${API_BASE_URL}${endpoint}`
  
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

export const checkCashifyStatus = async (transactionId: string) => {
  // Pastikan URL mengarah ke backend Next.js kita, BUKAN langsung ke Cashify
  const url = `${API_BASE_URL}/api/payment/cashify/status`; 
  
  try {
      const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId }),
      });
      
      return await response.json();
  } catch (error) {
      console.error("Check Status Error:", error);
      throw error;
  }
};

// ============================================
// Original API Service (Products & Orders)
// ============================================

export const apiService = {
  async getProducts(category?: string, search?: string): Promise<Product[]> {
    const params: Record<string, any> = {}
    if (category && category !== "all") {
      params.category = category
    }
    if (search) {
      params.search = search
    }

    const url = buildUrl(API_ENDPOINTS.PRODUCTS, params)
    console.log('📡 Fetching products:', url)
    
    const response = await fetchWithTimeout(url)
    
    if (!response.ok) {
      throw new Error("Failed to fetch products")
    }
    
    const data = await response.json()
    return data.products
  },

  async createOrder(orderData: any): Promise<any> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.ORDERS}`
    console.log('📡 Creating order:', url)
    
    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create order")
    }

    return response.json()
  },

  async getOrders(email: string): Promise<Order[]> {
    const url = buildUrl(API_ENDPOINTS.ORDERS, { email })
    console.log('📡 Fetching orders:', url)
    
    const response = await fetchWithTimeout(url)
    
    if (!response.ok) {
      throw new Error("Failed to fetch orders")
    }
    
    return response.json()
  },

  async createCashifyPayment(data: any): Promise<any> {
    // Arahkan ke endpoint Next.js lokal kita
    const url = `${API_BASE_URL}/api/payment/cashify` 
    
    console.log('📡 Initiating Cashify payment:', url)

    const payload = {
        order_id: data.orderId,
        amount: data.amount,
        ewalletType: data.ewalletType, // "dana", "ovo", dll
    }
    
    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Gagal membuat pembayaran Cashify")
    }

    // Response berisi: transaction_id, qr_string, redirect_url
    return response.json()
},

// Tambahan: Fungsi untuk cek status dari frontend
async checkCashifyStatus(transactionId: string): Promise<any> {
    const url = `${API_BASE_URL}/api/payment/cashify/status`
    
    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId }),
    })
    
    return response.json()
},

  // (Optional) Keep Midtrans if needed, otherwise ignore
  async createSnapPayment(paymentData: any): Promise<any> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.PAYMENT_SNAP}`
    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create payment")
    }
    return response.json()
  },
}

// ============================================
// RajaOngkir API Service - FIXED URLs
// ============================================

export const rajaOngkirService = {
  /**
   * Get all provinces
   */
  getProvinces: async (): Promise<Province[]> => {
    try {
      // FIX: Gunakan buildUrl dengan leading slash
      const url = buildUrl(`/${API_ENDPOINTS.SHIPPING_PROVINCE}`)
      console.log('📡 Fetching provinces:', url)
      
      const response = await fetchWithTimeout(url)
      const data = await handleResponse<{ success: boolean; provinces: Province[] }>(response)
      
      console.log('✅ Provinces loaded:', data.provinces.length)
      return data.provinces
    } catch (error) {
      console.error('❌ RajaOngkir getProvinces error:', error)
      throw error
    }
  },

  /**
   * Get cities by province ID
   */
  getCities: async (provinceId: number): Promise<City[]> => {
    try {
      if (!provinceId) {
        throw new Error('Province ID is required')
      }

      // FIX: Gunakan buildUrl dengan leading slash
      const url = buildUrl(`/${API_ENDPOINTS.SHIPPING_CITY}`, { province_id: provinceId })
      console.log('📡 Fetching cities:', url)
      
      const response = await fetchWithTimeout(url)
      const data = await handleResponse<{ success: boolean; cities: City[] }>(response)
      
      console.log('✅ Cities loaded:', data.cities.length)
      return data.cities
    } catch (error) {
      console.error('❌ RajaOngkir getCities error:', error)
      throw error
    }
  },

  /**
   * Get districts by city ID
   */
  getDistricts: async (cityId: number | string): Promise<District[]> => {
    try {
      // Validate and convert cityId
      if (!cityId || cityId === '' || cityId === 'undefined' || cityId === 'null') {
        throw new Error('City ID is required')
      }

      // Convert to number if string
      const cityIdNumber = typeof cityId === 'string' ? parseInt(cityId, 10) : cityId
      
      if (isNaN(cityIdNumber)) {
        throw new Error('Invalid City ID')
      }

      // FIX: Gunakan buildUrl dengan leading slash
      const url = `${API_BASE_URL}/${API_ENDPOINTS.SHIPPING_DISTRICT}/${cityIdNumber}`
      console.log('📡 Fetching districts:', url)
      console.log('📡 City ID:', cityIdNumber, '(type:', typeof cityIdNumber, ')')
      
      const response = await fetchWithTimeout(url)
      const data = await handleResponse<{ success: boolean; districts: District[] }>(response)
      
      console.log('✅ Districts loaded:', data.districts.length)
      return data.districts
    } catch (error) {
      console.error('❌ RajaOngkir getDistricts error:', error)
      console.error('❌ City ID received:', cityId, '(type:', typeof cityId, ')')
      throw error
    }
  },

  /**
   * Calculate shipping cost (district to district)
   */
  calculateCost: async (
    origin: number,
    destination: number,
    weight: number,
    courier: string
  ): Promise<ShippingCost[]> => {
    try {
      if (!origin || !destination || !weight || !courier) {
        throw new Error('All parameters are required')
      }

      // FIX: Gunakan buildUrl dengan leading slash
      const url = `${API_BASE_URL}/${API_ENDPOINTS.SHIPPING_COST}`
      console.log('📡 Calculating cost:', url)
      
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin,
          destination,
          weight,
          courier,
        }),
      })

      const data = await handleResponse<{ success: boolean; results: ShippingCost[] }>(response)
      
      console.log('✅ Shipping costs loaded:', data.results.length)
      return data.results
    } catch (error) {
      console.error('❌ RajaOngkir calculateCost error:', error)
      throw error
    }
  },
}

// ============================================
// Product API Service
// ============================================

export const productService = {
  /**
   * Get all products with optional filters
   */
  getAll: async (filters?: {
    category?: string
    search?: string
  }): Promise<Product[]> => {
    try {
      const params: Record<string, any> = {}
      if (filters?.category) params.category = filters.category
      if (filters?.search) params.search = filters.search

      const url = buildUrl(API_ENDPOINTS.PRODUCTS, params)
      console.log('📡 Fetching products:', url)
      
      const response = await fetchWithTimeout(url)
      const data = await handleResponse<{ success: boolean; products: Product[] }>(response)
      
      console.log('✅ Products loaded:', data.products.length)
      return data.products
    } catch (error) {
      console.error('❌ Product getAll error:', error)
      throw error
    }
  },

  /**
   * Get product by ID
   */
  getById: async (id: string): Promise<Product> => {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}/${id}`
      console.log('📡 Fetching product:', url)
      
      const response = await fetchWithTimeout(url)
      const data = await handleResponse<{ success: boolean; product: Product }>(response)
      
      console.log('✅ Product loaded:', data.product.id)
      return data.product
    } catch (error) {
      console.error('❌ Product getById error:', error)
      throw error
    }
  },
}

// ============================================
// Order API Service
// ============================================

export const orderService = {
  /**
   * Create new order
   */
  create: async (orderData: any): Promise<Order> => {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.ORDERS}`
      console.log('📡 Creating order:', url)
      
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const data = await handleResponse<{ success: boolean; order: Order }>(response)
      
      console.log('✅ Order created:', data.order.id)
      return data.order
    } catch (error) {
      console.error('❌ Order create error:', error)
      throw error
    }
  },

  /**
   * Get orders by email
   */
  getByEmail: async (email: string): Promise<Order[]> => {
    try {
      const url = buildUrl(API_ENDPOINTS.ORDERS, { email })
      console.log('📡 Fetching orders by email:', url)
      
      const response = await fetchWithTimeout(url)
      const data = await handleResponse<{ success: boolean; orders: Order[] }>(response)
      
      console.log('✅ Orders loaded:', data.orders?.length || 0)
      return data.orders || []
    } catch (error) {
      console.error('❌ Order getByEmail error:', error)
      throw error
    }
  },

  /**
   * Get order by ID
   */
  getById: async (id: string): Promise<Order> => {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.ORDERS}/${id}`
      console.log('📡 Fetching order:', url)
      
      const response = await fetchWithTimeout(url)
      const data = await handleResponse<{ success: boolean; order: Order }>(response)
      
      console.log('✅ Order loaded:', data.order.id)
      return data.order
    } catch (error) {
      console.error('❌ Order getById error:', error)
      throw error
    }
  },

  /**
   * Get orders with status filter
   */
  getByStatus: async (status: string): Promise<Order[]> => {
    try {
      const url = buildUrl(API_ENDPOINTS.ORDERS, { status })
      console.log('📡 Fetching orders by status:', url)
      
      const response = await fetchWithTimeout(url)
      const data = await handleResponse<{ success: boolean; orders: Order[] }>(response)
      
      console.log('✅ Orders loaded:', data.orders?.length || 0)
      return data.orders || []
    } catch (error) {
      console.error('❌ Order getByStatus error:', error)
      throw error
    }
  },
}

// ============================================
// Promo API Service
// ============================================

export const promoService = {
  /**
   * Validate promo code
   */
  validate: async (code: string, subtotal: number): Promise<any> => {
    try {
      const url = `${API_BASE_URL}/${API_ENDPOINTS.PROMO_VALIDATE}`
      console.log('📡 Validating promo:', url)
      
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, subtotal }),
      })

      const data = await handleResponse<any>(response)
      
      console.log('✅ Promo validated')
      return data
    } catch (error) {
      console.error('❌ Promo validate error:', error)
      throw error
    }
  },
}

// ============================================
// Export all services
// ============================================

export default {
  apiService,
  rajaOngkirService,
  productService,
  orderService,
  promoService,
}