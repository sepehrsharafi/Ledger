"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ProjectFormModal from "@/components/ProjectFormModal";
import { CardGridSkeleton } from "@/components/Skeleton";
import { Pill } from "@/components/ui";
import { usePageAction } from "@/context/PageAction";
import { useRouteTransition } from "@/context/RouteTransition";
import { useProjectsHubData } from "@/lib/useLedgerData";

function ProjectCard({ project, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col border border-line bg-white text-left transition-colors hover:border-ink"
    >
      <span className="h-[3px] w-full" style={{ backgroundColor: project.brandPrimary }} />
      <span className="flex flex-1 flex-col p-5">
        <span className="flex items-start justify-between gap-4">
          <span className="min-w-0">
            <span className="display block truncate text-[21px] text-ink">
              {project.name}
            </span>
            <span className="label mt-1.5 block truncate">{project.clientName}</span>
          </span>
          <Pill tone={project.status}>{project.status}</Pill>
        </span>

        <span className="mt-4 block text-[13px] text-ink-soft">{project.type}</span>

        <span className="grid-hairline mt-5 grid grid-cols-2 border border-line">
          <span className="block px-3.5 py-3">
            <span className="label block">Leads</span>
            <span className="display mt-1.5 block text-[20px] text-ink">
              {project.leadCount}
            </span>
          </span>
          <span className="block px-3.5 py-3">
            <span className="label block truncate">{project.topKpiLabel}</span>
            <span className="display mt-1.5 block text-[20px] text-ink">
              {project.topKpiValue.replace("EUR", "€")}
            </span>
          </span>
        </span>

        <span className="label mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="truncate">
            {project.campaignCount} campaigns · {project.taskCount} tasks ·{" "}
            {project.teamCount} people
          </span>
          <span className="shrink-0 text-accent transition-transform group-hover:translate-x-0.5">
            Open →
          </span>
        </span>
      </span>
    </button>
  );
}

export default function ProjectsHubPage() {
  const router = useRouter();
  const { startNavigation } = useRouteTransition();
  const { addProject, projectCards, isLoading } = useProjectsHubData();
  const [modalOpen, setModalOpen] = useState(false);

  usePageAction(() => setModalOpen(true));

  function openProject(projectId) {
    const href = `/projects/${projectId}`;
    startNavigation(href);
    router.push(href);
  }

  return (
    <>
      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projectCards.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={() => openProject(project.id)}
            />
          ))}
        </div>
      )}

      <ProjectFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={async (form) => openProject(await addProject(form))}
      />
    </>
  );
}
