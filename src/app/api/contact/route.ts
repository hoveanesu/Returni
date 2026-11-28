import { NextResponse } from "next/server";

type Body = Record<string, unknown>;

const text = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const email = text(body.email, 200);
  const message = text(body.message, 5000);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  }
  if (message.length < 5) {
    return NextResponse.json({ ok: false, error: "Please write a short message." }, { status: 400 });
  }

  // TODO: deliver this enquiry (email service or database). Until then it is NOT stored.
  if (process.env.NODE_ENV !== "production") {
    console.info("[contact] enquiry received (development only)", {
      category: text(body.category, 80),
      name: text(body.name, 120),
      email,
      message,
    });
  }

  return NextResponse.json({ ok: true });
}