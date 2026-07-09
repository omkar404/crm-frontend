import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Receipt,
  ShieldAlert,
  Star,
  X,
} from "lucide-react";

import { getClients } from "@/api/workdeskAuth.api";
import {
  getWorkdeskDashboardApi,
  getWorkdeskMetaApi,
  getWorkdeskTaskApi,
  getWorkdeskTasksApi,
} from "@/api/workdesk.api";
import {
  WorkdeskPill,
  WorkdeskPage,
  WorkdeskSection,
  WorkdeskStatCard,
} from "@/modules/workdesk/components/WorkdeskUI.jsx";
import { useWorkdeskAuthStore } from "@/store/workdeskAuth.store";
import { errorToast } from "@/utils/customToast";
import { getApiErrorMessage } from "@/utils/apiError";
import AllocateWorkModal from "@/workdesk/pages/Work Allocation Desk/AllocateWorkModal";
import TaskManageDrawer from "@/workdesk/pages/Work Allocation Desk/TaskManageDrawer";

const COMPLETED_TASK_STATUSES = ["Pending for Invoicing", "Invoice Raised", "Invoice Paid", "Invoice Write-Off"];
const STRIKE_OFF_STATUS = "Strike Off";

function isActiveWorkflowTask(task) {
  return (
    task.status !== STRIKE_OFF_STATUS &&
    task.jobWorkStatus !== STRIKE_OFF_STATUS &&
    task.jobWorkStatus !== "Completed" &&
    !COMPLETED_TASK_STATUSES.includes(task.status)
  );
}

