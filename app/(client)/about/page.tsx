import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Shield, Award, Users, Heart, CheckCircle, Globe } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const teamMembers = [
  {
    name: "James Richardson",
    role: "Founder & Master Horologist",
    image: "/placeholder.svg?height=300&width=300",
    experience: "30+ years",
    description: "Certified master watchmaker with expertise in vintage Rolex and Patek Philippe restoration.",
  },
  {
    name: "Sarah Chen",
    role: "Authentication Specialist",
    image: "/placeholder.svg?height=300&width=300",
    experience: "15+ years",
    description: "Former Sotheby's specialist with deep knowledge of luxury watch provenance and authentication.",
  },
  {
    name: "Michael Torres",
    role: "Vintage Watch Curator",
    image: "/placeholder.svg?height=300&width=300",
    experience: "20+ years",
    description: "Expert in sourcing rare timepieces from private collections and estate sales worldwide.",
  },
  {
    name: "Emma Watson",
    role: "Customer Experience Director",
    image: "/placeholder.svg?height=300&width=300",
    experience: "12+ years",
    description: "Dedicated to providing exceptional service and building lasting relationships with collectors.",
  },
]

const milestones = [
  { year: "1998", event: "Founded as a small vintage watch shop in Geneva" },
  { year: "2003", event: "Opened first showroom in New York City" },
  { year: "2008", event: "Launched online platform for global collectors" },
  { year: "2012", event: "Achieved Certified Pre-Owned status with major brands" },
  { year: "2018", event: "Expanded to Asia with Hong Kong location" },
  { year: "2023", event: "Celebrated 25 years serving watch enthusiasts worldwide" },
]

const certifications = [
  "Certified Watch Appraiser (CWA)",
  "American Society of Appraisers Member",
  "Swiss Watch Industry Association",
  "Antiquorum Certified Dealer",
  "Christie's Preferred Partner",
  "Sotheby's Authorized Consigner",
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">Since 1998</Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  25 Years of
                  <span className="block text-amber-400">Horological Excellence</span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                  We are passionate collectors and experts dedicated to preserving the art of fine watchmaking through
                  authentic vintage timepieces from the world's most prestigious manufacturers.
                </p>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">2,500+</div>
                  <div className="text-sm text-gray-400">Watches Sold</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">50+</div>
                  <div className="text-sm text-gray-400">Countries Served</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">98%</div>
                  <div className="text-sm text-gray-400">Customer Satisfaction</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=600&width=500"
                alt="Vintage watch collection"
                width={500}
                height={600}
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Our Mission</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              To connect passionate collectors with exceptional vintage timepieces while preserving the heritage and
              craftsmanship of fine watchmaking for future generations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-0 shadow-lg">
              <CardContent className="space-y-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-2xl font-semibold">Authenticity First</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every timepiece undergoes rigorous authentication by our certified experts, ensuring you receive only
                  genuine vintage watches with verified provenance.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-0 shadow-lg">
              <CardContent className="space-y-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold">Passion Driven</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our team consists of passionate collectors and horologists who understand the emotional connection
                  between a collector and their timepiece.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-0 shadow-lg">
              <CardContent className="space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Globe className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold">Global Reach</h3>
                <p className="text-gray-600 leading-relaxed">
                  With collectors worldwide, we provide secure international shipping and comprehensive insurance for
                  your peace of mind.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Meet Our Experts</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our team combines decades of experience in horology, authentication, and customer service to provide you
              with unparalleled expertise and support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8 space-y-6">
                  <div className="relative">
                    <Image
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      width={300}
                      height={300}
                      className="w-32 h-32 rounded-full mx-auto object-cover"
                    />
                    <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white">
                      {member.experience}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-amber-600 font-medium">{member.role}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From a small vintage watch shop to a global destination for collectors, here are the key milestones in our
              25-year journey.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold">
                      {milestone.year}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Card className="p-6 border-0 shadow-sm">
                      <p className="text-lg">{milestone.event}</p>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Certifications & Memberships</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our expertise is recognized by leading industry organizations and auction houses worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <span className="font-medium">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Our Values</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              These core principles guide everything we do and shape our relationships with collectors worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold">Excellence</h3>
              <p className="text-gray-300">Striving for perfection in every aspect of our service</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">Integrity</h3>
              <p className="text-gray-300">Honest, transparent dealings with every client</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold">Community</h3>
              <p className="text-gray-300">Building lasting relationships within the collector community</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold">Heritage</h3>
              <p className="text-gray-300">Preserving horological history for future generations</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">Ready to Start Your Collection?</h2>
            <p className="text-xl text-gray-600">
              Whether you're a seasoned collector or just beginning your horological journey, we're here to help you
              find the perfect timepiece.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800">
                <Link href="/products">Browse Collection</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent">
                <Link href="/contact">Get Expert Advice</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
