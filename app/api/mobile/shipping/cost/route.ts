import { type NextRequest, NextResponse } from "next/server"

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY!
const RAJAONGKIR_BASE_URL = "https://api.rajaongkir.com/starter"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { origin, destination, weight, courier } = body

    // Validate required fields
    if (!origin || !destination || !weight || !courier) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Fetching shipping cost:", { origin, destination, weight, courier })

    // Call RajaOngkir API
    const response = await fetch(`${RAJAONGKIR_BASE_URL}/cost`, {
      method: "POST",
      headers: {
        key: RAJAONGKIR_API_KEY,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        origin: origin.toString(),
        destination: destination.toString(),
        weight: weight.toString(),
        courier: courier,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("RajaOngkir API error:", response.status, errorText)
      return NextResponse.json({ error: "Failed to fetch shipping cost" }, { status: response.status })
    }

    const result = await response.json()
    console.log("RajaOngkir response:", JSON.stringify(result, null, 2))

    if (result.rajaongkir?.status?.code !== 200) {
      return NextResponse.json({ error: result.rajaongkir?.status?.description || "API Error" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      results: result.rajaongkir.results,
    })
  } catch (error) {
    console.error("Shipping cost calculation error:", error)
    return NextResponse.json({ error: "Failed to calculate shipping cost" }, { status: 500 })
  }
}
