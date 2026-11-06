import { Container } from "@repo/ui/layout/container";
import { Direction } from "@repo/ui/layout/direction";
import { Section } from "@repo/ui/layout/section";
import { Heading } from "@repo/ui/typography/heading";

export default function Page() {
  return (
    <Direction name="instant">
      <main>
        <Section>
          <Container>
            <Heading level={1}>SHUNPO vous libère du temps.</Heading>
          </Container>
        </Section>
      </main>
    </Direction>
  );
}
