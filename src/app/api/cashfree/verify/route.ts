import { NextRequest, NextResponse } from "next/server"
import { getPaymentStatus } from "@/lib/cashfree"
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId")
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 })
  try {
    const data = await getPaymentStatus(orderId)
    return NextResponse.json(data)
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
