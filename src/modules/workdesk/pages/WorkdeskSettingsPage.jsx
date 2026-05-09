import { useEffect, useState } from "react";
import { Settings } from "lucide-react";

import { getWorkdeskMetaApi, updateWorkdeskServiceTypesApi } from "@/api/workdesk.api";
import { useWorkdeskAuthStore } from "@/store/workdeskAuth.store";
import { errorToast, successToast } from "@/utils/customToast";
import { getApiErrorMessage } from "@/utils/apiError";

export default function WorkdeskSettingsPage() {
  const { user } = useWorkdeskAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const [serviceTypes, setServiceTypes] = useState({});
  const [newMainType, setNewMainType] = useState("");
  const [draftSubs, setDraftSubs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const meta = await getWorkdeskMetaApi();
        setServiceTypes(meta?.serviceTypes || {});
      } catch (error) {
        errorToast(getApiErrorMessage(error, "Unable to load service request master."));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const setDraftValue = (mainType, value) => {
    setDraftSubs((prev) => ({ ...prev, [mainType]: value }));
  };

  const addSubType = (mainType) => {
    const value = String(draftSubs[mainType] || "").trim();
    if (!value) {
      errorToast("Sub-type name is required.");
      return;
    }

    setServiceTypes((prev) => ({
      ...prev,
      [mainType]: [...new Set([...(prev[mainType] || []), value])],
    }));
    setDraftValue(mainType, "");
  };

  const removeSubType = (mainType, subType) => {
    setServiceTypes((prev) => ({
      ...prev,
      [mainType]: (prev[mainType] || []).filter((item) => item !== subType),
    }));
  };

  const addMainType = () => {
    const value = newMainType.trim();
    if (!value) {
      errorToast("Main service type is required.");
      return;
    }
    if (serviceTypes[value]) {
      errorToast("This main service type already exists.");
      return;
    }

    setServiceTypes((prev) => ({ ...prev, [value]: [] }));
    setNewMainType("");
  };

  const saveServiceTypes = async () => {
    try {
      setSaving(true);
      const payload = Object.fromEntries(
        Object.entries(serviceTypes).filter(([, subTypes]) => Array.isArray(subTypes) && subTypes.length > 0)
      );
      const response = await updateWorkdeskServiceTypesApi(payload);
      setServiceTypes(response?.serviceTypes || payload);
      successToast("Service request master updated successfully.");
    } catch (error) {
      errorToast(getApiErrorMessage(error, "Unable to save service request master."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen p-8">
      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-slate-700" />
            <h2 className="text-2xl font-bold text-slate-800">Service Request Master</h2>
          </div>
          {isAdmin ? (
            <button
              onClick={saveServiceTypes}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          ) : null}
        </div>

        <p className="text-sm text-slate-500">
          Define main service types and their sub-types for the allocation drop-down.
        </p>

        {loading ? <p className="text-sm text-slate-500">Loading settings...</p> : null}

        <div className="space-y-6">
          {Object.entries(serviceTypes).map(([mainType, subTypes]) => (
            <div key={mainType} className="border rounded-xl p-5 bg-slate-50 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">{mainType}</h3>
                {isAdmin ? (
                  <button
                    onClick={() => {
                      setServiceTypes((prev) => {
                        const next = { ...prev };
                        delete next[mainType];
                        return next;
                      });
                    }}
                    className="text-sm text-red-500"
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {(subTypes || []).map((subType) => (
                  <div
                    key={subType}
                    className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                  >
                    <span>{subType}</span>
                    {isAdmin ? (
                      <button onClick={() => removeSubType(mainType, subType)} className="text-blue-500">
                        x
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>

              {isAdmin ? (
                <div className="flex gap-2">
                  <input
                    value={draftSubs[mainType] || ""}
                    onChange={(e) => setDraftValue(mainType, e.target.value)}
                    placeholder="Add sub-type"
                    className="flex-1 border rounded-lg p-2 text-sm"
                  />
                  <button
                    onClick={() => addSubType(mainType)}
                    className="border border-dashed border-slate-400 px-4 rounded-lg text-sm text-slate-600"
                  >
                    + Add Sub
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {isAdmin ? (
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 space-y-3">
            <h3 className="text-lg font-semibold text-slate-700">Create New Main Service Type</h3>
            <div className="flex gap-2">
              <input
                value={newMainType}
                onChange={(e) => setNewMainType(e.target.value)}
                placeholder="Main service type name"
                className="flex-1 border rounded-lg p-2 text-sm"
              />
              <button onClick={addMainType} className="bg-slate-900 text-white px-4 rounded-lg text-sm">
                Add
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
