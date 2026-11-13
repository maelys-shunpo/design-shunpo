import { Headline } from "@repo/ui/agents/headline";
import { Text } from "@repo/ui/typography/text";

export function OsTitle() {
  return (
    <Headline level={2} size="title" align="start" entrance="lines">
      On crée le cerveau de votre entreprise
    </Headline>
  );
}

/* What the screen lets the owner do, and the honest note: everything clicks, the figures are fictitious. */
export function OsLine() {
  return (
    <Text size="lg" tone="muted" align="start" measure="prose">
      SHUNPO lit vos outils, travaille pendant le week-end et vous remet chaque lundi un seul écran
      : ce qui est fait, ce qui attend votre accord, et vos questions en français. Essayez : tout se
      clique, les chiffres sont fictifs.
    </Text>
  );
}
