"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import Badge from "@/components/Badge";
import ProjectFormModal from "@/components/ProjectFormModal";
import { useAppContext } from "@/context/AppContext";

function StatBlock({ label, value, accent = false }) {
  return (
    <div
      className={`rounded-[18px] border px-4 py-4 ${accent ? "border-[#DCE5FB] bg-[#F6F8FF]" : "border-[#EEF2F8] bg-[#FBFCFE]"}`}
    >
      <div
        className={`text-[12px] font-semibold uppercase tracking-[0.18em] ${accent ? "text-ledger-blue" : "text-[#8FA0BE]"}`}
      >
        {label}
      </div>
      <div className="mt-3 text-[20px] font-bold tracking-[-0.03em] text-ledger-ink">
        {value}
      </div>
    </div>
  );
}

export default function ProjectsHubPage() {
  const router = useRouter();
  const { selectors, addProject } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);

  function handleCreateProject(form) {
    const newProjectId = addProject(form);
    router.push(`/projects/${newProjectId}`);
  }

  return (
    <AppShell
      title="Projects"
      subtitle="Every client workspace, organized in one place."
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="text-[14px] text-[#8A98B3]">
          Select a workspace to open its dashboard, pipeline, and delivery
          modules.
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="ledger-button ledger-button-primary min-w-[150px]"
        >
          New Project
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        {selectors.projectCards.map((project) => (
          <button
            key={project.id}
            onClick={() => router.push(`/projects/${project.id}`)}
            className="group overflow-hidden rounded-[24px] border border-[#E4EBF7] bg-white text-left shadow-[0_12px_32px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(15,23,42,0.08)]"
          >
            <div
              className="h-[10px] w-full"
              style={{
                background: `linear-gradient(90deg, ${project.brandPrimary}, ${project.brandAccent})`,
              }}
            />
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-sm font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${project.brandPrimary}, ${project.brandAccent})`,
                      }}
                    >
                      {project.name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-[27px] font-bold tracking-[-0.05em] text-ledger-ink">
                        {project.name}
                      </h2>
                      <p className="mt-1 text-[15px] text-[#64748B]">
                        {project.clientName}
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 max-w-[44ch] text-[15px] leading-7 text-[#5E6E90]">
                    {project.type}
                  </p>
                </div>
                <Badge tone={project.status}>{project.status}</Badge>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <StatBlock label="Leads" value={project.leadCount} />
                <StatBlock
                  label={project.topKpiLabel}
                  value={project.topKpiValue.replace("EUR", "EUR ")}
                  accent
                />
              </div>

              <div className="mt-5 flex items-center justify-between rounded-[18px] bg-[#F8FAFD] px-4 py-3">
                <div className="text-[13px] text-[#7E8DAA]">
                  <span className="font-semibold text-ledger-ink">
                    {project.campaignCount}
                  </span>{" "}
                  campaigns
                  <span className="mx-2 text-[#C2CCDD]">•</span>
                  <span className="font-semibold text-ledger-ink">
                    {project.taskCount}
                  </span>{" "}
                  tasks
                  <span className="mx-2 text-[#C2CCDD]">•</span>
                  <span className="font-semibold text-ledger-ink">
                    {project.teamCount}
                  </span>{" "}
                  people
                </div>
                <div className="text-[14px] font-semibold text-ledger-blue transition group-hover:translate-x-0.5">
                  Open workspace
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <ProjectFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </AppShell>
  );
}
