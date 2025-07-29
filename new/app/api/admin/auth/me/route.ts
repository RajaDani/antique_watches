import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { executeQuery } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)

    if (!decoded?.adminId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get admin user
    const users = await executeQuery(
      "SELECT id, first_name, last_name, email, role, is_active, created_at, last_login FROM admin_users WHERE id = ? AND is_active = TRUE",
      [decoded.adminId],
    )

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: users[0] })
  } catch (error) {
    console.error("Admin me error:", error)
    return NextResponse.json({ error: "Failed to get user info" }, { status: 500 })
  }
}
