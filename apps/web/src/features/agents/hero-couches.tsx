import { HeroCouches as HeroCouchesScene } from "@repo/ui/agents/hero-couches";
import Image from "next/image";

import { CouchesOutro, CouchesPromise } from "./hero-couches-copy";
import {
  couchesAgents,
  couchesLabels,
  couchesTarget,
  couchesTools,
  couchesWorkspace,
} from "./hero-couches-data";
import plaster from "./images/hero-plaster.webp";

/* Hero proposal « Vue éclatée »: the interface opens into its three layers (you, the agents, your tools). */
export function HeroCouches() {
  return (
    <HeroCouchesScene
      copy={<CouchesPromise />}
      backdrop={
        <Image src={plaster} alt="" fill loading="eager" sizes="(min-width: 64rem) 65rem, 100vw" />
      }
      labels={couchesLabels}
      workspace={couchesWorkspace}
      agents={couchesAgents}
      tools={couchesTools}
      target={couchesTarget}
      outro={<CouchesOutro />}
    />
  );
}
