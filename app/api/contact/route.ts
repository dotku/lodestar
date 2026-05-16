import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const CONTACT_TO = "richard.ma.pgd@gmail.com";
// Resend's default test sender. Works without a verified domain, but only
// delivers to the account-owner's verified address. Once a custom domain
// is verified at https://resend.com/domains, switch this to e.g.
// "Lodestar <noreply@lodestar.demo.sarl>".
const CONTACT_FROM = "Lodestar Contact <onboarding@resend.dev>";

type Body = {
  name?: unknown;
  email?: unknown;
  affiliation?: unknown;
  message?: unknown;
  honeypot?: unknown;
};

function str(x: unknown, max = 5000): string {
  if (typeof x !== "string") return "";
  return x.trim().slice(0, max);
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY ?? process.env.RESENDER_API_KEY;
  if (!apiKey) {
    return Response.json(
      { ok: false, error: "Email service not configured." },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields, humans don't.
  if (typeof body.honeypot === "string" && body.honeypot.length > 0) {
    return Response.json({ ok: true });
  }

  const name = str(body.name, 200);
  const email = str(body.email, 200);
  const affiliation = str(body.affiliation, 200);
  const message = str(body.message, 4000);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json(
      { ok: false, error: "Valid email required." },
      { status: 400 },
    );
  }
  if (message.length < 4) {
    return Response.json(
      { ok: false, error: "Message too short." },
      { status: 400 },
    );
  }

  const resend = new Resend(apiKey);
  const subject = `Lodestar contact${name ? ` — ${name}` : ""}${affiliation ? ` (${affiliation})` : ""}`;
  const lines = [
    name && `Name: ${name}`,
    `Email: ${email}`,
    affiliation && `Affiliation: ${affiliation}`,
    "",
    message,
  ].filter(Boolean);

  try {
    const result = await resend.emails.send({
      from: CONTACT_FROM,
      to: CONTACT_TO,
      replyTo: email,
      subject,
      text: lines.join("\n"),
    });
    if ("error" in result && result.error) {
      console.error("[contact] resend error:", result.error);
      return Response.json(
        { ok: false, error: "Send failed." },
        { status: 502 },
      );
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[contact] send threw:", err);
    return Response.json({ ok: false, error: "Send failed." }, { status: 502 });
  }
}
