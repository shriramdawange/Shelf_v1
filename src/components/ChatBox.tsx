"use client"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"
import type { Message } from "@/types"

export default function ChatBox({ orderId, currentUserId }: { orderId: string; currentUserId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const supabase = createClient()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase.from("messages").select("*").eq("order_id", orderId).order("created_at", { ascending: true })
      if (data) setMessages(data as Message[])
    }
    fetchMessages()
    const channel = supabase.channel(`messages-${orderId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `order_id=eq.${orderId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [orderId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const send = async () => {
    if (!text.trim()) return
    const { error } = await supabase.from("messages").insert({ order_id: orderId, sender_id: currentUserId, content: text.trim() })
    if (error) toast.error(error.message)
    else setText("")
  }

  return (
    <div className="flex flex-col h-[400px] border rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
        {messages.length === 0 ? <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Start the conversation! 👋</p> : messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender_id === currentUserId ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.sender_id === currentUserId ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border rounded-bl-sm"}`}>
              <p>{m.content}</p><span className="text-[10px] opacity-70">{formatDate(m.created_at)}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t flex gap-2 bg-background">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => e.key === "Enter" && send()} />
        <Button onClick={send}>Send</Button>
      </div>
    </div>
  )
}
