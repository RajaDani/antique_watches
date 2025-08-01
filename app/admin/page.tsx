"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
    const router = useRouter()

    useEffect(() => {
        // Redirect to dashboard when accessing /admin
        router.push("/admin/dashboard")
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Redirecting to admin dashboard...</p>
            </div>
        </div>
    )
}
