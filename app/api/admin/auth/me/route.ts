import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken, getAdminById } from "@/lib/admin-auth"

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

    const admin = await getAdminById(decoded.adminId)
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    return NextResponse.json({ admin })
  } catch (error) {
    console.error("Admin auth check error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
  }
}
