"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Watch {
    id: number
    name: string
    price: number
    primary_image: string
    brand_name: string
    brand_slug: string
}

interface SearchDropdownProps {
    className?: string
    placeholder?: string
    isMobile?: boolean
}

export default function SearchDropdown({
    className,
    placeholder = "Search vintage watches...",
    isMobile = false,
}: SearchDropdownProps) {
    const [query, setQuery] = useState("")
    const [watches, setWatches] = useState<Watch[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)

    const searchRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.trim().length >= 2) {
                searchWatches(query)
            } else {
                setWatches([])
                setIsOpen(false)
            }
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [query])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setSelectedIndex(-1)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const searchWatches = async (searchQuery: string) => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
            const data = await response.json()
            setWatches(data.watches || [])
            setIsOpen(true)
            setSelectedIndex(-1)
        } catch (error) {
            console.error("Search failed:", error)
            setWatches([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || watches.length === 0) return

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault()
                setSelectedIndex((prev) => (prev < watches.length - 1 ? prev + 1 : prev))
                break
            case "ArrowUp":
                e.preventDefault()
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
                break
            case "Enter":
                e.preventDefault()
                if (selectedIndex >= 0 && watches[selectedIndex]) {
                    window.location.href = `/products/${watches[selectedIndex].id}`
                }
                break
            case "Escape":
                setIsOpen(false)
                setSelectedIndex(-1)
                inputRef.current?.blur()
                break
        }
    }

    const handleWatchClick = (watchId: number) => {
        setIsOpen(false)
        setQuery("")
        setSelectedIndex(-1)
    }

    return (
        <div ref={searchRef} className={cn("relative", className)}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (watches.length > 0) setIsOpen(true)
                    }}
                    className={cn(
                        "pl-10 pr-4 rounded-lg shadow-sm focus:ring-2 focus:ring-slate-900 transition-all duration-200",
                        isMobile ? "text-base" : "",
                    )}
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-slate-900"></div>
                    </div>
                )}
            </div>

            {/* Search Results Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    {watches.length > 0 ? (
                        <>
                            <div className="px-4 py-2 text-sm text-gray-500 border-b">
                                Found {watches.length} result{watches.length !== 1 ? "s" : ""}
                            </div>
                            {watches.map((watch, index) => (
                                <Link
                                    key={watch.id}
                                    href={`/products/${watch.id}`}
                                    onClick={() => handleWatchClick(watch.id)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0",
                                        selectedIndex === index && "bg-gray-50",
                                    )}
                                >
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        {watch.primary_image ? (
                                            <Image
                                                src={watch.primary_image || "/placeholder.svg"}
                                                alt={watch.name}
                                                fill
                                                className="object-cover"
                                                sizes="48px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Clock className="w-6 h-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 truncate">{watch.name}</h4>
                                        <p className="text-sm text-gray-500">{watch.brand_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">${watch.price?.toLocaleString()}</p>
                                    </div>
                                </Link>
                            ))}
                            <div className="px-4 py-3 border-t bg-gray-50">
                                <Link
                                    href={`/products?search=${encodeURIComponent(query)}`}
                                    className="text-sm text-slate-900 hover:text-slate-700 font-medium"
                                    onClick={() => {
                                        setIsOpen(false)
                                        setQuery("")
                                    }}
                                >
                                    View all results for "{query}" →
                                </Link>
                            </div>
                        </>
                    ) : query.trim().length >= 2 && !isLoading ? (
                        <div className="px-4 py-8 text-center text-gray-500">
                            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p>No watches found for "{query}"</p>
                            <p className="text-sm mt-1">Try searching with different keywords</p>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    )
}
