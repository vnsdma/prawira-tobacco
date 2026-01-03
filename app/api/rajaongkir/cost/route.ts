import { type NextRequest, NextResponse } from "next/server"

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { origin, destination, weight, courier } = body

    if (!origin || !destination || !weight || !courier) {
      return NextResponse.json({ 
        error: "Missing required fields: origin, destination, weight, courier" 
      }, { status: 400 })
    }

    console.log(`[API] Calculating cost: ${origin} -> ${destination}, ${weight}g, ${courier}`)

    const response = await fetch(
      "https://rajaongkir.komerce.id/api/v1/calculate/district/domestic-cost",
      {
        method: "POST",
        headers: {
          "key": RAJAONGKIR_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin,
          destination,
          weight,
          courier,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[API] HTTP error:", response.status, errorText)
      return NextResponse.json({ 
        error: "Failed to calculate cost" 
      }, { status: response.status })
    }

    const result = await response.json()

    // Check meta status
    if (result.meta?.code !== 200) {
      return NextResponse.json({ 
        error: result.meta?.message || "API Error",
        code: result.meta?.code
      }, { status: 400 })
    }

    const results = result.data || []
    console.log("[API] Successfully calculated shipping cost")

    return NextResponse.json({
      success: true,
      results: results,
    })
  } catch (error) {
    console.error("[API] Cost calculation error:", error)
    return NextResponse.json({ 
      error: "Failed to calculate cost" 
    }, { status: 500 })
  }
}