"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import AdminSidebar from "@/components/admin/layout/admin-sidebar"
import AdminHeader from "@/components/admin/layout/admin-header"

interface AdminUser {
  id: number
  email: string
  first_name: string
  last_name: string
  role: "super_admin" | "admin" | "editor" | "viewer"
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/auth/me")
      if (response.ok) {
        const data = await response.json()
        setAdmin(data.admin)
      } else {
        if (pathname !== "/admin/signin") {
          router.push("/admin/signin")
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      if (pathname !== "/admin/signin") {
        router.push("/admin/signin")
      }
    } finally {
      setLoading(false)
    }
  }

  // Don't show layout for signin page
  if (pathname === "/admin/signin") {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!admin) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar admin={admin} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader admin={admin} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
