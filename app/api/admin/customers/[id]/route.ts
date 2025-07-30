import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken, getAdminById, logAdminActivity } from "@/lib/admin-auth"
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
        if (!admin?.id) {
            return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
        }

        const customerId = Number.parseInt(params.id)

        if (isNaN(customerId)) {
            return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 })
        }

        // Get customer details
        const customerQuery = `
      SELECT 
        id, email, first_name, last_name, phone, date_of_birth, 
        profile_image, is_active, email_verified, created_at, 
        updated_at, last_login
      FROM users 
      WHERE id = ?
    `
        const customers = await executeQuery(customerQuery, [customerId])
        const customer = customers[0]

        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 })
        }

        // Get customer orders
        const ordersQuery = `
      SELECT 
        id, order_number, status, total_amount, 
        created_at, updated_at
      FROM orders 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `
        const orders = await executeQuery(ordersQuery, [customerId])

        // Get customer stats
        const statsQuery = `
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) as total_spent,
        COALESCE(AVG(CASE WHEN status = 'completed' THEN total_amount ELSE NULL END), 0) as avg_order_value
      FROM orders 
      WHERE user_id = ?
    `
        const stats = await executeQuery(statsQuery, [customerId])

        return NextResponse.json({
            customer,
            orders,
            stats: stats[0] || { total_orders: 0, total_spent: 0, avg_order_value: 0 },
        })
    } catch (error) {
        console.error("Error fetching customer:", error)
        return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 })
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
        if (!admin?.id || (admin.role !== "admin" && admin.role !== "super_admin")) {
            return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
        }

        const customerId = Number.parseInt(params.id)

        if (isNaN(customerId)) {
            return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 })
        }

        const body = await request.json()
        const { email, first_name, last_name, phone, date_of_birth, profile_image, is_active, email_verified } = body

        // Validate required fields
        if (!email || !first_name || !last_name) {
            return NextResponse.json({ error: "Email, first name, and last name are required" }, { status: 400 })
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
        }

        // Check if email is already taken by another user
        const emailCheckResult = await executeQuery("SELECT id FROM users WHERE email = ? AND id != ?", [email, customerId])

        if (emailCheckResult.length > 0) {
            return NextResponse.json({ error: "Email is already taken by another customer" }, { status: 400 })
        }

        // Update customer
        const updateQuery = `
      UPDATE users 
      SET email = ?, first_name = ?, last_name = ?, phone = ?, 
          date_of_birth = ?, profile_image = ?, is_active = ?, 
          email_verified = ?, updated_at = NOW()
      WHERE id = ?
    `

        await executeQuery(updateQuery, [
            email,
            first_name,
            last_name,
            phone || null,
            date_of_birth || null,
            profile_image || null,
            is_active ? 1 : 0,
            email_verified ? 1 : 0,
            customerId,
        ])

        // Log activity
        await logAdminActivity(admin.id, "update", "customer", customerId, {
            email,
            first_name,
            last_name,
            phone,
            is_active,
            email_verified,
        })

        // Get updated customer data
        const updatedCustomerResult = await executeQuery(
            `SELECT id, email, first_name, last_name, phone, date_of_birth, profile_image, 
              is_active, email_verified, created_at, updated_at, last_login
       FROM users 
       WHERE id = ?`,
            [customerId],
        )

        return NextResponse.json({
            message: "Customer updated successfully",
            customer: updatedCustomerResult[0],
        })
    } catch (error: any) {
        console.error("Error updating customer:", error)

        if (error.code === "ER_DUP_ENTRY") {
            return NextResponse.json({ error: "Email already exists" }, { status: 409 })
        }

        return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
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
        if (!admin?.id || admin.role !== "super_admin") {
            return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
        }

        const customerId = Number.parseInt(params.id)

        if (isNaN(customerId)) {
            return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 })
        }

        // Check if customer has orders
        const ordersCheck = await executeQuery("SELECT COUNT(*) as count FROM orders WHERE user_id = ?", [customerId])

        if (ordersCheck[0]?.count > 0) {
            return NextResponse.json(
                {
                    error: "Cannot delete customer with existing orders. Deactivate instead.",
                },
                { status: 400 },
            )
        }

        // Delete customer
        await executeQuery("DELETE FROM users WHERE id = ?", [customerId])

        // Log activity
        await logAdminActivity(admin.id, "delete", "customer", customerId)

        return NextResponse.json({ message: "Customer deleted successfully" })
    } catch (error) {
        console.error("Error deleting customer:", error)
        return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
    }
}
