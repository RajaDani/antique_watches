import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { executeQuery } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!token) {
      return NextResponse.json({ isWishlisted: false })
    }

    const decoded = verifyToken(token)
    if (!decoded || !productId) {
      return NextResponse.json({ isWishlisted: false })
    }

    const result = await executeQuery("SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?", [
      decoded.userId,
      productId,
    ])

    return NextResponse.json({ isWishlisted: result.length > 0 })
  } catch (error) {
    console.error("Error checking wishlist status:", error)
    return NextResponse.json({ isWishlisted: false })
  }
}
