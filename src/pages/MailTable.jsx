// // import React, { useEffect, useState, useRef } from "react";
// // import Swal from "sweetalert2";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import {
// //   Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
// // } from "@/components/ui/table";
// // import {
// //   Filter, RefreshCcw, Pencil, Trash2, Eye, MoreVertical, Mail, Download,
// // } from "lucide-react";
// // import MailFormModal from "../components/MailFormModal";
// // import MailFilters from "../components/MailFilters";
// // import useMailStore from "../store/mailStore";
// // import { successToast, errorToast } from "@/utils/customToast";

// // // ── Excel serial date → "9-Feb-26" format ─────────────────────────────────────
// // function excelDateToString(serial) {
// //   if (!serial || isNaN(serial)) return serial || "—";
// //   const date  = new Date((serial - 25569) * 86400 * 1000);
// //   const day   = date.getUTCDate();
// //   const month = date.toLocaleString("en-GB", { month: "short", timeZone: "UTC" });
// //   const year  = String(date.getUTCFullYear()).slice(-2);
// //   return `${day}-${month}-${year}`;
// // }

// // const statusColors = {
// //   sent:      "bg-green-100 text-green-700",
// //   draft:     "bg-gray-100 text-gray-600",
// //   failed:    "bg-red-100 text-red-600",
// //   scheduled: "bg-blue-100 text-blue-700",
// // };

// // function highlight(text = "", query = "") {
// //   if (!query) return escapeHtml(text);
// //   const safeText = escapeHtml(text);
// //   const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
// //   return safeText.replace(regex, `<mark class="bg-yellow-300 rounded">$1</mark>`);
// // }
// // function escapeHtml(s) {
// //   return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
// // }
// // function escapeRegex(s) {
// //   return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// // }

// // export default function MailTable() {
// //   const {
// //     leads, total, page, limit, loading,
// //     search, selectedIds,
// //     loadLeads,loadFilterOptions, setPage, setLimit, setSearch,
// //     toggleSelect, selectAll, clearSelection,
// //     openEditModal, deleteLead, exportCSV,
// //   } = useMailStore();

// //   const [showFilters, setShowFilters]       = useState(false);
// //   const [allSelected, setAllSelected]       = useState(false);
// //   const [openActionMenu, setOpenActionMenu] = useState(null);
// //   const dropdownRef = useRef(null);
// //   const totalPages  = Math.ceil(total / limit);

// //   useEffect(() => { loadLeads(); loadFilterOptions(); }, []);



// //   useEffect(() => {
// //     const handle = (e) => {
// //       if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
// //       if (e.target.closest && e.target.closest(".action-menu")) return;
// //       setOpenActionMenu(null);
// //     };
// //     document.addEventListener("click", handle);
// //     return () => document.removeEventListener("click", handle);
// //   }, []);

// //   useEffect(() => {
// //     const handleEsc = (e) => { if (e.key === "Escape") setOpenActionMenu(null); };
// //     window.addEventListener("keydown", handleEsc);
// //     return () => window.removeEventListener("keydown", handleEsc);
// //   }, []);

// //   const handleSelectAll = (checked) => {
// //     setAllSelected(checked);
// //     if (checked) selectAll(leads.map((l) => l._id));
// //     else clearSelection();
// //   };

// //   const handleDelete = async (id) => {
// //     const confirm = await Swal.fire({
// //       title: "Are you sure?",
// //       text: "This lead will be deleted.",
// //       icon: "warning",
// //       showCancelButton: true,
// //       confirmButtonText: "Yes, delete it!",
// //     });
// //     if (!confirm.isConfirmed) return;
// //     try {
// //       await deleteLead(id);
// //       successToast("Lead deleted successfully!");
// //     } catch { errorToast("Failed to delete lead!"); }
// //   };

// //   const handleExportCSV = () => {
// //     if (!leads || leads.length === 0) { errorToast("No records to export"); return; }
// //     exportCSV();
// //     successToast("CSV exported");
// //   };


// //   return (
// //     <div className="space-y-4 p-4">

