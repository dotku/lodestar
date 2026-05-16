import Link from "next/link";
import { locales, getDict, type Locale } from "../../lib/i18n";
import { LodestarDemo } from "../../components/LodestarDemo";

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

export default async function HomePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale } = await params;
  const dict = getDict(locale);
  const demoEnabled = Boolean(process.env.AI_GATEWAY_API_KEY);

  return (
    <main className="shell">
      <nav className="nav">
        <div className="brand">
          <span className="brand-mark">L</span>
          <span className="brand-name">Lodestar</span>
          <span className="brand-tag">{dict.navTagline}</span>
        </div>
        <div className="lang-switch" role="navigation" aria-label={dict.langLabel}>
          {locales.map((l) => (
            <Link
              key={l}
              href={`/${l}`}
              className="lang-link"
              aria-current={l === locale ? "page" : undefined}
            >
              {l.toUpperCase()}
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
          <a className="btn btn-primary" href="#demo">{dict.ctaPrimary}</a>
          <a className="btn" href="#problem">{dict.ctaSecondary}</a>
        </div>
      </header>

      <section className="block" id="problem">
        <div className="section-label">{dict.sectionLabels.problem}</div>
        <h2 className="section-title">{dict.problem.title}</h2>
        <p className="section-body">{dict.problem.body}</p>
        <ul className="bullets">
          {dict.problem.bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      </section>

      <section className="block" id="market">
        <div className="section-label">{dict.sectionLabels.market}</div>
        <h2 className="section-title">{dict.market.title}</h2>
        <p className="section-body">{dict.market.body}</p>
        <div className="anchors">
          {dict.market.anchors.map((a) => (
            <div className="anchor" key={a.label}>
              <div className="anchor-label">{a.label}</div>
              <div className="anchor-value">{a.value}</div>
              <div className="anchor-meta">
                <span>{a.date}</span>
                <span>{a.sourceHost}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="note">{dict.market.note}</div>
      </section>

      <section className="block" id="approach">
        <div className="section-label">{dict.sectionLabels.approach}</div>
        <h2 className="section-title">{dict.approach.title}</h2>
        <p className="section-body">{dict.approach.body}</p>
        <div className="pillars">
          {dict.approach.pillars.map((p) => (
            <article className="pillar" key={p.name}>
              <h3 className="pillar-name">{p.name}</h3>
              <p className="pillar-body">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="block" id="why-now">
        <div className="section-label">{dict.sectionLabels.whyNow}</div>
        <h2 className="section-title">{dict.whyNow.title}</h2>
        <ul className="bullets">
          {dict.whyNow.bullets.map((b, i) => <li key={i}>{renderBullet(b)}</li>)}
        </ul>
      </section>

      <section className="block" id="competition">
        <div className="section-label">{dict.sectionLabels.competition}</div>
        <h2 className="section-title">{dict.competition.title}</h2>
        <p className="section-body">{dict.competition.body}</p>
        <div className="comp-wrap">
          <table className="comp-table">
            <thead>
              <tr>
                {dict.competition.columns.map((c, i) => <th key={i}>{c}</th>)}
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
        <div className="section-label">{dict.sectionLabels.compliance}</div>
        <h2 className="section-title">{dict.compliance.title}</h2>
        <p className="section-body">{dict.compliance.body}</p>
        <div className="compliance">
          {dict.compliance.rows.map((r) => (
            <div className="compliance-row" key={r.name}>
              <div className="compliance-name">{r.name}</div>
              <div className="compliance-status">{r.status}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="block" id="demo">
        <div className="section-label">Demo</div>
        <div className="demo">
          <div className="demo-head">
            <h2 className="section-title" style={{ marginBottom: 8 }}>{dict.demoTitle}</h2>
            <p className="section-body" style={{ marginBottom: 0 }}>{dict.demoSubtitle}</p>
          </div>
          {demoEnabled ? (
            <LodestarDemo
              locale={locale as Locale}
              scenarios={dict.demoScenarios}
              placeholder={dict.demoPlaceholder}
              buttonLabel={dict.demoButton}
              clearLabel={dict.demoClear}
              errorMessage={dict.demoError}
              disclaimer={dict.demoDisclaimer}
            />
          ) : (
            <div className="demo-unavailable">{dict.demoUnavailable}</div>
          )}
        </div>
      </section>

      <section className="block" id="stage">
        <div className="section-label">{dict.sectionLabels.stage}</div>
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

      <footer>{dict.footerNotice}</footer>
    </main>
  );
}
