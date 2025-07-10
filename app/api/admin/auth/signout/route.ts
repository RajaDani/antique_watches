import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { executeQuery } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-token")?.value

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any

        // Delete session
        await executeQuery("DELETE FROM admin_sessions WHERE token = ?", [token])

        // Log activity
        await executeQuery(
          "INSERT INTO admin_activity_logs (admin_id, action, resource_type, details, created_at) VALUES (?, ?, ?, ?, NOW())",
          [decoded.adminId, "signout", "auth", JSON.stringify({ ip: request.ip })],
        )
      } catch (error) {
        // Token might be invalid, but we still want to clear the cookie
        console.log("Token verification failed during signout:", error)
      }
    }

    const response = NextResponse.json({ message: "Signed out successfully" })

    // Clear cookie
    response.cookies.set("admin-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error("Admin signout error:", error)
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 })
  }
}
