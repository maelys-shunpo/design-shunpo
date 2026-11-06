import { Chapter } from "@repo/ui/origami/chapter";
import { Emphasis } from "@repo/ui/origami/emphasis";
import { ScopeList } from "@repo/ui/origami/scope-list";
import { Heading } from "@repo/ui/typography/heading";
import { Text } from "@repo/ui/typography/text";

import { flightChapter, flockChapter, pieceChapters, sheetChapter } from "./chapters";
import { HeroChapter } from "./hero-chapter";
import { type Plate, Still } from "./stills";

const piecePlates: Plate[] = ["crane", "masu", "boat"];

/* Seven windows of scroll, one per shot of the studio: the hero, the sheet, the flight, the three pieces and
   the flock. */
export function JourneyChapters() {
  return (
    <>
      <HeroChapter />
      <Chapter
        index={sheetChapter.index}
        title={<Heading level={2}>{sheetChapter.title}</Heading>}
        still={<Still plate="plane" />}
      >
        <Text size="lg" tone="muted">
          {sheetChapter.body}
        </Text>
      </Chapter>
      <Chapter
        index={flightChapter.index}
        title={
          <Heading level={2}>
            {flightChapter.title} <Emphasis>{flightChapter.emphasis}</Emphasis>
          </Heading>
        }
      >
        <Text size="lg" tone="muted">
          {flightChapter.body}
        </Text>
      </Chapter>
      {pieceChapters.map(({ expertise, piece }, order) => (
        <Chapter
          key={expertise.id}
          id={order === 0 ? "expertises" : undefined}
          index={`${expertise.index} · ${piece}`}
          still={<Still plate={piecePlates[order] ?? "crane"} />}
          title={<Heading level={2}>{expertise.title}</Heading>}
        >
          <Heading level={3} size="title-sm">
            <Emphasis>{expertise.outcome}</Emphasis>
          </Heading>
          <Text tone="muted">{expertise.detail}</Text>
          <ScopeList
            label={`Ce que couvre l’expertise ${expertise.index}`}
            items={expertise.scope}
          />
        </Chapter>
      ))}
      <Chapter
        index={flockChapter.index}
        still={<Still plate="flock" />}
        title={
          <Heading level={2}>
            {flockChapter.title} <Emphasis>{flockChapter.emphasis}</Emphasis>
          </Heading>
        }
      >
        <Text size="lg" tone="muted">
          {flockChapter.body}
        </Text>
      </Chapter>
    </>
  );
}
