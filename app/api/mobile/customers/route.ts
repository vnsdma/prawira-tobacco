import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

// Create a single Supabase client for interacting with your database
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if customer already exists
    const { data: existingCustomer, error: findError } = await supabase
      .from("customers")
      .select("*")
      .eq("email", email)
      .single()

    if (findError && findError.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows found"
      console.error("Error finding customer:", findError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (existingCustomer) {
      return NextResponse.json(existingCustomer)
    }

    // Create new customer
    const { data: customer, error: insertError } = await supabase
      .from("customers")
      .insert({
        name: name || "Guest",
        email,
        phone: phone || "",
        user_uid: "mobile_app",
        status: "active",
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating customer:", insertError)
      return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error processing customer request:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
