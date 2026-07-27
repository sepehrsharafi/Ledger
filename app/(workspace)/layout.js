import WorkspaceShell from "@/components/WorkspaceShell";
import { PageActionProvider } from "@/context/PageAction";
import { RouteTransitionProvider } from "@/context/RouteTransition";

export default function WorkspaceLayout({ children }) {
  return (
    <RouteTransitionProvider>
      <PageActionProvider>
        <WorkspaceShell>{children}</WorkspaceShell>
      </PageActionProvider>
    </RouteTransitionProvider>
  );
}
