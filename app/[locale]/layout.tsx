import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { locales, getDict, type Locale } from "../../lib/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Params = { locale: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDict(locale);
  return {
    title: dict.metaTitle,
    description: dict.metaDescription,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      title: dict.metaTitle,
      description: dict.metaDescription,
      siteName: "Lodestar",
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<Params>;
}) {
  const { locale } = await params;
  if (!(locales as readonly string[]).includes(locale)) notFound();
  return <div lang={locale as Locale}>{children}</div>;
}
