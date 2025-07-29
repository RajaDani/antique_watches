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

    const query = `
      SELECT 
        w.*,
        p.name as product_name,
        p.price,
        p.year_manufactured,
        p.condition_grade,
        b.name as brand_name,
        pi.image_url as product_image
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      JOIN brands b ON p.brand_id = b.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `

    const wishlistItems = await executeQuery(query, [decoded.userId])
    return NextResponse.json({ wishlist: wishlistItems })
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { product_id } = await request.json()

    if (!product_id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Check if product exists
    const productExists = await executeQuery("SELECT id FROM products WHERE id = ? AND is_active = TRUE", [product_id])

    if (productExists.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if already in wishlist
    const existingItem = await executeQuery("SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?", [
      decoded.userId,
      product_id,
    ])

    if (existingItem.length > 0) {
      return NextResponse.json({ error: "Product already in wishlist" }, { status: 400 })
    }

    // Add to wishlist
    await executeQuery("INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)", [decoded.userId, product_id])

    return NextResponse.json({ message: "Product added to wishlist" })
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Remove from wishlist
    const result = await executeQuery("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?", [
      decoded.userId,
      productId,
    ])

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Product not found in wishlist" }, { status: 404 })
    }

    return NextResponse.json({ message: "Product removed from wishlist" })
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 })
  }
}
