import { type NextRequest, NextResponse } from "next/server"

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY!

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const province_id = searchParams.get('province_id')

    if (!province_id) {
      return NextResponse.json({ 
        error: "province_id is required" 
      }, { status: 400 })
    }

    console.log(`[API] Fetching cities for province ${province_id}`)

    const response = await fetch(
      `https://rajaongkir.komerce.id/api/v1/destination/city/${province_id}`,
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
        error: "Failed to fetch cities" 
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

    const cities = result.data || []
    console.log("[API] Successfully fetched", cities.length, "cities")

    return NextResponse.json({
      success: true,
      cities: cities,
    })
  } catch (error) {
    console.error("[API] City fetch error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch cities" 
    }, { status: 500 })
  }
}
