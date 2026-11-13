import { Headline } from "@repo/ui/agents/headline";
import { Text } from "@repo/ui/typography/text";

export function ToolsTitle({ align }: { align: "start" | "center" }) {
  return (
    <Headline level={2} size="title" align={align} entrance="lines">
      Vos agents travaillent dans les outils que{"\u00A0"}vous avez déjà
    </Headline>
  );
}

/* What is left of the lead: the one promise a ring of logos cannot make. */
export function ToolsLine({ align }: { align: "start" | "center" }) {
  return (
    <Text size="lg" tone="muted" measure="prose" align={align}>
      Quand un outil n’a pas de connecteur, nous le construisons.
    </Text>
  );
}
