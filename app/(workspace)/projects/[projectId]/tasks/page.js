import { Suspense } from "react";
import { BoardSkeleton } from "@/components/Skeleton";
import TasksScreen from "@/components/project-modules/TasksScreen";
import { createTask, deleteTask, moveTask, updateTask } from "@/lib/actions/tasks";
import { getProjectTasks } from "@/lib/data";

/**
 * The route body itself must never `await` — that is what keeps the navigation
 * instant. It returns the board's skeleton synchronously and lets `TaskBoard`
 * stream in behind the Suspense boundary once Postgres answers. `params` is a
 * promise, so it is passed down rather than awaited here.
 */
export default function ProjectTasksRoute({ params }) {
  return (
    <Suspense fallback={<BoardSkeleton />}>
      <TaskBoard params={params} />
    </Suspense>
  );
}

async function TaskBoard({ params }) {
  const { projectId } = await params;
  const { project, tasks, teamMembers } = await getProjectTasks(projectId);

  return (
    <TasksScreen
      bundle={{ project, tasks }}
      store={{ teamMembers }}
      onCreateTask={createTask}
      onUpdateTask={updateTask.bind(null, projectId)}
      onDeleteTask={deleteTask.bind(null, projectId)}
      onMoveTask={moveTask.bind(null, projectId)}
    />
  );
}
