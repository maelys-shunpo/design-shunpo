import { Media } from "@repo/ui/components/media";
import { Container } from "@repo/ui/layout/container";
import { Grid } from "@repo/ui/layout/grid";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";
import Image from "next/image";

import { drawingStates, heroLead } from "./copy";
import { HeroIntro } from "./hero-intro";
import { posters, stills } from "./images";

/* The hero without motion: the offer, then the four drawings as plates, each with its caption. */
export function HeroStill() {
  return (
    <Container>
      <Stack gap="3xl">
        <Stack gap="lg">
          <HeroIntro />
          <Text size="lg" tone="muted" measure="prose">
            {heroLead}
          </Text>
        </Stack>
        <Grid columns="2" gap="xl">
          {drawingStates.map((state, index) => (
            <Media
              key={state.id}
              caption={`${state.title} ${state.text}`}
              image={
                <Image
                  src={stills[index] ?? posters.landscape}
                  alt={`Dessin à l’encre, étape ${index + 1} sur 4 : ${state.title}`}
                  sizes="(min-width: 48rem) 50vw, 100vw"
                />
              }
            />
          ))}
        </Grid>
      </Stack>
    </Container>
  );
}