// //       {/* ── Top Bar ── */}
// //       <div className="flex justify-between items-center" ref={dropdownRef}>
// //         <div className="flex items-center gap-3">
// //           <Input
// //             placeholder="Search leads..."
// //             value={search}
// //             onChange={(e) => setSearch(e.target.value)}
// //             className="w-80 shadow-sm border-gray-300"
// //           />
// //           <Button variant="outline" onClick={() => setShowFilters((p) => !p)} className="flex items-center gap-2">
// //             <Filter size={16} /> Filters
// //           </Button>
// //           <Button variant="outline" onClick={() => { loadLeads(); successToast("Refreshed"); }} className="flex items-center gap-2">
// //             <RefreshCcw size={16} />
// //           </Button>
// //           <Button variant="outline" onClick={handleExportCSV} className="flex items-center gap-2">
// //             <Download size={16} /> Export CSV
// //           </Button>
// //         </div>
// //       </div>

// //       {/* ── Selected bar ── */}
// //       {selectedIds.length > 0 && (
// //         <div className="flex items-center gap-3 bg-blue-50 p-3 rounded border">
// //           <span className="font-semibold">{selectedIds.length} selected</span>
// //           <Button variant="outline" onClick={clearSelection} className="text-red-600">Clear</Button>
// //         </div>
// //       )}

// //       {/* ── Filters ── */}
// //       {showFilters && <MailFilters onClose={() => setShowFilters(false)} />}

// //       {/* ── Modal ── */}
// //       <MailFormModal />

// //       {/* ── Table ── */}
// //       <div className="bg-white border rounded-lg shadow-md">
// //         <div className="relative overflow-auto max-h-[70vh]">
// //           <Table className="min-w-full">
// //             <TableHeader className="sticky top-0 bg-gray-100 z-40">
// //               <TableRow>
// //                 <TableHead><input type="checkbox" checked={allSelected} onChange={(e) => handleSelectAll(e.target.checked)} /></TableHead>
// //                 <TableHead>Sr. No.</TableHead>
// //                 <TableHead>Name</TableHead>
// //                 <TableHead>Sender Email</TableHead>
// //                 <TableHead>Company Email</TableHead>
// //                 <TableHead>Phone</TableHead>
// //                 <TableHead>City</TableHead>
// //                 <TableHead>State</TableHead>
// //                 <TableHead>Template</TableHead>
// //                 <TableHead>Subject</TableHead>
// //                 <TableHead>Date</TableHead>
// //                 <TableHead>IP Address</TableHead>
// //                 <TableHead>Web</TableHead>
// //                 <TableHead>Email Sent</TableHead>
// //                 <TableHead>Verified</TableHead>
// //                 <TableHead>Lead Type</TableHead>
// //                 <TableHead>Lead Source</TableHead>
// //                 <TableHead>Status</TableHead>
// //                 <TableHead>RCMC Panel</TableHead>
// //                 <TableHead>Pin Code</TableHead>
// //                 <TableHead>Notes</TableHead>
// //                 <TableHead>Actions</TableHead>
// //               </TableRow>
// //             </TableHeader>

// //             <TableBody>
// //               {loading ? (
// //                 <TableRow><TableCell colSpan={22} className="text-center py-8 text-gray-400">Loading...</TableCell></TableRow>
// //               ) : leads.length === 0 ? (
// //                 <TableRow><TableCell colSpan={22} className="text-center py-8 text-gray-500">No records found</TableCell></TableRow>
// //               ) : (
// //                 leads.map((l, idx) => {
// //                   const srNo       = (page - 1) * limit + idx + 1;
// //                   const isSelected = selectedIds.includes(l._id);

// //                   return (
// //                     <TableRow
// //                       key={l._id}
// //                       className={`group relative transition hover:bg-blue-50 even:bg-gray-50 cursor-pointer ${isSelected ? "bg-blue-50" : ""}`}
// //                       onClick={(e) => {
// //                         if (e.target.closest(".action-menu") || e.target.closest("button") || e.target.closest("a")) return;
// //                         openEditModal(l);
// //                       }}
// //                     >
// //                       <TableCell onClick={(e) => e.stopPropagation()} className="text-center w-10">
// //                         <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(l._id)} />
// //                       </TableCell>

