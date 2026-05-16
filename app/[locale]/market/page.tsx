import Link from "next/link";
import type { Metadata } from "next";
import { locales, getDict, type Locale } from "../../../lib/i18n";
import { BrandMark } from "../../../components/BrandMark";

type Params = { locale: string };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDict(locale);
  return {
    title: `${dict.marketPageTitle} — Lodestar`,
    description: dict.marketPageSubtitle,
    alternates: {
      canonical: `/${locale}/market`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}/market`]),
      ),
    },
  };
}

export default async function MarketPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale } = await params;
  const dict = getDict(locale);

  return (
    <main className="shell">
      <nav className="nav">
        <Link href={`/${locale}`} className="brand">
          <span className="brand-mark">
            <BrandMark />
          </span>
          <span className="brand-name">Lodestar</span>
        </Link>
        <div
          className="lang-switch"
          role="navigation"
          aria-label={dict.langLabel}
        >
          {locales.map((l) => (
            <Link
              key={l}
              href={`/${l}/market`}
              className="lang-link"
              aria-current={l === locale ? "page" : undefined}
            >
              {l.toUpperCase()}
            </Link>
          ))}
        </div>
      </nav>

      <header style={{ marginBottom: "clamp(28px, 5vw, 48px)" }}>
        <p style={{ margin: "0 0 14px" }}>
          <Link
            href={`/${locale}#market`}
            className="lang-link"
            style={{ paddingLeft: 0 }}
          >
            {dict.marketBackHome}
          </Link>
        </p>
        <h1
          className="hero-title"
          style={{ fontSize: "clamp(1.9rem, 5vw, 2.8rem)", marginBottom: 14 }}
        >
          {dict.marketPageTitle}
        </h1>
        <p className="section-body" style={{ marginBottom: 0 }}>
          {dict.marketPageSubtitle}
        </p>
      </header>

      <section className="block">
        <div className="anchors">
          {dict.market.anchors.map((a) => (
            <article className="anchor" key={a.label}>
              <div className="anchor-label">{a.label}</div>
              <div className="anchor-value">{a.value}</div>
              <div className="anchor-meta">
                <span>{a.date}</span>
                <a
                  className="anchor-source"
                  href={a.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={a.sourceUrl}
                >
                  {a.sourceHost} ↗
                </a>
              </div>
            </article>
          ))}
        </div>
        <p className="note" style={{ marginTop: 18 }}>
          {dict.market.note}
        </p>
      </section>

      <aside className="concept-disclaimer">{dict.conceptDisclaimer}</aside>

      <footer>{dict.footerNotice}</footer>
    </main>
  );
}
