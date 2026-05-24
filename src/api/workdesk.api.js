import workdeskAxios from "@/api/workdeskAxios";

export const getWorkdeskMetaApi = async () => {
  const { data } = await workdeskAxios.get("/meta");
  return data;
};

export const updateWorkdeskServiceTypesApi = async (serviceTypes) => {
  const { data } = await workdeskAxios.put("/meta/service-types", { serviceTypes });
  return data;
};

export const getWorkdeskTasksApi = async () => {
  const { data } = await workdeskAxios.get("/tasks");
  return Array.isArray(data) ? data : [];
};

export const getWorkdeskTaskApi = async (taskId) => {
  const { data } = await workdeskAxios.get(`/tasks/${taskId}`);
  return data;
};

export const createWorkdeskTaskApi = async (payload) => {
  const { data } = await workdeskAxios.post("/tasks", payload);
  return data;
};

export const updateWorkdeskTaskStatusApi = async (taskId, status) => {
  const { data } = await workdeskAxios.put(`/tasks/${taskId}/status`, { status });
  return data;
};

export const updateWorkdeskTaskJobWorkApi = async (taskId, jobWorkStatus) => {
  const { data } = await workdeskAxios.put(`/tasks/${taskId}/job-work`, { jobWorkStatus });
  return data;
};

export const addWorkdeskTaskCommentApi = async (taskId, text) => {
  const { data } = await workdeskAxios.post(`/tasks/${taskId}/comments`, { text });
  return data;
};

export const getWorkdeskDashboardApi = async () => {
  const { data } = await workdeskAxios.get("/dashboard/analytics");
  return data;
};

export const getWorkdeskInvoicesApi = async () => {
  const { data } = await workdeskAxios.get("/invoices");
  return Array.isArray(data) ? data : [];
};

export const raiseWorkdeskInvoiceApi = async (payload) => {
  const { data } = await workdeskAxios.post("/invoices", payload);
  return data;
};

export const payWorkdeskInvoiceApi = async (invoiceId, payload = {}) => {
  const { data } = await workdeskAxios.put(`/invoices/${invoiceId}/pay`, payload);
  return data;
};

export const getWorkdeskClientSecretsApi = async (clientId) => {
  const { data } = await workdeskAxios.get(`/clients/${clientId}/secrets`);
  return data;
};
