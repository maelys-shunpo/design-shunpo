import { AgentsAction } from "@repo/ui/agents/action";
import { Headline } from "@repo/ui/agents/headline";
import { HeadlinePart } from "@repo/ui/agents/headline-part";
import { Stack } from "@repo/ui/layout/stack";
import { Text } from "@repo/ui/typography/text";
import Link from "next/link";

/* The 404 sheet's words: the title, one plain sentence, and the one way back. */
export function NotFoundCopy() {
  return (
    <Stack gap="lg" align="center">
      <Headline level={1} size="display" align="center">
        <HeadlinePart tone="dim">Cette page</HeadlinePart>{" "}
        <HeadlinePart tone="ink">n’existe pas.</HeadlinePart>
      </Headline>
      <Text as="p" tone="muted" align="center" measure="prose">
        Le lien est peut-être ancien, ou l’adresse contient une faute de frappe.
      </Text>
      <AgentsAction size="lg" arrow render={<Link href="/" />}>
        Revenir à l’accueil
      </AgentsAction>
    </Stack>
  );
}
