"use client";

import { Folio } from "@repo/ui/instant/folio";
import { StruckLine } from "@repo/ui/instant/struck-line";
import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { ScrollScene } from "@repo/ui/motion/scroll-scene";
import { Heading } from "@repo/ui/typography/heading";
import { Text } from "@repo/ui/typography/text";

import { purchases } from "./copy";
import { purchaseChoreography } from "./purchase-choreography";

/* A proof corrected in the margin: what agencies sell, crossed out, and what a manager actually buys. */
export function PurchaseScene() {
  return (
    <Section scheme="dark" spacing="xs">
      <ScrollScene choreography={purchaseChoreography} length="medium" minWidth="md">
        <Container size="wide">
          <Stack gap="2xl">
            <Stack gap="lg">
              <Folio index="02" label="Ce que vous achetez vraiment" />
              <Heading level={2} size="display">
                Vous n’achetez pas de la technologie.
              </Heading>
            </Stack>
            <Stack as="ul" gap="none">
              {purchases.map((purchase) => (
                <StruckLine key={purchase.id} sold={purchase.sold} bought={purchase.bought} />
              ))}
            </Stack>
            <Text tone="muted" measure="prose">
              La technologie est le moyen. Le résultat, pour votre activité et pour vos équipes, est
              la finalité.
            </Text>
          </Stack>
        </Container>
      </ScrollScene>
    </Section>
  );
}
