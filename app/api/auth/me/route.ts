import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Token tidak valid" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as {
      userId: number
      email: string
    }

    // Check if session exists and is valid
    const { data: session } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("session_token", token)
      .eq("user_id", decoded.userId)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (!session) {
      return NextResponse.json({ message: "Session tidak valid" }, { status: 401 })
    }

    // Get user data
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, name, phone, address, avatar_url, status, created_at, last_login")
      .eq("id", decoded.userId)
      .single()

    if (error || !user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ message: "Token tidak valid" }, { status: 401 })
  }
}
