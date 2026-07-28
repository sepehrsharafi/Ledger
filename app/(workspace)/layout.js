import WorkspaceShell from "@/components/WorkspaceShell";
import { PageActionProvider } from "@/context/PageAction";
import { RouteTransitionProvider } from "@/context/RouteTransition";
import { getAppShell } from "@/lib/data";

export default function WorkspaceLayout({ children }) {
  // Deliberately not awaited — the chrome has to paint before its counts exist,
  // and awaiting here would block every route in the workspace. The promise is
  // handed to the client, which fills the badges in when it resolves.
  //
  // This is also what makes the badges live: a mutation that revalidates this
  // layout re-runs the fetch on the server, so a new promise reaches the client
  // and the tallies update without a reload.
  return (
    <RouteTransitionProvider>
      <PageActionProvider>
        <WorkspaceShell shellData={getAppShell()}>{children}</WorkspaceShell>
      </PageActionProvider>
    </RouteTransitionProvider>
  );
}
