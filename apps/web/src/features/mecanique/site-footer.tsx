import { ShunpoLogo } from "@repo/ui/brand/shunpo-logo";
import { Container } from "@repo/ui/layout/container";
import { Inline } from "@repo/ui/layout/inline";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { NavLink } from "@repo/ui/mecanique/nav-link";
import { SpecLabel } from "@repo/ui/mecanique/spec-label";
import { Text } from "@repo/ui/typography/text";

import { casesUrl, contactUrl, values } from "../shunpo/content";

const links = [
  { href: contactUrl, label: "Contact" },
  { href: casesUrl, label: "Réalisations" },
  { href: "https://shunpo.fr/pages-legales/mentions-legales", label: "Mentions légales" },
] as const;

export function SiteFooter() {
  return (
    <Section as="footer" spacing="lg">
      <Container size="wide">
        <Stack gap="2xl">
          <Inline gap="2xl" justify="between" align="start">
            <Stack gap="md">
              <ShunpoLogo size="md" />
              <Text tone="muted" measure="prose">
                Agence IA, automatisation et logiciels sur mesure. Lyon.
              </Text>
            </Stack>
            <Inline as="ul" gap="xl">
              {links.map((link, index) => (
                <li key={link.href}>
                  <NavLink href={link.href} index={String(index + 1).padStart(2, "0")}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </Inline>
          </Inline>
          <Inline as="ul" gap="lg" aria-label="Nos principes">
            {values.map((value) => (
              <li key={value.id}>
                <SpecLabel>{value.name}</SpecLabel>
              </li>
            ))}
          </Inline>
          <SpecLabel as="p">© 2026 SHUNPO · Lyon</SpecLabel>
        </Stack>
      </Container>
    </Section>
  );
}
