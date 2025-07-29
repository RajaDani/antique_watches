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
    if (!admin || !hasPermission(admin, "manage_orders")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const orderId = Number.parseInt(params.id)
    const { status } = await request.json()

    // Update order status
    let updateQuery = "UPDATE orders SET status = ?"
    const updateParams = [status, orderId]

    // Set shipped_at if status is shipped
    if (status === "shipped") {
      updateQuery = "UPDATE orders SET status = ?, shipped_at = NOW()"
    }
    // Set delivered_at if status is delivered
    else if (status === "delivered") {
      updateQuery = "UPDATE orders SET status = ?, delivered_at = NOW()"
    }

    updateQuery += " WHERE id = ?"

    await executeQuery(updateQuery, updateParams)

    // Log activity
    await logAdminActivity(admin.id, "update_status", "order", orderId, { new_status: status })

    return NextResponse.json({ message: "Order status updated successfully" })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
  }
}
