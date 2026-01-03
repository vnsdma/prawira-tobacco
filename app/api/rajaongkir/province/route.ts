import { type NextRequest, NextResponse } from "next/server"

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY!

export async function GET(request: NextRequest) {
  try {
    console.log("[API] Fetching provinces from RajaOngkir")

    if (!RAJAONGKIR_API_KEY) {
      return NextResponse.json({ 
        error: "API key not configured" 
      }, { status: 500 })
    }

    const response = await fetch(
      "https://rajaongkir.komerce.id/api/v1/destination/province",
      {
        method: "GET",
        headers: { "key": RAJAONGKIR_API_KEY },
        cache: 'force-cache',
        next: { revalidate: 86400 }
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[API] HTTP error:", response.status, errorText)
      return NextResponse.json({ 
        error: "Failed to fetch provinces" 
      }, { status: response.status })
    }

    const result = await response.json()

    // RajaOngkir Komerce format: { meta: {...}, data: [...] }
    if (result.meta?.code !== 200) {
      return NextResponse.json({ 
        error: result.meta?.message || "API Error",
        code: result.meta?.code
      }, { status: 400 })
    }

    const provinces = result.data || []
    console.log("[API] Successfully fetched", provinces.length, "provinces")

    return NextResponse.json({
      success: true,
      provinces: provinces,
    })
  } catch (error) {
    console.error("[API] Province fetch error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch provinces" 
    }, { status: 500 })
  }
}
