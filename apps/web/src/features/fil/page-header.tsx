import { FilHeader } from "@repo/ui/fil/fil-header";

import { contactUrl } from "../shunpo/content";

const links = [
  { href: "#probleme", label: "Le problème" },
  { href: "#expertises", label: "Expertises" },
  { href: "#methode", label: "Méthode" },
  { href: "#references", label: "Références" },
];

export function PageHeader() {
  return (
    <FilHeader
      homeHref="/"
      links={links}
      action={{ href: contactUrl, label: "Réserver un diagnostic", shortLabel: "Diagnostic" }}
    />
  );
}
