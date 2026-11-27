"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEMPLATE_BODIES = void 0;
exports.renderReceipt = renderReceipt;
exports.renderPromotion = renderPromotion;
exports.render = render;
const util_1 = require("./util");
// These bodies mirror what must be submitted to Meta for approval.
// {{1}}, {{2}}... are the template variables.
const RECEIPT_BODY = [
    "RETURNi | Smart Receipt",
    "",
    "Hello {{1}},",
    "Thank you for shopping with us.",
    "",
    "Merchant: {{2}}",
    "Branch: {{3}}",
    "Receipt: {{4}}",
    "Date: {{5}}",
    "",
    "Items purchased: {{6}}",
    "",
    "Total: {{7}}",
    "BackPay earned: {{8}}",
    "Gold Drop: {{9}}",
    "",
    "Your RETURNi rewards activity is available through RETURNi.",
    "Every Purchase Deserves More.",
].join("\n");
const PROMOTION_BODY = [
    "RETURNi | {{2}}",
    "",
    "Hello {{1}},",
    "{{3}}",
    "Valid until {{4}}.",
    "",
    "Reply STOP to opt out of offers.",
    "Every Purchase Deserves More.",
].join("\n");
exports.TEMPLATE_BODIES = {
    receipt_v1: RECEIPT_BODY,
    promotion_v1: PROMOTION_BODY,
};
const fill = (body, params) => body.replace(/\{\{(\d+)\}\}/g, (_, n) => params[Number(n) - 1] ?? "");
function itemsText(e) {
    const parts = e.items.map((i) => {
        const qty = i.qty > 1 ? `${i.qty} x ` : "";
        return `${qty}${(0, util_1.sanitizeVar)(i.name, 40)} ${(0, util_1.usd)(i.qty * i.unitCents)}`;
    });
    let out = "";
    for (let i = 0; i < parts.length; i++) {
        const next = out ? `${out}; ${parts[i]}` : parts[i];
        if (next.length > 450) {
            return `${out}; +${parts.length - i} more`;
        }
        out = next;
    }
    return out;
}
function goldText(g) {
    if (g === "active")
        return "1 entry confirmed";
    if (g === "pending")
        return "1 entry waiting, create your RETURNi account to activate it";
    return "No entry for this purchase";
}
function renderReceipt(e) {
    const params = [
        (0, util_1.sanitizeVar)(e.customerName?.trim() || "there", 40),
        (0, util_1.sanitizeVar)(e.merchantName, 60),
        (0, util_1.sanitizeVar)(e.branch?.trim() || "Main branch", 60),
        (0, util_1.sanitizeVar)(e.receiptNo, 30),
        (0, util_1.sanitizeVar)(e.dateText, 40),
        itemsText(e),
        (0, util_1.usd)(e.totalCents),
        (0, util_1.usd)(e.backpayEarnedCents),
        goldText(e.goldDrop),
    ];
    return {
        templateId: "receipt_v1",
        language: "en",
        category: "receipt",
        consent: "transactional",
        params,
        body: fill(RECEIPT_BODY, params),
    };
}
function renderPromotion(e) {
    const params = [
        (0, util_1.sanitizeVar)(e.customerName?.trim() || "there", 40),
        (0, util_1.sanitizeVar)(e.merchantName, 60),
        (0, util_1.sanitizeVar)(e.headline, 200),
        (0, util_1.sanitizeVar)(e.endsText, 40),
    ];
    return {
        templateId: "promotion_v1",
        language: "en",
        category: "promotion",
        consent: "marketing", // marketing is never treated as transactional
        params,
        body: fill(PROMOTION_BODY, params),
    };
}
function render(e) {
    return e.kind === "receipt" ? renderReceipt(e) : renderPromotion(e);
}
