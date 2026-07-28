import { Suspense } from "react";
import { PanelsSkeleton } from "@/components/Skeleton";
import CalendarScreen from "@/components/project-modules/CalendarScreen";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
} from "@/lib/actions/calendar";
import { getProjectCalendar } from "@/lib/data";

export default function ProjectCalendarRoute({ params }) {
  return (
    <Suspense fallback={<PanelsSkeleton panels={1} rows={6} />}>
      <Calendar params={params} />
    </Suspense>
  );
}

async function Calendar({ params }) {
  const { projectId } = await params;
  const { project, events, teamMembers } = await getProjectCalendar(projectId);

  return (
    <CalendarScreen
      bundle={{ project, events }}
      store={{ teamMembers }}
      onCreateEvent={createCalendarEvent}
      onUpdateEvent={updateCalendarEvent.bind(null, projectId)}
      onDeleteEvent={deleteCalendarEvent.bind(null, projectId)}
    />
  );
}
