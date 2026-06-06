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

// // // â”€â”€ Excel serial date â†’ "9-Feb-26" format â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// // function excelDateToString(serial) {
// //   if (!serial || isNaN(serial)) return serial || "â€”";
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

// //       {/* â”€â”€ Top Bar â”€â”€ */}
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

// //       {/* â”€â”€ Selected bar â”€â”€ */}
// //       {selectedIds.length > 0 && (
// //         <div className="flex items-center gap-3 bg-blue-50 p-3 rounded border">
// //           <span className="font-semibold">{selectedIds.length} selected</span>
// //           <Button variant="outline" onClick={clearSelection} className="text-red-600">Clear</Button>
// //         </div>
// //       )}

// //       {/* â”€â”€ Filters â”€â”€ */}
// //       {showFilters && <MailFilters onClose={() => setShowFilters(false)} />}

// //       {/* â”€â”€ Modal â”€â”€ */}
// //       <MailFormModal />

// //       {/* â”€â”€ Table â”€â”€ */}
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
// //                         ) : "â€”"}
// //                       </TableCell>

// //                       {/* Company Email */}
// //                       <TableCell className="min-w-[180px]">
// //                         <div className="flex items-center gap-1">
// //                           {l.email ? (
// //                             <a href={`mailto:${l.email}`} className="text-blue-600 hover:underline text-xs" onClick={(e) => e.stopPropagation()}>
// //                               <span dangerouslySetInnerHTML={{ __html: highlight(l.email, search) }} />
// //                             </a>
// //                           ) : "â€”"}
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
// //                         {l.landlineNo || l.mobileNo || "â€”"}
// //                       </TableCell>

// //                       <TableCell>{l.city || "â€”"}</TableCell>
// //                       <TableCell>{l.state || "â€”"}</TableCell>
// //                       <TableCell>{l.Template || "â€”"}</TableCell>
// //                       <TableCell>{l.Subject || "â€”"}</TableCell>

// //                       {/* Date â€” Excel serial â†’ readable */}
// //                       <TableCell className="whitespace-nowrap text-xs">
// //                         {excelDateToString(l.Date)}
// //                       </TableCell>

// //                       {/* IP Address */}
// //                       <TableCell className="text-xs text-gray-500">
// //                         {l["IP Address"] || "â€”"}
// //                       </TableCell>

// //                       {/* Web */}
// //                       <TableCell className="text-xs text-gray-500">
// //                         {l.Web || "â€”"}
// //                       </TableCell>

// //                       {/* Email Sent */}
// //                       <TableCell>
// //                         <span className={`px-2 py-0.5 rounded text-xs font-medium ${
// //                           l["Email sent"] === "Yes" ? "bg-green-100 text-green-700" :
// //                           l["Email sent"] === "No"  ? "bg-red-100 text-red-500"    :
// //                           "bg-gray-100 text-gray-400"
// //                         }`}>{l["Email sent"] || "â€”"}</span>
// //                       </TableCell>

// //                       {/* Verified */}
// //                       <TableCell>
// //                         <span className={`px-2 py-0.5 rounded text-xs font-medium ${
// //                           String(l["verify email"]).toLowerCase() === "ok"
// //                             ? "bg-green-100 text-green-700"
// //                             : "bg-gray-100 text-gray-400"
// //                         }`}>{l["verify email"] || "â€”"}</span>
// //                       </TableCell>

// //                       <TableCell>{l.leadType || "â€”"}</TableCell>
// //                       <TableCell>{l.leadSource || "â€”"}</TableCell>

// //                       {/* Status */}
// //                       <TableCell>
// //                         <span className={`px-2 py-1 text-xs rounded-md font-medium ${
// //                           statusColors[l.leadStatus] || statusColors[l.status] || "bg-gray-100 text-gray-700"
// //                         }`}>{l.leadStatus || l.status || "â€”"}</span>
// //                       </TableCell>

// //                       <TableCell>{l.RCMCPanel || "â€”"}</TableCell>
// //                       <TableCell>{l.pinCode || "â€”"}</TableCell>

// //                       {/* Notes */}
// //                       <TableCell>
// //                         <span className="truncate max-w-[120px] block text-gray-500 text-xs" title={l.notes}>
// //                           {l.notes || "â€”"}
// //                         </span>
// //                       </TableCell>

// //                       {/* â”€â”€ Action Menu â”€â”€ */}
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

