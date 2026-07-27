import WorkspaceShell from "@/components/WorkspaceShell";
import { RouteTransitionProvider } from "@/context/RouteTransition";

export default function WorkspaceLayout({ children }) {
  return (
    <RouteTransitionProvider>
      <WorkspaceShell>{children}</WorkspaceShell>
    </RouteTransitionProvider>
  );
}
