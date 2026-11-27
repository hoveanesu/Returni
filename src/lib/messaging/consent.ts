import type { ConsentCategory, ConsentEntry } from "./types";
import { normalizeMsisdn } from "./util";

// Append-only consent history. No record means no permission.
export class ConsentLedger {
  private log: ConsentEntry[] = [];

  grant(phone: string, category: ConsentCategory, source: string, wording: string, at: number): boolean {
    const p = normalizeMsisdn(phone);
    if (!p) return false;
    this.log.push({ phone: p, category, status: "granted", at, source, wording });
    return true;
  }

  withdraw(phone: string, category: ConsentCategory | "all", source: string, at: number): boolean {
    const p = normalizeMsisdn(phone);
    if (!p) return false;
    const cats: ConsentCategory[] = category === "all" ? ["transactional", "marketing"] : [category];
    for (const c of cats) {
      this.log.push({ phone: p, category: c, status: "withdrawn", at, source, wording: "opt-out" });
    }
    return true;
  }

  status(phone: string, category: ConsentCategory): "granted" | "withdrawn" | "none" {
    const p = normalizeMsisdn(phone);
    if (!p) return "none";
    for (let i = this.log.length - 1; i >= 0; i--) {
      const e = this.log[i];
      if (e.phone === p && e.category === category) return e.status;
    }
    return "none";
  }

  canSend(phone: string, category: ConsentCategory): boolean {
    return this.status(phone, category) === "granted";
  }

  history(phone: string): ConsentEntry[] {
    const p = normalizeMsisdn(phone);
    return p ? this.log.filter((e) => e.phone === p).map((e) => ({ ...e })) : [];
  }
}