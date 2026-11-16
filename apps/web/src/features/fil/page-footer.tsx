import { ShunpoLogo } from "@repo/ui/brand/shunpo-logo";
import { FilLink } from "@repo/ui/fil/fil-link";
import { FilSection } from "@repo/ui/fil/fil-section";
import { Container } from "@repo/ui/layout/container";
import { Inline } from "@repo/ui/layout/inline";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { casesUrl, contactUrl, conviction } from "../shunpo/content";

export function PageFooter() {
  return (
    <FilSection as="footer" ground="fuji" spacing="md">
      <Container>
        <Stack gap="xl">
          <ShunpoLogo size="lg" />
          <Text size="lg" measure="prose">
            {conviction}
          </Text>
          <Inline gap="xl">
            <FilLink href={contactUrl}>Contact</FilLink>
            <FilLink href={casesUrl}>Cas clients</FilLink>
            <FilLink href="https://shunpo.fr/pages-legales/mentions-legales">
              Mentions légales
            </FilLink>
          </Inline>
          <Text size="sm" tone="muted">
            SHUNPO, agence IA, automatisation et logiciels sur mesure. Lyon.
          </Text>
        </Stack>
      </Container>
    </FilSection>
  );
}
