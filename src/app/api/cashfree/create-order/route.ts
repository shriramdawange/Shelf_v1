import { NextRequest, NextResponse } from "next/server"
import { createCashfreeOrder } from "@/lib/cashfree"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, orderAmount, customerId, customerEmail, customerPhone, returnUrl, notifyUrl } = body
    if (!process.env.CASHFREE_APP_ID || process.env.CASHFREE_APP_ID === "your-app-id") {
      return NextResponse.json({ error: "Cashfree not configured", demo: true }, { status: 200 })
    }
    const data = await createCashfreeOrder({ orderId, orderAmount, customerId, customerEmail, customerPhone, returnUrl, notifyUrl })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.response?.data || e.message }, { status: 500 })
  }
}
