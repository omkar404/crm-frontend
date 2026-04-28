import { createPortal } from "react-dom";
import { useState } from "react";
import {
    X,
    History,
    MessageSquare,
    Mail,
    Clock,
    FileText,
} from "lucide-react";

const WORKFLOW_STATUSES = [
    "Request Initiated",
    "Application Drafting in Progress",
    "Draft Sent for Approval",
    "Submission",
    "In Process",
    "Pending for Invoicing",
    "Invoice Paid",
];

export default function TaskManageDrawer({ task, onClose }) {
    const [status, setStatus] = useState(task.status);
    const [comment, setComment] = useState("");

    const [history, setHistory] = useState([
        {
            status: task.status,
            note: "Initial Entry",
            date: new Date(task.createdAt || Date.now()).toLocaleString(),
        },
    ]);

    const [comments, setComments] = useState([]);

    const updateStatus = (newStatus) => {
        setStatus(newStatus);
        setHistory((h) => [
            {
                status: newStatus,
                note: "Status updated",
                date: new Date().toLocaleString(),
            },
            ...h,
        ]);
    };

    const addComment = () => {
        if (!comment.trim()) return;
        setComments((c) => [
            {
                text: comment,
                author: "Admin",
                date: new Date().toLocaleString(),
            },
            ...c,
        ]);
        setComment("");
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
            <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col">

                {/* HEADER */}
                <div className="p-6 border-b bg-slate-50 flex justify-between">
                    <div>
                        <div className="text-xs font-mono text-blue-600 font-bold">
                            {task.srNo}
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">
                            {task.clientName}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {task.service} | {task.subType}
                        </p>
                    </div>
                    <button onClick={onClose}>
                        <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* LIFECYCLE */}
                    <div className="bg-white border rounded-xl p-4 shadow-sm">
                        <h3 className="text-sm font-bold mb-4 flex items-center">
                            <History className="w-4 h-4 mr-2" />
                            Application Lifecycle
                        </h3>

                        <div className="relative pl-4 border-l space-y-6">
                            {history.map((h, i) => (
                                <div key={i} className="relative">
                                    <div className="absolute -left-[9px] top-1 w-3 h-3 bg-indigo-600 rounded-full"></div>
                                    <div className="flex justify-between">
                                        <div>
                                            <div className="font-bold text-sm">{h.status}</div>
                                            <div className="text-xs text-gray-500">{h.note}</div>
                                        </div>
                                        <div className="text-[10px] text-gray-400">
                                            {h.date}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* STATUS UPDATE */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <label className="block text-xs font-bold text-blue-800 mb-2">
                            Update Workflow Status
                        </label>
                        <select
                            value={status}
                            onChange={(e) => updateStatus(e.target.value)}
                            className="w-full border rounded-lg p-2 text-sm"
                        >
                            {WORKFLOW_STATUSES.map((s) => (
                                <option key={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* 🔽 MISSING SECTION – NOW ADDED 🔽 */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                            <Mail className="w-5 h-5 text-slate-500" />
                            SOURCE EMAIL (FOR OUTLOOK SEARCH)
                        </div>

                        <div className="grid grid-cols-2 gap-6 text-sm">
                            <div>
                                <div className="text-xs text-slate-500 mb-1">Sender ID</div>
                                <div className="font-medium text-slate-800">
                                    {task.email || "—"}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-slate-500 mb-1">
                                    Received Date & Time
                                </div>
                                <div className="font-medium text-slate-800">
                                    {task.emailDate
                                        ? new Date(task.emailDate).toLocaleString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : "—"}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-yellow-800 mb-2">
                            <FileText className="w-5 h-5 text-yellow-700" />
                            SPECIAL INSTRUCTIONS / NOTES
                        </div>

                        <div className="text-sm text-yellow-900">
                            {task.note || "—"}
                        </div>
                    </div>


                    {/* INTERNAL NOTES */}
                    <div>
                        <h3 className="text-sm font-bold mb-3 flex items-center">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Internal Notes
                        </h3>

                        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto bg-gray-50 p-4 rounded-lg">
                            {comments.length === 0 && (
                                <p className="text-sm text-gray-400 italic">
                                    No notes added yet.
                                </p>
                            )}

                            {comments.map((c, i) => (
                                <div key={i} className="bg-white border p-3 rounded-lg">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span className="font-bold">{c.author}</span>
                                        <span>{c.date}</span>
                                    </div>
                                    <p className="text-sm text-gray-700">{c.text}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add a note..."
                                className="flex-1 border rounded-lg p-2 text-sm"
                                onKeyDown={(e) => e.key === "Enter" && addComment()}
                            />
                            <button
                                onClick={addComment}
                                className="bg-gray-900 text-white px-4 rounded-lg text-sm"
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
