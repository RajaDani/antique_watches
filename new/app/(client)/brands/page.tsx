"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ExternalLink, Calendar, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Brand {
  id: number
  name: string
  slug: string
  description: string
  logo_url?: string
  website_url?: string
  founded_year?: number
  country?: string
  product_count?: number
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "founded" | "products">("name")

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch("/api/brands")
        const data = await response.json()
        setBrands(data.brands || [])
      } catch (error) {
        console.error("Error fetching brands:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  const filteredBrands = brands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.country?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Sort brands
  const sortedBrands = [...filteredBrands].sort((a, b) => {
    switch (sortBy) {
      case "founded":
        return (a.founded_year || 0) - (b.founded_year || 0)
      case "products":
        return (b.product_count || 0) - (a.product_count || 0)
      default:
        return a.name.localeCompare(b.name)
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading brands...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold">Luxury Watch Brands</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the world's most prestigious watchmakers and their exceptional heritage of craftsmanship,
            innovation, and timeless elegance.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search brands, countries, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant={sortBy === "name" ? "default" : "outline"} onClick={() => setSortBy("name")} size="sm">
                A-Z
              </Button>
              <Button
                variant={sortBy === "founded" ? "default" : "outline"}
                onClick={() => setSortBy("founded")}
                size="sm"
              >
                Founded
              </Button>
              <Button
                variant={sortBy === "products" ? "default" : "outline"}
                onClick={() => setSortBy("products")}
                size="sm"
              >
                Products
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-2xl font-bold text-slate-900">{sortedBrands.length}</div>
            <div className="text-sm text-gray-600">Premium Brands</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-2xl font-bold text-slate-900">
              {sortedBrands.reduce((sum, brand) => sum + (brand.product_count || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Watches</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-2xl font-bold text-slate-900">
              {sortedBrands.length > 0 ? Math.min(...sortedBrands.map((b) => b.founded_year || 2024)) : 0}
            </div>
            <div className="text-sm text-gray-600">Oldest Brand</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-2xl font-bold text-slate-900">
              {[...new Set(sortedBrands.map((b) => b.country).filter(Boolean))].length}
            </div>
            <div className="text-sm text-gray-600">Countries</div>
          </div>
        </div>

        {/* Brands Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedBrands.map((brand) => (
            <Card key={brand.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8 space-y-6">
                {/* Brand Logo */}
                <div className="text-center">
                  <div className="w-32 h-16 mx-auto mb-4 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Image
                      src={brand.logo_url || "/placeholder.svg?height=80&width=160"}
                      alt={`${brand.name} logo`}
                      width={160}
                      height={80}
                      className="max-w-full max-h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{brand.name}</h3>
                </div>

                {/* Brand Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                    {brand.founded_year && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{brand.founded_year}</span>
                      </div>
                    )}
                    {brand.country && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{brand.country}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 text-center leading-relaxed line-clamp-4">{brand.description}</p>
                </div>

                {/* Stats */}
                <div className="flex justify-center">
                  <Badge className="bg-slate-100 text-slate-900 px-4 py-2">
                    {brand.product_count || 0} Watches Available
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button className="flex-1 bg-slate-900 hover:bg-slate-800">
                    <Link href={`/products?brand=${brand.slug}`}>View Watches</Link>
                  </Button>
                  {brand.website_url && (
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <a href={brand.website_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedBrands.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No brands found matching your search criteria.</p>
            <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </div>
        )}

        {/* Heritage Section */}
        <section className="mt-20 bg-white rounded-2xl p-12 shadow-sm">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold">Swiss Watchmaking Heritage</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              For centuries, Swiss watchmakers have set the standard for precision, craftsmanship, and innovation. Our
              curated collection represents the finest examples from these legendary manufacturers, each piece telling a
              story of horological excellence and timeless design.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold">Rich Heritage</h3>
                <p className="text-gray-600">Centuries of watchmaking tradition and innovation</p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Expert Curation</h3>
                <p className="text-gray-600">Carefully selected pieces from authorized sources</p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <ExternalLink className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold">Authenticity</h3>
                <p className="text-gray-600">Every piece verified and guaranteed authentic</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
