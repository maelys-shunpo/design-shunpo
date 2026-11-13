import { OsDecisionCard } from "./os-decision.tsx";
import { decisionsOf, journalOf, type OsDecision, type OsLine, type OsView } from "./os-model.ts";

export interface OsPaneLabels {
  /* Above the decisions: « À vous de décider ». */
  decide: string;
  /* On a decision once it is done: « Fait. La ligne est au journal. » */
  decided: string;
  /* Above the journal: « Ce que SHUNPO a fait ». */
  journal: string;
}

interface OsViewPaneProps {
  view: OsView;
  decisions: readonly OsDecision[];
  approved: readonly string[];
  onApprove: (id: string) => void;
  labels: OsPaneLabels;
}

function OsJournal({ lines, title }: { lines: readonly OsLine[]; title: string }) {
  return (
    <section className="flex flex-col gap-1">
      <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
      <ol className="flex flex-col">
        {lines.map((line) => (
          <li
            key={`${line.tool.slug}-${line.text}`}
            className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-agents-line py-2 text-sm last:border-b-0"
          >
            <time className="font-mono text-xs text-muted-foreground">{line.at}</time>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-4 shrink-0"
              fill={`#${line.tool.hex}`}
            >
              <path d={line.tool.path} />
            </svg>
            <span className="font-medium">{line.tool.title}</span>
            <span className="text-muted-foreground">{line.text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* One view of the system: the brief, the decisions that wait on the owner first, then the figures,
   and the journal of what the agents did. */
export function OsViewPane({ view, decisions, approved, onApprove, labels }: OsViewPaneProps) {
  const owned = decisionsOf(view.area, decisions);
  const lines = journalOf(view, decisions, approved);
  return (
    <div data-slot="os-view" className="flex flex-col gap-6 p-4 md:p-6">
      <p className="text-sm text-muted-foreground">{view.brief}</p>
      {owned.length === 0 ? null : (
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-medium text-muted-foreground">{labels.decide}</h3>
          {owned.map((decision) => (
            <OsDecisionCard
              key={decision.id}
              decision={decision}
              decided={approved.includes(decision.id)}
              note={labels.decided}
              onApprove={onApprove}
            />
          ))}
        </section>
      )}
      {view.figures.length === 0 ? null : (
        <dl className="grid divide-y divide-agents-line border-y border-agents-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {view.figures.map((figure) => (
            <div key={figure.label} className="flex flex-col gap-1 py-3 sm:px-3">
              <dt className="order-last text-xs text-muted-foreground">{figure.label}</dt>
              <dd className="font-mono text-lg font-medium">{figure.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {lines.length === 0 ? null : <OsJournal lines={lines} title={labels.journal} />}
    </div>
  );
}
