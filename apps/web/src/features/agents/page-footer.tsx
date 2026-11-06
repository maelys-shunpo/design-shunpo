import { NavAnchor } from "@repo/ui/agents/nav-anchor";
import { Wordmark } from "@repo/ui/agents/wordmark";
import { GridArea } from "@repo/ui/layout/grid-area";
import { Inline } from "@repo/ui/layout/inline";
import { PageGrid } from "@repo/ui/layout/page-grid";
import { Section } from "@repo/ui/layout/section";
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
    <Section as="footer" spacing="tight">
      <PageGrid rows="md" align="center">
        <GridArea columns={{ md: { start: 1, span: 3 }, lg: { start: 1, span: 4 } }}>
          <Wordmark size="lg" />
        </GridArea>
        <GridArea columns={{ md: { start: 4, span: 5 }, lg: { start: 6, span: 7 } }} justify="end">
          <Inline gap="lg">
            {links.map((link) => (
              <NavAnchor key={link.label} href={link.href}>
                {link.label}
              </NavAnchor>
            ))}
          </Inline>
        </GridArea>
        <GridArea>
          <Text size="sm" tone="muted">
            SHUNPO · agents IA, automatisations et logiciels sur mesure · Lyon
          </Text>
        </GridArea>
      </PageGrid>
    </Section>
  );
}
