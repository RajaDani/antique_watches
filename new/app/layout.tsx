import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Antique Watches - Premium Vintage Timepiece Collection",
  description:
    "Discover rare and authentic vintage watches from the world's most prestigious brands. Expert authentication, worldwide shipping, and 30-day guarantee.",
  keywords: "antique watches, vintage watches, luxury watches, Rolex, Omega, Patek Philippe, Cartier",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="logo.png" type="image/x-icon" />
      </head>
      <body className={inter.className}>
        <main>{children}</main>
      </body>
    </html>
  )
}
