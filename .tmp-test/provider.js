"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudApiProvider = exports.DevProvider = void 0;
// SIMULATED provider for development and tests. It never contacts WhatsApp.
class DevProvider {
    name = "dev-simulated";
    simulated = true;
    mode = "ok";
    sent = [];
    counter = 0;
    async send(input) {
        if (this.mode === "throw")
            throw new Error("Simulated network failure");
        if (this.mode === "temporary_fail") {
            return { ok: false, kind: "temporary", code: "SIM_UNAVAILABLE", reason: "Simulated: provider temporarily unavailable" };
        }
        if (this.mode === "permanent_fail") {
            return { ok: false, kind: "permanent", code: "SIM_REJECTED", reason: "Simulated: message rejected" };
        }
        this.sent.push(input);
        this.counter += 1;
        return { ok: true, providerMessageId: `dev.${String(this.counter).padStart(6, "0")}`, simulated: true };
    }
}
exports.DevProvider = DevProvider;
// WhatsApp Business Cloud API adapter. NOT yet tested against the live API:
// it needs a verified Meta business, a registered sender number and approved templates.
class CloudApiProvider {
    name = "whatsapp-cloud-api";
    simulated = false;
    cfg;
    constructor(cfg) {
        this.cfg = cfg;
    }
    async send(input) {
        const doFetch = this.cfg.fetchFn ?? fetch;
        const url = `https://graph.facebook.com/${this.cfg.apiVersion}/${this.cfg.phoneNumberId}/messages`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.cfg.timeoutMs ?? 10_000);
        try {
            const res = await doFetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.cfg.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: input.to.replace(/^\+/, ""),
                    type: "template",
                    template: {
                        name: input.templateId,
                        language: { code: input.language },
                        components: [
                            { type: "body", parameters: input.params.map((text) => ({ type: "text", text })) },
                        ],
                    },
                }),
                signal: controller.signal,
            });
            const json = (await res.json().catch(() => ({})));
            const id = json.messages?.[0]?.id;
            if (res.ok && id)
                return { ok: true, providerMessageId: id, simulated: false };
            const code = String(json.error?.code ?? res.status);
            const reason = json.error?.message ?? `HTTP ${res.status}`;
            const temporary = res.status === 429 || res.status >= 500;
            return { ok: false, kind: temporary ? "temporary" : "permanent", code, reason };
        }
        catch (e) {
            const reason = e instanceof Error ? e.message : "Network error";
            return { ok: false, kind: "temporary", code: "NETWORK", reason };
        }
        finally {
            clearTimeout(timer);
        }
    }
}
exports.CloudApiProvider = CloudApiProvider;
