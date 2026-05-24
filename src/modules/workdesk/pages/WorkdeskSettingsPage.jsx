import { useEffect, useState } from "react";
import { Layers3, Plus, Settings2 } from "lucide-react";

import { getWorkdeskMetaApi, updateWorkdeskServiceTypesApi } from "@/api/workdesk.api";
import {
  WorkdeskEmptyState,
  WorkdeskInput,
  WorkdeskPage,
  WorkdeskPill,
  WorkdeskSection,
  WorkdeskStatCard,
} from "@/modules/workdesk/components/WorkdeskUI.jsx";
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

  const mainTypeCount = Object.keys(serviceTypes).length;
  const subTypeCount = Object.values(serviceTypes).reduce(
    (sum, subTypes) => sum + (Array.isArray(subTypes) ? subTypes.length : 0),
    0
  );

  return (
    <WorkdeskPage
      eyebrow="Admin Configuration"
      title="A cleaner settings desk for service request masters and workflow readiness"
      description="The configuration area now feels more structured and product-grade, making master-data maintenance easier to review and safer to update."
      actions={
        isAdmin ? (
          <button
            type="button"
            onClick={saveServiceTypes}
            disabled={saving}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.22)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        ) : null
      }
      hero={
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4 md:grid-cols-3">
            <WorkdeskStatCard
              label="Main Types"
              value={mainTypeCount}
              caption="Top-level service categories"
              icon={Layers3}
              accent="slate"
            />
            <WorkdeskStatCard
              label="Sub Types"
              value={subTypeCount}
              caption="Operational request variants"
              icon={Plus}
              accent="blue"
            />
            <WorkdeskStatCard
              label="Access"
              value={isAdmin ? "Admin" : "View"}
              caption="Current permission level"
              icon={Settings2}
              accent="teal"
            />
          </div>

          <div className="rounded-[30px] border border-slate-900/90 bg-[linear-gradient(135deg,#111827_0%,#1e293b_46%,#134e4a_100%)] p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/90">
              Service Master
            </div>
            <h3 className="mt-2 text-2xl font-bold">Configuration with more confidence and less clutter</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Keep the allocation experience clean by maintaining a well-organized service structure behind the scenes.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <WorkdeskPill tone="dark">{isAdmin ? "Editable workspace" : "Read-only workspace"}</WorkdeskPill>
            </div>
          </div>
        </div>
      }
    >
      <WorkdeskSection
        title="Service Request Master"
        description="Define main service types and their operational sub-types for a cleaner work allocation experience."
        aside={<WorkdeskPill tone="default">{mainTypeCount} categories</WorkdeskPill>}
      >
        {loading ? (
          <p className="text-sm text-slate-500">Loading settings...</p>
        ) : mainTypeCount === 0 ? (
          <WorkdeskEmptyState
            title="No service types configured yet"
            description="Create the first main service type to begin building the allocation master."
          />
        ) : (
          <div className="space-y-5">
            {Object.entries(serviceTypes).map(([mainType, subTypes]) => (
              <div
                key={mainType}
                className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,rgba(248,250,252,1)_0%,rgba(255,255,255,1)_100%)] p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-950">{mainType}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {(subTypes || []).length} configured sub-type{(subTypes || []).length === 1 ? "" : "s"}
                    </p>
                  </div>

                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => {
                        setServiceTypes((prev) => {
                          const next = { ...prev };
                          delete next[mainType];
                          return next;
                        });
                      }}
                      className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {(subTypes || []).map((subType) => (
                    <span
                      key={subType}
                      className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800"
                    >
                      {subType}
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => removeSubType(mainType, subType)}
                          className="text-sky-700"
                        >
                          x
                        </button>
                      ) : null}
                    </span>
                  ))}
                </div>

                {isAdmin ? (
                  <div className="mt-5 flex flex-col gap-3 md:flex-row">
                    <WorkdeskInput
                      value={draftSubs[mainType] || ""}
                      onChange={(e) => setDraftValue(mainType, e.target.value)}
                      placeholder="Add sub-type"
                    />
                    <button
                      type="button"
                      onClick={() => addSubType(mainType)}
                      className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Add Sub-Type
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </WorkdeskSection>

      {isAdmin ? (
        <WorkdeskSection
          title="Create New Main Service Type"
          description="Add a new category when expanding the service request catalog."
        >
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 p-5">
            <div className="flex flex-col gap-3 md:flex-row">
              <WorkdeskInput
                value={newMainType}
                onChange={(e) => setNewMainType(e.target.value)}
                placeholder="Main service type name"
              />
              <button
                type="button"
                onClick={addMainType}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Add Main Type
              </button>
            </div>
          </div>
        </WorkdeskSection>
      ) : null}
    </WorkdeskPage>
  );
}
