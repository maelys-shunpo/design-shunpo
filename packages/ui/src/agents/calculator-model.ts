/* The lost-hours calculator's pure model: an owner's answers in, the prudent figures out.
   Every rule here is the one the brief states (calculateur-heures-perdues.md, « Le calcul »):
   a prudent recoverable share, 45 worked weeks a year, a legal full-time year of 1 607 h,
   figures rounded down, and a consistency guard above 30 h a person a week. */

/* How many worked weeks a year the yearly figures assume. */
const WORKED_WEEKS = 45;
/* The legal full-time year in France, in hours, used for the full-time equivalent. */
const FULL_TIME_YEAR = 1607;
/* Above this many declared hours per person a week, the answers stop being believable. */
const IMPLAUSIBLE_PER_PERSON = 30;
/* The hourly cost the owner may set stays inside this range. */
const HOURLY_MIN = 25;
const HOURLY_MAX = 45;

/* One answer option: its stored value, what the owner reads, and the hours or head count it stands for. */
export interface CalculatorOption {
  value: string;
  label: string;
  amount?: number;
}

/* A question of the calculator: a single choice or several, each with its options. */
export interface CalculatorQuestion {
  id: string;
  prompt: string;
  kind: "single" | "multi";
  options: CalculatorOption[];
}

/* A repetitive task the owner times (the brief's questions 5 to 9): which hours question
   measures it, its prudent automation rate, and the name shown in the result. */
export interface CalculatorTask {
  question: string;
  rate: number;
  title: string;
}

/* The whole calculator: the team-size question, the measured tasks, and every question asked. */
export interface CalculatorModel {
  team: string;
  tasks: CalculatorTask[];
  questions: CalculatorQuestion[];
}

/* What the owner selected: each question id maps to the values chosen for it. */
export type CalculatorAnswers = Record<string, string[] | undefined>;

/* One time source in the result: a task and the weekly hours it gives back. */
export interface CalculatorSource {
  title: string;
  weeklyHours: number;
}

/* The figures the result screen shows, all drawn from the owner's own answers. */
export interface CalculatorResult {
  weeklySpent: number;
  weeklyRecoverable: number;
  yearlyHours: number;
  yearlyCost: number;
  fullTime: number;
  sources: CalculatorSource[];
  implausible: boolean;
}

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function questionById(model: CalculatorModel, id: string): CalculatorQuestion | undefined {
  return model.questions.find((question) => question.id === id);
}

/* The amount behind a question's first chosen option (a head count or a weekly hour count). */
function chosenAmount(model: CalculatorModel, id: string, answers: CalculatorAnswers): number {
  const question = questionById(model, id);
  if (!question) {
    return 0;
  }

  const chosen = answers[id]?.[0];
  if (chosen === undefined || chosen === "") {
    return 0;
  }

  const option = question.options.find((candidate) => candidate.value === chosen);
  return option?.amount ?? 0;
}

/* Rounds a cost down to keep its order of magnitude, never inventing precision:
   to the thousand once it reaches five figures, to the hundred below. */
function costDown(cost: number): number {
  const step = cost >= 10_000 ? 1_000 : 100;
  return Math.floor(cost / step) * step;
}

/* Keeps the hourly cost the owner sets inside the brief's 25–45 € range. */
export function clampHourly(value: number): number {
  if (value < HOURLY_MIN) {
    return HOURLY_MIN;
  }

  if (value > HOURLY_MAX) {
    return HOURLY_MAX;
  }

  return value;
}

/* True only once every question has at least one answer. */
export function answeredAll(model: CalculatorModel, answers: CalculatorAnswers): boolean {
  return model.questions.every((question) => (answers[question.id]?.length ?? 0) > 0);
}

/* Turns the owner's answers and chosen hourly cost into the result screen's figures. */
export function resultOf(
  model: CalculatorModel,
  answers: CalculatorAnswers,
  hourly: number,
): CalculatorResult {
  const hourlyRate = clampHourly(hourly);
  const team = chosenAmount(model, model.team, answers);

  let perPersonSpent = 0;
  const measured = model.tasks.map((task) => {
    const hours = chosenAmount(model, task.question, answers);
    perPersonSpent += hours;
    return {
      title: task.title,
      spent: team * hours,
      recoverable: team * hours * task.rate,
    };
  });

  const weeklySpent = roundToCents(measured.reduce((total, task) => total + task.spent, 0));
  const weeklyRecoverable = roundToCents(
    measured.reduce((total, task) => total + task.recoverable, 0),
  );
  const yearlyHours = roundToCents(weeklyRecoverable * WORKED_WEEKS);
  const yearlyCost = costDown(yearlyHours * hourlyRate);
  const fullTime = Math.floor((yearlyHours / FULL_TIME_YEAR) * 10) / 10;

  const sources = measured
    .toSorted((left, right) => right.recoverable - left.recoverable)
    .slice(0, 3)
    .map((task) => ({ title: task.title, weeklyHours: roundToCents(task.recoverable) }));

  return {
    weeklySpent,
    weeklyRecoverable,
    yearlyHours,
    yearlyCost,
    fullTime,
    sources,
    implausible: perPersonSpent > IMPLAUSIBLE_PER_PERSON,
  };
}
