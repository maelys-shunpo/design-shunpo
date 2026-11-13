import type { CookieArt } from "../../src/agents/fortune-cookie.tsx";

function drawing(shapes: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1380 793'>${shapes}</svg>`;
  return <img alt="" src={`data:image/svg+xml,${encodeURIComponent(svg)}`} />;
}

const DOUGH = "fill='%23d9b27c'";
const STRIP =
  "<rect x='250' y='390' width='120' height='60' fill='%23f8f7f2' transform='rotate(-10 250 390)'/>";

/* A drawn stand-in for the client's photographs: the cookie whole, cracked and open. */
export const sampleCookie: CookieArt = {
  paper: { topLeft: [127.5, 200.5], topRight: [183.5, 190], bottomLeft: [162.5, 259] },
  split: 49.86,
  paperTop: 372,
  paperTopShare: 0.93,
  spread: 14,
  blend: "normal",
  whole: drawing(`<path d='M300 600 Q690 -100 1080 600 Z' ${DOUGH}/>${STRIP}`),
  cracked: drawing(
    `<path d='M300 600 Q690 -100 1080 600 Z' ${DOUGH}/><path d='M690 250 L700 600' stroke='%23704a1d' stroke-width='8'/>${STRIP}`,
  ),
  openLeft: drawing(`<path d='M200 600 Q450 0 640 600 Z' ${DOUGH}/>`),
  openRight: drawing(`<path d='M740 600 Q930 0 1180 600 Z' ${DOUGH}/>`),
};
