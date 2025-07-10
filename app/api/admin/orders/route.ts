import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken, hasPermission, getAdminById } from "@/lib/admin-auth"
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

    const admin = await getAdminById(decoded.adminId)
    if (!admin || !hasPermission(admin, "manage_orders")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const limit = 20
    const offset = (page - 1) * limit

    let whereClause = "WHERE 1=1"
    const params: any[] = []

    if (search) {
      whereClause += " AND (o.order_number LIKE ? OR CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR u.email LIKE ?)"
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (status !== "all") {
      whereClause += " AND o.status = ?"
      params.push(status)
    }

    const query = `
      SELECT 
        o.*,
        CONCAT(u.first_name, ' ', u.last_name) as customer_name,
        u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `

    const countQuery = `
      SELECT COUNT(*) as total
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
    `

    const orders = await executeQuery(query, [...params, limit, offset])
    const countResult = (await executeQuery(countQuery, params)) as any[]
    const total = countResult[0].total
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({ orders, totalPages, currentPage: page })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
