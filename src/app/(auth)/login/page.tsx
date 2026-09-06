"use client"
import { useState } from "react"
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

const schema = z.object({ email: z.string().email(), password: z.string().min(6) })

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })

  const onSubmit = async (v: z.infer<typeof schema>) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword(v)
    setLoading(false)
    if (error) toast.error(error.message)
    else { toast.success("Welcome back!"); router.push("/browse"); router.refresh() }
  }
  const googleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/browse` } })
    if (error) toast.error(error.message)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card>
        <CardHeader><CardTitle>Welcome back</CardTitle><CardDescription>Login to EduSwap • Email/password + Google OAuth via Supabase Auth</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" onClick={googleLogin}>Continue with Google</Button>
          <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div></div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div><Label>Email</Label><Input type="email" {...register("email")} placeholder="you@university.edu.in" />{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}</div>
            <div><Label>Password</Label><Input type="password" {...register("password")} />{errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}</div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Logging in..." : "Login"}</Button>
          </form>
          <p className="text-sm text-center text-muted-foreground">No account? <Link href="/register" className="text-primary underline">Register</Link></p>
        </CardContent>
      </Card>
    </div>
  )
}
