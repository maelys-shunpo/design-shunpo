import { ShunpoLogo } from "@repo/ui/brand/shunpo-logo";
import { InstantHeader } from "@repo/ui/instant/header";
import { InkLink } from "@repo/ui/instant/ink-link";
import { NavList } from "@repo/ui/instant/nav-list";
import { SealLink } from "@repo/ui/instant/seal-link";
import Link from "next/link";

import { contactUrl } from "../shunpo/content";
import { navigation, primaryAction } from "./copy";

export function SiteHeader() {
  return (
    <InstantHeader
      brand={
        <Link href="/instant">
          <ShunpoLogo size="sm" label="SHUNPO, retour en haut de la page" />
        </Link>
      }
      navigation={
        <NavList>
          {navigation.map((item) => (
            <li key={item.id}>
              <InkLink size="sm" href={`#${item.id}`}>
                {item.label}
              </InkLink>
            </li>
          ))}
        </NavList>
      }
      action={<SealLink href={contactUrl} label={primaryAction} size="sm" />}
    />
  );
}
