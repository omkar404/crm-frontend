import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Eye, Mail, TimerReset, X } from "lucide-react";

import { getWorkdeskMetaApi, getWorkdeskTaskApi, getWorkdeskTasksApi } from "@/api/workdesk.api";
import {
  WorkdeskEmptyState,
  WorkdeskPage,
  WorkdeskPill,
  WorkdeskSection,
} from "@/modules/workdesk/components/WorkdeskUI.jsx";
import TaskManageDrawer from "./TaskManageDrawer";

const WORK_LEVEL_ORDER = ["High Risk", "Pendency", "Important"];
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

function getSLA(task) {
  const deadline = new Date(task.deadline).getTime();
  const now = Date.now();
  const diffHours = Math.ceil((deadline - now) / (1000 * 60 * 60));
  const completed = COMPLETED_TASK_STATUSES.includes(task.status);

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
  };

  return <WorkdeskPill tone={toneMap[status] || "default"}>{status}</WorkdeskPill>;
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

function WorkflowTaskGridModal({ title, tasks, onClose, onManage }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-6xl rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.24)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Workflow Records
            </div>
            <h3 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-slate-950">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[72vh] overflow-auto">
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
              {tasks.map((task) => (
                <tr key={task._id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs font-bold text-slate-900">{task.serviceRequestId}</div>
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
                      <StatusBadge status={task.status} />
                      <StatusAndSLA task={task} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onManage(task._id)}
                      className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ActiveWorkflowDesk() {
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ workflowStatuses: [] });
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [workflowModal, setWorkflowModal] = useState(null);

  const loadWorkflow = useCallback(async () => {
    setLoading(true);
    try {
      const [taskData, metaData] = await Promise.all([getWorkdeskTasksApi(), getWorkdeskMetaApi()]);
      setTasks(Array.isArray(taskData) ? taskData : []);
      setMeta(metaData || { workflowStatuses: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkflow();
  }, [loadWorkflow]);

  const visibleWorkflowStatuses = useMemo(
    () => [...new Set([...(meta.workflowStatuses || []), ...DEFAULT_WORKFLOW_STATUSES])],
    [meta.workflowStatuses]
  );

  const activeTasks = useMemo(
    () => tasks.filter((task) => task.status !== STRIKE_OFF_STATUS),
    [tasks]
  );

  const workflowCards = useMemo(() => {
    return WORK_LEVEL_ORDER.map((workLevel) => {
      const workLevelTasks = activeTasks.filter((task) => task.workLevel === workLevel);
      const statusBuckets = visibleWorkflowStatuses
        .map((workflowStatus) => {
          const bucketTasks = workLevelTasks.filter((task) => task.status === workflowStatus);
          return {
            status: workflowStatus,
            count: bucketTasks.length,
            tasks: bucketTasks,
          };
        })
        .filter((bucket) => bucket.count > 0);

      return {
        workLevel,
        total: workLevelTasks.length,
        statusBuckets,
      };
    });
  }, [activeTasks, visibleWorkflowStatuses]);

  const activeWorkflowTasks = useMemo(
    () => activeTasks.filter((task) => WORK_LEVEL_ORDER.includes(task.workLevel)),
    [activeTasks]
  );

  const openTask = async (taskId) => {
    const fullTask = await getWorkdeskTaskApi(taskId);
    setActiveTask(fullTask);
  };

  const handleManageFromWorkflow = async (taskId) => {
    setWorkflowModal(null);
    await openTask(taskId);
  };

  return (
    <WorkdeskPage
      compact
      eyebrow="Workflow Tracking"
      title="Active Workflow"
      description="Track the full live journey of High Risk, Pendency, and Important work in separate monitoring cards without crowding the main Work Desk."
      actions={
        <button
          type="button"
          onClick={() =>
            setWorkflowModal({
              title: "All Active Workflow Records",
              tasks: activeWorkflowTasks,
            })
          }
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
        >
          <Eye className="h-4 w-4" />
          View All
        </button>
      }
    >
      <WorkdeskSection
        title="Workflow Lanes"
        description="Each priority lane has its own scrollable monitoring container so large volumes stay easy to review."
        aside={<WorkdeskPill tone="info">Admin tracking view</WorkdeskPill>}
      >
        {loading ? (
          <p className="text-sm text-slate-500">Loading active workflow...</p>
        ) : (
          <div className="grid gap-4 xl:grid-cols-3">
            {workflowCards.map((card) => (
              <div
                key={card.workLevel}
                className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Workflow Lane
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="text-lg font-bold text-slate-950">{card.workLevel}</div>
                      <WorkLevelBadge workLevel={card.workLevel} />
                    </div>
                  </div>
                  <WorkdeskPill tone="default">{card.total} active</WorkdeskPill>
                </div>

                <div className="mt-4 max-h-[420px] overflow-y-auto pr-1">
                  {card.statusBuckets.length === 0 ? (
                    <WorkdeskEmptyState
                      title={`No ${card.workLevel.toLowerCase()} tasks yet`}
                      description="This workflow card will populate automatically as tasks enter this priority level."
                    />
                  ) : (
                    <div className="space-y-3">
                      {card.statusBuckets.map((bucket) => (
                        <div
                          key={`${card.workLevel}-${bucket.status}`}
                          className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-slate-900">{bucket.status}</div>
                            <WorkdeskPill tone="dark">{bucket.count}</WorkdeskPill>
                          </div>

                          <div className="mt-3 space-y-2">
                            {bucket.tasks.map((task) => (
                              <button
                                key={task._id}
                                type="button"
                                onClick={() =>
                                  setWorkflowModal({
                                    title: `${card.workLevel} / ${bucket.status}`,
                                    tasks: [task],
                                  })
                                }
                                className="block w-full rounded-2xl border border-white bg-white px-3 py-2 text-left shadow-sm transition hover:border-slate-200 hover:bg-slate-50"
                              >
                                <div className="text-xs font-mono font-bold text-slate-900">
                                  {task.serviceRequestId}
                                </div>
                                <div className="mt-1 text-sm font-semibold text-slate-800">
                                  {task.clientName}
                                </div>
                                <div className="mt-1 text-xs text-slate-500">
                                  {task.serviceType} / {task.subType}
                                </div>
                                <div className="mt-1 text-xs text-slate-500">
                                  Assigned to {task.assignedToName || "-"}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </WorkdeskSection>

      {workflowModal ? (
        <WorkflowTaskGridModal
          title={workflowModal.title}
          tasks={workflowModal.tasks}
          onClose={() => setWorkflowModal(null)}
          onManage={handleManageFromWorkflow}
        />
      ) : null}

      {activeTask ? (
        <TaskManageDrawer
          task={activeTask}
          workflowStatuses={visibleWorkflowStatuses}
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
