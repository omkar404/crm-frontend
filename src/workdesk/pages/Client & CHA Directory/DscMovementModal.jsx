import { createPortal } from "react-dom";
import { useState } from "react";
import { ArrowRightLeft, X } from "lucide-react";
import workdeskAxios from "@/api/workdeskAxios";

export default function DscMovementModal({ client, onClose, onSuccess  }) {
    const [movement, setMovement] = useState(client.dscStatus || "Inward");
    const [note, setNote] = useState("");

    const movements = client.dscLog || [];

const handleSave = async () => {
  try {
    const payload = {
      dscStatus: movement,
      note: note,
    };

    // console.log("DSC UPDATE PAYLOAD →", payload);

    const response = await workdeskAxios.put(
      `/clients/${client._id}`,
      payload
    );

    // console.log("DSC UPDATE RESPONSE →", response.data);

    onClose();
  } catch (err) {
    console.error("DSC update failed →", err.response?.data || err);
  }
};

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">

                {/* HEADER */}
                <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold flex items-center gap-2">
                            <ArrowRightLeft className="w-5 h-5" />
                            DSC Movement Register
                        </h3>
                        <p className="text-xs text-gray-300">{client.name}</p>
                    </div>
                    <button onClick={onClose} className="hover:text-gray-300">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-6 overflow-y-auto">

                    {/* MOVEMENT TOGGLE */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => setMovement("Inward")}
                            className={`flex-1 py-3 rounded-lg border-2 font-bold ${movement === "Inward"
                                ? "border-green-500 bg-green-50 text-green-700"
                                : "border-gray-200 text-gray-400"
                                }`}
                        >
                            INWARD (Received)
                        </button>

                        <button
                            onClick={() => setMovement("Outward")}
                            className={`flex-1 py-3 rounded-lg border-2 font-bold ${movement === "Outward"
                                ? "border-red-500 bg-red-50 text-red-700"
                                : "border-gray-200 text-gray-400"
                                }`}
                        >
                            OUTWARD (Returned)
                        </button>
                    </div>

                    {/* NOTE */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Note / Handover Details
                        </label>
                        <textarea
                            className="w-full border rounded-lg p-2 mt-1 h-20 text-sm"
                            placeholder="e.g. Handed over to client representative..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
                    >
                        Log Movement
                    </button>

                    {/* RECENT MOVEMENTS */}
                    <div className="border-t pt-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                            Recent Movements
                        </h4>

                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {movements
                                .slice()
                                .reverse()
                                .map((log, i) => (
                                    <div
                                        key={i}
                                        className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded"
                                    >
                                        <span
                                            className={`font-bold ${log.status === "Inward"
                                                ? "text-green-600"
                                                : "text-red-600"
                                                }`}
                                        >
                                            {log.status}
                                        </span>

                                        <span className="text-gray-600 truncate max-w-[160px]">
                                            {log.note}
                                        </span>

                                        <span className="text-gray-400">
                                            {new Date(log.date).toLocaleString()}
                                        </span>
                                    </div>
                                ))}

                            {movements.length === 0 && (
                                <p className="text-xs text-gray-400 italic">
                                    No movements logged yet.
                                </p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>,
        document.body
    );
}
