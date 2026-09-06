"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { INDIAN_UNIVERSITIES } from "@/lib/utils"
import { useState } from "react"

const schema = z.object({
  email: z.string().email(), password: z.string().min(6), full_name: z.string().min(2),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit Indian number"), university: z.string().min(1),
  is_seller: z.boolean().optional(), is_delivery_partner: z.boolean().optional(),
})

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })

  const onSubmit = async (v: z.infer<typeof schema>) => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: v.email, password: v.password,
      options: { data: { full_name: v.full_name, phone: v.phone, university: v.university, is_seller: !!v.is_seller, is_delivery_partner: !!v.is_delivery_partner } },
    })
    setLoading(false)
    if (error) toast.error(error.message)
    else { toast.success("Check your email to confirm! (if Supabase email confirmation enabled)"); router.push("/login") }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <Card>
        <CardHeader><CardTitle>Create account</CardTitle><CardDescription>Roles: Buyer (default), Seller, Delivery Partner (18+ verification), Admin</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Full Name *</Label><Input {...register("full_name")} placeholder="Aarav Sharma" />{errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}</div>
              <div><Label>Phone +91 *</Label><Input {...register("phone")} placeholder="9876543210" />{errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}</div>
            </div>
            <div><Label>Email *</Label><Input type="email" {...register("email")} placeholder="aarav@college.edu.in" />{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}</div>
            <div><Label>Password *</Label><Input type="password" {...register("password")} />{errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}</div>
            <div><Label>University *</Label><select {...register("university")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Select university</option>{INDIAN_UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}</select>{errors.university && <p className="text-xs text-destructive">{errors.university.message}</p>}</div>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" {...register("is_seller")} /> I want to sell</label>
              <label className="flex items-center gap-2"><input type="checkbox" {...register("is_delivery_partner")} /> I can deliver (18+)</label>
            </div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating..." : "Create Account"}</Button>
          </form>
          <p className="text-sm text-center text-muted-foreground mt-4">Have account? <Link href="/login" className="text-primary underline">Login</Link></p>
        </CardContent>
      </Card>
    </div>
  )
}
