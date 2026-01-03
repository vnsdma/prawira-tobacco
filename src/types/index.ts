export interface Product {
  id: number
  name: string
  description: string
  price: number
  in_stock: number
  category: string
  image_url: string
  weight: number
  
}

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  weight: number
}

export interface Order {
  id: string
  userId: string
  items: Array<{
    productId: string
    name: string
    quantity: number
    price: number
  }>
  shippingAddress: {
    name: string
    phone: string
    address: string
    district: string
    city: string
    province: string
  }
  shippingCost: number
  courier: string
  totalAmount: number
  status: string
  createdAt: string
}

export interface OrderItem {
  id: number
  quantity: number
  price: number
  products: {
    name: string
    weight: number
  }
}

export interface User {
  id: number
  email: string
  name: string
  phone?: string
  address?: string
  avatar_url?: string
  status: string
  created_at: string
  last_login?: string
}

export interface Category {
  id: string
  name: string
  icon: string
}

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

