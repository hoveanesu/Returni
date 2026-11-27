"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryMessageStore = void 0;
class MemoryMessageStore {
    messages = new Map();
    byKey = new Map();
    byProvider = new Map();
    events = [];
    seen = new Set();
    copy(m) {
        return m ? structuredClone(m) : undefined;
    }
    getByKey(key) {
        const id = this.byKey.get(key);
        return id ? this.copy(this.messages.get(id)) : undefined;
    }
    getById(id) {
        return this.copy(this.messages.get(id));
    }
    getByProviderId(pid) {
        const id = this.byProvider.get(pid);
        return id ? this.copy(this.messages.get(id)) : undefined;
    }
    insert(m) {
        if (this.byKey.has(m.idempotencyKey))
            throw new Error("Duplicate idempotency key");
        this.messages.set(m.id, structuredClone(m));
        this.byKey.set(m.idempotencyKey, m.id);
        if (m.providerMessageId)
            this.byProvider.set(m.providerMessageId, m.id);
    }
    update(m) {
        if (!this.messages.has(m.id))
            throw new Error("Unknown message");
        this.messages.set(m.id, structuredClone(m));
        if (m.providerMessageId)
            this.byProvider.set(m.providerMessageId, m.id);
    }
    // Atomic: only one caller can move a message from queued to sending
    claim(id, now) {
        const m = this.messages.get(id);
        if (!m || m.status !== "queued")
            return undefined;
        m.status = "sending";
        m.lockedAt = now;
        return this.copy(m);
    }
    dueQueued(now, limit) {
        return [...this.messages.values()]
            .filter((m) => m.status === "queued" && (m.nextAttemptAt ?? 0) <= now)
            .sort((a, b) => (a.nextAttemptAt ?? 0) - (b.nextAttemptAt ?? 0))
            .slice(0, limit)
            .map((m) => structuredClone(m));
    }
    staleSending(before) {
        return [...this.messages.values()]
            .filter((m) => m.status === "sending" && (m.lockedAt ?? 0) < before)
            .map((m) => structuredClone(m));
    }
    list(filter) {
        return [...this.messages.values()]
            .filter((m) => !filter?.merchantId || m.merchantId === filter.merchantId)
            .filter((m) => !filter?.customerPhone || m.customerPhone === filter.customerPhone)
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((m) => structuredClone(m));
    }
    addEvent(e) {
        this.events.push({ ...e });
    }
    eventsFor(messageId) {
        return this.events.filter((e) => e.messageId === messageId).map((e) => ({ ...e }));
    }
    markWebhookSeen(eventId) {
        if (this.seen.has(eventId))
            return false;
        this.seen.add(eventId);
        return true;
    }
}
exports.MemoryMessageStore = MemoryMessageStore;
