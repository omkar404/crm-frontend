import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";

import { workdeskLogoutApi } from "@/api/workdeskAuth.api";
import { useWorkdeskAuthStore } from "@/store/workdeskAuth.store";
import { WorkdeskInput, WorkdeskPill } from "../components/WorkdeskUI.jsx";

const navSections = [
  {
    title: "Overview",
    items: [
      {
        to: "/workdesk/dashboard",
        label: "Dashboard",
        hint: "Command center",
        icon: LayoutDashboard,
        accent: "from-teal-500 via-emerald-500 to-cyan-500",
      },
      {
        to: "/workdesk/tasks",
        label: "Work Desk",
        hint: "Daily execution",
        icon: BriefcaseBusiness,
        accent: "from-sky-500 via-blue-500 to-indigo-500",
      },
      {
        to: "/workdesk/active-workflow",
        label: "Active Workflow",
        hint: "Priority tracking",
        icon: TimerReset,
        accent: "from-cyan-500 via-teal-500 to-emerald-500",
        adminOnly: true,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        to: "/workdesk/invoices",
        label: "Invoices",
        hint: "Billing flow",
        icon: Receipt,
        accent: "from-amber-500 via-orange-500 to-yellow-500",
      },
      {
        to: "/workdesk/directory",
        label: "Directory",
        hint: "Clients and CHA",
        icon: Building2,
        accent: "from-slate-700 via-slate-800 to-slate-950",
      },
      {
        to: "/workdesk/settings",
        label: "Settings",
        hint: "Service master",
        icon: Settings2,
        accent: "from-rose-500 via-orange-500 to-amber-500",
      },
    ],
  },
];

const navItems = navSections.flatMap((section) => section.items);

