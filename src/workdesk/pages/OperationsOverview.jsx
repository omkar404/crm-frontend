import { useMemo } from "react";
import {
  CalendarDays,
  ShieldAlert,
  CheckCircle2,
  BarChart3
} from "lucide-react";

export default function OperationsOverview({ tasks = [] }) {
  const now = new Date();

  const stats = useMemo(() => {
    const isToday = (d) =>
      new Date(d).toDateString() === now.toDateString();

    const isThisWeek = (d) =>
      (now - new Date(d)) / (1000 * 60 * 60 * 24) <= 7;

    const isThisMonth = (d) =>
      new Date(d).getMonth() === now.getMonth() &&
      new Date(d).getFullYear() === now.getFullYear();

    const isThisYear = (d) =>
      new Date(d).getFullYear() === now.getFullYear();

    const completedStatuses = ["INVOICE PAID", "APPROVED"];

    const active = tasks.filter(
      (t) => !completedStatuses.includes(t.status)
    );

    const completed = tasks.filter((t) =>
      completedStatuses.includes(t.status)
    );

    const highPriority = active.filter((t) => {
      const created = new Date(t.createdAt).getTime();
      const deadline =
        created + t.deadlineHours * 60 * 60 * 1000;
      return deadline < Date.now();
    });

    const staffLoad = {};
    const invoiceReady = {};

    active.forEach((t) => {
      staffLoad[t.assignedTo] =
        (staffLoad[t.assignedTo] || 0) + 1;
    });

    tasks
      .filter((t) => t.status === "Pending for Invoicing")
      .forEach((t) => {
        invoiceReady[t.assignedTo] =
          (invoiceReady[t.assignedTo] || 0) + 1;
      });

    return {
      today: tasks.filter((t) => isToday(t.createdAt)).length,
      week: tasks.filter((t) => isThisWeek(t.createdAt)).length,
      month: tasks.filter((t) => isThisMonth(t.createdAt)).length,
      year: tasks.filter((t) => isThisYear(t.createdAt)).length,
      totalActive: active.length,
      highPriority: highPriority.length,
      completed: completed.length,
      staffLoad,
      invoiceReady
    };
  }, [tasks]);

  return (
    <div className="bg-slate-100 min-h-screen p-4">

      <div className="bg-slate-50 rounded-xl border shadow-sm p-6 space-y-6">

        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-2xl font-bold text-slate-800">
            Operations Overview
          </h3>
        </div>
     

      {/* REQUEST VOLUME */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-6">
          <CalendarDays className="w-5 h-5 text-blue-600" />
          Request Volume Analytics
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Metric label="TODAY" value={stats.today} />
          <Metric label="THIS WEEK" value={stats.week} />
          <Metric label="THIS MONTH" value={stats.month} />
          <Metric label="THIS YEAR" value={stats.year} />
        </div>
      </div>

      {/* STATUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard title="TOTAL ACTIVE" value={stats.totalActive} />
        <StatusCard
          title="HIGH PRIORITY"
          value={stats.highPriority}
          danger
          icon={<ShieldAlert className="w-4 h-4" />}
        />
        <StatusCard
          title="COMPLETED"
          value={stats.completed}
          success
        />
      </div>

      {/* STAFF SECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* STAFF WORKLOAD */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-700" />
            Current Staff Workload (Active)
          </h3>

          <div className="grid grid-cols-4 gap-4 text-center">
            {["Staff A", "Staff B", "Staff C", "Staff D"].map((s) => (
              <div key={s}>
                <div className="text-xl font-bold text-blue-600">
                  {stats.staffLoad[s] || 0}
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase">
                  {s}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* READY FOR INVOICE */}
        <div className="bg-white rounded-xl border border-green-200 p-6">
          <h3 className="flex items-center gap-2 font-bold text-green-700 mb-6">
            <CheckCircle2 className="w-5 h-5" />
            Ready for Invoice (By Staff)
          </h3>

          <div className="grid grid-cols-4 gap-4 text-center">
            {["Staff A", "Staff B", "Staff C", "Staff D"].map((s) => (
              <div key={s}>
                <div className="text-xl font-bold text-green-700">
                  {stats.invoiceReady[s] || 0}
                </div>
                <div className="text-xs font-bold text-green-700 uppercase">
                  {s}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      </div>

    </div>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */

function Metric({ label, value }) {
  return (
    <div className="bg-blue-50 rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-blue-700">
        {value}
      </div>
      <div className="text-xs font-bold text-blue-600 mt-1">
        {label}
      </div>
    </div>
  );
}

function StatusCard({ title, value, danger, success, icon }) {
  return (
    <div
      className={`rounded-xl border p-6 ${
        danger
          ? "border-red-300"
          : success
          ? "border-green-300"
          : "border-gray-200"
      }`}
    >
      <div
        className={`flex items-center gap-2 text-sm font-bold ${
          danger
            ? "text-red-600"
            : success
            ? "text-green-600"
            : "text-gray-600"
        }`}
      >
        {icon}
        {title}
      </div>

      <div
        className={`text-3xl font-bold mt-2 ${
          danger
            ? "text-red-700"
            : success
            ? "text-green-700"
            : "text-gray-800"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
