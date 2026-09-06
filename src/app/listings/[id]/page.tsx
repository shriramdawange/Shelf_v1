import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatINR, formatDate } from "@/lib/utils"
import Link from "next/link"
import AddToCartButton from "./AddToCartButton"
import { ShieldCheck, Truck, Library, ArrowLeft } from "lucide-react"
export const dynamic = "force-dynamic"

export default async function ListingDetail({ params }: { params: { id: string } }) {
  let listing: any = null
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data } = await supabase.from("listings").select("*, profiles(*)").eq("id", params.id).single()
    listing = data
  } catch {}

  if (!listing) {
    if (params.id.startsWith("demo")) notFound()
    listing = { id: params.id, title: "Demo Book — " + params.id, description: "This is a demo listing. Configure Supabase to see real data.\n\nBuy-only flow: add to cart, checkout via Cashfree, get delivery. No chats needed.", category: "Books", subject: "Computer Science", course_code: "CS101", condition: "Good", price: 499, images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=60", "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=60"], status: "active", created_at: new Date().toISOString(), profiles: { full_name: "Demo Seller", university: "Delhi University", username: "demo" } }
  }

  const images = listing.images?.length ? listing.images : ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=60"]

  return (
    <div className="container mx-auto px-4 py-6">
      <Link href="/browse" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-4 w-4" />Back to browse</Link>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="aspect-[3/4] max-h-[560px] overflow-hidden rounded-2xl border bg-muted">
            <img src={images[0]} alt={listing.title} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img: string, i: number) => <img key={i} src={img} alt="" className="h-20 w-full object-cover rounded-xl border" />)}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap"><Badge className="rounded-full">{listing.category}</Badge><Badge variant="secondary" className="rounded-full">{listing.condition}</Badge><Badge variant="outline" className="rounded-full capitalize">{listing.status}</Badge></div>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight" style={{ fontFamily: "var(--font-display)" }}>{listing.title}</h1>
          {listing.course_code && <p className="text-sm text-muted-foreground flex items-center gap-1"><Library className="h-4 w-4" />{listing.course_code} {listing.subject && `• ${listing.subject}`}</p>}
          <p className="text-3xl font-extrabold text-primary tracking-tight">{formatINR(listing.price)}</p>
          <Card className="rounded-2xl"><CardContent className="p-4 space-y-3">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{listing.description || "No description provided."}</p>
            <p className="text-xs text-muted-foreground border-t pt-3">Listed on {formatDate(listing.created_at)} by {listing.profiles?.full_name || listing.profiles?.username || "Seller"} {listing.profiles?.university && `• ${listing.profiles.university}`}</p>
          </CardContent></Card>
          <div className="flex gap-3">
            <AddToCartButton listing={listing} />
            <Link href="/checkout" className="flex-1"><Button variant="outline" className="w-full rounded-full h-11">Buy Now</Button></Link>
          </div>
          <p className="text-xs text-center text-muted-foreground">Buy-only • No seller contact • Secure checkout</p>
          <Card className="bg-secondary/50 rounded-2xl border-dashed"><CardContent className="p-4 text-xs space-y-1.5 leading-relaxed">
            <p className="flex gap-2"><ShieldCheck className="h-4 w-4 text-green-600 shrink-0" /> Cashfree secured — UPI, Cards, NetBanking. Admin verified listing.</p>
            <p className="flex gap-2"><Truck className="h-4 w-4 text-primary shrink-0" /> ₹40 delivery fee • Pincode check at checkout • Seller gets 85% (15% platform fee)</p>
            <p className="flex gap-2"><Library className="h-4 w-4 text-orange-600 shrink-0" /> Book-only marketplace — the price you see is final.</p>
          </CardContent></Card>
        </div>
      </div>
    </div>
  )
}
