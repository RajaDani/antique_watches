"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"

interface Brand {
  id: number
  name: string
}

interface Category {
  id: number
  name: string
}

export default function AddProductPage() {
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [images, setImages] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand_id: "",
    category_id: "",
    reference_number: "",
    year_manufactured: "",
    condition_grade: "",
    movement_type: "",
    case_size: "",
    case_material: "",
    dial_color: "",
    bracelet_material: "",
    water_resistance: "",
    power_reserve: "",
    price: "",
    original_price: "",
    cost_price: "",
    stock_quantity: "1",
    weight: "",
    dimensions: "",
    provenance: "",
    condition_details: "",
    is_featured: false,
  })

  useEffect(() => {
    fetchBrands()
    fetchCategories()
  }, [])

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/admin/brands")
      if (response.ok) {
        const data = await response.json()
        setBrands(data.brands || [])
      }
    } catch (error) {
      console.error("Error fetching brands:", error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          images,
          brand_id: Number(formData.brand_id),
          category_id: Number(formData.category_id),
          year_manufactured: Number(formData.year_manufactured),
          price: Number(formData.price),
          original_price: formData.original_price ? Number(formData.original_price) : null,
          cost_price: formData.cost_price ? Number(formData.cost_price) : null,
          stock_quantity: Number(formData.stock_quantity),
          weight: formData.weight ? Number(formData.weight) : null,
        }),
      })

      if (response.ok) {
        router.push("/admin/products")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create product")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const addImageUrl = () => {
    const url = prompt("Enter image URL:")
    if (url) {
      setImages([...images, url])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600">Create a new watch listing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Submariner Date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Reference Number</label>
                <Input
                  value={formData.reference_number}
                  onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                  placeholder="e.g., 5513"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the watch..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Brand *</label>
                <Select
                  value={formData.brand_id}
                  onValueChange={(value) => setFormData({ ...formData, brand_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Watch Specifications */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Watch Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Year Manufactured</label>
                <Input
                  type="number"
                  value={formData.year_manufactured}
                  onChange={(e) => setFormData({ ...formData, year_manufactured: e.target.value })}
                  placeholder="1965"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Condition Grade *</label>
                <Select
                  value={formData.condition_grade}
                  onValueChange={(value) => setFormData({ ...formData, condition_grade: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mint">Mint</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Very Good">Very Good</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Movement Type *</label>
                <Select
                  value={formData.movement_type}
                  onValueChange={(value) => setFormData({ ...formData, movement_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select movement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Quartz">Quartz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Case Size</label>
                <Input
                  value={formData.case_size}
                  onChange={(e) => setFormData({ ...formData, case_size: e.target.value })}
                  placeholder="40mm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Case Material</label>
                <Input
                  value={formData.case_material}
                  onChange={(e) => setFormData({ ...formData, case_material: e.target.value })}
                  placeholder="Stainless Steel"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Dial Color</label>
                <Input
                  value={formData.dial_color}
                  onChange={(e) => setFormData({ ...formData, dial_color: e.target.value })}
                  placeholder="Black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bracelet Material</label>
                <Input
                  value={formData.bracelet_material}
                  onChange={(e) => setFormData({ ...formData, bracelet_material: e.target.value })}
                  placeholder="Stainless Steel"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Water Resistance</label>
                <Input
                  value={formData.water_resistance}
                  onChange={(e) => setFormData({ ...formData, water_resistance: e.target.value })}
                  placeholder="200m"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Power Reserve</label>
                <Input
                  value={formData.power_reserve}
                  onChange={(e) => setFormData({ ...formData, power_reserve: e.target.value })}
                  placeholder="48 hours"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Inventory */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price *</label>
                <Input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="15000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Original Price</label>
                <Input
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  placeholder="18000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cost Price</label>
                <Input
                  type="number"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  placeholder="12000"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Stock Quantity *</label>
                <Input
                  type="number"
                  required
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Weight (grams)</label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="150"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button type="button" onClick={addImageUrl} variant="outline" className="bg-transparent">
              <Upload className="w-4 h-4 mr-2" />
              Add Image URL
            </Button>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      onClick={() => removeImage(index)}
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Provenance</label>
              <Textarea
                rows={3}
                value={formData.provenance}
                onChange={(e) => setFormData({ ...formData, provenance: e.target.value })}
                placeholder="History and origin of the watch..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Condition Details</label>
              <Textarea
                rows={3}
                value={formData.condition_details}
                onChange={(e) => setFormData({ ...formData, condition_details: e.target.value })}
                placeholder="Detailed condition description..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              />
              <label htmlFor="is_featured" className="text-sm font-medium">
                Featured Product
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="bg-slate-900 hover:bg-slate-800">
            {loading ? "Creating..." : "Create Product"}
          </Button>
          <Button type="button" variant="outline" asChild className="bg-transparent">
            <Link href="/admin/products">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
