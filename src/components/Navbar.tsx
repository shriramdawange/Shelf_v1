"use client"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { ShoppingCart, Search, User, LogOut, Package, Sun, Moon, Library, BookPlus } from "lucide-react"
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
  const pathname = usePathname()
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

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/")

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto flex h-[64px] items-center justify-between px-4 gap-4">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl shrink-0">
          <span className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm"><Library className="h-5 w-5" /></span>
          <span className="tracking-tight">Shelf</span>
          <span className="hidden sm:inline text-xs font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">Books Only</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: "/browse", label: "Browse", icon: Search },
            { href: "/listings/new", label: "Sell a Book", icon: BookPlus },
            { href: "/orders", label: "Orders", icon: Package },
          ].map((item) => (
            <Link key={item.href} href={item.href} className={`px-3.5 py-2 rounded-full text-sm font-medium transition flex items-center gap-1.5 ${isActive(item.href) ? "bg-primary text-white shadow" : "hover:bg-secondary text-muted-foreground hover:text-foreground"}`}>
              <item.icon className="h-4 w-4" />{item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Cart"><ShoppingCart className="h-5 w-5" /></Button>
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-primary text-white text-[11px] font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center shadow">{cartCount}</span>}
          </Link>
          {user ? (
            <>
              <span className="hidden lg:inline text-sm text-muted-foreground max-w-[140px] truncate ml-1">{user.email}</span>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={logout} aria-label="Logout"><LogOut className="h-4 w-4" /></Button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block"><Button variant="ghost" size="sm" className="rounded-full">Login</Button></Link>
              <Link href="/register"><Button size="sm" className="rounded-full px-5 shadow-sm">Sign Up</Button></Link>
            </>
          )}
        </div>
      </div>
      <div className="md:hidden border-t bg-background/95 flex justify-around py-1 text-xs">
        {[
          { href: "/browse", label: "Browse", icon: Search },
          { href: "/listings/new", label: "Sell", icon: BookPlus },
          { href: "/orders", label: "Orders", icon: Package },
          { href: "/cart", label: "Cart", icon: ShoppingCart },
        ].map((i) => (
          <Link key={i.href} href={i.href} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl ${isActive(i.href) ? "text-primary bg-secondary" : "text-muted-foreground"}`}><i.icon className="h-4 w-4" />{i.label}</Link>
        ))}
      </div>
    </header>
  )
}
