"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Bell, Search, LogOut, User, Settings, ExternalLink } from "lucide-react"
import Link from "next/link"

interface AdminUser {
  id: number
  email: string
  first_name: string
  last_name: string
  role: "super_admin" | "admin" | "editor" | "viewer"
}

interface AdminHeaderProps {
  admin: AdminUser
}

export default function AdminHeader({ admin }: AdminHeaderProps) {
  const router = useRouter()
  const [notifications] = useState(3)

  const handleSignOut = async () => {
    try {
      await fetch("/api/admin/auth/signout", { method: "POST" })
      router.push("/admin/signin")
      router.refresh()
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Search products, orders, customers..." className="pl-10 pr-4" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* View Store */}
          <Button variant="outline" size="sm" asChild className="bg-transparent">
            <Link href="/" target="_blank">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Store
            </Link>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                {notifications}
              </Badge>
            )}
          </Button>

          {/* Admin Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {admin.first_name[0]}
                  {admin.last_name[0]}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium">
                    {admin.first_name} {admin.last_name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{admin.role.replace("_", " ")}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">
                  {admin.first_name} {admin.last_name}
                </p>
                <p className="text-xs text-gray-500">{admin.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
