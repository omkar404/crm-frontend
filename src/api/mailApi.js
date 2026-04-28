// // ─── src/api/mailApi.js ───────────────────────────────────────────────────────
// const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// const getAuthHeaders = () => ({
//   "Content-Type": "application/json",
//   Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
// });

// // ── Fetch all mails ───────────────────────────────────────────────────────────
// export const fetchMailLeads = async ({
//   page = 1, limit = 25, search = "",
//   status = "", templateType = "", templateSubject = "",
//   emailDate = "", ipAddress = "", webTabType = "",
//   emailVerified = "", emailSent = "",
//   city = "", state = "",
// } = {}) => {
//   const params = new URLSearchParams();
//   params.append("page",  page);
//   params.append("limit", limit);
//   if (search)          params.append("search",          search);
//   if (status)          params.append("status",          status);
//   if (templateType)    params.append("templateType",    templateType);
//   if (templateSubject) params.append("templateSubject", templateSubject);
//   if (emailDate)       params.append("emailDate",       emailDate);
//   if (ipAddress)       params.append("ipAddress",       ipAddress);
//   if (webTabType)      params.append("webTabType",      webTabType);
//   if (emailVerified)   params.append("emailVerified",   emailVerified);
//   if (emailSent)       params.append("emailSent",       emailSent);
//   if (city)            params.append("city",            city);
//   if (state)           params.append("state",           state);

//   const res = await fetch(`${BASE_URL}/api/mail?${params}`, { headers: getAuthHeaders() });
//   if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
//   const json = await res.json();
//   return {
//     data:       json.data       || [],
//     total:      json.total      || 0,
//     page:       json.page       || page,
//     limit:      json.limit      || limit,
//     totalPages: json.totalPages || Math.ceil((json.total || 0) / limit) || 1,
//   };
// };

// // ── Fetch single ──────────────────────────────────────────────────────────────
// export const fetchMailLeadById = async (id) => {
//   const res = await fetch(`${BASE_URL}/api/mail/${id}`, { headers: getAuthHeaders() });
//   if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
//   return res.json();
// };

// // ── Create ────────────────────────────────────────────────────────────────────
// export const createMailLead = async (payload) => {
//   const res = await fetch(`${BASE_URL}/api/mail`, {
//     method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload),
//   });
//   if (!res.ok) throw new Error(`Create failed: ${res.status}`);
//   return res.json();
// };

// // ── Update ────────────────────────────────────────────────────────────────────
// export const updateMailLead = async (id, payload) => {
//   const res = await fetch(`${BASE_URL}/api/mail/${id}`, {
//     method: "PUT", headers: getAuthHeaders(), body: JSON.stringify(payload),
//   });
//   if (!res.ok) throw new Error(`Update failed: ${res.status}`);
//   return res.json();
// };

// // ── Delete single ─────────────────────────────────────────────────────────────
// export const deleteMailLead = async (id) => {
//   const res = await fetch(`${BASE_URL}/api/mail/${id}`, {
//     method: "DELETE", headers: getAuthHeaders(),
//   });
//   if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
//   return res.json();
// };

// // ── Bulk Delete ───────────────────────────────────────────────────────────────
// export const bulkDeleteLeads = async (ids = []) => {
//   const res = await fetch(`${BASE_URL}/api/mail/bulk-delete`, {
//     method: "DELETE", headers: getAuthHeaders(), body: JSON.stringify({ ids }),
//   });
//   if (!res.ok) throw new Error(`Bulk delete failed: ${res.status}`);
//   return res.json();
// };

// // ── Bulk Update Status ────────────────────────────────────────────────────────
// export const bulkUpdateStatus = async (ids = [], status = "") => {
//   const res = await fetch(`${BASE_URL}/api/mail/bulk-status`, {
//     method: "PUT", headers: getAuthHeaders(), body: JSON.stringify({ ids, status }),
//   });
//   if (!res.ok) throw new Error(`Bulk update failed: ${res.status}`);
//   return res.json();
// };

