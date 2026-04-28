// // export default useMailStore;
// import { create } from "zustand";
// import {
//   fetchMailLeads, createMailLead, updateMailLead, deleteMailLead,
//   fetchMailSummary, fetchDailySummary, exportMailLeadsCSV, fetchFilterOptions,
// } from "../api/mailApi";

// let searchTimer = null;
// const debounce = (fn, delay = 500) => {
//   clearTimeout(searchTimer);
//   searchTimer = setTimeout(fn, delay);
// };

// const useMailStore = create((set, get) => ({
//   leads: [], total: 0, page: 1, limit: 10, loading: false, error: null,

//   // Filter states (match backend parameter names)
//   search: "",
//   sendEmailId: "",
//   templateType: "",
//   templateSubject: "",
//   emailDate: "",
//   ipAddress: "",
//   webTabAndType: "",
//   emailVerified: "",
//   emailSentType: "",
//   statusFilter: "",

//   // Legacy
//   cityFilter: "",
//   stateFilter: "",

//   // Options from backend
//   filterOptions: {
//     sendEmailId: [],
//     templateType: [],
//     templateSubject: [],
//     emailDate: [],
//     ipAddress: [],
//     webTabAndType: [],
//     emailVerified: [],
//     emailSentType: [],
//     status: [],
//   },

//   selectedIds: [],
//   isFormModalOpen: false,
//   editingLead: null,
//   summary: null,
//   summaryLoading: false,
//   dailySummary: [],

//   loadFilterOptions: async () => {
//     try {
//       const opts = await fetchFilterOptions();
//       set({ filterOptions: opts });
//     } catch (err) {
//       console.warn("Filter options error:", err);
//     }
//   },

//   loadLeads: async () => {
//     const {
//       page, limit, search, sendEmailId, templateType, templateSubject,
//       emailDate, ipAddress, webTabAndType, emailVerified, emailSentType,
//       statusFilter, cityFilter, stateFilter,
//     } = get();
//     set({ loading: true, error: null });
//     try {
//       const res = await fetchMailLeads({
//         page, limit, search, sendEmailId, templateType, templateSubject,
//         emailDate, ipAddress, webTabAndType, emailVerified, emailSentType,
//         status: statusFilter || undefined, city: cityFilter, state: stateFilter,
//       });
//       set({ leads: res.data, total: res.total, loading: false });
//     } catch (err) {
//       set({ error: err.message, loading: false });
//     }
//   },

//   setPage: (page) => { set({ page }); get().loadLeads(); },
//   setLimit: (limit) => { set({ limit, page: 1 }); get().loadLeads(); },

//   setSearch: (search) => {
//     set({ search, page: 1 });
//     debounce(() => get().loadLeads(), 500);
//   },

//   // Individual setters (debounced)
//   setSendEmailId: (val) => { set({ sendEmailId: val, page: 1 }); debounce(() => get().loadLeads(), 300); },
//   setTemplateType: (val) => { set({ templateType: val, page: 1 }); debounce(() => get().loadLeads(), 300); },
//   setTemplateSubject: (val) => { set({ templateSubject: val, page: 1 }); debounce(() => get().loadLeads(), 300); },
//   setEmailDate: (val) => { set({ emailDate: val, page: 1 }); debounce(() => get().loadLeads(), 300); },
//   setIpAddress: (val) => { set({ ipAddress: val, page: 1 }); debounce(() => get().loadLeads(), 300); },
//   setWebTabAndType: (val) => { set({ webTabAndType: val, page: 1 }); debounce(() => get().loadLeads(), 300); },
//   setEmailVerified: (val) => { set({ emailVerified: val, page: 1 }); debounce(() => get().loadLeads(), 300); },
//   setEmailSentType: (val) => { set({ emailSentType: val, page: 1 }); debounce(() => get().loadLeads(), 300); },
//   setStatusFilter: (val) => { set({ statusFilter: val, page: 1 }); debounce(() => get().loadLeads(), 300); },

//   clearFilters: () => {
//     set({
//       search: "", sendEmailId: "", templateType: "", templateSubject: "",
//       emailDate: "", ipAddress: "", webTabAndType: "", emailVerified: "",
//       emailSentType: "", statusFilter: "", cityFilter: "", stateFilter: "", page: 1,
//     });
//     get().loadLeads();
//   },

//   // Selection
//   toggleSelect: (id) => {
//     const { selectedIds } = get();
//     set({ selectedIds: selectedIds.includes(id) ? selectedIds.filter(s => s !== id) : [...selectedIds, id] });
//   },
//   selectAll: (ids) => set({ selectedIds: ids }),
//   clearSelection: () => set({ selectedIds: [] }),

//   // Modal
//   openCreateModal: () => set({ isFormModalOpen: true, editingLead: null }),
//   openEditModal: (lead) => set({ isFormModalOpen: true, editingLead: lead }),
//   closeModal: () => set({ isFormModalOpen: false, editingLead: null }),

