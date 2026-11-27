import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { ConsentLedger } from "./consent";
import { DevProvider } from "./provider";
import { MemoryMessageStore } from "./store";
import { MessagingService } from "./service";
import { parseWebhook, verifySignature } from "./webhook";
import type { PromotionEvent, ReceiptEvent } from "./types";
import { normalizeMsisdn } from "./util";

const SENDER = "RETURNi-central";

function setup(opts: { maxAttempts?: number } = {}) {
  const clock = { t: 1_800_000_000_000 };
  const provider = new DevProvider();
  const consent = new ConsentLedger();
  const svc = new MessagingService({
    store: new MemoryMessageStore(),
    consent,
    provider,
    senderId: SENDER,
    maxAttempts: opts.maxAttempts,
    now: () => clock.t,
  });
  const grant = (phone: string, cat: "transactional" | "marketing" = "transactional") =>
    consent.grant(phone, cat, "record_sale_checkbox", "v1", clock.t);
  return { svc, provider, consent, clock, grant };
}

const receipt = (over: Partial<ReceiptEvent> = {}): ReceiptEvent => ({
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

const promo = (over: Partial<PromotionEvent> = {}): PromotionEvent => ({
  kind: "promotion",
  promotionId: "promo-1",
  merchantId: "store-a",
  merchantName: "ABC Grocery",
  customerPhone: "0771234567",
  headline: "Earn 10% BackPay this weekend",
  endsText: "30 Nov 2026",
  ...over,
});

test("1. one merchant: one transaction, one message, central sender, merchant named", async () => {
  const { svc, provider, grant } = setup();
  grant("0771234567");
  const r = svc.enqueue(receipt());
  assert.ok(r.ok && r.created);
  const sum = await svc.processQueue();
  assert.equal(sum.sent, 1);
  assert.equal(provider.sent.length, 1);
  const msgs = svc.listForMerchant("store-a");
  assert.equal(msgs.length, 1);
  assert.equal(msgs[0].senderId, SENDER);
  assert.equal(msgs[0].status, "sent");
  assert.equal(msgs[0].transactionId, "tx-1");
  assert.ok(msgs[0].bodyPreview.includes("Merchant: ABC Grocery"));
  assert.ok(msgs[0].bodyPreview.includes("Total: $9.75"));
  assert.ok(msgs[0].bodyPreview.includes("BackPay earned: $0.29"));
  assert.equal(msgs[0].simulated, true);
});

test("2. three merchants, same customer, same RETURNi sender", async () => {
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
  assert.equal(provider.sent.length, 3);
  const mine = svc.listForCustomer("771234567");
  assert.equal(mine.length, 3);
  assert.equal(new Set(mine.map((m) => m.senderId)).size, 1);
  assert.equal(new Set(mine.map((m) => m.customerPhone)).size, 1);
  for (const [id, name] of stores) {
    const m = svc.listForMerchant(id);
    assert.equal(m.length, 1);
    assert.ok(m[0].bodyPreview.includes(`Merchant: ${name}`));
  }
});

test("3. duplicates: same event twice and parallel workers send once", async () => {
  const { svc, provider, grant } = setup();
  grant("0771234567");
  const a = svc.enqueue(receipt());
  const b = svc.enqueue(receipt());
  assert.ok(a.ok && b.ok);
  if (a.ok && b.ok) {
    assert.equal(a.created, true);
    assert.equal(b.created, false);
    assert.equal(a.message.id, b.message.id);
  }
  await Promise.all([svc.processQueue(), svc.processQueue()]);
  await svc.processQueue();
  assert.equal(provider.sent.length, 1);
  assert.equal(svc.listForMerchant("store-a").length, 1);
});

test("4. no receipt consent: nothing is sent, decision recorded", async () => {
  const { svc, provider } = setup();
  const r = svc.enqueue(receipt());
  assert.ok(r.ok);
  const sum = await svc.processQueue();
  assert.equal(sum.attempted, 0);
  assert.equal(provider.sent.length, 0);
  const m = svc.listForMerchant("store-a")[0];
  assert.equal(m.status, "blocked");
  assert.equal(m.failureCode, "NO_CONSENT");
  assert.ok(svc.eventsForMerchant("store-a", m.id).some((e) => e.type === "blocked_no_consent"));
});

test("5. receipt consent is not marketing consent", async () => {
  const { svc, provider, consent, grant } = setup();
  grant("0771234567", "transactional");
  svc.enqueue(receipt());
  svc.enqueue(promo());
  await svc.processQueue();
  assert.equal(provider.sent.length, 1);
  assert.equal(provider.sent[0].templateId, "receipt_v1");
  const p = svc.listForMerchant("store-a").find((m) => m.category === "promotion");
  assert.equal(p?.status, "blocked");
  assert.equal(consent.status("0771234567", "marketing"), "none");
});

test("6. provider down: message stays queued, retried later, sent once", async () => {
  const { svc, provider, clock, grant } = setup();
  grant("0771234567");
  svc.enqueue(receipt());
  provider.mode = "temporary_fail";
  let s = await svc.processQueue();
  assert.equal(s.retried, 1);
  let m = svc.listForMerchant("store-a")[0];
  assert.equal(m.status, "queued");
  assert.equal(m.attempts, 1);
  s = await svc.processQueue();
  assert.equal(s.attempted, 0); // not due yet
  provider.mode = "ok";
  clock.t += 60_000;
  s = await svc.processQueue();
  assert.equal(s.sent, 1);
  m = svc.listForMerchant("store-a")[0];
  assert.equal(m.status, "sent");
  assert.equal(svc.listForMerchant("store-a").length, 1);
  assert.equal(provider.sent.length, 1);
});

test("6b. a thrown provider error is treated as temporary", async () => {
  const { svc, provider, grant } = setup();
  grant("0771234567");
  svc.enqueue(receipt());
  provider.mode = "throw";
  const s = await svc.processQueue();
  assert.equal(s.retried, 1);
  assert.equal(svc.listForMerchant("store-a")[0].failureCode, "PROVIDER_EXCEPTION");
});

test("7. delivery webhook updates status once; duplicates and out-of-order are safe", async () => {
  const { svc, grant, clock } = setup();
  grant("0771234567");
  svc.enqueue(receipt());
  await svc.processQueue();
  const m0 = svc.listForMerchant("store-a")[0];
  const pid = m0.providerMessageId!;
  const upd = { providerMessageId: pid, status: "delivered" as const, at: clock.t + 5000, eventId: "e1" };
  assert.equal(svc.applyStatus(upd).result, "applied");
  assert.equal(svc.applyStatus(upd).result, "duplicate");
  let m = svc.listForMerchant("store-a")[0];
  assert.equal(m.status, "delivered");
  assert.equal(m.merchantId, "store-a");
  assert.equal(m.transactionId, "tx-1");
  svc.applyStatus({ providerMessageId: pid, status: "read", at: clock.t + 9000, eventId: "e2" });
  assert.equal(svc.applyStatus({ providerMessageId: pid, status: "sent", at: clock.t + 1000, eventId: "e3" }).result, "ignored");
  assert.equal(svc.applyStatus({ providerMessageId: pid, status: "failed", at: clock.t + 9500, eventId: "e4" }).result, "ignored");
  m = svc.listForMerchant("store-a")[0];
  assert.equal(m.status, "read");
  assert.equal(svc.applyStatus({ providerMessageId: "nope", status: "sent", at: 1, eventId: "e5" }).result, "unknown_message");
});

test("8. failed message: permanent fails at once, temporary gives up, sale untouched, resend is audited", async () => {
  const perm = setup();
  perm.grant("0771234567");
  perm.svc.enqueue(receipt());
  perm.provider.mode = "permanent_fail";
  let s = await perm.svc.processQueue();
  assert.equal(s.failed, 1);
  perm.clock.t += 86_400_000;
  s = await perm.svc.processQueue();
  assert.equal(s.attempted, 0);
  const failed = perm.svc.listForMerchant("store-a")[0];
  assert.equal(failed.status, "failed");
  assert.equal(failed.failureCode, "SIM_REJECTED");

  perm.provider.mode = "ok";
  const re = perm.svc.resend("store-a", failed.id, "owner@store-a");
  assert.ok(re.ok && re.created);
  const denied = perm.svc.resend("store-b", failed.id, "intruder");
  assert.ok(!denied.ok && denied.reason === "not_found");
  await perm.svc.processQueue();
  const all = perm.svc.listForMerchant("store-a");
  assert.equal(all.length, 2);
  assert.equal(all.filter((m) => m.status === "sent").length, 1);
  assert.equal(all.find((m) => m.status === "failed")?.id, failed.id);
  assert.ok(all.some((m) => m.resendOf === failed.id));

  const temp = setup({ maxAttempts: 3 });
  temp.grant("0771234567");
  temp.svc.enqueue(receipt());
  temp.provider.mode = "temporary_fail";
  for (let i = 0; i < 5; i++) {
    await temp.svc.processQueue();
    temp.clock.t += 86_400_000;
  }
  const t = temp.svc.listForMerchant("store-a")[0];
  assert.equal(t.status, "failed");
  assert.equal(t.attempts, 3);
  assert.ok(t.failureReason?.includes("gave up"));
});

test("9. merchant privacy: store B cannot see store A", async () => {
  const { svc, grant } = setup();
  grant("0771234567");
  svc.enqueue(receipt());
  svc.enqueue(receipt({ merchantId: "store-b", merchantName: "Zed Fashion", transactionId: "tx-b" }));
  const a = svc.listForMerchant("store-a")[0];
  assert.equal(svc.listForMerchant("store-b").length, 1);
  assert.equal(svc.getForMerchant("store-b", a.id), undefined);
  assert.deepEqual(svc.eventsForMerchant("store-b", a.id), []);
});

test("10. customer identity: every phone format is one customer and one consent", async () => {
  const forms = ["0771234567", "+263771234567", "263771234567", "771234567", "00263771234567", "+263 77 123 4567"];
  for (const f of forms) assert.equal(normalizeMsisdn(f), "+263771234567", f);
  assert.equal(normalizeMsisdn("12345"), null);
  assert.equal(normalizeMsisdn("0661234567"), null);
  const { svc, provider, grant } = setup();
  grant("771234567");
  svc.enqueue(receipt({ customerPhone: "0771234567" }));
  svc.enqueue(receipt({ transactionId: "tx-2", merchantId: "store-b", merchantName: "Zed Fashion", customerPhone: "+263771234567" }));
  await svc.processQueue();
  assert.equal(provider.sent.length, 2);
  assert.equal(new Set(svc.listForCustomer("0771234567").map((m) => m.customerPhone)).size, 1);
});

test("extra: invalid phone and invalid events create no message", () => {
  const { svc } = setup();
  const a = svc.enqueue(receipt({ customerPhone: "abc" }));
  assert.ok(!a.ok && a.reason === "invalid_phone");
  const b = svc.enqueue(receipt({ items: [] }));
  assert.ok(!b.ok && b.reason === "invalid_event");
  assert.equal(svc.listForMerchant("store-a").length, 0);
});

test("extra: consent withdrawn after queueing blocks the send", async () => {
  const { svc, provider, consent, clock, grant } = setup();
  grant("0771234567");
  svc.enqueue(receipt());
  consent.withdraw("0771234567", "all", "stop", clock.t);
  const s = await svc.processQueue();
  assert.equal(s.blocked, 1);
  assert.equal(provider.sent.length, 0);
});

test("extra: STOP reply withdraws all consent", async () => {
  const { svc, grant, consent } = setup();
  grant("0771234567");
  grant("0771234567", "marketing");
  const parsed = parseWebhook({
    entry: [{ changes: [{ value: { messages: [{ from: "263771234567", id: "w1", timestamp: "1800000000", type: "text", text: { body: " Stop. " } }] } }] }],
  });
  const r = svc.processWebhook(parsed);
  assert.equal(r.optOuts, 1);
  assert.equal(consent.status("0771234567", "transactional"), "withdrawn");
  assert.equal(consent.status("0771234567", "marketing"), "withdrawn");
});

test("extra: webhook parsing and signature verification", () => {
  const body = JSON.stringify({
    entry: [{ changes: [{ value: { statuses: [{ id: "wamid.1", status: "delivered", timestamp: "1800000000" }, { id: "wamid.2", status: "failed", timestamp: "1800000001", errors: [{ code: 131026, title: "Undeliverable" }] }, { id: "x", status: "deleted" }] } }] }],
  });
  const p = parseWebhook(JSON.parse(body));
  assert.equal(p.statuses.length, 2);
  assert.equal(p.statuses[1].errorCode, "131026");
  const sig = "sha256=" + createHmac("sha256", "secret").update(body, "utf8").digest("hex");
  assert.equal(verifySignature(body, sig, "secret"), true);
  assert.equal(verifySignature(body, sig, "other"), false);
  assert.equal(verifySignature(body + " ", sig, "secret"), false);
  assert.equal(verifySignature(body, null, "secret"), false);
  assert.equal(verifySignature(body, "sha256=zz", "secret"), false);
  assert.equal(verifySignature(body, sig, ""), false);
});

test("extra: template variables are single line and long item lists are shortened", async () => {
  const { svc, grant } = setup();
  grant("0771234567");
  const items = Array.from({ length: 40 }, (_, i) => ({ name: `Product number ${i}\nwith newline`, qty: 2, unitCents: 150 }));
  const r = svc.enqueue(receipt({ items, totalCents: 12000 }));
  assert.ok(r.ok);
  if (r.ok) {
    for (const p of r.message.params) assert.ok(!/[\n\t]/.test(p) && !/ {4,}/.test(p));
    assert.ok(r.message.params[5].length <= 470);
    assert.ok(/\+\d+ more$/.test(r.message.params[5]));
  }
});