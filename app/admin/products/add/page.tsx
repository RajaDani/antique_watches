"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Plus, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand_id: "",
    category_id: "",
    reference_number: "",
    year_manufactured: new Date().getFullYear(),
    condition_grade: "Excellent",
    movement_type: "Automatic",
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
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch brands
      const brandsResponse = await fetch("/api/admin/brands")
      if (brandsResponse.ok) {
        const brandsData = await brandsResponse.json()
        setBrands(brandsData.brands || [])
      }

      // Fetch categories
      const categoriesResponse = await fetch("/api/categories")
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData?.categories || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          brand_id: Number.parseInt(formData.brand_id),
          category_id: Number.parseInt(formData.category_id),
          year_manufactured: Number.parseInt(formData.year_manufactured.toString()),
          price: Number.parseFloat(formData.price),
          original_price: Number.parseFloat(formData.original_price) || 0,
          cost_price: Number.parseFloat(formData.cost_price) || 0,
          stock_quantity: Number.parseInt(formData.stock_quantity),
          images,
        }),
      })

      if (response.ok) {
        router.push("/admin/products")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create product")
      }
    } catch (error) {
      console.error("Error creating product:", error)
      alert("Failed to create product")
    } finally {
      setSaving(false)
    }
  }

  const addImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()])
      setNewImageUrl("")
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Brand *</Label>
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
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.length > 0 && categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reference_number">Reference Number</Label>
                    <Input
                      id="reference_number"
                      value={formData.reference_number}
                      onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="year_manufactured">Year Manufactured</Label>
                    <Input
                      id="year_manufactured"
                      type="number"
                      value={formData.year_manufactured}
                      onChange={(e) => setFormData({ ...formData, year_manufactured: Number.parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="condition_grade">Condition Grade</Label>
                    <Select
                      value={formData.condition_grade}
                      onValueChange={(value) => setFormData({ ...formData, condition_grade: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                    <Label htmlFor="movement_type">Movement Type</Label>
                    <Select
                      value={formData.movement_type}
                      onValueChange={(value) => setFormData({ ...formData, movement_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Automatic">Automatic</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="Quartz">Quartz</SelectItem>
                        <SelectItem value="Chronograph">Chronograph</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="case_size">Case Size</Label>
                    <Input
                      id="case_size"
                      value={formData.case_size}
                      onChange={(e) => setFormData({ ...formData, case_size: e.target.value })}
                      placeholder="e.g., 40mm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="case_material">Case Material</Label>
                    <Input
                      id="case_material"
                      value={formData.case_material}
                      onChange={(e) => setFormData({ ...formData, case_material: e.target.value })}
                      placeholder="e.g., Stainless Steel"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dial_color">Dial Color</Label>
                    <Input
                      id="dial_color"
                      value={formData.dial_color}
                      onChange={(e) => setFormData({ ...formData, dial_color: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bracelet_material">Bracelet Material</Label>
                    <Input
                      id="bracelet_material"
                      value={formData.bracelet_material}
                      onChange={(e) => setFormData({ ...formData, bracelet_material: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="water_resistance">Water Resistance</Label>
                    <Input
                      id="water_resistance"
                      value={formData.water_resistance}
                      onChange={(e) => setFormData({ ...formData, water_resistance: e.target.value })}
                      placeholder="e.g., 100m"
                    />
                  </div>

                  <div>
                    <Label htmlFor="power_reserve">Power Reserve</Label>
                    <Input
                      id="power_reserve"
                      value={formData.power_reserve}
                      onChange={(e) => setFormData({ ...formData, power_reserve: e.target.value })}
                      placeholder="e.g., 48 hours"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing & Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="price">Selling Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="original_price">Original Price</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="cost_price">Cost Price</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked as boolean })}
                  />
                  <Label htmlFor="is_featured">Featured Product</Label>
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {images.map((image, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`Product ${index + 1}`}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                      <span className="flex-1 text-sm truncate">{image}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input placeholder="Image URL" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} />
                  <Button type="button" onClick={addImage} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Button type="submit" className="w-full" disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Creating..." : "Create Product"}
                  </Button>
                  <Button type="button" variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/admin/products">Cancel</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="e.g., 150g"
                />
              </div>

              <div>
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  placeholder="e.g., 40mm x 12mm"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="provenance">Provenance</Label>
              <Textarea
                id="provenance"
                value={formData.provenance}
                onChange={(e) => setFormData({ ...formData, provenance: e.target.value })}
                rows={3}
                placeholder="History and origin of the watch"
              />
            </div>

            <div>
              <Label htmlFor="condition_details">Condition Details</Label>
              <Textarea
                id="condition_details"
                value={formData.condition_details}
                onChange={(e) => setFormData({ ...formData, condition_details: e.target.value })}
                rows={3}
                placeholder="Detailed condition notes"
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
