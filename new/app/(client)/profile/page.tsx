"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User, Package, Heart, Settings, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Swal from "sweetalert2"

interface Order {
  id: number
  order_number: string
  status: string
  total_amount: number
  created_at: string
  items: Array<{
    product_name: string
    product_brand: string
    quantity: number
    unit_price: number
  }>
}

interface WishlistItem {
  id: number
  product_id: number
  product_name: string
  product_brand: string
  price: number
  image_url: string
  created_at: string
}

interface UserProfile {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string
  address: string
  city: string
  state: string
  postal_code: string
  country: string
}

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "profile"

  const [user, setUser] = useState<UserProfile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingOrders, setCancellingOrders] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const [userResponse, ordersResponse, wishlistResponse] = await Promise.all([
        fetch("/api/auth/profile"),
        fetch("/api/orders"),
        fetch("/api/wishlist"),
      ])

      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrders(ordersData.orders || [])
      }

      if (wishlistResponse.ok) {
        const wishlistData = await wishlistResponse.json()
        setWishlist(wishlistData.wishlist || [])
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderId: number, orderNumber: string) => {
    const result = await Swal.fire({
      title: "Cancel Order?",
      html: `
        <p>Are you sure you want to cancel order <strong>${orderNumber}</strong>?</p>
        <p class="text-sm text-gray-600 mt-2">This action cannot be undone and stock will be restored.</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Cancel Order",
      cancelButtonText: "Keep Order",
    })

    if (result.isConfirmed) {
      setCancellingOrders((prev) => new Set(prev).add(orderId))

      try {
        const response = await fetch(`/api/orders/${orderId}/cancel`, {
          method: "PATCH",
        })

        const data = await response.json()

        if (response.ok) {
          await Swal.fire({
            icon: "success",
            title: "Order Cancelled",
            html: `
              <p>Order <strong>${orderNumber}</strong> has been cancelled successfully.</p>
              <p class="text-sm text-gray-600 mt-2">Stock has been restored for ${data.restoredItems} item(s).</p>
            `,
            confirmButtonColor: "#059669",
          })

          // Refresh orders
          fetchUserData()
        } else {
          throw new Error(data.error || "Failed to cancel order")
        }
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Cancellation Failed",
          text: error instanceof Error ? error.message : "Failed to cancel order. Please try again.",
          confirmButtonColor: "#dc2626",
        })
      } finally {
        setCancellingOrders((prev) => {
          const newSet = new Set(prev)
          newSet.delete(orderId)
          return newSet
        })
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500"
      case "processing":
        return "bg-blue-500"
      case "shipped":
        return "bg-purple-500"
      case "delivered":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <CardTitle className="mb-4">Please Sign In</CardTitle>
          <p className="mb-4">You need to be signed in to view your profile.</p>
          <Button asChild>
            <Link href="/signin">Sign In</Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Account</h1>
          <p className="text-gray-600">Manage your profile, orders, and preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => router.push(`/profile?tab=${value}`)}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Wishlist ({wishlist.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={user.first_name || ""} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={user.last_name || ""} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={user.phone || ""} readOnly />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" value={user.address || ""} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={user.city || ""} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" value={user.state || ""} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input id="postalCode" value={user.postal_code || ""} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" value={user.country || ""} readOnly />
                    </div>
                  </div>
                </div>

                {/* <Button className="bg-slate-900 hover:bg-slate-800">Edit Profile</Button> */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <div className="space-y-6">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
                    <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
                    <Button asChild>
                      <Link href="/products">Browse Watches</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
                          <p className="text-sm text-gray-600">
                            Placed on {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getStatusColor(order.status)} text-white`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <p className="text-lg font-bold mt-2">${order.total_amount.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                            <div>
                              <p className="font-medium">{item.product_name}</p>
                              <p className="text-sm text-gray-600">{item.product_brand}</p>
                              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-medium">${(item.unit_price * item.quantity).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>

                      {(order.status === "pending" || order.status === "processing") && (
                        <div className="mt-4 pt-4 border-t">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelOrder(order.id, order.order_number)}
                            disabled={cancellingOrders.has(order.id)}
                          >
                            {cancellingOrders.has(order.id) ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              "Cancel Order"
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="wishlist">
            <div className="space-y-6">
              {wishlist.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">Your Wishlist is Empty</h3>
                    <p className="text-gray-600 mb-6">Save items you love for later.</p>
                    <Button asChild>
                      <Link href="/products">Browse Watches</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map((item) => (
                    <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <Image
                          src={item.image_url || "/placeholder.svg"}
                          alt={item.product_name}
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-500 font-medium">{item.product_brand}</p>
                        <h3 className="font-semibold mb-2">{item.product_name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">${item.price.toLocaleString()}</span>
                          <div className="flex gap-2">
                            <Button size="sm" asChild>
                              <Link href={`/products/${item.product_id}`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
