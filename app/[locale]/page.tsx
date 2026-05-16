import Link from "next/link";
import { locales, getDict, displayLocale, type Locale } from "../../lib/i18n";
import { videos } from "../../lib/videos";
import { LodestarDemo } from "../../components/LodestarDemo";
import { BrandMark } from "../../components/BrandMark";

type Params = { locale: string };

function renderBullet(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i}>{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

function SectionHead({
  num,
  label,
}: {
  num: string;
  label: string;
}) {
  return (
    <div className="section-head">
      <span className="section-num">{num}</span>
      <span className="section-marker" aria-hidden />
      <span className="section-label">{label}</span>
    </div>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale } = await params;
  const dict = getDict(locale);
  const demoEnabled = Boolean(process.env.AI_GATEWAY_API_KEY);
  const refCode = `LDS-CONCEPT-2026.05`;

  return (
    <main className="shell">
      <nav className="nav">
        <div className="brand">
          <span className="brand-mark">
            <BrandMark />
          </span>
          <span className="brand-name">Lodestar</span>
          <span className="brand-tag">{dict.navTagline}</span>
        </div>
        <div
          className="lang-switch"
          role="navigation"
          aria-label={dict.langLabel}
        >
          {locales.map((l) => (
            <Link
              key={l}
              href={`/${l}`}
              className="lang-link"
              aria-current={l === locale ? "page" : undefined}
            >
              {displayLocale(l)}
            </Link>
          ))}
        </div>
      </nav>

      <header className="hero">
        <span className="hero-badge">{dict.heroBadge}</span>
        <h1 className="hero-title">{dict.heroTitle}</h1>
        <p className="hero-subtitle">{dict.heroSubtitle}</p>
        <div className="hero-pills">
          {dict.heroPills.map((p) => (
            <div className="pill" key={p.label}>
              <span className="pill-label">{p.label}</span>
              <span className="pill-value">{p.value}</span>
            </div>
          ))}
        </div>
        <div className="cta-row">
          <a className="btn btn-primary" href="#demo">{dict.ctaPrimary} →</a>
          <a className="btn" href="#problem">{dict.ctaSecondary}</a>
        </div>
        <figure className="hero-video">
          <video
            src={videos.hero.src}
            poster={videos.hero.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
        </figure>
      </header>

      <section className="block" id="problem">
        <SectionHead num="01 /" label={dict.sectionLabels.problem} />
        <h2 className="section-title">{dict.problem.title}</h2>
        <p className="section-body">{dict.problem.body}</p>
        <ul className="bullets">
          {dict.problem.bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      </section>

      <section className="block" id="market">
        <SectionHead num="02 /" label={dict.sectionLabels.market} />
        <h2 className="section-title">{dict.market.title}</h2>
        <p className="section-body">{dict.market.body}</p>
        <div className="note">{dict.market.note}</div>
        <p style={{ marginTop: 18 }}>
          <Link href={`/${locale}/market`} className="btn">
            {dict.marketSeeAll}
          </Link>
        </p>
      </section>

      <section className="block" id="approach">
        <SectionHead num="03 /" label={dict.sectionLabels.approach} />
        <h2 className="section-title">{dict.approach.title}</h2>
        <p className="section-body">{dict.approach.body}</p>
        <figure className="section-video">
          <video
            src={videos.approach.src}
            poster={videos.approach.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
        </figure>
        <div className="pillars">
          {dict.approach.pillars.map((p, i) => (
            <article className="pillar" key={p.name}>
              <div className="pillar-num">
                P-{String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="pillar-name">{p.name}</h3>
              <p className="pillar-body">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="block" id="why-now">
        <SectionHead num="04 /" label={dict.sectionLabels.whyNow} />
        <h2 className="section-title">{dict.whyNow.title}</h2>
        <ul className="bullets">
          {dict.whyNow.bullets.map((b, i) => (
            <li key={i}>{renderBullet(b)}</li>
          ))}
        </ul>
      </section>

      <section className="block" id="competition">
        <SectionHead num="05 /" label={dict.sectionLabels.competition} />
        <h2 className="section-title">{dict.competition.title}</h2>
        <p className="section-body">{dict.competition.body}</p>
        <div className="comp-wrap">
          <table className="comp-table">
            <thead>
              <tr>
                {dict.competition.columns.map((c, i) => (
                  <th key={i}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dict.competition.rows.map((r) => (
                <tr key={r.name}>
                  <td>{r.name}</td>
                  <td>{r.bucket}</td>
                  <td>{r.angle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="block" id="compliance">
        <SectionHead num="06 /" label={dict.sectionLabels.compliance} />
        <h2 className="section-title">{dict.compliance.title}</h2>
        <p className="section-body">{dict.compliance.body}</p>
        <div className="compliance">
          {dict.compliance.rows.map((r) => (
            <div className="compliance-row" key={r.name}>
              <span className="compliance-dot" aria-hidden />
              <div className="compliance-name">{r.name}</div>
              <div className="compliance-status">{r.status}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="block" id="demo">
        <SectionHead num="07 /" label="DEMO · INTERACTIVE" />
        <h2 className="section-title">{dict.demoTitle}</h2>
        <p className="section-body">{dict.demoSubtitle}</p>
        <figure className="section-video">
          <video
            src={videos.demoIntro.src}
            poster={videos.demoIntro.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
        </figure>
        <div className="demo">
          <div className="demo-head-label">LIVE · {refCode}</div>
          {demoEnabled ? (
            <div className="demo-body">
              <LodestarDemo
                locale={locale as Locale}
                scenarios={dict.demoScenarios}
                placeholder={dict.demoPlaceholder}
                buttonLabel={dict.demoButton}
                clearLabel={dict.demoClear}
                errorMessage={dict.demoError}
                disclaimer={dict.demoDisclaimer}
              />
            </div>
          ) : (
            <div className="demo-unavailable">{dict.demoUnavailable}</div>
          )}
        </div>
      </section>

      <section className="block" id="stage">
        <SectionHead num="08 /" label={dict.sectionLabels.stage} />
        <h2 className="section-title">{dict.stage.title}</h2>
        <p className="section-body">{dict.stage.body}</p>
        <ul className="bullets">
          {dict.stage.bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      </section>

      <section className="contact" id="contact">
        <h2>{dict.contactTitle}</h2>
        <p>{dict.contactBody}</p>
        <p>
          <strong>{dict.contactEmailLabel}: </strong>
          <a href="mailto:hello@lodestar.demo.sarl">hello@lodestar.demo.sarl</a>
        </p>
      </section>

      <div className="concept-disclaimer">{dict.conceptDisclaimer}</div>

      <footer>
        <div className="footer-line">
          <span>{dict.footerNotice}</span>
          <span className="footer-ref">REF · {refCode}</span>
        </div>
      </footer>
    </main>
  );
}