//   // CRUD
//   createLead: async (payload) => {
//     set({ loading: true });
//     try { await createMailLead(payload); get().closeModal(); get().loadLeads(); set({ loading: false }); }
//     catch (err) { set({ error: err.message, loading: false }); }
//   },
//   updateLead: async (id, payload) => {
//     set({ loading: true });
//     try { await updateMailLead(id, payload); get().closeModal(); get().loadLeads(); set({ loading: false }); }
//     catch (err) { set({ error: err.message, loading: false }); }
//   },
//   deleteLead: async (id) => {
//     set({ loading: true });
//     try { await deleteMailLead(id); get().loadLeads(); set({ loading: false }); }
//     catch (err) { set({ error: err.message, loading: false }); }
//   },

//   // Summary
//   loadSummary: async () => {
//     set({ summaryLoading: true });
//     try {
//       const [s, d] = await Promise.all([fetchMailSummary(), fetchDailySummary(7)]);
//       set({ summary: s.data, dailySummary: d.data || [], summaryLoading: false });
//     } catch (err) { set({ error: err.message, summaryLoading: false }); }
//   },

//   // Export
//   exportCSV: async () => {
//     try {
//       const filters = get();
//       const data = await exportMailLeadsCSV({
//         search: filters.search,
//         status: filters.statusFilter,
//         sendEmailId: filters.sendEmailId,
//         templateType: filters.templateType,
//         templateSubject: filters.templateSubject,
//         emailDate: filters.emailDate,
//         ipAddress: filters.ipAddress,
//         webTabAndType: filters.webTabAndType,
//         emailVerified: filters.emailVerified,
//         emailSentType: filters.emailSentType,
//       });
//       if (!data.length) return;
//       const keys = Object.keys(data[0]);
//       const csv = [keys.join(","), ...data.map(row => keys.map(k => `"${String(row[k] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
//       const blob = new Blob([csv], { type: "text/csv" });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url; a.download = "mail-leads.csv"; a.click();
//       URL.revokeObjectURL(url);
//     } catch (err) { set({ error: err.message }); }
//   },
// }));



import { create } from "zustand";
import {
  fetchMailLeads,
  createMailLead,
  updateMailLead,
  deleteMailLead,
  fetchMailSummary,
  fetchDailySummary,
  exportMailLeadsCSV,
  fetchFilterOptions,
} from "../api/mailApi";

const MAIL_EXPORT_HEADERS = [
  "Sr No",
  "name",
  "Email Id",
  "Template",
  "Subject",
  "Date",
  "IP Address",
  "Web",
  "email",
  "email verified",
  "city",
  "Email sent",
  "Status",
  "state",
  "pinCode",
  "contactPerson",
  "designation",
  "employees",
  "turnover",
  "startupCategory",
  "AEOStatus",
  "RCMCPanel",
  "RCMCType",
  "industry",
  "industryBrief",
  "leadType",
  "priorityRating",
  "leadSource",
  "leadStatus",
  "description",
  "notes",
];

let searchTimer = null;
const debounce = (fn, delay = 500) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(fn, delay);
};

// ✅ Convert Excel serial number → "dd-MMM-yy" (e.g., 46105 → 24-Mar-26)
const formatExcelDate = (serial) => {
  if (!serial || isNaN(serial)) return "";
  const date = new Date((serial - 25569) * 86400 * 1000);
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  return `${day}-${month}-${year}`;
};

