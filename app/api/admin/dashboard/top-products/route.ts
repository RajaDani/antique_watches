import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/admin-auth"
import { executeQuery } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = verifyAdminToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const query = `
      SELECT 
        p.id,
        p.name,
        b.name as brand,
        COUNT(oi.id) as sales_count,
        SUM(oi.total_price) as revenue
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status = 'paid' OR o.payment_status IS NULL
      GROUP BY p.id, p.name, b.name
      ORDER BY revenue DESC, sales_count DESC
      LIMIT 5
    `

    const products = await executeQuery(query)

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching top products:", error)
    return NextResponse.json({ error: "Failed to fetch top products" }, { status: 500 })
  }
}
