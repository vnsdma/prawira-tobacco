import { type NextRequest, NextResponse } from "next/server"

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY!
const RAJAONGKIR_BASE_URL = "https://api.rajaongkir.com/starter"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const province = searchParams.get("province")

    let url = `${RAJAONGKIR_BASE_URL}/city`
    if (province) {
      url += `?province=${province}`
    }

    console.log("Fetching cities from RajaOngkir:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        key: RAJAONGKIR_API_KEY,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("RajaOngkir API error:", response.status, errorText)
      return NextResponse.json({ error: "Failed to fetch cities" }, { status: response.status })
    }

    const result = await response.json()

    if (result.rajaongkir?.status?.code !== 200) {
      return NextResponse.json({ error: result.rajaongkir?.status?.description || "API Error" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      cities: result.rajaongkir.results,
    })
  } catch (error) {
    console.error("City fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 })
  }
}
