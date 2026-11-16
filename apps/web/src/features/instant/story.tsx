import { ConstatSection } from "./constat-section";
import { ExpertisesSection } from "./expertises-section";
import { HeroScene } from "./hero-scene";
import { MethodSection } from "./method-section";
import { PurchaseScene } from "./purchase-scene";

/* The first half of the page: the offer, the problem, what is really bought, the expertises, the method. */
export function Story() {
  return (
    <>
      <HeroScene />
      <ConstatSection />
      <PurchaseScene />
      <ExpertisesSection />
      <MethodSection />
    </>
  );
}
