import { useEffect, useState } from "react";
import {
  CalendarDays,
  ShieldAlert,
  CheckCircle2,
  BarChart3,
} from "lucide-react";

import { getClients } from "@/api/workdeskAuth.api";
import { getWorkdeskDashboardApi } from "@/api/workdesk.api";
import { getWorkdeskMetaApi } from "@/api/workdesk.api";
import { useWorkdeskAuthStore } from "@/store/workdeskAuth.store";
import { errorToast } from "@/utils/customToast";
import { getApiErrorMessage } from "@/utils/apiError";
import AllocateWorkModal from "@/workdesk/pages/Work Allocation Desk/AllocateWorkModal";

export default function OperationsOverview() {
  const { user } = useWorkdeskAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllocate, setShowAllocate] = useState(false);
  const [clients, setClients] = useState([]);
  const [meta, setMeta] = useState({ serviceTypes: {}, staff: [], workflowStatuses: [] });
  const [allocateDataLoaded, setAllocateDataLoaded] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const dashboardResponse = await getWorkdeskDashboardApi();

      setAnalytics(dashboardResponse?.data || null);
    } catch (error) {
      errorToast(getApiErrorMessage(error, "Unable to load dashboard analytics."));
    } finally {
      setLoading(false);
    }
  };

  const loadAllocateData = async () => {
    if (!isAdmin || allocateDataLoaded) {
      return;
    }

    try {
      const [clientsResponse, metaResponse] = await Promise.all([
        getClients(),
        getWorkdeskMetaApi(),
      ]);

      setClients(Array.isArray(clientsResponse?.data?.data) ? clientsResponse.data.data : []);
      setMeta(metaResponse || { serviceTypes: {}, staff: [], workflowStatuses: [] });
      setAllocateDataLoaded(true);
    } catch (error) {
      errorToast(getApiErrorMessage(error, "Unable to load allocation data."));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (showAllocate) {
      loadAllocateData();
    }
  }, [showAllocate]);

  const volume = analytics?.volume || {};
  const summary = analytics?.summary || {};
  const staffLoad = analytics?.staffLoad || [];
  const staffReadyInvoice = analytics?.staffReadyInvoice || [];

  return (
    <div className="bg-slate-100 min-h-screen p-4">
      <div className="bg-slate-50 rounded-xl border shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-2xl font-bold text-slate-800">Operations Overview</h3>
          {isAdmin ? (
            <button
              onClick={() => setShowAllocate(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm"
            >
              + Allocate Work
            </button>
          ) : null}
        </div>

        {showAllocate ? (
          <AllocateWorkModal
            clients={clients}
            staff={meta.staff}
            serviceTypes={meta.serviceTypes}
            onClose={() => setShowAllocate(false)}
            onSubmit={async () => {
              await Promise.all([loadData(), loadAllocateData()]);
            }}
          />
        ) : null}

        {loading ? <div className="text-sm text-slate-500">Loading analytics...</div> : null}

        <div className="bg-white rounded-xl border p-6">
          <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-6">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            Request Volume Analytics
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Metric label="TODAY" value={volume.daily || 0} />
            <Metric label="THIS WEEK" value={volume.weekly || 0} />
            <Metric label="THIS MONTH" value={volume.monthly || 0} />
            <Metric label="THIS YEAR" value={volume.yearly || 0} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatusCard title="TOTAL ACTIVE" value={summary.totalActive || 0} />
          <StatusCard
            title="HIGH PRIORITY"
            value={summary.critical || 0}
            danger
            icon={<ShieldAlert className="w-4 h-4" />}
          />
          <StatusCard
            title="COMPLETED"
            value={summary.completed || 0}
            success
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-6">
              <BarChart3 className="w-5 h-5 text-gray-700" />
              Current Staff Workload (Active)
            </h3>

            <div className="space-y-3">
              {staffLoad.length === 0 ? <p className="text-sm text-slate-400">No workload data.</p> : null}
              {staffLoad.map((item) => (
                <div key={item._id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{item._id || "Unassigned"}</span>
                  <span className="font-bold text-blue-600">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-green-200 p-6">
            <h3 className="flex items-center gap-2 font-bold text-green-700 mb-6">
              <CheckCircle2 className="w-5 h-5" />
              Ready for Invoice (By Staff)
            </h3>

            <div className="space-y-3">
              {staffReadyInvoice.length === 0 ? <p className="text-sm text-slate-400">No invoice-ready tasks.</p> : null}
              {staffReadyInvoice.map((item) => (
                <div key={item._id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{item._id || "Unassigned"}</span>
                  <span className="font-bold text-green-700">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-blue-50 rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-blue-700">{value}</div>
      <div className="text-xs font-bold text-blue-600 mt-1">{label}</div>
    </div>
  );
}

function StatusCard({ title, value, danger, success, icon }) {
  return (
    <div
      className={`rounded-xl border p-6 ${
        danger ? "border-red-300" : success ? "border-green-300" : "border-gray-200"
      }`}
    >
      <div
        className={`flex items-center gap-2 text-sm font-bold ${
          danger ? "text-red-600" : success ? "text-green-600" : "text-gray-600"
        }`}
      >
        {icon}
        {title}
      </div>

      <div
        className={`text-3xl font-bold mt-2 ${
          danger ? "text-red-700" : success ? "text-green-700" : "text-gray-800"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
