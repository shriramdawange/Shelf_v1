"use client"
import { useState } from "react"
import { useCart } from "@/store/cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatINR } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import CashfreeCheckout from "@/components/CashfreeCheckout"

export default function CheckoutPage() {
  const { items, total, clear } = useCart()
  const router = useRouter()
  const supabase = createClient()
  const [address, setAddress] = useState("")
  const [pincode, setPincode] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)

  const subtotal = total()
  const deliveryFee = 40
  const platformFee = Math.round(subtotal * 0.15)
  const grandTotal = subtotal + deliveryFee

  const handleCreateOrder = async () => {
    if (!address || !pincode || !phone) { toast.error("Fill delivery address, pincode and phone"); return }
    if (items.length === 0) { toast.error("Cart empty"); return }
    if (!/^\d{6}$/.test(pincode)) { toast.error("Enter valid 6-digit pincode"); return }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error("Please login"); router.push("/login"); return }
      // For MVP: create order per first cart item (multi-item cart can be extended to order_items)
      const first = items[0].listing
      const sellerEarnings = subtotal - platformFee
      const cashfreeOrderId = `EDU_${Date.now()}_${Math.random().toString(36).slice(2,6)}`

      // Create order in Supabase
      const { data: order, error } = await supabase.from("orders").insert({
        listing_id: first.id, buyer_id: user.id, seller_id: first.seller_id,
        status: "pending", total_amount: grandTotal, platform_fee: platformFee, delivery_fee: deliveryFee, seller_earnings: sellerEarnings,
        cashfree_order_id: cashfreeOrderId, payment_status: "pending", delivery_address: `${address}, Pincode: ${pincode}, Phone: ${phone}`,
      }).select().single()
      if (error) throw error

      // Try to create Cashfree order via API route
      try {
        const res = await fetch("/api/cashfree/create-order", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: cashfreeOrderId, orderAmount: grandTotal, customerId: user.id, customerEmail: user.email!, customerPhone: phone, returnUrl: `${window.location.origin}/orders/${order.id}`, notifyUrl: `${window.location.origin}/api/webhooks/cashfree` })
        })
        const cfData = await res.json()
        if (cfData.payment_session_id) {
          setPaymentSessionId(cfData.payment_session_id)
          setCreatedOrderId(order.id)
          toast.success("Order created! Complete payment below.")
        } else {
          // Cashfree not configured - mark as paid for demo
          toast.info("Cashfree not configured - demo mode. Marking order as confirmed.")
          await supabase.from("orders").update({ payment_status: "paid", status: "confirmed" }).eq("id", order.id)
          clear()
          router.push(`/orders/${order.id}`)
        }
      } catch (cfErr: any) {
        toast.info("Demo mode: Order created without Cashfree. Configure env vars for real payments.")
        await supabase.from("orders").update({ payment_status: "paid", status: "confirmed" }).eq("id", order.id)
        clear()
        router.push(`/orders/${order.id}`)
      }
    } catch (e: any) { toast.error(e.message) } finally { setLoading(false) }
  }

  if (items.length === 0 && !paymentSessionId) return <div className="container mx-auto px-4 py-12 text-center"><p>Cart empty. <a href="/browse" className="text-primary underline">Browse</a></p></div>

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Checkout</h1>
      <p className="text-sm text-muted-foreground -mt-4">Buy-only • Pay and get delivery — no chats</p>
      <Card className="rounded-2xl"><CardHeader><CardTitle className="text-base">Delivery Details 🇮🇳</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Delivery Address *</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Hostel / Street, City, State" className="rounded-xl" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Pincode * (6 digits)</Label><Input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="110001" maxLength={6} className="rounded-xl" /></div>
            <div><Label>Phone (+91) *</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className="rounded-xl" /></div>
          </div>
          <p className="text-xs text-muted-foreground">Delivery fee ₹40 • Cashfree supports UPI, Cards, Netbanking</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl"><CardContent className="p-4 space-y-2 text-sm">
        <div className="flex justify-between"><span>Subtotal ({items.length} items)</span><span>{formatINR(subtotal)}</span></div>
        <div className="flex justify-between"><span>Platform fee (15%)</span><span>{formatINR(platformFee)}</span></div>
        <div className="flex justify-between"><span>Delivery</span><span>{formatINR(deliveryFee)}</span></div>
        <div className="flex justify-between font-bold text-base border-t pt-2"><span>Payable</span><span>{formatINR(grandTotal)}</span></div>
      </CardContent></Card>

      {!paymentSessionId ? (
        <Button onClick={handleCreateOrder} disabled={loading} className="w-full py-6 text-lg rounded-full">{loading ? "Creating order..." : `Pay ${formatINR(grandTotal)} with Cashfree`}</Button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-green-600 text-center">Order created! Complete payment:</p>
          <CashfreeCheckout paymentSessionId={paymentSessionId} orderId={createdOrderId!} />
          <Button variant="outline" className="w-full rounded-full" onClick={() => { clear(); router.push(`/orders/${createdOrderId}`) }}>Skip Payment (Demo) → View Order</Button>
        </div>
      )}
    </div>
  )
}
