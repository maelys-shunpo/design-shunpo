import { Stack } from "@repo/ui/layout/stack";
import { SpecLabel } from "@repo/ui/mecanique/spec-label";
import { Heading } from "@repo/ui/typography/heading";
import { Text } from "@repo/ui/typography/text";

interface SectionHeadingProps {
  label: string;
  title: string;
  lead?: string;
  id?: string;
}

/* Every section opens like a sheet of the drawing set: its reference, its title, one line of context. */
export function SectionHeading({ label, title, lead, id }: SectionHeadingProps) {
  return (
    <Stack gap="md">
      <SpecLabel rule tone="signal">
        {label}
      </SpecLabel>
      <Heading level={2} size="title-lg" id={id}>
        {title}
      </Heading>
      {lead === undefined ? null : (
        <Text size="lg" tone="muted" measure="prose">
          {lead}
        </Text>
      )}
    </Stack>
  );
}
