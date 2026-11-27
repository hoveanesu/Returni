import type { ProviderResult, ProviderSend, WhatsAppProvider } from "./types";

export type DevMode = "ok" | "temporary_fail" | "permanent_fail" | "throw";

// SIMULATED provider for development and tests. It never contacts WhatsApp.
export class DevProvider implements WhatsAppProvider {
  readonly name = "dev-simulated";
  readonly simulated = true;
  mode: DevMode = "ok";
  readonly sent: ProviderSend[] = [];
  private counter = 0;

  async send(input: ProviderSend): Promise<ProviderResult> {
    if (this.mode === "throw") throw new Error("Simulated network failure");
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

export type CloudConfig = {
  accessToken: string;
  phoneNumberId: string;
  apiVersion: string; // copy the current version from the sample request in Meta's dashboard
  sendMode?: "template" | "text"; // "text" only works within 24 hours of the customer messaging you
  fetchFn?: typeof fetch;
  timeoutMs?: number;
};

// WhatsApp Business Cloud API adapter. NOT yet tested against the live API.
export class CloudApiProvider implements WhatsAppProvider {
  readonly name: string;
  readonly simulated = false;
  private cfg: CloudConfig;

  constructor(cfg: CloudConfig) {
    this.cfg = cfg;
    this.name = cfg.sendMode === "text" ? "whatsapp-cloud-api (text)" : "whatsapp-cloud-api (template)";
  }

  private payload(input: ProviderSend) {
    const to = input.to.replace(/^\+/, "");
    if (this.cfg.sendMode === "text") {
      return {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { preview_url: false, body: input.bodyPreview },
      };
    }
    return {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: input.templateId,
        language: { code: input.language },
        components: [
          { type: "body", parameters: input.params.map((text) => ({ type: "text", text })) },
        ],
      },
    };
  }

  async send(input: ProviderSend): Promise<ProviderResult> {
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
        body: JSON.stringify(this.payload(input)),
        signal: controller.signal,
      });
      const json = (await res.json().catch(() => ({}))) as {
        messages?: { id?: string }[];
        error?: { code?: number; message?: string };
      };
      const id = json.messages?.[0]?.id;
      if (res.ok && id) return { ok: true, providerMessageId: id, simulated: false };
      const code = String(json.error?.code ?? res.status);
      const reason = json.error?.message ?? `HTTP ${res.status}`;
      const temporary = res.status === 429 || res.status >= 500;
      return { ok: false, kind: temporary ? "temporary" : "permanent", code, reason };
    } catch (e) {
      const reason = e instanceof Error ? e.message : "Network error";
      return { ok: false, kind: "temporary", code: "NETWORK", reason };
    } finally {
      clearTimeout(timer);
    }
  }
}