// //         {/* â”€â”€ Footer / Pagination â”€â”€ */}
// //         <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-200 p-4 bg-gray-50 gap-2">
// //           <div className="flex items-center gap-3">
// //             <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
// //             <span>Page {page} of {totalPages || 1} â€¢ {total} items</span>
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
  Filter, RefreshCcw, Pencil, Trash2, Eye, MoreVertical, Mail, Download, Copy,
} from "lucide-react";
import MailFormModal from "../components/MailFormModal";
import MailFilters from "../components/MailFilters";
import useMailStore from "../store/mailStore";
import { successToast, errorToast } from "@/utils/customToast";
import { bulkDeleteMails, bulkUpdateMailStatus } from "../api/mailApi";

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
  Active: "bg-green-100 text-green-700",
  Stop: "bg-red-200 text-red-800",
  "Enquiry - Call": "bg-amber-100 text-amber-800",
  "Enquiry - Mail": "bg-blue-100 text-blue-700",
  "Enquiry - WhatsApp": "bg-emerald-100 text-emerald-700",
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

// âœ… Updated excelDateToString â€“ format: 9-Feb-26
function excelDateToString(serial) {
  if (!serial || isNaN(serial)) return serial || "â€”";
  const date = new Date((serial - 25569) * 86400 * 1000);
  const day = String(date.getDate()).padStart(2, '0');   // leading zero
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  return `${day}-${month}-${year}`;
}

function formatSeenStatus(emailSeen, lastOpenedAt) {
  const normalizedSeen = String(emailSeen || "").trim().toLowerCase();

  if (normalizedSeen === "yes") {
    return {
      label: "Yes",
      className: "bg-emerald-100 text-emerald-700",
      title: "Email marked as seen",
    };
  }

  if (normalizedSeen === "no") {
    return {
      label: "No",
      className: "bg-gray-100 text-gray-600",
      title: "Email marked as not seen",
    };
  }

  if (!lastOpenedAt) {
    return {
      label: "—",
      className: "bg-gray-100 text-gray-500",
      title: "Email seen status is not available",
    };
  }

  const openedAt = new Date(lastOpenedAt);
  if (Number.isNaN(openedAt.getTime())) {
    return {
      label: "Yes",
      className: "bg-emerald-100 text-emerald-700",
      title: "Mail record viewed",
    };
  }

  return {
    label: "Yes",
    className: "bg-emerald-100 text-emerald-700",
    title: `Viewed on ${openedAt.toLocaleString()}`,
  };
}

