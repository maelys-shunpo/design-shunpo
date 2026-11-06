import { ShunpoLogo } from "@repo/ui/brand/shunpo-logo";
import { InkLink } from "@repo/ui/instant/ink-link";
import { NavList } from "@repo/ui/instant/nav-list";
import { Container } from "@repo/ui/layout/container";
import { Inline } from "@repo/ui/layout/inline";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { casesUrl, contactUrl } from "../shunpo/content";
import { mentionsUrl } from "./copy";

export function SiteFooter() {
  return (
    <Section as="footer" scheme="dark" spacing="sm">
      <Container size="wide">
        <Inline justify="between" gap="xl" align="end">
          <Stack gap="sm">
            <ShunpoLogo size="md" />
            <Text size="sm" tone="muted">
              Agence IA, automatisation et logiciels sur mesure. Lyon.
            </Text>
          </Stack>
          <NavList>
            <li>
              <InkLink size="sm" href={contactUrl}>
                Contact
              </InkLink>
            </li>
            <li>
              <InkLink size="sm" href={casesUrl}>
                Cas clients
              </InkLink>
            </li>
            <li>
              <InkLink size="sm" href={mentionsUrl}>
                Mentions légales
              </InkLink>
            </li>
          </NavList>
        </Inline>
      </Container>
    </Section>
  );
}
