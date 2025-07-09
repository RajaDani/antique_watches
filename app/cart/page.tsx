"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface CartItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
  year: string
  condition: string
  quantity: number
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Rolex Submariner 1960s",
      brand: "Rolex",
      price: 15000,
      image: "/placeholder.svg?height=200&width=200",
      year: "1965",
      condition: "Excellent",
      quantity: 1,
    },
    {
      id: 2,
      name: "Omega Speedmaster Professional",
      brand: "Omega",
      price: 8500,
      image: "/placeholder.svg?height=200&width=200",
      year: "1969",
      condition: "Very Good",
      quantity: 1,
    },
  ])

  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "vintage10") {
      setDiscount(0.1) // 10% discount
    } else if (promoCode.toLowerCase() === "collector20") {
      setDiscount(0.2) // 20% discount
    } else {
      setDiscount(0)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = subtotal * discount
  const shipping = subtotal > 10000 ? 0 : 150 // Free shipping over $10,000
  const tax = (subtotal - discountAmount) * 0.08 // 8% tax
  const total = subtotal - discountAmount + shipping + tax

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-400" />
            <h1 className="text-3xl font-bold">Your Cart is Empty</h1>
            <p className="text-gray-600 text-lg">Discover our exceptional collection of antique watches</p>
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
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" className="p-0 h-auto">
            <Link href="/products" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-8">Shopping Cart ({cartItems.length} items)</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-black/80 text-white text-xs">{item.year}</Badge>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">{item.brand}</p>
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <Badge className="bg-green-100 text-green-800 mt-2">{item.condition}</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="px-3 py-1 font-medium">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-bold">${(item.price * item.quantity).toLocaleString()}</div>
                          <div className="text-sm text-gray-600">${item.price.toLocaleString()} each</div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({(discount * 100).toFixed(0)}%)</span>
                    <span>-${discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping}`}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Promo Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button onClick={applyPromoCode} variant="outline">
                    Apply
                  </Button>
                </div>
                {discount > 0 && (
                  <p className="text-sm text-green-600">
                    Promo code applied! You saved ${discountAmount.toLocaleString()}
                  </p>
                )}
                <div className="text-xs text-gray-500">
                  <p>Try: VINTAGE10 for 10% off or COLLECTOR20 for 20% off</p>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Button */}
            <Button size="lg" className="w-full bg-slate-900 hover:bg-slate-800 text-lg py-6">
              Proceed to Checkout
            </Button>

            {/* Security Features */}
            <div className="text-center space-y-2 text-sm text-gray-600">
              <p>🔒 Secure checkout with SSL encryption</p>
              <p>📦 Insured shipping worldwide</p>
              <p>✅ 30-day authenticity guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
