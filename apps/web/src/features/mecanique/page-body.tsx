import { CalibresSection } from "./calibres-section";
import { ClosingSection } from "./closing-section";
import { DefectsSection } from "./defects-section";
import { HeroScene } from "./hero-scene";
import { MethodScene } from "./method-scene";
import { ObjectionsSection } from "./objections-section";
import { ReferencesSection } from "./references-section";
import { ValueSection } from "./value-section";

/* The page in the order of its story: the calibre, the defects, the value, the expertises, the method,
   the references, the questions, the call. */
export function PageBody() {
  return (
    <main>
      <HeroScene />
      <DefectsSection />
      <ValueSection />
      <CalibresSection />
      <section id="operations" aria-label="Méthode">
        <MethodScene />
      </section>
      <ReferencesSection />
      <ObjectionsSection />
      <ClosingSection />
    </main>
  );
}
