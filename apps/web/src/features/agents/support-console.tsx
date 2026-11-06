import { ChatBubble } from "@repo/ui/agents/chat-bubble";
import { MockPane } from "@repo/ui/agents/mock-pane";
import { MockWindow } from "@repo/ui/agents/mock-window";
import { SourceChip } from "@repo/ui/agents/source-chip";
import { StatusPill } from "@repo/ui/agents/status-pill";
import { ToolCall } from "@repo/ui/agents/tool-call";
import { TypingDots } from "@repo/ui/agents/typing-dots";
import { siGmail, siShopify } from "simple-icons";

/* What the agent does while it answers: the order, the carrier, the e-mail, and the rule it would not cross. */
function SupportActions() {
  return (
    <MockPane title="Actions de l’agent" meta="3 outils" from="md">
      <ToolCall
        icon={siShopify}
        tool="Shopify"
        action="Lire la commande 10482"
        live={3}
        progressStep={3}
        result="Expédiée le 03/11 · 2 colis"
      />
      <ToolCall
        tool="Transporteur"
        action="Demander une relivraison express"
        live={4}
        progressStep={4}
        result="Créneau confirmé : vendredi, 8 h à 13 h"
      />
      <ToolCall
        icon={siGmail}
        tool="Gmail"
        action="Envoyer le nouveau suivi"
        live={8}
        progressStep={8}
        result="Envoyé à ines.r@exemple.fr"
      />
      <StatusPill tone="done" live={9}>
        Résolue sans escalade · 48 s
      </StatusPill>
      <StatusPill tone="waiting">
        Règle : remboursement au-delà de 150 €, transfert à l’équipe
      </StatusPill>
    </MockPane>
  );
}

/* A customer-service agent: it answers from the shop's own data, cites its sources and acts in the tools. */
export function SupportConsole() {
  return (
    <MockWindow
      title="Agent support"
      context="Service client · boutique en ligne"
      layout="split"
      status={<StatusPill tone="done">En ligne</StatusPill>}
    >
      <MockPane title="Conversation" meta="#10482" tone="white">
        <ChatBubble from="customer" author="Inès R." time="14:02" live={1}>
          Bonjour, ma commande 10482 devait arriver hier et le suivi ne bouge plus. Je peux être
          livrée avant samedi ?
        </ChatBubble>
        <TypingDots label="L’agent consulte la commande" live={2} />
        <ChatBubble
          from="agent"
          author="Agent support"
          time="14:02"
          live={5}
          typeStep={6}
          sources={
            <>
              <SourceChip index={1} label="Suivi transporteur" live={7} />
              <SourceChip index={2} label="Conditions de livraison" live={7} />
            </>
          }
        >
          Bonjour Inès. Votre colis attend au dépôt de Vénissieux depuis mardi. J’ai demandé une
          relivraison express : il arrive vendredi avant 13 h. Le nouveau suivi part par e-mail.
        </ChatBubble>
      </MockPane>
      <SupportActions />
    </MockWindow>
  );
}
