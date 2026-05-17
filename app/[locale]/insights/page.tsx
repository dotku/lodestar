import Link from "next/link";
import { locales, getDict, displayLocale, type Locale } from "../../../lib/i18n";
import { BrandMark } from "../../../components/BrandMark";
import { INSIGHTS } from "../../../lib/insights";

type Params = { locale: string };

export const metadata = {
  title: "Engineering Insights — Lodestar",
  description:
    "Short technical briefs on edge compute, signal processing, and real-time systems relevant to contested-environment sustainment.",
};

const CATEGORY_LABEL: Record<string, string> = {
  ISR: "ISR",
  SDR: "Software-Defined Radio",
  "Sensor Fusion": "Sensor Fusion",
  "Real-time": "Real-Time Systems",
  "Edge AI": "Edge Inference",
};

export default async function InsightsIndex({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale } = await params;
  const dict = getDict(locale);

  return (
    <main className="shell">
      <nav className="nav">
        <Link href={`/${locale}`} className="brand" style={{ textDecoration: "none", color: "inherit" }}>
          <span className="brand-mark">
            <BrandMark />
          </span>
          <span className="brand-name">Lodestar</span>
          <span className="brand-tag">{dict.navTagline}</span>
        </Link>
        {(() => {
          const next = locales.find((l) => l !== locale) ?? locales[0];
          return (
            <Link
              href={`/${next}/insights`}
              className="lang-toggle"
              aria-label={`${dict.langLabel}: ${displayLocale(next as Locale)}`}
            >
              {displayLocale(next as Locale)}
            </Link>
          );
        })()}
      </nav>

      <header className="hero" style={{ paddingBottom: 24 }}>
        <span className="hero-badge">Engineering Insights</span>
        <h1 className="hero-title" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
          Capability briefs from the edge of the sustainment problem.
        </h1>
        <p className="hero-subtitle" style={{ marginTop: 16 }}>
          Short technical pieces on edge compute, signal processing, low-
          latency video, and real-time systems — the engineering substrate
          a contested-environment sustainment platform actually runs on.
          Written for engineering audiences inside primes, SBIR teams, and
          DoD labs.
        </p>
      </header>

      <section className="block">
        <ul className="insights-list">
          {INSIGHTS.map((post) => (
            <li key={post.slug} className="insight-row">
              <Link
                href={`/${locale}/insights/${post.slug}`}
                className="insight-link"
              >
                <div className="insight-meta">
                  <span className="insight-category">
                    {CATEGORY_LABEL[post.category] ?? post.category}
                  </span>
                  <span className="insight-reading">{post.readingTime}</span>
                </div>
                <h2 className="insight-title">{post.title}</h2>
                <p className="insight-summary">{post.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="footer">
        <Link href={`/${locale}`} className="btn">
          ← Back to Lodestar
        </Link>
      </footer>

      <style>{`
        .insights-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 18px; }
        .insight-row { border: 1px solid var(--border, #e5e5e7); border-radius: 12px; transition: border-color 0.15s; }
        .insight-row:hover { border-color: var(--accent, #888); }
        .insight-link { display: block; padding: 22px 24px; color: inherit; text-decoration: none; }
        .insight-meta { display: flex; gap: 12px; align-items: center; font-size: 12px; color: var(--muted, #666); margin-bottom: 8px; }
        .insight-category { font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .insight-reading { opacity: 0.7; }
        .insight-title { font-size: 1.25rem; margin: 6px 0 8px; line-height: 1.35; }
        .insight-summary { color: var(--muted, #666); line-height: 1.5; margin: 0; font-size: 0.95rem; }
      `}</style>
    </main>
  );
}
