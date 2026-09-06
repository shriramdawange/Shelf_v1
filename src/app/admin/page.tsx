"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatINR } from "@/lib/utils"
import { toast } from "sonner"

export default function AdminPage() {
  const supabase = createClient()
  const [stats, setStats] = useState({ users: 0, listings: 0, orders: 0, revenue: 0 })
  const [listings, setListings] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  const load = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*").limit(50)
    const { data: lists } = await supabase.from("listings").select("*").order("created_at", { ascending: false }).limit(20)
    const { data: ords } = await supabase.from("orders").select("*, listings(*)").order("created_at", { ascending: false }).limit(20)
    setUsers(profiles || []); setListings(lists || []); setOrders(ords || [])
    const revenue = (ords || []).reduce((s: number, o: any) => s + (o.platform_fee || 0), 0)
    setStats({ users: profiles?.length || 0, listings: lists?.length || 0, orders: ords?.length || 0, revenue })
  }
  useEffect(() => { load() }, [])

  const moderateListing = async (id: string, status: string) => {
    const { error } = await supabase.from("listings").update({ status }).eq("id", id)
    if (error) toast.error(error.message); else { toast.success(`Listing ${status}`); load() }
  }
  const refundOrder = async (orderId: string, cashfreeOrderId: string) => {
    toast.info("Triggering Cashfree refund API (demo)...")
    const { error } = await supabase.from("orders").update({ payment_status: "refunded", status: "refunded" }).eq("id", orderId)
    if (!error) toast.success("Refunded (demo)"); load()
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Admin — Shelf 🛡️</h1>
      <p className="text-sm text-muted-foreground">Books-only moderation • Order oversight • Payouts • No P2P chats to monitor.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-6 text-center"><p className="text-2xl font-bold">{stats.users}</p><p className="text-xs text-muted-foreground">Users</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center"><p className="text-2xl font-bold">{stats.listings}</p><p className="text-xs text-muted-foreground">Listings</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center"><p className="text-2xl font-bold">{stats.orders}</p><p className="text-xs text-muted-foreground">Orders</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center"><p className="text-2xl font-bold">{formatINR(stats.revenue)}</p><p className="text-xs text-muted-foreground">Revenue (platform fees)</p></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle>Listing Moderation</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {listings.length === 0 ? <p className="text-sm text-muted-foreground">No listings or Supabase not configured.</p> : listings.map((l) => (
            <div key={l.id} className="flex justify-between items-center border rounded-lg p-3">
              <div><p className="font-medium text-sm">{l.title}</p><p className="text-xs text-muted-foreground">{l.category} • {formatINR(l.price)} • <Badge variant={l.status === "active" ? "default" : "secondary"}>{l.status}</Badge></p></div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => moderateListing(l.id, "hidden")}>Hide</Button>
                <Button size="sm" onClick={() => moderateListing(l.id, "active")}>Approve</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle>Order Oversight & Payouts</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {orders.length === 0 ? <p className="text-sm text-muted-foreground">No orders.</p> : orders.map((o) => (
            <div key={o.id} className="flex justify-between items-center border rounded-lg p-3">
              <div><p className="font-medium text-sm">{o.listings?.title} • {formatINR(o.total_amount)}</p><p className="text-xs text-muted-foreground">{o.status} • {o.payment_status} • Seller earns {formatINR(o.seller_earnings)}</p></div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => refundOrder(o.id, o.cashfree_order_id)}>Refund</Button>
                <Button size="sm" variant="secondary" onClick={() => toast.success("Payout triggered via Cashfree Payouts (demo) — transfer to UPI")}>Payout Seller</Button>
              </div>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => {
              const csv = "order_id,status,total,platform_fee,seller_earnings\n" + orders.map(o => `${o.id},${o.status},${o.total_amount},${o.platform_fee},${o.seller_earnings}`).join("\n")
              const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "eduswap-report.csv"; a.click()
            }}>Export CSV</Button>
            <span className="text-xs text-muted-foreground py-2">Analytics: daily/weekly/monthly revenue ready (chart can be added with Recharts).</span>
          </div>
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle>Users ({users.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {users.length === 0 ? <p className="text-sm text-muted-foreground">No users or Supabase not configured. Users appear after sign-up via Supabase Auth.</p> : users.map((u) => (
            <div key={u.id} className="flex justify-between items-center border rounded-lg p-3 text-sm">
              <div><p className="font-medium">{u.full_name || u.username} {u.is_admin && <Badge>Admin</Badge>}</p><p className="text-xs text-muted-foreground">{u.university} • {u.phone} • {u.is_seller ? "Seller" : "Buyer"} {u.is_delivery_partner && "• Delivery"}</p></div>
              <Button size="sm" variant="ghost" onClick={() => toast.info("Ban/unban & KYC verification - implement via is_admin RLS")}>Manage</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
