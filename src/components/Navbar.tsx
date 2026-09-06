"use client"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { ShoppingCart, Search, User, LogOut, Package, ChevronDown, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/store/cart"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function Navbar() {
  const cartCount = useCart((s) => s.count())
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [q, setQ] = useState("")
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

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) router.push(`/browse?q=${encodeURIComponent(q.trim())}`)
    else router.push("/browse")
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-[#2874F0] text-white shadow-sm">
      <div className="container mx-auto flex h-[56px] items-center gap-3 md:gap-6 px-3 md:px-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-extrabold text-xl italic tracking-tight">Shelf</span>
          <span className="hidden sm:inline text-[11px] leading-none opacity-90">Explore <span className="text-[#ffe500] font-bold">Plus</span> <span className="text-[#ffe500]">✦</span></span>
        </Link>

        <form onSubmit={onSearch} className="flex-1 max-w-[640px] hidden md:flex">
          <div className="flex w-full bg-white rounded-sm overflow-hidden h-9">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for books, authors and more" className="flex-1 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
            <button type="submit" className="px-5 text-[#2874F0] hover:bg-muted"><Search className="h-5 w-5" /></button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:gap-2">
          {user ? (
            <div className="hidden md:flex items-center gap-1 bg-white text-[#2874F0] px-4 py-1.5 rounded-sm font-bold text-sm">
              <User className="h-4 w-4" /> {user.email?.split("@")[0]}
              <button onClick={logout} className="ml-2 text-xs font-normal text-muted-foreground hover:text-foreground"><LogOut className="h-3.5 w-3.5 inline" /></button>
            </div>
          ) : (
            <Link href="/login" className="hidden md:inline-flex bg-white text-[#2874F0] px-8 py-1.5 rounded-sm font-bold text-sm">Login</Link>
          )}
          <Link href="/listings/new" className="hidden lg:inline-flex items-center gap-1 font-medium text-sm px-3"><Store className="h-4 w-4" /> Become a Seller</Link>
          <div className="hidden md:flex items-center gap-1 font-medium text-sm px-2">More <ChevronDown className="h-4 w-4" /></div>
          <Link href="/cart" className="flex items-center gap-1.5 font-bold text-sm md:font-medium px-2">
            <span className="relative"><ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />{cartCount > 0 && <span className="absolute -top-2 -right-2 bg-[#ff6161] text-white text-[11px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center border border-[#2874F0]">{cartCount}</span>}</span>
            <span className="hidden md:inline">Cart</span>
          </Link>
        </div>
      </div>

      {/* mobile search - flipkart shows below header */}
      <form onSubmit={onSearch} className="md:hidden px-3 pb-2">
        <div className="flex w-full bg-white rounded-sm overflow-hidden h-9">
          <span className="px-3 flex items-center text-muted-foreground"><Search className="h-4 w-4" /></span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for books" className="flex-1 text-sm text-foreground placeholder:text-muted-foreground outline-none pr-3" />
        </div>
      </form>

      {/* mobile bottom nav - keep minimal like Flipkart */}
      <div className="md:hidden border-t border-white/20 bg-[#2874F0] flex justify-around py-1.5 text-xs">
        <Link href="/browse" className="flex flex-col items-center gap-0.5 opacity-90"><Search className="h-4 w-4" />Browse</Link>
        <Link href="/orders" className="flex flex-col items-center gap-0.5 opacity-90"><Package className="h-4 w-4" />Orders</Link>
        <Link href="/cart" className="flex flex-col items-center gap-0.5 opacity-90"><ShoppingCart className="h-4 w-4" />Cart</Link>
      </div>
    </header>
  )
}
