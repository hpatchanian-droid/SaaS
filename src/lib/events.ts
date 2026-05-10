// In-process pub/sub for realtime events. Works in dev and single-instance prod.
// For multi-instance prod, swap to Redis or Supabase Realtime.

type Listener = (data: any) => void;
const channels = new Map<string, Set<Listener>>();

export function subscribe(channel: string, fn: Listener) {
  if (!channels.has(channel)) channels.set(channel, new Set());
  channels.get(channel)!.add(fn);
  return () => channels.get(channel)?.delete(fn);
}

export function publish(channel: string, data: any) {
  channels.get(channel)?.forEach((fn) => {
    try { fn(data); } catch {}
  });
}
