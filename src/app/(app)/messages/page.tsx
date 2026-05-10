"use client";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Hash, Plus, Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { initials, formatRelativeTime, cn } from "@/lib/utils";

export default function MessagesPage() {
  const session = useSession();
  const userId = (session.data?.user as any)?.id as string | undefined;
  const qc = useQueryClient();

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [content, setContent] = React.useState("");
  const [newOpen, setNewOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [messages, setMessages] = React.useState<any[]>([]);
  const listRef = React.useRef<HTMLDivElement>(null);

  const { data: channelsData, isLoading: loadingChannels } = useQuery<{ channels: any[] }>({
    queryKey: ["channels"], queryFn: () => fetch("/api/channels").then((r) => r.json()),
  });

  React.useEffect(() => {
    if (!activeId && channelsData?.channels?.length) setActiveId(channelsData.channels[0].id);
  }, [channelsData, activeId]);

  // Initial messages + SSE
  React.useEffect(() => {
    if (!activeId) return;
    let aborted = false;
    fetch(`/api/channels/${activeId}/messages`)
      .then((r) => r.json())
      .then((d) => {
        if (!aborted) {
          setMessages(d.messages || []);
          setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }), 50);
        }
      });
    const es = new EventSource(`/api/channels/${activeId}/stream`);
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === "message") {
          setMessages((m) => [...m, data.message]);
          setTimeout(() => listRef.current?.scrollTo({ top: listRef.current!.scrollHeight, behavior: "smooth" }), 30);
        }
      } catch {}
    };
    return () => { aborted = true; es.close(); };
  }, [activeId]);

  async function send() {
    if (!content.trim() || !activeId) return;
    const text = content;
    setContent("");
    const r = await fetch(`/api/channels/${activeId}/messages`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: text }),
    });
    if (!r.ok) {
      toast.error("Failed to send");
      setContent(text);
    }
  }

  async function createChannel() {
    if (!newName.trim()) return;
    const r = await fetch("/api/channels", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName }),
    });
    if (r.ok) {
      const d = await r.json();
      toast.success("Channel created");
      qc.invalidateQueries({ queryKey: ["channels"] });
      setNewOpen(false);
      setNewName("");
      setActiveId(d.channel.id);
    } else toast.error("Failed");
  }

  const channels = channelsData?.channels ?? [];
  const active = channels.find((c) => c.id === activeId);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card/40 md:flex">
        <div className="flex h-12 items-center justify-between border-b px-4">
          <h2 className="text-sm font-semibold">Channels</h2>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setNewOpen(true)}><Plus className="h-3.5 w-3.5" /></Button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {loadingChannels ? (
            <div className="space-y-1">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : (
            channels.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn("flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors", c.id === activeId ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}
              >
                <Hash className="h-3.5 w-3.5" /> {c.name}
              </button>
            ))
          )}
        </nav>
      </aside>

      <main className="flex flex-1 flex-col">
        {active ? (
          <>
            <div className="flex h-12 items-center gap-2 border-b px-4">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{active.name}</span>
              {active.description && <span className="hidden text-xs text-muted-foreground sm:inline">— {active.description}</span>}
            </div>
            <div ref={listRef} className="flex-1 space-y-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <EmptyState icon={MessageSquare} title="No messages yet" description="Send the first message in this channel." />
              ) : (
                messages.map((m, i) => {
                  const prev = messages[i - 1];
                  const grouped = prev && prev.author.id === m.author.id && new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60_000;
                  return (
                    <div key={m.id} className={cn("group flex gap-3 rounded-lg px-2 py-1 hover:bg-muted/30", grouped && "mt-0")}>
                      <div className="w-8 shrink-0">
                        {!grouped && (
                          <Avatar className="h-8 w-8"><AvatarImage src={m.author.avatar} /><AvatarFallback>{initials(m.author.name)}</AvatarFallback></Avatar>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        {!grouped && (
                          <div className="flex items-baseline gap-2 text-xs">
                            <span className="font-semibold text-foreground">{m.author.name}</span>
                            <span className="text-muted-foreground">{formatRelativeTime(m.createdAt)}</span>
                          </div>
                        )}
                        <p className={cn("whitespace-pre-wrap text-sm", m.author.id === userId && "")}>{m.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="border-t p-4"
            >
              <div className="flex gap-2">
                <Input placeholder={`Message #${active.name}`} value={content} onChange={(e) => setContent(e.target.value)} />
                <Button type="submit" disabled={!content.trim()}><Send className="h-4 w-4" /></Button>
              </div>
            </form>
          </>
        ) : (
          <EmptyState icon={MessageSquare} title="No channel selected" description="Pick a channel from the sidebar to start chatting." className="m-auto" />
        )}
      </main>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create channel</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Channel name</Label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value.toLowerCase().replace(/\s+/g, "-"))} placeholder="e.g. marketing" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={createChannel} disabled={!newName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
