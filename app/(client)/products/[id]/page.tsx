"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Heart, Share2, Shield, Clock, Truck, ArrowLeft, Plus, Minus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Product } from "@/app/admin/products/[id]/edit/page"

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
  const [watchData, setWatchData] = useState<Partial<Product>>({
    name: "",
    description: "",
    brand_id: 0,
    category_id: 0,
    reference_number: "",
    year_manufactured: new Date().getFullYear(),
    condition_grade: "Excellent",
    movement_type: "Automatic",
    case_size: "",
    case_material: "",
    dial_color: "",
    bracelet_material: "",
    water_resistance: "",
    power_reserve: "",
    price: 0,
    original_price: 0,
    cost_price: 0,
    stock_quantity: 1,
    weight: "",
    dimensions: "",
    provenance: "",
    condition_details: "",
    is_featured: false,
  })

  useMemo(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const watchesUrl = `/api/watches?id=${params.id}`
    const productResponse = await fetch(watchesUrl)
    if (productResponse.ok) {
      const productData = await productResponse.json()
      setWatchData(productData.watches)
    }
  }

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
                src={watchData.images?.length > 0 ? watchData.images[selectedImage]?.image_url : "/placeholder.svg"}
                alt={watchData.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {watchData.images?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? "border-slate-900" : "border-gray-200"
                    }`}
                >
                  <Image
                    src={image.image_url || "/placeholder.svg"}
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
                        className={`w-5 h-5 ${i < Math.floor(watchData.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-medium">{watchData.rating}</span>
                  <span className="text-gray-600">({watchData.reviews} reviews)</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <Badge className="bg-black text-white text-sm px-3 py-1">{watchData.year_manufactured}</Badge>
                <Badge className="bg-green-500 text-white text-sm px-3 py-1">{watchData.condition_grade}</Badge>
                <Badge className="bg-blue-500 text-white text-sm px-3 py-1">{watchData.movement_type}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold">${watchData.price?.toLocaleString()}</span>
                <span className="text-2xl text-gray-500 line-through">${watchData.original_price?.toLocaleString()}</span>
              </div>
              <p className="text-lg text-green-600 font-medium">
                Save ${(watchData.original_price - watchData.price).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Case Size</div>
                <div className="font-semibold">{watchData.case_size}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Movement</div>
                <div className="font-semibold">{watchData.movement_type}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Material</div>
                <div className="font-semibold">{watchData.case_material}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Water Resistance</div>
                <div className="font-semibold">{watchData.water_resistance}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Dial Color</div>
                <div className="font-semibold">{watchData.dial_color}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Bracelet Material</div>
                <div className="font-semibold">{watchData.bracelet_material}</div>
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
              <div className="text-sm text-gray-600">{watchData.stock_quantity > 0 ? "In Stock" : "Out of Stock"}</div>
            </div>

            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-slate-900 hover:bg-slate-800 text-lg py-6"
                onClick={() => { }}
                disabled={watchData.stock_quantity <= 0}
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
                  {watchData.specifications && Object.entries(watchData.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">{key}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="condition" className="p-8">
                <div className="prose max-w-none">
                  <Badge className="bg-green-500 text-white text-sm px-3 py-1">{watchData.condition_grade}</Badge>
                  <p className="text-lg leading-relaxed mt-3">{watchData.condition_details}</p>
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
