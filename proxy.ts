import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./lib/i18n";

function pickLocale(req: NextRequest): string {
  const header = req.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const tag = part.split(";")[0].trim().toLowerCase();
    const base = tag.split("-")[0];
    if ((locales as readonly string[]).includes(base)) return base;
  }
  return defaultLocale;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasLocale = (locales as readonly string[]).some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = pickLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
