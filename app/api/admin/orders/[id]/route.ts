import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken, hasPermission, getAdminById } from "@/lib/admin-auth"
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

        const orderId = params.id

        // Get order details with correct column names from schema
        const orderQuery = `
      SELECT 
        o.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `
        const orderResult = await executeQuery(orderQuery, [orderId])

        if (orderResult.length === 0) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        const order = orderResult[0]

        // Get order items with product details
        const itemsQuery = `
      SELECT 
        oi.*,
        p.name as product_name,
        p.slug as product_slug,
        b.name as brand_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE oi.order_id = ?
      ORDER BY oi.id
    `
        const items = await executeQuery(itemsQuery, [orderId])

        // Get order addresses (billing and shipping)
        const addressesQuery = `
      SELECT *
      FROM order_addresses
      WHERE order_id = ?
      ORDER BY type
    `
        const addresses = await executeQuery(addressesQuery, [orderId])

        // Separate billing and shipping addresses
        const billingAddress = addresses.find((addr) => addr.type === "billing")
        const shippingAddress = addresses.find((addr) => addr.type === "shipping")

        return NextResponse.json({
            order: {
                ...order,
                customer_name: `${order.first_name || ""} ${order.last_name || ""}`.trim(),
                items,
                billing_address: billingAddress,
                shipping_address: shippingAddress,
            },
        })
    } catch (error) {
        console.error("Error fetching order:", error)
        return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
    }
}

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

        const orderId = params.id
        const body = await request.json()

        const {
            status,
            payment_status,
            tracking_number,
            shipping_method,
            shipping_amount,
            notes,
            shipped_at,
            delivered_at,
        } = body

        // Build update query dynamically
        const updateFields = []
        const updateValues = []

        if (status !== undefined) {
            updateFields.push("status = ?")
            updateValues.push(status)
        }
        if (payment_status !== undefined) {
            updateFields.push("payment_status = ?")
            updateValues.push(payment_status)
        }
        if (tracking_number !== undefined) {
            updateFields.push("tracking_number = ?")
            updateValues.push(tracking_number)
        }
        if (shipping_method !== undefined) {
            updateFields.push("shipping_method = ?")
            updateValues.push(shipping_method)
        }
        if (shipping_amount !== undefined) {
            updateFields.push("shipping_amount = ?")
            updateValues.push(shipping_amount)

            // Recalculate total_amount when shipping changes
            const currentOrderQuery = "SELECT subtotal, tax_amount, discount_amount FROM orders WHERE id = ?"
            const currentOrder = await executeQuery(currentOrderQuery, [orderId])
            if (currentOrder.length > 0) {
                const { subtotal, tax_amount, discount_amount } = currentOrder[0]
                const newTotal =
                    Number.parseFloat(subtotal) +
                    Number.parseFloat(tax_amount) +
                    Number.parseFloat(shipping_amount) -
                    Number.parseFloat(discount_amount)
                updateFields.push("total_amount = ?")
                updateValues.push(newTotal)
            }
        }
        if (notes !== undefined) {
            updateFields.push("notes = ?")
            updateValues.push(notes)
        }
        if (shipped_at !== undefined) {
            updateFields.push("shipped_at = ?")
            updateValues.push(shipped_at)
        }
        if (delivered_at !== undefined) {
            updateFields.push("delivered_at = ?")
            updateValues.push(delivered_at)
        }

        if (updateFields.length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 })
        }

        updateFields.push("updated_at = NOW()")
        updateValues.push(orderId)

        const updateQuery = `
      UPDATE orders 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `

        await executeQuery(updateQuery, updateValues)

        return NextResponse.json({ message: "Order updated successfully" })
    } catch (error) {
        console.error("Error updating order:", error)
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }
}
