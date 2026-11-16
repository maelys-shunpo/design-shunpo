import { FilExpertise } from "../../src/fil/fil-expertise.tsx";
import { FilMark } from "../../src/fil/fil-mark.tsx";
import { FilMotion } from "../../src/fil/fil-motion.tsx";
import { FilSection } from "../../src/fil/fil-section.tsx";
import { FilStatement } from "../../src/fil/fil-statement.tsx";
import { FilSteps } from "../../src/fil/fil-steps.tsx";

const card = { title: "Titre", outcome: "Résultat", detail: "Détail", scope: ["A"], example: "E" };

/* A short « Le fil » page with every element FilMotion moves, its band below the first window. */
export function FilMotionPage() {
  return (
    <FilMotion>
      <div style={{ height: "120vh" }} />
      <FilSection thread="left">
        <h2 data-fil-reveal>Ce que vous achetez vraiment.</h2>
        <ul>
          <FilStatement notThis="Un agent IA" butThis="Des tâches qui se font seules." />
        </ul>
        <FilSteps />
        <p>
          Tirons le premier <FilMark>fil</FilMark>.
        </p>
        <FilExpertise index="01" {...card} />
        <FilExpertise index="02" {...card} />
      </FilSection>
    </FilMotion>
  );
}
