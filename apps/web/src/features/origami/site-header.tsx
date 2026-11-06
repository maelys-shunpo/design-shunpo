import { Inline } from "@repo/ui/layout/inline";
import { OrigamiHeader } from "@repo/ui/origami/origami-header";
import { OrigamiLink } from "@repo/ui/origami/origami-link";
import { Wordmark } from "@repo/ui/origami/wordmark";

import { contactUrl } from "@/features/shunpo/content";

const anchors = [
  { href: "#etapes", label: "Étapes" },
  { href: "#expertises", label: "Expertises" },
  { href: "#methode", label: "Méthode" },
  { href: "#references", label: "Références" },
  { href: "#questions", label: "Questions" },
] as const;

export function SiteHeader() {
  return (
    <OrigamiHeader
      brand={<Wordmark />}
      navigation={
        <Inline as="ul" gap="lg">
          {anchors.map((anchor) => (
            <li key={anchor.href}>
              <OrigamiLink href={anchor.href} variant="quiet">
                {anchor.label}
              </OrigamiLink>
            </li>
          ))}
        </Inline>
      }
      action={
        <OrigamiLink href={contactUrl} variant="outline">
          Diagnostic
        </OrigamiLink>
      }
    />
  );
}
