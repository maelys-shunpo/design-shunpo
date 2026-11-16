"use client";

import { type ComponentProps, type SyntheticEvent, useState } from "react";

import { type ActionState, AgentsAction } from "./action.tsx";
import { ChatBubble } from "./chat-bubble.tsx";
import { Chip } from "./chip.tsx";
import { answerTo, type OsQuestion } from "./os-model.ts";
import { SourceChip } from "./source-chip.tsx";
import { TextField } from "./text-field.tsx";
import { useThinking } from "./use-thinking.ts";

export interface OsAskLabels {
  /* The field's name for assistive technology. */
  label: string;
  placeholder: string;
  submit: string;
  /* The chips' list name: « Questions à essayer ». */
  suggestions: string;
  /* Who speaks in the exchange: « Vous », « L'agent ». */
  you: string;
  agent: string;
  /* The honest small print: the prototype's answers are scripted. */
  note: string;
}

interface OsAskProps {
  questions: readonly OsQuestion[];
  fallback: OsQuestion;
  labels: OsAskLabels;
}

/* The action rendered as the form's submit button; its label comes from the action's children. */
function renderAsk(props: ComponentProps<"button">) {
  return <button type="submit" {...props} />;
}

interface OsAskFormProps {
  state: ActionState;
  labels: OsAskLabels;
  onAsk: (text: string) => void;
}

function OsAskForm({ state, labels, onAsk }: OsAskFormProps) {
  const [draft, setDraft] = useState("");
  function onSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    const text = draft.trim();
    if (text === "") {
      return;
    }
    onAsk(text);
    setDraft("");
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
      <TextField
        label={labels.label}
        size="md"
        value={draft}
        placeholder={labels.placeholder}
        onChange={(event) => {
          setDraft(event.target.value);
        }}
      />
      <AgentsAction render={renderAsk} size="md" state={state}>
        {labels.submit}
      </AgentsAction>
    </form>
  );
}

function OsAskExchange({ question, labels }: { question: OsQuestion; labels: OsAskLabels }) {
  return (
    <>
      <ChatBubble from="customer" author={labels.you}>
        {question.ask}
      </ChatBubble>
      <ChatBubble
        from="agent"
        author={labels.agent}
        sources={
          question.sources.length === 0
            ? undefined
            : question.sources.map((source, index) => (
                <SourceChip key={source} index={index + 1} label={source} />
              ))
        }
      >
        {question.answer}
      </ChatBubble>
    </>
  );
}

/* The owner asks their system a question and it answers, citing its tools. Scripted, no server. */
export function OsAsk({ questions, fallback, labels }: OsAskProps) {
  const [asked, setAsked] = useState<{ question: OsQuestion; turn: number } | null>(null);
  const [state, think] = useThinking();
  function ask(text: string): void {
    think(() => {
      setAsked((previous) => ({
        question: answerTo(text, questions, fallback),
        turn: (previous?.turn ?? 0) + 1,
      }));
    });
  }
  return (
    <div
      data-slot="os-ask"
      className="flex flex-col gap-3 border-t border-agents-line bg-agents-paper p-4 md:p-5"
    >
      <OsAskForm state={state} labels={labels} onAsk={ask} />
      <ul aria-label={labels.suggestions} className="flex flex-wrap gap-2">
        {questions.map((question) => (
          <li key={question.id}>
            <Chip
              size="sm"
              type="button"
              onClick={() => {
                ask(question.ask);
              }}
            >
              {question.ask}
            </Chip>
          </li>
        ))}
      </ul>
      <output aria-live="polite" className="flex flex-col gap-3 empty:hidden">
        {asked === null ? null : (
          <OsAskExchange key={asked.turn} question={asked.question} labels={labels} />
        )}
      </output>
      <p className="text-xs text-muted-foreground">{labels.note}</p>
    </div>
  );
}
