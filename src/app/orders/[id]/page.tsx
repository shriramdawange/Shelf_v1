"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatINR, formatDate } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"
import { PackageCheck, Truck, ShieldCheck, ArrowLeft } from "lucide-react"

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

  if (loading) return <div className="container mx-auto px-4 py-6">Loading order...</div>
  if (!order) return <div className="container mx-auto px-4 py-6 space-y-3"><p>Order not found (check Supabase).</p><Link href="/orders"><Button variant="outline">Back to orders</Button></Link></div>

  const isSeller = userId === order.seller_id
  const isBuyer = userId === order.buyer_id

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />All orders</Link>
      <Card className="rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/30"><CardTitle className="flex flex-wrap gap-2 items-center">Order #{order.id.slice(0, 8)} <Badge className="rounded-full">{order.status}</Badge> <Badge variant="outline" className="rounded-full">{order.payment_status}</Badge></CardTitle>
          <p className="text-xs text-muted-foreground">{formatDate(order.created_at)} • {formatINR(order.total_amount)} • {order.delivery_address || "—"}</p>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex gap-4 p-3 rounded-xl border bg-card">
            <img src={order.listings?.images?.[0] || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&auto=format&fit=crop&q=60"} alt="" className="h-20 w-20 object-cover rounded-xl border" />
            <div><p className="font-semibold text-sm leading-tight" style={{ fontFamily: "var(--font-display)" }}>{order.listings?.title}</p><p className="text-xs text-muted-foreground">{order.listings?.category} {order.listings?.course_code && `• ${order.listings.course_code}`}</p><p className="text-sm font-bold text-primary mt-1">{formatINR(order.total_amount)}</p></div>
          </div>

          <div className="flex flex-wrap gap-2">
            {order.status === "confirmed" && <Button size="sm" onClick={() => updateStatus("picked_up")} className="rounded-full">Mark Picked Up</Button>}
            {order.status === "picked_up" && <Button size="sm" onClick={() => updateStatus("in_transit")} className="rounded-full">Mark In Transit</Button>}
            {order.status === "in_transit" && <Button size="sm" onClick={() => updateStatus("delivered")} className="rounded-full">Mark Delivered</Button>}
            {order.status === "pending" && isBuyer && <Button size="sm" variant="outline" className="rounded-full" onClick={() => updateStatus("confirmed")}>Confirm (Demo Pay)</Button>}
            {(order.status === "delivered") && isBuyer && <Button size="sm" variant="secondary" className="rounded-full" onClick={() => toast.success("Review submitted (demo)")}>Leave Review ⭐</Button>}
          </div>

          <div className="grid grid-cols-5 gap-1.5 text-[10px] md:text-xs text-center font-medium">
            {["pending", "confirmed", "picked_up", "in_transit", "delivered"].map((s) => {
              const idx = ["pending", "confirmed", "picked_up", "in_transit", "delivered"].indexOf(s)
              const curIdx = ["pending", "confirmed", "picked_up", "in_transit", "delivered"].indexOf(order.status)
              const active = order.status === s
              const done = curIdx > idx
              return <div key={s} className={`py-2.5 rounded-xl ${active ? "bg-primary text-white shadow" : done ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-muted text-muted-foreground"}`}>{s.replace("_", " ")}</div>
            })}
          </div>

          <div className="grid md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-muted/50 text-center"><p className="text-muted-foreground">Platform fee (15%)</p><p className="font-semibold">{formatINR(order.platform_fee)}</p></div>
            <div className="p-3 rounded-xl bg-muted/50 text-center"><p className="text-muted-foreground">Delivery</p><p className="font-semibold">{formatINR(order.delivery_fee)}</p></div>
            <div className="p-3 rounded-xl bg-primary/10 text-center"><p className="text-muted-foreground">Seller earns</p><p className="font-bold text-primary">{formatINR(order.seller_earnings)}</p></div>
          </div>
          {order.status === "delivered" && <p className="text-xs text-green-600 flex items-center gap-1"><PackageCheck className="h-4 w-4" /> Delivery complete — payout via Cashfree Payouts triggered.</p>}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-dashed bg-secondary/30"><CardContent className="p-5 text-xs space-y-2 leading-relaxed">
        <p className="flex gap-2 font-medium"><ShieldCheck className="h-4 w-4 text-green-600" /> Buy-only, no contact: Buyer pays → order confirmed → delivery. No chat.</p>
        <p className="flex gap-2"><Truck className="h-4 w-4 text-primary" /> Delivery partner updates status live. Questions? Use Orders support (no direct seller DM).</p>
      </CardContent></Card>

      {isSeller || isBuyer ? <p className="text-xs text-center text-muted-foreground">You are the {isSeller ? "seller" : "buyer"} for this order. Support: help@shelf.in</p> : null}
    </div>
  )
}
