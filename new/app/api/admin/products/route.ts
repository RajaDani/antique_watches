import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken, hasPermission, getAdminById, logAdminActivity } from "@/lib/admin-auth"
import { executeQuery, executeTransaction } from "@/lib/database"

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
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"

    const offset = (page - 1) * limit

    // Build WHERE clause
    let whereClause = "WHERE 1=1"
    const params: any[] = []

    if (search) {
      whereClause += " AND (p.name LIKE ? OR b.name LIKE ? OR p.reference_number LIKE ?)"
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (status !== "all") {
      whereClause += " AND p.is_active = ?"
      params.push(status === "active")
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause}
    `
    const countResult = await executeQuery(countQuery, params)
    const total = countResult[0].total

    // Get products
    const productsQuery = `
      SELECT 
        p.*,
        b.name as brand_name,
        c.name as category_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
    `

    const products = await executeQuery(productsQuery)

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
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

    // Validate required fields
    if (!name || !brand_id || !category_id || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const queries = []

    // Insert product
    const insertProductQuery = `
      INSERT INTO products (
        name, slug, description, brand_id, category_id, reference_number,
        year_manufactured, condition_grade, movement_type, case_size,
        case_material, dial_color, bracelet_material, water_resistance,
        power_reserve, price, original_price, cost_price, stock_quantity,
        weight, dimensions, provenance, condition_details, is_featured,
        is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
    `

    queries.push({
      query: insertProductQuery,
      params: [
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
        original_price || 0,
        cost_price || 0,
        stock_quantity,
        weight,
        dimensions,
        provenance,
        condition_details,
        is_featured || false,
      ],
    })

    const results = await executeTransaction(queries)
    const productId = results[0].insertId

    // Insert images
    if (images && images.length > 0) {
      const imageQueries = images.map((image: string, index: number) => ({
        query: "INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)",
        params: [productId, image, index === 0, index],
      }))

      await executeTransaction(imageQueries)
    }

    // Log activity
    await logAdminActivity(admin.id, "create", "product", productId, { name, price })

    return NextResponse.json({ message: "Product created successfully", id: productId })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
