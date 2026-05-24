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
  additionalPortalCredentials: [{ portalName: "", userId: "", password: "" }],
  dscHolder: "",
  dscExpiry: "",
};

export default function AddClientModal({ onClose, onSuccess, chas = [], client }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!client) {
      setForm(emptyForm);
      setFieldErrors({});
      setFormError("");
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
      additionalPortalCredentials:
        Array.isArray(client.additionalPortalCredentials) && client.additionalPortalCredentials.length
          ? client.additionalPortalCredentials.map((credential) => ({
              portalName: credential.portalName || "",
              userId: credential.userId || "",
              password: credential.password || "",
            }))
          : [{ portalName: "", userId: "", password: "" }],
      dscHolder: client.dscHolder || "",
      dscExpiry: client.dscExpiry ? client.dscExpiry.split("T")[0] : "",
    });
    setFieldErrors({});
    setFormError("");
  }, [client]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setFormError("");
  };

  const updatePortalCredential = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      additionalPortalCredentials: prev.additionalPortalCredentials.map((credential, credentialIndex) =>
        credentialIndex === index ? { ...credential, [field]: value } : credential
      ),
    }));
    setFormError("");
  };

  const addPortalCredentialRow = () => {
    setForm((prev) => ({
      ...prev,
      additionalPortalCredentials: [
        ...prev.additionalPortalCredentials,
        { portalName: "", userId: "", password: "" },
      ],
    }));
  };

  const removePortalCredentialRow = (index) => {
    setForm((prev) => ({
      ...prev,
      additionalPortalCredentials:
        prev.additionalPortalCredentials.length > 1
          ? prev.additionalPortalCredentials.filter((_, credentialIndex) => credentialIndex !== index)
          : [{ portalName: "", userId: "", password: "" }],
    }));
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
      setFieldErrors(errors);
      setFormError(Object.values(errors)[0]);
      errorToast(Object.values(errors)[0]);
      return;
    }

    setFieldErrors({});
    setFormError("");

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
      additionalPortalCredentials: form.additionalPortalCredentials,
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
      const message = getApiErrorMessage(err, "Client save failed.");
      setFormError(message);
      errorToast(message);
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
            {formError ? (
              <div className="col-span-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {formError}
              </div>
            ) : null}

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
                  className={[
                    "mt-2 w-full border p-2",
                    fieldErrors.chaId ? "border-rose-400 bg-rose-50" : "",
                  ].join(" ")}
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

            {client?.clientId ? (
              <div className="col-span-2">
                <label className="text-xs text-gray-500">CDCR No</label>
                <input
                  readOnly
                  className="mt-1 w-full rounded border bg-slate-50 p-2 text-slate-600"
                  value={client.clientId}
                />
              </div>
            ) : (
              <div className="col-span-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                CDCR No will be auto-generated when you save this client.
              </div>
            )}

            <div className="col-span-2">
              <input
                required
                placeholder="Company Name"
                className={[
                  "w-full border p-2",
                  fieldErrors.name ? "border-rose-400 bg-rose-50" : "",
                ].join(" ")}
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
                className={[
                  "mt-1 w-full rounded border p-2",
                  fieldErrors.contactMobile ? "border-rose-400 bg-rose-50" : "",
                ].join(" ")}
                value={form.contactMobile}
                onChange={(e) => update("contactMobile", e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs text-gray-500">Email ID</label>
              <input
                type="email"
                placeholder="contact@company.com"
                className={[
                  "mt-1 w-full rounded border p-2",
                  fieldErrors.contactEmail ? "border-rose-400 bg-rose-50" : "",
                ].join(" ")}
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
                className={[
                  "mt-1 w-full rounded border p-2",
                  fieldErrors.authSignatoryMobile ? "border-rose-400 bg-rose-50" : "",
                ].join(" ")}
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

            <div className="col-span-2 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
                <div className="mb-4 text-sm font-semibold text-indigo-700">Portal Credentials</div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-indigo-100 bg-white p-3">
                    {/* <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Portal Name
                    </div> */}
                    <div className="mt-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700">
                      DGFT Login 
                    </div>
                    {/* <div className="mt-1 text-xs font-semibold text-rose-500">Mandatory</div> */}
                    <label className="mt-3 block text-xs text-gray-500">User ID</label>
                    <input
                      placeholder="DGFT username"
                      className="mt-1 w-full rounded border p-2"
                      value={form.dgftLogin}
                      onChange={(e) => update("dgftLogin", e.target.value)}
                    />
                    <label className="mt-3 block text-xs text-gray-500">Password</label>
                    <input
                      placeholder="DGFT password"
                      className="mt-1 w-full rounded border p-2"
                      value={form.dgftPassword}
                      onChange={(e) => update("dgftPassword", e.target.value)}
                    />
                  </div>

                  <div className="rounded-xl border border-indigo-100 bg-white p-3">
                    {/* <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Portal Name
                    </div> */}
                    <div className="mt-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700">
                      ICEGATE Login
                    </div>
                    {/* <div className="mt-1 text-xs font-semibold text-rose-500">Mandatory</div> */}
                    <label className="mt-3 block text-xs text-gray-500">User ID</label>
                    <input
                      placeholder="ICEGATE username"
                      className="mt-1 w-full rounded border p-2"
                      value={form.icegateLogin}
                      onChange={(e) => update("icegateLogin", e.target.value)}
                    />
                    <label className="mt-3 block text-xs text-gray-500">Password</label>
                    <input
                      placeholder="ICEGATE password"
                      className="mt-1 w-full rounded border p-2"
                      value={form.icegatePassword}
                      onChange={(e) => update("icegatePassword", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-900">Add Portal Credentials</div>
                  <button
                    type="button"
                    onClick={addPortalCredentialRow}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    Add More
                  </button>
                </div>

                <div className="space-y-4">
                  {form.additionalPortalCredentials.map((credential, index) => (
                    <div key={`portal-${index}`} className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Additional Portal {index + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => removePortalCredentialRow(index)}
                          className="text-xs font-semibold text-rose-500"
                        >
                          Remove
                        </button>
                      </div>

                      <label className="block text-xs text-gray-500">Portal Name</label>
                      <input
                        placeholder="Enter portal name"
                        className="mt-1 w-full rounded border p-2"
                        value={credential.portalName}
                        onChange={(e) => updatePortalCredential(index, "portalName", e.target.value)}
                      />

                      <label className="mt-3 block text-xs text-gray-500">User ID</label>
                      <input
                        placeholder="Enter user ID"
                        className="mt-1 w-full rounded border p-2"
                        value={credential.userId}
                        onChange={(e) => updatePortalCredential(index, "userId", e.target.value)}
                      />

                      <label className="mt-3 block text-xs text-gray-500">Password</label>
                      <input
                        placeholder="Enter password"
                        className="mt-1 w-full rounded border p-2"
                        value={credential.password}
                        onChange={(e) => updatePortalCredential(index, "password", e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
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
