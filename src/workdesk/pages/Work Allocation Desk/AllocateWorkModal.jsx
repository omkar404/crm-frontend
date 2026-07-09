import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  ChevronDown,
  Clock3,
  FileText,
  IndianRupee,
  Mail,
  UserRound,
  X,
} from "lucide-react";

import { createWorkdeskTaskApi } from "@/api/workdesk.api";
import { errorToast, successToast } from "@/utils/customToast";
import { getApiErrorMessage } from "@/utils/apiError";

export default function AllocateWorkModal({
  clients,
  onClose,
  onSubmit,
  staff = [],
  serviceTypes = {},
}) {
  const [form, setForm] = useState({
    clientId: "",
    serviceType: "",
    subType: "",
    assignedToUserId: staff[0]?._id || "",
    emailSender: "",
    emailDate: "",
    details: "",
    quotation: "",
    officialFee: "",
    serviceCharges: "",
    workLevel: "",
    slaDays: 5,
  });
  const [loading, setLoading] = useState(false);
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  const filteredClients = useMemo(() => {
    const query = clientSearch.trim().toLowerCase();
    if (!query) return clients;

    return clients.filter((client) =>
      [client.name, client.clientId, client.chaName, client.source, client.contactEmail, client.contactMobile]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [clientSearch, clients]);

  const selectedClient = useMemo(
    () => clients.find((client) => client._id === form.clientId) || null,
    [clients, form.clientId]
  );

  const buildPayload = () => ({
    ...form,
    officialFee: form.officialFee === "" ? null : Number(form.officialFee),
    serviceCharges: form.serviceCharges === "" ? null : Number(form.serviceCharges),
    slaDays: Number(form.slaDays) > 0 ? Number(form.slaDays) : 5,
  });

  useEffect(() => {
    if (!form.assignedToUserId && staff[0]?._id) {
      setForm((prev) => ({
        ...prev,
        assignedToUserId: staff[0]._id,
      }));
    }
  }, [staff, form.assignedToUserId]);

  useEffect(() => {
    if (!clientPickerOpen) {
      setClientSearch("");
    }
  }, [clientPickerOpen]);

  const submit = async () => {
    if (!form.clientId || !form.serviceType || !form.subType || !form.assignedToUserId) {
      errorToast("Client, service type, sub type, and assigned employee are required.");
      return;
    }

    try {
      setLoading(true);
      const createdTask = await createWorkdeskTaskApi(buildPayload());
      onSubmit(createdTask);
      successToast(
        createdTask?.notification?.sent
          ? `Work allocated and email sent to ${createdTask.notification.to}.`
          : "Work allocated successfully."
      );
      onClose();
    } catch (error) {
      errorToast(getApiErrorMessage(error, "Unable to allocate work."));
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-[2px]">
      <div className="flex max-h-[calc(100vh-72px)] w-full max-w-[880px] flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-5 py-4 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_32%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-100">
                Workdesk
              </div>
              <h3 className="mt-1 text-[24px] font-semibold tracking-tight">Allocate Work</h3>
              <p className="mt-1 max-w-xl text-xs leading-5 text-blue-50/90">
                Assign the request, capture sender details, and add commercial values in one
                structured workspace.
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-full border border-white/25 bg-white/10 p-2 text-white transition hover:bg-white/20"
              aria-label="Close allocate work modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid flex-1 gap-3 overflow-y-auto bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_24%)] p-4 lg:grid-cols-[minmax(0,1.28fr)_minmax(220px,0.72fr)]">
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                <BriefcaseBusiness className="h-4 w-4 text-blue-600" />
                Request Details
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Client
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setClientPickerOpen((current) => !current)}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    >
                      <span className="truncate">
                        {selectedClient
                          ? `${selectedClient.name} (${selectedClient.clientId || "-"})`
                          : "Select Client"}
                      </span>
                      <ChevronDown
                        className={[
                          "h-4 w-4 shrink-0 text-slate-400 transition",
                          clientPickerOpen ? "rotate-180" : "",
                        ].join(" ")}
                      />
                    </button>

                    {clientPickerOpen ? (
                      <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
                        <div className="mb-3">
                          <input
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                            placeholder="Search client, CDCR, CHA, email, or mobile"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                          />
                        </div>

                        <div className="max-h-[220px] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/70">
                          <button
                            type="button"
                            onClick={() => {
                              setForm((current) => ({ ...current, clientId: "" }));
                              setClientPickerOpen(false);
                            }}
                            className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-white"
                          >
                            <span>Select Client</span>
                          </button>

                          {filteredClients.length === 0 ? (
                            <div className="px-4 py-6 text-center text-sm text-slate-500">
                              No matching clients found.
                            </div>
                          ) : (
                            filteredClients.map((client) => (
                              <button
                                key={client._id}
                                type="button"
                                onClick={() => {
                                  setForm((current) => ({ ...current, clientId: client._id }));
                                  setClientPickerOpen(false);
                                }}
                                className="flex w-full flex-col items-start gap-0.5 border-b border-slate-100 px-4 py-2.5 text-left transition hover:bg-white last:border-b-0"
                              >
                                <span className="text-sm font-medium text-slate-800">
                                  {client.name}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {client.clientId || "-"} • {client.source === "CHA" ? `CHA: ${client.chaName || "-"}` : "Direct Client"}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Service
                    </label>
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                      value={form.serviceType}
                      onChange={(e) =>
                        setForm({ ...form, serviceType: e.target.value, subType: "" })
                      }
                    >
                      <option value="">Select Service</option>
                      {Object.keys(serviceTypes).map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Sub Type
                    </label>
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                      disabled={!form.serviceType}
                      value={form.subType}
                      onChange={(e) => setForm({ ...form, subType: e.target.value })}
                    >
                      <option value="">Select Sub Type</option>
                      {(serviceTypes[form.serviceType] || []).map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3.5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Mail className="h-4 w-4 text-cyan-600" />
                Email Address / WhatsApp Number
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Email Address / WhatsApp Number
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    placeholder="Enter email address or WhatsApp number"
                    value={form.emailSender}
                    onChange={(e) => setForm({ ...form, emailSender: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Received Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    value={form.emailDate}
                    onChange={(e) => setForm({ ...form, emailDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                <FileText className="h-4 w-4 text-amber-600" />
                Special Instructions
              </div>
              <textarea
                className="min-h-[140px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                placeholder="Add handling notes, client expectations, or context for the assigned team..."
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-900 p-3.5 text-white shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                <UserRound className="h-4 w-4 text-cyan-300" />
                Assignment
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Assign Employee
                  </label>
                  <select
                    className="w-full rounded-xl border border-white/10 bg-white/95 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-200"
                    value={form.assignedToUserId}
                    onChange={(e) => setForm({ ...form, assignedToUserId: e.target.value })}
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
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Work Level
                  </label>
                  <select
                    className="w-full rounded-xl border border-white/10 bg-white/95 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-200"
                    value={form.workLevel}
                    onChange={(e) => setForm({ ...form, workLevel: e.target.value })}
                  >
                    <option value="">Select work level</option>
                    <option value="High Risk">High Risk</option>
                    <option value="Pendency">Pendency</option>
                    <option value="Important">Important</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                    <Clock3 className="h-3.5 w-3.5" />
                    SLA Days
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-xl border border-white/10 bg-white/95 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-200"
                    value={form.slaDays}
                    onChange={(e) => setForm({ ...form, slaDays: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-3.5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                <IndianRupee className="h-4 w-4 text-emerald-600" />
                Commercial Details
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-white/80 bg-white/80 p-3.5">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Quotation
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    value={form.quotation}
                    onChange={(e) => setForm({ ...form, quotation: e.target.value })}
                  >
                    <option value="">Select quotation type</option>
                    <option value="Via WhatsApp">Via WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Agreed">Agreed</option>
                  </select>
                </div>

                <div className="rounded-xl border border-white/80 bg-white/80 p-3.5">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Official Fee
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    value={form.officialFee}
                    onChange={(e) => setForm({ ...form, officialFee: e.target.value })}
                  />
                </div>

                <div className="rounded-xl border border-white/80 bg-white/80 p-3.5">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Service Charges
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    value={form.serviceCharges}
                    onChange={(e) => setForm({ ...form, serviceCharges: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3.5">
          <p className="text-xs text-slate-500">
            Complete the request details, then allocate it to the responsible team member.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </button>
          <button
            onClick={submit}
            disabled={loading}
            className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50"
          >
            {loading ? "Allocating..." : "Allocate"}
          </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