// //                       <TableCell>{srNo}</TableCell>

// //                       {/* Name */}
// //                       <TableCell className="font-medium min-w-[160px]">
// //                         <div dangerouslySetInnerHTML={{ __html: highlight(l.name || "", search) }} />
// //                       </TableCell>

// //                       {/* Sender Email */}
// //                       <TableCell className="min-w-[180px]">
// //                         {l["Email Id"] ? (
// //                           <a href={`mailto:${l["Email Id"]}`} className="text-blue-600 hover:underline text-xs" onClick={(e) => e.stopPropagation()}>
// //                             <span dangerouslySetInnerHTML={{ __html: highlight(l["Email Id"], search) }} />
// //                           </a>
// //                         ) : "—"}
// //                       </TableCell>

// //                       {/* Company Email */}
// //                       <TableCell className="min-w-[180px]">
// //                         <div className="flex items-center gap-1">
// //                           {l.email ? (
// //                             <a href={`mailto:${l.email}`} className="text-blue-600 hover:underline text-xs" onClick={(e) => e.stopPropagation()}>
// //                               <span dangerouslySetInnerHTML={{ __html: highlight(l.email, search) }} />
// //                             </a>
// //                           ) : "—"}
// //                           {l.email && (
// //                             <a href={`mailto:${l.email}`} onClick={(e) => e.stopPropagation()} title="Send email"
// //                               className="p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition ml-auto">
// //                               <Mail size={13} />
// //                             </a>
// //                           )}
// //                         </div>
// //                       </TableCell>

// //                       {/* Phone */}
// //                       <TableCell className="whitespace-nowrap">
// //                         {l.landlineNo || l.mobileNo || "—"}
// //                       </TableCell>

// //                       <TableCell>{l.city || "—"}</TableCell>
// //                       <TableCell>{l.state || "—"}</TableCell>
// //                       <TableCell>{l.Template || "—"}</TableCell>
// //                       <TableCell>{l.Subject || "—"}</TableCell>

// //                       {/* Date — Excel serial → readable */}
// //                       <TableCell className="whitespace-nowrap text-xs">
// //                         {excelDateToString(l.Date)}
// //                       </TableCell>

// //                       {/* IP Address */}
// //                       <TableCell className="text-xs text-gray-500">
// //                         {l["IP Address"] || "—"}
// //                       </TableCell>

// //                       {/* Web */}
// //                       <TableCell className="text-xs text-gray-500">
// //                         {l.Web || "—"}
// //                       </TableCell>

// //                       {/* Email Sent */}
// //                       <TableCell>
// //                         <span className={`px-2 py-0.5 rounded text-xs font-medium ${
// //                           l["Email sent"] === "Yes" ? "bg-green-100 text-green-700" :
// //                           l["Email sent"] === "No"  ? "bg-red-100 text-red-500"    :
// //                           "bg-gray-100 text-gray-400"
// //                         }`}>{l["Email sent"] || "—"}</span>
// //                       </TableCell>

// //                       {/* Verified */}
// //                       <TableCell>
// //                         <span className={`px-2 py-0.5 rounded text-xs font-medium ${
// //                           String(l["verify email"]).toLowerCase() === "ok"
// //                             ? "bg-green-100 text-green-700"
// //                             : "bg-gray-100 text-gray-400"
// //                         }`}>{l["verify email"] || "—"}</span>
// //                       </TableCell>

// //                       <TableCell>{l.leadType || "—"}</TableCell>
// //                       <TableCell>{l.leadSource || "—"}</TableCell>

// //                       {/* Status */}
// //                       <TableCell>
// //                         <span className={`px-2 py-1 text-xs rounded-md font-medium ${
// //                           statusColors[l.leadStatus] || statusColors[l.status] || "bg-gray-100 text-gray-700"
// //                         }`}>{l.leadStatus || l.status || "—"}</span>
// //                       </TableCell>

// //                       <TableCell>{l.RCMCPanel || "—"}</TableCell>
// //                       <TableCell>{l.pinCode || "—"}</TableCell>

