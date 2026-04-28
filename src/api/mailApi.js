import api from "./axios";

const normalizeMailListResponse = (payload, fallbackPage = 1, fallbackLimit = 10) => ({
  data: payload?.data || [],
  total: payload?.pagination?.total || 0,
  page: payload?.pagination?.page || fallbackPage,
  limit: payload?.pagination?.limit || fallbackLimit,
  totalPages: payload?.pagination?.totalPages || 1,
  filterOptions: payload?.filterOptions || null,
});

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
  city = "",
  state = "",
  priority = "",
  includeFilters = false,
} = {}) => {
  const normalizedSendEmailId = Array.isArray(sendEmailId)
    ? sendEmailId.join(",")
    : sendEmailId || undefined;

  const { data } = await api.get("/api/mail", {
    params: {
      page,
      limit,
      search: search || undefined,
      sendEmailId: normalizedSendEmailId,
      templateType: templateType || undefined,
      templateSubject: templateSubject || undefined,
      emailDate: emailDate || undefined,
      ipAddress: ipAddress || undefined,
      webTabAndType: webTabAndType || undefined,
      emailVerified: emailVerified || undefined,
      emailSentType: emailSentType || undefined,
      status: status || undefined,
      city: city || undefined,
      state: state || undefined,
      priority: priority || undefined,
      includeFilters: includeFilters || undefined,
    },
  });

  return normalizeMailListResponse(data, page, limit);
};

export const fetchMailLeadById = async (id) => {
  const { data } = await api.get(`/api/mail/${id}`);
  return data?.data || data;
};

export const createMailLead = async (payload) => {
  const { data } = await api.post("/api/mail", payload);
  return data;
};

export const updateMailLead = async (id, payload) => {
  const { data } = await api.put(`/api/mail/${id}`, payload);
  return data;
};

export const deleteMailLead = async (id) => {
  const { data } = await api.delete(`/api/mail/${id}`);
  return data;
};

export const bulkDeleteMails = async (ids = []) => {
  const { data } = await api.post("/api/mail/bulk-delete", { ids });
  return data;
};

export const bulkUpdateMailStatus = async (ids = [], status = "") => {
  const { data } = await api.post("/api/mail/bulk-status", { ids, status });
  return data;
};

export const fetchFilterOptions = async () => {
  const response = await fetchMailLeads({ page: 1, limit: 1, includeFilters: true });
  return response.filterOptions || {
    sendEmailId: [],
    templateType: [],
    templateSubject: [],
    emailDate: [],
    ipAddress: [],
    webTabAndType: [],
    emailVerified: [],
    emailSentType: [],
    status: [],
    city: [],
    state: [],
  };
};

export const fetchMailSummary = async () => {
  const { data } = await api.get("/api/mail/summary");
  return data;
};

export const fetchDailySummary = async (days = 7) => {
  const { data } = await api.get("/api/mail/summary/daily", {
    params: { days },
  });
  return data;
};

export const exportMailLeadsCSV = async (filters = {}) => {
  const response = await fetchMailLeads({
    ...filters,
    page: 1,
    limit: 99999,
  });
  return response.data || [];
};

export const importMails = async (formData, mode) => {
  const { data } = await api.post("/api/mail/import", formData, {
    params: mode ? { mode } : undefined,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const downloadMailSample = async () => {
  const response = await api.get("/api/mail/sample", { responseType: "blob" });
  return response.data;
};

export const updateStatusByEmail = async (email, status) => {
  const matches = await fetchMailLeads({
    search: email,
    limit: 1,
  });

  const record = matches.data?.find(
    (item) =>
      item?.["Email Id"]?.toLowerCase?.() === email.toLowerCase() ||
      item?.contactEmail?.toLowerCase?.() === email.toLowerCase() ||
      item?.email?.toLowerCase?.() === email.toLowerCase()
  );

  if (!record?._id) {
    throw new Error("No matching mail record found for that email");
  }

  const { data } = await api.patch(`/api/mail/${record._id}/status`, { status });
  return data;
};
