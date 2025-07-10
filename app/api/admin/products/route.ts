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
    const page = Number.parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const limit = 20
    const offset = (page - 1) * limit

    let whereClause = "WHERE 1=1"
    const params: any[] = []

    if (search) {
      whereClause += " AND (p.name LIKE ? OR b.name LIKE ?)"
      params.push(`%${search}%`, `%${search}%`)
    }

    if (status !== "all") {
      whereClause += " AND p.is_active = ?"
      params.push(status === "active")
    }

    const query = `
      SELECT 
        p.*,
        b.name as brand_name,
        pi.image_url as primary_image
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `

    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause}
    `

    const products = await executeQuery(query, [...params, limit, offset])
    const countResult = (await executeQuery(countQuery, params)) as any[]
    const total = countResult[0].total
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({ products, totalPages, currentPage: page })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    if (!admin || !hasPermission(admin, "write")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      description,
      brand_id,
      category_id,
      reference_number,
      year_manufactured,
      condition_grade,
      movement_type,
      case_size,
      case_material,
      dial_color,
      bracelet_material,
      water_resistance,
      power_reserve,
      price,
      original_price,
      cost_price,
      stock_quantity,
      weight,
      dimensions,
      provenance,
      condition_details,
      is_featured,
      images,
    } = body

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Insert product
    const productQuery = `
      INSERT INTO products (
        name, slug, description, brand_id, category_id, reference_number,
        year_manufactured, condition_grade, movement_type, case_size,
        case_material, dial_color, bracelet_material, water_resistance,
        power_reserve, price, original_price, cost_price, stock_quantity,
        weight, dimensions, provenance, condition_details, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const result = (await executeQuery(productQuery, [
      name,
      slug,
      description,
      brand_id,
      category_id,
      reference_number,
      year_manufactured,
      condition_grade,
      movement_type,
      case_size,
      case_material,
      dial_color,
      bracelet_material,
      water_resistance,
      power_reserve,
      price,
      original_price,
      cost_price,
      stock_quantity,
      weight,
      dimensions,
      provenance,
      condition_details,
      is_featured || false,
    ])) as mysql.ResultSetHeader

    const productId = result.insertId

    // Insert images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await executeQuery(
          "INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)",
          [productId, images[i], i === 0, i],
        )
      }
    }

    // Log activity
    await logAdminActivity(admin.id, "create", "product", productId, { name, brand_id, price })

    return NextResponse.json({ message: "Product created successfully", id: productId })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
