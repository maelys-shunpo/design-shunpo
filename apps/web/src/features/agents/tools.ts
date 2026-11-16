import type { ToolColumns } from "@repo/ui/agents/tool-hub";
import type { ToolMark } from "@repo/ui/agents/tool-hub-layout";
import {
  siBrevo,
  siGmail,
  siGooglecalendar,
  siGooglesheets,
  siHubspot,
  siNotion,
  siOdoo,
  siSage,
  siShopify,
  siStripe,
  siZendesk,
} from "simple-icons";

/* simple-icons names it in English; the page is in French. */
const googleAgenda: ToolMark = { ...siGooglecalendar, title: "Google Agenda" };

/* The visitor's own software: an empty dashed slot on a dashed wire until a connector is built for it. */
const yourTool: ToolMark = {
  slug: "votre-logiciel",
  title: "Votre logiciel",
  hex: "1E2629",
  path: "M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z",
  yours: true,
};

/* The tools down each arc of the wide hub, six a side, top to bottom; the visitor's own software last on the right.
   A small company's stack reads as a whole: a mailbox, a shop, payments, support, a calendar, a mailing tool on the
   left; an ERP, accounting, a sheet, notes, a CRM on the right. Logos from simple-icons (CC0). */
export const deskColumns: ToolColumns = {
  left: [siGmail, siShopify, siStripe, siZendesk, googleAgenda, siBrevo],
  right: [siOdoo, siSage, siGooglesheets, siNotion, siHubspot, yourTool],
};

/* The phone hub carries fewer, four a side, the owner's own software last. */
export const phoneColumns: ToolColumns = {
  left: [siGmail, siShopify, siStripe, googleAgenda],
  right: [siOdoo, siSage, siGooglesheets, yourTool],
};
