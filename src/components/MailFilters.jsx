import React, { useMemo, useState } from "react";
import useMailStore from "../store/mailStore";

function MultiSelectEmailFilter({ label, options, selectedValues, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return options;
    }

    return options.filter((option) => option.toLowerCase().includes(query));
  }, [options, search]);

  const allVisibleSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((option) => selectedValues.includes(option));

  const toggleValue = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((item) => item !== value));
      return;
    }

    onChange([...selectedValues, value]);
  };

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      onChange(selectedValues.filter((item) => !filteredOptions.includes(item)));
      return;
    }

    onChange([...new Set([...selectedValues, ...filteredOptions])]);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded border bg-white px-3 py-2 text-left"
      >
        <span className={selectedValues.length ? "text-gray-900" : "text-gray-500"}>
          {selectedValues.length ? `${label} (${selectedValues.length})` : label}
        </span>
        <span className="text-xs text-gray-500">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded border bg-white p-3 shadow-lg">
          <div className="mb-2 border-b pb-2 text-sm font-medium text-gray-700">Text Filters</div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="mb-3 w-full rounded border px-3 py-2 text-sm"
          />
          <label className="mb-2 flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleAllVisible}
            />
            <span>(Select All)</span>
          </label>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {filteredOptions.map((option) => (
              <label key={option} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={() => toggleValue(option)}
                />
                <span>{option}</span>
              </label>
            ))}
            {filteredOptions.length === 0 && (
              <div className="text-sm text-gray-500">No email IDs found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MailFilters() {
  const {
    sendEmailId,
    setSendEmailId,
    filterOptions,
    templateType,
    setTemplateType,
    templateSubject,
    setTemplateSubject,
    emailDate,
    setEmailDate,
    ipAddress,
    setIpAddress,
    webTabAndType,
    setWebTabAndType,
    emailVerified,
    setEmailVerified,
    emailSentType,
    setEmailSentType,
    statusFilter,
    setStatusFilter,
    clearFilters,
  } = useMailStore();

  const selectClassName = "border rounded px-3 py-2 bg-white";

  return (
    <div className="rounded-lg bg-gray-100 p-4 shadow-md">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <MultiSelectEmailFilter
          label="Send Email ID"
          options={filterOptions.sendEmailId || []}
          selectedValues={sendEmailId}
          onChange={setSendEmailId}
        />

        <select
          value={templateType}
          onChange={(e) => setTemplateType(e.target.value)}
          className={selectClassName}
        >
          <option value="">Template Type</option>
          {filterOptions.templateType?.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select
          value={templateSubject}
          onChange={(e) => setTemplateSubject(e.target.value)}
          className={selectClassName}
        >
          <option value="">Template Subject</option>
          {filterOptions.templateSubject?.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={emailDate}
          onChange={(e) => setEmailDate(e.target.value)}
          className={selectClassName}
          placeholder="Email Date"
        />

        <select
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
          className={selectClassName}
        >
          <option value="">IP Address</option>
          {filterOptions.ipAddress?.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select
          value={webTabAndType}
          onChange={(e) => setWebTabAndType(e.target.value)}
          className={selectClassName}
        >
          <option value="">Web</option>
          {filterOptions.webTabAndType?.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select
          value={emailVerified}
          onChange={(e) => setEmailVerified(e.target.value)}
          className={selectClassName}
        >
          <option value="">Email Verified</option>
          {filterOptions.emailVerified?.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select
          value={emailSentType}
          onChange={(e) => setEmailSentType(e.target.value)}
          className={selectClassName}
        >
          <option value="">Email Sent</option>
          {filterOptions.emailSentType?.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={selectClassName}
        >
          <option value="">Status</option>
          {filterOptions.status?.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={clearFilters}
          className="rounded border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
