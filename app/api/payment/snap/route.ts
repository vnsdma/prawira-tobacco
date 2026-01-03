import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { order_id, amount, customer } = await request.json()

    // Validate required fields
    if (!order_id || !amount || !customer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Midtrans Snap configuration
    const serverKey = process.env.MIDTRANS_SERVER_KEY!
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true"

    const snapUrl = isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions"

    // Create unique order ID
    const uniqueOrderId = `TBS-${order_id}-${Date.now()}`

    // Prepare Snap transaction data
    const parameter = {
      transaction_details: {
        order_id: uniqueOrderId,
        gross_amount: Math.round(amount),
      },
      customer_details: {
        first_name: customer.name?.split(" ")[0] || "Customer",
        last_name: customer.name?.split(" ").slice(1).join(" ") || "",
        email: customer.email || `customer-${Date.now()}@example.com`,
        phone: customer.phone || "+62812345678",
      },
      credit_card: {
        secure: true,
      },
    }

    console.log("Creating Snap transaction:", parameter)

    // Create authorization header
    const auth = Buffer.from(serverKey + ":").toString("base64")

    const response = await fetch(snapUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(parameter),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Snap API error:", response.status, errorText)
      return NextResponse.json({ error: `Payment gateway error: ${response.status}` }, { status: response.status })
    }

    const result = await response.json()
    console.log("Snap transaction created:", result)

    return NextResponse.json({
      token: result.token,
      redirect_url: result.redirect_url,
      order_id: uniqueOrderId,
    })
  } catch (error) {
    console.error("Snap payment error:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
