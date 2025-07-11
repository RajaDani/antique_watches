import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { CartProvider } from "../../components/cart-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Antique Watches - Premium Vintage Timepiece Collection",
  description:
    "Discover rare and authentic vintage watches from the world's most prestigious brands. Expert authentication, worldwide shipping, and 30-day guarantee.",
  keywords:
    "antique watches, vintage watches, luxury watches, Rolex, Omega, Patek Philippe, Cartier",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <html lang="en">
        <body className={inter.className}>
          <Header />
          <main>{children}</main>
          <Footer />
        </body>
      </html>
    </CartProvider>
  );
}
