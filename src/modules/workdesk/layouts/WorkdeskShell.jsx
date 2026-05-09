import { NavLink, Outlet } from "react-router-dom";

import { workdeskLogoutApi } from "@/api/workdeskAuth.api";

export default function WorkdeskShell() {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-blue-400">
            EXIMINQ<span className="text-white">DESK</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Workdesk Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarLink to="/workdesk/dashboard" label="Dashboard" />
          <SidebarLink to="/workdesk/tasks" label="Work Desk" />
          <SidebarLink to="/workdesk/invoices" label="Invoice Management" />
          <SidebarLink to="/workdesk/directory" label="Client & CHA" />
          <SidebarLink to="/workdesk/settings" label="Settings" />
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={async () => {
              try {
                await workdeskLogoutApi();
              } finally {
                window.location.href = "/workdesk-login";
              }
            }}
            className="w-full text-left text-sm text-red-400 hover:text-red-300"
          >
            Back to CRM
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

function SidebarLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-4 py-3 rounded-lg text-sm font-medium transition ${
          isActive
            ? "bg-blue-600 text-white"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
