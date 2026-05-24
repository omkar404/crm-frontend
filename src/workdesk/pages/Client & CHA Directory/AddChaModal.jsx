import { createPortal } from "react-dom";
import { useState } from "react";
import { X } from "lucide-react";

import workdeskAxios from "@/api/workdeskAxios";
import { errorToast, successToast } from "@/utils/customToast";
import { getApiErrorMessage } from "@/utils/apiError";

export default function AddChaModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    chaname: "",
    contactPerson: "",
    mobile: "",
    email: "",
    officeAddress: "",
    remarks: "",
  });

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await workdeskAxios.post("/chas", form);
      onClose();
      onSuccess();
      successToast("CHA created successfully.");
    } catch (err) {
      errorToast(getApiErrorMessage(err, "CHA creation failed."));
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white flex-shrink-0">
          <h3 className="font-bold">Add New CHA Partner</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-indigo-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="text-xs font-bold text-gray-600">CDCR No</label>
            <input
              readOnly
              className="w-full border rounded p-2 mt-1 text-sm bg-slate-50 text-slate-600"
              value="CDCR-..."
            />
            <p className="mt-1 text-xs text-sky-700">
              A CHA base CDCR number will be auto-generated on save, for example `CDCR-507`.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600">CHA Company Name</label>
            <input
              required
              className="w-full border rounded p-2 mt-1 text-sm"
              value={form.chaname}
              onChange={(e) => update("chaname", e.target.value)}
              placeholder="e.g. Speedy Logistics"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600">Contact Person</label>
            <input
              className="w-full border rounded p-2 mt-1 text-sm"
              value={form.contactPerson}
              onChange={(e) => update("contactPerson", e.target.value)}
              placeholder="e.g. Mr. Patel"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600">Mobile Number</label>
            <input
              className="w-full border rounded p-2 mt-1 text-sm"
              value={form.mobile}
              onChange={(e) => update("mobile", e.target.value)}
              placeholder="10-digit mobile number"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600">Email ID</label>
            <input
              type="email"
              className="w-full border rounded p-2 mt-1 text-sm"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600">Office Address</label>
            <textarea
              className="w-full border rounded p-2 mt-1 text-sm h-20"
              value={form.officeAddress}
              onChange={(e) => update("officeAddress", e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600">Remarks (Internal)</label>
            <textarea
              className="w-full border rounded p-2 mt-1 text-sm h-16"
              value={form.remarks}
              onChange={(e) => update("remarks", e.target.value)}
              placeholder="Optional internal notes"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
            >
              Save CHA
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
