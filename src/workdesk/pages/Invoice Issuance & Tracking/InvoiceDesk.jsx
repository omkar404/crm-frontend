import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Receipt, WalletCards } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getWorkdeskInvoicesApi, getWorkdeskTasksApi } from "@/api/workdesk.api";
import {
  WorkdeskEmptyState,
  WorkdeskPage,
  WorkdeskPill,
  WorkdeskSection,
  WorkdeskStatCard,
} from "@/modules/workdesk/components/WorkdeskUI.jsx";
import { useWorkdeskAuthStore } from "@/store/workdeskAuth.store";

function formatAmount(value) {
  if (value === null || value === undefined || value === "") return "-";
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "-";
  return numericValue.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN");
}

function formatDisplayValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function SectionTable({ title, description, rows, columns, loading, actionRenderer, accent = "slate" }) {
  const accentMap = {
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
    slate: {
      sectionClass: "border-slate-200",
      pill: "default",
      tableHead: "bg-slate-50/80",
    },
  };

  const tone = accentMap[accent] || accentMap.slate;

  return (
    <WorkdeskSection
      title={title}
      description={description}
      aside={<WorkdeskPill tone={tone.pill}>{rows.length} records</WorkdeskPill>}
      className={tone.sectionClass}
      bodyClassName="p-0"
    >
      {loading ? (
        <p className="px-4 py-4 text-sm text-slate-500">Loading invoice records...</p>
      ) : rows.length === 0 ? (
        <div className="p-4">
          <WorkdeskEmptyState
            title="No records in this billing stage"
            description="This section will populate automatically as tasks progress through the invoice workflow."
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-b-[24px] border-t border-slate-200 bg-white">
          <div className="max-h-[52vh] overflow-auto xl:max-h-[calc(100vh-320px)]">
            <table className="w-full min-w-[1040px] text-sm">
              <thead className={["sticky top-0 z-10 text-xs uppercase tracking-[0.12em] text-slate-500 backdrop-blur", tone.tableHead].join(" ")}>
                <tr>
                  <th className="px-4 py-3 text-left">SR No</th>
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">Service</th>
                  <th className="px-4 py-3 text-left">Handled By</th>
                  {columns.map((column) => (
                    <th key={column.key} className="px-4 py-3 text-left">
                      {column.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {rows.map((row) => (
                  <tr key={row.task._id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs font-bold text-slate-900">
                        {row.task.serviceRequestId}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {row.task.createdAt ? new Date(row.task.createdAt).toLocaleDateString("en-IN") : "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{row.task.clientName}</div>
                      <div className="mt-1 text-xs text-slate-500">{row.task.clientDisplayId || "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div>{row.task.serviceType || "-"}</div>
                      <div className="mt-1 text-xs text-slate-500">{row.task.subType || "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div>{row.task.assignedToName || "-"}</div>
                      <div className="mt-1 text-xs text-slate-500">{row.task.assignedToEmail || "-"}</div>
                    </td>
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3 text-slate-700">
                        {column.render(row)}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      {actionRenderer ? actionRenderer(row) : <span className="text-xs text-slate-400">-</span>}
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

export default function InvoiceDesk() {
  const { user } = useWorkdeskAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const [taskData, invoiceData] = await Promise.all([getWorkdeskTasksApi(), getWorkdeskInvoicesApi()]);
      setTasks(taskData);
      setInvoices(invoiceData);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const refreshData = () => {
      if (document.visibilityState === "visible") {
        loadData({ silent: true });
      }
    };

    const intervalId = window.setInterval(refreshData, 20000);
    window.addEventListener("focus", refreshData);
    document.addEventListener("visibilitychange", refreshData);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshData);
      document.removeEventListener("visibilitychange", refreshData);
    };
  }, [loadData]);

  const rows = useMemo(() => {
    return tasks
      .filter((task) => {
        if (!["Pending for Invoicing", "Invoice Raised", "Invoice Paid"].includes(task.status)) return false;
        return true;
      })
      .map((task) => ({
        task,
        invoice: invoices.find((item) => String(item.taskId) === String(task._id)) || null,
      }));
  }, [invoices, tasks]);

  const pendingRows = useMemo(() => rows.filter((row) => row.task.status === "Pending for Invoicing"), [rows]);
  const raisedRows = useMemo(() => rows.filter((row) => row.task.status === "Invoice Raised"), [rows]);
  const paidRows = useMemo(() => rows.filter((row) => row.task.status === "Invoice Paid"), [rows]);

  const openInManageView = (row) => {
    navigate(`/workdesk/tasks?taskId=${row.task._id}`);
  };

  const pendingColumns = [
    { key: "quoteAmount", label: "Quote Amount", render: (row) => formatAmount(row.invoice?.netAmount) },
    { key: "via", label: "Via", render: (row) => formatDisplayValue(row.task.quotation) },
    { key: "officialFee", label: "Official Fees", render: (row) => formatAmount(row.task.officialFee) },
    { key: "serviceCharges", label: "Service Charges", render: (row) => formatAmount(row.task.serviceCharges) },
  ];

  const raisedColumns = [
    { key: "invoiceNumber", label: "Inv No", render: (row) => formatDisplayValue(row.invoice?.invoiceNumber) },
    { key: "invoiceDate", label: "Inv Date", render: (row) => formatDate(row.invoice?.issuedDate) },
    { key: "invoiceAmount", label: "Inv Amt", render: (row) => formatAmount(row.invoice?.totalAmount) },
  ];

  const paidColumns = [
    { key: "invoiceNumber", label: "Inv No", render: (row) => formatDisplayValue(row.invoice?.invoiceNumber) },
    { key: "invoiceDate", label: "Inv Date", render: (row) => formatDate(row.invoice?.issuedDate) },
    { key: "invoiceAmount", label: "Inv Amt", render: (row) => formatAmount(row.invoice?.totalAmount) },
    { key: "paidDate", label: "Pay Dt", render: (row) => formatDate(row.invoice?.paidDate) },
    { key: "receivedAmount", label: "Recd Amt", render: (row) => formatAmount(row.invoice?.receivedAmount) },
    { key: "tdsAmount", label: "TDS Amt", render: (row) => formatAmount(row.invoice?.tdsAmount) },
  ];

  return (
    <WorkdeskPage
      compact
      eyebrow="Billing Workspace"
      title="Compact invoice workflow"
      description="A tighter billing workspace that keeps invoice stages visible without turning the page into a long dashboard."
      hero={
        <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-3 sm:grid-cols-3">
            <WorkdeskStatCard
              label="Pending"
              value={pendingRows.length}
              caption="Waiting"
              icon={Receipt}
              accent="amber"
              className="p-4"
            />
            <WorkdeskStatCard
              label="Raised"
              value={raisedRows.length}
              caption="Outstanding"
              icon={ArrowRight}
              accent="blue"
              className="p-4"
            />
            <WorkdeskStatCard
              label="Paid"
              value={paidRows.length}
              caption="Closed"
              icon={WalletCards}
              accent="teal"
              className="p-4"
            />
          </div>

          <div className="rounded-[24px] border border-slate-900/90 bg-[linear-gradient(135deg,#0f172a_0%,#172554_46%,#0d9488_100%)] p-4 text-white shadow-[0_18px_48px_rgba(15,23,42,0.20)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/90">
              Workflow Summary
            </div>
            <h3 className="mt-2 text-xl font-bold">Billing stages at a glance</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <WorkdeskPill tone="dark">{rows.length} total workflow records</WorkdeskPill>
              <WorkdeskPill tone="info">{isAdmin ? "Admin can act" : "Staff view only"}</WorkdeskPill>
            </div>
          </div>
        </div>
      }
    >
      <SectionTable
        title="Pending for Invoicing"
        description="Tasks appear here automatically when staff moves a workflow into the pending invoicing stage."
        rows={pendingRows}
        columns={pendingColumns}
        loading={loading}
        accent="amber"
        actionRenderer={(row) =>
          isAdmin ? (
            <button
              type="button"
              onClick={() => openInManageView(row)}
              className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
            >
              Raise Invoice
            </button>
          ) : (
            <span className="text-xs text-slate-400">View only</span>
          )
        }
      />

      <SectionTable
        title="Invoice Raised"
        description="Invoices move into this section once billing has been generated and is ready for payment follow-up."
        rows={raisedRows}
        columns={raisedColumns}
        loading={loading}
        accent="blue"
        actionRenderer={(row) =>
          isAdmin ? (
            <button
              type="button"
              onClick={() => openInManageView(row)}
              className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-800 transition hover:bg-sky-100"
            >
              Mark Paid
            </button>
          ) : (
            <span className="text-xs text-slate-400">View only</span>
          )
        }
      />

      <SectionTable
        title="Invoice Paid"
        description="Completed payment records remain here as the polished final ledger view."
        rows={paidRows}
        columns={paidColumns}
        loading={loading}
        accent="green"
        actionRenderer={() => <WorkdeskPill tone="success">Completed</WorkdeskPill>}
      />
    </WorkdeskPage>
  );
}
