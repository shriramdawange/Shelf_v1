"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function CashfreeCheckout({ paymentSessionId, orderId }: { paymentSessionId: string; orderId: string }) {
  const [loading, setLoading] = useState(false)
  const handlePayment = async () => {
    setLoading(true)
    try {
      // Dynamically load Cashfree SDK
      const { load } = await import("@cashfreepayments/cashfree-js")
      const cashfree = await load({ mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === "production" ? "production" : "sandbox" } as any)
      if (!cashfree) throw new Error("Failed to load Cashfree")
      cashfree.checkout({ paymentSessionId, redirectTarget: "_self" } as any)
    } catch (e: any) {
      toast.error(e.message || "Checkout failed")
      // fallback redirect if SDK not available - open Cashfree hosted page manually
      console.error(e)
    } finally { setLoading(false) }
  }
  return <Button onClick={handlePayment} disabled={loading} className="w-full py-6 text-lg">{loading ? "Processing..." : "Pay with Cashfree (UPI / Card / Netbanking)"}</Button>
}
