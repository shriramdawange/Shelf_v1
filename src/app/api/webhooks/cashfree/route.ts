import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createServiceClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const signature = req.headers.get("x-webhook-signature")
  const secret = process.env.CASHFREE_WEBHOOK_SECRET

  if (secret && secret !== "your-webhook-secret" && signature) {
    const computed = crypto.createHmac("sha256", secret).update(payload).digest("base64")
    if (signature !== computed) return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let data: any
  try { data = JSON.parse(payload) } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }

  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json({ received: true, demo: true })

  const type = data.type || data.event
  const d = data.data || data

  try {
    if (type === "PAYMENT_SUCCESS" || d.payment_status === "SUCCESS") {
      const orderId = d.order_id || d.orderId
      await supabase.from("orders").update({ payment_status: "paid", status: "confirmed", cashfree_payment_id: d.cf_payment_id || d.payment_id }).eq("cashfree_order_id", orderId)
    } else if (type === "PAYMENT_FAILED") {
      await supabase.from("orders").update({ payment_status: "failed", status: "cancelled" }).eq("cashfree_order_id", d.order_id)
    } else if (type === "REFUND_PROCESSED") {
      await supabase.from("orders").update({ payment_status: "refunded", status: "refunded" }).eq("cashfree_order_id", d.order_id)
    }
  } catch (e) { console.error("webhook handler error", e) }

  return NextResponse.json({ received: true })
}
