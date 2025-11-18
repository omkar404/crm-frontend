// import React from "react";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";

// export default function LeadFilters({ status, setStatus, leadStatusList }) {
//   return (
//     <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
//       <Select value={status} onValueChange={setStatus}>
//         <SelectTrigger className="w-64">
//           <SelectValue placeholder="Filter by Lead Status" />
//         </SelectTrigger>
//         <SelectContent>
//           {leadStatusList.map((s) => (
//             <SelectItem key={s} value={s}>
//               {s}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//     </div>
//   );
// }

import React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function LeadFilters({
  status,
  setStatus,
  leadStatusList,

  aeoStatus,
  setAeoStatus,
  AEOStatusList,

  rcmcStatus,
  setRcmcStatus,
  RCMCPanelList,

  industry,
  setIndustry,
  industryList,

  leadType,
  setLeadType,
  leadTypeList,

  leadSource,
  setLeadSource,
  leadSourceList,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm grid grid-cols-3 gap-4">

      {/* Lead Status */}
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Lead Status" />
        </SelectTrigger>
        <SelectContent>
          {leadStatusList.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* AEO Status */}
      <Select value={aeoStatus} onValueChange={setAeoStatus}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="AEO Status" />
        </SelectTrigger>
        <SelectContent>
          {AEOStatusList.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* RCMC Status */}
      <Select value={rcmcStatus} onValueChange={setRcmcStatus}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="RCMC Status" />
        </SelectTrigger>
        <SelectContent>
          {RCMCPanelList.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Industry */}
      <Select value={industry} onValueChange={setIndustry}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Industry" />
        </SelectTrigger>
        <SelectContent>
          {industryList.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Lead Type */}
      <Select value={leadType} onValueChange={setLeadType}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Lead Type" />
        </SelectTrigger>
        <SelectContent>
          {leadTypeList.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Lead Source */}
      <Select value={leadSource} onValueChange={setLeadSource}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Lead Source" />
        </SelectTrigger>
        <SelectContent>
          {leadSourceList.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

    </div>
  );
}

