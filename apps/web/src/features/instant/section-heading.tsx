import { Folio } from "@repo/ui/instant/folio";
import { Reveal } from "@repo/ui/instant/reveal";
import { Stack } from "@repo/ui/layout/stack";
import { Heading } from "@repo/ui/typography/heading";
import { Text } from "@repo/ui/typography/text";

interface SectionHeadingProps {
  index: string;
  label: string;
  title: string;
  lead?: string;
  /* margin: set in the narrow margin of a Spread, one step smaller. */
  place?: "full" | "margin";
}

/* Every plate opens the same way: its folio, its title rising line by line, and a lead when it needs one. */
export function SectionHeading({ index, label, title, lead, place = "full" }: SectionHeadingProps) {
  return (
    <Reveal>
      <Stack gap="lg">
        <Folio index={index} label={label} />
        <Heading level={2} size={place === "full" ? "display" : "title-lg"}>
          {title}
        </Heading>
        {lead === undefined ? null : (
          <Text tone="muted" measure="prose">
            {lead}
          </Text>
        )}
      </Stack>
    </Reveal>
  );
}
