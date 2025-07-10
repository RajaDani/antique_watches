"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, X, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Mock wishlist data - in a real app, this would come from the database
const wishlistItems = [
  {
    id: 4,
    name: "Audemars Piguet Royal Oak",
    brand: "Audemars Piguet",
    price: 35000,
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=Royal Oak",
    year: "1980",
    condition: "Excellent",
    added_date: "2024-01-20",
  },
  {
    id: 5,
    name: "Cartier Tank Louis",
    brand: "Cartier",
    price: 12000,
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=Tank Louis",
    year: "1975",
    condition: "Excellent",
    added_date: "2024-02-05",
  },
  {
    id: 6,
    name: "Jaeger-LeCoultre Reverso",
    brand: "Jaeger-LeCoultre",
    price: 18000,
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=Reverso",
    year: "1985",
    condition: "Excellent",
    added_date: "2024-02-15",
  },
]

export default function WishlistPage() {
  const [items, setItems] = useState(wishlistItems)

  const removeFromWishlist = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
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
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-black/80 text-white">{item.year}</Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="bg-white/80 hover:bg-white"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{item.brand}</p>
                  <h3 className="text-lg font-semibold line-clamp-2">{item.name}</h3>
                  <Badge className="bg-green-100 text-green-800 mt-2">{item.condition}</Badge>
                </div>

                <div className="space-y-2">
                  <span className="text-2xl font-bold">${item.price.toLocaleString()}</span>
                  <p className="text-sm text-gray-600">Added {new Date(item.added_date).toLocaleDateString()}</p>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-slate-900 hover:bg-slate-800">
                    <Link href={`/products/${item.id}`}>View Details</Link>
                  </Button>
                  <Button variant="outline" className="bg-transparent">
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
