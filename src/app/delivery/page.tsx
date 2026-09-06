"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatINR, formatDate } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"

export default function DeliveryPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [myJobs, setMyJobs] = useState<any[]>([])
  const [userId, setUserId] = useState<string>("")
  const supabase = createClient()

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const { data: avail } = await supabase.from("orders").select("*, listings(*)").in("status", ["confirmed", "picked_up", "in_transit"]).order("created_at", { ascending: false }).limit(20)
    setOrders(avail || [])
    const { data: mine } = await supabase.from("orders").select("*, listings(*)").eq("delivery_partner_id", user.id).order("created_at", { ascending: false })
    setMyJobs(mine || [])
  }
  useEffect(() => { load() }, [])

  const acceptOrder = async (orderId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error("Login as delivery partner"); return }
    const { error } = await supabase.from("orders").update({ delivery_partner_id: user.id, status: "picked_up" }).eq("id", orderId)
    if (error) toast.error(error.message)
    else {
      await supabase.from("delivery_assignments").insert({ order_id: orderId, partner_id: user.id, status: "assigned" })
      toast.success("Order accepted! Pickup from seller.")
      load()
    }
  }

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId)
    if (!error) { toast.success(status); load() }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Delivery Hub 🛵</h1>
        <p className="text-sm text-muted-foreground">Accept book deliveries, pickup from seller, update status live. Earn ₹40 per delivery + weekly Cashfree Payouts.</p>
      </div>

      <Card className="rounded-2xl"><CardHeader><CardTitle className="text-base">My Jobs ({myJobs.length})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {myJobs.length === 0 ? <p className="text-sm text-muted-foreground">No jobs yet. Accept an available order below.</p> : myJobs.map((o) => (
            <div key={o.id} className="flex justify-between items-center border rounded-lg p-3">
              <div><p className="font-medium text-sm">{o.listings?.title}</p><p className="text-xs text-muted-foreground">{formatDate(o.created_at)} • {o.delivery_address} • <Badge>{o.status}</Badge></p></div>
              <div className="flex gap-2">
                {o.status === "picked_up" && <Button size="sm" onClick={() => updateStatus(o.id, "in_transit")}>In Transit</Button>}
                {o.status === "in_transit" && <Button size="sm" onClick={() => updateStatus(o.id, "delivered")}>Delivered ✓</Button>}
                <Link href={`/orders/${o.id}`}><Button size="sm" variant="outline">View</Button></Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl"><CardHeader><CardTitle className="text-base">Available Book Orders</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {orders.length === 0 ? <p className="text-sm text-muted-foreground">No available orders. Create a listing and place an order to test.</p> : orders.filter(o => !o.delivery_partner_id).map((o) => (
            <div key={o.id} className="flex justify-between items-center border rounded-lg p-3">
              <div><p className="font-medium text-sm">{o.listings?.title}</p><p className="text-xs text-muted-foreground">{formatINR(o.delivery_fee)} delivery fee • {o.delivery_address} • {formatDate(o.created_at)}</p></div>
              <Button size="sm" onClick={() => acceptOrder(o.id)}>Accept Job</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-muted/30 rounded-2xl"><CardContent className="p-4 text-xs">
        <p>Flat ₹40 delivery fee • Weekly payouts via Cashfree Payouts to UPI/Bank. No contact with buyer/seller needed — just pickup & deliver.</p>
      </CardContent></Card>
    </div>
  )
}
