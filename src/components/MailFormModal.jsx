import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "../api/axios";
import { errorToast, successToast } from "@/utils/customToast";
import useMailStore from "../store/mailStore";
import { CITY_OPTIONS, CITY_STATE_MAP } from "../constants/locationOptions";

const MAIL_STATUS_OPTIONS = [
  "draft",
  "queued",
  "processing",
  "sent",
  "failed",
  "scheduled",
  "replied",
  "bounced",
  "stopped",
  "archived",
  "not_contacted",
  "contacted",
  "enquiry",
  "reached",
];

const LEAD_TYPE_OPTIONS = [
  "CHA",
  "Logistics",
  "Freight Forwarder",
  "Manufacturer",
  "Importer",
  "Exporter",
];

const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Premium"];
const TURNOVER_OPTIONS = [
  "NA",
  "Less than 10 Cr",
  "10 Cr - 50 Cr",
  "50 Cr - 100 Cr",
  "100 Cr - 500 Cr",
  "Above 500 Cr",
];
const STARTUP_CATEGORY_OPTIONS = ["Yes", "No"];
const AEO_STATUS_OPTIONS = ["NA", "AEO - T1", "AEO - T2", "AEO - T3", "AEO - LEO"];
const LEAD_SOURCE_OPTIONS = [
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
const LEAD_STATUS_OPTIONS = [
  "Not Contacted",
  "Email Sent",
  "Visit Scheduled",
  "Email id incorrect",
  "Contact on phone",
  "In Contact",
  "Interested",
  "In Process",
  "Login Created",
  "Login Rejected",
  "Not Interested",
  "Not Contactable",
  "Do Not Touch",
  "Spam / Fake Lead",
];
const TEMPLATE_OPTIONS = ["A", "B", "C", "COO-A", "COO-B", "COO-C", "COO-D", "D", "E", "F"];
const YES_NO_OPTIONS = ["Yes", "No"];
const VERIFY_OPTIONS = ["ok", "invalid", "pending"];
const IP_ADDRESS_OPTIONS = ["Shruti", "Menka", "Raksha", "Ritesh"];
const WEB_SOURCE_OPTIONS = ["Edge", "Chrome", "Mozilla"];
const STATE_OPTIONS = [...new Set(Object.values(CITY_STATE_MAP))].sort((a, b) => a.localeCompare(b));
const INDUSTRY_MAP = {
  "Agriculture & Farming": ["Farming Crops", "Livestock & Dairy", "Forestry & Logging", "Fishing & Aquaculture"],
  "Mining & Quarrying": ["Coal / Lignite", "Crude Petroleum / Natural Gas", "Iron Ore", "Metallic Minerals", "Stone Quarrying"],
  Manufacturing: ["Textiles & Apparel", "Automobiles", "Chemicals", "Pharmaceuticals / Biotech", "Food Processing", "Basic Metals", "Fabricated Metal Products", "Electronics", "Machinery", "Petroleum Products", "Non-Metallic Minerals"],
  Construction: ["Real Estate", "Infrastructure Projects"],
  Utilities: ["Electricity / Gas Supply", "Water / Waste Management"],
  "IT & Software Services": ["Software Development", "ITeS / BPO", "KPO", "IT Consulting"],
  "Financial Services": ["Banking", "Insurance", "Stock Markets / Asset Mgmt"],
  "Trade (Wholesale & Retail)": ["Wholesale Distribution", "Retail / E-Commerce"],
  "Transport & Logistics": ["Road Transport", "Railways", "Aviation", "Shipping", "Warehousing & Logistics"],
  "Tourism & Hospitality": ["Hotels / Restaurants", "Travel Services"],
  Telecommunications: ["Mobile / Internet Services"],
  Healthcare: ["Hospitals / Clinics", "Diagnostics"],
  Education: ["Schools / Colleges", "Ed-Tech"],
  "Media & Entertainment": ["Film / TV", "Publishing"],
  "Professional Services": ["Legal / Accounting", "Engineering / Architecture", "Consulting / Advertising"],
  "Public Administration": ["Government Services", "Defence"],
};
const RCMC_MAP = {
  FIEO: ["FIEO - FEDERATION"],
  EEPC: ["EEPC - ENGINEERING"],
  APPARELS: ["AEPC - APPAREL", "TEXPROCIL - TEXTILE", "SRTEPC - SYNTHETIC", "HEPC - HANDICRAFTS", "WWEPC - WOOLEN", "ISEPC - SILK", "CEPC - CARPET"],
  "CHEMICALS/PLASTIC": ["CHEMEXCIL - CHEMICALS", "CAPEXIL - ALLIED"],
  Pharmaceuticals: ["PHARMEXCIL - PHARMA"],
  "Gems & Jewellery": ["GJEPC - GEM"],
  Leather: ["CLE - LEATHER"],
  Handicraft: ["EPCH - HANDICRAFT"],
  "Electronics & IT": ["ESC - COMPUTER / SOFTWARE", "MEDEPC - MOBILE / ELECTRONICS"],
  "Sports Goods": ["SGEPC - SPORTS"],
  Services: ["SEPC - Services Export"],
  "Commodity Boards": ["Spices Board India", "Tea Board India", "Coffee Board of India", "Coir Board", "Rubber Board", "Tobacco Board"],
  "Agricultural Products": ["APEDA - Agricultural / Foods"],
  "Marine Products": ["MPEDA - MARINE"],
};

const emptyForm = {
  name: "",
  from: "",
  email: "",
  mobileNo: "",
  landlineNo: "",
  website: "",
  address: "",
  city: "",
  state: "",
  pinCode: "",
  contactPerson: "",
  designation: "",
  leadType: "",
  priorityRating: "",
  leadSource: "",
  leadStatus: "",
  industry: "",
  industryBrief: "",
  employees: "",
  turnover: "",
  startupCategory: "",
  AEOStatus: "",
  RCMCPanel: "",
  RCMCType: "",
  template: "",
  subject: "",
  sourceDate: "",
  ipAddress: "",
  webSource: "",
  emailSent: "",
  verifyEmail: "",
  status: "draft",
  notes: "",
  description: "",
};

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const mapMailToForm = (mail = {}) => ({
  ...emptyForm,
  name: mail.name || mail.contactName || "",
  from: mail.from || mail["Email Id"] || "",
  email: mail.email || mail.contactEmail || mail.to?.[0] || "",
  mobileNo: mail.mobileNo || mail.phone || "",
  landlineNo: mail.landlineNo || "",
  website: mail.website || "",
  address: mail.address || "",
  city: mail.city || "",
  state: mail.state || "",
  pinCode: mail.pinCode || "",
  contactPerson: mail.contactPerson || mail.companyName || "",
  designation: mail.designation || "",
  leadType: mail.leadType || "",
  priorityRating: mail.priorityRating || "",
  leadSource: mail.leadSource || "",
  leadStatus: mail.leadStatus || "",
  industry: mail.industry || "",
  industryBrief: mail.industryBrief || "",
  employees: mail.employees ?? "",
  turnover: mail.turnover || "",
  startupCategory: mail.startupCategory || "",
  AEOStatus: mail.AEOStatus || "",
  RCMCPanel: mail.RCMCPanel || "",
  RCMCType: mail.RCMCType || "",
  template: mail.templateName || mail.Template || "",
  subject: mail.subject || mail.Subject || "",
  sourceDate: toDateInput(mail.sourceDate || mail.Date),
  ipAddress: mail.ipAddress || mail["IP Address"] || "",
  webSource: mail.webSource || mail.Web || "",
  emailSent:
    mail.emailSent === true || mail["Email sent"] === "Yes"
      ? "Yes"
      : mail.emailSent === false || mail["Email sent"] === "No"
      ? "No"
      : "",
  verifyEmail:
    mail.verifyEmail ||
    (mail.emailVerified === true || mail["email verified"] === "Yes"
      ? "ok"
      : mail.emailVerified === false || mail["email verified"] === "No"
      ? "invalid"
      : ""),
  status: mail.status || mail.Status || "draft",
  notes: mail.notes || "",
  description: mail.description || mail.body || "",
});

const buildPayload = (form) => ({
  name: form.name || "",
  from: form.from || "",
  to: form.email ? [form.email] : [],
  email: form.email || "",
  subject: form.subject || "",
  body: form.description || "",
  status: form.status || "draft",
  templateName: form.template || "",
  templateSubject: form.subject || "",
  contactName: form.name || "",
  contactEmail: form.email || "",
  phone: form.mobileNo || form.landlineNo || "",
  city: form.city || "",
  state: form.state || "",
  address: form.address || "",
  website: form.website || "",
  ipAddress: form.ipAddress || "",
  webSource: form.webSource || "",
  notes: form.notes || "",
  pinCode: form.pinCode || "",
  contactPerson: form.contactPerson || "",
  designation: form.designation || "",
  employees: form.employees === "" ? null : Number(form.employees),
  turnover: form.turnover || undefined,
  startupCategory: form.startupCategory || undefined,
  AEOStatus: form.AEOStatus || undefined,
  RCMCPanel: form.RCMCPanel || "",
  RCMCType: form.RCMCType || "",
  industry: form.industry || "",
  industryBrief: form.industryBrief || "",
  leadType: form.leadType || undefined,
  priorityRating: form.priorityRating || undefined,
  leadSource: form.leadSource || undefined,
  leadStatus: form.leadStatus || undefined,
  sourceDate: form.sourceDate || undefined,
  emailVerified:
    form.verifyEmail === "ok" ? true : form.verifyEmail === "invalid" ? false : undefined,
  verifyEmail: form.verifyEmail || "",
  emailSent:
    form.emailSent === "Yes" ? true : form.emailSent === "No" ? false : undefined,
});

function SelectField({ label, value, onChange, options, placeholder = "Select", disabled = false }) {
  return (
    <div>
      <Label>{label}</Label>
      {disabled ? (
        <Input disabled value={value || ""} className="mt-1" />
      ) : (
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

export default function MailFormModal({
  open,
  setOpen,
  editMail,
  onSaved,
  viewMode = false,
  setViewMode = () => {},
}) {
  const [activeTab, setActiveTab] = useState("basic");
  const [form, setForm] = useState(emptyForm);
  const { filterOptions, loadFilterOptions } = useMailStore();

  const ipAddressOptions = useMemo(
    () => (filterOptions?.ipAddress?.length ? filterOptions.ipAddress : IP_ADDRESS_OPTIONS),
    [filterOptions]
  );
  const webSourceOptions = useMemo(
    () => (filterOptions?.webTabAndType?.length ? filterOptions.webTabAndType : WEB_SOURCE_OPTIONS),
    [filterOptions]
  );

  useEffect(() => {
    if (open) {
      setForm(editMail ? mapMailToForm(editMail) : emptyForm);
      setActiveTab("basic");
      loadFilterOptions();
    }
  }, [open, editMail, loadFilterOptions]);

  const industryBriefOptions = useMemo(
    () => INDUSTRY_MAP[form.industry] || [],
    [form.industry]
  );
  const cityOptions = useMemo(
    () => (form.city && !CITY_OPTIONS.includes(form.city) ? [form.city, ...CITY_OPTIONS] : CITY_OPTIONS),
    [form.city]
  );
  const rcmcTypeOptions = useMemo(
    () => (form.RCMCPanel ? RCMC_MAP[form.RCMCPanel] || [] : []),
    [form.RCMCPanel]
  );

  const handleCityChange = (value) => {
    setForm((prev) => ({
      ...prev,
      city: value,
      state: CITY_STATE_MAP[value] || prev.state,
    }));
  };

  const handleSave = async () => {
    try {
      const payload = buildPayload(form);

      if (!payload.subject) {
        return errorToast("Subject is required.");
      }

      if (!payload.to.length) {
        return errorToast("Recipient email is required.");
      }

      if (editMail?._id) {
        await api.put(`/api/mail/${editMail._id}`, payload);
        successToast("Mail updated successfully!");
      } else {
        await api.post("/api/mail", payload);
        successToast("Mail created successfully!");
      }

      setOpen(false);
      onSaved?.();
    } catch (err) {
      console.error(err);
      errorToast(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Something went wrong!"
      );
    }
  };

  const title = viewMode ? "View Mail" : editMail ? "Edit Mail" : "Create Mail";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">{title}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="business">Business Details</TabsTrigger>
            <TabsTrigger value="mail">Mail Metadata</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <div className="grid max-h-[55vh] grid-cols-2 gap-4 overflow-y-auto pt-4">
              <div>
                <Label>Name</Label>
                <Input
                  disabled={viewMode}
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                  placeholder="Enter company or contact name"
                />
              </div>
              <div>
                <Label>Sender Email</Label>
                <Input
                  disabled={viewMode}
                  value={form.from}
                  onChange={(e) => setForm((prev) => ({ ...prev, from: e.target.value }))}
                  className="mt-1"
                  placeholder="Enter sender email ID"
                />
              </div>
              <div>
                <Label>Recipient / Contact Email</Label>
                <Input
                  disabled={viewMode}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="mt-1"
                  placeholder="Enter recipient email"
                />
              </div>
              <div>
                <Label>Mobile No</Label>
                <Input
                  disabled={viewMode}
                  value={form.mobileNo}
                  onChange={(e) => setForm((prev) => ({ ...prev, mobileNo: e.target.value }))}
                  className="mt-1"
                  placeholder="Enter mobile number"
                />
              </div>
              <div>
                <Label>Landline No</Label>
                <Input
                  disabled={viewMode}
                  value={form.landlineNo}
                  onChange={(e) => setForm((prev) => ({ ...prev, landlineNo: e.target.value }))}
                  className="mt-1"
                  placeholder="Enter landline number"
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  disabled={viewMode}
                  value={form.website}
                  onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
                  className="mt-1"
                  placeholder="Enter website URL"
                />
              </div>
              <div className="col-span-2">
                <Label>Address</Label>
                <textarea
                  disabled={viewMode}
                  value={form.address}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                  className="mt-1 w-full rounded-md border p-2"
                  placeholder="Enter complete address"
                />
              </div>
              <SelectField
                label="City"
                value={form.city}
                onChange={handleCityChange}
                options={cityOptions}
                disabled={viewMode}
                placeholder="Select city"
              />
              <SelectField
                label="State"
                value={form.state}
                onChange={(value) => setForm((prev) => ({ ...prev, state: value }))}
                options={STATE_OPTIONS}
                disabled={viewMode}
                placeholder="Auto-selected from city"
              />
              <div>
                <Label>Pin Code</Label>
                <Input
                  disabled={viewMode}
                  value={form.pinCode}
                  onChange={(e) => setForm((prev) => ({ ...prev, pinCode: e.target.value }))}
                  className="mt-1"
                  placeholder="Enter pin code"
                />
              </div>
              <div>
                <Label>Contact Person</Label>
                <Input
                  disabled={viewMode}
                  value={form.contactPerson}
                  onChange={(e) => setForm((prev) => ({ ...prev, contactPerson: e.target.value }))}
                  className="mt-1"
                  placeholder="Enter contact person"
                />
              </div>
              <div>
                <Label>Designation</Label>
                <Input
                  disabled={viewMode}
                  value={form.designation}
                  onChange={(e) => setForm((prev) => ({ ...prev, designation: e.target.value }))}
                  className="mt-1"
                  placeholder="Enter designation"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setActiveTab("business")} className="bg-blue-600 hover:bg-blue-700">
                Next
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="business">
            <div className="grid max-h-[55vh] grid-cols-2 gap-4 overflow-y-auto pt-4">
              <SelectField
                label="Lead Type"
                value={form.leadType}
                onChange={(value) => setForm((prev) => ({ ...prev, leadType: value }))}
                options={LEAD_TYPE_OPTIONS}
                disabled={viewMode}
              />
              <SelectField
                label="Priority Rating"
                value={form.priorityRating}
                onChange={(value) => setForm((prev) => ({ ...prev, priorityRating: value }))}
                options={PRIORITY_OPTIONS}
                disabled={viewMode}
              />
              <SelectField
                label="Lead Source"
                value={form.leadSource}
                onChange={(value) => setForm((prev) => ({ ...prev, leadSource: value }))}
                options={LEAD_SOURCE_OPTIONS}
                disabled={viewMode}
              />
              <SelectField
                label="Lead Status"
                value={form.leadStatus}
                onChange={(value) => setForm((prev) => ({ ...prev, leadStatus: value }))}
                options={LEAD_STATUS_OPTIONS}
                disabled={viewMode}
              />
              <SelectField
                label="Industry"
                value={form.industry}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    industry: value,
                    industryBrief: "",
                  }))
                }
                options={Object.keys(INDUSTRY_MAP)}
                disabled={viewMode}
              />
              <SelectField
                label="Industry Brief"
                value={form.industryBrief}
                onChange={(value) => setForm((prev) => ({ ...prev, industryBrief: value }))}
                options={industryBriefOptions}
                disabled={viewMode}
              />
              <div>
                <Label>Employees</Label>
                <Input
                  disabled={viewMode}
                  type="number"
                  value={form.employees}
                  onChange={(e) => setForm((prev) => ({ ...prev, employees: e.target.value }))}
                  className="mt-1"
                  placeholder="Enter employee count"
                />
              </div>
              <SelectField
                label="Turnover"
                value={form.turnover}
                onChange={(value) => setForm((prev) => ({ ...prev, turnover: value }))}
                options={TURNOVER_OPTIONS}
                disabled={viewMode}
              />
              <SelectField
                label="Startup Category"
                value={form.startupCategory}
                onChange={(value) => setForm((prev) => ({ ...prev, startupCategory: value }))}
                options={STARTUP_CATEGORY_OPTIONS}
                disabled={viewMode}
              />
              <SelectField
                label="AEO Status"
                value={form.AEOStatus}
                onChange={(value) => setForm((prev) => ({ ...prev, AEOStatus: value }))}
                options={AEO_STATUS_OPTIONS}
                disabled={viewMode}
              />
              <SelectField
                label="RCMC Panel"
                value={form.RCMCPanel}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, RCMCPanel: value, RCMCType: "" }))
                }
                options={Object.keys(RCMC_MAP)}
                disabled={viewMode}
              />
              <SelectField
                label="RCMC Type"
                value={form.RCMCType}
                onChange={(value) => setForm((prev) => ({ ...prev, RCMCType: value }))}
                options={rcmcTypeOptions}
                disabled={viewMode}
              />
            </div>
            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("basic")}>
                Back
              </Button>
              <Button onClick={() => setActiveTab("mail")} className="bg-blue-600 hover:bg-blue-700">
                Next
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="mail">
            <div className="grid max-h-[55vh] grid-cols-2 gap-4 overflow-y-auto pt-4">
              <SelectField
                label="Template"
                value={form.template}
                onChange={(value) => setForm((prev) => ({ ...prev, template: value }))}
                options={TEMPLATE_OPTIONS}
                disabled={viewMode}
              />
              <div>
                <Label>Subject</Label>
                <Input
                  disabled={viewMode}
                  value={form.subject}
                  onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  className="mt-1"
                  placeholder="Enter template subject"
                />
              </div>
              <SelectField
                label="Mail Status"
                value={form.status}
                onChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
                options={MAIL_STATUS_OPTIONS}
                disabled={viewMode}
              />
              <div>
                <Label>Source Date</Label>
                <Input
                  disabled={viewMode}
                  type="date"
                  value={form.sourceDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, sourceDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <SelectField
                label="IP Address"
                value={form.ipAddress}
                onChange={(value) => setForm((prev) => ({ ...prev, ipAddress: value }))}
                options={ipAddressOptions}
                disabled={viewMode}
              />
              <SelectField
                label="Web Source"
                value={form.webSource}
                onChange={(value) => setForm((prev) => ({ ...prev, webSource: value }))}
                options={webSourceOptions}
                disabled={viewMode}
              />
              <SelectField
                label="Email Sent"
                value={form.emailSent}
                onChange={(value) => setForm((prev) => ({ ...prev, emailSent: value }))}
                options={YES_NO_OPTIONS}
                disabled={viewMode}
              />
              <SelectField
                label="Verify Email"
                value={form.verifyEmail}
                onChange={(value) => setForm((prev) => ({ ...prev, verifyEmail: value }))}
                options={VERIFY_OPTIONS}
                disabled={viewMode}
              />
              <div className="col-span-2">
                <Label>Notes</Label>
                <textarea
                  disabled={viewMode}
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="mt-1 w-full rounded-md border p-2"
                  placeholder="Add internal notes"
                />
              </div>
              <div className="col-span-2">
                <Label>Body / Description</Label>
                <textarea
                  disabled={viewMode}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="mt-1 w-full rounded-md border p-2"
                  placeholder="Add description"
                />
              </div>
            </div>

            {!viewMode && (
              <div className="mt-4 flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("business")}>
                  Back
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
                  {editMail ? "Update Mail" : "Save Mail"}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {viewMode && (
          <div className="mt-4 flex justify-end">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setViewMode(false);
              }}
            >
              Edit Mail
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
