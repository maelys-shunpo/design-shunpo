import { Container } from "@repo/ui/layout/container";
import { Inline } from "@repo/ui/layout/inline";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { OrigamiLink } from "@repo/ui/origami/origami-link";
import { Wordmark } from "@repo/ui/origami/wordmark";
import { Text } from "@repo/ui/typography/text";

import { casesUrl, contactUrl } from "@/features/shunpo/content";

export function SiteFooter() {
  return (
    <Section as="footer" spacing="lg" tone="muted">
      <Container size="wide">
        <Stack gap="2xl">
          <Wordmark size="xl" />
          <Inline justify="between" gap="lg">
            <Text size="sm" tone="muted">
              Agence IA, automatisation et logiciels sur mesure · Lyon
            </Text>
            <Inline as="ul" gap="lg">
              <li>
                <OrigamiLink href={casesUrl} variant="quiet">
                  Cas clients
                </OrigamiLink>
              </li>
              <li>
                <OrigamiLink href={contactUrl} variant="quiet">
                  Contact
                </OrigamiLink>
              </li>
            </Inline>
          </Inline>
        </Stack>
      </Container>
    </Section>
  );
}
