"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { useRouter } from "next/navigation";

interface CartItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  year: string;
  condition: string;
  quantity: number;
}

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const router = useRouter();

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "vintage10") {
      setDiscount(0.1); // 10% discount
    } else if (promoCode.toLowerCase() === "collector20") {
      setDiscount(0.2); // 20% discount
    } else {
      setDiscount(0);
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = subtotal * discount;
  const shipping = subtotal > 10000 ? 0 : 150; // Free shipping over $10,000
  const tax = (subtotal - discountAmount) * 0.08; // 8% tax
  const total = subtotal - discountAmount + shipping + tax;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-400" />
            <h1 className="text-3xl font-bold">Your Cart is Empty</h1>
            <p className="text-gray-600 text-lg">
              Discover our exceptional collection of antique watches
            </p>
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800">
              <Link href="/products">Browse Watches</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" className="p-0 h-auto btn-modern">
            <Link href="/products" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-8">
          Shopping Cart ({cart.length} items)
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.id} className="glass card-modern">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative w-32 h-32 flex-shrink-0 mx-auto md:mx-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover rounded-lg shadow-md"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-black/80 text-white text-xs">
                          {item.year}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          {item.brand}
                        </p>
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <Badge className="bg-green-100 text-green-800 mt-2">
                          {item.condition}
                        </Badge>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">
                            Quantity:
                          </span>
                          <div className="flex items-center border rounded-lg bg-white/70">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="btn-modern"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="px-3 py-1 font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="btn-modern"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-bold">
                            ${(item.price * item.quantity).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            ${item.price.toLocaleString()} each
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 btn-modern"
                          onClick={() => removeFromCart(item.id)}
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
            <Card className="glass card-modern">
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
                  <span>Tax (8%)</span>
                  <span>${tax.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="rounded-lg shadow-sm"
                  />
                  <Button onClick={applyPromoCode} className="btn-modern">
                    Apply
                  </Button>
                </div>
                <Button
                  className="w-full bg-slate-900 hover:bg-slate-800 mt-4 btn-modern text-lg py-4"
                  size="lg"
                  onClick={() => router.push("/checkout")}
                >
                  Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
