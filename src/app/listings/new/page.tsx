"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BOOK_GENRES, CONDITIONS } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Library, Upload } from "lucide-react"

const schema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(2000),
  subject: z.string().optional(),
  course_code: z.string().optional(),
  genre: z.string().min(1),
  condition: z.string().min(1),
  price: z.coerce.number().min(0).max(50000),
})

export default function NewListingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} too large (max 5MB)`); continue }
        if (!file.type.startsWith("image/")) { toast.error(`${file.name} not an image`); continue }
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
        if (cloudName && preset && cloudName !== "your-cloud-name") {
          const fd = new FormData()
          fd.append("file", file); fd.append("upload_preset", preset); fd.append("folder", "shelf/books")
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: fd })
          const data = await res.json()
          if (data.secure_url) uploaded.push(data.secure_url)
          else toast.error("Cloudinary upload failed: " + (data.error?.message || "unknown"))
        } else {
          uploaded.push(URL.createObjectURL(file))
          toast.info("Demo mode: Cloudinary not configured, using local preview.")
        }
      }
      setImages((prev) => [...prev, ...uploaded].slice(0, 5))
    } finally { setUploading(false) }
  }

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error("Please login to list a book"); router.push("/login"); return }
      const payload = { seller_id: user.id, title: values.title, description: values.description, category: "Books", subject: values.genre ? `${values.genre}${values.subject ? ` • ${values.subject}` : ""}` : values.subject || null, course_code: values.course_code || null, condition: values.condition, price: values.price, images, status: "active" }
      const { data, error } = await supabase.from("listings").insert(payload).select().single()
      if (error) throw error
      toast.success("Book listed!")
      router.push(`/listings/${data.id}`)
    } catch (e: any) {
      toast.error(e.message || "Failed to create listing")
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}><Library className="h-7 w-7 text-primary" /> Sell a Book</h1>
        <p className="text-sm text-muted-foreground mt-1">Books only. Buyer purchases directly — no chats, no negotiation.</p>
      </div>
      <Card className="rounded-2xl shadow-sm">
        <CardHeader><CardTitle className="text-base">Book Details</CardTitle><p className="text-sm text-muted-foreground">Upload up to 5 images (Cloudinary f_auto,q_auto). Verified by admin before going live.</p></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div><Label>Book Title *</Label><Input {...register("title")} placeholder="e.g. CLRS — Introduction to Algorithms 3rd Ed" />{errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}</div>
            <div><Label>Description *</Label><Textarea {...register("description")} placeholder="Edition, publisher, MRP, highlights, reason for selling..." rows={4} />{errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}</div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Genre *</Label><select {...register("genre")} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"><option value="">Select genre</option>{BOOK_GENRES.map(c => <option key={c} value={c}>{c}</option>)}</select>{errors.genre && <p className="text-xs text-destructive">{(errors.genre as any).message}</p>}</div>
              <div><Label>Condition *</Label><select {...register("condition")} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"><option value="">Select</option>{CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}</select>{errors.condition && <p className="text-xs text-destructive">{errors.condition.message}</p>}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Subject / Author</Label><Input {...register("subject")} placeholder="e.g. Cormen / Data Structures" /></div>
              <div><Label>Course Code (optional)</Label><Input {...register("course_code")} placeholder="e.g. CS201" /></div>
            </div>
            <div><Label>Price (₹) *</Label><Input type="number" {...register("price")} placeholder="500" />{errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}<p className="text-xs text-muted-foreground mt-1">You&apos;ll earn 85% after 15% platform fee.</p></div>
            <div>
              <Label className="flex items-center gap-1"><Upload className="h-3.5 w-3.5" /> Book Photos (max 5, 5MB each)</Label>
              <Input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} className="rounded-xl mt-1" />
              {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
              {images.length > 0 && <div className="grid grid-cols-5 gap-2 mt-3">{images.map((src, i) => <div key={i} className="relative"><img src={src} alt="" className="h-20 w-full object-cover rounded-xl border" /><button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full h-6 w-6 text-xs shadow">×</button></div>)}</div>}
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full rounded-full h-11 text-base">{isSubmitting ? "Listing..." : "List Book for Sale"}</Button>
            <p className="text-xs text-center text-muted-foreground">By listing, you confirm this is a book and price is final (buy-only).</p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
