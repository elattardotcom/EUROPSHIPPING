import { addSubscriber, removeSubscriber } from "@/lib/withdrawals"

export const dynamic = "force-dynamic"

export async function GET() {
  const id      = Math.random().toString(36).slice(2)
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      addSubscriber(id, (data: string) => {
        try { controller.enqueue(encoder.encode(data)) } catch { removeSubscriber(id) }
      })
      controller.enqueue(encoder.encode(`event: connected\ndata: {"id":"${id}"}\n\n`))
    },
    cancel() {
      removeSubscriber(id)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection":    "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
