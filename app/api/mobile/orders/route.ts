import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    console.log("Received order data:", orderData)

    // Validate required fields
    if (!orderData.customer_email || !orderData.items || !orderData.total_amount) {
      return NextResponse.json(
        { error: "Missing required fields: customer_email, items, or total_amount" },
        { status: 400 },
      )
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`

    // Prepare order data for database
    const dbOrderData = {
      order_number: orderNumber,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      customer_address: orderData.customer_address,
      subtotal: orderData.subtotal || orderData.total_amount,
      shipping_cost: orderData.shipping_cost || 0,
      shipping_service: orderData.shipping_service || null,
      shipping_destination: orderData.shipping_destination || null,
      promo_code: orderData.promo_code || null,
      discount_amount: orderData.discount_amount || 0,
      total_amount: orderData.total_amount,
      status: orderData.status || "pending",
      payment_method: orderData.payment_method || "midtrans",
      created_at: new Date().toISOString(),
    }

    // Insert order
    const { data: order, error: orderError } = await supabase.from("orders").insert([dbOrderData]).select().single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return NextResponse.json({ error: "Failed to create order", details: orderError.message }, { status: 500 })
    }

    console.log("Order created:", order)

    // Insert order items
    if (orderData.items && orderData.items.length > 0) {
      const orderItems = orderData.items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name || item.name,
        quantity: item.quantity,
        price: item.price,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        console.error("Error creating order items:", itemsError)
        // Don't fail the entire order if items insertion fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        order: order,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error in order creation:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email parameter required" }, { status: 400 })
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          quantity,
          price,
          product_name
        )
      `,
      )
      .eq("customer_email", email)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error in orders fetch:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
