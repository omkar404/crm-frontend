import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Ban, Pencil, Receipt, WalletCards, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getWorkdeskInvoicesApi, getWorkdeskTasksApi, updateWorkdeskInvoiceApi } from "@/api/workdesk.api";
import {
  WorkdeskEmptyState,
  WorkdeskPage,
  WorkdeskPill,
  WorkdeskSection,
} from "@/modules/workdesk/components/WorkdeskUI.jsx";
import { useWorkdeskAuthStore } from "@/store/workdeskAuth.store";
import { errorToast, successToast } from "@/utils/customToast";
import { getApiErrorMessage } from "@/utils/apiError";

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

function toInputDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function toInputNumber(value, fallback = "") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function roundAmount(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function getRowOfficialFees(row) {
  return parseAmount(row?.invoice?.officialFee ?? row?.task?.officialFee);
}

function getRowServiceCharges(row) {
  return parseAmount(row?.invoice?.serviceCharges ?? row?.task?.serviceCharges);
}

function getRowGstAmount(row) {
  return parseAmount(row?.invoice?.gstAmount);
}

function getRowInvoiceBillAmount(row) {
  return roundAmount(getRowOfficialFees(row) + getRowServiceCharges(row) + getRowGstAmount(row));
}

function PendingInvoiceCard({ count, amount }) {
  const displayAmount = formatAmount(amount);

  return (
    <div className="relative min-h-[154px] min-w-0 rounded-[26px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,249,250,0.92)_100%)] p-4 shadow-[0_18px_48px_rgba(20,33,48,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          Pending
        </div>
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 text-white shadow-lg">
          <Receipt className="h-5 w-5" />
        </div>
      </div>

      <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 flex-col items-center justify-center text-center">
        <div className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700">
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

      <div className="absolute bottom-4 left-4 text-sm text-slate-500">Waiting</div>
      <div className="absolute bottom-4 right-4 rounded-full bg-slate-950 px-3 py-1 text-sm font-bold text-white">
        {count}
      </div>
    </div>
  );
}

function RaisedInvoiceCard({ count, amount }) {
  const displayAmount = formatAmount(amount);

  return (
    <div className="relative min-h-[154px] min-w-0 rounded-[26px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,249,250,0.92)_100%)] p-4 shadow-[0_18px_48px_rgba(20,33,48,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          Raised
        </div>
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 text-white shadow-lg">
          <ArrowRight className="h-5 w-5" />
        </div>
      </div>

      <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 flex-col items-center justify-center text-center">
        <div className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">
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

      <div className="absolute bottom-4 left-4 text-sm text-slate-500">Outstanding</div>
      <div className="absolute bottom-4 right-4 rounded-full bg-slate-950 px-3 py-1 text-sm font-bold text-white">
        {count}
      </div>
    </div>
  );
}

function PaidInvoiceCard({ count, amount }) {
  const displayAmount = formatAmount(amount);

  return (
    <div className="relative min-h-[154px] min-w-0 rounded-[26px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,249,250,0.92)_100%)] p-4 shadow-[0_18px_48px_rgba(20,33,48,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          Paid
        </div>
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 text-white shadow-lg">
          <WalletCards className="h-5 w-5" />
        </div>
      </div>

      <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 flex-col items-center justify-center text-center">
        <div className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
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

      <div className="absolute bottom-4 left-4 text-sm text-slate-500">Closed</div>
      <div className="absolute bottom-4 right-4 rounded-full bg-slate-950 px-3 py-1 text-sm font-bold text-white">
        {count}
      </div>
    </div>
  );
}

function WriteOffInvoiceCard({ count, amount }) {
  const displayAmount = formatAmount(amount);

  return (
    <div className="relative min-h-[154px] min-w-0 rounded-[26px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,249,250,0.92)_100%)] p-4 shadow-[0_18px_48px_rgba(20,33,48,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          Write-Off
        </div>
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 text-white shadow-lg">
          <Ban className="h-5 w-5" />
        </div>
      </div>

      <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 flex-col items-center justify-center text-center">
        <div className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">
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

      <div className="absolute bottom-4 left-4 text-sm text-slate-500">Written off</div>
      <div className="absolute bottom-4 right-4 rounded-full bg-slate-950 px-3 py-1 text-sm font-bold text-white">
        {count}
      </div>
    </div>
  );
}

function SectionTable({
  title,
  description,
  rows,
  columns,
  loading,
  actionRenderer,
  editRenderer,
  accent = "slate",
  stageTotal = 0,
  stageTotalLabel = "Total Amount",
}) {
  const officialFeesTotal = rows.reduce(
    (total, row) => total + getRowOfficialFees(row),
    0
  );
  const serviceChargesTotal = rows.reduce(
    (total, row) => total + getRowServiceCharges(row),
    0
  );
  const gstTotal = rows.reduce((total, row) => total + getRowGstAmount(row), 0);
  const totalInvoiceBillAmount = rows.reduce(
    (total, row) => total + getRowInvoiceBillAmount(row),
    0
  );
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
      totalBox: "border-slate-200 bg-slate-50 text-slate-900",
      totalLabel: "text-slate-500",
    },
  };

  accentMap.amber.totalBox = "border-amber-200 bg-amber-50 text-amber-950";
  accentMap.amber.totalLabel = "text-amber-700";
  accentMap.blue.totalBox = "border-sky-200 bg-sky-50 text-sky-950";
  accentMap.blue.totalLabel = "text-sky-700";
  accentMap.green.totalBox = "border-emerald-200 bg-emerald-50 text-emerald-950";
  accentMap.green.totalLabel = "text-emerald-700";

  const tone = accentMap[accent] || accentMap.slate;

  return (
    <WorkdeskSection
      title={title}
      description={description}
      aside={<WorkdeskPill tone={tone.pill}>{rows.length} records</WorkdeskPill>}
      className={tone.sectionClass}
      bodyClassName="p-0"
    >
      <div className="border-b border-slate-200/80 bg-white/75 px-4 py-3 md:px-5">
        <div
          className={[
            "inline-flex min-w-full flex-col rounded-2xl border px-4 py-3 shadow-sm sm:min-w-[420px] sm:max-w-xl",
            tone.totalBox,
          ].join(" ")}
        >
          <span className={["text-[10px] font-bold uppercase tracking-[0.18em]", tone.totalLabel].join(" ")}>
            {stageTotalLabel}
          </span>
          <span className="mt-1 font-mono text-2xl font-bold tracking-normal">
            {formatAmount(stageTotal)}
          </span>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white/70 px-3 py-2">
              <div className={["text-[10px] font-bold uppercase tracking-[0.16em]", tone.totalLabel].join(" ")}>
                Official Fees
              </div>
              <div className="mt-1 font-mono text-lg font-bold tracking-normal">
                {formatAmount(officialFeesTotal)}
              </div>
            </div>
            <div className="rounded-xl bg-white/70 px-3 py-2">
              <div className={["text-[10px] font-bold uppercase tracking-[0.16em]", tone.totalLabel].join(" ")}>
                Service Charges
              </div>
              <div className="mt-1 font-mono text-lg font-bold tracking-normal">
                {formatAmount(serviceChargesTotal)}
              </div>
            </div>
            <div className="rounded-xl bg-white/70 px-3 py-2">
              <div className={["text-[10px] font-bold uppercase tracking-[0.16em]", tone.totalLabel].join(" ")}>
                GST
              </div>
              <div className="mt-1 font-mono text-lg font-bold tracking-normal">
                {formatAmount(gstTotal)}
              </div>
            </div>
            <div className="rounded-xl bg-white/70 px-3 py-2">
              <div className={["text-[10px] font-bold uppercase tracking-[0.16em]", tone.totalLabel].join(" ")}>
                Total Invoice Bill Amount
              </div>
              <div className="mt-1 font-mono text-lg font-bold tracking-normal">
                {formatAmount(totalInvoiceBillAmount)}
              </div>
            </div>
          </div>
        </div>
      </div>
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
                  {editRenderer ? <th className="px-4 py-3 text-left">Edit</th> : null}
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
                    {editRenderer ? (
                      <td className="px-4 py-3 text-left">
                        {editRenderer(row)}
                      </td>
                    ) : null}
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

function InvoiceEditModal({
  row,
  mode,
  form,
  submitting,
  onChange,
  onClose,
  onSubmit,
}) {
  if (!row) return null;

  const netAmount = roundAmount(parseAmount(form.officialFee) + parseAmount(form.serviceCharges));
  const gstAmount = parseAmount(form.gstAmount);
  const tdsAmount = parseAmount(form.tdsAmount);
  const totalAmount = roundAmount(netAmount + gstAmount);
  const receivedAmount = roundAmount(totalAmount - tdsAmount);
  const isPaid = mode === "Invoice Paid";

  const inputClass =
    "h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-[28px] border border-white/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {mode}
            </div>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">Edit Invoice Details</h2>
            <p className="mt-1 text-sm text-slate-500">
              {row.task.serviceRequestId} · {row.task.clientName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
            aria-label="Close edit invoice"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 px-5 py-5">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Invoice Number
              <input
                className={inputClass}
                value={form.invoiceNumber}
                onChange={(event) => onChange("invoiceNumber", event.target.value)}
                placeholder="Enter invoice number"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Invoice Date
              <input
                type="date"
                className={inputClass}
                value={form.issuedDate}
                onChange={(event) => onChange("issuedDate", event.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Via
              <select
                className={inputClass}
                value={form.quotationMode}
                onChange={(event) => onChange("quotationMode", event.target.value)}
              >
                <option value="">Select via</option>
                <option value="Via WhatsApp">Via WhatsApp</option>
                <option value="Email">Email</option>
                <option value="Agreed">Agreed</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Invoice Official Fees
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={form.officialFee}
                onChange={(event) => onChange("officialFee", event.target.value)}
                placeholder="0"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Invoice Service Fees
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={form.serviceCharges}
                onChange={(event) => onChange("serviceCharges", event.target.value)}
                placeholder="0"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Invoice Net Amount
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={toInputNumber(netAmount, "0")}
                readOnly
                placeholder="0"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              GST
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={form.gstAmount}
                onChange={(event) => onChange("gstAmount", event.target.value)}
                placeholder="0"
              />
            </label>
            {isPaid ? (
              <>
                <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                  Paid Date
                  <input
                    type="date"
                    className={inputClass}
                    value={form.paidDate}
                    onChange={(event) => onChange("paidDate", event.target.value)}
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                  TDS Amount
                  <input
                    type="number"
                    step="0.01"
                    className={inputClass}
                    value={form.tdsAmount}
                    onChange={(event) => onChange("tdsAmount", event.target.value)}
                    placeholder="0"
                  />
                </label>
              </>
            ) : null}
          </div>

          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Total Amount</div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-950">{formatAmount(totalAmount)}</div>
            </div>
            {isPaid ? (
              <>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">TDS Amount</div>
                  <div className="mt-1 font-mono text-lg font-bold text-slate-950">{formatAmount(tdsAmount)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Received Amount</div>
                  <div className="mt-1 font-mono text-lg font-bold text-slate-950">{formatAmount(receivedAmount)}</div>
                </div>
              </>
            ) : null}
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InvoiceDesk() {
  const { user } = useWorkdeskAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pending for Invoicing");
  const [editingRow, setEditingRow] = useState(null);
  const [editMode, setEditMode] = useState("");
  const [invoiceEditForm, setInvoiceEditForm] = useState({
    invoiceNumber: "",
    issuedDate: "",
    quotationMode: "",
    officialFee: "",
    serviceCharges: "",
    netAmount: "",
    gstAmount: "",
    paidDate: "",
    tdsAmount: "0",
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

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
        if (!["Pending for Invoicing", "Invoice Raised", "Invoice Paid", "Invoice Write-Off"].includes(task.status)) return false;
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
  const writeOffRows = useMemo(() => rows.filter((row) => row.task.status === "Invoice Write-Off"), [rows]);
  const getOfficialAndServiceTotal = useCallback(
    (stageRows) =>
      stageRows.reduce(
        (total, row) => total + parseAmount(row.task.officialFee) + parseAmount(row.task.serviceCharges),
        0
      ),
    []
  );
  const getInvoiceTotal = useCallback(
    (stageRows) =>
      stageRows.reduce(
        (total, row) => total + getRowInvoiceBillAmount(row),
        0
      ),
    []
  );
  const pendingTotalAmount = useMemo(
    () => getOfficialAndServiceTotal(pendingRows),
    [getOfficialAndServiceTotal, pendingRows]
  );
  const raisedInvoiceTotal = useMemo(
    () => getInvoiceTotal(raisedRows),
    [getInvoiceTotal, raisedRows]
  );
  const paidInvoiceTotal = useMemo(
    () => getInvoiceTotal(paidRows),
    [getInvoiceTotal, paidRows]
  );
  const writeOffInvoiceTotal = useMemo(
    () => getInvoiceTotal(writeOffRows),
    [getInvoiceTotal, writeOffRows]
  );

  const openInManageView = (row) => {
    navigate(`/workdesk/tasks?taskId=${row.task._id}`);
  };

  const openInvoiceEditor = (row, mode) => {
    if (!row.invoice?._id) {
      errorToast("Invoice details are not available for this task.");
      return;
    }

    setEditingRow(row);
    setEditMode(mode);
    setInvoiceEditForm({
      invoiceNumber: row.invoice?.invoiceNumber || "",
      issuedDate: toInputDate(row.invoice?.issuedDate),
      quotationMode: row.invoice?.quotationMode || row.task.quotation || "",
      officialFee: toInputNumber(row.invoice?.officialFee ?? row.task.officialFee),
      serviceCharges: toInputNumber(row.invoice?.serviceCharges ?? row.task.serviceCharges),
      netAmount: toInputNumber(row.invoice?.netAmount),
      gstAmount: toInputNumber(row.invoice?.gstAmount),
      paidDate: toInputDate(row.invoice?.paidDate),
      tdsAmount: toInputNumber(row.invoice?.tdsAmount, "0"),
    });
  };

  const closeInvoiceEditor = () => {
    if (editSubmitting) return;
    setEditingRow(null);
    setEditMode("");
  };

  const updateInvoiceEditField = (field, value) => {
    setInvoiceEditForm((current) => ({ ...current, [field]: value }));
  };

  const submitInvoiceEdit = async (event) => {
    event.preventDefault();
    if (!editingRow?.invoice?._id) return;

    const netAmount = roundAmount(
      parseAmount(invoiceEditForm.officialFee) + parseAmount(invoiceEditForm.serviceCharges)
    );
    const gstAmount = parseAmount(invoiceEditForm.gstAmount);

    if (invoiceEditForm.officialFee === "" && invoiceEditForm.serviceCharges === "") {
      errorToast("Invoice official fees or invoice service fees are required.");
      return;
    }

    if (gstAmount === 0 && invoiceEditForm.gstAmount === "") {
      errorToast("GST amount is required.");
      return;
    }

    try {
      setEditSubmitting(true);
      await updateWorkdeskInvoiceApi(editingRow.invoice._id, {
        invoiceNumber: invoiceEditForm.invoiceNumber,
        issuedDate: invoiceEditForm.issuedDate,
        quotationMode: invoiceEditForm.quotationMode,
        officialFee: invoiceEditForm.officialFee === "" ? null : parseAmount(invoiceEditForm.officialFee),
        serviceCharges: invoiceEditForm.serviceCharges === "" ? null : parseAmount(invoiceEditForm.serviceCharges),
        netAmount,
        gstAmount,
        paidDate: invoiceEditForm.paidDate,
        tdsAmount: parseAmount(invoiceEditForm.tdsAmount) ?? 0,
      });
      await loadData({ silent: true });
      successToast("Invoice details updated successfully.");
      setEditingRow(null);
      setEditMode("");
    } catch (error) {
      errorToast(getApiErrorMessage(error, "Unable to update invoice details."));
    } finally {
      setEditSubmitting(false);
    }
  };

  const editButtonRenderer = (mode) => (row) =>
    isAdmin ? (
      <button
        type="button"
        onClick={() => openInvoiceEditor(row, mode)}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </button>
    ) : (
      <span className="text-xs text-slate-400">-</span>
    );

  const pendingColumns = [
    { key: "quoteAmount", label: "Quote Amount", render: (row) => formatAmount(row.invoice?.netAmount) },
    { key: "via", label: "Via", render: (row) => formatDisplayValue(row.task.quotation) },
    { key: "officialFee", label: "Official Fees", render: (row) => formatAmount(row.task.officialFee) },
    { key: "serviceCharges", label: "Service Charges", render: (row) => formatAmount(row.task.serviceCharges) },
  ];

  const raisedColumns = [
    { key: "invoiceNumber", label: "Inv No", render: (row) => formatDisplayValue(row.invoice?.invoiceNumber) },
    { key: "invoiceDate", label: "Inv Date", render: (row) => formatDate(row.invoice?.issuedDate) },
    { key: "officialFee", label: "Official Fees", render: (row) => formatAmount(row.invoice?.officialFee) },
    { key: "serviceCharges", label: "Service Charges", render: (row) => formatAmount(row.invoice?.serviceCharges) },
    { key: "gstAmount", label: "GST", render: (row) => formatAmount(row.invoice?.gstAmount) },
    { key: "invoiceAmount", label: "Total Invoice Bill Amount", render: (row) => formatAmount(getRowInvoiceBillAmount(row)) },
  ];

  const paidColumns = [
    { key: "invoiceNumber", label: "Inv No", render: (row) => formatDisplayValue(row.invoice?.invoiceNumber) },
    { key: "invoiceDate", label: "Inv Date", render: (row) => formatDate(row.invoice?.issuedDate) },
    { key: "officialFee", label: "Official Fees", render: (row) => formatAmount(row.invoice?.officialFee) },
    { key: "serviceCharges", label: "Service Charges", render: (row) => formatAmount(row.invoice?.serviceCharges) },
    { key: "gstAmount", label: "GST", render: (row) => formatAmount(row.invoice?.gstAmount) },
    { key: "invoiceAmount", label: "Total Invoice Bill Amount", render: (row) => formatAmount(getRowInvoiceBillAmount(row)) },
    { key: "paidDate", label: "Pay Dt", render: (row) => formatDate(row.invoice?.paidDate) },
    { key: "receivedAmount", label: "Recd Amt", render: (row) => formatAmount(row.invoice?.receivedAmount) },
    { key: "tdsAmount", label: "TDS Amt", render: (row) => formatAmount(row.invoice?.tdsAmount) },
  ];

  const writeOffColumns = [
    { key: "via", label: "Via", render: (row) => formatDisplayValue(row.task.quotation) },
    { key: "officialFee", label: "Official Fees", render: (row) => formatAmount(row.task.officialFee) },
    { key: "serviceCharges", label: "Service Charges", render: (row) => formatAmount(row.task.serviceCharges) },
    {
      key: "writeOffAmount",
      label: "Write-Off Amt",
      render: (row) => formatAmount(getRowInvoiceBillAmount(row)),
    },
  ];

  const invoiceTabs = [
    {
      key: "Pending for Invoicing",
      label: "Pending for Invoicing",
      description: "Tasks appear here automatically when an employee moves a workflow into the pending invoicing stage.",
      rows: pendingRows,
      columns: pendingColumns,
      total: pendingTotalAmount,
      totalLabel: "Official Fees + Service Charges",
      accent: "amber",
      actionRenderer: (row) =>
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
        ),
    },
    {
      key: "Invoice Raised",
      label: "Invoice Raised",
      description: "Invoices move into this section once billing has been generated and is ready for payment follow-up.",
      rows: raisedRows,
      columns: raisedColumns,
      total: raisedInvoiceTotal,
      totalLabel: "Invoice Amount Total",
      accent: "blue",
      editRenderer: editButtonRenderer("Invoice Raised"),
      actionRenderer: (row) =>
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
        ),
    },
    {
      key: "Invoice Paid",
      label: "Invoice Paid",
      description: "Completed payment records remain here as the polished final ledger view.",
      rows: paidRows,
      columns: paidColumns,
      total: paidInvoiceTotal,
      totalLabel: "Invoice Amount Total",
      accent: "green",
      editRenderer: editButtonRenderer("Invoice Paid"),
      actionRenderer: () => <WorkdeskPill tone="success">Completed</WorkdeskPill>,
    },
    {
      key: "Invoice Write-Off",
      label: "Invoice Write-Off",
      description: "Tasks written off from billing appear here as a separate invoice closure stage.",
      rows: writeOffRows,
      columns: writeOffColumns,
      total: writeOffInvoiceTotal,
      totalLabel: "Write-Off Amount Total",
      accent: "slate",
      actionRenderer: () => <WorkdeskPill tone="dark">Written Off</WorkdeskPill>,
    },
  ];
  const selectedTab = invoiceTabs.find((tab) => tab.key === activeTab) || invoiceTabs[0];

  return (
    <WorkdeskPage
      compact
      eyebrow="Billing Workspace"
      title="Compact invoice workflow"
      description="A tighter billing workspace that keeps invoice stages visible without turning the page into a long dashboard."
      hero={
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <PendingInvoiceCard count={pendingRows.length} amount={pendingTotalAmount} />
            <RaisedInvoiceCard count={raisedRows.length} amount={raisedInvoiceTotal} />
            <PaidInvoiceCard count={paidRows.length} amount={paidInvoiceTotal} />
            <WriteOffInvoiceCard count={writeOffRows.length} amount={writeOffInvoiceTotal} />
          </div>
        </div>
      }
    >
      <div className="rounded-[28px] border border-slate-200 bg-white/88 p-2 shadow-[0_18px_50px_rgba(20,33,48,0.08)]">
        <div className="grid gap-2 md:grid-cols-4">
          {invoiceTabs.map((tab) => {
            const active = selectedTab.key === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={[
                  "rounded-[22px] border px-4 py-3 text-left transition",
                  active
                    ? "border-slate-950 bg-slate-950 text-white shadow-[0_16px_36px_rgba(15,23,42,0.18)]"
                    : "border-transparent bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-950",
                ].join(" ")}
              >
                <div className="text-sm font-bold">{tab.label}</div>
                <div className={["mt-1 text-xs", active ? "text-slate-300" : "text-slate-500"].join(" ")}>
                  {tab.rows.length} records
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <SectionTable
        title={selectedTab.title || selectedTab.label}
        description={selectedTab.description}
        rows={selectedTab.rows}
        columns={selectedTab.columns}
        loading={loading}
        accent={selectedTab.accent}
        stageTotal={selectedTab.total}
        stageTotalLabel={selectedTab.totalLabel}
        editRenderer={selectedTab.editRenderer}
        actionRenderer={selectedTab.actionRenderer}
      />
      <InvoiceEditModal
        row={editingRow}
        mode={editMode}
        form={invoiceEditForm}
        submitting={editSubmitting}
        onChange={updateInvoiceEditField}
        onClose={closeInvoiceEditor}
        onSubmit={submitInvoiceEdit}
      />
    </WorkdeskPage>
  );
}
