"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const node_crypto_1 = require("node:crypto");
const consent_1 = require("./consent");
const provider_1 = require("./provider");
const store_1 = require("./store");
const service_1 = require("./service");
const webhook_1 = require("./webhook");
const util_1 = require("./util");
const SENDER = "RETURNi-central";
function setup(opts = {}) {
    const clock = { t: 1_800_000_000_000 };
    const provider = new provider_1.DevProvider();
    const consent = new consent_1.ConsentLedger();
    const svc = new service_1.MessagingService({
        store: new store_1.MemoryMessageStore(),
        consent,
        provider,
        senderId: SENDER,
        maxAttempts: opts.maxAttempts,
        now: () => clock.t,
    });
    const grant = (phone, cat = "transactional") => consent.grant(phone, cat, "record_sale_checkbox", "v1", clock.t);
    return { svc, provider, consent, clock, grant };
}
const receipt = (over = {}) => ({
    kind: "receipt",
    transactionId: "tx-1",
    merchantId: "store-a",
    merchantName: "ABC Grocery",
    branch: "Harare CBD",
    customerPhone: "0771234567",
    customerName: "Anesu",
    receiptNo: "RT-000123",
    dateText: "26 Nov 2026",
    items: [
        { name: "Rice 5kg", qty: 1, unitCents: 875 },
        { name: "Bread", qty: 1, unitCents: 100 },
    ],
    totalCents: 975,
    backpayEarnedCents: 29,
    goldDrop: "active",
    ...over,
});
const promo = (over = {}) => ({
    kind: "promotion",
    promotionId: "promo-1",
    merchantId: "store-a",
    merchantName: "ABC Grocery",
    customerPhone: "0771234567",
    headline: "Earn 10% BackPay this weekend",
    endsText: "30 Nov 2026",
    ...over,
});
(0, node_test_1.test)("1. one merchant: one transaction, one message, central sender, merchant named", async () => {
    const { svc, provider, grant } = setup();
    grant("0771234567");
    const r = svc.enqueue(receipt());
    strict_1.default.ok(r.ok && r.created);
    const sum = await svc.processQueue();
    strict_1.default.equal(sum.sent, 1);
    strict_1.default.equal(provider.sent.length, 1);
    const msgs = svc.listForMerchant("store-a");
    strict_1.default.equal(msgs.length, 1);
    strict_1.default.equal(msgs[0].senderId, SENDER);
    strict_1.default.equal(msgs[0].status, "sent");
    strict_1.default.equal(msgs[0].transactionId, "tx-1");
    strict_1.default.ok(msgs[0].bodyPreview.includes("Merchant: ABC Grocery"));
    strict_1.default.ok(msgs[0].bodyPreview.includes("Total: $9.75"));
    strict_1.default.ok(msgs[0].bodyPreview.includes("BackPay earned: $0.29"));
    strict_1.default.equal(msgs[0].simulated, true);
});
(0, node_test_1.test)("2. three merchants, same customer, same RETURNi sender", async () => {
    const { svc, provider, grant } = setup();
    grant("0771234567");
    const stores = [
        ["store-a", "ABC Grocery", "tx-a"],
        ["store-b", "Zed Fashion", "tx-b"],
        ["store-c", "Cafe Nova", "tx-c"],
    ];
    for (const [id, name, tx] of stores) {
        svc.enqueue(receipt({ merchantId: id, merchantName: name, transactionId: tx, customerPhone: "+263771234567" }));
    }
    await svc.processQueue();
    strict_1.default.equal(provider.sent.length, 3);
    const mine = svc.listForCustomer("771234567");
    strict_1.default.equal(mine.length, 3);
    strict_1.default.equal(new Set(mine.map((m) => m.senderId)).size, 1);
    strict_1.default.equal(new Set(mine.map((m) => m.customerPhone)).size, 1);
    for (const [id, name] of stores) {
        const m = svc.listForMerchant(id);
        strict_1.default.equal(m.length, 1);
        strict_1.default.ok(m[0].bodyPreview.includes(`Merchant: ${name}`));
    }
});
(0, node_test_1.test)("3. duplicates: same event twice and parallel workers send once", async () => {
    const { svc, provider, grant } = setup();
    grant("0771234567");
    const a = svc.enqueue(receipt());
    const b = svc.enqueue(receipt());
    strict_1.default.ok(a.ok && b.ok);
    if (a.ok && b.ok) {
        strict_1.default.equal(a.created, true);
        strict_1.default.equal(b.created, false);
        strict_1.default.equal(a.message.id, b.message.id);
    }
    await Promise.all([svc.processQueue(), svc.processQueue()]);
    await svc.processQueue();
    strict_1.default.equal(provider.sent.length, 1);
    strict_1.default.equal(svc.listForMerchant("store-a").length, 1);
});
(0, node_test_1.test)("4. no receipt consent: nothing is sent, decision recorded", async () => {
    const { svc, provider } = setup();
    const r = svc.enqueue(receipt());
    strict_1.default.ok(r.ok);
    const sum = await svc.processQueue();
    strict_1.default.equal(sum.attempted, 0);
    strict_1.default.equal(provider.sent.length, 0);
    const m = svc.listForMerchant("store-a")[0];
    strict_1.default.equal(m.status, "blocked");
    strict_1.default.equal(m.failureCode, "NO_CONSENT");
    strict_1.default.ok(svc.eventsForMerchant("store-a", m.id).some((e) => e.type === "blocked_no_consent"));
});
(0, node_test_1.test)("5. receipt consent is not marketing consent", async () => {
    const { svc, provider, consent, grant } = setup();
    grant("0771234567", "transactional");
    svc.enqueue(receipt());
    svc.enqueue(promo());
    await svc.processQueue();
    strict_1.default.equal(provider.sent.length, 1);
    strict_1.default.equal(provider.sent[0].templateId, "receipt_v1");
    const p = svc.listForMerchant("store-a").find((m) => m.category === "promotion");
    strict_1.default.equal(p?.status, "blocked");
    strict_1.default.equal(consent.status("0771234567", "marketing"), "none");
});
(0, node_test_1.test)("6. provider down: message stays queued, retried later, sent once", async () => {
    const { svc, provider, clock, grant } = setup();
    grant("0771234567");
    svc.enqueue(receipt());
    provider.mode = "temporary_fail";
    let s = await svc.processQueue();
    strict_1.default.equal(s.retried, 1);
    let m = svc.listForMerchant("store-a")[0];
    strict_1.default.equal(m.status, "queued");
    strict_1.default.equal(m.attempts, 1);
    s = await svc.processQueue();
    strict_1.default.equal(s.attempted, 0); // not due yet
    provider.mode = "ok";
    clock.t += 60_000;
    s = await svc.processQueue();
    strict_1.default.equal(s.sent, 1);
    m = svc.listForMerchant("store-a")[0];
    strict_1.default.equal(m.status, "sent");
    strict_1.default.equal(svc.listForMerchant("store-a").length, 1);
    strict_1.default.equal(provider.sent.length, 1);
});
(0, node_test_1.test)("6b. a thrown provider error is treated as temporary", async () => {
    const { svc, provider, grant } = setup();
    grant("0771234567");
    svc.enqueue(receipt());
    provider.mode = "throw";
    const s = await svc.processQueue();
    strict_1.default.equal(s.retried, 1);
    strict_1.default.equal(svc.listForMerchant("store-a")[0].failureCode, "PROVIDER_EXCEPTION");
});
(0, node_test_1.test)("7. delivery webhook updates status once; duplicates and out-of-order are safe", async () => {
    const { svc, grant, clock } = setup();
    grant("0771234567");
    svc.enqueue(receipt());
    await svc.processQueue();
    const m0 = svc.listForMerchant("store-a")[0];
    const pid = m0.providerMessageId;
    const upd = { providerMessageId: pid, status: "delivered", at: clock.t + 5000, eventId: "e1" };
    strict_1.default.equal(svc.applyStatus(upd).result, "applied");
    strict_1.default.equal(svc.applyStatus(upd).result, "duplicate");
    let m = svc.listForMerchant("store-a")[0];
    strict_1.default.equal(m.status, "delivered");
    strict_1.default.equal(m.merchantId, "store-a");
    strict_1.default.equal(m.transactionId, "tx-1");
    svc.applyStatus({ providerMessageId: pid, status: "read", at: clock.t + 9000, eventId: "e2" });
    strict_1.default.equal(svc.applyStatus({ providerMessageId: pid, status: "sent", at: clock.t + 1000, eventId: "e3" }).result, "ignored");
    strict_1.default.equal(svc.applyStatus({ providerMessageId: pid, status: "failed", at: clock.t + 9500, eventId: "e4" }).result, "ignored");
    m = svc.listForMerchant("store-a")[0];
    strict_1.default.equal(m.status, "read");
    strict_1.default.equal(svc.applyStatus({ providerMessageId: "nope", status: "sent", at: 1, eventId: "e5" }).result, "unknown_message");
});
(0, node_test_1.test)("8. failed message: permanent fails at once, temporary gives up, sale untouched, resend is audited", async () => {
    const perm = setup();
    perm.grant("0771234567");
    perm.svc.enqueue(receipt());
    perm.provider.mode = "permanent_fail";
    let s = await perm.svc.processQueue();
    strict_1.default.equal(s.failed, 1);
    perm.clock.t += 86_400_000;
    s = await perm.svc.processQueue();
    strict_1.default.equal(s.attempted, 0);
    const failed = perm.svc.listForMerchant("store-a")[0];
    strict_1.default.equal(failed.status, "failed");
    strict_1.default.equal(failed.failureCode, "SIM_REJECTED");
    perm.provider.mode = "ok";
    const re = perm.svc.resend("store-a", failed.id, "owner@store-a");
    strict_1.default.ok(re.ok && re.created);
    const denied = perm.svc.resend("store-b", failed.id, "intruder");
    strict_1.default.ok(!denied.ok && denied.reason === "not_found");
    await perm.svc.processQueue();
    const all = perm.svc.listForMerchant("store-a");
    strict_1.default.equal(all.length, 2);
    strict_1.default.equal(all.filter((m) => m.status === "sent").length, 1);
    strict_1.default.equal(all.find((m) => m.status === "failed")?.id, failed.id);
    strict_1.default.ok(all.some((m) => m.resendOf === failed.id));
    const temp = setup({ maxAttempts: 3 });
    temp.grant("0771234567");
    temp.svc.enqueue(receipt());
    temp.provider.mode = "temporary_fail";
    for (let i = 0; i < 5; i++) {
        await temp.svc.processQueue();
        temp.clock.t += 86_400_000;
    }
    const t = temp.svc.listForMerchant("store-a")[0];
    strict_1.default.equal(t.status, "failed");
    strict_1.default.equal(t.attempts, 3);
    strict_1.default.ok(t.failureReason?.includes("gave up"));
});
(0, node_test_1.test)("9. merchant privacy: store B cannot see store A", async () => {
    const { svc, grant } = setup();
    grant("0771234567");
    svc.enqueue(receipt());
    svc.enqueue(receipt({ merchantId: "store-b", merchantName: "Zed Fashion", transactionId: "tx-b" }));
    const a = svc.listForMerchant("store-a")[0];
    strict_1.default.equal(svc.listForMerchant("store-b").length, 1);
    strict_1.default.equal(svc.getForMerchant("store-b", a.id), undefined);
    strict_1.default.deepEqual(svc.eventsForMerchant("store-b", a.id), []);
});
(0, node_test_1.test)("10. customer identity: every phone format is one customer and one consent", async () => {
    const forms = ["0771234567", "+263771234567", "263771234567", "771234567", "00263771234567", "+263 77 123 4567"];
    for (const f of forms)
        strict_1.default.equal((0, util_1.normalizeMsisdn)(f), "+263771234567", f);
    strict_1.default.equal((0, util_1.normalizeMsisdn)("12345"), null);
    strict_1.default.equal((0, util_1.normalizeMsisdn)("0661234567"), null);
    const { svc, provider, grant } = setup();
    grant("771234567");
    svc.enqueue(receipt({ customerPhone: "0771234567" }));
    svc.enqueue(receipt({ transactionId: "tx-2", merchantId: "store-b", merchantName: "Zed Fashion", customerPhone: "+263771234567" }));
    await svc.processQueue();
    strict_1.default.equal(provider.sent.length, 2);
    strict_1.default.equal(new Set(svc.listForCustomer("0771234567").map((m) => m.customerPhone)).size, 1);
});
(0, node_test_1.test)("extra: invalid phone and invalid events create no message", () => {
    const { svc } = setup();
    const a = svc.enqueue(receipt({ customerPhone: "abc" }));
    strict_1.default.ok(!a.ok && a.reason === "invalid_phone");
    const b = svc.enqueue(receipt({ items: [] }));
    strict_1.default.ok(!b.ok && b.reason === "invalid_event");
    strict_1.default.equal(svc.listForMerchant("store-a").length, 0);
});
(0, node_test_1.test)("extra: consent withdrawn after queueing blocks the send", async () => {
    const { svc, provider, consent, clock, grant } = setup();
    grant("0771234567");
    svc.enqueue(receipt());
    consent.withdraw("0771234567", "all", "stop", clock.t);
    const s = await svc.processQueue();
    strict_1.default.equal(s.blocked, 1);
    strict_1.default.equal(provider.sent.length, 0);
});
(0, node_test_1.test)("extra: STOP reply withdraws all consent", async () => {
    const { svc, grant, consent } = setup();
    grant("0771234567");
    grant("0771234567", "marketing");
    const parsed = (0, webhook_1.parseWebhook)({
        entry: [{ changes: [{ value: { messages: [{ from: "263771234567", id: "w1", timestamp: "1800000000", type: "text", text: { body: " Stop. " } }] } }] }],
    });
    const r = svc.processWebhook(parsed);
    strict_1.default.equal(r.optOuts, 1);
    strict_1.default.equal(consent.status("0771234567", "transactional"), "withdrawn");
    strict_1.default.equal(consent.status("0771234567", "marketing"), "withdrawn");
});
(0, node_test_1.test)("extra: webhook parsing and signature verification", () => {
    const body = JSON.stringify({
        entry: [{ changes: [{ value: { statuses: [{ id: "wamid.1", status: "delivered", timestamp: "1800000000" }, { id: "wamid.2", status: "failed", timestamp: "1800000001", errors: [{ code: 131026, title: "Undeliverable" }] }, { id: "x", status: "deleted" }] } }] }],
    });
    const p = (0, webhook_1.parseWebhook)(JSON.parse(body));
    strict_1.default.equal(p.statuses.length, 2);
    strict_1.default.equal(p.statuses[1].errorCode, "131026");
    const sig = "sha256=" + (0, node_crypto_1.createHmac)("sha256", "secret").update(body, "utf8").digest("hex");
    strict_1.default.equal((0, webhook_1.verifySignature)(body, sig, "secret"), true);
    strict_1.default.equal((0, webhook_1.verifySignature)(body, sig, "other"), false);
    strict_1.default.equal((0, webhook_1.verifySignature)(body + " ", sig, "secret"), false);
    strict_1.default.equal((0, webhook_1.verifySignature)(body, null, "secret"), false);
    strict_1.default.equal((0, webhook_1.verifySignature)(body, "sha256=zz", "secret"), false);
    strict_1.default.equal((0, webhook_1.verifySignature)(body, sig, ""), false);
});
(0, node_test_1.test)("extra: template variables are single line and long item lists are shortened", async () => {
    const { svc, grant } = setup();
    grant("0771234567");
    const items = Array.from({ length: 40 }, (_, i) => ({ name: `Product number ${i}\nwith newline`, qty: 2, unitCents: 150 }));
    const r = svc.enqueue(receipt({ items, totalCents: 12000 }));
    strict_1.default.ok(r.ok);
    if (r.ok) {
        for (const p of r.message.params)
            strict_1.default.ok(!/[\n\t]/.test(p) && !/ {4,}/.test(p));
        strict_1.default.ok(r.message.params[5].length <= 470);
        strict_1.default.ok(/\+\d+ more$/.test(r.message.params[5]));
    }
});
