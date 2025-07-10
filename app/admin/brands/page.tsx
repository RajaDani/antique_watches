"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

interface Brand {
  id: number
  name: string
  slug: string
  description?: string
  logo_url?: string
  website_url?: string
  founded_year?: number
  country?: string
  is_active: boolean
  product_count: number
  created_at: string
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo_url: "",
    website_url: "",
    founded_year: "",
    country: "",
  })

  useEffect(() => {
    fetchBrands()
  }, [searchQuery])

  useEffect(() => {
    if (editingBrand) {
      setFormData({
        name: editingBrand.name,
        description: editingBrand.description || "",
        logo_url: editingBrand.logo_url || "",
        website_url: editingBrand.website_url || "",
        founded_year: editingBrand.founded_year?.toString() || "",
        country: editingBrand.country || "",
      })
    } else {
      setFormData({
        name: "",
        description: "",
        logo_url: "",
        website_url: "",
        founded_year: "",
        country: "",
      })
    }
  }, [editingBrand])

  const fetchBrands = async () => {
    try {
      const params = new URLSearchParams({
        search: searchQuery,
      })

      const response = await fetch(`/api/admin/brands?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBrands(data.brands || [])
      }
    } catch (error) {
      console.error("Error fetching brands:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const url = editingBrand ? `/api/admin/brands/${editingBrand.id}` : "/api/admin/brands"
      const method = editingBrand ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          founded_year: formData.founded_year ? Number(formData.founded_year) : null,
        }),
      })

      if (response.ok) {
        setSuccess(editingBrand ? "Brand updated successfully" : "Brand created successfully")
        setShowAddDialog(false)
        setEditingBrand(null)
        fetchBrands()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to save brand")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    }
  }

  const deleteBrand = async (id: number) => {
    if (!confirm("Are you sure you want to delete this brand?")) return

    try {
      const response = await fetch(`/api/admin/brands/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchBrands()
      } else {
        alert("Failed to delete brand")
      }
    } catch (error) {
      console.error("Error deleting brand:", error)
      alert("Failed to delete brand")
    }
  }

  const toggleBrandStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/brands/${id}/toggle-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (response.ok) {
        fetchBrands()
      }
    } catch (error) {
      console.error("Error toggling brand status:", error)
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-600">Manage watch brands and manufacturers</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingBrand ? "Edit Brand" : "Add New Brand"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Brand Name *</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Rolex"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g., Switzerland"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brand description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Logo URL</label>
                  <Input
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Website URL</label>
                  <Input
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Founded Year</label>
                <Input
                  type="number"
                  value={formData.founded_year}
                  onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
                  placeholder="1905"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingBrand ? "Update Brand" : "Create Brand"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false)
                    setEditingBrand(null)
                  }}
                  className="bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brands Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Brands ({brands.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Founded</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Image
                          src={brand.logo_url || "/placeholder.svg?height=40&width=40"}
                          alt={brand.name}
                          width={40}
                          height={40}
                          className="rounded-lg object-contain"
                        />
                        <div>
                          <p className="font-medium">{brand.name}</p>
                          <p className="text-sm text-gray-500">{brand.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{brand.country || "—"}</TableCell>
                    <TableCell>{brand.founded_year || "—"}</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800">{brand.product_count} products</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`cursor-pointer ${brand.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        onClick={() => toggleBrandStatus(brand.id, brand.is_active)}
                      >
                        {brand.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingBrand(brand)
                              setShowAddDialog(true)
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteBrand(brand.id)} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
