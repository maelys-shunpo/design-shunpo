import { AgentsAction } from "@repo/ui/agents/action";
import { AgentsNav } from "@repo/ui/agents/nav";
import { NavAnchor } from "@repo/ui/agents/nav-anchor";
import { Wordmark } from "@repo/ui/agents/wordmark";
import Link from "next/link";

import { contactUrl } from "../shunpo/content";
import { casesAreShown } from "./cases-visibility";

const allLinks = [
  { href: "#outils", label: "Intégrations" },
  { href: "#essayer", label: "Essayer" },
  { href: "#references", label: "Références" },
  { href: "#methode", label: "Méthode" },
] as const;

const links = allLinks.filter((link) => casesAreShown || link.href !== "#references");

export function PageNav({ over }: { over: "paper" | "film" }) {
  return (
    <AgentsNav
      label="Navigation principale"
      over={over}
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
          Parlons de votre projet
        </AgentsAction>
      }
    />
  );
}
