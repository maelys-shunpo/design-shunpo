import { ShunpoLogo } from "@repo/ui/brand/shunpo-logo";
import { Masthead } from "@repo/ui/mecanique/masthead";
import { MecaniqueLink } from "@repo/ui/mecanique/mecanique-link";
import { NavLink } from "@repo/ui/mecanique/nav-link";

import { contactUrl } from "../shunpo/content";

const anchors = [
  { href: "#defauts", label: "Le constat" },
  { href: "#calibres", label: "Expertises" },
  { href: "#operations", label: "Méthode" },
  { href: "#references", label: "Références" },
] as const;

export function SiteHeader() {
  return (
    <Masthead
      label="Sections de la page"
      brand={<ShunpoLogo size="sm" />}
      navigation={anchors.map((anchor, index) => (
        <li key={anchor.href}>
          <NavLink href={anchor.href} index={String(index + 1).padStart(2, "0")}>
            {anchor.label}
          </NavLink>
        </li>
      ))}
      action={<MecaniqueLink href={contactUrl}>Diagnostic</MecaniqueLink>}
    />
  );
}
