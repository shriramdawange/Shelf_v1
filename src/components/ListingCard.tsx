import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatINR } from "@/lib/utils"
import type { Listing } from "@/types"

export default function ListingCard({ listing }: { listing: Listing }) {
  const img = listing.images?.[0] || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=60"
  return (
    <Link href={`/listings/${listing.id}`} className="group">
      <div className="overflow-hidden rounded-2xl border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full book-shadow">
        <div className="aspect-[3/4] overflow-hidden bg-muted relative">
          <img src={img} alt={listing.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          <div className="absolute top-3 left-3 flex gap-1">
            <Badge className="bg-white/90 text-foreground backdrop-blur text-xs shadow">{listing.condition}</Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-3">
            <Badge variant="secondary" className="text-xs bg-white text-foreground">{listing.category}</Badge>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-2 flex-1">
          <h3 className="font-semibold line-clamp-2 text-[14px] leading-snug group-hover:text-primary transition-colors" style={{ fontFamily: "var(--font-display)" }}>{listing.title}</h3>
          {listing.course_code && <p className="text-xs text-muted-foreground line-clamp-1">{listing.course_code} {listing.subject && `• ${listing.subject}`}</p>}
          <div className="mt-auto flex items-center justify-between pt-2">
            <p className="font-bold text-primary text-base">{formatINR(listing.price)}</p>
            <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">Buy Now</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
