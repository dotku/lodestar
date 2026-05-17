import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, getDict, displayLocale, type Locale } from "../../../../lib/i18n";
import { BrandMark } from "../../../../components/BrandMark";
import { INSIGHTS, getInsightBySlug } from "../../../../lib/insights";

type Params = { locale: string; slug: string };

export async function generateStaticParams() {
  // Pre-render every insight at build for each locale — total is small
  // (~5 posts × 2 locales) so there's no reason not to be fully static.
  const out: Params[] = [];
  for (const l of locales) {
    for (const p of INSIGHTS) out.push({ locale: l, slug: p.slug });
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getInsightBySlug(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} — Lodestar`,
    description: post.summary,
  };
}

/**
 * Minimal markdown renderer for our self-contained insight bodies.
 * We avoid a full MDX/remark dependency because the post content is
 * authored by us and uses a deliberately narrow markdown subset:
 *   - ## headings
 *   - paragraphs separated by blank lines
 *   - **bold** inline
 *   - bulleted lists (- ...)
 *   - ordered lists (1. ...)
 *   - ``` fenced code blocks (rendered as a <pre>)
 *   - simple GitHub-flavored tables (| col | col |)
 */
function renderMarkdown(md: string): React.ReactNode {
  const blocks: React.ReactNode[] = [];
  const lines = md.trim().split("\n");
  let i = 0;
  let inFence = false;
  let fenceBuffer: string[] = [];

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (inFence) {
        blocks.push(
          <pre key={blocks.length} className="insight-code">
            <code>{fenceBuffer.join("\n")}</code>
          </pre>,
        );
        fenceBuffer = [];
        inFence = false;
      } else {
        inFence = true;
      }
      i++;
      continue;
    }
    if (inFence) {
      fenceBuffer.push(line);
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={blocks.length} className="insight-h2">
          {line.slice(3)}
        </h2>,
      );
      i++;
      continue;
    }

    // GFM table — header row then separator row, then body rows.
    if (line.includes("|") && i + 1 < lines.length && /^\s*\|?[\s|:-]+\|?\s*$/.test(lines[i + 1])) {
      const headerCells = line
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(
          lines[i]
            .split("|")
            .map((s) => s.trim())
            .filter(Boolean),
        );
        i++;
      }
      blocks.push(
        <div key={blocks.length} className="insight-table-wrap">
          <table className="insight-table">
            <thead>
              <tr>
                {headerCells.map((c, j) => (
                  <th key={j}>{renderInline(c)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, j) => (
                    <td key={j}>{renderInline(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Bulleted list
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={blocks.length} className="insight-ul">
          {items.map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={blocks.length} className="insight-ol">
          {items.map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph — consume until blank line or block start
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("## ") &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !lines[i].trim().startsWith("```")
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={blocks.length} className="insight-p">
        {renderInline(para.join(" "))}
      </p>,
    );
  }

  return blocks;
}

function renderInline(text: string): React.ReactNode {
  // Bold + inline code. Order: code first (so we don't try to bold inside
  // a code segment), then bold.
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const codeM = remaining.match(/`([^`]+)`/);
    const boldM = remaining.match(/\*\*([^*]+)\*\*/);

    const earliest = [
      { m: codeM, type: "code" as const },
      { m: boldM, type: "bold" as const },
    ]
      .filter((x) => x.m)
      .sort((a, b) => (a.m!.index ?? 0) - (b.m!.index ?? 0))[0];

    if (!earliest) {
      parts.push(remaining);
      break;
    }
    const m = earliest.m!;
    const idx = m.index ?? 0;
    if (idx > 0) parts.push(remaining.slice(0, idx));
    if (earliest.type === "code") {
      parts.push(
        <code key={key++} className="insight-code-inline">
          {m[1]}
        </code>,
      );
    } else {
      parts.push(<strong key={key++}>{m[1]}</strong>);
    }
    remaining = remaining.slice(idx + m[0].length);
  }
  return parts;
}

const CATEGORY_LABEL: Record<string, string> = {
  ISR: "ISR",
  SDR: "Software-Defined Radio",
  "Sensor Fusion": "Sensor Fusion",
  "Real-time": "Real-Time Systems",
  "Edge AI": "Edge Inference",
};

export default async function InsightPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  const post = getInsightBySlug(slug);
  if (!post) notFound();
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
              href={`/${next}/insights/${post.slug}`}
              className="lang-toggle"
              aria-label={`${dict.langLabel}: ${displayLocale(next as Locale)}`}
            >
              {displayLocale(next as Locale)}
            </Link>
          );
        })()}
      </nav>

      <article className="insight-article">
        <Link href={`/${locale}/insights`} className="insight-back">
          ← All insights
        </Link>
        <header className="insight-header">
          <div className="insight-meta">
            <span className="insight-category">
              {CATEGORY_LABEL[post.category] ?? post.category}
            </span>
            <span className="insight-reading">{post.readingTime}</span>
          </div>
          <h1 className="insight-h1">{post.title}</h1>
          <p className="insight-lede">{post.summary}</p>
        </header>
        <div className="insight-body">{renderMarkdown(post.body)}</div>
      </article>

      <style>{`
        .insight-article { max-width: 720px; margin: 32px auto 64px; padding: 0 24px; }
        .insight-back { display: inline-block; margin-bottom: 24px; color: var(--muted, #666); text-decoration: none; font-size: 14px; }
        .insight-back:hover { color: inherit; }
        .insight-header { margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid var(--border, #e5e5e7); }
        .insight-meta { display: flex; gap: 12px; align-items: center; font-size: 12px; color: var(--muted, #666); margin-bottom: 12px; }
        .insight-category { font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .insight-h1 { font-size: clamp(1.75rem, 3.5vw, 2.5rem); line-height: 1.2; margin: 8px 0 16px; }
        .insight-lede { color: var(--muted, #666); font-size: 1.1rem; line-height: 1.55; margin: 0; }
        .insight-body .insight-h2 { font-size: 1.35rem; margin: 32px 0 12px; line-height: 1.3; }
        .insight-body .insight-p { line-height: 1.7; margin: 0 0 14px; font-size: 1rem; }
        .insight-body .insight-ul,
        .insight-body .insight-ol { line-height: 1.7; padding-left: 24px; margin: 0 0 18px; }
        .insight-body .insight-ul li,
        .insight-body .insight-ol li { margin-bottom: 6px; }
        .insight-body .insight-code-inline { background: var(--code-bg, #f5f5f7); padding: 2px 6px; border-radius: 4px; font-size: 0.92em; font-family: ui-monospace, SFMono-Regular, monospace; }
        .insight-body .insight-code { background: var(--code-bg, #f5f5f7); padding: 14px 18px; border-radius: 8px; overflow-x: auto; font-size: 0.85em; line-height: 1.5; margin: 0 0 18px; }
        .insight-body .insight-code code { background: none; padding: 0; font-family: ui-monospace, SFMono-Regular, monospace; }
        .insight-body .insight-table-wrap { overflow-x: auto; margin: 0 0 18px; }
        .insight-body .insight-table { border-collapse: collapse; width: 100%; font-size: 0.92rem; }
        .insight-body .insight-table th,
        .insight-body .insight-table td { padding: 8px 12px; border-bottom: 1px solid var(--border, #e5e5e7); text-align: left; }
        .insight-body .insight-table th { font-weight: 600; background: var(--code-bg, #f8f8fa); }
      `}</style>
    </main>
  );
}
