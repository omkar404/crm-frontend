import { useMemo, useState } from "react";
import { Search, Mail, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import TaskManageDrawer from "./TaskManageDrawer";
import { useWorkdeskAuthStore } from "@/store/workdeskAuth.store";
import AllocateWorkModal from "./AllocateWorkModal";

/* ---------------- TASK DATA ---------------- */

const TASKS = [
    {
        id: "1",
        srNo: "SR-264978",
        clientId: "CDCR-506",
        clientName: "omkar",
        source: "Direct",
        chaName: "",
        service: "DGFT Appeal",
        subType: "First Appeal",
        note: "test",
        email: "test",
        emailDate: "2024-01-27T13:01:00",
        assignedTo: "Staff Member A",
        status: "APPLICATION DRAFTING IN PROGRESS",
        createdAt: "2024-01-24T09:00:00",
        slaHours: 48,
    },
    {
        id: "2",
        srNo: "SR-264316",
        clientId: "CDCR-505",
        clientName: "SAIF CHEMICALS",
        source: "CHA",
        chaName: "Peculiar Logistics",
        service: "Duty Drawback",
        subType: "Brand Rate Fixation",
        note: "INV NO 22455 DT 23.01.2...",
        email: "ashutosh@peculiar.com",
        emailDate: "2024-01-05T18:23:00",
        assignedTo: "Staff Member A",
        status: "INVOICE PAID",
        createdAt: "2024-01-01T10:00:00",
        slaHours: 72,
    },
];

/* ---------------- SLA UTILS ---------------- */

function getSLA(task) {
    const created = new Date(task.createdAt).getTime();
    const deadline = created + task.slaHours * 60 * 60 * 1000;
    const now = Date.now();

    const diffMs = deadline - now;
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

    const completed = ["INVOICE PAID", "APPROVED"].includes(task.status);

    return {
        deadline,
        diffHours,
        overdue: diffHours < 0 && !completed,
        completed,
    };
}

/* ---------------- STATUS + SLA BADGE ---------------- */

function StatusAndSLA({ task }) {
    const sla = getSLA(task);

    if (sla.completed) {
        return (
            <div className="text-green-700 text-xs font-bold flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1" /> Completed
            </div>
        );
    }

    if (sla.overdue) {
        return (
            <div className="text-red-600 text-xs font-bold flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" /> Overdue ({Math.abs(sla.diffHours)}h)
            </div>
        );
    }

    return (
        <div className="text-orange-600 text-xs font-bold flex items-center">
            <Clock className="w-4 h-4 mr-1" /> Due in {sla.diffHours}h
        </div>
    );
}

/* ---------------- STATUS BADGE ---------------- */

function StatusBadge({ status }) {
    if (status === "INVOICE PAID") {
        return (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                INVOICE PAID
            </span>
        );
    }

    return (
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
            {status}
        </span>
    );
}
const CLIENTS = [
    {
        id: "1",
        clientId: "CDCR-506",
        name: "omkar",
        source: "Direct",
        chaName: "",
    },
    {
        id: "2",
        clientId: "CDCR-505",
        name: "SAIF CHEMICALS",
        source: "CHA",
        chaName: "Peculiar Logistics",
    },
];

/* ---------------- MAIN COMPONENT ---------------- */

export default function WorkAllocationDesk({ clients = [] }) {
    const { user } = useWorkdeskAuthStore();
    const isAdmin = user?.role === "ADMIN";

    const [workTab, setWorkTab] = useState("All");
    const [search, setSearch] = useState("");
    const [source, setSource] = useState("All");
    const [status, setStatus] = useState("All");
    const [activeTask, setActiveTask] = useState(null);

    const [showAllocate, setShowAllocate] = useState(false);
    const [tasks, setTasks] = useState([]);

    const filteredTasks = useMemo(() => {
        return TASKS.filter((t) => {
            const sla = getSLA(t);

            const matchSearch = `${t.clientName} ${t.srNo} ${t.chaName}`
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchSource = source === "All" || t.source === source;
            const matchStatus = status === "All" || t.status === status;

            const matchWork =
                workTab === "All" ||
                (workTab === "High Risk" && sla.overdue) ||
                (workTab === "Pendency" && sla.overdue);

            return matchSearch && matchSource && matchStatus && matchWork;
        });
    }, [search, source, status, workTab]);

    return (
        <div className="bg-slate-100 min-h-screen p-8">
            <div className="bg-slate-50 rounded-xl border shadow-sm p-6 space-y-6">

                {/* HEADER */}
                <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="text-2xl font-bold text-slate-800">
                        Work Allocation Desk
                    </h3>


                    {isAdmin && (
                        <button
                            onClick={() => setShowAllocate(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm">
                            + Allocate Work
                        </button>
                    )}
                </div>

                {showAllocate && (
                    <AllocateWorkModal
                        clients={clients}
                        onClose={() => setShowAllocate(false)}
                        onSubmit={(task) =>
                            setTasks((prev) => [task, ...prev])
                        }
                    />
                )}


                {/* FILTER BAR */}
                <div className="bg-white rounded-xl border shadow-sm p-4 flex flex-wrap gap-4 items-center">

                    {/* WORK TYPE */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        {["All", "High Risk", "Pendency"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setWorkTab(t)}
                                className={`px-4 py-2 text-sm rounded-md font-medium ${workTab === t
                                    ? "bg-white shadow text-blue-600"
                                    : "text-gray-500"
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* SEARCH */}
                    <div className="relative flex-1 min-w-[260px]">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search Client, SR No, Sender, CHA, Client ID..."
                            className="pl-10 w-full border rounded-lg p-2 text-sm"
                        />
                    </div>

                    {/* SOURCE */}
                    <select
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="border rounded-lg p-2 text-sm"
                    >
                        <option value="All">All Sources</option>
                        <option value="Direct">Direct</option>
                        <option value="CHA">CHA</option>
                    </select>

                    {/* STATUS */}
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="border rounded-lg p-2 text-sm"
                    >
                        <option value="All">All Statuses</option>
                        <option value="APPLICATION DRAFTING IN PROGRESS">
                            APPLICATION DRAFTING IN PROGRESS
                        </option>
                        <option value="SUBMISSION">SUBMISSION</option>
                        <option value="INVOICE PAID">INVOICE PAID</option>
                    </select>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-6 py-4 text-left">SR / Client</th>
                                <th className="px-6 py-4 text-left">Client / Source</th>
                                <th className="px-6 py-4 text-left">Service</th>
                                <th className="px-6 py-4 text-left">Email</th>
                                <th className="px-6 py-4 text-left">Assigned</th>
                                <th className="px-6 py-4 text-left">Status & SLA</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {filteredTasks.map((t) => {
                                const sla = getSLA(t);

                                return (
                                    <tr key={t.id} className={sla.overdue ? "bg-red-50/40" : ""}>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-blue-600 text-xs font-bold">{t.srNo}</div>
                                            <div className="text-[10px] text-gray-500">{t.clientId}</div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="font-bold">{t.clientName}</div>
                                            {t.source === "CHA" ? (
                                                <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                                    via {t.chaName}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-gray-400">Direct</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div>{t.service}</div>
                                            <div className="text-xs text-blue-600">{t.subType}</div>
                                            <div className="text-[10px] text-gray-400 mt-1">Note: {t.note}</div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                {t.email}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">{t.assignedTo}</td>

                                        <td className="px-6 py-4 space-y-1">
                                            <StatusBadge status={t.status} />
                                            <StatusAndSLA task={t} />
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setActiveTask(t)}
                                                className="border border-blue-300 text-blue-600 px-4 py-1.5 rounded-lg text-sm hover:bg-blue-50"
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {activeTask && (
                    <TaskManageDrawer
                        task={activeTask}
                        onClose={() => setActiveTask(null)}
                    />
                )}

            </div>
        </div>
    );
}
