import { type LiveStep, liveAttributes } from "./live.ts";

interface EmailDraftProps extends LiveStep {
  to: string;
  subject: string;
  body: string;
  /* The step at which the body types in. */
  typeStep?: number | undefined;
  sendLabel: string;
}

/* A message the agent drafted for a person to send: recipient, subject, body, and the send button left to them. */
export function EmailDraft({
  to,
  subject,
  body,
  typeStep,
  sendLabel,
  live,
  liveKind,
}: EmailDraftProps) {
  return (
    <div
      data-slot="email-draft"
      {...liveAttributes({ live, liveKind })}
      className="flex flex-col gap-3 rounded-lg border border-agents-line bg-surface p-4"
    >
      <dl className="flex flex-col gap-1 text-xs">
        <div className="flex gap-2">
          <dt className="text-muted-foreground">À</dt>
          <dd>{to}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted-foreground">Objet</dt>
          <dd className="font-medium">{subject}</dd>
        </div>
      </dl>
      <p
        {...liveAttributes({ live: typeStep, liveKind: "type" })}
        className="text-sm whitespace-pre-line"
      >
        {body}
      </p>
      <span
        aria-hidden
        className="inline-flex h-8 items-center self-end rounded-md bg-agents-ink px-3 text-xs font-medium text-agents-paper"
      >
        {sendLabel}
      </span>
    </div>
  );
}
