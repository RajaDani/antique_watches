import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken, hasPermission, getAdminById, logAdminActivity } from "@/lib/admin-auth"
import { executeQuery } from "@/lib/database"
import type mysql from "mysql"

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
    if (!admin || !hasPermission(admin, "read")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""

    let whereClause = "WHERE 1=1"
    const params: any[] = []

    if (search) {
      whereClause += " AND (b.name LIKE ? OR b.country LIKE ?)"
      params.push(`%${search}%`, `%${search}%`)
    }

    const query = `
      SELECT 
        b.*,
        COUNT(p.id) as product_count
      FROM brands b
      LEFT JOIN products p ON b.id = p.brand_id AND p.is_active = TRUE
      ${whereClause}
      GROUP BY b.id
      ORDER BY b.name ASC
    `

    const brands = await executeQuery(query, params)

    return NextResponse.json({ brands })
  } catch (error) {
    console.error("Error fetching brands:", error)
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 })
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
    if (!admin || !hasPermission(admin, "write")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { name, description, logo_url, website_url, founded_year, country } = await request.json()

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const query = `
      INSERT INTO brands (name, slug, description, logo_url, website_url, founded_year, country)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `

    const result = (await executeQuery(query, [
      name,
      slug,
      description,
      logo_url,
      website_url,
      founded_year,
      country,
    ])) as mysql.ResultSetHeader

    // Log activity
    await logAdminActivity(admin.id, "create", "brand", result.insertId, { name, country })

    return NextResponse.json({ message: "Brand created successfully", id: result.insertId })
  } catch (error: any) {
    console.error("Error creating brand:", error)

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Brand name already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 })
  }
}