const useMailStore = create((set, get) => ({
  leads: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null,

  search: "",

  // filter states
  sendEmailId: [],
  templateType: "",
  templateSubject: "",
  emailDate: "",
  ipAddress: "",
  webTabAndType: "",
  emailVerified: "",
  emailSentType: "",
  statusFilter: "",

  // filter options (populated from backend)
  filterOptions: {
    sendEmailId: [],
    templateType: [],
    templateSubject: [],
    emailDate: [],
    ipAddress: [],
    webTabAndType: [],
    emailVerified: [],
    emailSentType: [],
    status: [],
  },
  filterOptionsLoaded: false,

  filterOptionsLoading: false,
  latestListRequestId: 0,

  selectedIds: [],
  isFormModalOpen: false,
  editingLead: null,

  summary: null,
  summaryLoading: false,
  dailySummary: [],

  // ──────────────────────────────────────────────────────────
  // loadLeads (respects all active filters)
  loadLeads: async () => {
    const state = get();
    const requestId = state.latestListRequestId + 1;
    set({ loading: true, error: null, latestListRequestId: requestId });
    try {
      const res = await fetchMailLeads({
        page: state.page,
        limit: state.limit,
        search: state.search,
        sendEmailId: state.sendEmailId,
        templateType: state.templateType,
        templateSubject: state.templateSubject,
        emailDate: state.emailDate,
        ipAddress: state.ipAddress,
        webTabAndType: state.webTabAndType,
        emailVerified: state.emailVerified,
        emailSentType: state.emailSentType,
        status: state.statusFilter,
        includeFilters: !state.filterOptionsLoaded,
      });
      if (get().latestListRequestId !== requestId) {
        return;
      }

      set({
        leads: res.data || [],
        total: res.total || 0,
        loading: false,
        filterOptions: res.filterOptions || state.filterOptions,
        filterOptionsLoaded: Boolean(res.filterOptions) || state.filterOptionsLoaded,
      });
    } catch (err) {
      console.error("loadLeads error:", err);
      if (get().latestListRequestId === requestId) {
        set({ error: err.message, loading: false });
      }
    }
  },

  // pagination
  setPage: (page) => { set({ page }); get().loadLeads(); },
  setLimit: (limit) => { set({ limit, page: 1 }); get().loadLeads(); },

  // search with debounce
  setSearch: (search) => {
    set({ search, page: 1 });
    debounce(() => get().loadLeads(), 500);
  },

  // filter setters (each triggers reload)
  setSendEmailId: (value) => { set({ sendEmailId: Array.isArray(value) ? value : [], page: 1 }); get().loadLeads(); },
  setTemplateType: (value) => { set({ templateType: value, page: 1 }); get().loadLeads(); },
  setTemplateSubject: (value) => { set({ templateSubject: value, page: 1 }); get().loadLeads(); },
  setEmailDate: (value) => { set({ emailDate: value, page: 1 }); get().loadLeads(); },
  setIpAddress: (value) => { set({ ipAddress: value, page: 1 }); get().loadLeads(); },
  setWebTabAndType: (value) => { set({ webTabAndType: value, page: 1 }); get().loadLeads(); },
  setEmailVerified: (value) => { set({ emailVerified: value, page: 1 }); get().loadLeads(); },
  setEmailSentType: (value) => { set({ emailSentType: value, page: 1 }); get().loadLeads(); },
  setStatusFilter: (value) => { set({ statusFilter: value, page: 1 }); get().loadLeads(); },

  clearFilters: () => {
    set({
      sendEmailId: [],
      templateType: "",
      templateSubject: "",
      emailDate: "",
      ipAddress: "",
      webTabAndType: "",
      emailVerified: "",
      emailSentType: "",
      statusFilter: "",
      page: 1,
    });
    get().loadLeads();
  },

  // load filter options from backend
  loadFilterOptions: async () => {
    if (get().filterOptionsLoaded) {
      return;
    }
    set({ filterOptionsLoading: true });
    try {
      const data = await fetchFilterOptions();
      set({ filterOptions: data, filterOptionsLoading: false, filterOptionsLoaded: true });
    } catch (err) {
      console.error("Filter options error:", err);
      set({ filterOptionsLoading: false });
    }
  },

  // selection
  toggleSelect: (id) => {
    const { selectedIds } = get();
    set({
      selectedIds: selectedIds.includes(id)
        ? selectedIds.filter((s) => s !== id)
        : [...selectedIds, id],
    });
  },
  selectAll: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),

  // CRUD
  createLead: async (payload) => { await createMailLead(payload); get().loadLeads(); },
  updateLead: async (id, payload) => { await updateMailLead(id, payload); get().loadLeads(); },
  deleteLead: async (id) => { await deleteMailLead(id); get().loadLeads(); },

  loadSummary: async () => {
    set({ summaryLoading: true, error: null });
    try {
      const [summary, daily] = await Promise.all([
        fetchMailSummary(),
        fetchDailySummary(7),
      ]);
      set({
        summary: summary?.data || summary,
        dailySummary: daily?.data || daily || [],
        summaryLoading: false,
      });
    } catch (err) {
      console.error("loadSummary error:", err);
      set({ error: err.message, summaryLoading: false });
    }
  },

  // export CSV with formatted date column
  exportCSV: async () => {
    const {
      search,
      sendEmailId,
      templateType,
      templateSubject,
      emailDate,
      ipAddress,
      webTabAndType,
      emailVerified,
      emailSentType,
      statusFilter,
    } = get();
    let data = await exportMailLeadsCSV({
      search,
      sendEmailId,
      templateType,
      templateSubject,
      emailDate,
      ipAddress,
      webTabAndType,
      emailVerified,
      emailSentType,
      status: statusFilter,
    });
    if (!data.length) return;

    data = data.map((row, index) => {
      const mapped = {};

      MAIL_EXPORT_HEADERS.forEach((header) => {
        let value = row[header] ?? "";

        if (header === "Sr No") {
          value = row[header] || index + 1;
        }

        if (header === "Date" && value) {
          if (typeof value === "number") {
            value = formatExcelDate(value);
          } else {
            const date = new Date(value);
            if (!Number.isNaN(date.getTime())) {
              const day = String(date.getDate()).padStart(2, "0");
              const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              const month = monthNames[date.getMonth()];
              const year = date.getFullYear().toString().slice(-2);
              value = `${day}-${month}-${year}`;
            }
          }
        }

        mapped[header] = value;
      });

      return mapped;
    });

    const csv = [
      MAIL_EXPORT_HEADERS.join(","),
      ...data.map((row) =>
        MAIL_EXPORT_HEADERS.map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mail-leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  },
}));

export default useMailStore;
