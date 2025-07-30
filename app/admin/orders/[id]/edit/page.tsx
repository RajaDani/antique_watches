"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Swal from "sweetalert2"

interface Order {
    id: number
    order_number: string
    status: string
    subtotal: number
    tax_amount: number
    shipping_amount: number
    discount_amount: number
    total_amount: number
    payment_status: string
    payment_method?: string
    shipping_method?: string
    tracking_number?: string
    notes?: string
    shipped_at?: string
    delivered_at?: string
    customer_name: string
}

const ORDER_STATUSES = [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
]

const PAYMENT_STATUSES = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
]

export default function EditOrderPage() {
    const params = useParams()
    const router = useRouter()
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        status: "",
        payment_status: "",
        shipping_method: "",
        shipping_amount: "",
        tracking_number: "",
        notes: "",
        shipped_at: "",
        delivered_at: "",
    })

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

                // Populate form data
                setFormData({
                    status: data.order.status || "",
                    payment_status: data.order.payment_status || "",
                    shipping_method: data.order.shipping_method || "",
                    shipping_amount: data.order.shipping_amount?.toString() || "",
                    tracking_number: data.order.tracking_number || "",
                    notes: data.order.notes || "",
                    shipped_at: data.order.shipped_at ? new Date(data.order.shipped_at).toISOString().slice(0, 16) : "",
                    delivered_at: data.order.delivered_at ? new Date(data.order.delivered_at).toISOString().slice(0, 16) : "",
                })
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

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const calculateTotal = () => {
        if (!order) return 0
        const shippingAmount = Number.parseFloat(formData.shipping_amount) || 0
        return parseInt(order.subtotal) + parseInt(order.tax_amount) + parseInt(shippingAmount) - parseInt(order.discount_amount)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const updateData: any = {}

            // Only include changed fields
            if (formData.status !== order?.status) {
                updateData.status = formData.status
            }
            if (formData.payment_status !== order?.payment_status) {
                updateData.payment_status = formData.payment_status
            }
            if (formData.shipping_method !== (order?.shipping_method || "")) {
                updateData.shipping_method = formData.shipping_method
            }
            if (Number.parseFloat(formData.shipping_amount) !== (order?.shipping_amount || 0)) {
                updateData.shipping_amount = Number.parseFloat(formData.shipping_amount) || 0
            }
            if (formData.tracking_number !== (order?.tracking_number || "")) {
                updateData.tracking_number = formData.tracking_number
            }
            if (formData.notes !== (order?.notes || "")) {
                updateData.notes = formData.notes
            }
            if (
                formData.shipped_at &&
                formData.shipped_at !== (order?.shipped_at ? new Date(order.shipped_at).toISOString().slice(0, 16) : "")
            ) {
                updateData.shipped_at = formData.shipped_at
            }
            if (
                formData.delivered_at &&
                formData.delivered_at !== (order?.delivered_at ? new Date(order.delivered_at).toISOString().slice(0, 16) : "")
            ) {
                updateData.delivered_at = formData.delivered_at
            }

            if (Object.keys(updateData).length === 0) {
                toast.info("No changes to save")
                return
            }

            const response = await fetch(`/api/admin/orders/${params.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
            })

            if (response.ok) {
                await Swal.fire({
                    icon: "success",
                    title: "Order Updated!",
                    text: "The order has been successfully updated.",
                    confirmButtonColor: "#059669",
                })
                router.push(`/admin/orders/${params.id}`)
            } else {
                const data = await response.json()
                toast.error(data.error || "Failed to update order")
            }
        } catch (error) {
            console.error("Error updating order:", error)
            toast.error("Failed to update order")
        } finally {
            setSaving(false)
        }
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
                    <p>Loading order...</p>
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
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Order
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Edit Order #{order.order_number}</h1>
                        <p className="text-gray-600">Customer: {order.customer_name}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Order Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="status">Order Status</Label>
                                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ORDER_STATUSES.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="payment_status">Payment Status</Label>
                                <Select
                                    value={formData.payment_status}
                                    onValueChange={(value) => handleInputChange("payment_status", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select payment status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PAYMENT_STATUSES.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="shipping_method">Shipping Method</Label>
                                <Input
                                    id="shipping_method"
                                    value={formData.shipping_method}
                                    onChange={(e) => handleInputChange("shipping_method", e.target.value)}
                                    placeholder="e.g., Standard Shipping, Express"
                                />
                            </div>

                            <div>
                                <Label htmlFor="shipping_amount">Shipping Cost</Label>
                                <Input
                                    id="shipping_amount"
                                    type="number"
                                    step="1"
                                    min="0"
                                    value={formData.shipping_amount}
                                    onChange={(e) => handleInputChange("shipping_amount", e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <Label htmlFor="tracking_number">Tracking Number</Label>
                                <Input
                                    id="tracking_number"
                                    value={formData.tracking_number}
                                    onChange={(e) => handleInputChange("tracking_number", e.target.value)}
                                    placeholder="Enter tracking number"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="shipped_at">Shipped Date & Time</Label>
                                <Input
                                    id="shipped_at"
                                    type="date"
                                    value={formData.shipped_at}
                                    onChange={(e) => handleInputChange("shipped_at", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="delivered_at">Delivered Date & Time</Label>
                                <Input
                                    id="delivered_at"
                                    type="date"
                                    value={formData.delivered_at}
                                    onChange={(e) => handleInputChange("delivered_at", e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
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
                            <div className="flex justify-between">
                                <span>Shipping:</span>
                                <span>{formatCurrency(Number.parseFloat(formData.shipping_amount) || 0)}</span>
                            </div>
                            {order.discount_amount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount:</span>
                                    <span>-{formatCurrency(order.discount_amount)}</span>
                                </div>
                            )}
                            <hr />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total:</span>
                                <span>{formatCurrency(calculateTotal())}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Notes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={formData.notes}
                            onChange={(e) => handleInputChange("notes", e.target.value)}
                            placeholder="Add internal notes about this order..."
                            rows={4}
                        />
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
