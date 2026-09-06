import { v2 as cloudinary } from "cloudinary"
cloudinary.config({ cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET })
export { cloudinary }
export function getCloudinaryUrl(publicId: string, opts?: { width?: number; height?: number }) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo"
  const w = opts?.width ? `w_${opts.width},` : ""
  const h = opts?.height ? `h_${opts.height},` : ""
  const trans = w || h ? `${w}${h}c_fill,f_auto,q_auto/` : "f_auto,q_auto/"
  return `https://res.cloudinary.com/${cloud}/image/upload/${trans}${publicId}`
}
export function thumb(url: string) { if (!url.includes("res.cloudinary.com")) return url; return url.replace("/upload/", "/upload/w_300,h_300,c_fill,f_auto,q_auto/") }
export function medium(url: string) { if (!url.includes("res.cloudinary.com")) return url; return url.replace("/upload/", "/upload/w_800,h_600,c_fill,f_auto,q_auto/") }
