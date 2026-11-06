import { FilLink } from "@repo/ui/fil/fil-link";
import { FilReference } from "@repo/ui/fil/fil-reference";
import { FilSection } from "@repo/ui/fil/fil-section";
import { FilTagLine } from "@repo/ui/fil/fil-tag-line";
import { FilTitle } from "@repo/ui/fil/fil-title";
import { Container } from "@repo/ui/layout/container";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";

import { casesUrl, references } from "../shunpo/content";

const tilts = ["left", "right", "none", "left", "right"] as const;

export function ReferencesSection() {
  return (
    <FilSection id="references" ground="shiro" spacing="lg" thread="left">
      <Container>
        <Stack gap="3xl">
          <Stack gap="lg">
            <FilTitle level={2} size="display" data-fil-reveal>
              Ils tiennent au même fil.
            </FilTitle>
            <Text size="lg" tone="muted" measure="prose">
              Une émission en prime time, une plateforme d’investissement, une marque e-commerce :
              des enjeux de charge, de fiabilité et de visibilité très différents.
            </Text>
          </Stack>
          <FilTagLine>
            {references.map((reference, index) => (
              <FilReference
                key={reference.id}
                name={reference.name}
                project={reference.project}
                stake={reference.stake}
                href={reference.href}
                tilt={tilts[index % tilts.length]}
              />
            ))}
          </FilTagLine>
          <FilLink href={casesUrl}>Tous les cas clients</FilLink>
        </Stack>
      </Container>
    </FilSection>
  );
}
