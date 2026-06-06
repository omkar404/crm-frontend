import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import Swal from "sweetalert2";
import api from "../api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Filter,
  Plus,
  RefreshCcw,
  Pencil,
  Trash2,
  Eye,
  MoreVertical,
  Mail,
  Phone,
  Download,
  Copy,
} from "lucide-react";
import LeadFormModal from "../components/LeadFormModal";
import ImportModal from "../components/ImportModal";
import LeadFilters from "../components/LeadFilters";
import { successToast, errorToast } from "@/utils/customToast";
import { RCMC_PANEL_OPTIONS, RCMC_TYPE_MAP } from "../constants/rcmcOptions";

const priorityBorder = {
  Low: "border-l-4 border-green-400",
  Medium: "border-l-4 border-yellow-400",
  High: "border-l-4 border-red-500",
  Premium: "border-l-4 border-purple-500",
  "": "border-l-4 border-transparent",
};

const statusColors = {
  "Not Contacted": "bg-gray-100 text-gray-700",
  "Email Sent": "bg-blue-100 text-blue-700",
  "Visit Scheduled": "bg-pink-100 text-pink-700",
  "Email id incorrect": "bg-red-100 text-red-700",
  "Contact on phone": "bg-yellow-100 text-yellow-700",
  "In Contact": "bg-teal-100 text-teal-700",
  Interested: "bg-green-100 text-green-700",
  "In Process": "bg-orange-100 text-orange-700",
  "Login Created": "bg-purple-100 text-purple-700",
  "Do Not Touch": "bg-pink-100 text-pink-700",
  "Login Rejected": "bg-red-100 text-red-700",
  "Not Interested": "bg-red-200 text-red-800",
  "Not Contactable": "bg-gray-200 text-gray-800",
  "Spam / Fake Lead": "bg-black text-white",
};

const priorityOrder = { Premium: 0, High: 1, Medium: 2, Low: 3, "": 4 };

// Lists
const AEOStatusList = ["NA", "AEO - T1", "AEO - T2", "AEO - T3", "AEO - LEO"];
const RCMCPanelList = RCMC_PANEL_OPTIONS;

const industryList = [
  "Agriculture & Farming",
  "Mining & Quarrying",
  "Manufacturing",
  "Construction",
  "Utilities",
  "IT & Software Services",
  "Financial Services",
  "Trade (Wholesale & Retail)",
  "Transport & Logistics",
  "Tourism & Hospitality",
  "Telecommunications",
  "Healthcare",
  "Education",
  "Media & Entertainment",
  "Professional Services",
  "Public Administration",
];

const leadTypeList = [
  "CHA",
  "Logistics",
  "Freight Forwarder",
  "Manufacturer",
  "Importer",
  "Exporter",
];
const leadSourceList = [
  "RCMC Panel",
  "CHA Panel",
  "MCA Panel",
  "Website",
  "In Person",
  "In Reference",
  "Print Media",
  "FSSAI Panel",
  "EPR Panel",
  "Web Media",
  "AEO Panel",
  "Others",
];

