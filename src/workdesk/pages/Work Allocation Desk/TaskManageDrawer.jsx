import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import { X, History, MessageSquare, Mail, FileText } from "lucide-react";

import {
  addWorkdeskTaskCommentApi,
  payWorkdeskInvoiceApi,
  raiseWorkdeskInvoiceApi,
  updateWorkdeskTaskApi,
  updateWorkdeskTaskJobWorkApi,
  updateWorkdeskTaskStatusApi,
} from "@/api/workdesk.api";
import { useWorkdeskAuthStore } from "@/store/workdeskAuth.store";
import { errorToast, successToast } from "@/utils/customToast";
import { getApiErrorMessage } from "@/utils/apiError";

const ADMIN_ONLY_WORKFLOW_STATUSES = ["Invoice Raised", "Invoice Paid", "Invoice Write-Off", "Strike Off"];

function formatAmount(value) {
  if (value === null || value === undefined || value === "") return "-";

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return "-";
  }

  return numericValue.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatDisplayValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  const numericValue = Number(value);
  if (Number.isFinite(numericValue) && String(value).trim() !== "") {
    return formatAmount(numericValue);
  }
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

function parseAmount(value) {
  if (value === null || value === undefined || value === "") return null;
  const normalized = String(value).replace(/,/g, "").trim();
  const numericValue = Number(normalized);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function roundAmount(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
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

export default function TaskManageDrawer({
  task,
  onClose,
  onTaskUpdated,
  workflowStatuses = [],
  serviceTypes = {},
  staff = [],
}) {
  const { user } = useWorkdeskAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const [selectedStatus, setSelectedStatus] = useState(task.status);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [jobWorkSubmitting, setJobWorkSubmitting] = useState(false);
  const [selectedJobWorkStatus, setSelectedJobWorkStatus] = useState(
    task.jobWorkStatus && task.jobWorkStatus !== "Active" ? task.jobWorkStatus : ""
  );
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: "",
    issuedDate: "",
    officialFee: "",
    serviceCharges: "",
    netAmount: "",
    gstAmount: "",
  });
  const [paymentForm, setPaymentForm] = useState({
    paidDate: "",
    receivedAmount: "",
    tdsAmount: "0",
  });
  const [editForm, setEditForm] = useState({
    serviceType: task.serviceType || "",
    subType: task.subType || "",
    assignedToUserId: task.assignedToUserId || "",
    emailSender: task.emailSender || "",
    emailDate: "",
    details: task.details || "",
    quotation: task.quotation || "",
    officialFee: "",
    serviceCharges: "",
    workLevel: task.workLevel || "",
    slaDays: task.slaDays || 5,
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  const history = useMemo(() => task.history || [], [task.history]);
  const comments = useMemo(() => task.comments || [], [task.comments]);
  const invoice = useMemo(() => task.invoice || null, [task.invoice]);
  const visibleWorkflowStatuses = useMemo(() => {
    const statuses = workflowStatuses || [];
    const filteredStatuses = isAdmin
      ? statuses
      : statuses.filter((status) => !ADMIN_ONLY_WORKFLOW_STATUSES.includes(status));
    return filteredStatuses.includes(task.status) ? filteredStatuses : [...filteredStatuses, task.status];
  }, [isAdmin, task.status, workflowStatuses]);

  const quotationMode = invoice?.quotationMode || task.quotation || "";
  const quotationOfficialFee = parseAmount(task.officialFee) ?? 0;
  const quotationServiceCharges = parseAmount(task.serviceCharges) ?? 0;
  const invoiceOfficialFee = parseAmount(invoiceForm.officialFee) ?? parseAmount(invoice?.officialFee) ?? quotationOfficialFee;
  const invoiceServiceFees =
    parseAmount(invoiceForm.serviceCharges) ?? parseAmount(invoice?.serviceCharges) ?? quotationServiceCharges;
  const fallbackNetAmount = roundAmount(invoiceOfficialFee + invoiceServiceFees);
  const previewGstAmount = parseAmount(invoiceForm.gstAmount) ?? parseAmount(invoice?.gstAmount) ?? 0;
  const previewTotalAmount = roundAmount(fallbackNetAmount + previewGstAmount);
  const billAmount = parseAmount(invoice?.totalAmount) ?? previewTotalAmount;
  const paymentTdsAmount = parseAmount(paymentForm.tdsAmount) ?? 0;
  const calculatedReceivedAmount = roundAmount(billAmount - paymentTdsAmount);

  const showInvoiceSection =
    isAdmin && (selectedStatus === "Invoice Raised" || selectedStatus === "Invoice Paid" || Boolean(invoice));
  const invoiceLocked = ["Invoice Raised", "Invoice Paid", "Invoice Write-Off"].includes(task.status) || Boolean(invoice);
  const showInvoiceEditor = isAdmin && selectedStatus === "Invoice Raised" && !invoiceLocked;
  const paymentLocked = task.status === "Invoice Paid" || invoice?.status === "Invoice Paid";
  const showPaymentEditor =
    isAdmin && selectedStatus === "Invoice Paid" && Boolean(invoice) && !paymentLocked;
  const isNonAdminInvoiceStatus = !isAdmin && ADMIN_ONLY_WORKFLOW_STATUSES.includes(task.status);
  const currentJobWorkStatus = task.jobWorkStatus || "Active";

  useEffect(() => {
    setSelectedStatus(task.status);
  }, [task._id, task.status]);

  useEffect(() => {
    setSelectedJobWorkStatus(
      task.jobWorkStatus && task.jobWorkStatus !== "Active" ? task.jobWorkStatus : ""
    );
  }, [task._id, task.jobWorkStatus]);

  useEffect(() => {
    setInvoiceForm({
      invoiceNumber: invoice?.invoiceNumber || "",
      issuedDate: toInputDate(invoice?.issuedDate || new Date()),
      officialFee: toInputNumber(invoice?.officialFee ?? task.officialFee),
      serviceCharges: toInputNumber(invoice?.serviceCharges ?? task.serviceCharges),
      netAmount: toInputNumber(invoice?.netAmount ?? roundAmount((task.officialFee || 0) + (task.serviceCharges || 0))),
      gstAmount: toInputNumber(invoice?.gstAmount),
    });
  }, [
    invoice?.gstAmount,
    invoice?.invoiceNumber,
    invoice?.issuedDate,
    invoice?.netAmount,
    invoice?.officialFee,
    invoice?.serviceCharges,
    task._id,
    task.officialFee,
    task.serviceCharges,
  ]);

  useEffect(() => {
    setPaymentForm({
      paidDate: toInputDate(invoice?.paidDate || new Date()),
      receivedAmount: toInputNumber(
        invoice?.receivedAmount ?? roundAmount((invoice?.totalAmount || 0) - (invoice?.tdsAmount || 0))
      ),
      tdsAmount: toInputNumber(invoice?.tdsAmount, "0"),
    });
  }, [invoice?.paidDate, invoice?.receivedAmount, invoice?.tdsAmount, invoice?.totalAmount, task._id]);

  useEffect(() => {
    setPaymentForm((current) => ({
      ...current,
      receivedAmount: toInputNumber(calculatedReceivedAmount, "0"),
    }));
  }, [calculatedReceivedAmount]);

  useEffect(() => {
    setEditForm({
      serviceType: task.serviceType || "",
      subType: task.subType || "",
      assignedToUserId: task.assignedToUserId || "",
      emailSender: task.emailSender || "",
      emailDate: task.emailDate ? new Date(task.emailDate).toISOString().slice(0, 16) : "",
      details: task.details || "",
      quotation: task.quotation || "",
      officialFee: toInputNumber(task.officialFee),
      serviceCharges: toInputNumber(task.serviceCharges),
      workLevel: task.workLevel || "",
      slaDays: task.slaDays || 5,
    });
  }, [task]);

  const saveAllocationEdits = async () => {
    if (!isAdmin) return;

    try {
      setEditSubmitting(true);
      const payload = {
        serviceType: editForm.serviceType,
        subType: editForm.subType,
        assignedToUserId: editForm.assignedToUserId,
        emailSender: editForm.emailSender,
        emailDate: editForm.emailDate,
        details: editForm.details,
        workLevel: editForm.workLevel,
        slaDays: Number(editForm.slaDays) > 0 ? Number(editForm.slaDays) : 5,
      };

      if (!invoiceLocked) {
        payload.quotation = editForm.quotation;
        payload.officialFee = editForm.officialFee === "" ? null : parseAmount(editForm.officialFee);
        payload.serviceCharges =
          editForm.serviceCharges === "" ? null : parseAmount(editForm.serviceCharges);
      }

      const updatedTask = await updateWorkdeskTaskApi(task._id, payload);
      onTaskUpdated?.(updatedTask);
      successToast("Allocated work updated successfully.");
    } catch (error) {
      errorToast(getApiErrorMessage(error, "Unable to update allocated work."));
    } finally {
      setEditSubmitting(false);
    }
  };

  const sendStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === task.status) {
      errorToast("Select a different status before sending.");
      return;
    }

    if (selectedStatus === "Invoice Raised") {
      const invoiceOfficialFeeValue = parseAmount(invoiceForm.officialFee);
      const invoiceServiceChargesValue = parseAmount(invoiceForm.serviceCharges);
      const invoiceGstAmountValue = parseAmount(invoiceForm.gstAmount);
      const requiredInvoiceFields = [
        ["Invoice Number", invoiceForm.invoiceNumber],
        ["Invoice Date", invoiceForm.issuedDate],
        ["Quotation", quotationMode],
        ["Invoice Official Fees", invoiceForm.officialFee],
        ["Invoice Service Fees", invoiceForm.serviceCharges],
        ["GST", invoiceForm.gstAmount],
      ];
      const missingInvoiceFields = requiredInvoiceFields
        .filter(([, value]) => value === null || value === undefined || String(value).trim() === "")
        .map(([label]) => label);

      if (missingInvoiceFields.length) {
        errorToast(`${missingInvoiceFields.join(", ")} required before raising the invoice.`);
        return;
      }

      const invalidInvoiceAmount = [
        ["Invoice Official Fees", invoiceOfficialFeeValue],
        ["Invoice Service Fees", invoiceServiceChargesValue],
        ["GST", invoiceGstAmountValue],
      ].find(([, value]) => value === null);

      if (invalidInvoiceAmount) {
        errorToast(`${invalidInvoiceAmount[0]} must be a valid amount.`);
        return;
      }

      const invoiceNetAmountValue = roundAmount(invoiceOfficialFeeValue + invoiceServiceChargesValue);

      try {
        setSubmitting(true);
        const updatedTask = await raiseWorkdeskInvoiceApi({
          taskId: task._id,
          invoiceNumber: invoiceForm.invoiceNumber.trim(),
          issuedDate: invoiceForm.issuedDate,
          quotationMode,
          officialFee: invoiceOfficialFeeValue,
          serviceCharges: invoiceServiceChargesValue,
          netAmount: invoiceNetAmountValue,
          gstAmount: invoiceGstAmountValue,
        });
        onTaskUpdated?.(updatedTask);
        successToast("Invoice raised successfully.");
      } catch (error) {
        errorToast(getApiErrorMessage(error, "Unable to raise invoice."));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (selectedStatus === "Invoice Paid") {
      if (!invoice?._id) {
        errorToast("Raise the invoice first before marking it as paid.");
        return;
      }

      try {
        setSubmitting(true);
        const updatedTask = await payWorkdeskInvoiceApi(invoice._id, {
          paidDate: paymentForm.paidDate,
          tdsAmount: parseAmount(paymentForm.tdsAmount) ?? 0,
        });
        onTaskUpdated?.(updatedTask);
        successToast("Invoice marked as paid successfully.");
      } catch (error) {
        errorToast(getApiErrorMessage(error, "Unable to mark invoice as paid."));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    try {
      setSubmitting(true);
      const updatedTask = await updateWorkdeskTaskStatusApi(task._id, selectedStatus);
      onTaskUpdated?.(updatedTask);
      successToast("Workflow status updated successfully.");
    } catch (error) {
      errorToast(getApiErrorMessage(error, "Unable to update workflow status."));
    } finally {
      setSubmitting(false);
    }
  };

  const addComment = async () => {
    if (!comment.trim()) {
      errorToast("Comment text required.");
      return;
    }

    try {
      setSubmitting(true);
      const updatedTask = await addWorkdeskTaskCommentApi(task._id, comment);
      setComment("");
      onTaskUpdated?.(updatedTask);
      successToast("Comment posted successfully.");
    } catch (error) {
      errorToast(getApiErrorMessage(error, "Unable to post comment."));
    } finally {
      setSubmitting(false);
    }
  };

  const saveJobWorkUpdate = async () => {
    if (!selectedJobWorkStatus) {
      errorToast("Select a job work update before saving.");
      return;
    }

    if (selectedJobWorkStatus === currentJobWorkStatus) {
      errorToast("This job work update is already applied.");
      return;
    }

    try {
      setJobWorkSubmitting(true);
      const updatedTask = await updateWorkdeskTaskJobWorkApi(task._id, selectedJobWorkStatus);
      onTaskUpdated?.(updatedTask);
      successToast(
        selectedJobWorkStatus === "Completed"
          ? "Job work marked as completed."
          : "Task marked as strike off."
      );
    } catch (error) {
      errorToast(getApiErrorMessage(error, "Unable to update job work."));
    } finally {
      setJobWorkSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/45 backdrop-blur-[2px]">
      <div className="flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-white/50 bg-[linear-gradient(180deg,#f6fafb_0%,#ffffff_22%)] shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
        <div className="flex justify-between border-b border-slate-200 bg-white/80 p-6 backdrop-blur">
          <div>
            <div className="text-xs font-mono font-bold text-teal-700">
              {task.serviceRequestId}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold tracking-[-0.03em] text-slate-950">{task.clientName}</h2>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700">
                {task.assignedToName || "-"}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {task.serviceType} / {task.subType}
            </p>
            <div className="mt-3">
              <WorkLevelBadge workLevel={task.workLevel} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-emerald-900">
              <FileText className="h-5 w-5 text-emerald-700" />
              Allocation Summary
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-emerald-100 bg-white/90 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Quotation
                </div>
                <div className="mt-2 text-lg font-bold text-slate-900">
                  {formatDisplayValue(task.quotation)}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-white/90 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Official Fee
                </div>
                <div className="mt-2 text-lg font-bold text-slate-900">
                  {formatAmount(task.officialFee)}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-white/90 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Service Charges
                </div>
                <div className="mt-2 text-lg font-bold text-slate-900">
                  {formatAmount(task.serviceCharges)}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center text-sm font-bold text-slate-900">
              <History className="mr-2 h-4 w-4" />
              Application Lifecycle
            </h3>

            <div className="relative space-y-6 border-l border-slate-200 pl-4">
              {history.length === 0 ? <p className="text-sm text-slate-400">No history yet.</p> : null}
              {history.slice().reverse().map((item, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-[9px] top-1 h-3 w-3 rounded-full bg-teal-500" />
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {item.toStatus || item.status || task.status}
                      </div>
                      <div className="text-xs text-slate-500">{item.note}</div>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.timestamp ? new Date(item.timestamp).toLocaleString() : "-"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-sky-200 bg-sky-50/70 p-5">
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-sky-800">
              Update Workflow Status
            </label>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                disabled={submitting || isNonAdminInvoiceStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              >
                {visibleWorkflowStatuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <button
                onClick={sendStatusUpdate}
                disabled={
                  submitting ||
                  isNonAdminInvoiceStatus ||
                  (selectedStatus === "Invoice Raised" && invoiceLocked) ||
                  (selectedStatus === "Invoice Paid" && paymentLocked) ||
                  (!showInvoiceEditor && !showPaymentEditor && selectedStatus === task.status) ||
                  (showPaymentEditor && !invoice?._id)
                }
                className="rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : selectedStatus === "Pending for Invoicing"
                  ? "Verified"
                  : selectedStatus === "Strike Off"
                  ? "Strike Off"
                  : selectedStatus === "Invoice Raised"
                  ? invoiceLocked
                    ? "Invoice Locked"
                    : "Create Invoice"
                  : selectedStatus === "Invoice Paid"
                  ? paymentLocked
                    ? "Payment Locked"
                    : "Save Payment"
                  : selectedStatus === "Invoice Write-Off"
                  ? "Write Off"
                  : "Send"}
              </button>
            </div>
            {selectedStatus === "Pending for Invoicing" ? (
              <p className="mt-3 text-xs font-medium text-sky-800">
                Marking this stage as verified will treat the employee work as completed and move it
                to billing.
              </p>
            ) : null}
            {selectedStatus === "Strike Off" && isAdmin ? (
              <p className="mt-3 text-xs font-medium text-sky-800">
                Striking off this task will cancel it from active execution and keep it available
                only in the admin strike-off view.
              </p>
            ) : null}
            {selectedStatus === "Invoice Write-Off" && isAdmin ? (
              <p className="mt-3 text-xs font-medium text-sky-800">
                Writing off this task will move it out of active execution and into the Invoice
                Write-Off section.
              </p>
            ) : null}
            {isNonAdminInvoiceStatus ? (
              <p className="mt-3 text-xs font-medium text-sky-800">
                Admin completed this task. The final invoice status is shown here for employee tracking.
              </p>
            ) : null}
            {isAdmin && selectedStatus === "Invoice Raised" && invoiceLocked ? (
              <p className="mt-3 text-xs font-medium text-sky-800">
                Invoice details are locked once the invoice has been raised.
              </p>
            ) : null}
            {isAdmin && selectedStatus === "Invoice Paid" && paymentLocked ? (
              <p className="mt-3 text-xs font-medium text-sky-800">
                Payment details are locked once the invoice has been marked paid.
              </p>
            ) : null}
          </div>

          {isAdmin ? (
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
                <FileText className="h-5 w-5 text-slate-600" />
                Edit Allocated Work
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Service
                  </label>
                  <select
                    value={editForm.serviceType}
                    onChange={(e) =>
                      setEditForm((current) => ({
                        ...current,
                        serviceType: e.target.value,
                        subType: "",
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  >
                    <option value="">Select service</option>
                    {Object.keys(serviceTypes).map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Sub Type
                  </label>
                  <select
                    value={editForm.subType}
                    disabled={!editForm.serviceType}
                    onChange={(e) =>
                      setEditForm((current) => ({ ...current, subType: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100 disabled:bg-slate-50"
                  >
                    <option value="">Select sub type</option>
                    {(serviceTypes[editForm.serviceType] || []).map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Assigned Employee
                  </label>
                  <select
                    value={editForm.assignedToUserId}
                    onChange={(e) =>
                      setEditForm((current) => ({ ...current, assignedToUserId: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  >
                    <option value="">Assign employee</option>
                    {staff.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Work Level
                  </label>
                  <select
                    value={editForm.workLevel}
                    onChange={(e) =>
                      setEditForm((current) => ({ ...current, workLevel: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  >
                    <option value="">Select work level</option>
                    <option value="High Risk">High Risk</option>
                    <option value="Pendency">Pendency</option>
                    <option value="Important">Important</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Email / WhatsApp
                  </label>
                  <input
                    value={editForm.emailSender}
                    onChange={(e) =>
                      setEditForm((current) => ({ ...current, emailSender: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Received Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.emailDate}
                    onChange={(e) =>
                      setEditForm((current) => ({ ...current, emailDate: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    SLA Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.slaDays}
                    onChange={(e) =>
                      setEditForm((current) => ({ ...current, slaDays: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Quotation
                  </label>
                  <select
                    value={editForm.quotation}
                    disabled={invoiceLocked}
                    onChange={(e) =>
                      setEditForm((current) => ({ ...current, quotation: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100 disabled:bg-slate-50"
                  >
                    <option value="">Select quotation type</option>
                    <option value="Via WhatsApp">Via WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Agreed">Agreed</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Official Fee
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.officialFee}
                    disabled={invoiceLocked}
                    onChange={(e) =>
                      setEditForm((current) => ({ ...current, officialFee: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Service Charges
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.serviceCharges}
                    disabled={invoiceLocked}
                    onChange={(e) =>
                      setEditForm((current) => ({ ...current, serviceCharges: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100 disabled:bg-slate-50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Special Instructions
                  </label>
                  <textarea
                    value={editForm.details}
                    onChange={(e) =>
                      setEditForm((current) => ({ ...current, details: e.target.value }))
                    }
                    className="min-h-[96px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  />
                </div>
              </div>

              {invoiceLocked ? (
                <p className="mt-3 text-xs font-medium text-slate-500">
                  Quotation, official fee, and service charges are locked because invoice details
                  have already been raised.
                </p>
              ) : null}

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={saveAllocationEdits}
                  disabled={editSubmitting}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {editSubmitting ? "Saving..." : "Save Allocation Edits"}
                </button>
              </div>
            </div>
          ) : null}

          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50/70 p-5">
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
              Update Job Work
            </label>
            <div className="flex gap-2">
              <select
                value={selectedJobWorkStatus}
                disabled={jobWorkSubmitting}
                onChange={(e) => setSelectedJobWorkStatus(e.target.value)}
                className="flex-1 rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
              >
                <option value="">Select job work status</option>
                <option value="Completed">Completed</option>
                <option value="Strike Off">Strike Off</option>
              </select>
              <button
                onClick={saveJobWorkUpdate}
                disabled={jobWorkSubmitting || !selectedJobWorkStatus || selectedJobWorkStatus === currentJobWorkStatus}
                className="rounded-2xl bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
              >
                {jobWorkSubmitting
                  ? "Saving..."
                  : selectedJobWorkStatus === "Completed"
                  ? "Mark Completed"
                  : selectedJobWorkStatus === "Strike Off"
                  ? "Mark Strike Off"
                  : "Save"}
              </button>
            </div>
            <p className="mt-3 text-xs font-medium text-emerald-800">
              Current Job Work: <span className="font-bold">{currentJobWorkStatus}</span>
            </p>
            {selectedJobWorkStatus === "Completed" ? (
              <p className="mt-2 text-xs font-medium text-emerald-800">
                Saving this will place the task in the Completed Smart Filter view.
              </p>
            ) : null}
            {selectedJobWorkStatus === "Strike Off" ? (
              <p className="mt-2 text-xs font-medium text-emerald-800">
                Saving this will place the task in the Strike Off Smart Filter view.
              </p>
            ) : null}
          </div>

          {showInvoiceSection ? (
            <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-violet-900">
                <FileText className="h-5 w-5 text-violet-700" />
                Invoice Raised
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-violet-100 bg-white/90 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
                    Invoice Number
                  </div>
                  {showInvoiceEditor ? (
                    <input
                      type="text"
                      value={invoiceForm.invoiceNumber}
                      onChange={(e) =>
                        setInvoiceForm((current) => ({ ...current, invoiceNumber: e.target.value }))
                      }
                      placeholder="Enter invoice number"
                      className="mt-2 w-full rounded-lg border border-violet-100 px-3 py-2 text-sm"
                    />
                  ) : (
                    <div className="mt-2 text-base font-bold text-slate-900">
                      {invoice?.invoiceNumber || "-"}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-violet-100 bg-white/90 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
                    Invoice Date
                  </div>
                  {showInvoiceEditor ? (
                    <input
                      type="date"
                      value={invoiceForm.issuedDate}
                      onChange={(e) =>
                        setInvoiceForm((current) => ({ ...current, issuedDate: e.target.value }))
                      }
                      className="mt-2 w-full rounded-lg border border-violet-100 px-3 py-2 text-sm"
                    />
                  ) : (
                    <div className="mt-2 text-base font-bold text-slate-900">
                      {invoice?.issuedDate
                        ? new Date(invoice.issuedDate).toLocaleDateString("en-IN")
                        : "-"}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-violet-100 bg-white/90 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
                    Quotation Official Fee
                  </div>
                  <div className="mt-2 text-base font-bold text-slate-900">
                    {formatAmount(quotationOfficialFee)}
                  </div>
                </div>

                <div className="rounded-xl border border-violet-100 bg-white/90 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
                    Quotation Service Charges
                  </div>
                  <div className="mt-2 text-base font-bold text-slate-900">
                    {formatAmount(quotationServiceCharges)}
                  </div>
                </div>

                <div className="rounded-xl border border-violet-100 bg-white/90 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
                    Invoice Official Fees
                  </div>
                  {showInvoiceEditor ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={invoiceForm.officialFee}
                      onChange={(e) =>
                        setInvoiceForm((current) => ({ ...current, officialFee: e.target.value }))
                      }
                      className="mt-2 w-full rounded-lg border border-violet-100 px-3 py-2 text-sm"
                    />
                  ) : (
                    <div className="mt-2 text-base font-bold text-slate-900">
                      {formatAmount(invoice?.officialFee)}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-violet-100 bg-white/90 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
                    Invoice Service Fees
                  </div>
                  {showInvoiceEditor ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={invoiceForm.serviceCharges}
                      onChange={(e) =>
                        setInvoiceForm((current) => ({ ...current, serviceCharges: e.target.value }))
                      }
                      className="mt-2 w-full rounded-lg border border-violet-100 px-3 py-2 text-sm"
                    />
                  ) : (
                    <div className="mt-2 text-base font-bold text-slate-900">
                      {formatAmount(invoice?.serviceCharges)}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-violet-100 bg-white/90 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
                    Invoice Net Amount
                  </div>
                  <div className="mt-2 text-base font-bold text-slate-900">
                    {formatAmount(invoice?.netAmount ?? fallbackNetAmount)}
                  </div>
                </div>

                <div className="rounded-xl border border-violet-100 bg-white/90 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
                    GST
                  </div>
                  {showInvoiceEditor ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={invoiceForm.gstAmount}
                      onChange={(e) =>
                        setInvoiceForm((current) => ({ ...current, gstAmount: e.target.value }))
                      }
                      className="mt-2 w-full rounded-lg border border-violet-100 px-3 py-2 text-sm"
                    />
                  ) : (
                    <div className="mt-2 text-base font-bold text-slate-900">
                      {formatAmount(invoice?.gstAmount)}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-violet-100 bg-white/90 p-4 md:col-span-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
                    Total Invoice Bill Amount
                  </div>
                  <div className="mt-2 text-base font-bold text-slate-900">
                    {formatAmount(invoice?.totalAmount ?? previewTotalAmount)}
                  </div>
                </div>
              </div>

              {showPaymentEditor ? (
                <div className="mt-5 rounded-2xl border border-green-200 bg-green-50/70 p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 text-sm font-bold text-green-900">
                    <FileText className="h-5 w-5 text-green-700" />
                    Invoice Paid
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-green-100 bg-white/90 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                        Received Amount
                      </div>
                      <input
                        type="number"
                        value={paymentForm.receivedAmount}
                        readOnly
                        className="mt-2 w-full rounded-lg border border-green-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                      />
                    </div>

                    <div className="rounded-xl border border-green-100 bg-white/90 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                        Paid Date
                      </div>
                      <input
                        type="date"
                        value={paymentForm.paidDate}
                        onChange={(e) =>
                          setPaymentForm((current) => ({ ...current, paidDate: e.target.value }))
                        }
                        className="mt-2 w-full rounded-lg border border-green-100 px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="rounded-xl border border-green-100 bg-white/90 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                        TDS Amount
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={paymentForm.tdsAmount}
                        onChange={(e) =>
                          setPaymentForm((current) => ({
                            ...current,
                            tdsAmount: e.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-lg border border-green-100 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                </div>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
              <Mail className="h-5 w-5 text-slate-500" />
              CLIENT SENDER EMAIL
            </div>

            <div className="grid gap-6 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs text-slate-500 mb-1">Client Sender Email</div>
                <div className="font-medium text-slate-800">{task.emailSender || "-"}</div>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-1">Received Date & Time</div>
                <div className="font-medium text-slate-800">
                  {task.emailDate ? new Date(task.emailDate).toLocaleString("en-IN") : "-"}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-amber-200 bg-amber-50/70 p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-800">
              <FileText className="h-5 w-5 text-amber-700" />
              SPECIAL INSTRUCTIONS / NOTES
            </div>

            <div className="text-sm text-yellow-900">{task.details || "-"}</div>
          </div>

          <div>
            <h3 className="mb-3 flex items-center text-sm font-bold text-slate-900">
              <MessageSquare className="mr-2 h-4 w-4" />
              Internal Notes
            </h3>

            <div className="mb-4 max-h-48 space-y-3 overflow-y-auto rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              {comments.length === 0 ? (
                <p className="text-sm italic text-slate-400">No notes added yet.</p>
              ) : null}

              {comments.map((item, index) => (
                <div key={index} className="rounded-[20px] border border-white/80 bg-white p-3 shadow-sm">
                  <div className="mb-1 flex justify-between text-xs text-slate-400">
                    <span className="font-bold text-slate-700">{item.author}</span>
                    <span>{item.timestamp ? new Date(item.timestamp).toLocaleString() : "-"}</span>
                  </div>
                  <p className="text-sm text-slate-700">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                onKeyDown={(e) => e.key === "Enter" && addComment()}
              />
              <button
                onClick={addComment}
                disabled={submitting}
                className="rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
