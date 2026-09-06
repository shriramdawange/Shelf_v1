import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import Navbar from "@/components/Navbar"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EduSwap - Educational Marketplace for Students",
  description: "Buy, sell and exchange educational materials - books, notes, lab equipment with secure Cashfree payments and doorstep delivery across India.",
  keywords: ["eduswap", "books", "notes", "education", "marketplace", "cashfree", "india"],
  manifest: "/manifest.json",
}
export const viewport = { themeColor: "#2563eb" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
          <footer className="border-t py-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} EduSwap • Made for Indian students 🇮🇳 • ₹ Payments via Cashfree
          </footer>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
