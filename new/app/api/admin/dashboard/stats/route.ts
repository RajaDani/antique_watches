import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/admin-auth"
import { executeQuery } from "@/lib/database"

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

    // Get current month stats
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear

    // Total Revenue
    const revenueQuery = `
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN MONTH(created_at) = ? AND YEAR(created_at) = ? THEN total_amount ELSE 0 END), 0) as current_month_revenue,
        COALESCE(SUM(CASE WHEN MONTH(created_at) = ? AND YEAR(created_at) = ? THEN total_amount ELSE 0 END), 0) as last_month_revenue
      FROM orders 
      WHERE payment_status = 'paid'
    `
    const revenueResult = (await executeQuery(revenueQuery, [
      currentMonth,
      currentYear,
      lastMonth,
      lastMonthYear,
    ])) as any[]
    const revenueData = revenueResult[0]

    // Total Orders
    const ordersQuery = `
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN MONTH(created_at) = ? AND YEAR(created_at) = ? THEN 1 ELSE 0 END) as current_month_orders,
        SUM(CASE WHEN MONTH(created_at) = ? AND YEAR(created_at) = ? THEN 1 ELSE 0 END) as last_month_orders
      FROM orders
    `
    const ordersResult = (await executeQuery(ordersQuery, [
      currentMonth,
      currentYear,
      lastMonth,
      lastMonthYear,
    ])) as any[]
    const ordersData = ordersResult[0]

    // Total Customers
    const customersQuery = `
      SELECT 
        COUNT(*) as total_customers,
        SUM(CASE WHEN MONTH(created_at) = ? AND YEAR(created_at) = ? THEN 1 ELSE 0 END) as current_month_customers,
        SUM(CASE WHEN MONTH(created_at) = ? AND YEAR(created_at) = ? THEN 1 ELSE 0 END) as last_month_customers
      FROM users 
      WHERE is_active = TRUE
    `
    const customersResult = (await executeQuery(customersQuery, [
      currentMonth,
      currentYear,
      lastMonth,
      lastMonthYear,
    ])) as any[]
    const customersData = customersResult[0]

    // Total Products
    const productsQuery = `
      SELECT 
        COUNT(*) as total_products,
        SUM(CASE WHEN MONTH(created_at) = ? AND YEAR(created_at) = ? THEN 1 ELSE 0 END) as current_month_products,
        SUM(CASE WHEN MONTH(created_at) = ? AND YEAR(created_at) = ? THEN 1 ELSE 0 END) as last_month_products
      FROM products 
      WHERE is_active = TRUE
    `
    const productsResult = (await executeQuery(productsQuery, [
      currentMonth,
      currentYear,
      lastMonth,
      lastMonthYear,
    ])) as any[]
    const productsData = productsResult[0]

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    const stats = {
      totalRevenue: Number(revenueData.total_revenue) || 0,
      totalOrders: Number(ordersData.total_orders) || 0,
      totalCustomers: Number(customersData.total_customers) || 0,
      totalProducts: Number(productsData.total_products) || 0,
      revenueGrowth: calculateGrowth(
        Number(revenueData.current_month_revenue) || 0,
        Number(revenueData.last_month_revenue) || 0,
      ),
      ordersGrowth: calculateGrowth(
        Number(ordersData.current_month_orders) || 0,
        Number(ordersData.last_month_orders) || 0,
      ),
      customersGrowth: calculateGrowth(
        Number(customersData.current_month_customers) || 0,
        Number(customersData.last_month_customers) || 0,
      ),
      productsGrowth: calculateGrowth(
        Number(productsData.current_month_products) || 0,
        Number(productsData.last_month_products) || 0,
      ),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
