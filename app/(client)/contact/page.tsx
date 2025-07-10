"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle } from "lucide-react"

const locations = [
  {
    city: "New York",
    address: "123 Luxury Avenue, Manhattan, NY 10001",
    phone: "+1 (212) 555-0123",
    email: "ny@antiquewatches.com",
    hours: "Mon-Sat: 10AM-7PM, Sun: 12PM-5PM",
  },
  {
    city: "Geneva",
    address: "45 Rue du Rhône, 1204 Geneva, Switzerland",
    phone: "+41 22 555 0123",
    email: "geneva@antiquewatches.com",
    hours: "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM",
  },
  {
    city: "Hong Kong",
    address: "Central Building, 88 Des Voeux Road, Central",
    phone: "+852 2555 0123",
    email: "hk@antiquewatches.com",
    hours: "Mon-Sat: 10AM-8PM, Sun: 11AM-6PM",
  },
]

const faqItems = [
  {
    question: "How do you authenticate vintage watches?",
    answer:
      "Our certified horologists use advanced techniques including case examination, movement analysis, dial inspection, and provenance verification. Each watch comes with a detailed authentication certificate.",
  },
  {
    question: "Do you offer international shipping?",
    answer:
      "Yes, we ship worldwide with full insurance coverage. All shipments are tracked and require signature confirmation. Shipping costs vary by destination and insurance value.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy for all purchases. Items must be returned in original condition with all documentation. Return shipping is covered for authenticity issues.",
  },
  {
    question: "Do you accept trade-ins or consignments?",
    answer:
      "Yes, we accept high-quality vintage watches for trade-in or consignment. Our experts will evaluate your timepiece and provide a fair market assessment.",
  },
  {
    question: "Can you service vintage watches?",
    answer:
      "We work with certified watchmakers who specialize in vintage timepiece restoration and servicing. We can provide recommendations and coordinate service for your collection.",
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiry_type: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Message Sent!</h2>
              <p className="text-gray-600">Thank you for contacting us. We'll get back to you within 24 hours.</p>
            </div>
            <Button onClick={() => setIsSubmitted(false)} className="w-full">
              Send Another Message
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold">Get in Touch</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about our collection or need expert advice? Our team of horologists and collectors is here to
            help you find the perfect vintage timepiece.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name *</label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address *</label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Inquiry Type</label>
                      <Select
                        value={formData.inquiry_type}
                        onValueChange={(value) => handleInputChange("inquiry_type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="purchase">Purchase Question</SelectItem>
                          <SelectItem value="authentication">Authentication</SelectItem>
                          <SelectItem value="consignment">Consignment</SelectItem>
                          <SelectItem value="service">Watch Service</SelectItem>
                          <SelectItem value="appraisal">Appraisal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Subject *</label>
                    <Input
                      required
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message *</label>
                    <Textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Please provide details about your inquiry, including specific watch models or questions you may have..."
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-slate-900 hover:bg-slate-800"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Quick Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-gray-600">info@antiquewatches.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="font-medium">Response Time</p>
                    <p className="text-sm text-gray-600">Within 24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-medium">By Appointment</span>
                </div>
                <Badge className="w-full justify-center bg-green-100 text-green-800 mt-4">All times EST</Badge>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="shadow-lg border-0 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-amber-800">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-700 mb-3">
                  For urgent matters regarding shipped items or authentication concerns:
                </p>
                <p className="font-medium text-amber-800">+1 (555) 123-URGENT</p>
                <p className="text-xs text-amber-600 mt-2">Available 24/7</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Locations */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Our Locations</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {locations.map((location, index) => (
              <Card key={index} className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {location.city}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-gray-600">{location.address}</p>
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-gray-600">{location.phone}</p>
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-gray-600">{location.email}</p>
                  </div>
                  <div>
                    <p className="font-medium">Hours</p>
                    <p className="text-sm text-gray-600">{location.hours}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index} className="shadow-sm border-0">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-3">{item.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Additional Services */}
        <section className="mt-16 bg-slate-900 text-white rounded-2xl p-12">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold">Additional Services</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Beyond our exceptional collection, we offer comprehensive services for collectors and enthusiasts.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="font-semibold">Authentication</h3>
                <p className="text-sm text-gray-300">Professional watch authentication services</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold">Appraisals</h3>
                <p className="text-sm text-gray-300">Certified appraisals for insurance and estate</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-semibold">Consultation</h3>
                <p className="text-sm text-gray-300">Expert advice for collectors and investors</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Send className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold">Sourcing</h3>
                <p className="text-sm text-gray-300">Custom sourcing for specific timepieces</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
