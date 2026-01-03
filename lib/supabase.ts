import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://mitkblmftejogdxmewet.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pdGtibG1mdGVqb2dkeG1ld2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNzIzMDYsImV4cCI6MjA2Mjc0ODMwNn0.7zYkzKWXMios1IJ_rz8UA5Jm63xz59A-qi2EqsqB9-E"
const SUPABASE_SERVICE_ROLE_KEY = "aAWT20ncUtjGcaAJQiO616LIc24a+7B35YYKg+HWVXMpqI4V4a0DA/TrqcIZnSox2EZgpgV6y8kEN19Oh9SOYw=="
export const supabase = createClient(supabaseUrl, supabaseAnonKey,{
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const supabaseAdmin = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY)