import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";
import { Heading } from "@repo/ui/typography/heading";

export function ProposalsFirstSeries() {
  return (
    <Section spacing="sm">
      <Container size="wide">
        <Heading level={2} size="title-sm">
          Première série, sur la charte SHUNPO
        </Heading>
      </Container>
    </Section>
  );
}
