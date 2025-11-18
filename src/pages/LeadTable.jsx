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
} from "lucide-react";
import LeadFormModal from "../components/LeadFormModal";
import ImportModal from "../components/ImportModal";
import LeadFilters from "../components/LeadFilters";
import { successToast, errorToast } from "@/utils/customToast";

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
  // "Contact on phone": "bg-yellow-100 text-yellow-700",
  "In Contact": "bg-teal-100 text-teal-700",
  Interested: "bg-green-100 text-green-700",
  "In Process": "bg-orange-100 text-orange-700",
  "Login Created": "bg-purple-100 text-purple-700",
  "Do Not Touch": "bg-pink-100 text-pink-700",
  // "Login Rejected": "bg-red-100 text-red-700",
  // "Not Interested": "bg-red-200 text-red-800",
  // "Not Contactable": "bg-gray-200 text-gray-800",
  // "Spam / Fake Lead": "bg-black text-white",
};

const priorityOrder = { Premium: 0, High: 1, Medium: 2, Low: 3, "": 4 };

// Lists
const AEOStatusList = ["NA", "AEO - T1", "AEO - T2", "AEO - T3", "AEO - LEO"];
const RCMCPanelList = [
  "FIEO",
  "EPC",
  "APPARELS",
  "CHEMICALS/PLASTIC",
  "Pharmaceuticals",
  "Gems & Jewellery",
  "Leather",
  "Handicraft",
  "Electronics & IT",
  "Sports Goods",
  "Services",
  "Commodity Boards",
  "Agricultural Products",
  "Marine Products",
];

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
  const [open, setOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  //filter
  const [status, setStatus] = useState("");
  const [aeoStatus, setAeoStatus] = useState("");
  const [rcmcStatus, setRcmcStatus] = useState("");
  const [industry, setIndustry] = useState("");
  const [leadType, setLeadType] = useState("");
  const [leadSource, setLeadSource] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [openActionMenu, setOpenActionMenu] = useState(null);
  const dropdownRef = useRef(null);

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

  const handleBulkStatusUpdate = async () => {
    const { value: status } = await Swal.fire({
      title: "Update Status",
      input: "select",
      inputOptions: {
        "Not Contacted": "Not Contacted",
        "Email Sent": "Email Sent",
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
      await api.put("api/auth/bulk-update-status", {
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
      await api.post("api/auth/bulk-delete", { ids: selectedLeads });

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
    try {
      // your API supports pagination and search
      const r = await api.get(
        `api/auth/list?page=${page}&limit=${limit}&search=${encodeURIComponent(
          q
        )}`
      );
      setLeads(Array.isArray(r.data.leads) ? r.data.leads : []);
      setTotalPages(r.data.totalPages || 1);
      setTotalCount(
        r.data.totalCount ?? (r.data.leads ? r.data.leads.length : 0)
      );
    } catch (err) {
      console.error(err);
      errorToast("Failed to fetch leads");
    }
  }, [page, limit, q]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // client filtering on status & search (server search used but keep client safety)
  // const filtered = useMemo(() => {
  //   if (!Array.isArray(leads)) return [];
  //   const query = q.trim().toLowerCase();
  //   return leads.filter((l) => {
  //     const hay = [
  //       l.idNo,
  //       l.name,
  //       l.email,
  //       l.mobileNo,
  //       l.industry,
  //       l.leadType,
  //       l.leadStatus,
  //       l.priorityRating,
  //     ]
  //       .join(" ")
  //       .toLowerCase();
  //     const matchQ = query ? hay.includes(query) : true;
  //     const matchS = status ? l.leadStatus === status : true;
  //     return matchQ && matchS;
  //   });
  // }, [leads, q, status]);

  const filtered = useMemo(() => {
    if (!Array.isArray(leads)) return [];

    const query = q.trim().toLowerCase();

    return leads.filter((l) => {
      const hay = [
        l.idNo,
        l.name,
        l.email,
        l.mobileNo,
        l.industry,
        l.leadType,
        l.leadSource,
        l.RCMCPanel,
        l.AEOStatus,
        l.leadStatus,
        l.priorityRating,
      ]
        .join(" ")
        .toLowerCase();

      const matchQ = query ? hay.includes(query) : true;

      // INDIVIDUAL FILTER MATCHERS
      const matchStatus = status ? l.leadStatus === status : true;
      const matchAEO = aeoStatus ? l.AEOStatus === aeoStatus : true;
      const matchRCMC = rcmcStatus ? l.RCMCPanel === rcmcStatus : true;
      const matchIndustry = industry ? l.industry === industry : true;
      const matchLeadType = leadType ? l.leadType === leadType : true;
      const matchLeadSource = leadSource ? l.leadSource === leadSource : true;

      return (
        matchQ &&
        matchStatus &&
        matchAEO &&
        matchRCMC &&
        matchIndustry &&
        matchLeadType &&
        matchLeadSource
      );
    });
  }, [leads, q, status, aeoStatus, rcmcStatus, industry, leadType, leadSource]);

  const sorted = useMemo(() => {
    const data = [...filtered];
    if (!sortField) return data;
    data.sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      // priority special sort
      if (sortField === "priorityRating") {
        const comp = (priorityOrder[av] ?? 99) - (priorityOrder[bv] ?? 99);
        return sortDir === "asc" ? comp : -comp;
      }
      // createdAt date
      if (sortField === "createdAt") {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortDir === "asc" ? da - db : db - da;
      }
      // string compare
      const sa = String(av).toLowerCase();
      const sb = String(bv).toLowerCase();
      if (sa === sb) return 0;
      return sortDir === "asc" ? (sa > sb ? 1 : -1) : sa < sb ? 1 : -1;
    });
    return data;
  }, [filtered, sortField, sortDir]);

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
      await api.delete(`api/auth/delete/${id}`);
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

  // paginate UI calculations (server-driven but UI shows current)
  // If your API returns totalCount, adjust totalPages accordingly.
  // We'll assume server returns totalPages.

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
          leadStatusList={Object.keys(statusColors)}
          aeoStatus={aeoStatus}
          setAeoStatus={setAeoStatus}
          AEOStatusList={AEOStatusList}
          rcmcStatus={rcmcStatus}
          setRcmcStatus={setRcmcStatus}
          RCMCPanelList={RCMCPanelList}
          industry={industry}
          setIndustry={setIndustry}
          industryList={industryList}
          leadType={leadType}
          setLeadType={setLeadType}
          leadTypeList={leadTypeList}
          leadSource={leadSource}
          setLeadSource={setLeadSource}
          leadSourceList={leadSourceList}
        />
      )}

      <LeadFormModal
        open={open}
        setOpen={setOpen}
        editLead={editLead}
        viewMode={viewMode}
        onSaved={fetchLeads}
      />
      <ImportModal
        open={importModalOpen}
        setOpen={setImportModalOpen}
        onImported={fetchLeads}
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
                      setSelectedLeads(checked ? sorted.map((l) => l._id) : []);
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
                        <div
                          dangerouslySetInnerHTML={{
                            __html: highlight(l.name || "", q),
                          }}
                        />
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
