import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { executeQuery, beginTransaction, commitTransaction, rollbackTransaction } from "@/lib/database"

interface CartItem {
  id: number
  name: string
  brand: string
  price: number
  quantity: number
  image_url?: string
  reference_number?: string
}

interface ShippingAddress {
  first_name: string
  last_name: string
  company?: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone?: string
}

interface BillingAddress extends ShippingAddress { }

export async function POST(request: NextRequest) {
  let connection: any = null

  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Received order data:", JSON.stringify(body, null, 2))

    const {
      items,
      shipping_address,
      billing_address,
      payment_method = "card",
      shipping_method = "standard",
      notes,
      currency = "USD",
    }: {
      items: CartItem[]
      shipping_address: ShippingAddress
      billing_address?: BillingAddress
      payment_method?: string
      shipping_method?: string
      notes?: string
      currency?: string
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 })
    }

    if (!shipping_address) {
      return NextResponse.json({ error: "Shipping address is required" }, { status: 400 })
    }

    // Validate required shipping address fields
    const requiredShippingFields = [
      "first_name",
      "last_name",
      "address_line_1",
      "city",
      "state",
      "postal_code",
      "country",
    ]

    for (const field of requiredShippingFields) {
      if (!shipping_address[field as keyof ShippingAddress]) {
        return NextResponse.json(
          {
            error: `Shipping ${field.replace("_", " ")} is required`,
          },
          { status: 400 },
        )
      }
    }

    // If billing address is provided, validate it too
    if (billing_address) {
      for (const field of requiredShippingFields) {
        if (!billing_address[field as keyof BillingAddress]) {
          return NextResponse.json(
            {
              error: `Billing ${field.replace("_", " ")} is required`,
            },
            { status: 400 },
          )
        }
      }
    }

    // Start transaction
    connection = await beginTransaction()

    // Check stock availability for all items
    const stockChecks = await Promise.all(
      items.map((item) =>
        executeQuery(
          "SELECT id, name, stock_quantity, reference_number FROM products WHERE id = ?",
          [item.id],
          connection,
        ),
      ),
    )

    const outOfStockItems: string[] = []
    for (let i = 0; i < stockChecks.length; i++) {
      const product = stockChecks[i][0]
      const requestedItem = items[i]

      if (!product) {
        outOfStockItems.push(`${requestedItem.name} (not found)`)
      } else if (product.stock_quantity < requestedItem.quantity) {
        outOfStockItems.push(`${product.name} (only ${product.stock_quantity} available)`)
      }
    }

    if (outOfStockItems.length > 0) {
      await rollbackTransaction(connection)
      return NextResponse.json(
        {
          error: "Some items are out of stock",
          outOfStockItems,
        },
        { status: 400 },
      )
    }

    // Calculate total amount
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping_amount = subtotal > 10000 ? 0 : 150 // Free shipping over $10,000
    const tax_amount = subtotal * 0.08 // 8% tax
    const discount_amount = 0 // No discount for now
    const total_amount = subtotal + shipping_amount + tax_amount - discount_amount

    // Generate order number
    const order_number = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    console.log("Creating order with data:", {
      user_id: decoded.userId,
      order_number,
      subtotal,
      shipping_amount,
      tax_amount,
      discount_amount,
      total_amount,
      currency,
      payment_method,
      shipping_method,
      notes,
    })

    // Create order with all required fields
    const orderResult = await executeQuery(
      `INSERT INTO orders (
        user_id, order_number, status, subtotal, tax_amount, 
        shipping_amount, discount_amount, total_amount, currency,
        payment_status, payment_method, shipping_method, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        decoded.userId,
        order_number,
        "pending",
        subtotal,
        tax_amount,
        shipping_amount,
        discount_amount,
        total_amount,
        currency,
        "pending",
        payment_method,
        shipping_method,
        notes || null,
      ],
      connection,
    )

    const orderId = orderResult.insertId
    console.log("Order created with ID:", orderId)

    // Create shipping address
    await executeQuery(
      `INSERT INTO order_addresses (
        order_id, type, first_name, last_name, company,
        address_line_1, address_line_2, city, state, 
        postal_code, country, phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        "shipping",
        shipping_address.first_name,
        shipping_address.last_name,
        shipping_address.company || null,
        shipping_address.address_line_1,
        shipping_address.address_line_2 || null,
        shipping_address.city,
        shipping_address.state,
        shipping_address.postal_code,
        shipping_address.country,
        shipping_address.phone || null,
      ],
      connection,
    )

    // Create billing address (use shipping if not provided)
    const billing = billing_address || shipping_address
    await executeQuery(
      `INSERT INTO order_addresses (
        order_id, type, first_name, last_name, company,
        address_line_1, address_line_2, city, state, 
        postal_code, country, phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        "billing",
        billing.first_name,
        billing.last_name,
        billing.company || null,
        billing.address_line_1,
        billing.address_line_2 || null,
        billing.city,
        billing.state,
        billing.postal_code,
        billing.country,
        billing.phone || null,
      ],
      connection,
    )

    console.log("Order addresses created")

    // Create order items and update stock
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const product = stockChecks[i][0]

      console.log("Processing item:", item)

      // Add order item with all required fields
      await executeQuery(
        `INSERT INTO order_items (
          order_id, product_id, quantity, unit_price, total_price,
          product_name, product_brand, product_reference, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          orderId,
          item.id,
          item.quantity,
          item.price,
          item.price * item.quantity,
          item.name,
          item.brand,
          product.reference_number || null,
        ],
        connection,
      )

      // Update product stock
      await executeQuery(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
        [item.quantity, item.id],
        connection,
      )
    }

    console.log("Order items created and stock updated")

    // Commit transaction
    await commitTransaction(connection)

    console.log("Transaction committed successfully")

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        order_number,
        total_amount,
        status: "pending",
        payment_status: "pending",
        currency,
        items_count: items.length,
      },
    })
  } catch (error) {
    console.error("Error creating order:", error)

    if (connection) {
      await rollbackTransaction(connection)
    }

    return NextResponse.json(
      {
        error: "Failed to create order. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