export default function WorkdeskShell() {
  const { pathname } = useLocation();
  const { user } = useWorkdeskAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageMeta = useMemo(() => {
    const activeItem = navItems.find((item) => pathname.startsWith(item.to));
    const subtitleMap = {
      "/workdesk/dashboard": "A premium operations overview for allocation, workload, and invoicing health.",
      "/workdesk/tasks": "Review requests, move work faster, and keep SLAs under control.",
      "/workdesk/active-workflow": "Monitor High Risk, Pendency, and Important work in a dedicated tracking workspace.",
      "/workdesk/invoices": "Track billing stages cleanly from pending invoicing through payment.",
      "/workdesk/directory": "A polished directory for clients, credentials, and CHA relationships.",
      "/workdesk/settings": "Manage service masters with a cleaner admin-ready configuration workspace.",
    };

    return {
      title: activeItem?.label || "Work Desk",
      subtitle:
        subtitleMap[activeItem?.to] ||
        "Enterprise-style workspace designed for fast, comfortable daily operations.",
    };
  }, [pathname]);

  const userRole = user?.role === "ADMIN" ? "Administrator" : "Staff Workspace";

  return (
    <div className="min-h-screen p-2 md:p-3">
      <div className="relative min-h-[calc(100vh-1rem)] overflow-hidden rounded-[28px] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.84)_0%,rgba(247,249,248,0.92)_100%)] shadow-[0_32px_100px_rgba(20,33,48,0.14)] md:min-h-[calc(100vh-1.5rem)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(10,148,136,0.16),transparent_25%),radial-gradient(circle_at_right,rgba(207,132,75,0.12),transparent_22%),linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[length:auto,auto,34px_34px,34px_34px]" />

        <div className="relative flex min-h-[calc(100vh-1.5rem)] md:min-h-[calc(100vh-2rem)]">
          <button
            type="button"
            aria-label="Open workdesk navigation"
            onClick={() => setSidebarOpen(true)}
            className="absolute left-4 top-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-700 shadow-sm md:hidden"
          >
            <Menu size={18} />
          </button>

          {sidebarOpen ? (
            <button
              type="button"
              aria-label="Close workdesk navigation overlay"
              className="absolute inset-0 z-30 bg-slate-950/35 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          ) : null}

          <aside
            className={[
              "absolute inset-y-0 left-0 z-40 flex w-[288px] flex-col border-r border-white/10 bg-[linear-gradient(180deg,#101923_0%,#152332_48%,#0d141c_100%)] px-4 py-5 text-white transition-transform duration-300 md:static md:translate-x-0 xl:w-[296px]",
              sidebarOpen ? "translate-x-0" : "-translate-x-full",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/85">
                  <Sparkles className="h-3.5 w-3.5" />
                  Eximinq
                </div>
                <h1 className="mt-3 text-[24px] font-bold leading-none">Work Desk</h1>
                <p className="mt-2 max-w-[220px] text-sm leading-5 text-slate-300">
                  Fast workspace for Admin and Staff execution.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close workdesk navigation"
                onClick={() => setSidebarOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 md:hidden"
              >
                <ChevronLeft size={18} />
              </button>
            </div>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-white/6 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Workspace Mode
                  </p>
                  <p className="mt-1.5 text-base font-semibold text-white">{userRole}</p>
                </div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-teal-400 to-emerald-500 text-slate-950 shadow-lg">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                <span>
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <WorkdeskPill tone="dark">{user?.role || "WORKDESK"}</WorkdeskPill>
              </div>
            </div>

            <nav className="mt-5 flex-1 space-y-4 overflow-auto pr-1">
              {navSections.map((section) => (
                <div key={section.title}>
                  <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                    {section.title}
                  </p>
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      item.adminOnly && user?.role !== "ADMIN" ? null : (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          [
                            "group flex items-center justify-between rounded-[22px] px-3.5 py-3 text-sm transition-all duration-300",
                            isActive
                              ? "bg-white text-slate-950 shadow-[0_20px_40px_rgba(0,0,0,0.18)]"
                              : "text-slate-300 hover:bg-white/8 hover:text-white",
                          ].join(" ")
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span className="flex items-center gap-3">
                              <span
                                className={[
                                  "inline-flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300",
                                  isActive
                                    ? `bg-gradient-to-br ${item.accent} text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)]`
                                    : "bg-white/8 text-slate-300 group-hover:bg-white/12 group-hover:text-white",
                                ].join(" ")}
                              >
                                <item.icon size={18} />
                              </span>
                              <span>
                                <span className="block font-semibold">{item.label}</span>
                                <span className="block text-xs text-slate-400 group-hover:text-slate-300">
                                  {item.hint}
                                </span>
                              </span>
                            </span>
                            <ChevronRight
                              size={16}
                              className={isActive ? "text-slate-700" : "text-slate-500"}
                            />
                          </>
                        )}
                      </NavLink>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <button
              type="button"
              onClick={async () => {
                try {
                  await workdeskLogoutApi();
                } finally {
                  window.location.href = "/workdesk-login";
                }
              }}
              className="mt-4 inline-flex w-full items-center justify-between rounded-[22px] border border-white/10 bg-white/6 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/12"
            >
              <span className="inline-flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                  <LogOut size={16} />
                </span>
                Back to CRM
              </span>
              <ChevronRight size={16} className="text-slate-400" />
            </button>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="border-b border-slate-200/70 bg-white/55 px-4 pb-3 pt-16 backdrop-blur md:px-5 md:pt-5">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Work Desk Workspace
                  </p>
                  <h2 className="mt-1.5 text-2xl font-bold tracking-[-0.04em] text-slate-950 md:text-3xl">
                    {pageMeta.title}
                  </h2>
                  <p className="mt-1 hidden max-w-2xl text-sm text-slate-600 lg:block">{pageMeta.subtitle}</p>
                </div>

                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                  <div className="relative hidden w-full sm:w-72 xl:block">
                    <Search
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <WorkdeskInput
                      aria-label="Search workdesk workspace"
                      placeholder="Search workspace"
                      className="pl-11 shadow-sm"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Notifications"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/90 text-slate-700 shadow-sm"
                    >
                      <Bell size={18} />
                    </button>

                    <div className="flex items-center gap-3 rounded-[20px] border border-white/70 bg-white/85 px-3 py-2 shadow-sm">
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 text-white">
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {user?.name || "Workdesk User"}
                        </div>
                        <div className="text-xs text-slate-500">{userRole}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <main className="min-w-0 flex-1 overflow-auto px-3 py-3 md:px-4 md:py-4 xl:px-5 xl:py-5">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
