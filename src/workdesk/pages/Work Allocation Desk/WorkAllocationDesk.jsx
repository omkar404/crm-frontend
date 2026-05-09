import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Mail, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

import { getClients } from "@/api/workdeskAuth.api";
import { getWorkdeskMetaApi, getWorkdeskTaskApi, getWorkdeskTasksApi } from "@/api/workdesk.api";
import { useWorkdeskAuthStore } from "@/store/workdeskAuth.store";
import { errorToast } from "@/utils/customToast";
import { getApiErrorMessage } from "@/utils/apiError";

import AllocateWorkModal from "./AllocateWorkModal";
import TaskManageDrawer from "./TaskManageDrawer";

function getSLA(task) {
  const deadline = new Date(task.deadline).getTime();
  const now = Date.now();
  const diffHours = Math.ceil((deadline - now) / (1000 * 60 * 60));
  const completed = ["Invoice Paid", "Approved"].includes(task.status);

  return {
    diffHours,
    overdue: diffHours < 0 && !completed,
    completed,
  };
}

function StatusAndSLA({ task }) {
  const sla = getSLA(task);

  if (sla.completed) {
    return (
      <div className="text-green-700 text-xs font-bold flex items-center">
        <CheckCircle2 className="w-4 h-4 mr-1" /> Completed
      </div>
    );
  }

  if (sla.overdue) {
    return (
      <div className="text-red-600 text-xs font-bold flex items-center">
        <AlertCircle className="w-4 h-4 mr-1" /> Overdue ({Math.abs(sla.diffHours)}h)
      </div>
    );
  }

  return (
    <div className="text-orange-600 text-xs font-bold flex items-center">
      <Clock className="w-4 h-4 mr-1" /> Due in {sla.diffHours}h
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "Invoice Paid": "bg-green-100 text-green-700",
    "Pending for Invoicing": "bg-yellow-100 text-yellow-700",
    "Invoice Raised": "bg-blue-100 text-blue-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || "bg-blue-100 text-blue-700"}`}>
      {status}
    </span>
  );
}

