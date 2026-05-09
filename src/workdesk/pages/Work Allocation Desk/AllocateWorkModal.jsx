import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Mail } from "lucide-react";

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
    slaDays: 5,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!form.assignedToUserId && staff[0]?._id) {
      setForm((prev) => ({
        ...prev,
        assignedToUserId: staff[0]._id,
      }));
    }
  }, [staff, form.assignedToUserId]);

  const submit = async () => {
    if (!form.clientId || !form.serviceType || !form.subType || !form.assignedToUserId) {
      errorToast("Client, service type, sub type, and assigned staff are required.");
      return;
    }

    try {
      setLoading(true);
      const createdTask = await createWorkdeskTaskApi(form);
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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between">
          <h3 className="font-bold">Allocate Work</h3>
          <button onClick={onClose}>x</button>
        </div>

        <div className="p-6 space-y-4">
          <select
            className="w-full border rounded-lg p-2"
            value={form.clientId}
            onChange={(e) => setForm({ ...form, clientId: e.target.value })}
          >
            <option value="">Select Client</option>
            {clients.map((client) => (
              <option key={client._id} value={client._id}>
                {client.name} ({client.clientId})
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-4">
            <select
              className="border rounded-lg p-2"
              value={form.serviceType}
              onChange={(e) => setForm({ ...form, serviceType: e.target.value, subType: "" })}
            >
              <option value="">Service</option>
              {Object.keys(serviceTypes).map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>

            <select
              className="border rounded-lg p-2"
              disabled={!form.serviceType}
              value={form.subType}
              onChange={(e) => setForm({ ...form, subType: e.target.value })}
            >
              <option value="">Sub Type</option>
              {(serviceTypes[form.serviceType] || []).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-1 text-xs font-bold text-gray-500 mb-2">
              <Mail className="w-4 h-4" />
              Client Sender Email
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                className="border rounded p-2 text-sm"
                placeholder="client@email.com"
                value={form.emailSender}
                onChange={(e) => setForm({ ...form, emailSender: e.target.value })}
              />
              <input
                type="datetime-local"
                className="border rounded p-2 text-sm"
                value={form.emailDate}
                onChange={(e) => setForm({ ...form, emailDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select
              className="border rounded-lg p-2"
              value={form.assignedToUserId}
              onChange={(e) => setForm({ ...form, assignedToUserId: e.target.value })}
            >
              <option value="">Assign staff</option>
              {staff.map((member) => (
              <option key={member._id} value={member._id}>
                  {member.name} ({member.email})
              </option>
              ))}
            </select>

            <input
              type="number"
              min={1}
              className="border rounded-lg p-2"
              value={form.slaDays}
              onChange={(e) => setForm({ ...form, slaDays: e.target.value })}
            />
          </div>

          <textarea
            className="border rounded-lg p-2 h-20 text-sm"
            placeholder="Special Instructions"
            value={form.details}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
          />
        </div>

        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={submit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Allocating..." : "Allocate"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