// // ── Fetch Filter Options ──────────────────────────────────────────────────────
// export const fetchFilterOptions = async () => {
//   try {
//     const res = await fetch(`${BASE_URL}/api/mail/filter-options`, { headers: getAuthHeaders() });
//     if (!res.ok) throw new Error(`Filter options failed: ${res.status}`);
//     return res.json();
//   } catch {
//     return { sendEmailId: [], templateType: [], templateSubject: [], emailDate: [],
//       ipAddress: [], webTabAndType: [], emailVerified: [], emailSentType: [], status: [] };
//   }
// };

// // ── Summary ───────────────────────────────────────────────────────────────────
// export const fetchMailSummary = async () => {
//   const res = await fetch(`${BASE_URL}/api/mail/summary`, { headers: getAuthHeaders() });
//   if (!res.ok) throw new Error(`Summary failed: ${res.status}`);
//   return res.json();
// };

// export const fetchDailySummary = async (days = 7) => {
//   const res = await fetch(`${BASE_URL}/api/mail/summary/daily?days=${days}`, { headers: getAuthHeaders() });
//   if (!res.ok) throw new Error(`Daily summary failed: ${res.status}`);
//   return res.json();
// };

// // ── Export CSV ────────────────────────────────────────────────────────────────
// export const exportMailLeadsCSV = async (filters = {}) => {
//   const params = new URLSearchParams({ ...filters, limit: 99999, page: 1 });
//   const res = await fetch(`${BASE_URL}/api/mail?${params}`, { headers: getAuthHeaders() });
//   if (!res.ok) throw new Error(`Export failed: ${res.status}`);
//   const json = await res.json();
//   return json.data || [];
// };const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";


const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

// ──────────────────────────────────────────────────────────────────
// EXPORT each function explicitly
// ──────────────────────────────────────────────────────────────────

export const fetchMailLeads = async ({
  page = 1,
  limit = 10,
  search = "",
  sendEmailId = "",
  templateType = "",
  templateSubject = "",
  emailDate = "",
  ipAddress = "",
  webTabAndType = "",
  emailVerified = "",
  emailSentType = "",
  status = "",
} = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append("search", search);
  if (sendEmailId) params.append("sendEmailId", sendEmailId);
  if (templateType) params.append("templateType", templateType);
  if (templateSubject) params.append("templateSubject", templateSubject);
  if (emailDate) params.append("emailDate", emailDate);
  if (ipAddress) params.append("ipAddress", ipAddress);
  if (webTabAndType) params.append("webTabAndType", webTabAndType);
  if (emailVerified) params.append("emailVerified", emailVerified);
  if (emailSentType) params.append("emailSentType", emailSentType);
  if (status) params.append("status", status);

  const res = await fetch(`${BASE_URL}/api/mail?${params}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const json = await res.json();
  return { data: json.data || [], total: json.total || 0, page: json.page || page, limit: json.limit || limit };
};

export const fetchMailLeadById = async (id) => {
  const res = await fetch(`${BASE_URL}/api/mail/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
};

export const createMailLead = async (payload) => {
  const res = await fetch(`${BASE_URL}/api/mail`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Create failed: ${res.status}`);
  return res.json();
};

export const updateMailLead = async (id, payload) => {
  const res = await fetch(`${BASE_URL}/api/mail/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  return res.json();
};

export const deleteMailLead = async (id) => {
  const res = await fetch(`${BASE_URL}/api/mail/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
  return res.json();
};

export const fetchMailSummary = async () => {
  const res = await fetch(`${BASE_URL}/api/mail/summary`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Summary failed: ${res.status}`);
  return res.json();
};

export const fetchDailySummary = async (days = 7) => {
  const res = await fetch(`${BASE_URL}/api/mail/summary/daily?days=${days}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Daily summary failed: ${res.status}`);
  return res.json();
};

export const exportMailLeadsCSV = async (filters = {}) => {
  const params = new URLSearchParams({ ...filters, limit: 99999 });
  const res = await fetch(`${BASE_URL}/api/mail?${params}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  const json = await res.json();
  return json.data || [];
};