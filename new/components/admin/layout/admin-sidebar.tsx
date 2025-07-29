"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  BarChart3,
  Settings,
  UserPlus,
  Activity,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface AdminUser {
  id: number
  email: string
  first_name: string
  last_name: string
  role: "super_admin" | "admin" | "editor" | "viewer"
}

interface AdminSidebarProps {
  admin: AdminUser
}

export default function AdminSidebar({ admin }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      roles: ["super_admin", "admin", "editor", "viewer"],
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
      roles: ["super_admin", "admin", "editor"],
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
      roles: ["super_admin", "admin"],
    },
    {
      name: "Customers",
      href: "/admin/customers",
      icon: Users,
      roles: ["super_admin", "admin"],
    },
    {
      name: "Brands",
      href: "/admin/brands",
      icon: Tag,
      roles: ["super_admin", "admin", "editor"],
    },
    // {
    //   name: "Analytics",
    //   href: "/admin/analytics",
    //   icon: BarChart3,
    //   roles: ["super_admin", "admin"],
    // },
    {
      name: "Admin Users",
      href: "/admin/users",
      icon: UserPlus,
      roles: ["super_admin"],
    },
    // {
    //   name: "Activity Logs",
    //   href: "/admin/activity",
    //   icon: Activity,
    //   roles: ["super_admin", "admin"],
    // },
    // {
    //   name: "Settings",
    //   href: "/admin/settings",
    //   icon: Settings,
    //   roles: ["super_admin", "admin"],
    // },
  ]

  const filteredNavigation = navigation.filter((item) => item.roles.includes(admin.role))

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-800"
      case "admin":
        return "bg-blue-100 text-blue-800"
      case "editor":
        return "bg-green-100 text-green-800"
      case "viewer":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div
      className={`bg-slate-900 text-white transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"} min-h-screen flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Admin Panel</h1>
                <p className="text-xs text-gray-400">Antique Watches</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white hover:bg-slate-800"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Admin Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {admin.first_name} {admin.last_name}
              </p>
              <p className="text-xs text-gray-400 truncate">{admin.email}</p>
            </div>
          </div>
          <div className="mt-2">
            <Badge className={`text-xs ${getRoleBadgeColor(admin.role)}`}>
              {admin.role.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start text-left ${isActive
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "text-gray-300 hover:text-white hover:bg-slate-800"
                    } ${isCollapsed ? "px-2" : "px-3"}`}
                >
                  <Icon className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"}`} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-700">
          <div className="text-xs text-gray-400 space-y-1">
            <p>© 2024 Antique Watches</p>
            <p>Admin Panel v1.0</p>
          </div>
        </div>
      )}
    </div>
  )
}
