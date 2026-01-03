import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, subtotal } = body

    if (!code || !subtotal) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Validating promo code:", code, "for subtotal:", subtotal)

    // Fetch promo from database
    const { data: promo, error } = await supabase
      .from("promos")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single()

    if (error || !promo) {
      console.error("Promo not found:", error)
      return NextResponse.json({ error: "Kode promo tidak valid" }, { status: 404 })
    }

    // Check if promo is still valid
    const now = new Date()
    const validFrom = new Date(promo.valid_from)
    const validUntil = new Date(promo.valid_until)

    if (now < validFrom || now > validUntil) {
      return NextResponse.json({ error: "Kode promo sudah kadaluarsa" }, { status: 400 })
    }

    // Check usage limit
    if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
      return NextResponse.json({ error: "Kode promo sudah mencapai batas penggunaan" }, { status: 400 })
    }

    // Check minimum purchase
    if (subtotal < promo.min_purchase) {
      return NextResponse.json(
        {
          error: `Minimum pembelian untuk promo ini adalah Rp ${promo.min_purchase.toLocaleString("id-ID")}`,
        },
        { status: 400 },
      )
    }

    // Calculate discount
    let discountAmount = 0
    if (promo.discount_type === "percentage") {
      discountAmount = (subtotal * promo.discount_value) / 100
      if (promo.max_discount && discountAmount > promo.max_discount) {
        discountAmount = promo.max_discount
      }
    } else {
      discountAmount = promo.discount_value
    }

    return NextResponse.json({
      success: true,
      promo: {
        id: promo.id,
        code: promo.code,
        description: promo.description,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        discount_amount: discountAmount,
      },
    })
  } catch (error) {
    console.error("Promo validation error:", error)
    return NextResponse.json({ error: "Failed to validate promo code" }, { status: 500 })
  }
}
