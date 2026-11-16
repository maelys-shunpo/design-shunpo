export const duration = {
  fast: 0.2,
  base: 0.45,
  slow: 0.8,
} as const;

export const ease = {
  standard: "power2.out",
  emphasized: "expo.out",
  inOut: "power3.inOut",
  /* Exits: they accelerate away, on the same family as `standard`. */
  exit: "power2.in",
  /* Starts and lands softly, with no still moment: a drawn curve, registered by `registerCustomEases`. */
  fluid: "fluid",
} as const;

export const stagger = {
  tight: 0.04,
  base: 0.08,
  loose: 0.14,
} as const;

export const sceneLength = {
  short: 1,
  medium: 2,
  long: 3,
} as const;

export const scrub = 0.6;

/* A control's answer to a press: it dips while a highlight spreads from the point pressed, then lets go. */
export const press = {
  in: 0.18,
  out: 0.12,
  easeIn: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  easeOut: "cubic-bezier(0.4, 0, 1, 1)",
} as const;
