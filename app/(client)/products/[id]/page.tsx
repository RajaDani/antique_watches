"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, ShoppingCart, Star, Truck, Shield, RotateCcw, Plus, Minus, Loader2, Check } from "lucide-react"
import { useCart } from "@/components/cart-context"
import { toast } from "sonner"
import Swal from "sweetalert2"

interface Product {
  id: number
  name: string
  description: string
  price: number
  stock_quantity: number
  image_url: any
  brand_name: string
  category_name: string
  year_manufactured?: number
  case_material?: string
  movement_type?: string
  dial_color?: string
  strap_material?: string
  water_resistance?: string
  case_diameter?: string
  features?: string
  condition?: string
  is_active: boolean
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart, items, updateQuantity } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [addingToWishlist, setAddingToWishlist] = useState(false)

  // Check if product is already in cart and get its quantity
  const cartItem = product ? items.find((item) => item.id === product.id.toString()) : null
  const isInCart = !!cartItem
  const cartQuantity = cartItem?.quantity || 0
  const availableStock = product ? product.stock_quantity - cartQuantity : 0

  useEffect(() => {
    if (params.id) {
      fetchProduct()
      checkWishlistStatus()
    }
  }, [params.id])

  // Reset quantity when product changes or when item is added to cart
  useEffect(() => {
    if (product && !isInCart) {
      setQuantity(1)
    } else if (product && isInCart) {
      setQuantity(1) // Reset to 1 for additional quantity
    }
  }, [product, isInCart])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/watches?id=${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data.watches)
      } else {
        router.push("/products")
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      router.push("/products")
    } finally {
      setLoading(false)
    }
  }

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch(`/api/wishlist/check?product_id=${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setIsInWishlist(data.isInWishlist)
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    // Check if adding this quantity would exceed available stock
    if (cartQuantity + quantity > product.stock_quantity) {
      toast.error(`Only ${availableStock} more items available`)
      return
    }

    setAddingToCart(true)

    try {
      if (isInCart) {
        // Update existing cart item quantity
        updateQuantity(product.id.toString(), cartQuantity + quantity)

        await Swal.fire({
          icon: "success",
          title: "Cart Updated!",
          html: `
            <div class="text-left">
              <p><strong>${product.name}</strong></p>
              <p class="text-sm text-gray-600">${product.brand_name}</p>
              <p class="text-sm">Added: ${quantity} more</p>
              <p class="text-sm">Total in cart: ${cartQuantity + quantity}</p>
              <p class="text-sm font-semibold">Price: Pkr. ${(product.price * (cartQuantity + quantity)).toLocaleString()}</p>
            </div>
          `,
          showConfirmButton: true,
          showCancelButton: true,
          confirmButtonText: "View Cart",
          cancelButtonText: "Continue Shopping",
          confirmButtonColor: "#059669",
          cancelButtonColor: "#6b7280",
        }).then((result) => {
          if (result.isConfirmed) {
            router.push("/cart")
          }
        })
      } else {
        // Add new item to cart
        addToCart({
          id: product.id.toString(),
          name: product.name,
          brand: product.brand_name,
          price: product.price,
          quantity: quantity,
          image_url: product.image_url,
          stock: product.stock_quantity,
        })

        await Swal.fire({
          icon: "success",
          title: "Added to Cart!",
          html: `
            <div class="text-left">
              <p><strong>${product.name}</strong></p>
              <p class="text-sm text-gray-600">${product.brand_name}</p>
              <p class="text-sm">Quantity: ${quantity}</p>
              <p class="text-sm font-semibold">Price: Pkr. ${(product.price * quantity).toLocaleString()}</p>
            </div>
          `,
          showConfirmButton: true,
          showCancelButton: true,
          confirmButtonText: "View Cart",
          cancelButtonText: "Continue Shopping",
          confirmButtonColor: "#059669",
          cancelButtonColor: "#6b7280",
        }).then((result) => {
          if (result.isConfirmed) {
            router.push("/cart")
          }
        })
      }

      setQuantity(1) // Reset quantity after adding
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add to cart")
    } finally {
      setAddingToCart(false)
    }
  }

  const handleWishlistToggle = async () => {
    if (!product) return

    setAddingToWishlist(true)

    try {
      if (isInWishlist) {
        const response = await fetch(`/api/wishlist?product_id=${product.id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setIsInWishlist(false)
          toast.success("Removed from wishlist")
        } else {
          const data = await response.json()
          if (response.status === 401) {
            router.push("/signin")
            return
          }
          toast.error(data.error || "Failed to remove from wishlist")
        }
      } else {
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ product_id: product.id }),
        })

        if (response.ok) {
          setIsInWishlist(true)
          toast.success("Added to wishlist")
        } else {
          const data = await response.json()
          if (response.status === 401) {
            router.push("/signin")
            return
          }
          toast.error(data.error || "Failed to add to wishlist")
        }
      }
    } catch (error) {
      console.error("Error with wishlist:", error)
      toast.error("Something went wrong")
    } finally {
      setAddingToWishlist(false)
    }
  }

  const incrementQuantity = () => {
    if (product && quantity < availableStock) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number.parseInt(e.target.value)
    if (val >= 1 && val <= availableStock) {
      setQuantity(val)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => router.push("/products")}>Back to Products</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          {product.images.map((x: any) => {
            return <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-white">
                <Image
                  src={x.image_url || "/placeholder.svg?height=600&width=600"}
                  alt={x.name}
                  fill
                  className="object-cover"
                  priority
                />
                {product.stock_quantity === 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg px-4 py-2">
                      Out of Stock
                    </Badge>
                  </div>
                )}
                {isInCart && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-600 text-white">
                      <Check className="w-3 h-3 mr-1" />
                      In Cart ({cartQuantity})
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          })}

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">{product.brand_name}</p>
              <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.8) • 24 reviews</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold">Pkr. {product.price.toLocaleString()}</span>
              <div className="flex flex-col gap-1">
                <Badge className="bg-green-100 text-green-800">
                  {product.stock_quantity > 0 ? `${product.stock_quantity} total stock` : "Out of stock"}
                </Badge>
                {isInCart && (
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    {availableStock} more available
                  </Badge>
                )}
              </div>
            </div>

            {isInCart && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Already in your cart</span>
                </div>
                <p className="text-sm text-blue-600">
                  You have {cartQuantity} of this item in your cart. You can add {availableStock} more.
                </p>
              </div>
            )}

            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="quantity" className="font-medium">
                  {isInCart ? "Add more:" : "Quantity:"}
                </Label>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="h-10 w-10 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={availableStock}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-16 text-center border-0 focus-visible:ring-0"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={incrementQuantity}
                    disabled={quantity >= availableStock}
                    className="h-10 w-10 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-gray-500">{availableStock} available</span>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={availableStock === 0 || addingToCart}
                  className="flex-1 bg-slate-900 hover:bg-slate-800"
                  size="lg"
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isInCart ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      {isInCart ? (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add More to Cart
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleWishlistToggle}
                  disabled={addingToWishlist}
                  className="px-4 bg-transparent"
                >
                  {addingToWishlist ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Heart className={`w-4 h-4 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
                  )}
                </Button>
              </div>

              {availableStock === 0 && product.stock_quantity > 0 && (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <strong>Maximum quantity reached!</strong> You already have all available stock in your cart.
                </p>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-gray-500">Orders over 10000</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <p className="text-sm font-medium">Authenticity</p>
                <p className="text-xs text-gray-500">Guaranteed genuine</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <p className="text-sm font-medium">30-Day Return</p>
                <p className="text-xs text-gray-500">Easy returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="specifications" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews (24)</TabsTrigger>
            </TabsList>

            <TabsContent value="specifications" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {product.year_manufactured && (
                      <div>
                        <Label className="font-medium">Year Manufactured</Label>
                        <p className="text-gray-600">{product.year_manufactured}</p>
                      </div>
                    )}
                    {product.case_material && (
                      <div>
                        <Label className="font-medium">Case Material</Label>
                        <p className="text-gray-600">{product.case_material}</p>
                      </div>
                    )}
                    {product.movement_type && (
                      <div>
                        <Label className="font-medium">Movement Type</Label>
                        <p className="text-gray-600">{product.movement_type}</p>
                      </div>
                    )}
                    {product.dial_color && (
                      <div>
                        <Label className="font-medium">Dial Color</Label>
                        <p className="text-gray-600">{product.dial_color}</p>
                      </div>
                    )}
                    {product.strap_material && (
                      <div>
                        <Label className="font-medium">Strap Material</Label>
                        <p className="text-gray-600">{product.strap_material}</p>
                      </div>
                    )}
                    {product.water_resistance && (
                      <div>
                        <Label className="font-medium">Water Resistance</Label>
                        <p className="text-gray-600">{product.water_resistance}</p>
                      </div>
                    )}
                    {product.case_diameter && (
                      <div>
                        <Label className="font-medium">Case Diameter</Label>
                        <p className="text-gray-600">{product.case_diameter}</p>
                      </div>
                    )}
                    {product.condition && (
                      <div>
                        <Label className="font-medium">Condition</Label>
                        <p className="text-gray-600">{product.condition}</p>
                      </div>
                    )}
                  </div>
                  {product.features && (
                    <div className="mt-6">
                      <Label className="font-medium">Features</Label>
                      <p className="text-gray-600 mt-1">{product.features}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="description" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
                    <p className="text-gray-600">Be the first to review this product.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
