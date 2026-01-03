import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { promo_id } = body

    if (!promo_id) {
      return NextResponse.json({ error: "Missing promo_id" }, { status: 400 })
    }

    // Increment the used_count
    const { data, error } = await supabase.rpc("increment_promo_usage", { promo_id: promo_id })

    if (error) {
      console.error("Failed to increment promo usage:", error)
      return NextResponse.json({ error: "Failed to increment promo usage" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Promo usage incremented",
    })
  } catch (error) {
    console.error("Increment promo error:", error)
    return NextResponse.json({ error: "Failed to increment promo usage" }, { status: 500 })
  }
}
