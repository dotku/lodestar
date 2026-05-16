"use client";

import { useState } from "react";

type FormStrings = {
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  affiliation: string;
  affiliationPlaceholder: string;
  message: string;
  messagePlaceholder: string;
  submit: string;
  sending: string;
  success: string;
  error: string;
  fallback: string;
};

type Props = { t: FormStrings; mailto: string };

export function ContactForm({ t, mailto }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    const form = e.currentTarget;
    const fd = new FormData(form);
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          affiliation: fd.get("affiliation"),
          message: fd.get("message"),
          honeypot: fd.get("website"),
        }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      <div className="contact-form-row">
        <label className="contact-field">
          <span className="contact-label">{t.name}</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            placeholder={t.namePlaceholder}
            maxLength={200}
          />
        </label>
        <label className="contact-field">
          <span className="contact-label">{t.email}</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder={t.emailPlaceholder}
            maxLength={200}
          />
        </label>
      </div>
      <label className="contact-field">
        <span className="contact-label">{t.affiliation}</span>
        <input
          type="text"
          name="affiliation"
          autoComplete="organization"
          placeholder={t.affiliationPlaceholder}
          maxLength={200}
        />
      </label>
      <label className="contact-field">
        <span className="contact-label">{t.message}</span>
        <textarea
          name="message"
          required
          rows={5}
          maxLength={4000}
          placeholder={t.messagePlaceholder}
        />
      </label>

      {/* honeypot — visually hidden, screen-reader hidden */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: 1,
          height: 1,
          opacity: 0,
        }}
      />

      <div className="contact-form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={status === "sending"}
        >
          {status === "sending" ? t.sending : t.submit}
        </button>
        <span className="contact-fallback">
          {t.fallback}{" "}
          <a href={`mailto:${mailto}`} className="contact-fallback-link">
            {mailto}
          </a>
        </span>
      </div>

      {status === "sent" ? (
        <p className="contact-form-msg contact-form-msg-ok">{t.success}</p>
      ) : null}
      {status === "error" ? (
        <p className="contact-form-msg contact-form-msg-err">{t.error}</p>
      ) : null}
    </form>
  );
}
