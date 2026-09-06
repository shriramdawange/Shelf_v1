"use client"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import ListingCard from "@/components/ListingCard"
import { CONDITIONS, BOOK_GENRES } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Search, SlidersHorizontal } from "lucide-react"

export default function BrowsePage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [condition, setCondition] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const supabase = createClient()

  const fetchListings = async () => {
    setLoading(true)
    try {
      let query = supabase.from("listings").select("*").eq("status", "active").order("created_at", { ascending: false })
      if (condition) query = query.eq("condition", condition)
      if (minPrice) query = query.gte("price", parseInt(minPrice))
      if (maxPrice) query = query.lte("price", parseInt(maxPrice))
      if (q) query = query.or(`title.ilike.%${q}%,subject.ilike.%${q}%,course_code.ilike.%${q}%`)
      const { data, error } = await query.limit(50)
      if (error) throw error
      setListings(data || [])
    } catch (e: any) {
      setListings([
        { id: "demo1", title: "DBMS Notes — Complete Semester (Book)", category: "Books", condition: "Like New", price: 199, images: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=60"], course_code: "CS302", subject: "Academic" },
        { id: "demo2", title: "Let Us C — Yashavant Kanetkar", category: "Books", condition: "Good", price: 300, images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=60"], course_code: "CS101", subject: "Academic" },
      ])
      if (e.message && !e.message.includes("Failed to fetch")) toast.error(e.message)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchListings() }, [])

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-wrap justify-between gap-4 items-end mb-6">
        <div><h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Browse Books</h1><p className="text-sm text-muted-foreground">Books only — curated, verified, buy-only</p></div>
        <Badge className="hidden md:inline-flex rounded-full px-3">📚 {listings.length} books found</Badge>
      </div>

      <Card className="mb-6 rounded-2xl shadow-sm">
        <CardContent className="p-4 grid md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Label>Search books</Label>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Title, author, subject, course code" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 rounded-xl" /></div>
          </div>
          <div>
            <Label>Condition</Label>
            <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={condition} onChange={(e) => setCondition(e.target.value)}>
              <option value="">All conditions</option>{CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label>Min ₹</Label>
            <Input type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="rounded-xl" />
          </div>
          <div>
            <Label>Max ₹</Label>
            <Input type="number" placeholder="5000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="rounded-xl" />
          </div>
          <div className="md:col-span-5 flex gap-2">
            <Button onClick={fetchListings} className="rounded-full gap-2"><SlidersHorizontal className="h-4 w-4" />Apply</Button>
            <Button variant="ghost" className="rounded-full" onClick={() => { setQ(""); setCondition(""); setMinPrice(""); setMaxPrice(""); }}>Clear</Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <div key={i} className="h-72 bg-muted animate-pulse rounded-2xl" />)}</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-4xl">📚</p><p className="font-medium">No books found</p><p className="text-sm text-muted-foreground">Try different keywords or price range.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center bg-secondary text-secondary-foreground px-2.5 py-1 text-xs font-medium ${className}`}>{children}</span>
}
