"use client"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const slides = [
  {
    id: 1,
    bg: "from-[#2874F0] to-[#1a5dc8]",
    kicker: "SEMESTER SALE",
    title: "Academic Books at 50-60% OFF",
    desc: "Bestsellers • CLRS • H.C. Verma • Morrison • + Cashfree Secure",
    cta: "Shop Now",
    img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=700&auto=format&fit=crop&q=60",
  },
  {
    id: 2,
    bg: "from-[#0f766e] to-[#134e4a]",
    kicker: "FICTION FEST",
    title: "Fiction & Non-Fiction Under ₹399",
    desc: "Bestsellers • Self-help • Biographies • Free campus delivery",
    cta: "Explore",
    img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=700&auto=format&fit=crop&q=60",
  },
  {
    id: 3,
    bg: "from-[#7c3aed] to-[#4c1d95]",
    kicker: "COMPETITIVE EXAMS",
    title: "GATE • JEE • NEET • UPSC Books",
    desc: "Previous years • Notes • Verified listings • Admin approved",
    cta: "View Deals",
    img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=700&auto=format&fit=crop&q=60",
  },
]

export default function FlipkartHeroCarousel() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 4000)
    return () => clearInterval(t)
  }, [])
  const s = slides[idx]
  return (
    <div className="relative overflow-hidden rounded-xl md:rounded-none bg-white">
      <div className={`relative bg-gradient-to-r ${s.bg} text-white`}>
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 grid md:grid-cols-2 gap-6 items-center min-h-[280px] md:min-h-[320px]">
          <div className="space-y-3">
            <span className="inline-block bg-white/20 backdrop-blur text-white text-xs font-bold tracking-widest px-3 py-1 rounded-full">{s.kicker}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight" style={{ fontFamily: "var(--font-display)" }}>{s.title}</h2>
            <p className="text-white/90 text-sm md:text-base">{s.desc}</p>
            <a href="/browse" className="inline-block bg-white text-[#2874F0] font-bold text-sm px-6 py-2.5 rounded-full shadow mt-2">{s.cta} →</a>
          </div>
          <div className="hidden md:block">
            <img src={s.img} alt="" className="rounded-xl shadow-2xl object-cover w-full aspect-[16/10] border border-white/20" />
          </div>
        </div>
      </div>
      <button aria-label="prev" onClick={() => setIdx((i) => (i - 1 + slides.length) % slides.length)} className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 bg-white shadow-lg rounded-full hidden md:flex items-center justify-center"><ChevronLeft className="h-5 w-5" /></button>
      <button aria-label="next" onClick={() => setIdx((i) => (i + 1) % slides.length)} className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 bg-white shadow-lg rounded-full hidden md:flex items-center justify-center"><ChevronRight className="h-5 w-5" /></button>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`h-2 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-2 bg-white/60"}`} />
        ))}
      </div>
    </div>
  )
}
