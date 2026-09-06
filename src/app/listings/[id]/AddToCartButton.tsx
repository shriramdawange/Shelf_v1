"use client"
import { Button } from "@/components/ui/button"
import { useCart } from "@/store/cart"
import { ShoppingCart } from "lucide-react"
import { toast } from "sonner"
export default function AddToCartButton({ listing }: { listing: any }) {
  const add = useCart((s) => s.add)
  return <Button className="flex-1 gap-2" onClick={() => { add(listing); toast.success("Added to cart") }}><ShoppingCart className="h-4 w-4" />Add to Cart</Button>
}
