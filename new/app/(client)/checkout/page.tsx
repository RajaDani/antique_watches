"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Truck, Shield, Loader2, MapPin, Building } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/components/cart-context"
import { useRouter } from "next/navigation"
import Swal from "sweetalert2"

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
}

interface ShippingAddress {
  first_name: string
  last_name: string
  company: string
  address_line_1: string
  address_line_2: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
}

interface BillingAddress extends ShippingAddress { }

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [notes, setNotes] = useState("")
  const router = useRouter()

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    first_name: "",
    last_name: "",
    company: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "United States",
    phone: "",
  })

  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    first_name: "",
    last_name: "",
    company: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "United States",
    phone: "",
  })

  useEffect(() => {
    checkAuthStatus()
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items.length, router])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
        // Pre-fill with user data if available
        setShippingAddress((prev) => ({
          ...prev,
          first_name: userData.user.first_name || "",
          last_name: userData.user.last_name || "",
        }))
      } else {
        router.push("/signin?redirect=/checkout")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      router.push("/signin?redirect=/checkout")
    }
  }

  const subtotal = getTotalPrice()
  const getShippingCost = () => {
    if (subtotal > 10000) return 0
    switch (shippingMethod) {
      case "express":
        return 250
      case "overnight":
        return 500
      default:
        return 150
    }
  }
  const shipping = getShippingCost()
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const validateForm = () => {
    const requiredFields = ["first_name", "last_name", "address_line_1", "city", "state", "postal_code", "country"]

    for (const field of requiredFields) {
      if (!shippingAddress[field as keyof ShippingAddress]) {
        Swal.fire({
          icon: "error",
          title: "Missing Information",
          text: `Please fill in the ${field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} field.`,
        })
        return false
      }
    }

    if (!sameAsShipping) {
      for (const field of requiredFields) {
        if (!billingAddress[field as keyof BillingAddress]) {
          Swal.fire({
            icon: "error",
            title: "Missing Billing Information",
            text: `Please fill in the billing ${field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} field.`,
          })
          return false
        }
      }
    }

    return true
  }

  const handlePlaceOrder = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      console.log("Placing order with items:", items)

      const orderData = {
        items: items.map((item) => ({
          id: Number.parseInt(item.id),
          name: item.name,
          brand: item.brand,
          price: item.price,
          quantity: item.quantity,
          image_url: item.image_url,
        })),
        shipping_address: shippingAddress,
        billing_address: sameAsShipping ? null : billingAddress,
        payment_method: paymentMethod,
        shipping_method: shippingMethod,
        notes: notes.trim() || null,
        currency: "USD",
      }

      console.log("Order data being sent:", orderData)

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()
      console.log("Order response:", result)

      if (response.ok) {
        clearCart()

        await Swal.fire({
          icon: "success",
          title: "Order Placed Successfully!",
          html: `
            <div class="text-left">
              <p><strong>Order Number:</strong> ${result.order.order_number}</p>
              <p><strong>Total:</strong> $${result.order.total_amount.toLocaleString()}</p>
              <p><strong>Items:</strong> ${result.order.items_count} item(s)</p>
              <p><strong>Payment Status:</strong> ${result.order.payment_status}</p>
              <p class="mt-3 text-sm text-gray-600">
                You will receive an email confirmation shortly with tracking information.
              </p>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: "View Order",
          cancelButtonText: "Continue Shopping",
          confirmButtonColor: "#1e293b",
        }).then((result) => {
          if (result.isConfirmed) {
            router.push("/profile?tab=orders")
          } else {
            router.push("/products")
          }
        })
      } else {
        throw new Error(result.error || "Failed to place order")
      }
    } catch (error) {
      console.error("Order placement failed:", error)
      Swal.fire({
        icon: "error",
        title: "Order Failed",
        text: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" className="p-0 h-auto">
            <Link href="/cart" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </Link>
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={shippingAddress.first_name}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, first_name: e.target.value })}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={shippingAddress.last_name}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, last_name: e.target.value })}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address_line_1">Address *</Label>
                  <Input
                    id="address_line_1"
                    value={shippingAddress.address_line_1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address_line_1: e.target.value })}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postal_code">Postal Code *</Label>
                    <Input
                      id="postal_code"
                      value={shippingAddress.postal_code}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone*</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sameAsShipping"
                    checked={sameAsShipping}
                    onChange={(e) => {
                      setSameAsShipping(e.target.checked)
                      if (e.target.checked) {
                        setBillingAddress(shippingAddress)
                      }
                    }}
                    disabled={loading}
                  />
                  <Label htmlFor="sameAsShipping">Same as shipping address</Label>
                </div>

                {!sameAsShipping && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billing_first_name">First Name *</Label>
                        <Input
                          id="billing_first_name"
                          value={billingAddress.first_name}
                          onChange={(e) => setBillingAddress({ ...billingAddress, first_name: e.target.value })}
                          disabled={loading}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="billing_last_name">Last Name *</Label>
                        <Input
                          id="billing_last_name"
                          value={billingAddress.last_name}
                          onChange={(e) => setBillingAddress({ ...billingAddress, last_name: e.target.value })}
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="billing_address_line_1">Address*</Label>
                      <Input
                        id="billing_address_line_1"
                        value={billingAddress.address_line_1}
                        onChange={(e) => setBillingAddress({ ...billingAddress, address_line_1: e.target.value })}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="billing_city">City *</Label>
                        <Input
                          id="billing_city"
                          value={billingAddress.city}
                          onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                          disabled={loading}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="billing_state">State *</Label>
                        <Input
                          id="billing_state"
                          value={billingAddress.state}
                          onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                          disabled={loading}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="billing_postal_code">Postal Code *</Label>
                        <Input
                          id="billing_postal_code"
                          value={billingAddress.postal_code}
                          onChange={(e) => setBillingAddress({ ...billingAddress, postal_code: e.target.value })}
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billing_phone">Phone</Label>
                        <Input
                          id="billing_phone"
                          type="tel"
                          value={billingAddress.phone}
                          onChange={(e) => setBillingAddress({ ...billingAddress, phone: e.target.value })}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} disabled={loading}>
                  <div className="flex items-center justify-between space-x-2 p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard">Standard Shipping (5-7 business days)</Label>
                    </div>
                    <span className="font-medium">{subtotal > 10000 ? "Free" : "Pkr.199"}</span>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} disabled={loading}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card">Cash on delivery</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any special instructions for your order..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={loading}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>Pkr. {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping ({shippingMethod})</span>
                  <span>{shipping === 0 ? "Free" : `${shipping}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>{tax.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>Pkr. {total.toLocaleString()}</span>
                </div>
                <Button
                  className="w-full bg-slate-900 hover:bg-slate-800 mt-4"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
