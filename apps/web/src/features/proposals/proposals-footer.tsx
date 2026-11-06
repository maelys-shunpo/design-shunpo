import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";
import { Text } from "@repo/ui/typography/text";

export function ProposalsFooter() {
  return (
    <Section as="footer" spacing="sm">
      <Container size="wide">
        <Text size="sm" tone="muted" measure="prose">
          Les trois pages se lisent aussi sans animation (réglage « réduire les animations ») et sur
          téléphone, où chaque scène passe dans une version allégée.
        </Text>
      </Container>
    </Section>
  );
}
