import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, Truck, ShieldCheck, IndianRupee } from "lucide-react"
import ListingCard from "@/components/ListingCard"
export const dynamic = "force-dynamic"

export default async function HomePage() {
  let listings: any[] = []
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data } = await supabase.from("listings").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(8)
    listings = data || []
  } catch {}

  // Fallback demo data if Supabase not configured
  const demo = listings.length === 0 ? [
    { id: "1", title: "Engineering Mathematics by B.S. Grewal - 43rd Edition", category: "Books", condition: "Good", price: 450, images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"], course_code: "MA101", subject: "Mathematics" },
    { id: "2", title: "Data Structures Handwritten Notes (GATE)", category: "Notes", condition: "Like New", price: 250, images: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400"], course_code: "CS201", subject: "DSA" },
    { id: "3", title: "Arduino Uno Kit - Lab Equipment", category: "Lab Equipment", condition: "New", price: 1200, images: ["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400"], course_code: "EC301", subject: "Embedded" },
    { id: "4", title: "Scientific Calculator Casio FX-991EX", category: "Electronics", condition: "Good", price: 900, images: ["https://images.unsplash.com/photo-1587145820266-a5951ee0132f?w=400"], course_code: "ALL", subject: "General" },
  ] as any[] : listings

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/30 border-b">
        <div className="container mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <Badge variant="secondary" className="text-sm">🇮🇳 Trusted by 10,000+ students across India</Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Buy & Sell <span className="text-primary">Study Material</span> on Campus</h1>
            <p className="text-lg text-muted-foreground">Books, notes, lab kits at 50% off. Secure payments via Cashfree, doorstep delivery, and real-time chat with sellers.</p>
            <div className="flex gap-3">
              <Link href="/browse"><Button size="lg" className="gap-2"><Search className="h-4 w-4" />Browse Listings</Button></Link>
              <Link href="/listings/new"><Button size="lg" variant="outline">Sell an Item</Button></Link>
            </div>
            <div className="flex gap-6 text-sm">
              <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-green-600" />Cashfree Secure</span>
              <span className="flex items-center gap-1"><Truck className="h-4 w-4 text-primary" />Campus Delivery</span>
              <span className="flex items-center gap-1"><IndianRupee className="h-4 w-4 text-orange-600" />UPI / Cards</span>
            </div>
          </div>
          <div className="hidden md:block">
            <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600" alt="Students" className="rounded-2xl shadow-2xl object-cover" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, title: "Verified Listings", desc: "Moderated by admins" },
          { icon: ShieldCheck, title: "Secure Payments", desc: "Cashfree PG & Payouts" },
          { icon: Truck, title: "Quick Delivery", desc: "₹30-50 campus delivery" },
          { icon: Search, title: "Smart Search", desc: "By course code & subject" },
        ].map((f) => (
          <Card key={f.title}><CardContent className="p-6 text-center space-y-2"><f.icon className="h-8 w-8 mx-auto text-primary" /><h3 className="font-semibold">{f.title}</h3><p className="text-xs text-muted-foreground">{f.desc}</p></CardContent></Card>
        ))}
      </section>

      {/* Featured listings */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Listings</h2>
          <Link href="/browse"><Button variant="ghost">View all →</Button></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {demo.map((l: any) => <ListingCard key={l.id} listing={l} />)}
        </div>
      </section>

      {/* India context */}
      <section className="bg-muted/50 border-y">
        <div className="container mx-auto px-4 py-8 text-center space-y-3">
          <h3 className="font-semibold">How EduSwap Works</h3>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="p-4 bg-card rounded-lg border"><strong>1. List</strong><br />Upload photos to Cloudinary, set price in ₹</div>
            <div className="p-4 bg-card rounded-lg border"><strong>2. Order</strong><br />Buyer pays via Cashfree (UPI/Card)</div>
            <div className="p-4 bg-card rounded-lg border"><strong>3. Deliver</strong><br />Partner picks up & updates status live</div>
            <div className="p-4 bg-card rounded-lg border"><strong>4. Earn</strong><br />Seller gets payout (85% after 15% fee)</div>
          </div>
          <p className="text-xs text-muted-foreground">Pincode-based delivery • GST invoice optional • WhatsApp support • Hindi/English ready</p>
        </div>
      </section>
    </div>
  )
}
