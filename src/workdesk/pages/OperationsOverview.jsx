import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Receipt,
  ShieldAlert,
} from "lucide-react";

import { getClients } from "@/api/workdeskAuth.api";
import { getWorkdeskDashboardApi, getWorkdeskMetaApi } from "@/api/workdesk.api";
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

export default function OperationsOverview() {
  const { user } = useWorkdeskAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllocate, setShowAllocate] = useState(false);
  const [clients, setClients] = useState([]);
  const [meta, setMeta] = useState({ serviceTypes: {}, staff: [], workflowStatuses: [] });
  const [allocateDataLoaded, setAllocateDataLoaded] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const dashboardResponse = await getWorkdeskDashboardApi();
      setAnalytics(dashboardResponse?.data || null);
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

  const summary = analytics?.summary || {};
  const staffLoad = analytics?.staffLoad || [];
  const staffReadyInvoice = analytics?.staffReadyInvoice || [];
  const invoiceTracking = analytics?.invoiceTracking || {};
  const readyForBillingRows = invoiceTracking.pendingForInvoicing || [];
  const billingInitiatedRows = invoiceTracking.invoiceRaised || [];
  const successfullyClosedRows = invoiceTracking.invoicePaid || [];
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
            <WorkdeskStatCard
              label="Active"
              value={summary.totalActive || 0}
              caption="Live desk tasks"
              icon={CalendarDays}
              accent="slate"
              className="p-4"
            />
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

      <div className="grid gap-3 md:grid-cols-3">
        <WorkdeskStatCard
          label="Completed"
          value={summary.completed || 0}
          caption="Finished"
          icon={CheckCircle2}
          accent="teal"
          className="p-4"
        />
        <WorkdeskStatCard
          label="Billing Initiated"
          value={summary.totalInvoiceRaised || 0}
          caption="Raised"
          icon={Receipt}
          accent="blue"
          className="p-4"
        />
        <WorkdeskStatCard
          label="Successfully Closed"
          value={summary.totalInvoicePaid || 0}
          caption="Closed"
          icon={Receipt}
          accent="amber"
          className="p-4"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <WorkdeskSection
          title="Workload Distribution"
          description="Who is carrying active load right now."
          aside={<WorkdeskPill tone="info">{staffLoad.length} staff members</WorkdeskPill>}
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
          description="Staff with work already lined up for billing."
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
                  <th className="px-4 py-3 text-left">Staff Name</th>
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
