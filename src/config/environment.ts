import { extractEtag } from "next/dist/server/image-optimizer"
import Constants from "expo-constants"
const extra = Constants.expoConfig?.extra || {}

// Environment configuration for different stages
export const ENV_CONFIG = {
  development: {
    API_BASE_URL: "http://localhost:3000", // For local development
    MIDTRANS_CLIENT_KEY: "Mid-client-DxTef6Y9VTBxb3vR",
    IS_PRODUCTION: true,
  },
  staging: {
    API_BASE_URL: "https://staging.prawiratobacco.shop", // If you have staging
    MIDTRANS_CLIENT_KEY: "SB-Mid-client-your-sandbox-key",
    IS_PRODUCTION: false,
  },
  production: {
    API_BASE_URL: "https://prawiratobacco.shop",
    MIDTRANS_CLIENT_KEY: "Mid-client-DxTef6Y9VTBxb3vR", // Replace with actual production key
    IS_PRODUCTION: true,
  },
}

export const supabase_config = {
  SUPABASE_URL : extra.EXPO_PUBLIC_SUPABASE_URL || "https://mitkblmftejogdxmewet.supabase.co",
  SUPABASE_ROLE_KEY : extra.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pdGtibG1mdGVqb2dkeG1ld2V0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzE3MjMwNiwiZXhwIjoyMDYyNzQ4MzA2fQ.1n2Dtj5qWqhh2-X7dqGz-X8lkNh7PBqg_-oXuKzn9I0"
}

export const rajaongkir_config = {
  RAJAONGKIR_API_KEY :  "0632ddb357253ae9af89a7b7c908bc44"
}

// Declare the __DEV__ variable
const __DEV__ = process.env.NODE_ENV === "development"

// Get current environment
const getCurrentEnv = () => {
  if (__DEV__) {
    return ENV_CONFIG.production
  }
  // You can add logic here to detect staging vs production
  return ENV_CONFIG.production
}

export const CURRENT_ENV = getCurrentEnv()
