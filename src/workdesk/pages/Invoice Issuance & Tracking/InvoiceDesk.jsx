import { useState } from "react";
import { Receipt } from "lucide-react";

const INVOICES = [
    {
        id: "inv-1",
        serviceRequestId: "SR-240123",
        clientName: "Global Exports Pvt Ltd",
        serviceType: "IEC Services",
        assignedTo: "Staff A",
        status: "Pending for Invoicing",
        createdAt: "2024-01-23",
    },
    {
        id: "inv-2",
        serviceRequestId: "SR-240117",
        clientName: "Oceanic Traders",
        serviceType: "EPCG License",
        assignedTo: "Staff B",
        status: "Invoice Paid",
        createdAt: "2024-01-17",
    },
];

function InvoiceStatusBadge({ status }) {
    const map = {
        "Pending for Invoicing": "bg-yellow-100 text-yellow-800",
        "Invoice Raised": "bg-blue-100 text-blue-800",
        "Invoice Paid": "bg-green-100 text-green-800",
    };

    return (
        <span
            className={`text-[10px] font-bold px-2 py-1 rounded ${map[status] || "bg-gray-100 text-gray-600"
                }`}
        >
            {status}
        </span>
    );
}

export default function InvoiceDesk() {
    const [activeInvoice, setActiveInvoice] = useState(null);

    return (
        <div className="bg-slate-100 min-h-screen p-8">
            <div className="bg-slate-50 rounded-xl border shadow-sm p-6 space-y-6">
                {/* HEADER */}

                <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="text-2xl font-bold text-slate-800">
                        Invoice Issuance & Tracking
                    </h3>
                </div>
                
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Invoice Issuance Register
                </h3>
                <span className="text-xs text-gray-500">
                    Showing {INVOICES.length} records
                </span>


                {/* TABLE */}
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
                        {INVOICES.map((inv) => (
                            <tr key={inv.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-mono text-xs font-bold">
                                        {inv.serviceRequestId}
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                        {inv.createdAt}
                                    </div>
                                </td>

                                <td className="px-6 py-4 font-medium">
                                    {inv.clientName}
                                </td>

                                <td className="px-6 py-4">{inv.serviceType}</td>

                                <td className="px-6 py-4 text-gray-600">
                                    {inv.assignedTo}
                                </td>

                                <td className="px-6 py-4">
                                    <InvoiceStatusBadge status={inv.status} />
                                </td>

                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setActiveInvoice(inv)}
                                        className="text-indigo-600 hover:underline text-xs font-bold"
                                    >
                                        Manage Status
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {INVOICES.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="p-8 text-center text-gray-400"
                                >
                                    No invoices found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* PLACEHOLDER */}
                {activeInvoice && (
                    <div className="p-4 bg-indigo-50 border-t text-sm">
                        Managing invoice for{" "}
                        <strong>{activeInvoice.clientName}</strong>
                    </div>
                )}
            </div>
        </div>
    );
}
