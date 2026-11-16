import { firstSeries, proposals } from "@/features/proposals/proposals";
import { ProposalsFirstSeries } from "@/features/proposals/proposals-first-series";
import { ProposalsFooter } from "@/features/proposals/proposals-footer";
import { ProposalsGrid } from "@/features/proposals/proposals-grid";
import { ProposalsHeader } from "@/features/proposals/proposals-header";
import { ProposalsIntro } from "@/features/proposals/proposals-intro";

export default function HomePage() {
  return (
    <>
      <ProposalsHeader />
      <main>
        <ProposalsIntro />
        <ProposalsGrid items={proposals} columns="2" />
        <ProposalsFirstSeries />
        <ProposalsGrid items={firstSeries} columns="3" />
      </main>
      <ProposalsFooter />
    </>
  );
}
