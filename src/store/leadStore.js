import { create } from "zustand";
import { listLeads, updateLeadStatus } from "../api/leadApi";

export const useLeadStore = create((set, get) => ({
  leads: [],

  fetchLeads: async () => {
    const { data } = await listLeads();
    set({ leads: data });
  },

  moveLead: async (leadId, newStatus) => {
    await updateLeadStatus(leadId, newStatus);

    const updated = get().leads.map((l) =>
      l._id === leadId ? { ...l, status: newStatus } : l
    );
    set({ leads: updated });
  },
}));
