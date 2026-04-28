import { createPortal } from "react-dom";
import { useState } from "react";
import { X } from "lucide-react";
import workdeskAxios from "@/api/workdeskAxios";

export default function AddChaModal({ onClose, onSuccess  }) {
  const [form, setForm] = useState({
    chaname: "",
    contactPerson: "",
    mobile: "",
    email: "",
    officeAddress: "",
    remarks: "",
  });

  const update = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await workdeskAxios.post("/chas", form);

    console.log("CHA CREATED →", response.data);

        onClose();              // close modal
    onSuccess(); // refresh page
  } catch (err) {
    console.error("CHA creation failed →", err.response?.data || err);
  }
};

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white flex-shrink-0">
          <h3 className="font-bold">Add New CHA Partner</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-indigo-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto"
        >
          {/* CHA COMPANY */}
          <div>
            <label className="text-xs font-bold text-gray-600">
              CHA Company Name
            </label>
            <input
              required
              className="w-full border rounded p-2 mt-1 text-sm"
              value={form.chaname}
              onChange={(e) => update("chaname", e.target.value)}
              placeholder="e.g. Speedy Logistics"
            />
          </div>

          {/* CONTACT PERSON */}
          <div>
            <label className="text-xs font-bold text-gray-600">
              Contact Person
            </label>
            <input
              className="w-full border rounded p-2 mt-1 text-sm"
              value={form.contactPerson}
              onChange={(e) => update("contactPerson", e.target.value)}
              placeholder="e.g. Mr. Patel"
            />
          </div>

          {/* MOBILE */}
          <div>
            <label className="text-xs font-bold text-gray-600">
              Mobile Number
            </label>
            <input
              className="w-full border rounded p-2 mt-1 text-sm"
              value={form.mobile}
              onChange={(e) => update("mobile", e.target.value)}
              placeholder="10-digit mobile number"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-xs font-bold text-gray-600">
              Email ID
            </label>
            <input
              type="email"
              className="w-full border rounded p-2 mt-1 text-sm"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label className="text-xs font-bold text-gray-600">
              Office Address
            </label>
            <textarea
              className="w-full border rounded p-2 mt-1 text-sm h-20"
              value={form.officeAddress}
              onChange={(e) => update("officeAddress", e.target.value)}
              placeholder="Optional"
            />
          </div>

          {/* REMARKS */}
          <div>
            <label className="text-xs font-bold text-gray-600">
              Remarks (Internal)
            </label>
            <textarea
              className="w-full border rounded p-2 mt-1 text-sm h-16"
              value={form.remarks}
              onChange={(e) => update("remarks", e.target.value)}
              placeholder="Optional internal notes"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 text-sm"
            >
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
