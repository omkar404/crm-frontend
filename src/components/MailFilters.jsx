// import React, { useRef, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import {
//   Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
// } from "@/components/ui/select";
// import useMailStore from "../store/mailStore";

// export default function MailFilters({ onClose }) {
//   const ref = useRef(null);

//   const {
//     sendEmailId, setSendEmailId,
//     templateType, setTemplateType,
//     templateSubject, setTemplateSubject,
//     emailDate, setEmailDate,
//     ipAddress, setIpAddress,
//     webTabAndType, setWebTabAndType,
//     emailVerified, setEmailVerified,
//     emailSentType, setEmailSentType,
//     statusFilter, setStatusFilter,
//     clearFilters,
//     filterOptions,
//     loadFilterOptions,
//   } = useMailStore();

//   useEffect(() => {
//     loadFilterOptions();
//   }, []);

//   // Prevent closing when clicking inside any Radix Select portal
//   useEffect(() => {
//     const handler = (e) => {
//       if (ref.current && ref.current.contains(e.target)) return;
//       if (e.target.closest('[data-radix-select-content]')) return;
//       if (e.target.closest('[data-radix-select-trigger]')) return;
//       onClose();
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, [onClose]);

//   const FilterDropdown = ({ label, value, onChange, options, placeholder = "All" }) => (
//     <div>
//       <Label className="text-xs text-gray-500 mb-1 block">{label}</Label>
//       <Select
//         value={value || "__all__"}
//         onValueChange={(val) => onChange(val === "__all__" ? "" : val)}
//       >
//         <SelectTrigger className="w-full">
//           <SelectValue placeholder={placeholder} />
//         </SelectTrigger>
//         <SelectContent>
//           <SelectItem value="__all__">{placeholder}</SelectItem>
//           {options.map((opt) => (
//             <SelectItem key={opt} value={opt}>{opt}</SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//     </div>
//   );

//   return (
//     <div
//       ref={ref}
//       className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4 z-50"
//     >
//       <FilterDropdown label="Send Email ID" value={sendEmailId} onChange={setSendEmailId} options={filterOptions.sendEmailId || []} />
//       <FilterDropdown label="Template Type" value={templateType} onChange={setTemplateType} options={filterOptions.templateType || []} />
//       <FilterDropdown label="Template Subject" value={templateSubject} onChange={setTemplateSubject} options={filterOptions.templateSubject || []} />
//       <FilterDropdown label="Email Date" value={emailDate} onChange={setEmailDate} options={filterOptions.emailDate || []} />
//       <FilterDropdown label="IP Address" value={ipAddress} onChange={setIpAddress} options={filterOptions.ipAddress || []} />
//       <FilterDropdown label="Web Tab & Type" value={webTabAndType} onChange={setWebTabAndType} options={filterOptions.webTabAndType || []} />
//       <FilterDropdown label="Email Verified" value={emailVerified} onChange={setEmailVerified} options={filterOptions.emailVerified || []} />
//       <FilterDropdown label="Email Sent Type" value={emailSentType} onChange={setEmailSentType} options={filterOptions.emailSentType || []} />
//       <FilterDropdown label="Status" value={statusFilter} onChange={setStatusFilter} options={filterOptions.status || []} />

//       <div className="col-span-1 md:col-span-3 flex justify-end gap-2 mt-2">
//         <Button variant="outline" onClick={() => { clearFilters(); onClose(); }}>Clear All</Button>
//         <Button className="bg-blue-600 hover:bg-blue-700" onClick={onClose}>Apply</Button>
//       </div>
//     </div>
//   );
// }

// import React from "react";
// import useMailStore from "../store/mailStore";

// export default function MailFilters({ onClose }) {
//   const {
//     sendEmailId, setSendEmailId, filterOptions,
//     templateType, setTemplateType,
//     templateSubject, setTemplateSubject,
//     emailDate, setEmailDate,
//     ipAddress, setIpAddress,
//     webTabAndType, setWebTabAndType,
//     emailVerified, setEmailVerified,
//     emailSentType, setEmailSentType,
//     statusFilter, setStatusFilter,
//     loadLeads,
//     setPage,
//   } = useMailStore();

//   // ✅ APPLY FILTER
//   const handleApply = () => {
//     setPage(1);
//     loadLeads();   // 🔥 important
//     onClose();
//   };

//   // ✅ CLEAR FILTER
//   const handleClear = () => {
//     setSendEmailId("");
//     setTemplateType("");
//     setTemplateSubject("");
//     setEmailDate("");
//     setIpAddress("");
//     setWebTabAndType("");
//     setEmailVerified("");
//     setEmailSentType("");
//     setStatusFilter("");

//     setPage(1);
//     loadLeads();   // 🔥 reset data
//   };

//   return (
//     <div className="bg-gray-100 p-4 rounded-lg shadow-md space-y-4">

//       {/* FILTER GRID */}
//       <div className="grid grid-cols-3 gap-3">

//         <select value={sendEmailId} onChange={(e) => setSendEmailId(e.target.value)}>
//           <option value="">Send Email ID</option>
//           {filterOptions.sendEmailId.map((v, i) => <option key={i}>{v}</option>)}
//         </select>

//         <select value={templateType} onChange={(e) => setTemplateType(e.target.value)}>
//           <option value="">Template Type</option>
//           {filterOptions.templateType.map((v, i) => <option key={i}>{v}</option>)}
//         </select>

//         <select value={templateSubject} onChange={(e) => setTemplateSubject(e.target.value)}>
//           <option value="">Template Subject</option>
//           {filterOptions.templateSubject.map((v, i) => <option key={i}>{v}</option>)}
//         </select>

