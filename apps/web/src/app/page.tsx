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
        <ProposalsGrid />
      </main>
      <ProposalsFooter />
    </>
  );
}
