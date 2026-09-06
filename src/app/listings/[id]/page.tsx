import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatINR, formatDate } from "@/lib/utils"
import Link from "next/link"
import AddToCartButton from "./AddToCartButton"
export const dynamic = "force-dynamic"

export default async function ListingDetail({ params }: { params: { id: string } }) {
  let listing: any = null
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data } = await supabase.from("listings").select("*, profiles(*)").eq("id", params.id).single()
    listing = data
  } catch {}

  // demo fallback
  if (!listing) {
    if (params.id.startsWith("demo")) notFound()
    // try demo fallback for display
    listing = { id: params.id, title: "Demo Listing - " + params.id, description: "This is a demo listing. Configure Supabase to see real data.\nFeatures: Cashfree payments, Cloudinary images, Realtime chat.", category: "Books", subject: "CS", course_code: "CS101", condition: "Good", price: 499, images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800", "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800"], status: "active", created_at: new Date().toISOString(), profiles: { full_name: "Demo Seller", university: "Delhi University", username: "demo" } }
  }

  const images = listing.images?.length ? listing.images : ["https://via.placeholder.com/800x600?text=No+Image"]

  return (
    <div className="container mx-auto px-4 py-6 grid md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
          <img src={images[0]} alt={listing.title} className="w-full h-full object-cover" />
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((img: string, i: number) => <img key={i} src={img} alt="" className="h-20 w-full object-cover rounded-lg border" />)}
          </div>
        )}
      </div>
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap"><Badge>{listing.category}</Badge><Badge variant="secondary">{listing.condition}</Badge><Badge variant="outline">{listing.status}</Badge></div>
        <h1 className="text-2xl font-bold">{listing.title}</h1>
        {listing.course_code && <p className="text-sm text-muted-foreground">{listing.course_code} {listing.subject && `• ${listing.subject}`}</p>}
        <p className="text-3xl font-extrabold text-primary">{formatINR(listing.price)}</p>
        <Card><CardContent className="p-4 space-y-2">
          <p className="whitespace-pre-wrap text-sm">{listing.description || "No description provided."}</p>
          <p className="text-xs text-muted-foreground">Listed on {formatDate(listing.created_at)} by {listing.profiles?.full_name || listing.profiles?.username || "Seller"} {listing.profiles?.university && `• ${listing.profiles.university}`}</p>
        </CardContent></Card>
        <div className="flex gap-3">
          <AddToCartButton listing={listing} />
          <Link href="/checkout" className="flex-1"><Button variant="outline" className="w-full">Buy Now</Button></Link>
        </div>
        <Card className="bg-muted/50"><CardContent className="p-4 text-xs space-y-1">
          <p>✓ Cashfree secured payment • UPI, Cards, Netbanking</p>
          <p>✓ 15% platform fee + ₹40 delivery fee • Seller gets 85%</p>
          <p>✓ Real-time order tracking & WhatsApp-style chat</p>
        </CardContent></Card>
      </div>
    </div>
  )
}
