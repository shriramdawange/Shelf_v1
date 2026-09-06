import axios from "axios"
const CASHFREE_API = process.env.CASHFREE_ENV === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg"
const CASHFREE_PAYOUTS_API = process.env.CASHFREE_ENV === "production" ? "https://api.cashfree.com/payout" : "https://sandbox.cashfree.com/payout"
export async function createCashfreeOrder({ orderId, orderAmount, customerId, customerEmail, customerPhone, returnUrl, notifyUrl }: { orderId: string; orderAmount: number; customerId: string; customerEmail: string; customerPhone: string; returnUrl: string; notifyUrl: string }) {
  const response = await axios.post(`${CASHFREE_API}/orders`, {
    order_id: orderId, order_amount: orderAmount, order_currency: "INR",
    customer_details: { customer_id: customerId, customer_email: customerEmail, customer_phone: customerPhone },
    order_meta: { return_url: returnUrl, notify_url: notifyUrl, payment_methods: "cc,dc,upi,nb,wallet,emi,cardless_emi,paylater" },
  }, { headers: { "Content-Type": "application/json", "x-client-id": process.env.CASHFREE_APP_ID!, "x-client-secret": process.env.CASHFREE_SECRET_KEY!, "x-api-version": "2023-08-01" } })
  return response.data
}
export async function getPaymentStatus(orderId: string) {
  const response = await axios.get(`${CASHFREE_API}/orders/${orderId}/payments`, { headers: { "x-client-id": process.env.CASHFREE_APP_ID!, "x-client-secret": process.env.CASHFREE_SECRET_KEY!, "x-api-version": "2023-08-01" } })
  return response.data
}
export async function createPayout({ beneficiaryId, amount, transferId, transferMode = "upi" }: { beneficiaryId: string; amount: number; transferId: string; transferMode?: string }) {
  const response = await axios.post(`${CASHFREE_PAYOUTS_API}/transfers`, { beneficiary: { beneficiary_id: beneficiaryId }, transfer: { transfer_id: transferId, transfer_amount: amount, transfer_mode: transferMode, transfer_currency: "INR" } },
    { headers: { "Content-Type": "application/json", "x-client-id": process.env.CASHFREE_PAYOUT_CLIENT_ID!, "x-client-secret": process.env.CASHFREE_PAYOUT_CLIENT_SECRET! } })
  return response.data
}
