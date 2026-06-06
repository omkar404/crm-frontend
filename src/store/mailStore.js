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
import { RCMC_TYPE_MAP } from "../constants/rcmcOptions";

const EMAIL_SENT_FILTER_OPTIONS = [
  "jaggdish@eximinq-connect.in",
  "jaggdish@eximinq-audit.in",
  "jaggdish@eximinq-group.in",
  "jaggdish@eximinq-info.in",
  "jaggdish.a@eximinq-advisory.in",
  "jaggdish.acharya@eximinq-global.in",
  "j.acharya@eximinq-desk.in",
  "jaggdish.a@eximinq-exim.in",
  "jaggdish.acharya@eximinq-services.in",
  "Blank",
];

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
  leadSource: "",
  RCMCPanel: "",
  RCMCType: "",
  emailVerified: "",
  emailSent: "",
  emailSeen: "",
  emailStatus: "",
  enquiryStatus: "",
  turnup: "",
  cdcrNo: "",

  // filter options (populated from backend)
  filterOptions: {
    leadSource: [],
    RCMCPanel: [],
    RCMCType: [],
    RCMCTypeMap: RCMC_TYPE_MAP,
    sendEmailId: [],
    templateType: [],
    templateSubject: [],
    emailDate: [],
    ipAddress: [],
    webTabAndType: [],
    emailVerified: [],
    emailSent: [...EMAIL_SENT_FILTER_OPTIONS],
    emailSeen: [],
    emailStatus: [],
    enquiryStatus: [],
    turnup: [],
    cdcrNo: [],
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
        leadSource: state.leadSource,
        RCMCPanel: state.RCMCPanel,
        RCMCType: state.RCMCType,
        emailVerified: state.emailVerified,
        emailSent: state.emailSent,
        emailSeen: state.emailSeen,
        emailStatus: state.emailStatus,
        enquiryStatus: state.enquiryStatus,
        turnup: state.turnup,
        cdcrNo: state.cdcrNo,
        includeFilters: !state.filterOptionsLoaded,
      });
      if (get().latestListRequestId !== requestId) {
        return;
      }

      set({
        leads: res.data || [],
        total: res.total || 0,
        loading: false,
        filterOptions: {
          ...(res.filterOptions || state.filterOptions),
          emailSent: [...EMAIL_SENT_FILTER_OPTIONS],
        },
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
  setLeadSource: (value) => { set({ leadSource: value, page: 1 }); get().loadLeads(); },
  setRCMCPanel: (value) => {
    const map = get().filterOptions.RCMCTypeMap || RCMC_TYPE_MAP;
    const validTypes = map[value] || [];
    const nextType = validTypes.includes(get().RCMCType) ? get().RCMCType : "";
    set({ RCMCPanel: value, RCMCType: nextType, page: 1 });
    get().loadLeads();
  },
  setRCMCType: (value) => { set({ RCMCType: value, page: 1 }); get().loadLeads(); },
  setEmailVerified: (value) => { set({ emailVerified: value, page: 1 }); get().loadLeads(); },
  setEmailSent: (value) => { set({ emailSent: value || "", page: 1 }); get().loadLeads(); },
  setEmailSeen: (value) => { set({ emailSeen: value, page: 1 }); get().loadLeads(); },
  setEmailStatus: (value) => { set({ emailStatus: value, page: 1 }); get().loadLeads(); },
  setEnquiryStatus: (value) => { set({ enquiryStatus: value, page: 1 }); get().loadLeads(); },
  setTurnup: (value) => { set({ turnup: value, page: 1 }); get().loadLeads(); },
  setCdcrNo: (value) => { set({ cdcrNo: value, page: 1 }); get().loadLeads(); },

  clearFilters: () => {
    clearTimeout(searchTimer);
    set({
      search: "",
      leadSource: "",
      RCMCPanel: "",
      RCMCType: "",
      emailVerified: "",
      emailSent: "",
      emailSeen: "",
      emailStatus: "",
      enquiryStatus: "",
      turnup: "",
      cdcrNo: "",
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
      set({
        filterOptions: {
          ...data,
          emailSent: [...EMAIL_SENT_FILTER_OPTIONS],
        },
        filterOptionsLoading: false,
        filterOptionsLoaded: true,
      });
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
      leadSource,
      emailVerified,
      emailSent,
      emailSeen,
      emailStatus,
      enquiryStatus,
      turnup,
      cdcrNo,
    } = get();
    let data = await exportMailLeadsCSV({
      search,
      leadSource,
      emailVerified,
      emailSent,
      emailSeen,
      emailStatus,
      enquiryStatus,
      turnup,
      cdcrNo,
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
