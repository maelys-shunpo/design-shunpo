import { ShunpoLogo } from "@repo/ui/brand/shunpo-logo";
import { Container } from "@repo/ui/layout/container";
import { Inline } from "@repo/ui/layout/inline";
import { Section } from "@repo/ui/layout/section";
import { Text } from "@repo/ui/typography/text";

export function ProposalsHeader() {
  return (
    <Section as="header" spacing="sm">
      <Container size="wide">
        <Inline justify="between" align="center">
          <ShunpoLogo size="sm" />
          <Text size="sm" tone="muted">
            Propositions de landing page · novembre 2026
          </Text>
        </Inline>
      </Container>
    </Section>
  );
}