function highlight(text = "", query = "") {
  if (!query) return escapeHtml(text);
  const safeText = escapeHtml(text);
  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  return safeText.replace(
    regex,
    `<mark class="bg-yellow-300 rounded">${"$1"}</mark>`
  );
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function LeadTable() {
  const [leads, setLeads] = useState([]);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    industry: industryList,
    leadType: leadTypeList,
    leadSource: leadSourceList,
    leadStatus: Object.keys(statusColors),
    AEOStatus: AEOStatusList,
    RCMCPanel: RCMCPanelList,
    RCMCType: [],
    RCMCTypeMap: RCMC_TYPE_MAP,
  });
  const [filterOptionsLoaded, setFilterOptionsLoaded] = useState(false);

  //filter
  const [status, setStatus] = useState("");
  const [aeoStatus, setAeoStatus] = useState("");
  const [rcmcStatus, setRcmcStatus] = useState("");
  const [rcmcType, setRcmcType] = useState("");
  const [industry, setIndustry] = useState("");
  const [leadType, setLeadType] = useState("");
  const [leadSource, setLeadSource] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [openActionMenu, setOpenActionMenu] = useState(null);
  const dropdownRef = useRef(null);
  const latestFetchRequestIdRef = useRef(0);

  const [sortField, setSortField] = useState(null); // "name" | "email" | "createdAt" | "priorityRating"
  const [sortDir, setSortDir] = useState("asc");

  // click outside for dropdown
  // click outside for dropdown & action-menu (REPLACEMENT)
  useEffect(() => {
    const handle = (e) => {
      // If click happened inside top dropdown (create/import) area, do nothing for showDropdown
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) {
        return;
      }

      // If click happened inside an action menu (.action-menu), ignore closing action menu
      if (e.target.closest && e.target.closest(".action-menu")) {
        return;
      }

      // Otherwise close both dropdowns/menus
      setShowDropdown(false);
      setOpenActionMenu(null);
    };

    // NOTE: using 'click' (not 'mousedown') so menu buttons receive the click first
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setOpenActionMenu(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQ(q);
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [q]);

  const handleBulkStatusUpdate = async () => {
    const { value: status } = await Swal.fire({
      title: "Update Status", 
      input: "select",
      inputOptions: {
        "Not Contacted": "Not Contacted",
        "Email Sent": "Email Sent",
        "Visit Scheduled": "Visit Scheduled",
        "Email id incorrect": "Email id incorrect",
        "Contact on phone": "Contact on phone",
        "In Contact": "In Contact",
        Interested: "Interested",
        "In Process": "In Process",
        "Login Created": "Login Created",
        "Login Rejected": "Login Rejected",
        "Not Interested": "Not Interested",
        "Not Contactable": "Not Contactable",
        "Spam / Fake Lead": "Spam / Fake Lead",
        "Do Not Touch": "Do Not Touch",
      },
      inputPlaceholder: "Choose new status",
      showCancelButton: true,
    });

    if (!status) return;

    try {
      await api.put("/api/auth/bulk-update-status", {
        ids: selectedLeads,
        status,
      });

      successToast("Status updated for selected leads");
      setSelectedLeads([]);
      setSelectAll(false);
      fetchLeads();
    } catch (err) {
      console.error(err);
      errorToast("Status update failed");
    }
  };

  const handleBulkDelete = async () => {
    const confirm = await Swal.fire({
      title: "Delete selected leads?",
      text: `${selectedLeads.length} leads will be removed.`,
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.post("/api/auth/bulk-delete", { ids: selectedLeads });

      successToast("Selected leads deleted");
      setSelectedLeads([]);
      setSelectAll(false);
      fetchLeads();
    } catch (err) {
      console.error(err);
      errorToast("Bulk delete failed");
    }
  };

  const fetchLeads = useCallback(async () => {
    const requestId = latestFetchRequestIdRef.current + 1;
    latestFetchRequestIdRef.current = requestId;

    try {
      const r = await api.get("/api/auth/list", {
        params: {
          page,
          limit,
          search: debouncedQ,
          leadStatus: status,
          industry: industry,
          leadType: leadType,
          leadSource: leadSource,
          AEOStatus: aeoStatus,
          RCMCPanel: rcmcStatus,
          RCMCType: rcmcType,
          includeFilters: !filterOptionsLoaded,
          _ts: Date.now(),
        },
      });

      if (latestFetchRequestIdRef.current !== requestId) {
        return;
      }

      setLeads(Array.isArray(r.data.leads) ? r.data.leads : []);
      setTotalPages(r.data.totalPages || 1);
      setTotalCount(r.data.total || 0);
      if (r.data.filterOptions) {
        setFilterOptions((prev) => ({
          ...prev,
          ...r.data.filterOptions,
        }));
        setFilterOptionsLoaded(true);
      }
    } catch (err) {
      console.error(err);
      errorToast("Failed to fetch leads");
    }
  }, [
    page,
    limit,
    debouncedQ,
    status,
    industry,
    leadType,
    leadSource,
    aeoStatus,
    rcmcStatus,
    rcmcType,
  ]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const sorted = useMemo(() => {
    const data = [...leads];
    if (!sortField) return data;

    data.sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";

      if (sortField === "priorityRating") {
        const comp = (priorityOrder[av] ?? 99) - (priorityOrder[bv] ?? 99);
        return sortDir === "asc" ? comp : -comp;
      }

      if (sortField === "createdAt") {
        const da = new Date(a.createdAt).getTime();
        const db = new Date(b.createdAt).getTime();
        return sortDir === "asc" ? da - db : db - da;
      }

      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    return data;
  }, [leads, sortField, sortDir]);

  const availableRCMCTypeList = useMemo(() => {
    const map = filterOptions.RCMCTypeMap || RCMC_TYPE_MAP;
    const fromPanel = rcmcStatus ? map[rcmcStatus] || [] : [];
    if (fromPanel.length) {
      return fromPanel;
    }
    return rcmcType ? [rcmcType] : filterOptions.RCMCType || [];
  }, [filterOptions, rcmcStatus, rcmcType]);

  useEffect(() => {
    if (!rcmcType) {
      return;
    }

    if (!availableRCMCTypeList.includes(rcmcType)) {
      setRcmcType("");
      setPage(1);
    }
  }, [availableRCMCTypeList, rcmcType]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This lead will be marked as deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });
    if (!confirm.isConfirmed) return;
    try {
      await api.delete(`/api/auth/delete/${id}`);
      successToast("Lead deleted successfully!");
      fetchLeads();
    } catch (err) {
      console.error(err);
      errorToast("Failed to delete lead!");
    }
  };

  const exportCSV = () => {
    if (!sorted || sorted.length === 0) {
      errorToast("No records to export");
      return;
    }

    // 1. Get ALL keys from the first item (28 fields)
    const headers = Object.keys(sorted[0]);

    // 2. Convert data to CSV
    const csvRows = [
      headers.join(","), // header row
      ...sorted.map((row) =>
        headers
          .map((key) => {
            let val = row[key];
            if (val === null || val === undefined) val = "";
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ];

    // 3. Create file and download
    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
    successToast("CSV exported");
  };

  // helpers to render arrow
  const renderArrow = (field) =>
    sortField === field ? (sortDir === "asc" ? "▲" : "▼") : "⇅";

  const copyToClipboard = async (value, label) => {
    const text = String(value || "").trim();
    if (!text || text === "—") {
      errorToast(`No ${label.toLowerCase()} available to copy`);
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      successToast(`${label} copied`);
    } catch (error) {
      errorToast(`Unable to copy ${label.toLowerCase()}`);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center" ref={dropdownRef}>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search leads..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="w-80 shadow-sm border-gray-300"
          />
          <Button
            variant="outline"
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center gap-2"
          >
            <Filter size={16} /> Filters
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setQ("");
              setStatus("");
              setAeoStatus("");
              setRcmcStatus("");
              setRcmcType("");
              setIndustry("");
              setLeadType("");
              setLeadSource("");
              setPage(1);
              fetchLeads();
              successToast("Refreshed");
            }}
            className="flex items-center gap-2"
          >
            <RefreshCcw size={16} />
          </Button>

          <Button
            variant="outline"
            onClick={exportCSV}
            className="flex items-center gap-2"
          >
            <Download size={16} /> Export CSV
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={16} /> Create Lead
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    setViewMode(false);
                    setEditLead(null);
                    setOpen(true);
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Create Lead
                </button>
                <button
                  onClick={() => {
                    setImportModalOpen(true);
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Import Leads
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedLeads.length > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 p-3 rounded border my-2">
          <span className="font-semibold">{selectedLeads.length} selected</span>

          <Button variant="outline" onClick={handleBulkStatusUpdate}>
            Update Status
          </Button>

          <Button
            variant="outline"
            onClick={handleBulkDelete}
            className="text-red-600"
          >
            Delete Selected
          </Button>
        </div>
      )}

      {showFilters && (
        <LeadFilters
          status={status}
          setStatus={setStatus}
          leadStatusList={filterOptions.leadStatus || Object.keys(statusColors)}
          aeoStatus={aeoStatus}
          setAeoStatus={setAeoStatus}
          AEOStatusList={filterOptions.AEOStatus || AEOStatusList}
          rcmcStatus={rcmcStatus}
          setRcmcStatus={setRcmcStatus}
          RCMCPanelList={filterOptions.RCMCPanel || RCMCPanelList}
          rcmcType={rcmcType}
          setRcmcType={setRcmcType}
          RCMCTypeList={availableRCMCTypeList}
          industry={industry}
          setIndustry={setIndustry}
          industryList={filterOptions.industry || industryList}
          leadType={leadType}
          setLeadType={setLeadType}
          leadTypeList={filterOptions.leadType || leadTypeList}
          leadSource={leadSource}
          setLeadSource={setLeadSource}
          leadSourceList={filterOptions.leadSource || leadSourceList}
        />
      )}

      <LeadFormModal
        open={open}
        setOpen={setOpen}
        editLead={editLead}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onSaved={fetchLeads}
      />
      <ImportModal
        open={importModalOpen}
        setOpen={setImportModalOpen}
        onImported={fetchLeads}
        entity="leads"
      />

      {/* TABLE CONTAINER: parent MUST have overflow for sticky header to work */}
      <div className="bg-white border rounded-lg shadow-md">
        <div className="relative overflow-auto max-h-[70vh]">
          <Table className="min-w-full">
            <TableHeader className="sticky top-0 bg-gray-100 z-40">
              <TableRow>
                <TableHead>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => {
                      setSelectAll(e.target.checked);
                      setSelectedLeads(
                        e.target.checked ? sorted.map((l) => l._id) : []
                      );
                    }}
                  />
                </TableHead>

                <TableHead>Sr. No.</TableHead>
                <TableHead>ID</TableHead>

                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Name{" "}
                  <span className="ml-1 text-gray-700">
                    {renderArrow("name")}
                  </span>
                </TableHead>

                {/* Website */}
                <TableHead>Website</TableHead>

                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("email")}
                >
                  Email{" "}
                  <span className="ml-1 text-gray-700">
                    {renderArrow("email")}
                  </span>
                </TableHead>

                <TableHead>Mobile</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>RCMC Panel</TableHead>
                <TableHead>Lead Source</TableHead>
                <TableHead>Lead Type</TableHead>

                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("priorityRating")}
                >
                  Priority{" "}
                  <span className="ml-1 text-gray-700">
                    {renderArrow("priorityRating")}
                  </span>
                </TableHead>

                <TableHead>Status</TableHead>

                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  Created{" "}
                  <span className="ml-1 text-gray-700">
                    {renderArrow("createdAt")}
                  </span>
                </TableHead>

                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="text-center py-8 text-gray-500"
                  >
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((l, idx) => {
                  const index = (page - 1) * limit + idx + 1;
                  const rowPriority = l.priorityRating || "";
                  return (
                    <TableRow
                      key={l._id || index}
                      // className={`group relative transition hover:bg-blue-50 even:bg-gray-50 cursor-pointer ${priorityBorder[rowPriority] ?? priorityBorder[""]}`}
                      className="group relative transition hover:bg-blue-50 even:bg-gray-50 cursor-pointer"
                      onClick={(e) => {
                        // avoid clicking when user is interacting with action elements
                        if (
                          e.target.closest(".action-menu") ||
                          e.target.closest("button") ||
                          e.target.closest("a")
                        )
                          return;
                        setEditLead(l);
                        setViewMode(true);
                        setOpen(true);
                      }}
                    >
                      {/* <TableCell>{index}</TableCell> */}
                      <TableCell
                        onClick={(e) => e.stopPropagation()}
                        className="text-center w-10"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(l._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLeads((prev) => [...prev, l._id]);
                            } else {
                              setSelectedLeads((prev) =>
                                prev.filter((id) => id !== l._id)
                              );
                              setSelectAll(false);
                            }
                          }}
                        />
                      </TableCell>

                      <TableCell
                        className={
                          rowPriority === "Premium"
                            ? "border-l-4 border-purple-500"
                            : rowPriority === "High"
                            ? "border-l-4 border-red-500"
                            : rowPriority === "Medium"
                            ? "border-l-4 border-yellow-500"
                            : rowPriority === "Low"
                            ? "border-l-4 border-green-500"
                            : "border-l-4 border-transparent"
                        }
                      >
                        {index}
                      </TableCell>

                      <TableCell>{l.idNo}</TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="min-w-0 flex-1"
                            dangerouslySetInnerHTML={{
                              __html: highlight(l.name || "", q),
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(l.name, "Name");
                            }}
                            className="rounded p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                            title="Copy name"
                            aria-label="Copy name"
                          >
                            <Copy size={15} />
                          </button>
                        </div>
                      </TableCell>

                      <TableCell>
                        {l.website ? (
                          <a
                            href={
                              l.website.startsWith("http")
                                ? l.website
                                : `https://${l.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {l.website}
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>

                      <TableCell>
                        {l.email ? (
                          <a
                            href={`mailto:${l.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            <span
                              dangerouslySetInnerHTML={{
                                __html: highlight(l.email, q),
                              }}
                            />
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>{l.mobileNo || "—"}</div>

                          {/* hover quick actions */}
                          <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                            {l.email && (
                              <a
                                href={`mailto:${l.email}`}
                                onClick={(ev) => ev.stopPropagation()}
                                title="Send email"
                                className="p-1 rounded hover:bg-gray-100"
                              >
                                <Mail size={16} />
                              </a>
                            )}
                            {l.mobileNo && (
                              <a
                                href={`tel:${l.mobileNo}`}
                                onClick={(ev) => ev.stopPropagation()}
                                title="Call"
                                className="p-1 rounded hover:bg-gray-100"
                              >
                                <Phone size={16} />
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{l.industry || "—"}</TableCell>

                      <TableCell>{l.RCMCPanel || "—"}</TableCell>

                      <TableCell>{l.leadSource || "—"}</TableCell>

                      <TableCell>{l.leadType || "—"}</TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            rowPriority === "Premium"
                              ? "bg-purple-100 text-purple-700"
                              : rowPriority === "High"
                              ? "bg-red-100 text-red-700"
                              : rowPriority === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {l.priorityRating || "N/A"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`px-2 py-1 text-xs rounded-md font-medium ${
                            statusColors[l.leadStatus] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {l.leadStatus || "—"}
                        </span>
                      </TableCell>

                      <TableCell>
                        {l.createdAt
                          ? new Date(l.createdAt).toLocaleDateString()
                          : "—"}
                      </TableCell>

                      <TableCell className="relative action-menu">
                        <div className="flex justify-center">
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setOpenActionMenu((cur) =>
                                cur === l._id ? null : l._id
                              );
                            }}
                            className="p-1 rounded hover:bg-gray-200"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </div>

                        {openActionMenu === l._id && (
                          <div
                            onClick={(ev) => ev.stopPropagation()}
                            className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden animate-dropdown"
                          >
                            <button
                              onClick={() => {
                                setOpenActionMenu(null);
                                setEditLead(l);
                                setViewMode(false);
                                setOpen(true);
                              }}
                              className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition text-sm"
                            >
                              <Pencil size={16} className="text-blue-600" />{" "}
                              Edit
                            </button>

                            <button
                              onClick={() => {
                                setOpenActionMenu(null);
                                setEditLead(l);
                                setViewMode(true);
                                setOpen(true);
                              }}
                              className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition text-sm"
                            >
                              <Eye size={16} className="text-green-600" /> View
                            </button>

                            <button
                              onClick={() => {
                                setOpenActionMenu(null);
                                handleDelete(l._id);
                              }}
                              className="w-full px-4 py-2 flex items-center gap-2 hover:bg-red-50 text-red-600 transition text-sm"
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-200 p-4 bg-gray-50 gap-2">
          <div className="flex items-center gap-3">
            <Button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}{" "}
              {totalCount ? `• ${totalCount} items` : ""}
            </span>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span>Rows:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="border px-2 py-1 rounded"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <Button variant="ghost" onClick={exportCSV}>
              <Download size={16} /> CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
