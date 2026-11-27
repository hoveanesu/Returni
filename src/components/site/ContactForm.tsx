"use client";

import { useEffect, useState } from "react";
import { CONTACT, ENQUIRY_CATEGORIES } from "@/lib/site";

type Status = "idle" | "sending" | "sent" | "unavailable" | "error";

const field =
  "mt-1 w-full rounded-xl border border-sage/70 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20";

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "general",
    message: "",
    website: "", // spam trap: real people leave this empty
  });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // /contact?topic=merchant preselects the category
  useEffect(() => {
    const topic = new URLSearchParams(window.location.search).get("topic");
    if (topic && ENQUIRY_CATEGORIES.some((c) => c.value === topic)) {
      setForm((f) => ({ ...f, category: topic }));
    }
  }, []);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        code?: string;
        error?: string;
      };
      if (res.ok && j.ok) {
        setStatus("sent");
        return;
      }
      if (j.code === "not_configured") {
        setStatus("unavailable");
        return;
      }
      setError(j.error ?? "Something went wrong. Please try again, or contact us directly.");
      setStatus("error");
    } catch {
      setError("We could not reach the server. Please try again, or contact us directly.");
      setStatus("error");
    }
  }

  const categoryLabel =
    ENQUIRY_CATEGORIES.find((c) => c.value === form.category)?.label ?? "Enquiry";
  const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
    `RETURNi enquiry: ${categoryLabel}`
  )}&body=${encodeURIComponent(
    `${form.message}\n\nName: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}`
  )}`;

  if (status === "sent") {
    return (
      <div role="status" className="rounded-2xl border border-green-200 bg-green-50 p-6">
        <h3 className="font-semibold text-green-800">Thank you</h3>
        <p className="mt-1 text-sm text-green-800">
          Your enquiry has been sent. We will get back to you.
        </p>
        <button
          className="mt-4 text-sm font-semibold text-brand-green underline"
          onClick={() => {
            setForm({ name: "", email: "", phone: "", category: "general", message: "", website: "" });
            setStatus("idle");
          }}
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-sage/60 bg-white p-6">
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>
          Leave this field empty
          <input
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={set("website")}
          />
        </label>
      </div>

      <label className="block text-sm font-medium">
        Full name
        <input
          className={field}
          required
          minLength={2}
          maxLength={100}
          autoComplete="name"
          value={form.name}
          onChange={set("name")}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Email address
          <input
            className={field}
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
          />
        </label>
        <label className="block text-sm font-medium">
          Phone number (optional)
          <input
            className={field}
            type="tel"
            maxLength={30}
            autoComplete="tel"
            value={form.phone}
            onChange={set("phone")}
          />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Enquiry category
        <select className={field} value={form.category} onChange={set("category")}>
          {ENQUIRY_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Message
        <textarea
          className={field}
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          value={form.message}
          onChange={set("message")}
        />
      </label>

      {status === "error" && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {status === "unavailable" && (
        <div role="alert" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Your message has not been sent.</p>
          <p className="mt-1">
            Online sending is not switched on yet. Please send it by email instead.
          </p>
          <a
            href={mailto}
            className="mt-3 inline-block rounded-xl bg-brand-green px-4 py-2 font-semibold text-white"
          >
            Email us this message
          </a>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-xl bg-brand-green px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send enquiry"}
      </button>
      <p className="text-xs text-muted">
        We use your details only to reply to your enquiry. See our{" "}
        <a className="underline" href="/privacy">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}