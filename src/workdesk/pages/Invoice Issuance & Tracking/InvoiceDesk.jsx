import { useEffect, useMemo, useState } from "react";
import { Receipt } from "lucide-react";

import {
  getWorkdeskInvoicesApi,
  getWorkdeskTasksApi,
  payWorkdeskInvoiceApi,
  raiseWorkdeskInvoiceApi,
} from "@/api/workdesk.api";
import { useWorkdeskAuthStore } from "@/store/workdeskAuth.store";

function InvoiceStatusBadge({ status }) {
  const map = {
    "Pending for Invoicing": "bg-yellow-100 text-yellow-800",
    "Invoice Raised": "bg-blue-100 text-blue-800",
    "Invoice Paid": "bg-green-100 text-green-800",
  };

  return (
    <span className={`text-[10px] font-bold px-2 py-1 rounded ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

export default function InvoiceDesk() {
  const { user } = useWorkdeskAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const [tasks, setTasks] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [taskData, invoiceData] = await Promise.all([
        getWorkdeskTasksApi(),
        getWorkdeskInvoicesApi(),
      ]);
      setTasks(taskData);
      setInvoices(invoiceData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const rows = useMemo(() => {
    return tasks
      .filter((task) =>
        ["Pending for Invoicing", "Invoice Raised", "Invoice Paid"].includes(task.status)
      )
      .map((task) => ({
        task,
        invoice: invoices.find((item) => String(item.taskId) === String(task._id)) || null,
      }));
  }, [tasks, invoices]);

  const handleManage = async (row) => {
    if (!isAdmin) return;

    if (row.task.status === "Pending for Invoicing") {
      const amountInput = window.prompt("Enter invoice amount");
      const amount = Number(amountInput);
      if (!amount || Number.isNaN(amount)) return;
      await raiseWorkdeskInvoiceApi({ taskId: row.task._id, amount });
      await loadData();
      return;
    }

    if (row.task.status === "Invoice Raised" && row.invoice?._id) {
      await payWorkdeskInvoiceApi(row.invoice._id);
      await loadData();
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen p-8">
      <div className="bg-slate-50 rounded-xl border shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-2xl font-bold text-slate-800">Invoice Issuance & Tracking</h3>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Invoice Issuance Register
          </h3>
          <span className="text-xs text-gray-500">Showing {rows.length} records</span>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
            <tr>
              <th className="px-6 py-3 text-left">SR No & Date</th>
              <th className="px-6 py-3 text-left">Client</th>
              <th className="px-6 py-3 text-left">Service</th>
              <th className="px-6 py-3 text-left">Handled By</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {rows.map(({ task, invoice }) => (
              <tr key={task._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-mono text-xs font-bold">{task.serviceRequestId}</div>
                  <div className="text-[10px] text-gray-400">
                    {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "-"}
                  </div>
                </td>

                <td className="px-6 py-4 font-medium">{task.clientName}</td>
                <td className="px-6 py-4">{task.serviceType}</td>
                <td className="px-6 py-4 text-gray-600">{task.assignedToName}</td>
                <td className="px-6 py-4">
                  <InvoiceStatusBadge status={task.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  {isAdmin ? (
                    <button
                      onClick={() => handleManage({ task, invoice })}
                      className="text-indigo-600 hover:underline text-xs font-bold"
                    >
                      {task.status === "Pending for Invoicing"
                        ? "Raise Invoice"
                        : task.status === "Invoice Raised"
                        ? "Mark Paid"
                        : "Completed"}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">View only</span>
                  )}
                </td>
              </tr>
            ))}

            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  No invoices found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
