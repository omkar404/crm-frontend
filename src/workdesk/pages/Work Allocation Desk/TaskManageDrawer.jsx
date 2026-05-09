import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import { X, History, MessageSquare, Mail, FileText } from "lucide-react";

import {
  addWorkdeskTaskCommentApi,
  updateWorkdeskTaskStatusApi,
} from "@/api/workdesk.api";
import { errorToast, successToast } from "@/utils/customToast";
import { getApiErrorMessage } from "@/utils/apiError";

export default function TaskManageDrawer({ task, onClose, onTaskUpdated, workflowStatuses = [] }) {
  const [selectedStatus, setSelectedStatus] = useState(task.status);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const history = useMemo(() => task.history || [], [task.history]);
  const comments = useMemo(() => task.comments || [], [task.comments]);

  useEffect(() => {
    setSelectedStatus(task.status);
  }, [task._id, task.status]);

  const sendStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === task.status) {
      errorToast("Select a different status before sending.");
      return;
    }

    try {
      setSubmitting(true);
      const updatedTask = await updateWorkdeskTaskStatusApi(task._id, selectedStatus);
      onTaskUpdated?.(updatedTask);
      successToast("Workflow status updated successfully.");
    } catch (error) {
      errorToast(getApiErrorMessage(error, "Unable to update workflow status."));
    } finally {
      setSubmitting(false);
    }
  };

  const addComment = async () => {
    if (!comment.trim()) {
      errorToast("Comment text required.");
      return;
    }

    try {
      setSubmitting(true);
      const updatedTask = await addWorkdeskTaskCommentApi(task._id, comment);
      setComment("");
      onTaskUpdated?.(updatedTask);
      successToast("Comment posted successfully.");
    } catch (error) {
      errorToast(getApiErrorMessage(error, "Unable to post comment."));
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col">
        <div className="p-6 border-b bg-slate-50 flex justify-between">
          <div>
            <div className="text-xs font-mono text-blue-600 font-bold">
              {task.serviceRequestId}
            </div>
            <h2 className="text-lg font-bold text-gray-800">{task.clientName}</h2>
            <p className="text-sm text-gray-500">
              {task.serviceType} | {task.subType}
            </p>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold mb-4 flex items-center">
              <History className="w-4 h-4 mr-2" />
              Application Lifecycle
            </h3>

            <div className="relative pl-4 border-l space-y-6">
              {history.length === 0 ? <p className="text-sm text-slate-400">No history yet.</p> : null}
              {history.slice().reverse().map((item, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-[9px] top-1 w-3 h-3 bg-indigo-600 rounded-full"></div>
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="font-bold text-sm">
                        {item.toStatus || item.status || task.status}
                      </div>
                      <div className="text-xs text-gray-500">{item.note}</div>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {item.timestamp ? new Date(item.timestamp).toLocaleString() : "-"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <label className="block text-xs font-bold text-blue-800 mb-2">
              Update Workflow Status
            </label>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                disabled={submitting}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 border rounded-lg p-2 text-sm"
              >
                {(workflowStatuses || []).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <button
                onClick={sendStatusUpdate}
                disabled={submitting || selectedStatus === task.status}
                className="bg-blue-600 text-white px-4 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Send"}
              </button>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
              <Mail className="w-5 h-5 text-slate-500" />
              CLIENT SENDER EMAIL
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <div className="text-xs text-slate-500 mb-1">Client Sender Email</div>
                <div className="font-medium text-slate-800">{task.emailSender || "-"}</div>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-1">Received Date & Time</div>
                <div className="font-medium text-slate-800">
                  {task.emailDate ? new Date(task.emailDate).toLocaleString("en-IN") : "-"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-yellow-800 mb-2">
              <FileText className="w-5 h-5 text-yellow-700" />
              SPECIAL INSTRUCTIONS / NOTES
            </div>

            <div className="text-sm text-yellow-900">{task.details || "-"}</div>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-3 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Internal Notes
            </h3>

            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto bg-gray-50 p-4 rounded-lg">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No notes added yet.</p>
              ) : null}

              {comments.map((item, index) => (
                <div key={index} className="bg-white border p-3 rounded-lg">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span className="font-bold">{item.author}</span>
                    <span>{item.timestamp ? new Date(item.timestamp).toLocaleString() : "-"}</span>
                  </div>
                  <p className="text-sm text-gray-700">{item.text}</p>
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
                disabled={submitting}
                className="bg-gray-900 text-white px-4 rounded-lg text-sm disabled:opacity-50"
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
