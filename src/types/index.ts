export type Profile = {
  id: string; username: string | null; full_name: string | null; phone: string | null; university: string | null;
  is_seller: boolean; is_delivery_partner: boolean; is_admin: boolean; cashfree_beneficiary_id: string | null; avatar_url: string | null; created_at: string;
}
export type Listing = {
  id: string; seller_id: string; title: string; description: string | null; category: string; subject: string | null; course_code: string | null;
  condition: string; price: number; images: string[]; status: "active"|"sold"|"hidden"|"pending"; created_at: string; profiles?: Profile;
}
export type Order = {
  id: string; listing_id: string; buyer_id: string; seller_id: string; delivery_partner_id: string | null;
  status: "pending"|"confirmed"|"picked_up"|"in_transit"|"delivered"|"cancelled"|"refunded";
  total_amount: number; platform_fee: number; delivery_fee: number; seller_earnings: number;
  cashfree_order_id: string | null; payment_status: "pending"|"paid"|"failed"|"refunded"; delivery_address: string | null; created_at: string; listings?: Listing;
}
export type Review = { id: string; order_id: string; reviewer_id: string; reviewee_id: string; rating: number; comment: string | null; created_at: string }
export type DeliveryAssignment = { id: string; order_id: string; partner_id: string; status: string; assigned_at: string; completed_at: string | null }
