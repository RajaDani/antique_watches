import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clock, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Antique Watches</h3>
                <p className="text-sm text-gray-400">Premium Vintage Collection</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              For over 25 years, we've been curating the finest collection of authentic antique watches from the world's
              most prestigious manufacturers.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm">+92 (333) 6100699</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm">info@antiquewatches.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Punjab, Pakistan</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <nav className="space-y-3">
              <Link href="/products" className="block text-gray-300 hover:text-white transition-colors">
                Browse Watches
              </Link>
              <Link href="/brands" className="block text-gray-300 hover:text-white transition-colors">
                Luxury Brands
              </Link>
              <Link href="/about" className="block text-gray-300 hover:text-white transition-colors">
                About Us
              </Link>
              <Link href="/signin" className="block text-gray-300 hover:text-white transition-colors">
                Authentication
              </Link>
              <Link href="/contact" className="block text-gray-300 hover:text-white transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          {/* Customer Service */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Customer Service</h4>
            <nav className="space-y-3">
              <Link href="/shipping" className="block text-gray-300 hover:text-white transition-colors">
                Shipping Info
              </Link>
              <Link href="/returns" className="block text-gray-300 hover:text-white transition-colors">
                Returns & Exchanges
              </Link>
              <Link href="/warranty" className="block text-gray-300 hover:text-white transition-colors">
                Warranty
              </Link>
              <Link href="/sizing" className="block text-gray-300 hover:text-white transition-colors">
                Size Guide
              </Link>
              <Link href="/care" className="block text-gray-300 hover:text-white transition-colors">
                Watch Care
              </Link>
              <Link href="/faq" className="block text-gray-300 hover:text-white transition-colors">
                FAQ
              </Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Stay Connected</h4>
            <p className="text-gray-300 text-sm">Subscribe to our newsletter for exclusive offers and new arrivals.</p>
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-gray-400"
              />
              <Button className="w-full bg-white text-slate-900 hover:bg-gray-100">Subscribe</Button>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-6">
          {/* <div className="flex flex-col md:flex-row justify-between items-center gap-4"> */}
          <p className="text-gray-400 text-sm text-center">© {new Date().getFullYear()} Antique Watches. All rights reserved.</p>
          {/* <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div> */}
          {/* </div> */}
        </div>
      </div>
    </footer>
  )
}
