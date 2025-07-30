"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Package, User, MapPin, CreditCard, Truck, Calendar, Phone, Mail, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface OrderItem {
    id: number
    product_id: number
    quantity: number
    unit_price: number
    total_price: number
    product_name: string
    product_brand: string
    product_reference: string
    brand_name: string
}

interface OrderAddress {
    id: number
    type: "billing" | "shipping"
    first_name: string
    last_name: string
    company?: string
    address_line_1: string
    address_line_2?: string
    city: string
    state: string
    postal_code: string
    country: string
    phone?: string
}

interface Order {
    id: number
    order_number: string
    status: string
    subtotal: number
    tax_amount: number
    shipping_amount: number
    discount_amount: number
    total_amount: number
    currency: string
    payment_status: string
    payment_method?: string
    payment_transaction_id?: string
    shipping_method?: string
    tracking_number?: string
    notes?: string
    shipped_at?: string
    delivered_at?: string
    created_at: string
    updated_at: string
    first_name: string
    last_name: string
    email: string
    phone?: string
    customer_name: string
    items: OrderItem[]
    billing_address?: OrderAddress
    shipping_address?: OrderAddress
}

const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
}

const paymentStatusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
}

export default function OrderDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            fetchOrder()
        }
    }, [params.id])

    const fetchOrder = async () => {
        try {
            const response = await fetch(`/api/admin/orders/${params.id}`)
            if (response.ok) {
                const data = await response.json()
                setOrder(data.order)
            } else {
                toast.error("Failed to fetch order")
                router.push("/admin/orders")
            }
        } catch (error) {
            console.error("Error fetching order:", error)
            toast.error("Failed to fetch order")
            router.push("/admin/orders")
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PKR",
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>Loading order details...</p>
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
                    <Button onClick={() => router.push("/admin/orders")}>Back to Orders</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.push("/admin/orders")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Orders
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Order #{order.order_number}</h1>
                        <p className="text-gray-600">Placed on {formatDate(order.created_at)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <Badge className={paymentStatusColors[order.payment_status as keyof typeof paymentStatusColors]}>
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </Badge>
                    <Button asChild>
                        <Link href={`/admin/orders/${order.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Order
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Order Items ({order.items.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{item.product_name}</h4>
                                            <p className="text-sm text-gray-600">{item.brand_name}</p>
                                            {item.product_reference && <p className="text-sm text-gray-500">Ref: {item.product_reference}</p>}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">
                                                {item.quantity} × {formatCurrency(item.unit_price)}
                                            </p>
                                            <p className="text-lg font-bold">{formatCurrency(item.total_price)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-6" />

                            {/* Order Summary */}
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>{formatCurrency(order.subtotal)}</span>
                                </div>
                                {order.tax_amount > 0 && (
                                    <div className="flex justify-between">
                                        <span>Tax:</span>
                                        <span>{formatCurrency(order.tax_amount)}</span>
                                    </div>
                                )}
                                {order.shipping_amount > 0 && (
                                    <div className="flex justify-between">
                                        <span>Shipping:</span>
                                        <span>{formatCurrency(order.shipping_amount)}</span>
                                    </div>
                                )}
                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount:</span>
                                        <span>-{formatCurrency(order.discount_amount)}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total:</span>
                                    <span>{formatCurrency(order.total_amount)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    {order.shipping_address && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Shipping Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1">
                                    <p className="font-semibold">
                                        {order.shipping_address.first_name} {order.shipping_address.last_name}
                                    </p>
                                    {order.shipping_address.company && <p className="text-gray-600">{order.shipping_address.company}</p>}
                                    <p>{order.shipping_address.address_line_1}</p>
                                    {order.shipping_address.address_line_2 && <p>{order.shipping_address.address_line_2}</p>}
                                    <p>
                                        {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                                    </p>
                                    <p>{order.shipping_address.country}</p>
                                    {order.shipping_address.phone && (
                                        <p className="flex items-center gap-2 mt-2">
                                            <Phone className="w-4 h-4" />
                                            {order.shipping_address.phone}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Billing Address */}
                    {order.billing_address && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Billing Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1">
                                    <p className="font-semibold">
                                        {order.billing_address.first_name} {order.billing_address.last_name}
                                    </p>
                                    {order.billing_address.company && <p className="text-gray-600">{order.billing_address.company}</p>}
                                    <p>{order.billing_address.address_line_1}</p>
                                    {order.billing_address.address_line_2 && <p>{order.billing_address.address_line_2}</p>}
                                    <p>
                                        {order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}
                                    </p>
                                    <p>{order.billing_address.country}</p>
                                    {order.billing_address.phone && (
                                        <p className="flex items-center gap-2 mt-2">
                                            <Phone className="w-4 h-4" />
                                            {order.billing_address.phone}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Customer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="font-semibold">{order.customer_name}</p>
                                <p className="flex items-center gap-2 text-sm text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    {order.email}
                                </p>
                                {order.phone && (
                                    <p className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone className="w-4 h-4" />
                                        {order.phone}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium mb-1">Order Status</p>
                                <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-1">Payment Status</p>
                                <Badge className={paymentStatusColors[order.payment_status as keyof typeof paymentStatusColors]}>
                                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                </Badge>
                            </div>
                            {order.payment_method && (
                                <div>
                                    <p className="text-sm font-medium mb-1">Payment Method</p>
                                    <p className="text-sm text-gray-600">{order.payment_method}</p>
                                </div>
                            )}
                            {order.payment_transaction_id && (
                                <div>
                                    <p className="text-sm font-medium mb-1">Transaction ID</p>
                                    <p className="text-sm text-gray-600 font-mono">{order.payment_transaction_id}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Shipping Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="w-5 h-5" />
                                Shipping
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {order.shipping_method && (
                                <div>
                                    <p className="text-sm font-medium mb-1">Shipping Method</p>
                                    <p className="text-sm text-gray-600">{order.shipping_method}</p>
                                </div>
                            )}
                            {order.tracking_number && (
                                <div>
                                    <p className="text-sm font-medium mb-1">Tracking Number</p>
                                    <p className="text-sm text-gray-600 font-mono">{order.tracking_number}</p>
                                </div>
                            )}
                            {order.shipped_at && (
                                <div>
                                    <p className="text-sm font-medium mb-1">Shipped At</p>
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(order.shipped_at)}
                                    </p>
                                </div>
                            )}
                            {order.delivered_at && (
                                <div>
                                    <p className="text-sm font-medium mb-1">Delivered At</p>
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(order.delivered_at)}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order Notes */}
                    {order.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">{order.notes}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Order Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div>
                                    <p className="text-sm font-medium">Order Created</p>
                                    <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                                </div>
                            </div>
                            {order.shipped_at && (
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-medium">Order Shipped</p>
                                        <p className="text-xs text-gray-500">{formatDate(order.shipped_at)}</p>
                                    </div>
                                </div>
                            )}
                            {order.delivered_at && (
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-medium">Order Delivered</p>
                                        <p className="text-xs text-gray-500">{formatDate(order.delivered_at)}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
