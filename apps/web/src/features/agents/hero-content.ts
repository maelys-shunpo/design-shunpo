const media = `${process.env.NEXT_PUBLIC_BASE_PATH}/media/agents`;

/* The home page's promise and call, as on shunpo.fr's new home page. */
export const heroCopy = {
  title: "On construit le système qui fait tourner votre entreprise, boosté à l’IA.",
  action: "Réserver une Immersion",
} as const;

/* The client's sunrise in three states (night, red sun risen, peach dawn), 8.71 s read by the scroll. */
export const heroFilm = {
  sources: { mp4: `${media}/hero-sunrise.mp4`, webm: `${media}/hero-sunrise.webm` },
  /* At 650 of the 1,450 px of sunrise, the promise leaves the sky to the sun, as on the home page; the sunlight has
     climbed through its letters over the climb up to that mark. */
  leaveAt: 650 / 1450,
} as const;
