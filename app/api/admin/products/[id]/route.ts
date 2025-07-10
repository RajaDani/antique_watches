import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken, hasPermission, getAdminById, logAdminActivity } from "@/lib/admin-auth"
import { executeQuery, executeTransaction } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const productId = Number.parseInt(params.id)
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    // Get product details
    const productQuery = `
      SELECT 
        p.*,
        b.name as brand_name,
        c.name as category_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `

    const products = await executeQuery(productQuery, [productId])
    if (products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get product images
    const images = await executeQuery(
      "SELECT image_url, is_primary, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order",
      [productId],
    )

    return NextResponse.json({
      product: { ...products[0], images },
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const productId = Number.parseInt(params.id)
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
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

    const queries = []

    // Update product
    const updateProductQuery = `
      UPDATE products SET 
        name = ?, slug = ?, description = ?, brand_id = ?, category_id = ?, 
        reference_number = ?, year_manufactured = ?, condition_grade = ?, 
        movement_type = ?, case_size = ?, case_material = ?, dial_color = ?, 
        bracelet_material = ?, water_resistance = ?, power_reserve = ?, 
        price = ?, original_price = ?, cost_price = ?, stock_quantity = ?, 
        weight = ?, dimensions = ?, provenance = ?, condition_details = ?, 
        is_featured = ?, updated_at = NOW()
      WHERE id = ?
    `

    queries.push({
      query: updateProductQuery,
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
        original_price,
        cost_price,
        stock_quantity,
        weight,
        dimensions,
        provenance,
        condition_details,
        is_featured || false,
        productId,
      ],
    })

    // Delete existing images
    queries.push({
      query: "DELETE FROM product_images WHERE product_id = ?",
      params: [productId],
    })

    // Insert new images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        queries.push({
          query: "INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)",
          params: [productId, images[i], i === 0, i],
        })
      }
    }

    await executeTransaction(queries)

    // Log activity
    await logAdminActivity(admin.id, "update", "product", productId, { name, price })

    return NextResponse.json({ message: "Product updated successfully" })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
    if (!admin || !hasPermission(admin, "delete")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const productId = Number.parseInt(params.id)
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    // Check if product exists
    const products = await executeQuery("SELECT name FROM products WHERE id = ?", [productId])
    if (products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const productName = products[0].name

    // Delete product and related data
    const queries = [
      { query: "DELETE FROM product_images WHERE product_id = ?", params: [productId] },
      { query: "DELETE FROM order_items WHERE product_id = ?", params: [productId] },
      { query: "DELETE FROM wishlist_items WHERE product_id = ?", params: [productId] },
      { query: "DELETE FROM products WHERE id = ?", params: [productId] },
    ]

    await executeTransaction(queries)

    // Log activity
    await logAdminActivity(admin.id, "delete", "product", productId, { name: productName })

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
