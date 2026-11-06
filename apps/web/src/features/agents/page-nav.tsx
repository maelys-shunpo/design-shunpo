import { AgentsAction } from "@repo/ui/agents/action";
import { AgentsNav } from "@repo/ui/agents/nav";
import { NavAnchor } from "@repo/ui/agents/nav-anchor";
import { Wordmark } from "@repo/ui/agents/wordmark";
import Link from "next/link";

import { contactUrl } from "../shunpo/content";

const links = [
  { href: "#agents", label: "Agents" },
  { href: "#outils", label: "Intégrations" },
  { href: "#methode", label: "Méthode" },
  { href: "#references", label: "Références" },
  { href: "#essayer", label: "Essayer" },
] as const;

export function PageNav() {
  return (
    <AgentsNav
      label="Navigation principale"
      brand={
        <Link href="/agents" aria-label="shunpo, accueil">
          <Wordmark />
        </Link>
      }
      links={links.map((link) => (
        <NavAnchor key={link.href} href={link.href}>
          {link.label}
        </NavAnchor>
      ))}
      action={
        <AgentsAction href={contactUrl} size="md">
          Réserver un diagnostic
        </AgentsAction>
      }
    />
  );
}