function parseAmount(value) {
  if (value === null || value === undefined || value === "") return 0;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatAmount(value) {
  if (value === null || value === undefined || value === "") return "-";
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "-";
  return numericValue.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function getTaskInvoiceAmount(task) {
  return parseAmount(task?.serviceCharges);
}

export default function OperationsOverview() {
  const { user } = useWorkdeskAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllocate, setShowAllocate] = useState(false);
  const [workLevelModal, setWorkLevelModal] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [fallbackActiveTasks, setFallbackActiveTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [meta, setMeta] = useState({ serviceTypes: {}, staff: [], workflowStatuses: [] });
  const [allocateDataLoaded, setAllocateDataLoaded] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const dashboardResponse = await getWorkdeskDashboardApi();
      setAnalytics(dashboardResponse?.data || null);

      const dashboardData = dashboardResponse?.data || {};
      if ((dashboardData.summary?.totalActive || 0) > 0 && !dashboardData.activeTasks?.length) {
        const tasks = await getWorkdeskTasksApi();
        setFallbackActiveTasks(tasks.filter(isActiveWorkflowTask));
      } else {
        setFallbackActiveTasks([]);
      }
    } catch (error) {
      errorToast(getApiErrorMessage(error, "Unable to load dashboard analytics."));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllocateData = useCallback(async () => {
    if (!isAdmin || allocateDataLoaded) return;

    try {
      const [clientsResponse, metaResponse] = await Promise.all([getClients(), getWorkdeskMetaApi()]);
      setClients(Array.isArray(clientsResponse?.data?.data) ? clientsResponse.data.data : []);
      setMeta(metaResponse || { serviceTypes: {}, staff: [], workflowStatuses: [] });
      setAllocateDataLoaded(true);
    } catch (error) {
      errorToast(getApiErrorMessage(error, "Unable to load allocation data."));
    }
  }, [allocateDataLoaded, isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (showAllocate) {
      loadAllocateData();
    }
  }, [loadAllocateData, showAllocate]);

  const openTask = async (taskId) => {
    try {
      await loadAllocateData();
      const fullTask = await getWorkdeskTaskApi(taskId);
      setActiveTask(fullTask);
    } catch (error) {
      errorToast(getApiErrorMessage(error, "Unable to open task details."));
    }
  };

  const handleManageFromModal = async (taskId) => {
    setWorkLevelModal(null);
    await openTask(taskId);
  };

  const summary = analytics?.summary || {};
  const staffLoad = analytics?.staffLoad || [];
  const staffReadyInvoice = analytics?.staffReadyInvoice || [];
  const invoiceTracking = analytics?.invoiceTracking || {};
  const workLevelTracking = analytics?.workLevelTracking || {};
  const activeTaskRows = analytics?.activeTasks?.length ? analytics.activeTasks : fallbackActiveTasks;
  const readyForBillingRows = invoiceTracking.pendingForInvoicing || [];
  const billingInitiatedRows = invoiceTracking.invoiceRaised || [];
  const successfullyClosedRows = invoiceTracking.invoicePaid || [];
  const workLevelCards = useMemo(
    () => [
      {
        key: "highRisk",
        label: "High Risk",
        caption: "Priority tagged",
        icon: ShieldAlert,
        accent: "rose",
        amountTone: "text-rose-700",
        rows: workLevelTracking.highRisk || [],
      },
      {
        key: "pendency",
        label: "Pendency",
        caption: "Pending tagged",
        icon: Clock3,
        accent: "amber",
        amountTone: "text-amber-700",
        rows: workLevelTracking.pendency || [],
      },
      {
        key: "important",
        label: "Important",
        caption: "Important tagged",
        icon: Star,
        accent: "blue",
        amountTone: "text-sky-700",
        rows: workLevelTracking.important || [],
      },
    ],
    [workLevelTracking.highRisk, workLevelTracking.important, workLevelTracking.pendency]
  );
  const pipelineCards = useMemo(
    () => [
      { label: "Ready for Billing", value: readyForBillingRows.length },
      { label: "Billing Initiated", value: billingInitiatedRows.length },
      { label: "Successfully Closed", value: successfullyClosedRows.length },
    ],
    [billingInitiatedRows.length, readyForBillingRows.length, successfullyClosedRows.length]
  );

  return (
    <WorkdeskPage
      compact
      eyebrow="Operations Command"
      title="Compact operations view for quick decisions"
      description="A tighter dashboard focused on allocation, workload, and invoice movement without pushing the actual work too far down the screen."
      actions={
        isAdmin ? (
          <button
            type="button"
            onClick={() => setShowAllocate(true)}
            className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition hover:bg-slate-800"
          >
            Allocate New Work
          </button>
        ) : null
      }
      hero={
        <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setWorkLevelModal({ label: "Active Tasks", rows: activeTaskRows })}
              className="rounded-[26px] text-left transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <WorkdeskStatCard
                label="Active"
                value={activeTaskRows.length || summary.totalActive || 0}
                caption="Live desk tasks"
                icon={CalendarDays}
                accent="slate"
                className="h-full p-4"
              />
            </button>
            <WorkdeskStatCard
              label="Critical"
              value={summary.critical || 0}
              caption="Needs attention"
              icon={ShieldAlert}
              accent="rose"
              className="p-4"
            />
            <WorkdeskStatCard
              label="Ready for Billing"
              value={summary.totalPendingForInvoicing || 0}
              caption="Ready for billing"
              icon={Receipt}
              accent="amber"
              className="p-4"
            />
          </div>

          <div className="rounded-[24px] border border-slate-900/90 bg-[linear-gradient(135deg,#0f172a_0%,#122338_48%,#10333b_100%)] p-4 text-white shadow-[0_18px_48px_rgba(15,23,42,0.20)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/85">
              Invoice Pipeline
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {pipelineCards.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/6 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/80">
                    {item.label}
                  </div>
                  <div className="mt-2 text-2xl font-bold">{item.value}</div>
                </div>
              ))}
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
            await Promise.all([loadData(), loadAllocateData()]);
          }}
        />
      ) : null}
      {workLevelModal ? (
        <WorkLevelTaskModal
          title={workLevelModal.label}
          rows={workLevelModal.rows}
          onClose={() => setWorkLevelModal(null)}
          onManage={handleManageFromModal}
        />
      ) : null}

      {activeTask ? (
        <TaskManageDrawer
          task={activeTask}
          workflowStatuses={meta.workflowStatuses}
          serviceTypes={meta.serviceTypes}
          staff={meta.staff}
          onClose={() => setActiveTask(null)}
          onTaskUpdated={(updatedTask) => {
            setActiveTask(updatedTask);
            loadData();
          }}
        />
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        {workLevelCards.map((card) => (
          <DashboardWorkLevelCard
            key={card.key}
            label={card.label}
            count={card.rows.length}
            amount={card.rows.reduce((total, row) => total + getTaskInvoiceAmount(row), 0)}
            caption={card.caption}
            icon={card.icon}
            accent={card.accent}
            amountTone={card.amountTone}
            onClick={() => setWorkLevelModal(card)}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <WorkdeskSection
          title="Workload Distribution"
          description="Who is carrying active load right now."
          aside={<WorkdeskPill tone="info">{staffLoad.length} employees</WorkdeskPill>}
        >
          {loading ? (
            <p className="text-sm text-slate-500">Loading analytics...</p>
          ) : (
            <div className="space-y-3">
              {staffLoad.length === 0 ? (
                <p className="text-sm text-slate-400">No workload data available.</p>
              ) : (
                staffLoad.map((item) => (
                  <ProgressRow
                    key={item._id || "unassigned"}
                    label={item._id || "Unassigned"}
                    value={item.count}
                    max={Math.max(...staffLoad.map((entry) => Number(entry.count) || 0), 1)}
                    accent="from-sky-500 to-cyan-500"
                  />
                ))
              )}
            </div>
          )}
        </WorkdeskSection>

        <WorkdeskSection
          title="Ready for Billing"
          description="Employees with work already lined up for billing."
          aside={<WorkdeskPill tone="success">{staffReadyInvoice.length} contributors</WorkdeskPill>}
        >
          {loading ? (
            <p className="text-sm text-slate-500">Loading analytics...</p>
          ) : (
            <div className="space-y-3">
              {staffReadyInvoice.length === 0 ? (
                <p className="text-sm text-slate-400">No invoice-ready tasks.</p>
              ) : (
                staffReadyInvoice.map((item) => (
                  <ProgressRow
                    key={item._id || "unassigned"}
                    label={item._id || "Unassigned"}
                    value={item.count}
                    max={Math.max(...staffReadyInvoice.map((entry) => Number(entry.count) || 0), 1)}
                    accent="from-emerald-500 to-teal-500"
                  />
                ))
              )}
            </div>
          )}
        </WorkdeskSection>
      </div>

      <div className="grid gap-4">
        <DashboardTaskSection
          title="Ready for Billing"
          description="Tasks that have reached the pending invoice stage and are ready for billing follow-up."
          rows={readyForBillingRows}
          loading={loading}
          tone="amber"
        />

        <DashboardTaskSection
          title="Billing Initiated"
          description="Tasks where the invoice has already been raised and billing is in progress."
          rows={billingInitiatedRows}
          loading={loading}
          tone="blue"
        />

        <DashboardTaskSection
          title="Successfully Closed"
          description="Tasks that have completed the billing cycle and are fully closed."
          rows={successfullyClosedRows}
          loading={loading}
          tone="green"
        />
      </div>
    </WorkdeskPage>
  );
}

function DashboardWorkLevelCard({
  label,
  count,
  amount,
  caption,
  icon: Icon,
  accent = "blue",
  amountTone = "text-slate-700",
  onClick,
}) {
  const tones = {
    amber: "from-amber-500 via-orange-500 to-yellow-500",
    blue: "from-sky-500 via-blue-500 to-indigo-500",
    rose: "from-rose-500 via-red-500 to-orange-500",
  };
  const displayAmount = formatAmount(amount);

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative min-h-[154px] min-w-0 rounded-[26px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,249,250,0.92)_100%)] p-4 text-left shadow-[0_18px_48px_rgba(20,33,48,0.08)] transition hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-[0_22px_56px_rgba(20,33,48,0.12)] focus:outline-none focus:ring-2 focus:ring-slate-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          {label}
        </div>
        {Icon ? (
          <div
            className={[
              "inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg md:h-12 md:w-12",
              tones[accent] || tones.blue,
            ].join(" ")}
          >
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>

      <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 flex-col items-center justify-center text-center">
        <div className={["text-[10px] font-bold uppercase tracking-[0.16em]", amountTone].join(" ")}>
          Total Amount
        </div>
        <div
          className={[
            "mt-1 max-w-full whitespace-nowrap text-center font-mono font-bold leading-none tracking-normal text-slate-950",
            displayAmount.length > 10 ? "text-[20px]" : "text-[24px]",
          ].join(" ")}
        >
          {displayAmount}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 text-sm text-slate-500">{caption}</div>
      <div className="absolute bottom-4 right-4 rounded-full bg-slate-950 px-3 py-1 text-sm font-bold text-white">
        {count}
      </div>
    </button>
  );
}

function WorkLevelTaskModal({ title, rows, onClose, onManage }) {
  const totalAmount = rows.reduce((total, row) => total + getTaskInvoiceAmount(row), 0);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-6xl rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.24)]">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Dashboard Category
            </div>
            <h3 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-slate-950">{title}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <WorkdeskPill tone="dark">{rows.length} tasks</WorkdeskPill>
              <WorkdeskPill tone="info">Total Amount: {formatAmount(totalAmount)}</WorkdeskPill>
            </div>
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
                <th className="px-4 py-3 text-left">SR No</th>
                <th className="px-4 py-3 text-left">Client Name</th>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">Assigned To</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Official Fee</th>
                <th className="px-4 py-3 text-right">Service Charges</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={9}>
                    No records available.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row._id || row.serviceRequestId} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900">
                      {row.serviceRequestId || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{row.clientName || "-"}</div>
                      <div className="mt-1 text-xs text-slate-500">{row.clientDisplayId || "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div>{row.serviceType || "-"}</div>
                      <div className="mt-1 text-xs text-slate-500">{row.subType || "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="font-semibold text-slate-800">{row.assignedToName || "Unassigned"}</div>
                      <div className="mt-1 text-xs text-slate-500">{row.assignedToEmail || "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.status || "-"}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      {formatAmount(row.officialFee)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      {formatAmount(row.serviceCharges)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-950">
                      {formatAmount(getTaskInvoiceAmount(row))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onManage(row._id)}
                        className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProgressRow({ label, value, max, accent }) {
  const width = Math.max(12, Math.round(((Number(value) || 0) / max) * 100));

  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50/70 p-3.5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={["h-8 w-8 rounded-2xl bg-gradient-to-br", accent].join(" ")} />
          <div>
            <div className="font-semibold text-slate-900">{label}</div>
            <div className="text-xs text-slate-500">Active</div>
          </div>
        </div>
        <div className="text-xl font-bold tracking-[-0.03em] text-slate-950">{value}</div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
        <div className={["h-full rounded-full bg-gradient-to-r", accent].join(" ")} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function DashboardTaskSection({ title, description, rows, loading, tone }) {
  const toneMap = {
    amber: {
      sectionClass: "border-amber-200",
      pill: "warning",
      tableHead: "bg-amber-50/80",
    },
    blue: {
      sectionClass: "border-sky-200",
      pill: "info",
      tableHead: "bg-sky-50/80",
    },
    green: {
      sectionClass: "border-emerald-200",
      pill: "success",
      tableHead: "bg-emerald-50/80",
    },
  };

  const currentTone = toneMap[tone] || toneMap.amber;

  return (
    <WorkdeskSection
      title={title}
      description={description}
      aside={<WorkdeskPill tone={currentTone.pill}>{rows.length} tasks</WorkdeskPill>}
      className={currentTone.sectionClass}
      bodyClassName="p-0"
    >
      {loading ? (
        <p className="px-4 py-4 text-sm text-slate-500">Loading stage details...</p>
      ) : rows.length === 0 ? (
        <div className="p-4 text-sm text-slate-400">No tasks available in this section.</div>
      ) : (
        <div className="overflow-hidden rounded-b-[24px] border-t border-slate-200 bg-white">
          <div className="max-h-[42vh] overflow-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead
                className={[
                  "sticky top-0 z-10 text-xs uppercase tracking-[0.12em] text-slate-500 backdrop-blur",
                  currentTone.tableHead,
                ].join(" ")}
              >
                <tr>
                  <th className="px-4 py-3 text-left">SR No</th>
                  <th className="px-4 py-3 text-left">Client Name</th>
                  <th className="px-4 py-3 text-left">Employee Name</th>
                  <th className="px-4 py-3 text-left">Service Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((row) => (
                  <tr key={row.serviceRequestId} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900">
                      {row.serviceRequestId || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{row.clientName || "-"}</div>
                      <div className="mt-1 text-xs text-slate-500">{row.clientDisplayId || "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div>{row.assignedToName || "-"}</div>
                      <div className="mt-1 text-xs text-slate-500">{row.handledCount || 0} handled</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div>{row.serviceType || "-"}</div>
                      <div className="mt-1 text-xs text-slate-500">{row.subType || "-"}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </WorkdeskSection>
  );
}
