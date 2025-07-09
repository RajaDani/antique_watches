import { type NextRequest, NextResponse } from "next/server"
import { getAllWatches, getWatchesByBrand } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brand = searchParams.get("brand")

    let watches
    if (brand) {
      watches = await getWatchesByBrand(brand)
    } else {
      watches = await getAllWatches()
    }

    return NextResponse.json({ watches })
  } catch (error) {
    console.error("Error fetching watches:", error)
    return NextResponse.json({ error: "Failed to fetch watches" }, { status: 500 })
  }
}
