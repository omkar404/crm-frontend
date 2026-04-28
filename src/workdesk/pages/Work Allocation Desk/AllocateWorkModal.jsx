import { createPortal } from "react-dom";
import { useState } from "react";
import { Mail } from "lucide-react";

const STAFF = ["Staff A", "Staff B", "Staff C", "Staff D"]; 

const SERVICES = {
  "DGFT Appeal": ["First Appeal", "Second Appeal"],
  "Duty Drawback": ["Brand Rate Fixation", "Claim"],
};

export default function AllocateWorkModal({ clients, onClose, onSubmit }) {
  const [form, setForm] = useState({
    clientId: "",
    service: "",
    subType: "",
    assignedTo: STAFF[0],
    email: "",
    emailDate: "",
    note: "",
    slaHours: 48,
  });

  const client = clients.find((c) => c.id === form.clientId);

  const submit = () => {
    if (!client || !form.service || !form.subType) return;

    onSubmit({
      id: Date.now().toString(),
      srNo: `SR-${Math.floor(100000 + Math.random() * 900000)}`,
      clientId: client.clientId,
      clientName: client.name,
      source: client.source,
      chaName: client.chaName,
      service: form.service,
      subType: form.subType,
      note: form.note,
      email: form.email,
      emailDate: form.emailDate,
      assignedTo: form.assignedTo,
      status: "APPLICATION DRAFTING IN PROGRESS",
      createdAt: new Date().toISOString(),
      slaHours: Number(form.slaHours),
    });

    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl overflow-hidden">

        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between">
          <h3 className="font-bold">Allocate Work</h3>
          <button onClick={onClose}>×</button>
        </div>

        <div className="p-6 space-y-4">
          <select
            className="w-full border rounded-lg p-2"
            onChange={(e) =>
              setForm({ ...form, clientId: e.target.value })
            }
          >
            <option value="">Select Client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.clientId})
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-4">
            <select
              className="border rounded-lg p-2"
              onChange={(e) =>
                setForm({ ...form, service: e.target.value })
              }
            >
              <option value="">Service</option>
              {Object.keys(SERVICES).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <select
              className="border rounded-lg p-2"
              disabled={!form.service}
              onChange={(e) =>
                setForm({ ...form, subType: e.target.value })
              }
            >
              <option value="">Sub Type</option>
              {form.service &&
                SERVICES[form.service].map((s) => (
                  <option key={s}>{s}</option>
                ))}
            </select>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-1 text-xs font-bold text-gray-500 mb-2">
              <Mail className="w-4 h-4" />
              Source Email
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                className="border rounded p-2 text-sm"
                placeholder="Sender Email"
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
              <input
                type="datetime-local"
                className="border rounded p-2 text-sm"
                onChange={(e) =>
                  setForm({ ...form, emailDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select
              className="border rounded-lg p-2"
              onChange={(e) =>
                setForm({ ...form, assignedTo: e.target.value })
              }
            >
              {STAFF.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <input
              type="number"
              min={1}
              className="border rounded-lg p-2"
              value={form.slaHours}
              onChange={(e) =>
                setForm({ ...form, slaHours: e.target.value })
              }
            />
          </div>

          <textarea
            className="border rounded-lg p-2 h-20 text-sm"
            placeholder="Special Instructions"
            onChange={(e) =>
              setForm({ ...form, note: e.target.value })
            }
          />
        </div>

        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={submit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Allocate
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
