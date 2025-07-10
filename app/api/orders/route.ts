import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { executeQuery } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const query = `
      SELECT 
        o.*,
        oi.product_name,
        oi.product_brand,
        oi.unit_price,
        oi.quantity,
        oi.total_price,
        pi.image_url as product_image
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `

    const results = await executeQuery(query, [decoded.userId])

    // Group order items by order
    const ordersMap = new Map()

    results.forEach((row: any) => {
      if (!ordersMap.has(row.id)) {
        ordersMap.set(row.id, {
          id: row.id,
          order_number: row.order_number,
          status: row.status,
          total_amount: row.total_amount,
          created_at: row.created_at,
          shipped_at: row.shipped_at,
          delivered_at: row.delivered_at,
          tracking_number: row.tracking_number,
          items: [],
        })
      }

      if (row.product_name) {
        ordersMap.get(row.id).items.push({
          product_name: row.product_name,
          product_brand: row.product_brand,
          unit_price: row.unit_price,
          quantity: row.quantity,
          total_price: row.total_price,
          product_image: row.product_image,
        })
      }
    })

    const orders = Array.from(ordersMap.values())
    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
