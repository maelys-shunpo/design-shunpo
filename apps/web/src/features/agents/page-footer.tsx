import { AgentsFooter } from "@repo/ui/agents/agents-footer";
import { NavAnchor } from "@repo/ui/agents/nav-anchor";

import { casesUrl, contactUrl } from "../shunpo/content";

const links = [
  { href: casesUrl, label: "Cas clients" },
  { href: "https://shunpo.fr/blog", label: "Blog" },
  { href: contactUrl, label: "Contact" },
] as const;

export function PageFooter() {
  return (
    <AgentsFooter
      links={links.map((link) => (
        <NavAnchor key={link.label} href={link.href}>
          {link.label}
        </NavAnchor>
      ))}
      place="Lyon, France"
      legal={
        <>
          <span>© 2026 SHUNPO · agents IA, automatisations et logiciels sur mesure</span>
          <NavAnchor href="https://shunpo.fr/pages-legales/mentions-legales">
            Mentions légales
          </NavAnchor>
        </>
      }
    />
  );
}
