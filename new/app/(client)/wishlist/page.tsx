"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, X, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/components/cart-context"
import { useToast } from "@/hooks/use-toast"

interface WishlistItem {
  id: number
  product_id: number
  product_name: string
  brand_name: string
  price: number
  product_image: string
  year_manufactured: number
  condition_grade: string
  created_at: string
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist")
      if (response.ok) {
        const data = await response.json()
        setItems(data.wishlist || [])
      } else if (response.status === 401) {
        // User not authenticated, redirect to sign in
        window.location.href = "/signin"
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to load wishlist items.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId: number) => {
    try {
      const response = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      })

      if (response.ok) {
        setItems(items.filter((item) => item.product_id !== productId))
        toast({
          title: "Removed from Wishlist",
          description: "Item has been removed from your wishlist.",
        })
      } else {
        throw new Error("Failed to remove item")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist.",
        variant: "destructive",
      })
    }
  }

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      id: item.product_id.toString(),
      name: item.product_name,
      price: item.price,
      image: item.product_image,
    })

    toast({
      title: "Added to Cart",
      description: `${item.product_name} has been added to your cart.`,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <Heart className="w-24 h-24 mx-auto text-gray-400" />
            <h1 className="text-3xl font-bold">Your Wishlist is Empty</h1>
            <p className="text-gray-600 text-lg">Save your favorite watches to keep track of them</p>
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800">
              <Link href="/products">Browse Watches</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <Badge className="bg-slate-100 text-slate-900">{items.length} Items</Badge>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <div className="relative overflow-hidden rounded-t-lg">
                <Image
                  src={item.product_image || "/placeholder.svg"}
                  alt={item.product_name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-black/80 text-white">{item.year_manufactured}</Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="bg-white/80 hover:bg-white"
                    onClick={() => removeFromWishlist(item.product_id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{item.brand_name}</p>
                  <h3 className="text-lg font-semibold line-clamp-2">{item.product_name}</h3>
                  <Badge className="bg-green-100 text-green-800 mt-2">{item.condition_grade}</Badge>
                </div>

                <div className="space-y-2">
                  <span className="text-2xl font-bold">${item.price.toLocaleString()}</span>
                  <p className="text-sm text-gray-600">Added {new Date(item.created_at).toLocaleDateString()}</p>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-slate-900 hover:bg-slate-800">
                    <Link href={`/products/${item.product_id}`}>View Details</Link>
                  </Button>
                  <Button variant="outline" className="bg-transparent" onClick={() => handleAddToCart(item)}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
