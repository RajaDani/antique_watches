import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { executeQuery } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Fetch user profile data
    const user = await executeQuery(
      "SELECT id, email, first_name, last_name, phone, profile_image, created_at FROM users WHERE id = ?",
      [decoded.userId],
    )

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: user[0] })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { first_name, last_name, email, phone } = await request.json()

    if (!first_name || !last_name || !email) {
      return NextResponse.json({ error: "First name, last name, and email are required" }, { status: 400 })
    }

    // Check if email is already taken by another user
    const existingUser = await executeQuery("SELECT id FROM users WHERE email = ? AND id != ?", [email, decoded.userId])

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email is already taken" }, { status: 400 })
    }

    // Update user profile
    await executeQuery(
      "UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [first_name, last_name, email, phone || null, decoded.userId],
    )

    // Fetch updated user data
    const updatedUser = await executeQuery(
      "SELECT id, email, first_name, last_name, phone, profile_image, created_at FROM users WHERE id = ?",
      [decoded.userId],
    )

    return NextResponse.json({ user: updatedUser[0] })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
