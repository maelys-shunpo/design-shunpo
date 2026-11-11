import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";

let registered = false;

/* The project's two drawn curves, registered once per page (safe to call again): `fluid` starts and lands softly with
   no still moment; `throw` leaves the hand fast and slows all the way to where it lands. */
export function registerCustomEases(): void {
  if (registered) {
    return;
  }
  registered = true;
  gsap.registerPlugin(CustomEase);
  CustomEase.create("fluid", "M0,0 C0.45,0.05 0.2,1 1,1");
  CustomEase.create("throw", "M0,0 C0.22,0.38 0.42,1 1,1");
}
