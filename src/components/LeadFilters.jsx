import React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function LeadFilters({ status, setStatus, leadStatusList }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Filter by Lead Status" />
        </SelectTrigger>
        <SelectContent>
          {leadStatusList.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
