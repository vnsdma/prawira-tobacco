"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import * as SecureStore from "expo-secure-store"
import { API_BASE_URL, API_ENDPOINTS } from "../config/api"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  status?: string
  created_at?: string
  last_login?: string
  address?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const token = await SecureStore.getItemAsync("auth_token")
      if (token) {
        // Verify token with server
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_ME}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const user = await response.json()
          setState({
            user,
            token,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          // Token is invalid, remove it
          await SecureStore.deleteItemAsync("auth_token")
          setState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      } else {
        setState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    } catch (error) {
      console.error("Auth check error:", error)
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_LOGIN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        await SecureStore.setItemAsync("auth_token", data.token)
        setState({
          user: data.user,
          token: data.token,
          isLoading: false,
          isAuthenticated: true,
        })
      } else {
        // Throw error with server message
        throw new Error(data.message || "Login gagal")
      }
    } catch (error) {
      console.error("Login error:", error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Terjadi kesalahan saat login")
    }
  }

  const register = async (name: string, email: string, password: string, phone?: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_REGISTER}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, phone }),
      })

      const data = await response.json()

      if (response.ok) {
        await SecureStore.setItemAsync("auth_token", data.token)
        setState({
          user: data.user,
          token: data.token,
          isLoading: false,
          isAuthenticated: true,
        })
      } else {
        // Throw error with server message
        throw new Error(data.message || "Registrasi gagal")
      }
    } catch (error) {
      console.error("Register error:", error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Terjadi kesalahan saat registrasi")
    }
  }

  const logout = async (): Promise<void> => {
    try {
      if (state.token) {
        await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_LOGOUT}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${state.token}`,
            "Content-Type": "application/json",
          },
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      await SecureStore.deleteItemAsync("auth_token")
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }

  const refreshUser = async (): Promise<void> => {
    if (state.token) {
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_ME}`, {
          headers: {
            Authorization: `Bearer ${state.token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const user = await response.json()
          setState((prev) => ({ ...prev, user }))
        }
      } catch (error) {
        console.error("Refresh user error:", error)
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
