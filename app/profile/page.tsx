"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Package,
  Settings,
  Edit,
  Save,
  X,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  Star,
  Calendar,
  AlertCircle,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface UserProfile {
  id: number
  email: string
  first_name: string
  last_name: string
  phone?: string
  profile_image?: string
  created_at: string
}

interface OrderItem {
  product_name: string
  product_brand: string
  unit_price: number
  quantity: number
  total_price: number
  product_image?: string
}

interface Order {
  id: number
  order_number: string
  status: string
  total_amount: number
  created_at: string
  shipped_at?: string
  delivered_at?: string
  tracking_number?: string
  items: OrderItem[]
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<Partial<UserProfile>>({})
  const [error, setError] = useState("")

  useEffect(() => {
    fetchUserData()
    fetchOrders()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setEditedData(data.user)
      } else {
        router.push("/signin")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      router.push("/signin")
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      })

      if (response.ok) {
        // Refresh orders
        fetchOrders()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to cancel order")
      }
    } catch (error) {
      setError("Failed to cancel order")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-4 h-4" />
      case "shipped":
        return <Truck className="w-4 h-4" />
      case "processing":
        return <Clock className="w-4 h-4" />
      case "cancelled":
        return <X className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const canCancelOrder = (status: string) => {
    return status === "pending" || status === "processing"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Profile Header */}
        <Card className="mb-8 shadow-lg border-0">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={
                    user.profile_image ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${user.first_name} ${user.last_name}`
                  }
                  alt={`${user.first_name} ${user.last_name}`}
                />
                <AvatarFallback className="text-2xl">
                  {user.first_name[0]}
                  {user.last_name[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">
                    {user.first_name} {user.last_name}
                  </h1>
                  <p className="text-gray-600">{user.email}</p>
                  <Badge className="mt-2 bg-amber-100 text-amber-800">Premium Member</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{orders.length}</div>
                    <div className="text-sm text-gray-600">Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      ${orders.reduce((sum, order) => sum + order.total_amount, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-gray-600">Wishlist</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {new Date().getFullYear() - new Date(user.created_at).getFullYear()}
                    </div>
                    <div className="text-sm text-gray-600">Years</div>
                  </div>
                </div>
              </div>

              <Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="bg-transparent">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              {/* User Icon Placeholder */}
              <span className="w-4 h-4 mr-2"></span>
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Order History</h2>
              <Badge className="bg-slate-100 text-slate-900">{orders.length} Orders</Badge>
            </div>

            {orders.length === 0 ? (
              <Card className="shadow-sm border-0">
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
                  <p className="text-gray-600 mb-6">Start exploring our collection of vintage watches</p>
                  <Button asChild>
                    <Link href="/products">Browse Watches</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="shadow-sm border-0">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                              <p className="text-gray-600 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1 capitalize">{order.status}</span>
                              </Badge>
                              <span className="font-bold text-lg">${order.total_amount.toLocaleString()}</span>
                            </div>
                          </div>

                          {order.tracking_number && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-sm text-blue-800">
                                <Truck className="w-4 h-4 inline mr-2" />
                                Tracking: {order.tracking_number}
                              </p>
                            </div>
                          )}

                          <div className="space-y-3">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center gap-4">
                                <Image
                                  src={
                                    item.product_image ||
                                    `https://api.dicebear.com/7.x/shapes/svg?seed=${item.product_name}`
                                  }
                                  alt={item.product_name}
                                  width={60}
                                  height={60}
                                  className="rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium">{item.product_name}</h4>
                                  <p className="text-sm text-gray-600">{item.product_brand}</p>
                                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                </div>
                                <span className="font-semibold">${item.total_price.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="outline" className="bg-transparent">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          {order.status === "delivered" && (
                            <Button size="sm" variant="outline" className="bg-transparent">
                              <Star className="w-4 h-4 mr-2" />
                              Write Review
                            </Button>
                          )}
                          {canCancelOrder(order.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel Order
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="shadow-sm border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="bg-transparent">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => setIsEditing(false)} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline" size="sm" className="bg-transparent">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <Input
                      value={editedData.first_name || ""}
                      onChange={(e) => setEditedData({ ...editedData, first_name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <Input
                      value={editedData.last_name || ""}
                      onChange={(e) => setEditedData({ ...editedData, last_name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <Input
                    type="email"
                    value={editedData.email || ""}
                    onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input
                    value={editedData.phone || ""}
                    onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Member Since</label>
                      <p className="text-gray-600">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Account Status</label>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Security</h3>
                  <div className="space-y-4">
                    <Button variant="outline" className="bg-transparent">
                      Change Password
                    </Button>
                    <Button variant="outline" className="bg-transparent">
                      Enable Two-Factor Authentication
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive updates about your orders and new arrivals</p>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-gray-600">Get shipping updates via text message</p>
                      </div>
                      <input type="checkbox" className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing Emails</p>
                        <p className="text-sm text-gray-600">Receive promotional offers and newsletters</p>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Privacy</h3>
                  <div className="space-y-4">
                    <Button variant="outline" className="bg-transparent">
                      Download My Data
                    </Button>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
