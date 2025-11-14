import api from "./axios";


const API = "/api/auth/lead";

export const createLead = (lead) => api.post(`/lead/create`, lead);
export const listLeads = () => api.get(`/lead/list`);
export const updateLeadStatus = (id, status) =>
  api.patch(`/lead/status/${id}`, { status });
