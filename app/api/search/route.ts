import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const q = searchParams.get("q")

        if (!q || q.trim().length < 2) {
            return NextResponse.json({ watches: [] })
        }

        const searchQuery = `%${q.trim()}%`

        const query = `
    SELECT 
  p.id,
  p.name,
  p.price,
  b.name AS brand_name,
  b.slug AS brand_slug,
  GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order) AS image_urls
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN product_images pi ON pi.product_id = p.id
WHERE p.is_active = 1 
  AND (p.name LIKE ? OR b.name LIKE ?)
GROUP BY p.id
ORDER BY p.name ASC
LIMIT 100
    `

        const watches = await executeQuery(query, [searchQuery, searchQuery])
        console.log(watches, "watcheswatches")
        const transformed = watches.map((product: any) => ({
            ...product,
            image_urls: product.image_urls ? product.image_urls.split(',') : [],
        }));

        return NextResponse.json({ watches: transformed })
    } catch (error) {
        console.error("Search error:", error)
        return NextResponse.json({ error: "Search failed" }, { status: 500 })
    }
}
