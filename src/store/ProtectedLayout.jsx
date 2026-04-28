import { useMemo, useState } from "react";
import {
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Cookies from "js-cookie";
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const navSections = [
  {
    title: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, accent: "from-teal-500 to-cyan-500" }],
  },
  {
    title: "Lead Suite",
    items: [
      { to: "/leads", label: "Lead Table", icon: Users, accent: "from-emerald-500 to-teal-500" },
      { to: "/summary", label: "Lead Summary", icon: BarChart3, accent: "from-amber-500 to-orange-500" },
    ],
  },
  {
    title: "Mail Suite",
    items: [
      { to: "/mails", label: "Mail Table", icon: Mail, accent: "from-sky-500 to-blue-500" },
      { to: "/mail-summary", label: "Mail Summary", icon: Sparkles, accent: "from-indigo-500 to-sky-500" },
    ],
  },
];

const navItems = navSections.flatMap((section) => section.items);

export default function ProtectedLayout() {
  const token = Cookies.get("token");
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageMeta = useMemo(() => {
    const activeItem = navItems.find((item) =>
      location.pathname.startsWith(item.to)
    );

    const subtitleMap = {
      "/dashboard": "Switch between lead and mail intelligence in one polished overview.",
      "/leads": "Review, filter, and progress active lead records with clarity.",
      "/summary": "A sharper visual breakdown of lead movement across the funnel.",
      "/mails": "Manage outreach records, imports, and follow-up signals in one table.",
      "/mail-summary": "A cleaner view of mail performance, delivery health, and volume trends.",
    };

    return {
      title: activeItem?.label || "CRM Workspace",
      subtitle: subtitleMap[activeItem?.to] || "Clean workspace for fast review and action.",
    };
  }, [location.pathname]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    Cookies.remove("token");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen p-3 md:p-4">
      <div className="crm-panel relative min-h-[calc(100vh-1.5rem)] overflow-hidden md:min-h-[calc(100vh-2rem)]">
        <div className="absolute inset-0 crm-mesh opacity-30" />

        <div className="relative flex min-h-[calc(100vh-1.5rem)] md:min-h-[calc(100vh-2rem)]">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
            className="absolute left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-700 shadow-sm md:hidden"
          >
            <Menu size={18} />
          </button>

          {sidebarOpen && (
            <button
              type="button"
              aria-label="Close navigation overlay"
              className="absolute inset-0 z-30 bg-slate-950/35 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <aside
            className={`absolute inset-y-0 left-0 z-40 flex w-[292px] flex-col border-r border-white/10 bg-[linear-gradient(180deg,#111923_0%,#182534_52%,#101720_100%)] px-5 py-6 text-white transition-transform duration-300 md:static md:translate-x-0 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/75">
                  Eximinq
                </p>
                <h1 className="mt-2 text-2xl font-bold">CRM Portal</h1>
                <p className="mt-2 max-w-[210px] text-sm text-slate-300">
                  Unified outreach, mail intelligence, and lead execution.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setSidebarOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 md:hidden"
              >
                <ChevronLeft size={18} />
              </button>
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Today</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-orange-400" />
              </div>
            </div>

            <nav className="mt-6 flex-1 space-y-5 overflow-auto pr-1">
              {navSections.map((section) => (
                <div key={section.title}>
                  <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                    {section.title}
                  </p>
                  <div className="space-y-2">
                    {section.items.map(({ to, label, icon: Icon, accent }) => (
                      <NavLink
                        key={to}
                        to={to}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          [
                            "group flex items-center justify-between rounded-[22px] px-4 py-3.5 text-sm transition-all duration-300",
                            isActive
                              ? "bg-white text-slate-900 shadow-[0_18px_38px_rgba(0,0,0,0.18)]"
                              : "text-slate-300 hover:bg-white/8 hover:text-white",
                          ].join(" ")
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span className="flex items-center gap-3">
                              <span
                                className={[
                                  "inline-flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300",
                                  isActive
                                    ? `bg-gradient-to-br ${accent} text-white shadow-[0_12px_26px_rgba(15,23,42,0.18)]`
                                    : "bg-white/8 text-slate-300 group-hover:bg-white/12 group-hover:text-white",
                                ].join(" ")}
                              >
                                <Icon size={18} />
                              </span>
                              <span>
                                <span className="block font-semibold">{label}</span>
                                <span className="block text-xs text-slate-400 group-hover:text-slate-300">
                                  {to.includes("summary") ? "Insights" : "Workspace"}
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
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <Button
              type="button"
              variant="secondary"
              onClick={handleLogout}
              className="mt-4 w-full justify-start rounded-2xl border-0 bg-white/10 text-white hover:bg-white/20"
            >
              <LogOut size={16} />
              Log out
            </Button>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="border-b border-slate-200/70 bg-white/55 px-4 pb-4 pt-16 backdrop-blur md:px-6 md:pt-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                    Workspace
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    {pageMeta.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{pageMeta.subtitle}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative w-full sm:w-72">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <Input
                      aria-label="Search workspace"
                      placeholder="Search"
                      className="h-11 rounded-xl border-white/70 bg-white/90 pl-9 text-slate-700 shadow-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl border-white/70 bg-white/80 text-slate-700 hover:bg-white"
                    onClick={() => navigate("/leads")}
                  >
                    <Users size={16} />
                    Leads
                  </Button>
                  <button
                    type="button"
                    aria-label="Notifications"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/70 bg-white/85 text-slate-700 shadow-sm"
                  >
                    <Bell size={18} />
                  </button>
                </div>
              </div>
            </header>

            <main className="min-w-0 flex-1 overflow-auto px-4 py-4 md:px-6 md:py-6">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
