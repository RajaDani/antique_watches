"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Package,
  Heart,
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
  MapPin,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Mock user data - in a real app, this would come from your authentication system
const userData = {
  id: 1,
  first_name: "John",
  last_name: "Collector",
  email: "john.collector@email.com",
  phone: "+1 (555) 123-4567",
  profile_image: "/placeholder.svg?height=150&width=150",
  created_at: "2022-03-15",
  total_orders: 12,
  total_spent: 145000,
  loyalty_tier: "Platinum",
}

const orderHistory = [
  {
    id: 1,
    order_number: "AW-2024-001",
    date: "2024-01-15",
    status: "delivered",
    total: 15000,
    items: [
      {
        name: "Rolex Submariner 1965",
        brand: "Rolex",
        price: 15000,
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
  },
  {
    id: 2,
    order_number: "AW-2024-002",
    date: "2024-02-20",
    status: "shipped",
    total: 8500,
    tracking: "1Z999AA1234567890",
    items: [
      {
        name: "Omega Speedmaster Professional",
        brand: "Omega",
        price: 8500,
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
  },
  {
    id: 3,
    order_number: "AW-2023-045",
    date: "2023-12-10",
    status: "delivered",
    total: 25000,
    items: [
      {
        name: "Patek Philippe Calatrava",
        brand: "Patek Philippe",
        price: 25000,
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
  },
]

const wishlistItems = [
  {
    id: 4,
    name: "Audemars Piguet Royal Oak",
    brand: "Audemars Piguet",
    price: 35000,
    image: "/placeholder.svg?height=200&width=200",
    year: "1980",
    condition: "Excellent",
    added_date: "2024-01-20",
  },
  {
    id: 5,
    name: "Cartier Tank Louis",
    brand: "Cartier",
    price: 12000,
    image: "/placeholder.svg?height=200&width=200",
    year: "1975",
    condition: "Excellent",
    added_date: "2024-02-05",
  },
  {
    id: 6,
    name: "Jaeger-LeCoultre Reverso",
    brand: "Jaeger-LeCoultre",
    price: 18000,
    image: "/placeholder.svg?height=200&width=200",
    year: "1985",
    condition: "Excellent",
    added_date: "2024-02-15",
  },
]

const addresses = [
  {
    id: 1,
    type: "shipping",
    is_default: true,
    first_name: "John",
    last_name: "Collector",
    address_line_1: "123 Collector's Lane",
    address_line_2: "Apt 4B",
    city: "New York",
    state: "NY",
    postal_code: "10001",
    country: "United States",
  },
  {
    id: 2,
    type: "billing",
    is_default: false,
    first_name: "John",
    last_name: "Collector",
    address_line_1: "456 Business Ave",
    city: "New York",
    state: "NY",
    postal_code: "10002",
    country: "United States",
  },
]

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState(userData)

  const handleSave = () => {
    // In a real app, you would save to the database here
    setIsEditing(false)
    // Show success message
  }

  const handleCancel = () => {
    setEditedData(userData)
    setIsEditing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
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
      default:
        return <Package className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8 shadow-lg border-0">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={userData.profile_image || "/placeholder.svg"}
                  alt={`${userData.first_name} ${userData.last_name}`}
                />
                <AvatarFallback className="text-2xl">
                  {userData.first_name[0]}
                  {userData.last_name[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">
                    {userData.first_name} {userData.last_name}
                  </h1>
                  <p className="text-gray-600">{userData.email}</p>
                  <Badge className="mt-2 bg-amber-100 text-amber-800">{userData.loyalty_tier} Member</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userData.total_orders}</div>
                    <div className="text-sm text-gray-600">Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">${userData.total_spent.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{wishlistItems.length}</div>
                    <div className="text-sm text-gray-600">Wishlist</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {new Date().getFullYear() - new Date(userData.created_at).getFullYear()}
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
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
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
              <Badge className="bg-slate-100 text-slate-900">{orderHistory.length} Orders</Badge>
            </div>

            <div className="space-y-4">
              {orderHistory.map((order) => (
                <Card key={order.id} className="shadow-sm border-0">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                            <p className="text-gray-600 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </Badge>
                            <span className="font-bold text-lg">${order.total.toLocaleString()}</span>
                          </div>
                        </div>

                        {order.tracking && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <Truck className="w-4 h-4 inline mr-2" />
                              Tracking: {order.tracking}
                            </p>
                          </div>
                        )}

                        <div className="space-y-3">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                width={60}
                                height={60}
                                className="rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-sm text-gray-600">{item.brand}</p>
                              </div>
                              <span className="font-semibold">${item.price.toLocaleString()}</span>
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Wishlist</h2>
              <Badge className="bg-slate-100 text-slate-900">{wishlistItems.length} Items</Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item) => (
                <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={200}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-black/80 text-white">{item.year}</Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Button size="sm" variant="ghost" className="bg-white/80 hover:bg-white">
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
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                    <Button onClick={handleSave} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm" className="bg-transparent">
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
                      value={editedData.first_name}
                      onChange={(e) => setEditedData({ ...editedData, first_name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <Input
                      value={editedData.last_name}
                      onChange={(e) => setEditedData({ ...editedData, last_name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <Input
                    type="email"
                    value={editedData.email}
                    onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input
                    value={editedData.phone}
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
                      <p className="text-gray-600">{new Date(userData.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Loyalty Tier</label>
                      <Badge className="bg-amber-100 text-amber-800">{userData.loyalty_tier}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Addresses */}
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Addresses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={address.type === "shipping" ? "default" : "secondary"}>{address.type}</Badge>
                        {address.is_default && <Badge className="bg-green-100 text-green-800">Default</Badge>}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">
                        {address.first_name} {address.last_name}
                      </p>
                      <p>{address.address_line_1}</p>
                      {address.address_line_2 && <p>{address.address_line_2}</p>}
                      <p>
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                      <p>{address.country}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full bg-transparent">
                  Add New Address
                </Button>
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