// //                       {/* Notes */}
// //                       <TableCell>
// //                         <span className="truncate max-w-[120px] block text-gray-500 text-xs" title={l.notes}>
// //                           {l.notes || "—"}
// //                         </span>
// //                       </TableCell>

// //                       {/* ── Action Menu ── */}
// //                       <TableCell className="relative action-menu">
// //                         <div className="flex justify-center">
// //                           <button
// //                             onClick={(e) => { e.stopPropagation(); setOpenActionMenu((cur) => cur === l._id ? null : l._id); }}
// //                             className="p-1 rounded hover:bg-gray-200"
// //                           >
// //                             <MoreVertical size={18} />
// //                           </button>
// //                         </div>

// //                         {openActionMenu === l._id && (
// //                           <div onClick={(e) => e.stopPropagation()}
// //                             className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden animate-dropdown"
// //                           >
// //                             <button onClick={() => { setOpenActionMenu(null); openEditModal(l); }}
// //                               className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition text-sm">
// //                               <Pencil size={16} className="text-blue-600" /> Edit
// //                             </button>
// //                             <button onClick={() => { setOpenActionMenu(null); openEditModal(l); }}
// //                               className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition text-sm">
// //                               <Eye size={16} className="text-green-600" /> View
// //                             </button>
// //                             <button onClick={() => { setOpenActionMenu(null); handleDelete(l._id); }}
// //                               className="w-full px-4 py-2 flex items-center gap-2 hover:bg-red-50 text-red-600 transition text-sm">
// //                               <Trash2 size={16} /> Delete
// //                             </button>
// //                           </div>
// //                         )}
// //                       </TableCell>
// //                     </TableRow>
// //                   );
// //                 })
// //               )}
// //             </TableBody>
// //           </Table>
// //         </div>

// //         {/* ── Footer / Pagination ── */}
// //         <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-200 p-4 bg-gray-50 gap-2">
// //           <div className="flex items-center gap-3">
// //             <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
// //             <span>Page {page} of {totalPages || 1} • {total} items</span>
// //             <Button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
// //           </div>
// //           <div className="flex items-center gap-3">
// //             <span>Rows:</span>
// //             <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="border px-2 py-1 rounded">
// //               <option value={10}>10</option>
// //               <option value={25}>25</option>
// //               <option value={50}>50</option>
// //               <option value={100}>100</option>
// //             </select>
// //             <Button variant="ghost" onClick={handleExportCSV}><Download size={16} /> CSV</Button>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }



import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Filter, Plus, RefreshCcw, Pencil, Trash2, Eye, MoreVertical, Mail, Phone, Download,
} from "lucide-react";
import MailFormModal from "../components/MailFormModal";
import MailFilters from "../components/MailFilters";
import ImportModal from "../components/ImportModal";
import useMailStore from "../store/mailStore";
import { successToast, errorToast } from "@/utils/customToast";

// Priority order for sorting
const priorityOrder = { Premium: 0, High: 1, Medium: 2, Low: 3, "": 4 };

// Status colours (for leadStatus field)
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
  sent: "bg-green-100 text-green-700",
  draft: "bg-gray-100 text-gray-600",
  bounced: "bg-red-100 text-red-600",
  enquiry: "bg-yellow-100 text-yellow-700",
  reached: "bg-blue-100 text-blue-700",
  stop: "bg-red-200 text-red-800",
};

// Helper for highlighting search terms
function highlight(text = "", query = "") {
  if (!query) return escapeHtml(text);
  const safeText = escapeHtml(text);
  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  return safeText.replace(regex, `<mark class="bg-yellow-300 rounded">$1</mark>`);
}
function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ✅ Updated excelDateToString – format: 9-Feb-26
function excelDateToString(serial) {
  if (!serial || isNaN(serial)) return serial || "—";
  const date = new Date((serial - 25569) * 86400 * 1000);
  const day = String(date.getDate()).padStart(2, '0');   // leading zero
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  return `${day}-${month}-${year}`;
}

