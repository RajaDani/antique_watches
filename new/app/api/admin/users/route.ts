import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken, getAdminById, createAdmin, logAdminActivity } from "@/lib/admin-auth"
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
    console.log("adminUSER", admin)
    if (!admin?.id || (admin.role !== "admin" && admin.role !== "super_admin")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || "all"

    let whereClause = "WHERE 1=1"
    const params: any[] = []

    if (search) {
      whereClause += " AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)"
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (role !== "all") {
      whereClause += " AND role = ?"
      params.push(role)
    }

    const query = `
      SELECT id, email, first_name, last_name, role, is_active, created_at, last_login
      FROM admin_users
      ${whereClause}
      ORDER BY created_at DESC
    `

    const users = await executeQuery(query, params)

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return NextResponse.json({ error: "Failed to fetch admin users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = verifyAdminToken(token)
    if (!decoded?.adminId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const admin = await getAdminById(decoded.adminId)
    if (!admin?.id || (admin.role !== "admin" && admin.role !== "super_admin")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { email, password, first_name, last_name, role } = await request.json()

    // Create admin user
    const newAdmin = await createAdmin({
      email,
      password,
      first_name,
      last_name,
      role,
      created_by: admin.id,
    })

    console.log("newAdmin", newAdmin)

    // Log activity
    await logAdminActivity(admin.id, "create", "admin_user", newAdmin.id, { email, role })

    return NextResponse.json({ message: "Admin user created successfully", user: newAdmin })
  } catch (error: any) {
    console.error("Error creating admin user:", error)

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 })
  }
}
