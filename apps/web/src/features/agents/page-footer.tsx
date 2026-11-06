import { NavAnchor } from "@repo/ui/agents/nav-anchor";
import { Wordmark } from "@repo/ui/agents/wordmark";
import { Container } from "@repo/ui/layout/container";
import { Inline } from "@repo/ui/layout/inline";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { casesUrl, contactUrl } from "../shunpo/content";

const links = [
  { href: casesUrl, label: "Cas clients" },
  { href: "https://shunpo.fr/blog", label: "Blog" },
  { href: contactUrl, label: "Contact" },
  { href: "https://shunpo.fr/pages-legales/mentions-legales", label: "Mentions légales" },
] as const;

export function PageFooter() {
  return (
    <Section as="footer" spacing="md">
      <Container size="wide">
        <Stack gap="xl">
          <Inline justify="between" align="center" gap="lg">
            <Wordmark size="lg" />
            <Inline gap="lg">
              {links.map((link) => (
                <NavAnchor key={link.label} href={link.href}>
                  {link.label}
                </NavAnchor>
              ))}
            </Inline>
          </Inline>
          <Text size="sm" tone="muted">
            SHUNPO · agents IA, automatisations et logiciels sur mesure · Lyon
          </Text>
        </Stack>
      </Container>
    </Section>
  );
}
