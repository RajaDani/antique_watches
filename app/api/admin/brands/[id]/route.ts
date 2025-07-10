import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken, hasPermission, getAdminById, logAdminActivity } from "@/lib/admin-auth"
import { executeQuery } from "@/lib/database"

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

    const brandId = Number.parseInt(params.id)
    if (isNaN(brandId)) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 })
    }

    const brands = await executeQuery("SELECT * FROM brands WHERE id = ?", [brandId])
    if (brands.length === 0) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    return NextResponse.json({ brand: brands[0] })
  } catch (error) {
    console.error("Error fetching brand:", error)
    return NextResponse.json({ error: "Failed to fetch brand" }, { status: 500 })
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

    const brandId = Number.parseInt(params.id)
    if (isNaN(brandId)) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 })
    }

    const { name, description, logo_url, website_url, founded_year, country } = await request.json()

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    await executeQuery(
      `UPDATE brands SET 
        name = ?, slug = ?, description = ?, logo_url = ?, 
        website_url = ?, founded_year = ?, country = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, slug, description, logo_url, website_url, founded_year, country, brandId],
    )

    // Log activity
    await logAdminActivity(admin.id, "update", "brand", brandId, { name, country })

    return NextResponse.json({ message: "Brand updated successfully" })
  } catch (error: any) {
    console.error("Error updating brand:", error)

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Brand name already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 })
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

    const brandId = Number.parseInt(params.id)
    if (isNaN(brandId)) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 })
    }

    // Check if brand has products
    const products = await executeQuery("SELECT COUNT(*) as count FROM products WHERE brand_id = ?", [brandId])
    if (products[0].count > 0) {
      return NextResponse.json({ error: "Cannot delete brand with existing products" }, { status: 400 })
    }

    // Get brand name for logging
    const brands = await executeQuery("SELECT name FROM brands WHERE id = ?", [brandId])
    if (brands.length === 0) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    const brandName = brands[0].name

    await executeQuery("DELETE FROM brands WHERE id = ?", [brandId])

    // Log activity
    await logAdminActivity(admin.id, "delete", "brand", brandId, { name: brandName })

    return NextResponse.json({ message: "Brand deleted successfully" })
  } catch (error) {
    console.error("Error deleting brand:", error)
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 })
  }
}
