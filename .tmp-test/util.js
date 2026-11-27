"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usd = exports.maskPhone = void 0;
exports.normalizeMsisdn = normalizeMsisdn;
exports.sanitizeVar = sanitizeVar;
exports.newId = newId;
// Normalises a phone number to E.164 (+263771234567). Returns null if invalid.
// Zimbabwe local formats (0771234567, 771234567, 263771234567) are accepted.
function normalizeMsisdn(input) {
    const raw = (input ?? "").trim();
    let d = raw.replace(/\D/g, "");
    if (!d)
        return null;
    if (!raw.startsWith("+")) {
        if (d.startsWith("00"))
            d = d.slice(2);
        else if (d.startsWith("0"))
            d = `263${d.slice(1)}`;
        else if (d.length === 9 && d.startsWith("7"))
            d = `263${d}`;
    }
    if (d.startsWith("263")) {
        return /^2637\d{8}$/.test(d) ? `+${d}` : null;
    }
    return /^[1-9]\d{7,14}$/.test(d) ? `+${d}` : null;
}
const maskPhone = (p) => `${p.slice(0, 7)}***${p.slice(-3)}`;
exports.maskPhone = maskPhone;
const usd = (cents) => `$${(cents / 100).toFixed(2)}`;
exports.usd = usd;
// WhatsApp template variables cannot contain new lines, tabs or runs of spaces.
function sanitizeVar(value, max = 200) {
    const flat = String(value).replace(/\s+/g, " ").trim();
    return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}
function newId(prefix) {
    return `${prefix}_${globalThis.crypto.randomUUID()}`;
}
