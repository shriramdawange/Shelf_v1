import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, Search, ShieldCheck, Truck, BadgePercent } from "lucide-react"
import FlipkartHeroCarousel from "@/components/FlipkartHeroCarousel"
export const dynamic = "force-dynamic"

// Flipkart compact card - improved
function FCard({ l }: { l: any }) {
  const img = l.images?.[0] || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=60"
  const mrp = Math.round(l.price * 1.8)
  const off = Math.round((1 - l.price / mrp) * 100)
  return (
    <Link href={`/listings/${l.id}`} className="shrink-0 w-[160px] md:w-[180px] border rounded-lg bg-white hover:shadow-md transition-shadow p-3 flex flex-col gap-2 group">
      <div className="h-[140px] md:h-[160px] flex items-center justify-center bg-white">
        <img src={img} alt={l.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" loading="lazy" />
      </div>
      <div className="space-y-1">
        <p className="text-[13px] leading-tight line-clamp-2 font-medium h-8">{l.title}</p>
        <p className="text-xs text-[#388e3c] font-medium">Extra {off}% off</p>
        <div className="flex items-baseline gap-1">
          <span className="font-bold text-sm">₹{l.price}</span><span className="text-xs line-through text-muted-foreground">₹{mrp}</span>
        </div>
        <span className="inline-block text-[11px] bg-[#f0f8ff] text-[#2874F0] px-1.5 py-0.5 rounded border border-[#d3e7ff]">{l.condition} • {l.category}</span>
      </div>
    </Link>
  )
}

export default async function HomePage() {
  let listings: any[] = []
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data } = await supabase.from("listings").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(12)
    listings = data || []
  } catch {}

  const demo = listings.length === 0 ? [
    { id: "1", title: "Engineering Mathematics B.S. Grewal 43rd Ed", category: "Books", condition: "Good", price: 450, images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=60"], course_code: "MA101" },
    { id: "2", title: "CLRS Introduction to Algorithms 3rd Ed", category: "Books", condition: "Like New", price: 650, images: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=60"], course_code: "CS201" },
    { id: "3", title: "H.C. Verma Concepts of Physics Vol 1+2", category: "Books", condition: "Good", price: 520, images: ["https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&auto=format&fit=crop&q=60"], course_code: "PH101" },
    { id: "4", title: "Morrison Boyd Organic Chemistry 7th", category: "Books", condition: "New", price: 780, images: ["https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&auto=format&fit=crop&q=60"], course_code: "CY101" },
    { id: "5", title: "Let Us C Kanetkar - Programming", category: "Books", condition: "Good", price: 299, images: ["https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&auto=format&fit=crop&q=60"], course_code: "CS101" },
    { id: "6", title: "GATE CSE Previous Years Solved", category: "Books", condition: "Like New", price: 350, images: ["https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&auto=format&fit=crop&q=60"], course_code: "GATE" },
    { id: "7", title: "Harry Potter Box Set - Fiction", category: "Books", condition: "Like New", price: 899, images: ["https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&auto=format&fit=crop&q=60"], course_code: "FIC" },
    { id: "8", title: "NCERT Class 12 Physics + Chemistry", category: "Books", condition: "Good", price: 320, images: ["https://images.unsplash.com/photo-1526243741027-d5585c4e06d4?w=400&auto=format&fit=crop&q=60"], course_code: "NCERT" },
  ] as any[] : listings

  const topDeals = demo.slice(0, 8)
  const under399 = demo.filter((d: any) => d.price < 400).concat(demo.slice(0, 2)).slice(0, 8)

  const categories = [
    { label: "Academic", sub: "B.Tech, MBA, MBBS", img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=120&auto=format&fit=crop&q=60" },
    { label: "Fiction", sub: "Bestsellers", img: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=120&auto=format&fit=crop&q=60" },
    { label: "Non-Fiction", sub: "Self-help • Bio", img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=120&auto=format&fit=crop&q=60" },
    { label: "Competitive", sub: "GATE • JEE • NEET", img: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=120&auto=format&fit=crop&q=60" },
    { label: "School Books", sub: "NCERT 6-12", img: "https://images.unsplash.com/photo-1526243741027-d5585c4e06d4?w=120&auto=format&fit=crop&q=60" },
    { label: "Reference", sub: "Dictionaries", img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=120&auto=format&fit=crop&q=60" },
    { label: "New Arrivals", sub: "This week", img: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=120&auto=format&fit=crop&q=60" },
    { label: "Best Deals", sub: "Up to 60% off", img: "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=120&auto=format&fit=crop&q=60" },
  ]

  return (
    <div className="bg-[#f1f2f4] min-h-screen">
      {/* Flipkart-style category strip */}
      <div className="bg-white shadow-sm sticky top-[64px] z-30">
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide py-3 md:py-4 snap-x">
            {categories.map((c) => (
              <Link key={c.label} href={`/browse?genre=${encodeURIComponent(c.label)}`} className="flex flex-col items-center gap-1.5 min-w-[84px] md:min-w-[110px] snap-start group">
                <div className="h-14 w-14 md:h-16 md:w-16 rounded-full overflow-hidden bg-[#f8f8f8] border p-1 group-hover:border-[#2874F0]/30 transition-colors">
                  <img src={c.img} alt={c.label} className="h-full w-full object-cover rounded-full" />
                </div>
                <div className="text-center">
                  <p className="text-xs md:text-sm font-medium leading-tight flex items-center gap-1 justify-center">{c.label} <ChevronRight className="h-3 w-3 text-muted-foreground hidden md:inline" /></p>
                  <p className="text-[11px] text-muted-foreground hidden md:block">{c.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Hero carousel - container with Flipkart padding */}
      <div className="container mx-auto px-2 md:px-4 pt-2 md:pt-3">
        <FlipkartHeroCarousel />
      </div>

      {/* Top Deals - Flipkart card */}
      <div className="container mx-auto px-2 md:px-4 pt-2 md:pt-3">
        <div className="bg-white rounded-xl md:rounded-none shadow-sm border md:border-0">
          <div className="flex items-center justify-between px-4 py-3 md:py-4 border-b">
            <h2 className="text-lg md:text-xl font-bold">Top Deals on Books</h2>
            <Link href="/browse"><Button variant="outline" size="sm" className="rounded-full h-8 bg-[#2874F0] text-white hover:bg-[#1a5dc8] border-0 px-5 hidden md:inline-flex">View All</Button><ChevronRight className="h-5 w-5 md:hidden text-muted-foreground" /></Link>
          </div>
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth p-3 md:p-4 snap-x snap-mandatory">
              {topDeals.map((l: any) => <FCard key={l.id} l={l} />)}
            </div>
            <button className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 h-20 w-8 bg-white shadow-md rounded-r-lg items-center justify-center border"><ChevronLeft className="h-5 w-5" /></button>
            <button className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 h-20 w-8 bg-white shadow-md rounded-l-lg items-center justify-center border"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
      </div>

      {/* Two-column promo like Flipkart */}
      <div className="container mx-auto px-2 md:px-4 pt-2 md:pt-3 grid md:grid-cols-3 gap-2 md:gap-3">
        <div className="md:col-span-2 bg-white rounded-xl md:rounded-none shadow-sm border md:border-0 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b"><h3 className="font-bold">Books Under ₹399</h3><Link href="/browse?max=399" className="h-7 w-7 rounded-full bg-[#2874F0] text-white flex items-center justify-center"><ChevronRight className="h-4 w-4" /></Link></div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide p-4">
            {under399.map((l: any) => <FCard key={"u" + l.id} l={l} />)}
          </div>
        </div>
        <div className="bg-white rounded-xl md:rounded-none shadow-sm border md:border-0 p-4 flex flex-col justify-center gap-3">
          <img src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&auto=format&fit=crop&q=60" alt="ad" className="rounded-lg object-cover aspect-[4/3]" />
          <div className="space-y-1"><p className="font-bold text-sm">Clearance • Flat 60% off</p><p className="text-xs text-muted-foreground">Limited stock • Admin verified • No haggling</p><Link href="/browse"><Button size="sm" className="rounded-full bg-[#2874F0]">Shop Books</Button></Link></div>
        </div>
      </div>

      {/* Best of Academic - grid like Flipkart */}
      <div className="container mx-auto px-2 md:px-4 pt-2 md:pt-3">
        <div className="bg-white rounded-xl md:rounded-none shadow-sm border md:border-0">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div><h2 className="text-lg font-bold">Best of Academic Books</h2><p className="text-xs text-muted-foreground hidden md:block">Buy-only • Delivery ₹40 • Cashfree Secure</p></div>
            <div className="flex items-center gap-2 text-xs"><span className="hidden md:flex items-center gap-1 bg-[#e8f5e9] text-[#2e7d32] px-2 py-1 rounded-full"><ShieldCheck className="h-3 w-3" />Assured</span><Link href="/browse"><Button variant="ghost" size="sm" className="rounded-full"><Search className="h-4 w-4 mr-1" />View All</Button></Link></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y">
            {demo.slice(0, 4).map((l: any) => (
              <Link key={"grid" + l.id} href={`/listings/${l.id}`} className="p-4 hover:bg-muted/20 transition-colors group">
                <div className="aspect-square flex items-center justify-center bg-white mb-3">
                  <img src={l.images[0]} alt={l.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-sm font-medium line-clamp-2 leading-tight">{l.title}</p>
                <p className="text-xs text-[#388e3c] mt-1">From ₹{l.price}</p>
                <p className="text-xs text-muted-foreground">Buy now • No chats</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Flipkart trust footer strip */}
      <div className="container mx-auto px-2 md:px-4 pt-2 md:pt-3">
        <div className="bg-white rounded-xl md:rounded-none shadow-sm border md:border-0 px-4 py-3 flex flex-wrap gap-4 text-xs md:text-sm justify-center md:justify-between">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[#2874F0]" /> <strong>Cashfree Secure</strong> <span className="text-muted-foreground hidden sm:inline">• UPI / Card / Netbanking</span></span>
          <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-[#2874F0]" /> <strong>Delivery ₹40</strong> <span className="text-muted-foreground hidden sm:inline">• Pincode check</span></span>
          <span className="flex items-center gap-1.5"><BadgePercent className="h-4 w-4 text-[#388e3c]" /> <strong>Books Only</strong> <span className="text-muted-foreground hidden sm:inline">• Price is final, no haggling</span></span>
          <Link href="/listings/new" className="text-[#2874F0] font-medium">Become a Seller →</Link>
        </div>
      </div>

      <div className="h-4" />
    </div>
  )
}
