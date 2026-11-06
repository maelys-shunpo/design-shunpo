import { ProposalCard } from "@repo/ui/brand/proposal-card";
import { Grid } from "@repo/ui/layout/grid";
import Link from "next/link";

import { proposals } from "./proposals";

export function ProposalsGrid() {
  return (
    <Grid as="ul" columns="3" from="lg" gap="none">
      {proposals.map((proposal) => (
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