//         <select value={emailDate} onChange={(e) => setEmailDate(e.target.value)}>
//           <option value="">Email Date</option>
//           {filterOptions.emailDate.map((v, i) => <option key={i}>{v}</option>)}
//         </select>

//         <select value={ipAddress} onChange={(e) => setIpAddress(e.target.value)}>
//           <option value="">IP Address</option>
//           {filterOptions.ipAddress.map((v, i) => <option key={i}>{v}</option>)}
//         </select>

//         <select value={webTabAndType} onChange={(e) => setWebTabAndType(e.target.value)}>
//           <option value="">Web Tab & Type</option>
//           {filterOptions.webTabAndType.map((v, i) => <option key={i}>{v}</option>)}
//         </select>

//         <select value={emailVerified} onChange={(e) => setEmailVerified(e.target.value)}>
//           <option value="">Email Verified</option>
//           {filterOptions.emailVerified.map((v, i) => <option key={i}>{v}</option>)}
//         </select>

//         <select value={emailSentType} onChange={(e) => setEmailSentType(e.target.value)}>
//           <option value="">Email Sent Type</option>
//           {filterOptions.emailSentType.map((v, i) => <option key={i}>{v}</option>)}
//         </select>

//         <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
//           <option value="">Status</option>
//           {filterOptions.status.map((v, i) => <option key={i}>{v}</option>)}
//         </select>

//       </div>

//       {/* ✅ BUTTONS */}
//       <div className="flex justify-end gap-3 pt-2">
//         <button
//           onClick={handleClear}
//           className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
//         >
//           Clear All
//         </button>

//         <button
//           onClick={handleApply}
//           className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
//         >
//           Apply Filters
//         </button>
//       </div>
//     </div>
//   );
// }
import React from "react";
import useMailStore from "../store/mailStore";

// Convert "DD-MM-YYYY" → "DD-MMM-YY" (e.g., 09-02-2026 → 09-Feb-26)
const formatDateToDDMMMYY = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return dateStr;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [day, month, year] = parts;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthAbbr = monthNames[parseInt(month) - 1];
  const shortYear = year.slice(-2);
  return `${day.padStart(2, '0')}-${monthAbbr}-${shortYear}`;
};

export default function MailFilters({ onClose }) {
  const {
    sendEmailId, setSendEmailId, filterOptions,
    templateType, setTemplateType,
    templateSubject, setTemplateSubject,
    emailDate, setEmailDate,
    ipAddress, setIpAddress,
    webTabAndType, setWebTabAndType,
    emailVerified, setEmailVerified,
    emailSentType, setEmailSentType,
    statusFilter, setStatusFilter,
    loadLeads,
    setPage,
  } = useMailStore();

  const handleChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
    loadLeads();
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
      <div className="grid grid-cols-3 gap-3">
        {/* Send Email ID */}
        <select value={sendEmailId} onChange={handleChange(setSendEmailId)} className="border rounded px-3 py-2 bg-white">
          <option value="">Send Email ID</option>
          {filterOptions.sendEmailId?.map((v, i) => <option key={i} value={v}>{v}</option>)}
        </select>

        {/* Template Type */}
        <select value={templateType} onChange={handleChange(setTemplateType)} className="border rounded px-3 py-2 bg-white">
          <option value="">Template Type</option>
          {filterOptions.templateType?.map((v, i) => <option key={i} value={v}>{v}</option>)}
        </select>

        {/* Template Subject */}
        <select value={templateSubject} onChange={handleChange(setTemplateSubject)} className="border rounded px-3 py-2 bg-white">
          <option value="">Template Subject</option>
          {filterOptions.templateSubject?.map((v, i) => <option key={i} value={v}>{v}</option>)}
        </select>

        {/* Email Date – display formatted, value remains original */}
        <select value={emailDate} onChange={handleChange(setEmailDate)} className="border rounded px-3 py-2 bg-white">
          <option value="">Email Date</option>
          {filterOptions.emailDate?.map((v, i) => (
            <option key={i} value={v}>
              {formatDateToDDMMMYY(v)}
            </option>
          ))}
        </select>

        {/* IP Address */}
        <select value={ipAddress} onChange={handleChange(setIpAddress)} className="border rounded px-3 py-2 bg-white">
          <option value="">IP Address</option>
          {filterOptions.ipAddress?.map((v, i) => <option key={i} value={v}>{v}</option>)}
        </select>

        {/* Web Tab & Type */}
        <select value={webTabAndType} onChange={handleChange(setWebTabAndType)} className="border rounded px-3 py-2 bg-white">
          <option value="">Web Tab & Type</option>
          {filterOptions.webTabAndType?.map((v, i) => <option key={i} value={v}>{v}</option>)}
        </select>

        {/* Email Verified */}
        <select value={emailVerified} onChange={handleChange(setEmailVerified)} className="border rounded px-3 py-2 bg-white">
          <option value="">Email Verified</option>
          {filterOptions.emailVerified?.map((v, i) => <option key={i} value={v}>{v}</option>)}
        </select>

        {/* Email Sent Type */}
        <select value={emailSentType} onChange={handleChange(setEmailSentType)} className="border rounded px-3 py-2 bg-white">
          <option value="">Email Sent Type</option>
          {filterOptions.emailSentType?.map((v, i) => <option key={i} value={v}>{v}</option>)}
        </select>

        {/* Status */}
        <select value={statusFilter} onChange={handleChange(setStatusFilter)} className="border rounded px-3 py-2 bg-white">
          <option value="">Status</option>
          {filterOptions.status?.map((v, i) => <option key={i} value={v}>{v}</option>)}
        </select>
      </div>
    </div>
  );
}