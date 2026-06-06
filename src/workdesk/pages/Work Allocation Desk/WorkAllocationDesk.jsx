import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Mail,
  Search,
  ShieldAlert,
  TimerReset,
} from "lucide-react";

import { getClients } from "@/api/workdeskAuth.api";
import { getWorkdeskMetaApi, getWorkdeskTaskApi, getWorkdeskTasksApi } from "@/api/workdesk.api";
import {
  WorkdeskEmptyState,
  WorkdeskInput,
  WorkdeskPage,
  WorkdeskPill,
  WorkdeskSection,
  WorkdeskSegment,
  WorkdeskSelect,
  WorkdeskStatCard,
} from "@/modules/workdesk/components/WorkdeskUI.jsx";
import { useWorkdeskAuthStore } from "@/store/workdeskAuth.store";
import { errorToast } from "@/utils/customToast";
import { getApiErrorMessage } from "@/utils/apiError";

import AllocateWorkModal from "./AllocateWorkModal";
import TaskManageDrawer from "./TaskManageDrawer";

function getSLA(task) {
  const deadline = new Date(task.deadline).getTime();
  const now = Date.now();
  const diffHours = Math.ceil((deadline - now) / (1000 * 60 * 60));
  const completed =
    task.jobWorkStatus === "Completed" ||
    ["Pending for Invoicing", "Invoice Raised", "Invoice Paid"].includes(task.status);
  const strikeOff = task.jobWorkStatus === STRIKE_OFF_STATUS || task.status === STRIKE_OFF_STATUS;

  return {
    diffHours,
    overdue: diffHours < 0 && !completed && !strikeOff,
    completed,
    strikeOff,
  };
}

const COMPLETED_TASK_STATUSES = ["Pending for Invoicing", "Invoice Raised", "Invoice Paid"];
const STRIKE_OFF_STATUS = "Strike Off";
const DEFAULT_WORKFLOW_STATUSES = [
  "Request Initiated",
  "Quote to be Sent",
  "Quote Approval Pending",
  "Quote Approved",
  "Application Drafting in Progress",
  "Draft Sent for Approval",
  "Draft Approved",
  "Submission",
  "Official Fees Paid",
  "In Process",
  "Deficiency Raised",
  "Deficiency Query Reply Awaited from Client",
  "Deficiency Replied",
  "Approved",
  "Pending for Invoicing",
  "Invoice Raised",
  "Invoice Paid",
];

function StatusAndSLA({ task }) {
  const sla = getSLA(task);

  if (sla.strikeOff) {
    return (
      <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
        <AlertCircle className="h-4 w-4" />
        Strike Off
      </div>
    );
  }

  if (sla.completed) {
    return (
      <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-4 w-4" />
        Completed
      </div>
    );
  }

  if (sla.overdue) {
    return (
      <div className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
        <AlertCircle className="h-4 w-4" />
        Overdue by {Math.abs(sla.diffHours)}h
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
      <Clock className="h-4 w-4" />
      Due in {sla.diffHours}h
    </div>
  );
}

function StatusBadge({ status }) {
  const toneMap = {
    "Quote to be Sent": "default",
    "Quote Approval Pending": "warning",
    "Quote Approved": "info",
    "Invoice Paid": "success",
    "Pending for Invoicing": "warning",
    "Invoice Raised": "info",
    "Strike Off": "dark",
  };

  return <WorkdeskPill tone={toneMap[status] || "default"}>{status}</WorkdeskPill>;
}

function EffectiveStatusBadge({ task }) {
  const effectiveStatus =
    task.jobWorkStatus === STRIKE_OFF_STATUS ? STRIKE_OFF_STATUS : task.status;
  return <StatusBadge status={effectiveStatus} />;
}

function normalizeWorkLevel(workLevel) {
  const value = String(workLevel || "").trim().toLowerCase();
  if (value === "high risk") return "High Risk";
  if (value === "pendency") return "Pendency";
  if (value === "important") return "Important";
  return "";
}

function isCompletedTask(task) {
  return (
    task.jobWorkStatus === "Completed" ||
    COMPLETED_TASK_STATUSES.includes(task.status)
  );
}

function isStrikeOffTask(task) {
  return (
    task.jobWorkStatus === STRIKE_OFF_STATUS ||
    task.status === STRIKE_OFF_STATUS
  );
}

function WorkLevelBadge({ workLevel }) {
  if (!workLevel) return null;

  const classMap = {
    "High Risk": "border-rose-200 bg-rose-50 text-rose-700",
    Pendency: "border-amber-200 bg-amber-50 text-amber-700",
    Important: "border-sky-200 bg-sky-50 text-sky-700",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.02em]",
        classMap[workLevel] || "border-slate-200 bg-slate-50 text-slate-700",
      ].join(" ")}
    >
      {workLevel}
    </span>
  );
}

