import { t, type Locale } from "@/lib/marketing/i18n";
import { Reveal } from "../Reveal";

export function Workflow({ locale }: { locale: Locale }) {
  const phases = [1, 2, 3, 4].map((n) => ({
    num: String(n).padStart(2, "0"),
    title: t(locale, `workflow.${n}.title`),
    desc: t(locale, `workflow.${n}.desc`),
  }));

  return (
    <section id="workflow" className="section workflow">
      <div className="container">
        <Reveal>
          <p className="overline">{t(locale, "workflow.overline")}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="display-section workflow__headline">
            {t(locale, "workflow.headline")}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="body-lg workflow__intro">{t(locale, "workflow.intro")}</p>
        </Reveal>

        <ol className="workflow__grid">
          {phases.map((p, i) => (
            <Reveal as="li" className="workflow__phase" delay={0.1 + i * 0.08} key={p.num}>
              <span className="workflow__num">{p.num}</span>
              <h3 className="heading workflow__title">{p.title}</h3>
              <p className="body workflow__desc">{p.desc}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
