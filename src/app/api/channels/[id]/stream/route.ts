import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { subscribe } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  const channel = await prisma.channel.findFirst({ where: { id: params.id, businessId: user.businessId } });
  if (!channel) return new Response("Not found", { status: 404 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (data: any) => {
        try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)); } catch {}
      };
      send({ type: "open" });
      const unsub = subscribe(`channel:${params.id}`, send);
      const ping = setInterval(() => send({ type: "ping" }), 25000);
      req.signal.addEventListener("abort", () => {
        clearInterval(ping);
        unsub();
        try { controller.close(); } catch {}
      });
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
