"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Heart, Share2, Shield, Clock, Truck, ArrowLeft, Plus, Minus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Mock data - in a real app, this would come from an API
const watchData = {
  id: 1,
  name: "Rolex Submariner 1960s",
  brand: "Rolex",
  price: 15000,
  originalPrice: 18000,
  images: [
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
  ],
  year: "1965",
  condition: "Excellent",
  rating: 4.9,
  reviews: 24,
  category: "Sport",
  movement: "Automatic",
  caseSize: "40mm",
  caseMaterial: "Stainless Steel",
  dialColor: "Black",
  braceletMaterial: "Stainless Steel",
  waterResistance: "200m",
  reference: "5513",
  description:
    "This exceptional 1965 Rolex Submariner represents the golden age of dive watches. Featuring the iconic black dial and bezel, this timepiece has been meticulously maintained and serviced by certified Rolex technicians. The watch retains its original bracelet and shows minimal signs of wear, making it a perfect addition to any serious collector's portfolio.",
  specifications: {
    Reference: "5513",
    Year: "1965",
    Movement: "Caliber 1520 Automatic",
    "Case Size": "40mm",
    "Case Material": "Stainless Steel",
    Dial: "Black with Luminous Markers",
    Bezel: "Unidirectional Rotating",
    Bracelet: "Oyster Bracelet",
    "Water Resistance": "200 meters",
    "Power Reserve": "48 hours",
  },
  condition_details:
    "Excellent overall condition with original patina. Case shows minimal wear with sharp edges intact. Dial is original with matching hands. Bracelet has been professionally cleaned and shows normal stretch for age. Crown is original and functions perfectly.",
  provenance:
    "Originally purchased from authorized Rolex dealer in Switzerland. Complete service history available. Comes with original box and papers.",
  inStock: true,
}

const relatedWatches = [
  {
    id: 2,
    name: "Omega Speedmaster Professional",
    brand: "Omega",
    price: 8500,
    image: "/placeholder.svg?height=200&width=200",
    year: "1969",
  },
  {
    id: 3,
    name: "Tudor Black Bay Heritage",
    brand: "Tudor",
    price: 3500,
    image: "/placeholder.svg?height=200&width=200",
    year: "1990",
  },
  {
    id: 4,
    name: "Rolex GMT-Master",
    brand: "Rolex",
    price: 22000,
    image: "/placeholder.svg?height=200&width=200",
    year: "1972",
  },
]

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <Link href="/products" className="text-gray-500 hover:text-gray-700">
            Products
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">{watchData.name}</span>
        </div>

        <Button variant="ghost" className="mb-6 p-0 h-auto">
          <Link href="/products" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              <Image
                src={watchData.images[selectedImage] || "/placeholder.svg"}
                alt={watchData.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {watchData.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? "border-slate-900" : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${watchData.name} view ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-lg text-gray-600 font-medium">{watchData.brand}</p>
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{watchData.name}</h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(watchData.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-medium">{watchData.rating}</span>
                  <span className="text-gray-600">({watchData.reviews} reviews)</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <Badge className="bg-black text-white text-sm px-3 py-1">{watchData.year}</Badge>
                <Badge className="bg-green-500 text-white text-sm px-3 py-1">{watchData.condition}</Badge>
                <Badge className="bg-blue-500 text-white text-sm px-3 py-1">{watchData.category}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold">${watchData.price.toLocaleString()}</span>
                <span className="text-2xl text-gray-500 line-through">${watchData.originalPrice.toLocaleString()}</span>
              </div>
              <p className="text-lg text-green-600 font-medium">
                Save ${(watchData.originalPrice - watchData.price).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Case Size</div>
                <div className="font-semibold">{watchData.caseSize}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Movement</div>
                <div className="font-semibold">{watchData.movement}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Material</div>
                <div className="font-semibold">{watchData.caseMaterial}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Water Resistance</div>
                <div className="font-semibold">{watchData.waterResistance}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 py-4">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <Button variant="ghost" size="sm" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-sm text-gray-600">{watchData.inStock ? "In Stock" : "Out of Stock"}</div>
            </div>

            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-slate-900 hover:bg-slate-800 text-lg py-6"
                disabled={!watchData.inStock}
              >
                Add to Cart - ${(watchData.price * quantity).toLocaleString()}
              </Button>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 bg-transparent"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isWishlisted ? "fill-current text-red-500" : ""}`} />
                  {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center space-y-2">
                <Shield className="w-8 h-8 mx-auto text-green-600" />
                <div className="text-sm font-medium">Authenticity Guaranteed</div>
              </div>
              <div className="text-center space-y-2">
                <Truck className="w-8 h-8 mx-auto text-blue-600" />
                <div className="text-sm font-medium">Insured Shipping</div>
              </div>
              <div className="text-center space-y-2">
                <Clock className="w-8 h-8 mx-auto text-purple-600" />
                <div className="text-sm font-medium">Expert Service</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="mb-16">
          <CardContent className="p-0">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="condition">Condition</TabsTrigger>
                <TabsTrigger value="provenance">Provenance</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="p-8">
                <div className="prose max-w-none">
                  <p className="text-lg leading-relaxed">{watchData.description}</p>
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(watchData.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">{key}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="condition" className="p-8">
                <div className="prose max-w-none">
                  <p className="text-lg leading-relaxed">{watchData.condition_details}</p>
                </div>
              </TabsContent>

              <TabsContent value="provenance" className="p-8">
                <div className="prose max-w-none">
                  <p className="text-lg leading-relaxed">{watchData.provenance}</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Related Products */}
        <section>
          <h2 className="text-2xl font-bold mb-8">Related Watches</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedWatches.map((watch) => (
              <Card key={watch.id} className="group hover:shadow-xl transition-all duration-300">
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={watch.image || "/placeholder.svg"}
                    alt={watch.name}
                    width={200}
                    height={200}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-black/80 text-white">{watch.year}</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 font-medium">{watch.brand}</p>
                  <h3 className="text-lg font-semibold mb-4">{watch.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">${watch.price.toLocaleString()}</span>
                    <Button size="sm">
                      <Link href={`/products/${watch.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
