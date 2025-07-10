import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken, hasPermission, getAdminById, logAdminActivity } from "@/lib/admin-auth"
import { executeQuery } from "@/lib/database"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { is_active } = await request.json()

    await executeQuery("UPDATE products SET is_active = ? WHERE id = ?", [is_active, productId])

    // Log activity
    await logAdminActivity(admin.id, "toggle_status", "product", productId, { is_active })

    return NextResponse.json({ message: "Product status updated successfully" })
  } catch (error) {
    console.error("Error toggling product status:", error)
    return NextResponse.json({ error: "Failed to update product status" }, { status: 500 })
  }
}
