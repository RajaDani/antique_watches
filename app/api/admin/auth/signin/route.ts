import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { executeQuery } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find admin user
    const users = await executeQuery("SELECT * FROM admin_users WHERE email = ? AND is_active = TRUE", [email])

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Update last login
    await executeQuery("UPDATE admin_users SET last_login = NOW() WHERE id = ?", [user.id])

    // Create JWT token
    const token = jwt.sign({ adminId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "8h",
    })
    // Create session record
    await executeQuery(
      "INSERT INTO admin_sessions (admin_id, token, expires_at, created_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 8 HOUR), NOW())",
      [user.id, token],
    )

    // Log activity
    await executeQuery(
      "INSERT INTO admin_activity_logs (admin_id, action, resource_type, details, created_at) VALUES (?, ?, ?, ?, NOW())",
      [user.id, "signin", "auth", JSON.stringify({ ip: request.ip })],
    )

    // Set HTTP-only cookie
    const response = NextResponse.json({
      message: "Signed in successfully",
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    })

    response.cookies.set("admin-token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60, // 8 hours
    })

    return response
  } catch (error) {
    console.error("Admin signin error:", error)
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 })
  }
}
