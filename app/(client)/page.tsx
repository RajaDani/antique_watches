"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Shield, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Watch {
  id: number;
  name: string;
  brand_name: string;
  brand_slug: string;
  price: number;
  original_price: number;
  primary_image: string;
  year_manufactured: number;
  condition_grade: string;
  category_name: string;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url: string;
}

export default function HomePage() {
  const [featuredWatches, setFeaturedWatches] = useState<Watch[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured watches
        const watchesResponse = await fetch("/api/watches");
        const watchesData = await watchesResponse.json();
        setFeaturedWatches(watchesData.watches?.slice(0, 4) || []);

        // Fetch brands
        const brandsResponse = await fetch("/api/brands");
        const brandsData = await brandsResponse.json();
        setBrands(brandsData.brands?.slice(0, 6) || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 glass opacity-70"></div>
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-4">
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                  Premium Antique Collection
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight drop-shadow-lg">
                  Timeless
                  <span className="block text-amber-400">Antique Watches</span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Discover rare and authentic vintage timepieces from the
                  world's most prestigious brands. Each watch tells a story of
                  craftsmanship and heritage.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold btn-modern shadow-xl"
                >
                  <Link href="/products">Explore Collection</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black bg-transparent btn-modern"
                >
                  Learn More
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm text-gray-400">Rare Pieces</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">50+</div>
                  <div className="text-sm text-gray-400">Luxury Brands</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">25+</div>
                  <div className="text-sm text-gray-400">Years Experience</div>
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <div className="relative z-10">
                <Image
                  src="/logo.png?height=600&width=500"
                  alt="Luxury Antique Watch"
                  width={500}
                  height={600}
                  className="rounded-2xl shadow-2xl glass"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-white to-gray-100 animate-fade-in-up">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4 card-modern glass p-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold">Authenticity Guaranteed</h3>
              <p className="text-gray-600">
                Every piece is verified by our expert horologists
              </p>
            </div>
            <div className="text-center space-y-4 card-modern glass p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">Vintage Expertise</h3>
              <p className="text-gray-600">
                25+ years of experience in antique timepieces
              </p>
            </div>
            <div className="text-center space-y-4 card-modern glass p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">Secure Shipping</h3>
              <p className="text-gray-600">
                Insured worldwide delivery with tracking
              </p>
            </div>
            <div className="text-center space-y-4 card-modern glass p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold">Premium Service</h3>
              <p className="text-gray-600">
                White-glove customer service and support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Watches */}
      <section className="py-20 animate-fade-in-up">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-amber-100 text-amber-800">
              Featured Collection
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">
              Exceptional Timepieces
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked selection of the finest antique watches from renowned
              manufacturers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredWatches.map((watch) => (
              <Card
                key={watch.id}
                className="group card-modern glass hover:shadow-2xl transition-all duration-300 border-0 shadow-lg"
              >
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={
                      watch.primary_image ||
                      "/placeholder.svg?height=300&width=300"
                    }
                    alt={watch.name}
                    width={300}
                    height={300}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-black/80 text-white">
                      {watch.year_manufactured}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500 text-white">
                      {watch.condition_grade}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      {watch.brand_name}
                    </p>
                    <h3 className="text-lg font-semibold line-clamp-2">
                      {watch.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < 4
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">(24)</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        ${watch.price?.toLocaleString()}
                      </span>
                      {watch.original_price &&
                        watch.original_price > watch.price && (
                          <span className="text-lg text-gray-500 line-through">
                            ${watch.original_price.toLocaleString()}
                          </span>
                        )}
                    </div>
                    {watch.original_price &&
                      watch.original_price > watch.price && (
                        <p className="text-sm text-green-600 font-medium">
                          Save $
                          {(
                            watch.original_price - watch.price
                          ).toLocaleString()}
                        </p>
                      )}
                  </div>

                  <Button className="w-full bg-slate-900 hover:bg-slate-800 btn-modern">
                    <Link href={`/products/${watch.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white bg-transparent btn-modern"
            >
              <Link href="/products">View All Watches</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Brands Section */}
      <section className="py-16 bg-gradient-to-br from-slate-100 to-white animate-fade-in-up">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <Badge className="bg-blue-100 text-blue-800">Featured Brands</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">
              Prestigious Brands
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore watches from the world’s most respected luxury brands
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="flex flex-col items-center card-modern glass p-4 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md mb-2">
                  <Image
                    src={brand.logo_url || "/placeholder-logo.png"}
                    alt={brand.name}
                    width={64}
                    height={64}
                    className="object-contain w-16 h-16"
                  />
                </div>
                <span className="text-sm font-semibold text-slate-900 text-center mt-2">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gradient-to-br from-white to-gray-100 animate-fade-in-up">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <Badge className="bg-green-100 text-green-800">Why Choose Us</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">
              The Antique Watches Difference
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience unmatched quality, service, and trust with every
              purchase
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card-modern glass p-8 text-center flex flex-col items-center">
              <Shield className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-lg font-bold mb-2">100% Authenticity</h3>
              <p className="text-gray-600">
                All watches are certified authentic by our expert team.
              </p>
            </div>
            <div className="card-modern glass p-8 text-center flex flex-col items-center">
              <Truck className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold mb-2">Insured Shipping</h3>
              <p className="text-gray-600">
                Safe, fast, and insured delivery worldwide.
              </p>
            </div>
            <div className="card-modern glass p-8 text-center flex flex-col items-center">
              <Star className="w-10 h-10 text-yellow-500 mb-4" />
              <h3 className="text-lg font-bold mb-2">Customer Satisfaction</h3>
              <p className="text-gray-600">
                30-day guarantee and white-glove support for every order.
              </p>
            </div>
            <div className="card-modern glass p-8 text-center flex flex-col items-center">
              <Clock className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="text-lg font-bold mb-2">Heritage & Expertise</h3>
              <p className="text-gray-600">
                Decades of experience in vintage and luxury timepieces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Keep existing Newsletter Section unchanged */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold">Stay Updated</h2>
              <p className="text-xl text-gray-300">
                Be the first to know about new arrivals and exclusive vintage
                finds
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-black"
              />
              <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8">
                Subscribe
              </Button>
            </div>

            <p className="text-sm text-gray-400">
              Join 10,000+ collectors who trust our expertise
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
