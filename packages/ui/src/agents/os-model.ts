import type { ToolMark } from "./tool-hub-layout.ts";

/* One line of the agents' journal: when, in which tool, what was done. */
export interface OsLine {
  at: string;
  tool: ToolMark;
  text: string;
}

/* A figure the owner reads at a glance: « 86 400 € · en banque ce matin ». */
export interface OsFigure {
  value: string;
  label: string;
}

/* A decision only the owner takes. Approving it writes its `follow` line into the journal. */
export interface OsDecision {
  id: string;
  /* The view it belongs to; the morning view (« today ») shows them all. */
  area: string;
  title: string;
  detail: string;
  /* Why the agent stopped: « Au-delà de votre seuil de 2 000 € ». */
  reason: string;
  /* The button's word: « Payer la facture ». */
  action: string;
  follow: OsLine;
}

/* A question the prototype knows how to answer, and the chips' canonical phrasing. */
export interface OsQuestion {
  id: string;
  ask: string;
  keywords: readonly string[];
  answer: string;
  sources: readonly string[];
}

/* One view of the system: a sidebar word, a one-line brief, figures and the journal behind them. */
export interface OsView {
  area: string;
  /* The sidebar word, in the owner's language: « Ce matin », « Trésorerie ». */
  label: string;
  brief: string;
  figures: readonly OsFigure[];
  journal?: readonly OsLine[] | undefined;
}

/* The decisions a view shows: the morning view carries every one, the others their own. */
export function decisionsOf(area: string, decisions: readonly OsDecision[]): OsDecision[] {
  if (area === "today") {
    return [...decisions];
  }
  return decisions.filter((decision) => decision.area === area);
}

/* How many of a view's decisions still wait on the owner. */
export function pendingOf(
  area: string,
  decisions: readonly OsDecision[],
  approved: readonly string[],
): number {
  return decisionsOf(area, decisions).filter((decision) => !approved.includes(decision.id)).length;
}

/* A view's journal: what each approval set in motion, newest first, then the morning's lines. */
export function journalOf(
  view: OsView,
  decisions: readonly OsDecision[],
  approved: readonly string[],
): OsLine[] {
  const owned = decisionsOf(view.area, decisions);
  const follows = approved
    .toReversed()
    .map((id) => owned.find((decision) => decision.id === id))
    .filter((decision): decision is OsDecision => decision !== undefined)
    .map((decision) => decision.follow);
  return [...follows, ...(view.journal ?? [])];
}

/* Accents and capitals aside, so « TRÉSORERIE » finds « tresor ». */
function plain(text: string): string {
  return text.normalize("NFD").replaceAll(/[̀-ͯ]/gu, "").toLowerCase();
}

/* The scripted answer to what the owner typed, keeping their own words as the question shown. */
export function answerTo(
  text: string,
  questions: readonly OsQuestion[],
  fallback: OsQuestion,
): OsQuestion {
  const words = plain(text);
  const found = questions.find((question) =>
    question.keywords.some((keyword) => words.includes(plain(keyword))),
  );
  return { ...(found ?? fallback), ask: text };
}
