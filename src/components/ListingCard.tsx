import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatINR } from "@/lib/utils"
import type { Listing } from "@/types"

export default function ListingCard({ listing }: { listing: Listing }) {
  const img = listing.images?.[0] || "https://via.placeholder.com/300x300?text=No+Image"
  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="aspect-square overflow-hidden bg-muted">
          <img src={img} alt={listing.title} className="h-full w-full object-cover hover:scale-105 transition-transform" loading="lazy" />
        </div>
        <CardContent className="p-4 flex flex-col gap-2 flex-1">
          <h3 className="font-semibold line-clamp-2 text-sm leading-tight">{listing.title}</h3>
          <div className="flex gap-1 flex-wrap">
            <Badge variant="secondary" className="text-xs">{listing.category}</Badge>
            <Badge variant="outline" className="text-xs">{listing.condition}</Badge>
          </div>
          {listing.course_code && <p className="text-xs text-muted-foreground">{listing.course_code} {listing.subject && `• ${listing.subject}`}</p>}
          <p className="font-bold text-primary mt-auto">{formatINR(listing.price)}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
