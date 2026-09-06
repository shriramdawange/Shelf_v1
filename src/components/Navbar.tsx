"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, Search, User, LogOut, Package, Truck, LayoutDashboard, Sun, Moon, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/store/cart"
import { useTheme } from "next-themes"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function Navbar() {
  const cartCount = useCart((s) => s.count())
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    toast.success("Logged out")
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="bg-primary text-primary-foreground rounded-lg px-2 py-1">Edu</span>Swap
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/browse" className="px-3 py-2 text-sm font-medium hover:text-primary flex items-center gap-1"><Search className="h-4 w-4" />Browse</Link>
          <Link href="/listings/new" className="px-3 py-2 text-sm font-medium hover:text-primary">Sell</Link>
          <Link href="/orders" className="px-3 py-2 text-sm font-medium hover:text-primary flex items-center gap-1"><Package className="h-4 w-4" />Orders</Link>
          <Link href="/delivery" className="px-3 py-2 text-sm font-medium hover:text-primary flex items-center gap-1"><Truck className="h-4 w-4" />Delivery</Link>
          <Link href="/admin" className="px-3 py-2 text-sm font-medium hover:text-primary flex items-center gap-1"><LayoutDashboard className="h-4 w-4" />Admin</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart"><ShoppingCart className="h-5 w-5" />{cartCount > 0 && <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartCount}</span>}</Button>
          </Link>
          {user ? (
            <>
              <span className="hidden sm:inline text-sm text-muted-foreground max-w-[120px] truncate">{user.email}</span>
              <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout"><LogOut className="h-4 w-4" /></Button>
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link href="/register"><Button size="sm">Sign Up</Button></Link>
            </>
          )}
        </div>
      </div>
      <div className="md:hidden border-t flex justify-around py-2 text-xs">
        <Link href="/browse" className="flex flex-col items-center gap-1"><Search className="h-4 w-4" />Browse</Link>
        <Link href="/orders" className="flex flex-col items-center gap-1"><Package className="h-4 w-4" />Orders</Link>
        <Link href="/delivery" className="flex flex-col items-center gap-1"><Truck className="h-4 w-4" />Delivery</Link>
        <Link href="/admin" className="flex flex-col items-center gap-1"><LayoutDashboard className="h-4 w-4" />Admin</Link>
      </div>
    </header>
  )
}
