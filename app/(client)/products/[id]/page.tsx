"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  Heart,
  Share2,
  Shield,
  Clock,
  Truck,
  ArrowLeft,
  Plus,
  Minus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { useRouter } from "next/navigation";

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
];

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  // --- MOCK DATA & TYPE FIXES ---
  const mockProduct = {
    id: params.id,
    name: "Rolex Submariner Vintage",
    description:
      "This rare Rolex Submariner from the early 1970s features a beautifully aged patina, original dial, and a robust automatic movement. A true collector's piece, blending history and timeless design.",
    brand: "Rolex",
    brand_id: 1,
    category_id: 1,
    reference_number: "1680",
    year_manufactured: 1972,
    condition_grade: "Excellent+ (Collector's Grade)",
    movement_type: "Automatic",
    case_size: "40mm",
    case_material: "Stainless Steel",
    dial_color: "Matte Black",
    bracelet_material: "Oyster Steel",
    water_resistance: "200m",
    power_reserve: "48 hours",
    price: 18500,
    original_price: 22000,
    cost_price: 12000,
    stock_quantity: 3,
    weight: "150g",
    dimensions: "40 x 13mm",
    provenance:
      "Originally purchased in Geneva, Switzerland. Single-owner, full service history available. Comes with original box and papers.",
    condition_details:
      "Minimal signs of wear. Case and bracelet recently polished. Movement serviced in 2022. Dial and hands are original with beautiful creamy lume.",
    is_featured: true,
    rating: 4.8,
    reviews: 37,
    images: [
      { image_url: "/placeholder.jpg" },
      { image_url: "/placeholder-logo.png" },
      { image_url: "/placeholder-user.jpg" },
      { image_url: "/placeholder-logo.svg" },
    ],
    specifications: {
      Reference: "1680",
      Year: "1972",
      "Case Size": "40mm",
      "Case Material": "Stainless Steel",
      Dial: "Matte Black, creamy lume",
      Bracelet: "Oyster Steel",
      Movement: "Rolex Caliber 1575, Automatic",
      "Power Reserve": "48 hours",
      "Water Resistance": "200m",
      Crystal: "Acrylic",
      Bezel: "Unidirectional, Black Insert",
      "Lug Width": "20mm",
      "Box & Papers": "Yes",
    },
  };
  const [watchData, setWatchData] = useState<typeof mockProduct>({
    ...mockProduct,
  });

  const { addToCart } = useCart();
  const router = useRouter();

  // --- UI ENHANCEMENTS ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm text-gray-500">
          <Link
            href="/"
            className="hover:text-slate-900 font-medium transition-colors"
          >
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <Link
            href="/products"
            className="hover:text-slate-900 font-medium transition-colors"
          >
            Products
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-slate-900 font-semibold">{watchData.name}</span>
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
            <div className="relative aspect-square bg-white rounded-xl overflow-hidden shadow-2xl border-2 border-slate-200 flex items-center justify-center">
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-slate-100 transition"
                onClick={() =>
                  setSelectedImage((prev) =>
                    prev === 0 ? (watchData.images?.length || 1) - 1 : prev - 1
                  )
                }
                aria-label="Previous image"
                style={{
                  display:
                    (watchData.images?.length || 0) > 1 ? "block" : "none",
                }}
              >
                <ArrowLeft className="w-6 h-6 text-slate-700" />
              </button>
              <Image
                src={
                  watchData.images?.[selectedImage]?.image_url ||
                  "/placeholder.svg"
                }
                alt={watchData.name || "Watch"}
                width={600}
                height={600}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-slate-100 transition"
                onClick={() =>
                  setSelectedImage((prev) =>
                    prev === (watchData.images?.length || 1) - 1 ? 0 : prev + 1
                  )
                }
                aria-label="Next image"
                style={{
                  display:
                    (watchData.images?.length || 0) > 1 ? "block" : "none",
                }}
              >
                <ArrowLeft className="w-6 h-6 text-slate-700 rotate-180" />
              </button>
              {/* Carousel Dots */}
              {watchData.images && watchData.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {watchData.images.map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-3 h-3 rounded-full border-2 ${
                        selectedImage === idx
                          ? "bg-slate-900 border-slate-900"
                          : "bg-white border-slate-300"
                      } transition`}
                      onClick={() => setSelectedImage(idx)}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
            {/* Removed thumbnail grid, replaced by carousel */}
          </div>
          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <p className="text-lg text-slate-600 font-semibold tracking-wide mb-1 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                {watchData.brand}
              </p>
              <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 text-slate-900 tracking-tight drop-shadow-sm">
                {watchData.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(watchData.rating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-slate-700">
                  {watchData.rating}
                </span>
                <span className="text-gray-500">
                  ({watchData.reviews} reviews)
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-extrabold text-slate-900 drop-shadow-sm">
                  ${watchData.price?.toLocaleString()}
                </span>
                <span className="text-2xl text-gray-400 line-through">
                  ${watchData.original_price?.toLocaleString()}
                </span>
                <Badge className="bg-green-500/90 text-white text-base px-3 py-1 ml-2 shadow">
                  Save $
                  {(
                    (watchData.original_price || 0) - (watchData.price || 0)
                  ).toLocaleString()}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                  <Shield className="w-4 h-4 mr-1 text-green-500" />{" "}
                  Authenticity Guaranteed
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                  <Truck className="w-4 h-4 mr-1 text-blue-500" /> Insured
                  Shipping
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                  <Clock className="w-4 h-4 mr-1 text-purple-500" /> Expert
                  Service
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Case Size</div>
                <div className="font-semibold text-lg">
                  {watchData.case_size}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Movement</div>
                <div className="font-semibold text-lg">
                  {watchData.movement_type}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Material</div>
                <div className="font-semibold text-lg">
                  {watchData.case_material}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Water Resistance</div>
                <div className="font-semibold text-lg">
                  {watchData.water_resistance}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Dial Color</div>
                <div className="font-semibold text-lg">
                  {watchData.dial_color}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Bracelet Material</div>
                <div className="font-semibold text-lg">
                  {watchData.bracelet_material}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 py-4">
              <div className="flex items-center border rounded-lg shadow-sm bg-white">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-4 py-2 font-medium text-lg">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div
                className={`text-sm font-semibold ${
                  watchData.stock_quantity && watchData.stock_quantity > 0
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {watchData.stock_quantity && watchData.stock_quantity > 0
                  ? "In Stock"
                  : "Out of Stock"}
              </div>
            </div>
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-slate-900 hover:bg-slate-800 text-lg py-6 shadow-xl"
                onClick={() => {
                  if (!watchData.id || !watchData.name || !watchData.price)
                    return;
                  addToCart({
                    id: String(watchData.id),
                    name: watchData.name,
                    price: watchData.price,
                    image:
                      watchData.images?.[0]?.image_url || "/placeholder.svg",
                    quantity,
                  });
                }}
                disabled={
                  !watchData.stock_quantity || watchData.stock_quantity <= 0
                }
              >
                Add to Cart - $
                {(watchData.price || 0 * quantity).toLocaleString()}
              </Button>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className={`flex-1 bg-white border-2 ${
                    isWishlisted ? "border-red-400" : "border-slate-200"
                  } transition-all`}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart
                    className={`w-5 h-5 mr-2 ${
                      isWishlisted
                        ? "fill-current text-red-500"
                        : "text-slate-400"
                    }`}
                  />
                  {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 bg-white border-2 border-slate-200"
                >
                  <Share2 className="w-5 h-5 mr-2 text-slate-400" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Product Details Tabs */}
        <Card className="mb-16 shadow-xl border-2 border-slate-200">
          <CardContent className="p-0">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4 rounded-none border-b bg-slate-50">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="condition">Condition</TabsTrigger>
                <TabsTrigger value="provenance">Provenance</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="p-8">
                <div className="prose max-w-none text-lg text-slate-700">
                  <p>{watchData.description}</p>
                </div>
              </TabsContent>
              <TabsContent value="specifications" className="p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {watchData.specifications &&
                    Object.entries(watchData.specifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between py-2 border-b border-gray-100 text-base"
                        >
                          <span className="font-medium text-gray-600">
                            {key}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {String(value)}
                          </span>
                        </div>
                      )
                    )}
                </div>
              </TabsContent>
              <TabsContent value="condition" className="p-8">
                <div className="prose max-w-none">
                  <Badge className="bg-green-500 text-white text-sm px-3 py-1">
                    {watchData.condition_grade}
                  </Badge>
                  <p className="text-lg leading-relaxed mt-3 text-slate-700">
                    {watchData.condition_details}
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="provenance" className="p-8">
                <div className="prose max-w-none">
                  <p className="text-lg leading-relaxed text-slate-700">
                    {watchData.provenance}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        {/* Related Products */}
        <section>
          <h2 className="text-2xl font-bold mb-8 text-slate-900">
            Related Watches
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {relatedWatches.map((watch) => (
              <Card
                key={watch.id}
                className="group hover:shadow-2xl transition-all duration-300 border-2 border-slate-200 hover:border-slate-400 bg-white rounded-xl overflow-hidden"
              >
                <div className="relative overflow-hidden rounded-t-xl">
                  <Image
                    src={watch.image || "/placeholder.svg"}
                    alt={watch.name}
                    width={200}
                    height={200}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-black/80 text-white shadow">
                      {watch.year}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    {watch.brand}
                  </p>
                  <h3 className="text-lg font-semibold mb-4 text-slate-900">
                    {watch.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-slate-900">
                      ${watch.price.toLocaleString()}
                    </span>
                    <Button
                      size="sm"
                      className="bg-slate-900 text-white hover:bg-slate-800"
                    >
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
  );
}
