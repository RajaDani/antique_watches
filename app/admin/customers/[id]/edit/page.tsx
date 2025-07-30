"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    ArrowLeft,
    Save,
    Calendar,
    ShoppingBag,
    DollarSign,
    User,
    Mail,
    Phone,
    ImageIcon,
    CheckCircle,
    XCircle,
    Clock,
} from "lucide-react"
import Link from "next/link"

interface Customer {
    id: number
    email: string
    first_name: string
    last_name: string
    phone?: string
    date_of_birth?: string
    profile_image?: string
    is_active: boolean
    email_verified: boolean
    created_at: string
    updated_at: string
    last_login?: string
}

interface Order {
    id: number
    order_number: string
    status: string
    total_amount: number
    created_at: string
}

interface CustomerStats {
    total_orders: number
    total_spent: number
    avg_order_value: number
}

export default function EditCustomerPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [stats, setStats] = useState<CustomerStats>({ total_orders: 0, total_spent: 0, avg_order_value: 0 })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const [formData, setFormData] = useState({
        email: "",
        first_name: "",
        last_name: "",
        phone: "",
        date_of_birth: "",
        profile_image: "",
        is_active: true,
        email_verified: false,
    })

    useEffect(() => {
        fetchCustomer()
    }, [params.id])

    const fetchCustomer = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/admin/customers/${params.id}`)

            if (response.ok) {
                const data = await response.json()
                setCustomer(data.customer)
                setOrders(data.orders)
                setStats(data.stats)

                setFormData({
                    email: data.customer.email || "",
                    first_name: data.customer.first_name || "",
                    last_name: data.customer.last_name || "",
                    phone: data.customer.phone || "",
                    date_of_birth: data.customer.date_of_birth ? data.customer.date_of_birth.split("T")[0] : "",
                    profile_image: data.customer.profile_image || "",
                    is_active: Boolean(data.customer.is_active),
                    email_verified: Boolean(data.customer.email_verified),
                })
            } else if (response.status === 404) {
                setError("Customer not found")
            } else {
                setError("Failed to load customer")
            }
        } catch (error) {
            console.error("Error fetching customer:", error)
            setError("Failed to load customer")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError("")
        setSuccess("")

        try {
            const response = await fetch(`/api/admin/customers/${params.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess("Customer updated successfully")
                setCustomer(data.customer)
                setTimeout(() => setSuccess(""), 5000)
            } else {
                setError(data.error || "Failed to update customer")
            }
        } catch (error) {
            console.error("Error updating customer:", error)
            setError("An error occurred. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
            processing: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock },
            shipped: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: Clock },
            delivered: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
            completed: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
            cancelled: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
        }

        const config = statusConfig[status as keyof typeof statusConfig] || {
            color: "bg-gray-100 text-gray-800 border-gray-200",
            icon: Clock,
        }

        return config
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-24 bg-gray-200 rounded"></div>
                        <div className="h-8 w-64 bg-gray-200 rounded"></div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="h-96 bg-gray-200 rounded"></div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-48 bg-gray-200 rounded"></div>
                            <div className="h-48 bg-gray-200 rounded"></div>
                            <div className="h-48 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!customer) {
        return (
            <div className="p-6">
                <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">{error || "Customer not found"}</AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Link href="/admin/customers">
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Customers
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/customers">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Customers
                    </Button>
                </Link>
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={customer.profile_image || ""} alt={`${customer.first_name} ${customer.last_name}`} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(customer.first_name, customer.last_name)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {customer.first_name} {customer.last_name}
                        </h1>
                        <p className="text-gray-600">Customer ID: #{customer.id}</p>
                    </div>
                </div>
            </div>

            {error && (
                <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="first_name">First Name *</Label>
                                        <Input
                                            id="first_name"
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="last_name">Last Name *</Label>
                                        <Input
                                            id="last_name"
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email Address *
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="phone" className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        Phone Number
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="e.g., +1 (555) 123-4567"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="date_of_birth" className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Date of Birth
                                    </Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        value={formData.date_of_birth}
                                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="profile_image" className="flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" />
                                        Profile Image URL
                                    </Label>
                                    <Input
                                        id="profile_image"
                                        type="url"
                                        value={formData.profile_image}
                                        onChange={(e) => setFormData({ ...formData, profile_image: e.target.value })}
                                        placeholder="https://example.com/profile.jpg"
                                        className="mt-1"
                                    />
                                    {formData.profile_image && (
                                        <div className="mt-2">
                                            <Avatar className="h-16 w-16">
                                                <AvatarImage src={formData.profile_image || "/placeholder.svg"} alt="Profile preview" />
                                                <AvatarFallback>Preview</AvatarFallback>
                                            </Avatar>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Account Settings */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Account Settings</h3>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <Switch
                                                id="is_active"
                                                checked={formData.is_active}
                                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                            />
                                            <div>
                                                <Label htmlFor="is_active" className="font-medium">
                                                    Active Account
                                                </Label>
                                                <p className="text-sm text-gray-500">
                                                    {formData.is_active
                                                        ? "Customer can sign in and place orders"
                                                        : "Customer account is disabled"}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={formData.is_active ? "default" : "secondary"}>
                                            {formData.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <Switch
                                                id="email_verified"
                                                checked={formData.email_verified}
                                                onCheckedChange={(checked) => setFormData({ ...formData, email_verified: checked })}
                                            />
                                            <div>
                                                <Label htmlFor="email_verified" className="font-medium">
                                                    Email Verified
                                                </Label>
                                                <p className="text-sm text-gray-500">
                                                    {formData.email_verified ? "Email address is verified" : "Email address needs verification"}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={formData.email_verified ? "default" : "destructive"}>
                                            {formData.email_verified ? "Verified" : "Unverified"}
                                        </Badge>
                                    </div>
                                </div>

                                <Button type="submit" disabled={saving} className="w-full">
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? "Saving Changes..." : "Save Changes"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Customer Stats & Orders */}
                <div className="space-y-6">
                    {/* Account Info */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Status</span>
                                <Badge variant={customer.is_active ? "default" : "secondary"}>
                                    {customer.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Email Verified</span>
                                <Badge variant={customer.email_verified ? "default" : "destructive"}>
                                    {customer.email_verified ? "Verified" : "Unverified"}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Member Since</span>
                                <span className="text-sm font-medium">{formatDate(customer.created_at)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Last Updated</span>
                                <span className="text-sm font-medium">{formatDate(customer.updated_at)}</span>
                            </div>
                            {customer.last_login && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Last Login</span>
                                    <span className="text-sm font-medium">{formatDateTime(customer.last_login)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle>Customer Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium">Total Orders</span>
                                </div>
                                <span className="font-bold text-lg">{stats.total_orders}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium">Total Spent</span>
                                </div>
                                <span className="font-bold text-lg">{formatCurrency(stats.total_spent)}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm font-medium">Avg Order Value</span>
                                </div>
                                <span className="font-bold text-lg">{formatCurrency(stats.avg_order_value)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Orders */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle>Recent Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {orders.length > 0 ? (
                                <div className="space-y-3">
                                    {orders.map((order) => {
                                        const statusConfig = getStatusBadge(order.status)
                                        const StatusIcon = statusConfig.icon

                                        return (
                                            <div
                                                key={order.id}
                                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-sm">#{order.order_number}</p>
                                                        <Badge className={`${statusConfig.color} text-xs`}>
                                                            <StatusIcon className="w-3 h-3 mr-1" />
                                                            {order.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">{formatDate(order.created_at)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold">{formatCurrency(order.total_amount)}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div className="pt-2">
                                        <Link href={`/admin/orders?customer=${customer.id}`}>
                                            <Button variant="outline" size="sm" className="w-full bg-transparent">
                                                View All Orders
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No orders found</p>
                                    <p className="text-sm text-gray-400">This customer hasn't placed any orders yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
