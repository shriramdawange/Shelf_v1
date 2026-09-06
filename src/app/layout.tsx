import type { Metadata } from "next"
import { Inter, Fraunces } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import Navbar from "@/components/Navbar"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display" })

export const metadata: Metadata = {
  title: "Shelf — Curated Books for Students",
  description: "Discover and buy second-hand academic and fiction books. 100% buy-only marketplace — no chats, no haggling. Secure Cashfree payments, verified listings, campus delivery across India.",
  keywords: ["shelf", "books", "second hand books", "academic books", "buy books", "cashfree", "india", "student marketplace"],
  manifest: "/manifest.json",
}
export const viewport = { themeColor: "#f59e0b" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${fraunces.variable} font-sans`}>
        <ThemeProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
          <footer className="border-t bg-card/50">
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row justify-between gap-6 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-lg"><span className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white">S</span> Shelf</div>
                  <p className="text-muted-foreground max-w-xs">India&apos;s trusted buy-only bookstore for students. No DMs, no delays — just books, fairly priced.</p>
                </div>
                <div className="grid grid-cols-2 gap-8 text-sm">
                  <div className="space-y-2"><p className="font-semibold">Marketplace</p><div className="space-y-1 text-muted-foreground"><p>Browse Books</p><p>Sell a Book</p><p>How it works</p></div></div>
                  <div className="space-y-2"><p className="font-semibold">Trust</p><div className="space-y-1 text-muted-foreground"><p>Cashfree Secure</p><p>Admin Verified</p><p>Campus Delivery ₹40</p></div></div>
                </div>
              </div>
              <div className="border-t mt-8 pt-4 flex flex-col md:flex-row justify-between gap-2 text-xs text-muted-foreground">
                <span>© {new Date().getFullYear()} Shelf • Built for Indian readers 🇮🇳</span><span>Payments via Cashfree • UPI • Cards • Netbanking</span>
              </div>
            </div>
          </footer>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
