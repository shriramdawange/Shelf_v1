import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, Truck, ShieldCheck, Sparkles, ArrowRight, Library, GraduationCap } from "lucide-react"
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

  const demo = listings.length === 0 ? [
    { id: "1", title: "Engineering Mathematics by B.S. Grewal — 43rd Edition", category: "Books", condition: "Good", price: 450, images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=60"], course_code: "MA101", subject: "Mathematics" },
    { id: "2", title: "Introduction to Algorithms (CLRS) — 3rd Edition", category: "Books", condition: "Like New", price: 650, images: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=60"], course_code: "CS201", subject: "DSA" },
    { id: "3", title: "Concepts of Physics by H.C. Verma — Vol 1 & 2", category: "Books", condition: "Good", price: 520, images: ["https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=60"], course_code: "PH101", subject: "Physics" },
    { id: "4", title: "Organic Chemistry by Morrison & Boyd — 7th Ed", category: "Books", condition: "New", price: 780, images: ["https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=60"], course_code: "CY101", subject: "Chemistry" },
  ] as any[] : listings

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative border-b overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary shelf-pattern" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-primary/5" />
        <div className="container mx-auto px-4 py-12 md:py-20 relative grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Buy-only • No chats • No haggling — just books</Badge>
            <h1 className="text-4xl md:text-[48px] font-bold leading-[1.05] tracking-tight text-balance" style={{ fontFamily: "var(--font-display)" }}>
              A calm, curated<br /><span className="text-primary">bookstore for students</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">Second-hand academic & fiction books at 40–60% off. Sellers list, buyers buy — verified by admins, paid via Cashfree, delivered to your campus. Zero DMs.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/browse"><Button size="lg" className="rounded-full px-7 gap-2 shadow-md h-12">Browse Books <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link href="/listings/new"><Button size="lg" variant="outline" className="rounded-full px-7 h-12 gap-2"><Library className="h-4 w-4" />Sell a Book</Button></Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm pt-2">
              <span className="flex items-center gap-1.5 bg-card border px-3 py-1.5 rounded-full shadow-sm"><ShieldCheck className="h-4 w-4 text-green-600" />Cashfree Secure</span>
              <span className="flex items-center gap-1.5 bg-card border px-3 py-1.5 rounded-full shadow-sm"><Truck className="h-4 w-4 text-primary" />Delivery ₹40</span>
              <span className="flex items-center gap-1.5 bg-card border px-3 py-1.5 rounded-full shadow-sm"><GraduationCap className="h-4 w-4 text-orange-600" />Admin Verified</span>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-secondary rounded-[32px] blur-2xl opacity-50" />
            <img src="https://images.unsplash.com/photo-1526243741027-d5585c4e06d4?w=700&auto=format&fit=crop&q=60" alt="Library" className="relative rounded-[24px] shadow-2xl object-cover aspect-[4/3] book-shadow" />
            <Card className="absolute -bottom-6 -left-6 p-4 shadow-xl rounded-2xl border-0 bg-white dark:bg-card max-w-[260px]">
              <CardContent className="p-0 flex gap-3">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><BookOpen className="h-6 w-6 text-primary" /></div>
                <div><p className="font-semibold text-sm">Only Books</p><p className="text-xs text-muted-foreground">Academic, Fiction, Non-Fiction. No notes, no equipment — pure reading.</p></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust rail */}
      <section className="container mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: BookOpen, title: "Verified Listings", desc: "Every book moderated" },
          { icon: ShieldCheck, title: "Secure Checkout", desc: "Cashfree UPI / Cards" },
          { icon: Truck, title: "Campus Delivery", desc: "₹40 • Pincode based" },
          { icon: Search, title: "Smart Discover", desc: "By title, subject, code" },
        ].map((f) => (
          <Card key={f.title} className="rounded-2xl border bg-card hover:shadow-md transition-shadow"><CardContent className="p-5 text-center space-y-2"><f.icon className="h-7 w-7 mx-auto text-primary" /><h3 className="font-semibold text-sm">{f.title}</h3><p className="text-xs text-muted-foreground">{f.desc}</p></CardContent></Card>
        ))}
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div><h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Featured Books</h2><p className="text-sm text-muted-foreground">Handpicked for this semester — refresh daily</p></div>
          <Link href="/browse" className="hidden sm:inline-flex"><Button variant="ghost" className="rounded-full">View all <ArrowRight className="h-4 w-4 ml-1" /></Button></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {demo.map((l: any) => <ListingCard key={l.id} listing={l} />)}
        </div>
      </section>

      {/* How it works - buy only */}
      <section className="border-y bg-muted/20">
        <div className="container mx-auto px-4 py-10">
          <h3 className="font-bold text-center text-xl mb-6" style={{ fontFamily: "var(--font-display)" }}>How Shelf Works — Buy Only</h3>
          <div className="grid md:grid-cols-4 gap-4 text-sm max-w-5xl mx-auto">
            {[
              { step: "01", title: "Seller Lists a Book", desc: "Photos + price in ₹. Admin verifies." },
              { step: "02", title: "Buyer Adds to Cart", desc: "No contact needed. Checkout instantly." },
              { step: "03", title: "Secure Payment", desc: "Cashfree UPI/Card → order confirmed." },
              { step: "04", title: "Delivery & Payout", desc: "Partner delivers • Seller gets 85% payout." },
            ].map((s) => (
              <div key={s.step} className="p-5 bg-card rounded-2xl border shadow-sm space-y-2">
                <span className="text-xs font-bold tracking-widest text-primary">{s.step}</span>
                <p className="font-semibold">{s.title}</p><p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">No chats • No exchange • No negotiation — the price you see is the price you pay.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-10">
        <Card className="rounded-[24px] border-0 bg-primary text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <CardContent className="p-8 md:p-10 relative flex flex-col md:flex-row justify-between gap-6 items-center">
            <div><h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Got books to sell?</h3><p className="text-white/80 text-sm mt-1">List in 45 seconds. Cloudinary CDN, auto-optimized.</p></div>
            <Link href="/listings/new"><Button variant="secondary" className="rounded-full bg-white text-primary hover:bg-white/90 gap-2">Sell a Book <ArrowRight className="h-4 w-4" /></Button></Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
