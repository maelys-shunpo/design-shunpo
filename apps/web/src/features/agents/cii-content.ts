/* The title keeps the surprise; the cookie's paper says it. « Jusqu’à » keeps it true, since only eligible
   expenses count: it stands with the figure, so the figure is never read alone. */
export const ciiCopy = {
  title: "Votre projet vous réserve une surprise…",
  label: "Casser le biscuit",
  cursor: "Casser",
  prefix: "Jusqu’à",
  figure: "20",
  unit: "%",
  fortune: "de votre facture remboursés en crédit\u00A0d’impôt.",
  conditions: "Voir les conditions",
} as const;

export const cookieSizes = "(min-width: 64rem) 40rem, 110vw";

/* Where the paper sticks out of the fold and where the open photograph splits into its two halves, measured on the
   client's prototype « Section CII · le biscuit » at 690 px wide. */
export const cookieGeometry = {
  paper: { topLeft: [127.5, 200.5], topRight: [183.5, 190], bottomLeft: [162.5, 259] },
  split: 49.86,
  paperTop: 372,
  paperTopShare: 0.93,
  spread: 14,
  blend: "multiply",
} as const;
