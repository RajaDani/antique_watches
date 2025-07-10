import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { executeQuery } from "@/lib/database"
import type mysql from "mysql2"

export async function POST(request: NextRequest) {
  try {
    const { first_name, last_name, email, password, role } = await request.json()

    // Validation
    if (!first_name || !last_name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    const validRoles = ["super_admin", "admin", "editor", "viewer"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await executeQuery("SELECT id FROM admin_users WHERE email = ?", [email])
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user
    const result = (await executeQuery(
      `INSERT INTO admin_users (first_name, last_name, email, password, role, is_active, created_at) 
       VALUES (?, ?, ?, ?, ?, TRUE, NOW())`,
      [first_name, last_name, email, hashedPassword, role],
    )) as mysql.ResultSetHeader

    return NextResponse.json({
      message: "Admin account created successfully",
      user: {
        id: result.insertId,
        first_name,
        last_name,
        email,
        role,
      },
    })
  } catch (error) {
    console.error("Admin signup error:", error)
    return NextResponse.json({ error: "Failed to create admin account" }, { status: 500 })
  }
}