export default function WorkAllocationDesk() {
  const { user } = useWorkdeskAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const [workTab, setWorkTab] = useState("All");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("All");
  const [status, setStatus] = useState("All");
  const [activeTask, setActiveTask] = useState(null);
  const [showAllocate, setShowAllocate] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [meta, setMeta] = useState({ serviceTypes: {}, staff: [], workflowStatuses: [] });
  const [loading, setLoading] = useState(true);

  const loadReferenceData = useCallback(async () => {
    const [clientsRes, metaData] = await Promise.all([
      getClients(),
      getWorkdeskMetaApi(),
    ]);

    setClients(Array.isArray(clientsRes?.data?.data) ? clientsRes.data.data : []);
    setMeta(metaData || { serviceTypes: {}, staff: [], workflowStatuses: [] });
  }, []);

  const loadTasks = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const tasksData = await getWorkdeskTasksApi();
      setTasks(tasksData);
    } catch (error) {
      if (!silent) {
        errorToast(getApiErrorMessage(error, "Unable to load tasks."));
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await Promise.all([loadReferenceData(), loadTasks({ silent: true })]);
      } catch (error) {
        errorToast(getApiErrorMessage(error, "Unable to load work desk data."));
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [loadReferenceData, loadTasks]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadTasks({ silent: true });
      }
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadTasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const sla = getSLA(task);

      const matchSearch = [
        task.clientName,
        task.serviceRequestId,
        task.chaName,
        task.clientDisplayId,
        task.emailSender,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchSource = source === "All" || task.clientSource === source;
      const matchStatus = status === "All" || task.status === status;

      const matchWork =
        workTab === "All" ||
        (workTab === "High Risk" && sla.overdue) ||
        (workTab === "Pendency" &&
          !["Invoice Paid", "Approved"].includes(task.status));

      return matchSearch && matchSource && matchStatus && matchWork;
    });
  }, [search, source, status, workTab, tasks]);

  const openTask = async (taskId) => {
    try {
      const fullTask = await getWorkdeskTaskApi(taskId);
      setActiveTask(fullTask);
    } catch (error) {
      errorToast(getApiErrorMessage(error, "Unable to load task details."));
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen p-8">
      <div className="bg-slate-50 rounded-xl border shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-2xl font-bold text-slate-800">Work Allocation Desk</h3>

          {isAdmin ? (
            <button
              onClick={() => setShowAllocate(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm"
            >
              + Allocate Work
            </button>
          ) : null}
        </div>

        {showAllocate ? (
          <AllocateWorkModal
            clients={clients}
            staff={meta.staff}
            serviceTypes={meta.serviceTypes}
            onClose={() => setShowAllocate(false)}
            onSubmit={async () => {
              await loadTasks();
            }}
          />
        ) : null}

        <div className="bg-white rounded-xl border shadow-sm p-4 flex flex-wrap gap-4 items-center">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {["All", "High Risk", "Pendency"].map((item) => (
              <button
                key={item}
                onClick={() => setWorkTab(item)}
                className={`px-4 py-2 text-sm rounded-md font-medium ${
                  workTab === item ? "bg-white shadow text-blue-600" : "text-gray-500"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Client, SR No, Sender, CHA, Client ID..."
              className="pl-10 w-full border rounded-lg p-2 text-sm"
            />
          </div>

          <select value={source} onChange={(e) => setSource(e.target.value)} className="border rounded-lg p-2 text-sm">
            <option value="All">All Sources</option>
            <option value="Direct">Direct</option>
            <option value="CHA">CHA</option>
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-lg p-2 text-sm">
            <option value="All">All Statuses</option>
            {(meta.workflowStatuses || []).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {loading ? <div className="p-6 text-sm text-slate-500">Loading tasks...</div> : null}

          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4 text-left">SR / Client</th>
                <th className="px-6 py-4 text-left">Client / Source</th>
                <th className="px-6 py-4 text-left">Service</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Assigned</th>
                <th className="px-6 py-4 text-left">Status & SLA</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredTasks.map((task) => {
                const sla = getSLA(task);

                return (
                  <tr key={task._id} className={sla.overdue ? "bg-red-50/40" : ""}>
                    <td className="px-6 py-4">
                      <div className="font-mono text-blue-600 text-xs font-bold">{task.serviceRequestId}</div>
                      <div className="text-[10px] text-gray-500">{task.clientDisplayId}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold">{task.clientName}</div>
                      {task.clientSource === "CHA" ? (
                        <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                          via {task.chaName}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">Direct</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div>{task.serviceType}</div>
                      <div className="text-xs text-blue-600">{task.subType}</div>
                      <div className="text-[10px] text-gray-400 mt-1">Note: {task.details || "-"}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {task.emailSender || "-"}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium">{task.assignedToName}</div>
                      <div className="text-[10px] text-gray-400">{task.assignedToEmail || "-"}</div>
                    </td>

                    <td className="px-6 py-4 space-y-1">
                      <StatusBadge status={task.status} />
                      <StatusAndSLA task={task} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openTask(task._id)}
                        className="border border-blue-300 text-blue-600 px-4 py-1.5 rounded-lg text-sm hover:bg-blue-50"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })}

              {!loading && filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-400">
                    No tasks found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {activeTask ? (
          <TaskManageDrawer
            task={activeTask}
            workflowStatuses={meta.workflowStatuses}
            onClose={() => setActiveTask(null)}
            onTaskUpdated={(updatedTask) => {
              setActiveTask(updatedTask);
              setTasks((currentTasks) =>
                currentTasks.map((task) =>
                  task._id === updatedTask._id
                    ? {
                        ...task,
                        status: updatedTask.status,
                        details: updatedTask.details,
                        deadline: updatedTask.deadline,
                        assignedToName: updatedTask.assignedToName,
                        assignedToEmail: updatedTask.assignedToEmail,
                        emailSender: updatedTask.emailSender,
                      }
                    : task
                )
              );
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
