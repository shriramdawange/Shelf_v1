"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatINR, formatDate } from "@/lib/utils"
import Link from "next/link"
import { toast } from "sonner"

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

      // Realtime subscription
      const channel = supabase.channel("orders-realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
          // naive refresh
          if (payload.eventType === "UPDATE") setOrders((prev) => prev.map((o) => o.id === (payload.new as any).id ? { ...o, ...(payload.new as any) } : o))
        }).subscribe()
      return () => { supabase.removeChannel(channel) }
    }
    fetchOrders()
  }, [])

  if (loading) return <div className="container mx-auto px-4 py-6"><div className="grid gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}</div></div>

  if (orders.length === 0) return <div className="container mx-auto px-4 py-16 text-center space-y-3"><p className="text-4xl">📦</p><p className="font-medium">No orders yet</p><p className="text-sm text-muted-foreground">Your orders (as buyer/seller) will appear here with real-time status updates.</p><Link href="/browse"><Button>Browse Listings</Button></Link></div>

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      <div className="space-y-4">
        {orders.map((o) => (
          <Card key={o.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{o.listings?.title || "Listing"}</p>
                  <p className="text-xs text-muted-foreground">Order #{o.id.slice(0, 8)} • {formatDate(o.created_at)}</p>
                </div>
                <Badge variant={o.payment_status === "paid" ? "default" : o.payment_status === "failed" ? "destructive" : "secondary"}>{o.status} • {o.payment_status}</Badge>
              </div>
              <div className="flex justify-between text-sm"><span>{formatINR(o.total_amount)} (Seller earns {formatINR(o.seller_earnings)})</span><Link href={`/orders/${o.id}`}><Button size="sm">View & Chat</Button></Link></div>
              <div className="flex gap-1 text-xs">
                {["pending", "confirmed", "picked_up", "in_transit", "delivered"].map((s, idx) => (
                  <span key={s} className={`flex-1 text-center py-1 rounded ${["pending", "confirmed", "picked_up", "in_transit", "delivered"].indexOf(o.status) >= idx ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{s}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
