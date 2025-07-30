import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken, getAdminById } from "@/lib/admin-auth"
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
        if (!admin?.id || (admin.role !== "admin" && admin.role !== "super_admin")) {
            return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const search = searchParams.get("search") || ""
        const status = searchParams.get("status") || "all"
        const page = Number.parseInt(searchParams.get("page") || "1")
        const limit = Number.parseInt(searchParams.get("limit") || "10")
        const offset = (page - 1) * limit

        let whereClause = "WHERE is_active=1"
        const params: any[] = []

        if (search) {
            whereClause += " AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)"
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
        }

        if (status !== "all") {
            whereClause += " AND is_active = ?"
            params.push(status === "active" ? 1 : 0)
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`
        const countResult = await executeQuery(countQuery, params)
        const total = countResult[0]?.total || 0

        // Get customers with pagination
        const query = `
        SELECT 
          id, email, first_name, last_name, phone, is_active, created_at, updated_at,
          (SELECT COUNT(*) FROM orders WHERE user_id = users.id) as total_orders,
          (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE user_id = users.id AND status = 'completed') as total_spent
        FROM users 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `

        const customers = await executeQuery(query, params)

        return NextResponse.json({
            customers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error("Error fetching customers:", error)
        return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
    }
}
