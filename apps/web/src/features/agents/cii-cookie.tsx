import { AgentsAction } from "@repo/ui/agents/action";
import { FortuneCookie } from "@repo/ui/agents/fortune-cookie";
import Image from "next/image";

import { ciiCopy, cookieGeometry, cookieSizes } from "./cii-content";
import cracked from "./images/cii-photo-cracked.webp";
import opened from "./images/cii-photo-open.webp";
import whole from "./images/cii-photo-whole.webp";

/* The real cookie photographed on white: one open photograph split into its two halves. */
const art = {
  ...cookieGeometry,
  whole: <Image src={whole} alt="" fill sizes={cookieSizes} />,
  cracked: <Image src={cracked} alt="" fill sizes={cookieSizes} />,
  openLeft: <Image src={opened} alt="" fill sizes={cookieSizes} />,
  openRight: <Image src={opened} alt="" fill sizes={cookieSizes} />,
};

export function CiiCookie() {
  return (
    <FortuneCookie
      art={art}
      trigger="click"
      label={ciiCopy.label}
      cursor={ciiCopy.cursor}
      prefix={ciiCopy.prefix}
      figure={ciiCopy.figure}
      unit={ciiCopy.unit}
      fortune={ciiCopy.fortune}
      link={
        <AgentsAction href="#questions" variant="quiet" arrow>
          {ciiCopy.conditions}
        </AgentsAction>
      }
    />
  );
}
