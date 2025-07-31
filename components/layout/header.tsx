"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, ShoppingCart, Heart, Menu, X, Clock, LogOut, User, Package, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/cart-context"
import Image from "next/image"

interface UserInterface {
  id: number
  email: string
  first_name: string
  last_name: string
}

interface SearchResult {
  id: number
  name: string
  price: number
  primary_image?: string
  brand_name: string
  brand_slug: string
}

export default function Header() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<UserInterface | null>(null)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)

  const { items } = useCart()
  const cartCount = items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Watches", href: "/products" },
    { name: "Brands", href: "/brands" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  useEffect(() => {
    checkAuthStatus()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        fetchWishlistCount()
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    }
  }

  const fetchWishlistCount = async () => {
    try {
      const response = await fetch("/api/wishlist")
      if (response.ok) {
        const data = await response.json()
        setWishlistCount(data.wishlist?.length || 0)
      }
    } catch (error) {
      console.error("Failed to fetch wishlist count:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" })
      setUser(null)
      setWishlistCount(0)
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.watches || [])
        setShowSearchResults(true)
      }
    } catch (error) {
      console.error("Search failed:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSearch()
    }
  }

  const handleSearchResultClick = (productId: number) => {
    setShowSearchResults(false)
    setSearchQuery("")
    router.push(`/products/${productId}`)
  }

  const SearchDropdown = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={`absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto ${isMobile ? "mt-2" : "mt-1"}`}
    >
      {isSearching ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Searching...</span>
        </div>
      ) : searchResults.length > 0 ? (
        <>
          <div className="p-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{searchResults.length} results found</span>
          </div>
          {searchResults.map((watch) => (
            <div
              key={watch.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
              onClick={() => handleSearchResultClick(watch.id)}
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {watch.primary_image ? (
                  <Image
                    src={watch.primary_image?.image_url || "/placeholder.svg"}
                    alt={watch.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Clock className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{watch.name}</h4>
                <p className="text-sm text-gray-600">{watch.brand_name}</p>
                <p className="text-sm font-semibold text-slate-900">Pkr. {watch.price?.toLocaleString()}</p>
              </div>
            </div>
          ))}
          <div className="p-3 border-t border-gray-100">
            <Link
              href={`/products?search=${encodeURIComponent(searchQuery)}`}
              className="text-sm text-slate-900 hover:underline font-medium"
              onClick={() => setShowSearchResults(false)}
            >
              View all results →
            </Link>
          </div>
        </>
      ) : searchQuery.length >= 2 ? (
        <div className="p-4 text-center text-gray-600">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p>No watches found for "{searchQuery}"</p>
        </div>
      ) : null}
    </div>
  )

  return (
    <header className="glass shadow-lg border-b sticky top-0 z-50 transition-all duration-300">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-6">
              <span>📞 +92 (333) 6100699</span>
              <span>✉️ info@antiquewatches.com</span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <span>Free shipping on orders over Pkr. 10,000</span>
              <span>|</span>
              <span>30-day authenticity guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover-lift">
            <div className="w-10 h-10 bg-gradient-to-tr from-slate-900 to-slate-700 rounded-full flex items-center justify-center shadow-md">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">Antique Watches</h1>
              <p className="text-xs text-gray-600 font-medium">Premium Vintage Collection</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 ml-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative text-gray-700 hover:text-slate-900 font-semibold transition-colors after:content-[''] after:block after:h-0.5 after:bg-gradient-to-r after:from-slate-900 after:to-slate-700 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left px-2 py-1"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8" ref={searchRef}>
            <div className="relative w-full flex">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search vintage watches..."
                  className="pl-10 pr-4 rounded-l-lg rounded-r-none shadow-sm focus:ring-2 focus:ring-slate-900 border-r-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching || searchQuery.trim().length < 2}
                className="rounded-l-none rounded-r-lg bg-slate-900 hover:bg-slate-800 px-4"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
              {showSearchResults && <SearchDropdown />}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {/* Search - Mobile */}
            <Button variant="ghost" size="sm" className="md:hidden btn-modern">
              <Search className="w-5 h-5" />
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="sm" className="relative btn-modern">
              <Link href="/wishlist">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                    {wishlistCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="sm" className="relative btn-modern">
              <Link href="/cart" className="flex items-center">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center p-0">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-medium">
                      {user.first_name[0]}
                      {user.last_name[0]}
                    </div>
                    <span className="hidden sm:inline">{user.first_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile?tab=orders" className="flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist" className="flex items-center">
                      <Heart className="w-4 h-4 mr-2" />
                      Wishlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/signin">Sign In</Link>
                </Button>
                <Button size="sm" className="bg-slate-900 hover:bg-slate-800" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden btn-modern"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 transition-transform duration-300 rotate-90" />
              ) : (
                <Menu className="w-5 h-5 transition-transform duration-300" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-4" ref={mobileSearchRef}>
        <div className="relative flex">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search vintage watches..."
              className="pl-10 pr-4 rounded-l-lg rounded-r-none border-r-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching || searchQuery.trim().length < 2}
            className="rounded-l-none rounded-r-lg bg-slate-900 hover:bg-slate-800 px-4"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
          {showSearchResults && <SearchDropdown isMobile />}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="lg:hidden bg-white/90 glass shadow-md px-6 py-4 animate-slide-down">
          <ul className="flex flex-col gap-4">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="block text-slate-900 font-semibold py-2 px-2 rounded-lg hover:bg-gradient-to-r hover:from-slate-900 hover:to-slate-700 hover:text-white transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
