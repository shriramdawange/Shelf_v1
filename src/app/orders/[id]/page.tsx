"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatINR, formatDate } from "@/lib/utils"
import ChatBox from "@/components/ChatBox"
import { toast } from "sonner"

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()
  const [order, setOrder] = useState<any>(null)
  const [userId, setUserId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
      const { data, error } = await supabase.from("orders").select("*, listings(*)").eq("id", id).single()
      if (error) toast.error(error.message)
      else setOrder(data)
      setLoading(false)
      // Realtime for order status
      const channel = supabase.channel(`order-${id}`)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` }, (payload) => setOrder(payload.new))
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
    load()
  }, [id])

  const updateStatus = async (status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id)
    if (error) toast.error(error.message)
    else { toast.success(`Status → ${status}`); setOrder({ ...order, status }) }
  }

  if (loading) return <div className="container mx-auto px-4 py-6">Loading...</div>
  if (!order) return <div className="container mx-auto px-4 py-6">Order not found (check Supabase config).</div>

  const isSeller = userId === order.seller_id
  const isBuyer = userId === order.buyer_id
  const isParticipant = isSeller || isBuyer || userId === order.delivery_partner_id

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
      <Card>
        <CardHeader><CardTitle>Order #{order.id.slice(0, 8)} <Badge className="ml-2">{order.status}</Badge> <Badge variant="outline">{order.payment_status}</Badge></CardTitle>
          <p className="text-xs text-muted-foreground">{formatDate(order.created_at)} • {formatINR(order.total_amount)} • Delivery: {order.delivery_address || "—"}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <img src={order.listings?.images?.[0] || "https://via.placeholder.com/100"} alt="" className="h-16 w-16 object-cover rounded border" />
            <div><p className="font-medium text-sm">{order.listings?.title}</p><p className="text-xs text-muted-foreground">{order.listings?.category} {order.listings?.course_code && `• ${order.listings.course_code}`}</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {order.status === "confirmed" && <Button size="sm" onClick={() => updateStatus("picked_up")}>Mark Picked Up</Button>}
            {order.status === "picked_up" && <Button size="sm" onClick={() => updateStatus("in_transit")}>Mark In Transit</Button>}
            {order.status === "in_transit" && <Button size="sm" onClick={() => updateStatus("delivered")}>Mark Delivered</Button>}
            {order.status === "pending" && isBuyer && <Button size="sm" variant="outline" onClick={() => updateStatus("confirmed")}>Confirm (Demo Pay)</Button>}
            {(order.status === "delivered") && isBuyer && <Button size="sm" variant="secondary" onClick={() => toast.success("Review submitted (demo)")}>Leave Review ⭐</Button>}
          </div>
          <div className="grid grid-cols-5 gap-1 text-[10px] text-center">
            {["pending", "confirmed", "picked_up", "in_transit", "delivered"].map((s) => (
              <div key={s} className={`py-2 rounded font-medium ${order.status === s ? "bg-primary text-primary-foreground" : ["pending", "confirmed", "picked_up", "in_transit", "delivered"].indexOf(order.status) > ["pending", "confirmed", "picked_up", "in_transit", "delivered"].indexOf(s) ? "bg-green-100 text-green-800 dark:bg-green-900" : "bg-muted"}`}>{s.replace("_", " ")}</div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Platform fee {formatINR(order.platform_fee)} • Delivery {formatINR(order.delivery_fee)} • Seller earns {formatINR(order.seller_earnings)}</p>
          {order.status === "delivered" && <p className="text-xs text-green-600">✓ Delivery complete → Payout to seller via Cashfree Payouts (weekly to UPI/Bank) triggered.</p>}
        </CardContent>
      </Card>

      {isParticipant || !userId ? (
        <Card><CardHeader><CardTitle className="text-base">Chat with {isSeller ? "Buyer" : "Seller"} 💬 (Supabase Realtime)</CardTitle></CardHeader>
          <CardContent>{userId ? <ChatBox orderId={order.id} currentUserId={userId} /> : <p className="text-sm text-muted-foreground">Login to chat.</p>}</CardContent></Card>
      ) : <Card><CardContent className="p-4 text-sm text-muted-foreground">Chat available only for buyer/seller of this order.</CardContent></Card>}

      <Card className="bg-muted/30"><CardContent className="p-4 text-xs space-y-1">
        <p><strong>Cashfree flow:</strong> Buyer → Cashfree PG (UPI/Card) → Webhook /api/webhooks/cashfree → order paid → seller notified → delivery partner assignment</p>
        <p><strong>Payout:</strong> On delivery, Cashfree Payouts transfers seller_earnings to beneficiary (UPI/bank). Refunds via Cashfree API.</p>
      </CardContent></Card>
    </div>
  )
}
