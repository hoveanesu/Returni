import type { MessageEventRow, OutboundMessage } from "./types";

// The store is an interface so the in-memory version can be swapped for
// Supabase later. The unique idempotency key must become a UNIQUE constraint.
export interface MessageStore {
  getByKey(key: string): OutboundMessage | undefined;
  getById(id: string): OutboundMessage | undefined;
  getByProviderId(providerMessageId: string): OutboundMessage | undefined;
  insert(m: OutboundMessage): void;
  update(m: OutboundMessage): void;
  claim(id: string, now: number): OutboundMessage | undefined;
  dueQueued(now: number, limit: number): OutboundMessage[];
  staleSending(before: number): OutboundMessage[];
  list(filter?: { merchantId?: string; customerPhone?: string }): OutboundMessage[];
  addEvent(e: MessageEventRow): void;
  eventsFor(messageId: string): MessageEventRow[];
  markWebhookSeen(eventId: string): boolean; // false = already processed
}

export class MemoryMessageStore implements MessageStore {
  private messages = new Map<string, OutboundMessage>();
  private byKey = new Map<string, string>();
  private byProvider = new Map<string, string>();
  private events: MessageEventRow[] = [];
  private seen = new Set<string>();

  private copy(m: OutboundMessage | undefined) {
    return m ? structuredClone(m) : undefined;
  }

  getByKey(key: string) {
    const id = this.byKey.get(key);
    return id ? this.copy(this.messages.get(id)) : undefined;
  }
  getById(id: string) {
    return this.copy(this.messages.get(id));
  }
  getByProviderId(pid: string) {
    const id = this.byProvider.get(pid);
    return id ? this.copy(this.messages.get(id)) : undefined;
  }

  insert(m: OutboundMessage) {
    if (this.byKey.has(m.idempotencyKey)) throw new Error("Duplicate idempotency key");
    this.messages.set(m.id, structuredClone(m));
    this.byKey.set(m.idempotencyKey, m.id);
    if (m.providerMessageId) this.byProvider.set(m.providerMessageId, m.id);
  }

  update(m: OutboundMessage) {
    if (!this.messages.has(m.id)) throw new Error("Unknown message");
    this.messages.set(m.id, structuredClone(m));
    if (m.providerMessageId) this.byProvider.set(m.providerMessageId, m.id);
  }

  // Atomic: only one caller can move a message from queued to sending
  claim(id: string, now: number) {
    const m = this.messages.get(id);
    if (!m || m.status !== "queued") return undefined;
    m.status = "sending";
    m.lockedAt = now;
    return this.copy(m);
  }

  dueQueued(now: number, limit: number) {
    return [...this.messages.values()]
      .filter((m) => m.status === "queued" && (m.nextAttemptAt ?? 0) <= now)
      .sort((a, b) => (a.nextAttemptAt ?? 0) - (b.nextAttemptAt ?? 0))
      .slice(0, limit)
      .map((m) => structuredClone(m));
  }

  staleSending(before: number) {
    return [...this.messages.values()]
      .filter((m) => m.status === "sending" && (m.lockedAt ?? 0) < before)
      .map((m) => structuredClone(m));
  }

  list(filter?: { merchantId?: string; customerPhone?: string }) {
    return [...this.messages.values()]
      .filter((m) => !filter?.merchantId || m.merchantId === filter.merchantId)
      .filter((m) => !filter?.customerPhone || m.customerPhone === filter.customerPhone)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((m) => structuredClone(m));
  }

  addEvent(e: MessageEventRow) {
    this.events.push({ ...e });
  }
  eventsFor(messageId: string) {
    return this.events.filter((e) => e.messageId === messageId).map((e) => ({ ...e }));
  }

  markWebhookSeen(eventId: string) {
    if (this.seen.has(eventId)) return false;
    this.seen.add(eventId);
    return true;
  }
}