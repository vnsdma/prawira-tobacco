import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { order_id, amount, customer } = await request.json()

    // Midtrans configuration
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true"
    const baseUrl = isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions"

    const parameter = {
      transaction_details: {
        order_id: order_id,
        gross_amount: amount,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: customer.name,
        phone: customer.phone,
        billing_address: {
          address: customer.address,
        },
      },
    }

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(serverKey + ":").toString("base64")}`,
      },
      body: JSON.stringify(parameter),
    })

    const result = await response.json()

    return NextResponse.json({
      token: result.token,
      redirect_url: result.redirect_url,
    })
  } catch (error) {
    console.error("Midtrans payment error:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
