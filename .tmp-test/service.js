"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
const templates_1 = require("./templates");
const webhook_1 = require("./webhook");
const util_1 = require("./util");
const RANK = { sent: 1, delivered: 2, read: 3 };
function validate(e) {
    if (!e.merchantId?.trim() || !e.merchantName?.trim())
        return "Merchant is missing.";
    if (e.kind === "receipt") {
        if (!e.transactionId?.trim())
            return "Transaction reference is missing.";
        if (!e.receiptNo?.trim())
            return "Receipt number is missing.";
        if (!Array.isArray(e.items) || e.items.length === 0)
            return "A receipt needs at least one item.";
        for (const i of e.items) {
            if (!i.name?.trim() || !Number.isInteger(i.qty) || i.qty < 1 || !Number.isInteger(i.unitCents) || i.unitCents < 0) {
                return "A receipt item is invalid.";
            }
        }
        if (!Number.isInteger(e.totalCents) || e.totalCents < 0)
            return "The total is invalid.";
        if (!Number.isInteger(e.backpayEarnedCents) || e.backpayEarnedCents < 0)
            return "The BackPay amount is invalid.";
        return null;
    }
    if (!e.promotionId?.trim())
        return "Promotion reference is missing.";
    if (!e.headline?.trim())
        return "The promotion message is empty.";
    return null;
}
class MessagingService {
    store;
    consent;
    provider;
    senderId;
    maxAttempts;
    backoffMs;
    staleSendingMs;
    clock;
    constructor(o) {
        this.store = o.store;
        this.consent = o.consent;
        this.provider = o.provider;
        this.senderId = o.senderId;
        this.maxAttempts = o.maxAttempts ?? 5;
        this.backoffMs = o.backoffMs ?? [30_000, 120_000, 600_000, 3_600_000];
        this.staleSendingMs = o.staleSendingMs ?? 120_000;
        this.clock = o.now ?? (() => Date.now());
    }
    log(messageId, type, detail) {
        this.store.addEvent({ id: (0, util_1.newId)("evt"), messageId, type, at: this.clock(), detail });
    }
    // ---- Step 1: a completed sale becomes a queued message (never blocks the sale) ----
    enqueue(event) {
        const problem = validate(event);
        if (problem) {
            this.log("n/a", "rejected_invalid_event", problem);
            return { ok: false, reason: "invalid_event", detail: problem };
        }
        const phone = (0, util_1.normalizeMsisdn)(event.customerPhone);
        if (!phone) {
            this.log("n/a", "rejected_invalid_phone", `${event.kind} for ${event.merchantId}`);
            return { ok: false, reason: "invalid_phone", detail: "The WhatsApp number is not valid." };
        }
        const ref = event.kind === "receipt" ? event.transactionId : event.promotionId;
        const key = `${event.kind}:${ref}:${phone}`;
        const rendered = (0, templates_1.render)({ ...event, customerPhone: phone });
        return this.create(rendered, key, {
            merchantId: event.merchantId,
            merchantName: event.merchantName,
            phone,
            transactionId: event.kind === "receipt" ? event.transactionId : null,
            campaignId: event.kind === "promotion" ? event.promotionId : null,
            resendOf: null,
        });
    }
    create(r, key, ctx) {
        const existing = this.store.getByKey(key);
        if (existing)
            return { ok: true, created: false, message: existing };
        const now = this.clock();
        const allowed = this.consent.canSend(ctx.phone, r.consent);
        const msg = {
            id: (0, util_1.newId)("msg"),
            idempotencyKey: key,
            category: r.category,
            consentCategory: r.consent,
            templateId: r.templateId,
            language: r.language,
            merchantId: ctx.merchantId,
            merchantName: ctx.merchantName,
            customerPhone: ctx.phone,
            transactionId: ctx.transactionId,
            campaignId: ctx.campaignId,
            senderId: this.senderId,
            params: r.params,
            bodyPreview: r.body,
            status: allowed ? "queued" : "blocked",
            attempts: 0,
            nextAttemptAt: allowed ? now : null,
            lockedAt: null,
            providerMessageId: null,
            simulated: this.provider.simulated,
            failureCode: allowed ? null : "NO_CONSENT",
            failureReason: allowed ? null : `No ${r.consent} consent on record`,
            resendOf: ctx.resendOf,
            createdAt: now,
            sentAt: null,
            deliveredAt: null,
            readAt: null,
        };
        this.store.insert(msg);
        this.log(msg.id, allowed ? "queued" : "blocked_no_consent", `${r.templateId} via ${this.senderId}`);
        return { ok: true, created: true, message: msg };
    }
    // ---- Step 2: a background worker sends queued messages ----
    async processQueue(limit = 25) {
        const summary = { attempted: 0, sent: 0, retried: 0, failed: 0, blocked: 0 };
        this.recoverStale();
        for (const due of this.store.dueQueued(this.clock(), limit)) {
            const claimed = this.store.claim(due.id, this.clock());
            if (!claimed)
                continue; // another worker took it
            summary.attempted += 1;
            summary[await this.attempt(claimed)] += 1;
        }
        return summary;
    }
    recoverStale() {
        const before = this.clock() - this.staleSendingMs;
        for (const m of this.store.staleSending(before)) {
            m.status = "queued";
            m.lockedAt = null;
            m.nextAttemptAt = this.clock();
            this.store.update(m);
            this.log(m.id, "recovered_stale_lock", "A worker stopped mid-send. Re-queued.");
        }
    }
    async attempt(m) {
        // Consent is checked again at send time: a withdrawal after queueing stops the message
        if (!this.consent.canSend(m.customerPhone, m.consentCategory)) {
            const cur = this.store.getById(m.id) ?? m;
            cur.status = "blocked";
            cur.lockedAt = null;
            cur.nextAttemptAt = null;
            cur.failureCode = "NO_CONSENT";
            cur.failureReason = `No ${m.consentCategory} consent at send time`;
            this.store.update(cur);
            this.log(cur.id, "blocked_no_consent_at_send");
            return "blocked";
        }
        let result;
        try {
            result = await this.provider.send({
                to: m.customerPhone,
                templateId: m.templateId,
                language: m.language,
                params: m.params,
                bodyPreview: m.bodyPreview,
                messageId: m.id,
            });
        }
        catch (e) {
            result = {
                ok: false,
                kind: "temporary",
                code: "PROVIDER_EXCEPTION",
                reason: e instanceof Error ? e.message : "Provider error",
            };
        }
        const now = this.clock();
        const cur = this.store.getById(m.id) ?? m;
        const attempts = cur.attempts + 1;
        cur.attempts = attempts;
        cur.lockedAt = null;
        if (result.ok) {
            cur.status = "sent";
            cur.providerMessageId = result.providerMessageId;
            cur.simulated = result.simulated;
            cur.sentAt = now;
            cur.nextAttemptAt = null;
            cur.failureCode = null;
            cur.failureReason = null;
            this.store.update(cur);
            this.log(cur.id, "sent", result.providerMessageId);
            return "sent";
        }
        cur.failureCode = result.code;
        cur.failureReason = result.reason;
        if (result.kind === "temporary" && attempts < this.maxAttempts) {
            const wait = this.backoffMs[Math.min(attempts - 1, this.backoffMs.length - 1)];
            cur.status = "queued";
            cur.nextAttemptAt = now + wait;
            this.store.update(cur);
            this.log(cur.id, "retry_scheduled", `${result.code}: attempt ${attempts} of ${this.maxAttempts}`);
            return "retried";
        }
        cur.status = "failed";
        cur.nextAttemptAt = null;
        if (result.kind === "temporary")
            cur.failureReason = `${result.reason} (gave up after ${attempts} attempts)`;
        this.store.update(cur);
        this.log(cur.id, "failed", `${result.code}: ${result.reason}`);
        return "failed";
    }
    // ---- Step 3: delivery webhooks update the status ----
    applyStatus(u) {
        const eventId = u.eventId ?? `${u.providerMessageId}:${u.status}:${u.at}`;
        if (!this.store.markWebhookSeen(eventId))
            return { result: "duplicate" };
        const m = this.store.getByProviderId(u.providerMessageId);
        if (!m) {
            this.log("n/a", "webhook_unknown_message", u.providerMessageId);
            return { result: "unknown_message" };
        }
        if (u.status === "failed") {
            if (m.status === "delivered" || m.status === "read") {
                this.log(m.id, "webhook_ignored_failed_after_delivery");
                return { result: "ignored", message: m };
            }
            m.status = "failed";
            m.failureCode = u.errorCode ?? "PROVIDER_FAILED";
            m.failureReason = u.errorTitle ?? "Delivery failed";
            this.store.update(m);
            this.log(m.id, "webhook_failed", `${m.failureCode}: ${m.failureReason}`);
            return { result: "applied", message: m };
        }
        const currentRank = RANK[m.status] ?? 0;
        const newRank = RANK[u.status];
        if (newRank <= currentRank) {
            this.log(m.id, "webhook_out_of_order_ignored", `${u.status} after ${m.status}`);
            return { result: "ignored", message: m };
        }
        m.sentAt = m.sentAt ?? u.at;
        if (newRank >= 2)
            m.deliveredAt = m.deliveredAt ?? u.at;
        if (newRank >= 3)
            m.readAt = u.at;
        m.status = u.status;
        m.failureCode = null;
        m.failureReason = null;
        this.store.update(m);
        this.log(m.id, `webhook_${u.status}`);
        return { result: "applied", message: m };
    }
    // Applies a parsed provider webhook: status updates and STOP opt-outs
    processWebhook(p) {
        let statuses = 0;
        let optOuts = 0;
        for (const s of p.statuses) {
            if (this.applyStatus(s).result === "applied")
                statuses += 1;
        }
        for (const m of p.inbound) {
            if ((0, webhook_1.isOptOut)(m.text)) {
                const phone = (0, util_1.normalizeMsisdn)(m.from);
                if (phone && this.consent.withdraw(phone, "all", "whatsapp_reply_stop", this.clock())) {
                    optOuts += 1;
                    this.log("n/a", "opt_out", phone);
                }
            }
        }
        return { statuses, optOuts };
    }
    // ---- Authorised resend: creates a NEW message record, never a new transaction ----
    resend(merchantId, messageId, actor) {
        const m = this.getForMerchant(merchantId, messageId);
        if (!m)
            return { ok: false, reason: "not_found", detail: "Message not found." };
        if (m.status !== "failed" && m.status !== "blocked") {
            return { ok: false, reason: "not_resendable", detail: "Only failed or blocked messages can be resent." };
        }
        const root = m.resendOf ?? m.id;
        const count = this.store.list({ merchantId }).filter((x) => x.resendOf === root).length;
        const rendered = {
            templateId: m.templateId,
            language: m.language,
            category: m.category,
            consent: m.consentCategory,
            params: m.params,
            body: m.bodyPreview,
        };
        const res = this.create(rendered, `${m.idempotencyKey}#resend:${count + 1}`, {
            merchantId: m.merchantId,
            merchantName: m.merchantName,
            phone: m.customerPhone,
            transactionId: m.transactionId,
            campaignId: m.campaignId,
            resendOf: root,
        });
        if (res.ok)
            this.log(res.message.id, "resend_authorised", `by ${actor}, original ${m.id}`);
        return res;
    }
    // ---- Tenant isolation: a merchant only ever sees its own messages ----
    listForMerchant(merchantId) {
        return this.store.list({ merchantId });
    }
    getForMerchant(merchantId, messageId) {
        const m = this.store.getById(messageId);
        return m && m.merchantId === merchantId ? m : undefined;
    }
    // A customer's own view across every merchant
    listForCustomer(phone) {
        const p = (0, util_1.normalizeMsisdn)(phone);
        return p ? this.store.list({ customerPhone: p }) : [];
    }
    eventsForMerchant(merchantId, messageId) {
        return this.getForMerchant(merchantId, messageId) ? this.store.eventsFor(messageId) : [];
    }
}
exports.MessagingService = MessagingService;
