"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatINR, formatDate } from "@/lib/utils"
import Link from "next/link"
import { toast } from "sonner"
import { Package, ArrowRight } from "lucide-react"

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data, error } = await supabase.from("orders").select("*, listings(*)").or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`).order("created_at", { ascending: false })
      if (error) toast.error(error.message)
      else setOrders(data || [])
      setLoading(false)
      const channel = supabase.channel("orders-realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
          if (payload.eventType === "UPDATE") setOrders((prev) => prev.map((o) => o.id === (payload.new as any).id ? { ...o, ...(payload.new as any) } : o))
        }).subscribe()
      return () => { supabase.removeChannel(channel) }
    }
    fetchOrders()
  }, [])

  if (loading) return <div className="container mx-auto px-4 py-6"><div className="grid gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />)}</div></div>

  if (orders.length === 0) return <div className="container mx-auto px-4 py-16 text-center space-y-4"><p className="text-5xl">📦</p><p className="font-semibold text-lg">No orders yet</p><p className="text-sm text-muted-foreground">Buy a book and your order timeline will appear here — live status, no chats.</p><Link href="/browse"><Button className="rounded-full">Browse Books</Button></Link></div>

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>My Orders</h1>
      <p className="text-sm text-muted-foreground mb-6">Buy-only • Track delivery • No contact needed</p>
      <div className="space-y-4">
        {orders.map((o) => (
          <Card key={o.id} className="rounded-2xl hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between gap-3 items-start">
                <div className="flex gap-3">
                  <img src={o.listings?.images?.[0] || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&auto=format&fit=crop&q=60"} alt="" className="h-14 w-14 rounded-xl object-cover border" />
                  <div>
                    <p className="font-medium text-sm line-clamp-2 leading-tight">{o.listings?.title || "Book"}</p>
                    <p className="text-xs text-muted-foreground">Order #{o.id.slice(0, 8)} • {formatDate(o.created_at)}</p>
                  </div>
                </div>
                <Badge variant={o.payment_status === "paid" ? "default" : o.payment_status === "failed" ? "destructive" : "secondary"} className="rounded-full shrink-0">{o.status}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm bg-muted/40 rounded-xl px-3 py-2"><span className="font-semibold">{formatINR(o.total_amount)}</span><Link href={`/orders/${o.id}`}><Button size="sm" className="rounded-full gap-1">Track <ArrowRight className="h-3.5 w-3.5" /></Button></Link></div>
              <div className="flex gap-1.5 text-[10px] leading-none">
                {["pending", "confirmed", "picked_up", "in_transit", "delivered"].map((s, idx) => (
                  <span key={s} className={`flex-1 text-center py-2 rounded-full font-medium ${["pending", "confirmed", "picked_up", "in_transit", "delivered"].indexOf(o.status) >= idx ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>{s.replace("_"," ")}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
