import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

import workdeskAxios from "@/api/workdeskAxios";
import { errorToast, successToast } from "@/utils/customToast";
import { getApiErrorMessage } from "@/utils/apiError";

const emptyForm = {
  name: "",
  source: "Direct",
  chaId: "",
  contactPerson: "",
  contactMobile: "",
  contactEmail: "",
  authSignatoryName: "",
  authSignatoryMobile: "",
  authSignatoryAadhaar: "",
  dgftLogin: "",
  dgftPassword: "",
  icegateLogin: "",
  icegatePassword: "",
  dscHolder: "",
  dscExpiry: "",
};

export default function AddClientModal({ onClose, onSuccess, chas = [], client }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!client) {
      setForm(emptyForm);
      return;
    }

    setForm({
      name: client.name || "",
      source: client.source || "Direct",
      chaId: client.chaId || "",
      contactPerson: client.contactPerson || "",
      contactMobile: client.contactMobile || "",
      contactEmail: client.contactEmail || "",
      authSignatoryName: client.authSignatoryName || "",
      authSignatoryMobile: client.authSignatoryMobile || "",
      authSignatoryAadhaar: client.authSignatoryAadhaar || "",
      dgftLogin: client.dgftLogin || "",
      dgftPassword: client.dgftPassword || "",
      icegateLogin: client.icegateLogin || "",
      icegatePassword: client.icegatePassword || "",
      dscHolder: client.dscHolder || "",
      dscExpiry: client.dscExpiry ? client.dscExpiry.split("T")[0] : "",
    });
  }, [client]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const errors = {};

    if (!form.name.trim()) errors.name = "Company name is required";
    if (form.source === "CHA" && !form.chaId) errors.chaId = "Please select a CHA";
    if (form.contactMobile && !/^\d{10}$/.test(form.contactMobile)) {
      errors.contactMobile = "Enter a valid 10-digit mobile number";
    }
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      errors.contactEmail = "Enter a valid email address";
    }
    if (form.authSignatoryMobile && !/^\d{10}$/.test(form.authSignatoryMobile)) {
      errors.authSignatoryMobile = "Enter a valid 10-digit mobile number";
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const errors = validateForm();
    if (Object.keys(errors).length) {
      setLoading(false);
      errorToast(Object.values(errors)[0]);
      return;
    }

    const payload = {
      name: form.name,
      source: form.source,
      chaId: form.source === "CHA" ? form.chaId : null,
      contactPerson: form.contactPerson,
      contactMobile: form.contactMobile,
      contactEmail: form.contactEmail,
      authSignatoryName: form.authSignatoryName,
      authSignatoryMobile: form.authSignatoryMobile,
      authSignatoryAadhaar: form.authSignatoryAadhaar,
      dgftLogin: form.dgftLogin,
      dgftPassword: form.dgftPassword,
      icegateLogin: form.icegateLogin,
      icegatePassword: form.icegatePassword,
      dscHolder: form.dscHolder,
      dscExpiry: form.dscExpiry,
    };

    try {
      if (client?._id) {
        await workdeskAxios.put(`/clients/${client._id}`, payload);
      } else {
        await workdeskAxios.post("/clients", payload);
      }

      onSuccess();
      successToast(client ? "Client updated successfully." : "Client created successfully.");
      onClose();
    } catch (err) {
      errorToast(getApiErrorMessage(err, "Client save failed."));
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold">{client ? "Edit Client Data" : "Add New Client"}</h3>
          <button onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <div className="flex gap-6">
                <label>
                  <input
                    type="radio"
                    checked={form.source === "Direct"}
                    onChange={() => update("source", "Direct")}
                  />
                  Direct
                </label>
                <label>
                  <input
                    type="radio"
                    checked={form.source === "CHA"}
                    onChange={() => update("source", "CHA")}
                  />
                  CHA
                </label>
              </div>

              {form.source === "CHA" ? (
                <select
                  value={form.chaId}
                  onChange={(e) => update("chaId", e.target.value)}
                  className="w-full border p-2 mt-2"
                  required
                >
                  <option value="">Select CHA</option>
                  {chas.map((cha) => (
                    <option key={cha._id} value={cha._id}>
                      {cha.chaname}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>

            <div className="col-span-2">
              <input
                required
                placeholder="Company Name"
                className="w-full border p-2"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>

            <div className="col-span-2 border-t pt-2 mt-2">
              <h4 className="text-xs font-bold text-indigo-600">Client Contact Person</h4>
            </div>

            <div>
              <label className="text-xs text-gray-500">Contact Name</label>
              <input
                placeholder="e.g. Mr. Sharma"
                className="w-full border rounded p-2 mt-1"
                value={form.contactPerson}
                onChange={(e) => update("contactPerson", e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Mobile Number</label>
              <input
                placeholder="10-digit mobile number"
                className="w-full border rounded p-2 mt-1"
                value={form.contactMobile}
                onChange={(e) => update("contactMobile", e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs text-gray-500">Email ID</label>
              <input
                type="email"
                placeholder="contact@company.com"
                className="w-full border rounded p-2 mt-1"
                value={form.contactEmail}
                onChange={(e) => update("contactEmail", e.target.value)}
              />
            </div>

            <div className="col-span-2 border-t pt-2 mt-2">
              <h4 className="text-xs font-bold text-indigo-600">Authorized Signatory (OTP)</h4>
            </div>

            <div className="col-span-2">
              <label className="text-xs text-gray-500">Full Name</label>
              <input
                placeholder="As per Aadhaar"
                className="w-full border rounded p-2 mt-1"
                value={form.authSignatoryName}
                onChange={(e) => update("authSignatoryName", e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Mobile Number</label>
              <input
                placeholder="OTP-enabled mobile number"
                className="w-full border rounded p-2 mt-1"
                value={form.authSignatoryMobile}
                onChange={(e) => update("authSignatoryMobile", e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Aadhaar Number</label>
              <input
                placeholder="Optional"
                className="w-full border rounded p-2 mt-1"
                value={form.authSignatoryAadhaar}
                onChange={(e) => update("authSignatoryAadhaar", e.target.value)}
              />
            </div>

            <div className="col-span-2 border-t pt-2 mt-2">
              <h4 className="text-xs font-bold text-indigo-600">Portal Credentials</h4>
            </div>

            <div>
              <label className="text-xs text-gray-500">DGFT Login</label>
              <input
                placeholder="DGFT username"
                className="w-full border rounded p-2 mt-1"
                value={form.dgftLogin}
                onChange={(e) => update("dgftLogin", e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">DGFT Password</label>
              <input
                placeholder="DGFT password"
                className="w-full border rounded p-2 mt-1"
                value={form.dgftPassword}
                onChange={(e) => update("dgftPassword", e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">ICEGATE Login</label>
              <input
                placeholder="ICEGATE username"
                className="w-full border rounded p-2 mt-1"
                value={form.icegateLogin}
                onChange={(e) => update("icegateLogin", e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">ICEGATE Password</label>
              <input
                placeholder="ICEGATE password"
                className="w-full border rounded p-2 mt-1"
                value={form.icegatePassword}
                onChange={(e) => update("icegatePassword", e.target.value)}
              />
            </div>

            <div className="col-span-2 border-t pt-2 mt-2">
              <h4 className="text-xs font-bold text-indigo-600">DSC Info</h4>
            </div>

            <div>
              <label className="text-xs text-gray-500">DSC Holder Name</label>
              <input
                placeholder="Name on DSC"
                className="w-full border rounded p-2 mt-1"
                value={form.dscHolder}
                onChange={(e) => update("dscHolder", e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">DSC Expiry Date</label>
              <input
                type="date"
                className="w-full border rounded p-2 mt-1"
                value={form.dscExpiry}
                onChange={(e) => update("dscExpiry", e.target.value)}
              />
            </div>

            <div className="col-span-2 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
              >
                {loading ? "Saving..." : client ? "Update Client" : "Save Client"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
