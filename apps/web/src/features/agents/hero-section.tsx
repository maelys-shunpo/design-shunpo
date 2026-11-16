import { AgentsAction } from "@repo/ui/agents/action";
import { HeroFilm } from "@repo/ui/agents/hero-film";
import Image from "next/image";

import { contactUrl } from "../shunpo/content";
import { heroCopy, heroFilm } from "./hero-content";
import sunriseRisen from "./images/hero-sunrise-risen.webp";
import sunriseStart from "./images/hero-sunrise-start.webp";

/* The home page's hero: the sunrise read by the scroll behind the promise. */
export function HeroSection() {
  return (
    <HeroFilm
      sources={heroFilm.sources}
      poster={
        <Image src={sunriseStart} alt="" fill sizes="100vw" loading="eager" fetchPriority="high" />
      }
      still={<Image src={sunriseRisen} alt="" fill sizes="100vw" />}
      title={heroCopy.title}
      action={
        <AgentsAction href={contactUrl} size="lg" arrow>
          {heroCopy.action}
        </AgentsAction>
      }
      leaveAt={heroFilm.leaveAt}
    />
  );
}
