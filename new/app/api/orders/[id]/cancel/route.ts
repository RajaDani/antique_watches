import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { executeQuery, beginTransaction, commitTransaction, rollbackTransaction } from "@/lib/database"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  let connection: any = null

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

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    // Start transaction
    connection = await beginTransaction()

    // Check if order exists and belongs to user
    const order = await executeQuery(
      "SELECT id, user_id, status, order_number FROM orders WHERE id = ?",
      [orderId],
      connection,
    )

    if (order.length === 0) {
      await rollbackTransaction(connection)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order[0].user_id !== decoded.userId) {
      await rollbackTransaction(connection)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (!["pending", "processing"].includes(order[0].status)) {
      await rollbackTransaction(connection)
      return NextResponse.json(
        {
          error: "Order cannot be cancelled. Only pending or processing orders can be cancelled.",
        },
        { status: 400 },
      )
    }

    // Get order items to restore stock
    const orderItems = await executeQuery(
      "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
      [orderId],
      connection,
    )

    // Restore stock for each item
    for (const item of orderItems) {
      await executeQuery(
        "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?",
        [item.quantity, item.product_id],
        connection,
      )
    }

    // Update order status to cancelled
    await executeQuery("UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = ?", [orderId], connection)

    // Commit transaction
    await commitTransaction(connection)

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      restoredItems: orderItems.length,
      order_number: order[0].order_number,
    })
  } catch (error) {
    console.error("Error cancelling order:", error)

    if (connection) {
      await rollbackTransaction(connection)
    }

    return NextResponse.json(
      {
        error: "Failed to cancel order. Please try again.",
      },
      { status: 500 },
    )
  }
}
