import { ProposalCard } from "@repo/ui/brand/proposal-card";
import { Grid } from "@repo/ui/layout/grid";
import Link from "next/link";

import type { Proposal } from "./proposals";

interface ProposalsGridProps {
  items: Proposal[];
  columns: "2" | "3";
}

export function ProposalsGrid({ items, columns }: ProposalsGridProps) {
  return (
    <Grid as="ul" columns={columns} from="lg" gap="none">
      {items.map((proposal) => (
        <li key={proposal.direction}>
          <ProposalCard
            direction={proposal.direction}
            index={proposal.index}
            name={proposal.name}
            tagline={proposal.tagline}
            technique={proposal.technique}
            action="Voir la proposition"
            render={<Link href={proposal.href} />}
          />
        </li>
      ))}
    </Grid>
  );
}
