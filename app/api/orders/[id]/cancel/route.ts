import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { executeQuery } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const orderId = Number.parseInt(params.id)

    // Check if order exists and belongs to user
    const orderQuery = "SELECT * FROM orders WHERE id = ? AND user_id = ?"
    const orderResults = await executeQuery(orderQuery, [orderId, decoded.userId])

    if (orderResults.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orderResults[0]

    // Check if order can be cancelled
    if (order.status === "delivered" || order.status === "cancelled") {
      return NextResponse.json({ error: "Order cannot be cancelled" }, { status: 400 })
    }

    // Update order status
    const updateQuery = "UPDATE orders SET status = 'cancelled' WHERE id = ?"
    await executeQuery(updateQuery, [orderId])

    return NextResponse.json({ message: "Order cancelled successfully" })
  } catch (error) {
    console.error("Error cancelling order:", error)
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
  }
}