export default function MailTable() {
  // ── Store actions & state ───────────────────────────────────────────
  const {
    leads, total, page, limit, loading, search,
    loadLeads, loadFilterOptions, setPage, setLimit, setSearch,
    deleteLead, exportCSV, clearSelection,
    toggleSelect, selectedIds,
  } = useMailStore();

  // ── Local UI state ──────────────────────────────────────────────────
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [openFormModal, setOpenFormModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const dropdownRef = useRef(null);

  // Sorting (client‑side)
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  // Local copy of selectedIds to manage "select all" checkbox
  const [localSelected, setLocalSelected] = useState([]);
  const [localSelectAll, setLocalSelectAll] = useState(false);

  // Sync local selected with store selectedIds
  useEffect(() => {
    setLocalSelected(selectedIds);
  }, [selectedIds]);

  // Sync "select all" checkbox when leads or selection changes
  useEffect(() => {
    if (leads.length === 0) {
      setLocalSelectAll(false);
      return;
    }
    const allSelected = leads.every((l) => localSelected.includes(l._id));
    setLocalSelectAll(allSelected);
  }, [leads, localSelected]);

  // ── Data & filters ──────────────────────────────────────────────────
  useEffect(() => {
    loadLeads();
    loadFilterOptions();
  }, []);

  // Reload when pagination or search changes
  useEffect(() => {
    loadLeads();
  }, [page, limit, search]);

  // Helper to reload leads after actions
  const refresh = useCallback(() => {
    loadLeads();
  }, [loadLeads]);

  // ── Sorting (client‑side) ────────────────────────────────────────────
  const sortedLeads = useMemo(() => {
    const data = [...leads];
    if (!sortField) return data;

    data.sort((a, b) => {
      let av = a[sortField] ?? "";
      let bv = b[sortField] ?? "";

      if (sortField === "priorityRating") {
        const comp = (priorityOrder[av] ?? 99) - (priorityOrder[bv] ?? 99);
        return sortDir === "asc" ? comp : -comp;
      }
      if (sortField === "createdAt") {
        const da = new Date(av).getTime();
        const db = new Date(bv).getTime();
        return sortDir === "asc" ? da - db : db - da;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return data;
  }, [leads, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // ── Selection helpers ────────────────────────────────────────────────
  const handleSelectAll = (checked) => {
    setLocalSelectAll(checked);
    if (checked) {
      const allIds = leads.map((l) => l._id);
      setLocalSelected(allIds);
      allIds.forEach((id) => {
        if (!selectedIds.includes(id)) toggleSelect(id);
      });
    } else {
      setLocalSelected([]);
      clearSelection();
    }
  };

  const handleToggleSelect = (id) => {
    toggleSelect(id);
  };

  // ── Bulk actions ─────────────────────────────────────────────────────
const handleBulkStatusUpdate = async () => {
  if (selectedIds.length === 0) return errorToast("No mails selected");

  const { value: newStatus } = await Swal.fire({
    title: "Update Mail Status",
    input: "select",
    inputOptions: {
      draft: "Draft",
      sent: "Sent",
      failed: "Failed",
      scheduled: "Scheduled",
    },
    inputPlaceholder: "Choose new status",
    showCancelButton: true,
  });

  if (!newStatus) return;

  try {
    // Call a mail‑specific bulk endpoint (we'll create it next)
    await api.post("/api/mail/bulk-status", { ids: selectedIds, status: newStatus });
    successToast(`${selectedIds.length} mail(s) updated to ${newStatus}`);
    clearSelection();
    refresh(); // reload table
  } catch (err) {
    console.error(err);
    errorToast("Bulk update failed");
  }
};

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return errorToast("No leads selected");
    const confirm = await Swal.fire({
      title: "Delete selected leads?",
      text: `${selectedIds.length} leads will be removed.`,
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;
    try {
      await api.post("/api/mail/bulk-delete", { ids: selectedIds });
      successToast("Selected leads deleted");
      clearSelection();
      refresh();
    } catch (err) {
      errorToast("Bulk delete failed");
    }
  };

  // ── Single delete ────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This lead will be marked as deleted.",
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;
    try {
      await deleteLead(id);
      successToast("Lead deleted successfully!");
      refresh();
    } catch (err) {
      errorToast("Failed to delete lead!");
    }
  };

  // ── Export CSV (using store export) ─────────────────────────────────
  const handleExportCSV = () => {
    if (!leads || leads.length === 0) {
      errorToast("No records to export");
      return;
    }
    exportCSV();
    successToast("CSV exported");
  };

  // ── Clear all filters ───────────────────────────────────────────────
  const handleClearFilters = () => {
    setSearch("");
    setPage(1);
    refresh();
    successToast("Filters cleared");
  };

  // ── Close dropdowns on outside click ────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
      if (e.target.closest && e.target.closest(".action-menu")) return;
      setShowCreateDropdown(false);
      setOpenActionMenu(null);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4 p-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center flex-wrap gap-2" ref={dropdownRef}>
        <div className="flex items-center gap-3 flex-wrap">
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-80 shadow-sm border-gray-300"
          />
          <Button variant="outline" onClick={() => setShowFilters((p) => !p)} className="flex items-center gap-2">
            <Filter size={16} /> Filters
          </Button>
          <Button variant="outline" onClick={handleClearFilters} className="flex items-center gap-2">
            <RefreshCcw size={16} />
          </Button>
          <Button variant="outline" onClick={handleExportCSV} className="flex items-center gap-2">
            <Download size={16} /> Export CSV
          </Button>
        </div>

        <div className="relative">
          <Button onClick={() => setShowCreateDropdown(!showCreateDropdown)} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus size={16} /> Create Lead
            <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
          {showCreateDropdown && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <button onClick={() => { setShowCreateDropdown(false); setEditLead(null); setViewMode(false); setOpenFormModal(true); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                Create Lead
              </button>
              <button onClick={() => { setShowCreateDropdown(false); setImportModalOpen(true); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                Import Leads
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 p-3 rounded border my-2">
          <span className="font-semibold">{selectedIds.length} selected</span>
          <Button variant="outline" onClick={handleBulkStatusUpdate}>Update Status</Button>
          <Button variant="outline" onClick={handleBulkDelete} className="text-red-600">Delete Selected</Button>
          <Button variant="outline" onClick={clearSelection} className="text-gray-600">Clear Selection</Button>
        </div>
      )}

      {/* Error Display (if any) */}
      {useMailStore.getState().error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          Error loading leads: {useMailStore.getState().error}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && <MailFilters />}

      {/* Modals */}
      <MailFormModal
        open={openFormModal}
        setOpen={setOpenFormModal}
        editLead={editLead}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onSaved={refresh}
      />
      <ImportModal open={importModalOpen} setOpen={setImportModalOpen} onImported={refresh} />

      {/* Table */}
      <div className="bg-white border rounded-lg shadow-md">
        <div className="relative overflow-auto max-h-[70vh]">
          <Table className="min-w-full">
            <TableHeader className="sticky top-0 bg-gray-100 z-40">
              <TableRow>
                <TableHead><input type="checkbox" checked={localSelectAll} onChange={(e) => handleSelectAll(e.target.checked)} /></TableHead>
                <TableHead>Sr. No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Sender Email</TableHead>
                <TableHead>Company Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Web</TableHead>
                <TableHead>Email Sent</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Lead Type</TableHead>
                <TableHead>Lead Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>RCMC Panel</TableHead>
                <TableHead>Pin Code</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={22} className="text-center py-8 text-gray-400">Loading...</TableCell></TableRow>
              ) : sortedLeads.length === 0 ? (
                <TableRow><TableCell colSpan={22} className="text-center py-8 text-gray-500">No records found</TableCell></TableRow>
              ) : (
                sortedLeads.map((lead, idx) => {
                  const srNo = (page - 1) * limit + idx + 1;
                  const isSelected = selectedIds.includes(lead._id);
                  return (
                    <TableRow
                      key={lead._id}
                      className={`group relative transition hover:bg-blue-50 even:bg-gray-50 cursor-pointer ${isSelected ? "bg-blue-50" : ""}`}
                      onClick={(e) => {
                        if (e.target.closest(".action-menu") || e.target.closest("button") || e.target.closest("a")) return;
                        setEditLead(lead);
                        setViewMode(true);
                        setOpenFormModal(true);
                      }}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()} className="text-center w-10">
                        <input type="checkbox" checked={isSelected} onChange={() => handleToggleSelect(lead._id)} />
                      </TableCell>
                      <TableCell>{srNo}</TableCell>
                      <TableCell><div dangerouslySetInnerHTML={{ __html: highlight(lead.name || "", search) }} /></TableCell>
                      <TableCell>{lead["Email Id"] || "—"}</TableCell>
                      <TableCell>{lead.email || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{lead.mobileNo || lead.landlineNo || "—"}</span>
                          <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                            {lead.email && <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()} className="p-1 rounded hover:bg-gray-100"><Mail size={16} /></a>}
                            {(lead.mobileNo || lead.landlineNo) && <a href={`tel:${lead.mobileNo || lead.landlineNo}`} onClick={(e) => e.stopPropagation()} className="p-1 rounded hover:bg-gray-100"><Phone size={16} /></a>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{lead.city || "—"}</TableCell>
                      <TableCell>{lead.state || "—"}</TableCell>
                      <TableCell>{lead.Template || "—"}</TableCell>
                      <TableCell>{lead.Subject || "—"}</TableCell>
                      <TableCell  className="whitespace-nowrap">
                        {lead.Date ? (typeof lead.Date === "number" ? excelDateToString(lead.Date) : lead.Date) :
                         lead.emailDate ? lead.emailDate :
                         lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>{lead["IP Address"] || lead.ipAddress || "—"}</TableCell>
                      <TableCell>{lead.Web || lead.webTabAndType || "—"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          (lead["Email sent"] || lead.emailSentType) === "Yes" ? "bg-green-100 text-green-700" :
                          (lead["Email sent"] || lead.emailSentType) === "No" ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-500"
                        }`}>
                          {lead["Email sent"] || lead.emailSentType || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          (lead["verify email"] || lead.emailVerified) === "ok" ? "bg-green-100 text-green-700" :
                          (lead["verify email"] || lead.emailVerified) === "Yes" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {lead["verify email"] || lead.emailVerified || "—"}
                        </span>
                      </TableCell>
                      <TableCell>{lead.leadType || "—"}</TableCell>
                      <TableCell>{lead.leadSource || "—"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-md font-medium ${
                          statusColors[lead.leadStatus] || statusColors[lead.status] || "bg-gray-100 text-gray-700"
                        }`}>
                          {lead.leadStatus || lead.status || "—"}
                        </span>
                      </TableCell>
                      <TableCell>{lead.RCMCPanel || "—"}</TableCell>
                      <TableCell>{lead.pinCode || "—"}</TableCell>
                      <TableCell className="max-w-32 truncate" title={lead.notes}>{lead.notes || "—"}</TableCell>
                      <TableCell className="relative action-menu">
                        <div className="flex justify-center">
                          <button onClick={(e) => { e.stopPropagation(); setOpenActionMenu((cur) => cur === lead._id ? null : lead._id); }} className="p-1 rounded hover:bg-gray-200">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                        {openActionMenu === lead._id && (
                          <div onClick={(e) => e.stopPropagation()} className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                            <button onClick={() => { setOpenActionMenu(null); setEditLead(lead); setViewMode(false); setOpenFormModal(true); }} className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-100 text-sm">
                              <Pencil size={16} className="text-blue-600" /> Edit
                            </button>
                            <button onClick={() => { setOpenActionMenu(null); setEditLead(lead); setViewMode(true); setOpenFormModal(true); }} className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-100 text-sm">
                              <Eye size={16} className="text-green-600" /> View
                            </button>
                            <button onClick={() => { setOpenActionMenu(null); handleDelete(lead._id); }} className="w-full px-4 py-2 flex items-center gap-2 hover:bg-red-50 text-red-600 text-sm">
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

        {/* Footer pagination */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-200 p-4 bg-gray-50 gap-2">
          <div className="flex items-center gap-3">
            <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span>Page {page} of {totalPages || 1} • {total} items</span>
            <Button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
          <div className="flex items-center gap-3">
            <span>Rows:</span>
            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="border px-2 py-1 rounded">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <Button variant="ghost" onClick={handleExportCSV}><Download size={16} /> CSV</Button>
          </div>
        </div>
      </div>
    </div>
  );
}