import { useEffect, useState } from "react";
import api from "../api/axios";
import { DndContext } from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const statuses = ["NEW", "CONTACTED", "QUALIFIED", "FAILED", "CONVERTED"];

function LeadCard({ lead }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead._id,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    touchAction: "none",
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 mb-3 bg-white rounded shadow cursor-grab"
    >
      <div className="font-semibold">{lead.name}</div>
      <div className="text-sm text-gray-500">
        {lead.phone} • {lead.source}
      </div>
    </div>
  );
}

function Column({ status, children }) {
  const { setNodeRef } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className="w-full md:w-1/5 bg-gray-100 rounded p-3 min-h-[60vh]"
    >
      <h3 className="font-bold mb-3">{status}</h3>
      {children}
    </div>
  );
}

export default function Pipeline() {
  const [leads, setLeads] = useState([]);

const fetchLeads = async () => {
  const r = await api.get("/api/auth/list");

  // Force array
  const arr =
    Array.isArray(r.data)
      ? r.data
      : r.data.results || r.data.leads || [];

  setLeads(arr);
};

  useEffect(() => {
    fetchLeads();
  }, []);

  const onDragEnd = async (e) => {
    const leadId = e.active.id;
    const overId = e.over?.id;
    if (!overId) return;
    await api.patch(`/api/auth/status/${leadId}`, {
      status: overId,
    });
    setLeads((prev) =>
      prev.map((l) => (l._id === leadId ? { ...l, status: overId } : l))
    );
  };

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="flex flex-col md:flex-row gap-4">
        {statuses.map((s) => (
          <Column key={s} status={s}>
            {leads
              .filter((l) => l.status === s)
              .map((l) => (
                <LeadCard key={l._id} lead={l} />
              ))}
          </Column>
        ))}
      </div>
    </DndContext>
  );
}
