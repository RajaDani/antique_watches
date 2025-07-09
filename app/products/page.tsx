"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Grid, List, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Watch {
  id: number
  name: string
  brand_name: string
  brand_slug: string
  price: number
  original_price: number
  primary_image: string
  year_manufactured: number
  condition_grade: string
  category_name: string
}

interface Brand {
  id: number
  name: string
  slug: string
}

interface Category {
  id: number
  name: string
  slug: string
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const brandFilter = searchParams.get("brand")

  const [watches, setWatches] = useState<Watch[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("featured")
  const [filterBrand, setFilterBrand] = useState(brandFilter || "all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch watches (with brand filter if specified)
        const watchesUrl = brandFilter ? `/api/watches?brand=${brandFilter}` : "/api/watches"
        const watchesResponse = await fetch(watchesUrl)
        const watchesData = await watchesResponse.json()
        setWatches(watchesData.watches || [])

        // Fetch brands
        const brandsResponse = await fetch("/api/brands")
        const brandsData = await brandsResponse.json()
        setBrands(brandsData.brands || [])

        // Fetch categories
        const categoriesResponse = await fetch("/api/categories")
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.categories || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [brandFilter])

  // Update filter when brand parameter changes
  useEffect(() => {
    if (brandFilter) {
      setFilterBrand(brandFilter)
    }
  }, [brandFilter])

  const filteredWatches = watches.filter((watch) => {
    const matchesSearch =
      watch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      watch.brand_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBrand = filterBrand === "all" || watch.brand_slug === filterBrand
    const matchesCategory = filterCategory === "all" || watch.category_name === filterCategory

    return matchesSearch && matchesBrand && matchesCategory
  })

  const sortedWatches = [...filteredWatches].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "year":
        return b.year_manufactured - a.year_manufactured
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading watches...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            {brandFilter
              ? `${brands.find((b) => b.slug === brandFilter)?.name || "Brand"} Watches`
              : "Antique Watch Collection"}
          </h1>
          <p className="text-gray-600 text-lg">
            Discover {watches.length} exceptional vintage timepieces
            {brandFilter && ` from ${brands.find((b) => b.slug === brandFilter)?.name}`}
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search watches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Brand</label>
              <Select value={filterBrand} onValueChange={setFilterBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.slug}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* View Toggle and Results */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {sortedWatches.length} of {watches.length} watches
          </p>

          <div className="flex items-center gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
          {sortedWatches.map((watch) => (
            <Card
              key={watch.id}
              className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-lg ${viewMode === "list" ? "flex flex-row" : ""
                }`}
            >
              <div
                className={`relative overflow-hidden ${viewMode === "list" ? "w-48 flex-shrink-0" : "rounded-t-lg"}`}
              >
                <Image
                  src={watch.primary_image || "/placeholder.svg?height=300&width=300"}
                  alt={watch.name}
                  width={300}
                  height={300}
                  className={`object-cover group-hover:scale-105 transition-transform duration-300 ${viewMode === "list" ? "w-full h-full" : "w-full h-64"
                    }`}
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-black/80 text-white">{watch.year_manufactured}</Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-500 text-white">{watch.condition_grade}</Badge>
                </div>
              </div>

              <CardContent
                className={`space-y-4 ${viewMode === "list" ? "flex-1 p-6 flex flex-col justify-between" : "p-6"}`}
              >
                <div>
                  <p className="text-sm text-gray-500 font-medium">{watch.brand_name}</p>
                  <h3 className="text-lg font-semibold line-clamp-2">{watch.name}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">(24)</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">${watch.price?.toLocaleString()}</span>
                    {watch.original_price && watch.original_price > watch.price && (
                      <span className="text-lg text-gray-500 line-through">
                        ${watch.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {watch.original_price && watch.original_price > watch.price && (
                    <p className="text-sm text-green-600 font-medium">
                      Save ${(watch.original_price - watch.price).toLocaleString()}
                    </p>
                  )}
                </div>

                <Button className="w-full bg-slate-900 hover:bg-slate-800">
                  <Link href={`/products/${watch.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedWatches.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No watches found matching your criteria.</p>
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={() => {
                setSearchQuery("")
                setFilterBrand("all")
                setFilterCategory("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
