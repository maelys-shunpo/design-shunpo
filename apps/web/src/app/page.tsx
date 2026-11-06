import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";
import { Heading } from "@repo/ui/typography/heading";

export default function HomePage() {
  return (
    <main>
      <Section>
        <Container>
          <Heading level={1}>Trois directions pour SHUNPO</Heading>
        </Container>
      </Section>
    </main>
  );
}
