import { type NextRequest, NextResponse } from "next/server"

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY!

export async function GET(
  request: NextRequest,
  { params }: { params: { city_id: string } }
) {
  try {
    const { city_id } = params

    if (!city_id) {
      return NextResponse.json({ 
        error: "city_id is required" 
      }, { status: 400 })
    }

    console.log(`[API] Fetching districts for city ${city_id}`)

    const response = await fetch(
      `https://rajaongkir.komerce.id/api/v1/destination/district/${city_id}`,
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
        error: "Failed to fetch districts" 
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

    const districts = result.data || []
    console.log("[API] Successfully fetched", districts.length, "districts")

    return NextResponse.json({
      success: true,
      districts: districts,
    })
  } catch (error) {
    console.error("[API] District fetch error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch districts" 
    }, { status: 500 })
  }
}