export default function WorkAllocationDesk() {
  const { user } = useWorkdeskAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const [searchParams, setSearchParams] = useSearchParams();

  const [workTab, setWorkTab] = useState("All");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("All");
  const [service, setService] = useState("All");
  const [status, setStatus] = useState("All");
  const [assignedTo, setAssignedTo] = useState("All");
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);
  const [showStrikeOffOnly, setShowStrikeOffOnly] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [showAllocate, setShowAllocate] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [meta, setMeta] = useState({ serviceTypes: {}, staff: [], workflowStatuses: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const requestedTaskId = searchParams.get("taskId");

  const loadReferenceData = useCallback(async () => {
    const [clientsRes, metaData] = await Promise.all([getClients(), getWorkdeskMetaApi()]);
    setClients(Array.isArray(clientsRes?.data?.data) ? clientsRes.data.data : []);
    setMeta(metaData || { serviceTypes: {}, staff: [], workflowStatuses: [] });
  }, []);

  const loadTasks = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const tasksData = await getWorkdeskTasksApi();
      setTasks(tasksData);
    } catch (error) {
      if (!silent) {
        errorToast(getApiErrorMessage(error, "Unable to load tasks."));
      }
    } finally {
      if (!silent) setLoading(false);
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
    const refreshTasks = () => {
      if (document.visibilityState === "visible") {
        loadTasks({ silent: true });
      }
    };

    const intervalId = window.setInterval(refreshTasks, 20000);
    window.addEventListener("focus", refreshTasks);
    document.addEventListener("visibilitychange", refreshTasks);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshTasks);
      document.removeEventListener("visibilitychange", refreshTasks);
    };
  }, [loadTasks]);

  const visibleWorkflowStatuses = useMemo(
    () => {
      const adminOnlyStatuses = isAdmin ? [STRIKE_OFF_STATUS] : [];
      return [...new Set([...(meta.workflowStatuses || []), ...DEFAULT_WORKFLOW_STATUSES, ...adminOnlyStatuses])];
    },
    [isAdmin, meta.workflowStatuses]
  );

  const serviceOptions = useMemo(() => {
    const configuredServices = Object.keys(meta.serviceTypes || {});
    const taskServices = tasks
      .map((task) => String(task.serviceType || "").trim())
      .filter(Boolean);

    return [...new Set([...configuredServices, ...taskServices])].sort((first, second) =>
      first.localeCompare(second)
    );
  }, [meta.serviceTypes, tasks]);

  const filteredTasks = useMemo(() => {
    const selectedStaff = isAdmin
      ? meta.staff.find((staff) => staff._id === assignedTo) || null
      : null;

    return tasks.filter((task) => {
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
      const matchService = service === "All" || task.serviceType === service;
      const matchStatus = status === "All" || task.status === status;
      const taskAssignedName = String(task.assignedToName || "")
        .trim()
        .toLowerCase();
      const taskAssignedEmail = String(task.assignedToEmail || "")
        .trim()
        .toLowerCase();
      const selectedStaffName = String(selectedStaff?.name || "")
        .trim()
        .toLowerCase();
      const selectedStaffEmail = String(selectedStaff?.email || "")
        .trim()
        .toLowerCase();
      const matchAssignedTo =
        !isAdmin ||
        assignedTo === "All" ||
        task.assignedToUserId === assignedTo ||
        (selectedStaff &&
          ((selectedStaffEmail && taskAssignedEmail === selectedStaffEmail) ||
            (selectedStaffName && taskAssignedName === selectedStaffName)));
      const completedTask = isCompletedTask(task);
      const strikeOffTask = isStrikeOffTask(task);
      const matchCompleted = !showCompletedOnly || completedTask;
      const matchStrikeOff =
        !showStrikeOffOnly
          ? (isAdmin ? !strikeOffTask : true)
          : strikeOffTask;
      const normalizedTaskWorkLevel = normalizeWorkLevel(task.workLevel);
      const matchWork =
        showCompletedOnly ||
        showStrikeOffOnly ||
        (workTab === "All" && !completedTask && !strikeOffTask) ||
        normalizedTaskWorkLevel === workTab;
      const matchActivePriorityLane =
        showCompletedOnly ||
        showStrikeOffOnly ||
        workTab === "All" ||
        (!completedTask && !strikeOffTask);

      return (
        matchSearch &&
        matchSource &&
        matchService &&
        matchStatus &&
        matchAssignedTo &&
        matchCompleted &&
        matchStrikeOff &&
        matchWork &&
        matchActivePriorityLane
      );
    });
  }, [assignedTo, isAdmin, meta.staff, search, service, showCompletedOnly, showStrikeOffOnly, source, status, tasks, workTab]);

  const completedTaskCount = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.jobWorkStatus === "Completed" || COMPLETED_TASK_STATUSES.includes(task.status)
      ).length,
    [tasks]
  );
  const strikeOffTaskCount = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.jobWorkStatus === STRIKE_OFF_STATUS || task.status === STRIKE_OFF_STATUS
      ).length,
    [tasks]
  );

  const deskStats = useMemo(() => {
    const activeTasks = tasks.filter(
      (task) => task.status !== STRIKE_OFF_STATUS && task.jobWorkStatus !== STRIKE_OFF_STATUS
    );
    const overdue = activeTasks.filter((task) => task.workLevel === "High Risk").length;
    const pending = filteredTasks.filter(
      (task) => task.workLevel === "Pendency"
    ).length;
    const completed = filteredTasks.filter((task) => getSLA(task).completed).length;

    return { overdue, pending, completed };
  }, [filteredTasks, tasks]);

  const openTask = async (taskId) => {
    try {
      const fullTask = await getWorkdeskTaskApi(taskId);
      setActiveTask(fullTask);
    } catch (error) {
      errorToast(getApiErrorMessage(error, "Unable to load task details."));
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setWorkTab("All");
      setSearch("");
      setSource("All");
      setService("All");
      setStatus("All");
      setAssignedTo("All");
      setShowCompletedOnly(false);
      setShowStrikeOffOnly(false);
      await Promise.all([loadReferenceData(), loadTasks({ silent: true })]);
      if (activeTask?._id) {
        await openTask(activeTask._id);
      }
    } catch (error) {
      errorToast(getApiErrorMessage(error, "Unable to refresh work desk data."));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!requestedTaskId) return;
    if (activeTask?._id === requestedTaskId) return;
    openTask(requestedTaskId);
  }, [activeTask?._id, requestedTaskId]);

  return (
    <WorkdeskPage
      compact
      eyebrow="Execution Workspace"
      title="Fast task execution with less scrolling"
      description="A denser desk for reviewing assigned work, allocating tasks quickly, and keeping the task grid visible across more screen sizes."
      actions={
        isAdmin ? (
          <button
            type="button"
            onClick={() => setShowAllocate(true)}
            className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition hover:bg-slate-800"
          >
            Allocate Work
          </button>
        ) : null
      }
      hero={
        <div className="grid gap-3 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="grid gap-3 sm:grid-cols-3">
            <WorkdeskStatCard
              label="Visible"
              value={filteredTasks.length}
              caption="Current queue"
              icon={TimerReset}
              accent="blue"
              className="p-4"
            />
            <WorkdeskStatCard
              label="High Risk"
              value={deskStats.overdue}
              caption="Priority tagged"
              icon={ShieldAlert}
              accent="rose"
              className="p-4"
            />
            <WorkdeskStatCard
              label="Pendency"
              value={deskStats.pending}
              caption="Pending tagged"
              icon={AlertCircle}
              accent="amber"
              className="p-4"
            />
          </div>

          <div className="rounded-[24px] border border-slate-900/90 bg-[linear-gradient(135deg,#0f172a_0%,#122338_48%,#0d3a42_100%)] p-4 text-white shadow-[0_18px_48px_rgba(15,23,42,0.20)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/85">
              Desk Snapshot
            </div>
            <h3 className="mt-2 text-xl font-bold">Execution-first view</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <WorkdeskPill tone="dark">{isAdmin ? "Admin Controls" : "Staff View"}</WorkdeskPill>
              <WorkdeskPill tone="info">{visibleWorkflowStatuses.length} statuses</WorkdeskPill>
              <WorkdeskPill tone="success">{deskStats.completed} completed</WorkdeskPill>
            </div>
          </div>
        </div>
      }
    >
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

      <WorkdeskSection
        title="Smart Filters"
        description="Use quick segmentation and precise filters to move from overview to action in seconds."
        aside={<WorkdeskPill tone="default">{tasks.length} total tasks loaded</WorkdeskPill>}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <WorkdeskSegment
              options={["All", "High Risk", "Pendency", "Important"]}
              value={workTab}
              onChange={(nextTab) => {
                setWorkTab(nextTab);
                setShowCompletedOnly(false);
                setShowStrikeOffOnly(false);
              }}
            />

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
            >
              <RefreshCw className={["h-4 w-4", refreshing ? "animate-spin" : ""].join(" ")} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={() => {
                setWorkTab("All");
                setShowStrikeOffOnly(false);
                setShowCompletedOnly((current) => !current);
              }}
              disabled={showStrikeOffOnly || completedTaskCount === 0}
              aria-pressed={showCompletedOnly}
              className={[
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition",
                showCompletedOnly
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950",
                showStrikeOffOnly || completedTaskCount === 0
                  ? "cursor-not-allowed opacity-50 hover:border-slate-200 hover:text-slate-700"
                  : "",
              ].join(" ")}
            >
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </button>

            {isAdmin ? (
              <button
                type="button"
                onClick={() => {
                  setWorkTab("All");
                  setShowCompletedOnly(false);
                  setShowStrikeOffOnly((current) => !current);
                }}
                disabled={strikeOffTaskCount === 0}
                aria-pressed={showStrikeOffOnly}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition",
                  showStrikeOffOnly
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950",
                  strikeOffTaskCount === 0
                    ? "cursor-not-allowed opacity-50 hover:border-slate-200 hover:text-slate-700"
                    : "",
                ].join(" ")}
              >
                <AlertCircle className="h-4 w-4" />
                Strike Off
              </button>
            ) : null}

          </div>

          <div
            className={[
              "grid gap-3",
              isAdmin
                ? "xl:grid-cols-[1.08fr_0.32fr_0.42fr_0.42fr_0.42fr]"
                : "xl:grid-cols-[1.1fr_0.36fr_0.45fr_0.52fr]",
            ].join(" ")}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <WorkdeskInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by client, SR number, CHA, sender, or client ID"
                className="pl-11"
              />
            </div>

            <WorkdeskSelect value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="All">All Sources</option>
              <option value="Direct">Direct</option>
              <option value="CHA">CHA</option>
            </WorkdeskSelect>

            <WorkdeskSelect value={service} onChange={(e) => setService(e.target.value)}>
              <option value="All">All Services</option>
              {serviceOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </WorkdeskSelect>

            <WorkdeskSelect value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              {visibleWorkflowStatuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </WorkdeskSelect>

            {isAdmin ? (
              <WorkdeskSelect value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                <option value="All">Assigned To</option>
                {meta.staff.map((staff) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.name}
                  </option>
                ))}
              </WorkdeskSelect>
            ) : null}
          </div>
        </div>
      </WorkdeskSection>

      <WorkdeskSection
        title="Task Grid"
        description="A refined operations table with clearer signal for ownership, SLA, and workflow state."
        aside={<WorkdeskPill tone="dark">{filteredTasks.length} visible rows</WorkdeskPill>}
        bodyClassName="p-0"
      >
        {loading ? (
          <p className="px-4 py-4 text-sm text-slate-500">Loading tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <div className="p-4">
            <WorkdeskEmptyState
              title="No tasks match the current filters"
              description="Try broadening the search, changing the workflow filter, or switching back to the full queue."
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-b-[24px] border-t border-slate-200 bg-white">
            <div className="max-h-[60vh] overflow-auto xl:max-h-[calc(100vh-300px)]">
              <table className="w-full min-w-[1120px] text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50/95 text-xs uppercase tracking-[0.12em] text-slate-500 backdrop-blur">
                  <tr>
                    <th className="px-4 py-3 text-left">SR / Client</th>
                    <th className="px-4 py-3 text-left">Source</th>
                    <th className="px-4 py-3 text-left">Service</th>
                    <th className="px-4 py-3 text-left">Sender</th>
                    <th className="px-4 py-3 text-left">Assigned</th>
                    <th className="px-4 py-3 text-left">Status & SLA</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTasks.map((task) => {
                    const sla = getSLA(task);

                    return (
                      <tr key={task._id} className={sla.overdue ? "bg-rose-50/40" : "hover:bg-slate-50/70"}>
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs font-bold text-slate-900">
                            {task.serviceRequestId}
                          </div>
                          <div className="mt-1 font-semibold text-slate-800">{task.clientName}</div>
                          <div className="text-xs text-slate-500">{task.clientDisplayId || "-"}</div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">
                            {task.clientSource === "CHA" ? "CHA" : "Direct"}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {task.clientSource === "CHA" ? `via ${task.chaName || "-"}` : "Primary client"}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{task.serviceType}</div>
                          <div className="mt-1 text-xs text-sky-700">{task.subType}</div>
                          <div className="mt-2">
                            <WorkLevelBadge workLevel={task.workLevel} />
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-slate-700">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-100">
                              <Mail className="h-4 w-4 text-slate-500" />
                            </span>
                            <span className="max-w-[220px] truncate">{task.emailSender || "-"}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{task.assignedToName || "-"}</div>
                          <div className="mt-1 text-xs text-slate-500">{task.assignedToEmail || "-"}</div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="space-y-1.5">
                            <EffectiveStatusBadge task={task} />
                            <StatusAndSLA task={task} />
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => openTask(task._id)}
                            className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </WorkdeskSection>

      {activeTask ? (
        <TaskManageDrawer
          task={activeTask}
          workflowStatuses={visibleWorkflowStatuses}
          serviceTypes={meta.serviceTypes}
          staff={meta.staff}
          onClose={() => {
            setActiveTask(null);
            if (requestedTaskId) {
              const nextParams = new URLSearchParams(searchParams);
              nextParams.delete("taskId");
              setSearchParams(nextParams);
            }
          }}
          onTaskUpdated={(updatedTask) => {
            setActiveTask(updatedTask);
            setTasks((currentTasks) =>
              currentTasks.map((task) =>
                task._id === updatedTask._id
                  ? {
                      ...task,
                      status: updatedTask.status,
                      jobWorkStatus: updatedTask.jobWorkStatus,
                      serviceType: updatedTask.serviceType,
                      subType: updatedTask.subType,
                      details: updatedTask.details,
                      quotation: updatedTask.quotation,
                      officialFee: updatedTask.officialFee,
                      serviceCharges: updatedTask.serviceCharges,
                      deadline: updatedTask.deadline,
                      assignedToName: updatedTask.assignedToName,
                      assignedToEmail: updatedTask.assignedToEmail,
                      assignedToUserId: updatedTask.assignedToUserId,
                      emailSender: updatedTask.emailSender,
                      workLevel: updatedTask.workLevel,
                    }
                  : task
              )
            );
          }}
        />
      ) : null}
    </WorkdeskPage>
  );
}
