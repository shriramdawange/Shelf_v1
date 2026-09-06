"use client"
import { useCart } from "@/store/cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatINR } from "@/lib/utils"
import Link from "next/link"
import { Trash2 } from "lucide-react"

export default function CartPage() {
  const { items, remove, total, clear } = useCart()
  const subtotal = total()
  const deliveryFee = items.length > 0 ? 40 : 0
  const platformFee = Math.round(subtotal * 0.15)
  const grandTotal = subtotal + deliveryFee + platformFee

  if (items.length === 0) return <div className="container mx-auto px-4 py-16 text-center space-y-4"><p className="text-5xl">🛒</p><h2 className="text-xl font-semibold">Your cart is empty</h2><p className="text-sm text-muted-foreground">Browse listings and add items to cart.</p><Link href="/browse"><Button>Browse Now</Button></Link></div>

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Cart ({items.length})</h1>
      <div className="space-y-4">
        {items.map(({ listing }) => (
          <Card key={listing.id}>
            <CardContent className="p-4 flex gap-4">
              <img src={listing.images?.[0] || "https://via.placeholder.com/100"} alt={listing.title} className="h-20 w-20 object-cover rounded-lg border" />
              <div className="flex-1">
                <h3 className="font-medium text-sm line-clamp-2">{listing.title}</h3>
                <p className="text-xs text-muted-foreground">{listing.category} • {listing.condition}</p>
                <p className="font-bold text-primary">{formatINR(listing.price)}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(listing.id)}><Trash2 className="h-4 w-4" /></Button>
            </CardContent>
          </Card>
        ))}
        <Card><CardContent className="p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
          <div className="flex justify-between"><span>Platform fee (15%)</span><span>{formatINR(platformFee)}</span></div>
          <div className="flex justify-between"><span>Delivery fee</span><span>{formatINR(deliveryFee)}</span></div>
          <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>{formatINR(grandTotal)}</span></div>
          <p className="text-xs text-muted-foreground">Seller earns {formatINR(subtotal - platformFee)} • Delivery partner gets ₹30-50 per order</p>
        </CardContent></Card>
        <div className="flex gap-3">
          <Button variant="outline" onClick={clear}>Clear Cart</Button>
          <Link href="/checkout" className="flex-1"><Button className="w-full">Proceed to Checkout</Button></Link>
        </div>
      </div>
    </div>
  )
}
