"use client";

import { Tabs } from "@base-ui/react/tabs";

import { MockWindow } from "./mock-window.tsx";
import { type OsAskLabels, OsAsk } from "./os-ask.tsx";
import { type OsDecision, type OsQuestion, type OsView, pendingOf } from "./os-model.ts";
import { type OsPaneLabels, OsViewPane } from "./os-view.tsx";
import { StatusPill } from "./status-pill.tsx";
import { useApprovals } from "./use-approvals.ts";

export interface OsWindowLabels extends OsPaneLabels {
  /* The window's own name in its title bar: « Votre second cerveau ». */
  title: string;
  /* Whose system and when: « Votre entreprise · lundi 08:04 ». */
  context: string;
  /* The honest pill in the corner: « Prototype ». */
  note: string;
  /* The sidebar's name for assistive technology. */
  nav: string;
  /* Read with a view's count of waiting decisions: « à décider ». */
  pending: string;
  ask: OsAskLabels;
}

interface OsWindowProps {
  views: readonly OsView[];
  decisions: readonly OsDecision[];
  questions: readonly OsQuestion[];
  /* The answer when no question matches. */
  fallback: OsQuestion;
  labels: OsWindowLabels;
}

interface OsNavTabProps {
  view: OsView;
  pending: number;
  pendingLabel: string;
}

function OsNavTab({ view, pending, pendingLabel }: OsNavTabProps) {
  return (
    <Tabs.Tab
      value={view.area}
      className="flex shrink-0 cursor-pointer items-center gap-2 px-3 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/45 focus-visible:outline-none data-active:bg-surface data-active:font-medium data-active:text-foreground md:w-full"
    >
      <span>{view.label}</span>
      {pending === 0 ? null : (
        <span className="ms-auto inline-grid size-5 shrink-0 place-items-center rounded-full bg-agents-wait-tint text-xs font-medium text-agents-wait">
          <span aria-hidden>{pending}</span>
          <span className="sr-only">
            {pending} {pendingLabel}
          </span>
        </span>
      )}
    </Tabs.Tab>
  );
}

/* The owner's single screen, a navigable prototype: plain-word views in the sidebar, the figures and the journal
   behind each, the decisions that wait on the owner, and a question bar the system answers. Everything is scripted
   in the page; nothing leaves it. */
export function OsWindow({ views, decisions, questions, fallback, labels }: OsWindowProps) {
  const [approved, approve] = useApprovals();
  return (
    <MockWindow
      title={labels.title}
      context={labels.context}
      status={<StatusPill tone="neutral">{labels.note}</StatusPill>}
    >
      <Tabs.Root data-slot="os-window" defaultValue={views.at(0)?.area}>
        <div className="grid grid-cols-1 md:grid-cols-4">
          <Tabs.List
            aria-label={labels.nav}
            className="flex gap-1 overflow-x-auto border-b border-agents-line bg-agents-paper p-2 md:flex-col md:justify-start md:border-e md:border-b-0 md:p-3"
          >
            {views.map((view) => (
              <OsNavTab
                key={view.area}
                view={view}
                pending={pendingOf(view.area, decisions, approved)}
                pendingLabel={labels.pending}
              />
            ))}
          </Tabs.List>
          <div className="flex min-w-0 flex-col md:col-span-3">
            {views.map((view) => (
              <Tabs.Panel key={view.area} value={view.area} className="os-pane-fit">
                <OsViewPane
                  view={view}
                  decisions={decisions}
                  approved={approved}
                  onApprove={approve}
                  labels={labels}
                />
              </Tabs.Panel>
            ))}
            <OsAsk questions={questions} fallback={fallback} labels={labels.ask} />
          </div>
        </div>
      </Tabs.Root>
    </MockWindow>
  );
}
