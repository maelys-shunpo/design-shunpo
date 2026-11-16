import { Media } from "@repo/ui/components/media";
import { FilHeroFrame } from "@repo/ui/fil/fil-hero-frame";
import { Container } from "@repo/ui/layout/container";
import { Grid } from "@repo/ui/layout/grid";
import { Stack } from "@repo/ui/layout/stack";
import Image from "next/image";

import { beats } from "./beats";
import { HeroCopy } from "./hero-copy";
import { plates } from "./kumihimo-plates";

/* The reduced-motion page of the hero: the message, then the three chapters of the stand as still plates. */
export function KumihimoStills() {
  return (
    <Stack gap="2xl">
      <FilHeroFrame foot={null}>
        <HeroCopy />
      </FilHeroFrame>
      <Container size="wide">
        <Grid as="ol" columns="3" gap="md">
          {plates.map((plate, index) => (
            <li key={plate.alt}>
              <Media
                caption={`0${index + 1} ${beats[index]?.name ?? ""}. ${beats[index]?.line ?? ""}`}
                image={
                  <Image src={plate.image} alt={plate.alt} sizes="(min-width: 48rem) 33vw, 100vw" />
                }
              />
            </li>
          ))}
        </Grid>
      </Container>
    </Stack>
  );
}
