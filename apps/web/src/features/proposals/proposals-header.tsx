import { Container } from "@repo/ui/layout/container";
import { Inline } from "@repo/ui/layout/inline";
import { Section } from "@repo/ui/layout/section";
import { Text } from "@repo/ui/typography/text";

export function ProposalsHeader() {
  return (
    <Section as="header" spacing="sm">
      <Container size="wide">
        <Inline justify="between" align="center">
          <Text weight="semibold">shunpo</Text>
          <Text size="sm" tone="muted">
            Propositions de landing page · novembre 2026
          </Text>
        </Inline>
      </Container>
    </Section>
  );
}
