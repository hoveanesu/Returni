"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsentLedger = void 0;
const util_1 = require("./util");
// Append-only consent history. No record means no permission.
class ConsentLedger {
    log = [];
    grant(phone, category, source, wording, at) {
        const p = (0, util_1.normalizeMsisdn)(phone);
        if (!p)
            return false;
        this.log.push({ phone: p, category, status: "granted", at, source, wording });
        return true;
    }
    withdraw(phone, category, source, at) {
        const p = (0, util_1.normalizeMsisdn)(phone);
        if (!p)
            return false;
        const cats = category === "all" ? ["transactional", "marketing"] : [category];
        for (const c of cats) {
            this.log.push({ phone: p, category: c, status: "withdrawn", at, source, wording: "opt-out" });
        }
        return true;
    }
    status(phone, category) {
        const p = (0, util_1.normalizeMsisdn)(phone);
        if (!p)
            return "none";
        for (let i = this.log.length - 1; i >= 0; i--) {
            const e = this.log[i];
            if (e.phone === p && e.category === category)
                return e.status;
        }
        return "none";
    }
    canSend(phone, category) {
        return this.status(phone, category) === "granted";
    }
    history(phone) {
        const p = (0, util_1.normalizeMsisdn)(phone);
        return p ? this.log.filter((e) => e.phone === p).map((e) => ({ ...e })) : [];
    }
}
exports.ConsentLedger = ConsentLedger;
