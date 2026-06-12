"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { useAppContext } from "@/context/AppContext";
import { useShellData } from "@/lib/useLedgerData";
import { cn } from "@/lib/utils";
import {
  BellIcon,
  ChevronDownIcon,
  NavIcon,
} from "@/components/dashboard/DashboardIcons";

const projectNav = [
  { href: "", label: "Overview", icon: "overview" },
  { href: "/leads", label: "Leads", icon: "leads" },
  { href: "/campaigns", label: "Campaigns", icon: "campaigns" },
  { href: "/calendar", label: "Content Calendar", icon: "calendar" },
  { href: "/tasks", label: "Tasks", icon: "tasks" },
  { href: "/team", label: "Team", icon: "team" },
  { href: "/approvals", label: "Approvals", icon: "approvals" },
  { href: "/reports", label: "Reports", icon: "reports" },
];

const manageNav = [
  { href: "/projects", label: "Projects", icon: "projects" },
  { href: "/settings", label: "Settings", icon: "settings", adminOnly: true },
];

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

function NavItem({ href, label, icon, active, onNavigate }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3.5 py-3 text-[15px] font-semibold transition duration-200",
        active
          ? "bg-[#EEF4FF] text-ledger-blue"
          : "text-[#23314f] hover:bg-[#F6F9FF]",
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center",
          active
            ? "text-ledger-blue"
            : "text-[#8FA0BE] group-hover:text-[#5E6E90]",
        )}
      >
        <NavIcon name={icon} className="h-[18px] w-[18px]" />
      </span>
      <span className={`${active && `text-ledger-blue`}`}>{label}</span>
    </Link>
  );
}

