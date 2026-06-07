"use client";

import { useState, type FormEvent } from "react";
import { t, type Locale } from "@/lib/marketing/i18n";
import { Reveal } from "./Reveal";

// Inquiry form. Posts to Formspree (works on any host), then redirects to the
// received page. Honeypot + accessible error message preserved from the Astro
// original.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xykvbnpr";

export function AudienceForm({ locale }: { locale: Locale }) {
  const base = locale === "en" ? "/en" : "";
  const redirectPath = `${base}/audience/received`;
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(false);
    setSubmitting(true);
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: new FormData(event.currentTarget),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Submission failed");
      window.location.href = redirectPath;
    } catch {
      setError(true);
      setSubmitting(false);
    }
  };

  return (
    <section className="section audience">
      <div className="container audience__inner">
        <Reveal>
          <h1 className="display-section audience__title">{t(locale, "audience.title")}</h1>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="body-lg audience__intro">{t(locale, "audience.intro")}</p>
        </Reveal>

        <Reveal delay={0.12}>
          <form className="form" name="audience" method="POST" onSubmit={onSubmit}>
            <input
              type="text"
              name="_gotcha"
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="form__row">
              <label className="form__label" htmlFor="f-name">
                {t(locale, "audience.field.name")}
              </label>
              <input className="form__input" id="f-name" name="name" type="text" required autoComplete="name" />
            </div>

            <div className="form__row">
              <label className="form__label" htmlFor="f-email">
                {t(locale, "audience.field.email")}
              </label>
              <input className="form__input" id="f-email" name="email" type="email" required autoComplete="email" />
            </div>

            <div className="form__row">
              <label className="form__label" htmlFor="f-role">
                {t(locale, "audience.field.role")}
              </label>
              <input className="form__input" id="f-role" name="role" type="text" required />
            </div>

            <div className="form__row">
              <label className="form__label" htmlFor="f-org">
                {t(locale, "audience.field.org")}
                <span className="form__optional">{t(locale, "audience.field.optional")}</span>
              </label>
              <input className="form__input" id="f-org" name="organization" type="text" />
            </div>

            <div className="form__row">
              <label className="form__label" htmlFor="f-note">
                {t(locale, "audience.field.note")}
                <span className="form__optional">{t(locale, "audience.field.note.hint")}</span>
              </label>
              <textarea
                className="form__input form__textarea"
                id="f-note"
                name="note"
                rows={5}
                maxLength={600}
                required
              />
            </div>

            <fieldset className="form__row form__fieldset">
              <legend className="form__label">{t(locale, "audience.field.lang")}</legend>
              <div className="form__radios">
                <label className="form__radio">
                  <input type="radio" name="language" value="English" defaultChecked={locale === "en"} />
                  <span>{t(locale, "audience.field.lang.en")}</span>
                </label>
                <label className="form__radio">
                  <input type="radio" name="language" value="العربية" defaultChecked={locale === "ar"} />
                  <span lang="ar">{t(locale, "audience.field.lang.ar")}</span>
                </label>
              </div>
            </fieldset>

            <p className="form__error" role="status" aria-live="polite" hidden={!error}>
              {t(locale, "audience.error")}
            </p>

            <button className="btn btn--solid form__submit" type="submit" disabled={submitting}>
              {t(locale, "audience.submit")}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
