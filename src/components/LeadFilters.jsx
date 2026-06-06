import React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function LeadFilters({
  status, setStatus, leadStatusList,
  aeoStatus, setAeoStatus, AEOStatusList,
  rcmcStatus, setRcmcStatus, RCMCPanelList,
  rcmcType, setRcmcType, RCMCTypeList,
  industry, setIndustry, industryList,
  leadType, setLeadType, leadTypeList,
  leadSource, setLeadSource, leadSourceList,
}) {

  // Clean any dirty imported value (fixes all filtering issues)
  const normalize = (v) =>
    typeof v === "string"
      ? v.replace(/\r/g, "")
          .replace(/\n/g, "")
          .replace(/\s+/g, " ")
          .trim()
      : "";

  // Clean + Sort + Deduplicate dropdown list
  const prepareList = (list) => {
    const cleaned = list
      .map(normalize)
      .filter((v) => v !== "")   // remove empties
      .filter((v, i, arr) => arr.indexOf(v) === i); // unique
    return cleaned.sort((a, b) => a.localeCompare(b));
  };

  // Prepare all lists once
  const cleanLeadStatusList = prepareList(leadStatusList);
  const cleanAEOList = prepareList(AEOStatusList);
  const cleanRCMCList = prepareList(RCMCPanelList);
  const cleanRCMCTypeList = prepareList(RCMCTypeList);
  const cleanIndustryList = prepareList(industryList);
  const cleanLeadTypeList = prepareList(leadTypeList);
  const cleanLeadSourceList = prepareList(leadSourceList);

  // Reusable Dropdown Component
  const FilterDropdown = ({ label, value, onChange, list }) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {list.map((item) => (
          <SelectItem key={item} value={item}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm grid grid-cols-3 gap-4">

      <FilterDropdown
        label="Lead Status"
        value={status}
        onChange={setStatus}
        list={cleanLeadStatusList}
      />

      <FilterDropdown
        label="AEO Status"
        value={aeoStatus}
        onChange={setAeoStatus}
        list={cleanAEOList}
      />

      <FilterDropdown label="RCMC Panel" value={rcmcStatus} onChange={setRcmcStatus} list={cleanRCMCList} />

      <FilterDropdown
        label="RCMC Type"
        value={rcmcType}
        onChange={setRcmcType}
        list={cleanRCMCTypeList}
      />

      <FilterDropdown
        label="Industry"
        value={industry}
        onChange={setIndustry}
        list={cleanIndustryList}
      />

      <FilterDropdown
        label="Lead Type"
        value={leadType}
        onChange={setLeadType}
        list={cleanLeadTypeList}
      />

      <FilterDropdown
        label="Lead Source"
        value={leadSource}
        onChange={setLeadSource}
        list={cleanLeadSourceList}
      />
    </div>
  );
}
