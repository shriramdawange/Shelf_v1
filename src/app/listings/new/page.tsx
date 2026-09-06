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
import { CATEGORIES, CONDITIONS } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const schema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(2000),
  category: z.string().min(1),
  subject: z.string().optional(),
  course_code: z.string().optional(),
  condition: z.string().min(1),
  price: z.coerce.number().min(0).max(100000),
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
        // If Cloudinary preset configured, upload directly
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
        if (cloudName && preset && cloudName !== "your-cloud-name") {
          const fd = new FormData()
          fd.append("file", file); fd.append("upload_preset", preset); fd.append("folder", "eduswap/listings")
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: fd })
          const data = await res.json()
          if (data.secure_url) uploaded.push(data.secure_url)
          else toast.error("Cloudinary upload failed: " + (data.error?.message || "unknown"))
        } else {
          // Fallback: create object URL (demo)
          uploaded.push(URL.createObjectURL(file))
          toast.info("Demo mode: Cloudinary not configured, using local preview. Set env vars for production.")
        }
      }
      setImages((prev) => [...prev, ...uploaded].slice(0, 5))
    } finally { setUploading(false) }
  }

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error("Please login to create listing"); router.push("/login"); return }
      const payload = { seller_id: user.id, title: values.title, description: values.description, category: values.category, subject: values.subject || null, course_code: values.course_code || null, condition: values.condition, price: values.price, images, status: "active" }
      const { data, error } = await supabase.from("listings").insert(payload).select().single()
      if (error) throw error
      toast.success("Listing created!")
      router.push(`/listings/${data.id}`)
    } catch (e: any) {
      toast.error(e.message || "Failed to create listing (check Supabase config)")
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card>
        <CardHeader><CardTitle>Create New Listing</CardTitle><p className="text-sm text-muted-foreground">Upload up to 5 images (Cloudinary CDN, auto-optimized f_auto,q_auto). 25GB free tier.</p></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div><Label>Title *</Label><Input {...register("title")} placeholder="e.g. Engineering Mechanics by R.S. Khurmi" />{errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}</div>
            <div><Label>Description *</Label><Textarea {...register("description")} placeholder="Condition, edition, notes..." rows={4} />{errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}</div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Category *</Label><select {...register("category")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Select</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>{errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}</div>
              <div><Label>Condition *</Label><select {...register("condition")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Select</option>{CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}</select>{errors.condition && <p className="text-xs text-destructive">{errors.condition.message}</p>}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Subject</Label><Input {...register("subject")} placeholder="e.g. Data Structures" /></div>
              <div><Label>Course Code</Label><Input {...register("course_code")} placeholder="e.g. CS201" /></div>
            </div>
            <div><Label>Price (₹) *</Label><Input type="number" {...register("price")} placeholder="500" />{errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}</div>
            <div>
              <Label>Images (max 5, 5MB each)</Label>
              <Input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading to Cloudinary...</p>}
              {images.length > 0 && <div className="grid grid-cols-5 gap-2 mt-2">{images.map((src, i) => <div key={i} className="relative"><img src={src} alt="" className="h-20 w-full object-cover rounded border" /><button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-5 w-5 text-xs">×</button></div>)}</div>}
              <p className="text-xs text-muted-foreground mt-1">Folder: eduswap/listings/&#123;user_id&#125;/ • Transformations: 300x300 thumb, 800x600 medium, CDN f_auto,q_auto</p>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Creating..." : "Create Listing"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
