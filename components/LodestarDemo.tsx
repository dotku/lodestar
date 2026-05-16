"use client";

import { useState } from "react";
import type { Locale } from "../lib/i18n";

type Scenario = { id: string; title: string; prompt: string };

type Props = {
  locale: Locale;
  scenarios: Scenario[];
  placeholder: string;
  buttonLabel: string;
  clearLabel: string;
  errorMessage: string;
  disclaimer: string;
};

export function LodestarDemo({
  locale,
  scenarios,
  placeholder,
  buttonLabel,
  clearLabel,
  errorMessage,
  disclaimer,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active = scenarios.find((s) => s.id === activeId) ?? null;

  async function run() {
    if (!active) return;
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scenarioId: active.id,
          prompt: active.prompt,
          locale,
        }),
      });
      if (!res.ok || !res.body) {
        throw new Error(`status ${res.status}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setOutput(acc);
      }
    } catch (e) {
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setOutput("");
    setActiveId(null);
    setError(null);
    if (typeof window !== "undefined") {
      // Defer past React commit + browser paint so we scroll to the new
      // (shorter) document layout, not the pre-reset position.
      setTimeout(() => {
        document
          .getElementById("demo")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    }
  }

  return (
    <div>
      <div className="demo-scenarios">
        {scenarios.map((s) => (
          <button
            key={s.id}
            className="scenario"
            aria-pressed={s.id === activeId}
            disabled={loading}
            onClick={() => setActiveId(s.id)}
            type="button"
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className={`demo-output ${!output && !loading ? "placeholder" : ""}`}>
        {output ? (
          <span>
            {output}
            {loading ? <span className="cursor" /> : null}
          </span>
        ) : loading ? (
          <span className="cursor" />
        ) : (
          placeholder
        )}
      </div>

      <div className="demo-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!active || loading}
          onClick={run}
        >
          {buttonLabel}
        </button>
        <button
          type="button"
          className="btn"
          disabled={loading || (!output && !activeId)}
          onClick={reset}
        >
          {clearLabel}
        </button>
        {error ? (
          <span className="demo-status" role="alert">
            {error}
          </span>
        ) : null}
      </div>

      <p className="demo-disclaimer">{disclaimer}</p>
    </div>
  );
}
