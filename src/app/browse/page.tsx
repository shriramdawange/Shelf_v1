"use client"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import ListingCard from "@/components/ListingCard"
import { CATEGORIES, CONDITIONS, formatINR } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function BrowsePage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [category, setCategory] = useState("")
  const [condition, setCondition] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const supabase = createClient()

  const fetchListings = async () => {
    setLoading(true)
    try {
      let query = supabase.from("listings").select("*").eq("status", "active").order("created_at", { ascending: false })
      if (category) query = query.eq("category", category)
      if (condition) query = query.eq("condition", condition)
      if (minPrice) query = query.gte("price", parseInt(minPrice))
      if (maxPrice) query = query.lte("price", parseInt(maxPrice))
      if (q) query = query.or(`title.ilike.%${q}%,subject.ilike.%${q}%,course_code.ilike.%${q}%`)
      const { data, error } = await query.limit(50)
      if (error) throw error
      setListings(data || [])
      if ((data || []).length === 0 && !error) {
        // show demo fallback hint
      }
    } catch (e: any) {
      // fallback demo data when supabase not configured
      setListings([
        { id: "demo1", title: "DBMS Notes - Complete Semester", category: "Notes", condition: "Like New", price: 199, images: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400"], course_code: "CS302" },
        { id: "demo2", title: "Let Us C - Yashavant Kanetkar", category: "Books", condition: "Good", price: 300, images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"], course_code: "CS101" },
      ])
      if (e.message?.includes("not configured") || e.message?.includes("Failed to fetch")) {
        // silent demo
      } else toast.error(e.message)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchListings() }, [])

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Browse Educational Items</h1>
      <Card className="mb-6">
        <CardContent className="p-4 grid md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <Label>Search (title, subject, course code)</Label>
            <Input placeholder="e.g. CS201, DSA, Engineering" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div>
            <Label>Category</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All</option>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label>Condition</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={condition} onChange={(e) => setCondition(e.target.value)}>
              <option value="">All</option>{CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label>Min ₹</Label>
            <Input type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          </div>
          <div>
            <Label>Max ₹</Label>
            <Input type="number" placeholder="5000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </div>
          <div className="md:col-span-6">
            <Button onClick={fetchListings} className="w-full md:w-auto">Apply Filters</Button>
            <Button variant="ghost" onClick={() => { setQ(""); setCategory(""); setCondition(""); setMinPrice(""); setMaxPrice(""); }} className="ml-2">Clear</Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-4xl">📭</p><p className="font-medium">No results found</p><p className="text-sm text-muted-foreground">Try adjusting filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  )
}