export default function MailTable() {
  // â”€â”€ Store actions & state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const {
    leads, total, page, limit, loading, search,
    loadLeads, setPage, setLimit, setSearch,
    deleteLead, exportCSV, clearSelection, clearFilters,
    toggleSelect, selectedIds,
  } = useMailStore();

  // â”€â”€ Local UI state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [showFilters, setShowFilters] = useState(false);
  const [openFormModal, setOpenFormModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const dropdownRef = useRef(null);

  // Sorting (clientâ€‘side)
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

  // â”€â”€ Data & filters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    loadLeads();
  }, []);

  // Helper to reload leads after actions
  const refresh = useCallback(() => {
    loadLeads();
  }, [loadLeads]);

  // â”€â”€ Sorting (clientâ€‘side) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Selection helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Bulk actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    // Call a mailâ€‘specific bulk endpoint (we'll create it next)
    await bulkUpdateMailStatus(selectedIds, newStatus);
    successToast(`${selectedIds.length} mail(s) updated to ${newStatus}`);
    clearSelection();
    refresh(); // reload table
  } catch (err) {
    console.error(err);
    errorToast("Bulk update failed");
  }
};

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return errorToast("No mails selected");
    const confirm = await Swal.fire({
      title: "Delete selected mails?",
      text: `${selectedIds.length} mails will be removed.`,
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;
    try {
      await bulkDeleteMails(selectedIds);
      successToast("Selected mails deleted");
      clearSelection();
      refresh();
    } catch (err) {
      errorToast("Bulk delete failed");
    }
  };

  // â”€â”€ Single delete â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This mail will be marked as deleted.",
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;
    try {
      await deleteLead(id);
      successToast("Mail deleted successfully!");
    } catch (err) {
      errorToast("Failed to delete mail!");
    }
  };

  // â”€â”€ Export CSV (using store export) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleExportCSV = () => {
    if (!leads || leads.length === 0) {
      errorToast("No records to export");
      return;
    }
    exportCSV();
    successToast("CSV exported");
  };

  // â”€â”€ Clear all filters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleClearFilters = () => {
    clearFilters();
    successToast("Filters cleared");
  };

  // â”€â”€ Close dropdowns on outside click â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
      if (e.target.closest && e.target.closest(".action-menu")) return;
      setOpenActionMenu(null);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const totalPages = Math.ceil(total / limit);

  const copyToClipboard = async (value, label) => {
    const text = String(value || "").trim();
    if (!text || text === "—") {
      errorToast(`No ${label.toLowerCase()} available to copy`);
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      successToast(`${label} copied`);
    } catch (error) {
      errorToast(`Unable to copy ${label.toLowerCase()}`);
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center flex-wrap gap-2" ref={dropdownRef}>
        <div className="flex items-center gap-3 flex-wrap">
          <Input
            placeholder="Search mails..."
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

        <div className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
          Mail table is synced automatically from Leads
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
          Error loading mails: {useMailStore.getState().error}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && <MailFilters />}

      {/* Modals */}
      <MailFormModal
        open={openFormModal}
        setOpen={setOpenFormModal}
        editMail={editLead}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onSaved={refresh}
      />

      {/* Table */}
      <div className="bg-white border rounded-lg shadow-md">
        <div className="relative overflow-auto max-h-[70vh]">
          <Table className="min-w-full">
            <TableHeader className="sticky top-0 bg-gray-100 z-40">
              <TableRow>
                <TableHead><input type="checkbox" checked={localSelectAll} onChange={(e) => handleSelectAll(e.target.checked)} /></TableHead>
                <TableHead>Sr. No.</TableHead>
                <TableHead>Name of Client</TableHead>
                <TableHead>Email ID</TableHead>
                <TableHead>LEAD SOURCE</TableHead>
                <TableHead>RCMC PANEL</TableHead>
                <TableHead>RCMC TYPE</TableHead>
                <TableHead>EMAIL VERIFIED</TableHead>
                <TableHead>EMAIL SENT</TableHead>
                <TableHead>Email Seen</TableHead>
                <TableHead>Email Status</TableHead>
                <TableHead>Enquiry Status</TableHead>
                <TableHead>Turnup</TableHead>
                <TableHead>CDCR NO</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={15} className="text-center py-8 text-gray-400">Loading...</TableCell></TableRow>
              ) : sortedLeads.length === 0 ? (
                <TableRow><TableCell colSpan={15} className="text-center py-8 text-gray-500">No records found</TableCell></TableRow>
              ) : (
                sortedLeads.map((lead, idx) => {
                  const srNo = (page - 1) * limit + idx + 1;
                  const isSelected = selectedIds.includes(lead._id);
                  const clientEmail = lead.email || "—";
                  const senderEmail = lead.senderEmail || "—";
                  const emailVerifiedValue =
                    lead.emailVerifiedStatus ||
                    lead["email verified"] ||
                    lead["verify email"] ||
                    (lead.emailVerified === true ? "Yes" : lead.emailVerified === false ? "No" : "") ||
                    "—";
                  const seenState = formatSeenStatus(lead.emailSeen, lead.lastOpenedAt);
                  const emailStatusValue = lead.emailStatus || lead.Status || lead.status || "—";
                  const enquiryStatusValue = lead.enquiryStatus || "—";
                  const turnupValue = lead.turnup || "—";
                  const cdcrNoValue = lead.cdcrNo || "—";
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="min-w-0 flex-1"
                            dangerouslySetInnerHTML={{ __html: highlight(lead.name || "", search) }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(lead.name, "Client Name");
                            }}
                            className="rounded p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                            title="Copy client name"
                          >
                            <Copy size={15} />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="min-w-0 flex-1 break-all">{clientEmail}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(lead.email, "Email ID");
                            }}
                            className="rounded p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                            title="Copy email ID"
                          >
                            <Copy size={15} />
                          </button>
                          {lead.email && <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()} className="ml-auto p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition"><Mail size={16} /></a>}
                        </div>
                      </TableCell>
                      <TableCell>{lead.leadSource || "—"}</TableCell>
                      <TableCell>{lead.RCMCPanel || "—"}</TableCell>
                      <TableCell>{lead.RCMCType || "—"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          emailVerifiedValue === "Yes" || String(emailVerifiedValue).toLowerCase() === "ok"
                            ? "bg-green-100 text-green-700"
                            : emailVerifiedValue === "No"
                              ? "bg-red-100 text-red-500"
                              : "bg-gray-100 text-gray-500"
                        }`}>
                          {emailVerifiedValue}
                        </span>
                      </TableCell>
                      <TableCell>{senderEmail}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${seenState.className}`} title={seenState.title}>
                          {seenState.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-md font-medium ${
                          statusColors[emailStatusValue] || "bg-gray-100 text-gray-700"
                        }`}>
                          {emailStatusValue}
                        </span>
                      </TableCell>
                      <TableCell>{enquiryStatusValue}</TableCell>
                      <TableCell>{turnupValue}</TableCell>
                      <TableCell>{cdcrNoValue}</TableCell>
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
            <span>Page {page} of {totalPages || 1} â€¢ {total} items</span>
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