function SidebarSection({ title, items, onNavigate }) {
  return (
    <div>
      <div className="mb-3 px-3 text-[12px] font-bold uppercase tracking-[0.16em] text-[#8FA0BE]">
        {title}
      </div>
      <div className="space-y-1.5">
        {items.map((item) => (
          <NavItem
            key={`${item.href}-${item.label}`}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={item.active}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

export default function AppShell({
  title,
  subtitle,
  actions,
  children,
  project,
  projectSection,
  hidePageHeading = false,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isStoreHydrated, logout, viewerRole } = useAppContext();
  const { projects, teamMembers, unreadCount } = useShellData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const projectMenuRef = useRef(null);

  const isProjectsHub = pathname === "/projects";
  const currentSearchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const queryProjectId = currentSearchParams.get("project");
  const currentProject = isProjectsHub
    ? null
    : project ||
      projects.find((item) => item.id === queryProjectId) ||
      null;
  const userProfile =
    teamMembers.find((member) => member.name === "Alex Morgan") ||
    teamMembers[0];
  const userInitials = initials(userProfile?.name || "Alex Morgan");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (
        projectMenuRef.current &&
        !projectMenuRef.current.contains(event.target)
      ) {
        setProjectMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  if (!isStoreHydrated) {
    return null;
  }

  const overviewLinks = currentProject
    ? projectNav
        .filter((item) => !(viewerRole === "Member" && item.adminOnly))
        .map((item) => ({
          ...item,
          href: `/projects/${currentProject.id}${item.href}`,
          active: projectSection === item.label,
        }))
    : isProjectsHub
      ? []
      : [
          {
            href: "/projects",
            label: "Projects Hub",
            icon: "projects",
            active: pathname === "/projects",
          },
        ];

  const projectQuerySuffix = currentProject
    ? `?project=${currentProject.id}`
    : "";
  const manageLinks = manageNav
    .filter((item) => !(viewerRole === "Member" && item.adminOnly))
    .map((item) => {
      const href =
        item.label === "Settings"
          ? `/settings${currentProject ? `?project=${currentProject.id}` : ""}`
          : `${item.href}${item.href === "/settings" ? "" : projectQuerySuffix}`;

      const active =
        item.label === "Settings" ? pathname === "/settings" : pathname === item.href;

      return { ...item, href, active };
    });

  const otherProjects = projects.filter(
    (item) => item.id !== currentProject?.id,
  );

  return (
    <div className="min-h-screen bg-[#FBFDFF] text-ledger-ink">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-[#E6EDF8] bg-white px-4 py-5 transition-transform duration-300 xl:translate-x-0",
            mobileNavOpen
              ? "translate-x-0 shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
              : "-translate-x-full xl:translate-x-0",
          )}
        >
          <div className="flex items-center justify-between px-2">
            <Logo />
            <button
              onClick={() => setMobileNavOpen(false)}
              className="rounded-[12px] p-2 text-slate-400 xl:hidden"
            >
              <svg
                viewBox="0 0 20 20"
                className="h-5 w-5 fill-none stroke-current stroke-2"
              >
                <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {!isProjectsHub ? (
            <div ref={projectMenuRef} className="relative mt-8">
              <button
                className="ledger-surface flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left"
                onClick={() => {
                  if (currentProject) {
                    setProjectMenuOpen((current) => !current);
                  } else {
                    router.push("/projects");
                  }
                }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-ledger-blue text-sm font-bold text-white">
                  {currentProject ? initials(currentProject.name) : "PR"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-semibold text-ledger-ink">
                    {currentProject?.name || "Project Workspace"}
                  </div>
                  {!currentProject ? (
                    <div className="mt-0.5 text-[12px] text-[#8FA0BE]">
                      Choose a project to continue
                    </div>
                  ) : null}
                </div>
                <ChevronDownIcon
                  className={cn(
                    "h-4 w-4 text-[#8FA0BE] transition",
                    projectMenuOpen ? "rotate-180" : "",
                  )}
                />
              </button>

              {currentProject && projectMenuOpen ? (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-[16px] border border-[#E3EBF7] bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                  <button
                    onClick={() => {
                      router.push("/projects");
                      setProjectMenuOpen(false);
                      setMobileNavOpen(false);
                    }}
                    className="flex w-full items-center rounded-[12px] px-3 py-2.5 text-left text-[14px] font-semibold text-[#23314F] transition hover:bg-[#F6F9FF]"
                  >
                    All Projects
                  </button>
                  {otherProjects.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        router.push(`/projects/${item.id}`);
                        setProjectMenuOpen(false);
                        setMobileNavOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition hover:bg-[#F6F9FF]"
                    >
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[12px] font-bold text-white"
                        style={{
                          backgroundColor: item.brandPrimary || "#2B58E8",
                        }}
                      >
                        {initials(item.name)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-[#23314F]">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="ledger-scrollbar mt-8 flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto pr-1">
            {overviewLinks.length ? (
              <SidebarSection
                title="Main"
                items={overviewLinks}
                onNavigate={() => setMobileNavOpen(false)}
              />
            ) : null}
            <SidebarSection
              title="Manage"
              items={manageLinks}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </div>

        </aside>

        <div className="flex min-h-screen w-full flex-col xl:pl-[248px]">
          <header className="sticky top-0 z-30 border-b border-[#E6EDF8] bg-white/95 backdrop-blur">
            <div className="flex items-center gap-4 px-4 py-4 sm:px-6 xl:px-7">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="rounded-[14px] border border-[#E3EBF7] bg-white p-3 text-slate-600 xl:hidden"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-none stroke-current stroke-2"
                >
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </svg>
              </button>

              <div className="ml-auto flex items-center gap-3">
                <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#60708F] transition hover:bg-[#F4F7FF] hover:text-ledger-blue">
                  <BellIcon className="h-5 w-5" />
                  <span className="absolute right-0 top-0 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ledger-blue px-1 text-[11px] font-bold text-white">
                    {unreadCount}
                  </span>
                </button>

                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setMenuOpen((current) => !current)}
                    className="flex items-center gap-3 rounded-[16px] px-1.5 py-1.5 transition hover:bg-[#F8FAFF]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#E8EEF8] text-sm font-bold text-white">
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1F2937] to-[#71533B]">
                        {userInitials}
                      </div>
                    </div>
                    <div className="hidden text-left sm:block">
                      <div className="text-[15px] font-bold tracking-[-0.02em] text-ledger-ink">
                        {userProfile?.name || "Alex Morgan"}
                      </div>
                      <div className="mt-0.5 text-[13px] font-medium text-[#7F8EAB]">
                        {viewerRole}
                      </div>
                    </div>
                    <ChevronDownIcon
                      className={cn(
                        "hidden h-4 w-4 text-[#8FA0BE] sm:block",
                        menuOpen ? "rotate-180" : "",
                      )}
                    />
                  </button>

                  {menuOpen ? (
                    <div className="absolute right-0 top-14 w-52 rounded-[16px] border border-[#E4EBF7] bg-white p-2 shadow-[0_18px_36px_rgba(15,23,42,0.08)]">
                      <button
                        onClick={() => {
                          logout();
                          setMenuOpen(false);
                          router.replace("/login");
                        }}
                        className="w-full rounded-[12px] px-3 py-2.5 text-left text-[14px] font-semibold text-[#23314F] transition hover:bg-[#F6F9FF]"
                      >
                        Logout
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 xl:px-7">
            {!hidePageHeading ? (
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-[30px] font-bold tracking-[-0.02em] text-ledger-ink">
                    {title}
                  </h1>
                  {subtitle ? (
                    <p className="mt-1.5 text-[16px] text-[#6E7F9F]">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
                {actions ? (
                  <div className="flex flex-wrap items-center gap-3">
                    {actions}
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className={hidePageHeading ? "" : "mt-5"}>{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
