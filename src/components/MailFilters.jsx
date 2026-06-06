import React from "react";
import useMailStore from "../store/mailStore";
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

const EMAIL_SENT_DEPENDENCIES = {
  "jaggdish@eximinq-connect.in": { wifi: "raksha", browser: "chrome" },
  "jaggdish@eximinq-audit.in": { wifi: "shruti", browser: "edge" },
  "jaggdish@eximinq-group.in": { wifi: "menka", browser: "mozila" },
  "jaggdish@eximinq-info.in": { wifi: "raksha", browser: "chrome" },
  "jaggdish.a@eximinq-advisory.in": { wifi: "shruti", browser: "edge" },
  "jaggdish.acharya@eximinq-global.in": { wifi: "menka", browser: "mozila" },
  "j.acharya@eximinq-desk.in": { wifi: "raksha", browser: "chrome" },
  "jaggdish.a@eximinq-exim.in": { wifi: "shruti", browser: "edge" },
  "jaggdish.acharya@eximinq-services.in": { wifi: "menka", browser: "mozila" },
};

const ENQUIRY_STATUS_OPTIONS = ["Pending", "Reverted", "Close", "No Revert"];
const TURNUP_OPTIONS = ["Yes", "No"];

export default function MailFilters() {
  const {
    leadSource,
    setLeadSource,
    RCMCPanel,
    setRCMCPanel,
    RCMCType,
    setRCMCType,
    filterOptions,
    emailVerified,
    setEmailVerified,
    emailSent,
    setEmailSent,
    emailSeen,
    setEmailSeen,
    emailStatus,
    setEmailStatus,
    enquiryStatus,
    setEnquiryStatus,
    turnup,
    setTurnup,
    cdcrNo,
    setCdcrNo,
    clearFilters,
  } = useMailStore();

  const selectClassName = "border rounded px-3 py-2 bg-white";
  const dependentFieldClassName =
    "border rounded px-3 py-2 bg-slate-100 text-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100";
  const selectedEmailDetails = EMAIL_SENT_DEPENDENCIES[emailSent] || { wifi: "", browser: "" };
  const rcmcTypeMap = filterOptions.RCMCTypeMap || RCMC_TYPE_MAP;
  const availableRCMCTypeList = RCMCPanel
    ? rcmcTypeMap[RCMCPanel] || []
    : filterOptions.RCMCType || [];

  return (
    <div className="rounded-lg bg-gray-100 p-4 shadow-md">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <select
          value={leadSource}
          onChange={(e) => setLeadSource(e.target.value)}
          className={selectClassName}
        >
          <option value="">Lead Source</option>
          {filterOptions.leadSource?.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select value={RCMCPanel} onChange={(e) => setRCMCPanel(e.target.value)} className={selectClassName}>
          <option value="">RCMC Panel</option>
          {filterOptions.RCMCPanel?.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select value={RCMCType} onChange={(e) => setRCMCType(e.target.value)} className={selectClassName}>
          <option value="">RCMC Type</option>
          {availableRCMCTypeList.map((value) => (
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
          value={emailSent}
          onChange={(e) => setEmailSent(e.target.value)}
          className={selectClassName}
        >
          <option value="">Email Sent</option>
          {EMAIL_SENT_FILTER_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={selectedEmailDetails.wifi}
          placeholder="WiFi"
          disabled
          readOnly
          className={dependentFieldClassName}
        />

        <input
          type="text"
          value={selectedEmailDetails.browser}
          placeholder="Browser"
          disabled
          readOnly
          className={dependentFieldClassName}
        />

        <select
          value={emailSeen}
          onChange={(e) => setEmailSeen(e.target.value)}
          className={selectClassName}
        >
          <option value="">Email Seen</option>
          {filterOptions.emailSeen?.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select
          value={emailStatus}
          onChange={(e) => setEmailStatus(e.target.value)}
          className={selectClassName}
        >
          <option value="">Email Status</option>
          {filterOptions.emailStatus?.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select
          value={enquiryStatus}
          onChange={(e) => setEnquiryStatus(e.target.value)}
          className={selectClassName}
        >
          <option value="">Enquiry Status</option>
          {ENQUIRY_STATUS_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select
          value={turnup}
          onChange={(e) => setTurnup(e.target.value)}
          className={selectClassName}
        >
          <option value="">Turnup</option>
          {TURNUP_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select
          value={cdcrNo}
          onChange={(e) => setCdcrNo(e.target.value)}
          className={selectClassName}
        >
          <option value="">CDCR NO</option>
          {filterOptions.cdcrNo?.map((value) => (
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
