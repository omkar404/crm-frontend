import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { successToast, errorToast } from "@/utils/customToast";
import api from "../api/axios";

const emptyForm = {
  idNo: "",
  idDate: "",
  name: "",
  iecChaNo: "",
  landlineNo: "",
  mobileNo: "",
  email: "",
  website: "",
  address: "",
  city: "",
  state: "",
  pinCode: "",
  contactPerson: "",
  designation: "",
  employees: "",
  turnover: "",
  startupCategory: "",
  AEOStatus: "",
  RCMCPanel: "",
  RCMCType: "",
  industry: "",
  industryBrief: "",
  leadType: "",
  priorityRating: "",
  leadSource: "",
  leadStatus: "",
  description: "",
  notes: "",
};

export default function LeadFormModal({
  open,
  setOpen,
  editLead,
  onSaved,
  viewMode,
}) {
  const [activeTab, setActiveTab] = useState("basic");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open) {
      if (editLead) {
        const { _id, __v, createdAt, updatedAt, ...rest } = editLead || {};
        setForm((prev) => ({ ...emptyForm, ...rest }));
      } else {
        setForm(emptyForm);
      }
      setActiveTab("basic");
    }
  }, [open, editLead]);

  const renderSelect = (value, onChange, options, placeholder = "Select") => (
    <Select value={value || ""} onValueChange={(v) => onChange(v)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const turnoverList = [
    "NA",
    "Less than 10 Cr",
    "10 Cr - 50 Cr",
    "50 Cr - 100 Cr",
    "100 Cr - 500 Cr",
    "Above 500 Cr",
  ];
  const startupCategoryList = ["Yes", "No"];
  const AEOStatusList = ["NA", "AEO - T1", "AEO - T2", "AEO - T3", "AEO - LEO"];
  const leadTypeList = [
    "CHA",
    "Logistics",
    "Freight Forwarder",
    "Manufacturer",
    "Importer",
    "Exporter",
  ];
  const priorityRatingList = ["Low", "Medium", "High", "Premium"];
  const leadSourceList = [
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
  const leadStatusList = [
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
    "Spam / Fake Lead",
    "Do Not Touch",
  ];
  const stateList = [
    "Maharashtra",
    "Gujarat",
    "Delhi",
    "Karnataka",
    "Tamil Nadu",
    "Rajasthan",
    "UP",
    "MP",
  ];
  const industryList = [
    "Agriculture, Forestry, and Fishing",
    "Coal and lignite",
    "Crude petroleum and natural gas",
    "Iron ore",
    "Textiles and Apparel",
    "Automobiles",
    "Chemicals",
    "Pharmaceuticals and Biotechnology",
    "Food Processing",
    "Basic Metals",
    "Electronics",
    "Machinery and Equipment",
    "Petroleum Products",
    "Warehousing and logistics",
  ];

  const RCMC_MAP = {
    FIEO: ["FIEO - FEDERATION"],
    EPC: ["EEPC - ENGINEERING"],
    APPARELS: [
      "AEPC - APPAREL",
      "TEXPROCIL - TEXTILE",
      "SRTEPC - SYNTHETIC",
      "HEPC - HANDICRAFTS",
      "WWEPC - WOOLEN",
      "ISEPC - SILK",
      "CEPC - CARPET",
    ],
    "CHEMICALS/PLASTIC": ["CHEMEXCIL - CHEMICALS", "CAPEXIL - ALLIED"],
    Pharmaceuticals: ["PHARMEXCIL - PHARMA"],
    "Gems & Jewellery": ["GJEPC - GEM"],
    Leather: ["CLE - LEATHER"],
    Handicraft: ["EPCH - HANDICRAFT"],
    "Electronics & IT": [
      "ESC - COMPUTER / SOFTWARE",
      "MEDEPC - MOBILE / ELECTRONICS",
    ],
    "Sports Goods": ["SGEPC - SPORTS"],
    Services: ["SEPC - Services Export"],
    "Commodity Boards": [
      "Spices Board India",
      "Tea Board India",
      "Coffee Board of India",
      "Coir Board",
      "Rubber Board",
      "Tobacco Board",
    ],
    "Agricultural Products": ["APEDA - Agricultural / Foods"],
    "Marine Products": ["MPEDA - MARINE"],
  };

  const INDUSTRY_MAP = {
    "Agriculture & Farming": [
      "Farming Crops",
      "Livestock & Dairy",
      "Forestry & Logging",
      "Fishing & Aquaculture",
    ],

    "Mining & Quarrying": [
      "Coal / Lignite",
      "Crude Petroleum / Natural Gas",
      "Iron Ore",
      "Metallic Minerals",
      "Stone Quarrying",
    ],

    Manufacturing: [
      "Textiles & Apparel",
      "Automobiles",
      "Chemicals",
      "Pharmaceuticals / Biotech",
      "Food Processing",
      "Basic Metals",
      "Fabricated Metal Products",
      "Electronics",
      "Machinery",
      "Petroleum Products",
      "Non-Metallic Minerals",
    ],

    Construction: ["Real Estate", "Infrastructure Projects"],

    Utilities: ["Electricity / Gas Supply", "Water / Waste Management"],

    "IT & Software Services": [
      "Software Development",
      "ITeS / BPO",
      "KPO",
      "IT Consulting",
    ],

    "Financial Services": [
      "Banking",
      "Insurance",
      "Stock Markets / Asset Mgmt",
    ],

    "Trade (Wholesale & Retail)": [
      "Wholesale Distribution",
      "Retail / E-Commerce",
    ],

    "Transport & Logistics": [
      "Road Transport",
      "Railways",
      "Aviation",
      "Shipping",
      "Warehousing & Logistics",
    ],

    "Tourism & Hospitality": ["Hotels / Restaurants", "Travel Services"],

    Telecommunications: ["Mobile / Internet Services"],

    Healthcare: ["Hospitals / Clinics", "Diagnostics"],

    Education: ["Schools / Colleges", "Ed-Tech"],

    "Media & Entertainment": ["Film / TV", "Publishing"],

    "Professional Services": [
      "Legal / Accounting",
      "Engineering / Architecture",
      "Consulting / Advertising",
    ],

    "Public Administration": ["Government Services", "Defence"],
  };

  const getBriefOptionsForIndustry = (industry) => {
    return INDUSTRY_MAP[industry] || [];
  };

  // helper to get options (returns array)
  const getRCMCTypesForPanel = (panel) => {
    if (!panel) return [];
    return RCMC_MAP[panel] || [];
  };

  const handleSave = async () => {
    try {
      const clean = { ...form };
      if (clean.employees === "") delete clean.employees;

      const typesForPanel = getRCMCTypesForPanel(form.RCMCPanel);
      if (form.RCMCPanel && typesForPanel.length > 1 && !form.RCMCType) {
        return errorToast("Please select RCMC Type for the chosen RCMC Panel.");
      }

      // Validate Industry Brief
      const briefOptions = getBriefOptionsForIndustry(form.industry);
      if (form.industry && briefOptions.length > 1 && !form.industryBrief) {
        return errorToast(
          "Please select Industry Brief for the chosen Industry."
        );
      }

      if (editLead) {
        await api.put(`api/auth/update/${editLead._id}`, clean);
        successToast("Lead updated successfully!");
      } else {
        const generatedId = `LEAD-${Date.now()}`;
        await api.post("api/auth/create", {
          ...clean,
          idNo: generatedId,
          idDate: new Date(),
        });
        successToast("Lead created successfully!");
      }
      setOpen(false);
      onSaved();
    } catch (err) {
      console.error(err);
      errorToast(err?.response?.data?.error || "Something went wrong!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {viewMode ? "View Lead" : editLead ? "Edit Lead" : "Create Lead"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-4 grid grid-cols-3 gap-2">
            <TabsList className="col-span-3 grid grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="business">Business Details</TabsTrigger>
              <TabsTrigger value="notes">Notes & Description</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="basic">
            <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto">
              <div>
                <Label>
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  disabled={viewMode}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>
                  Mobile No <span className="text-red-500">*</span>
                </Label>
                <Input
                  disabled={viewMode}
                  value={form.mobileNo}
                  onChange={(e) =>
                    setForm({ ...form, mobileNo: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label>
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  disabled={viewMode}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Landline No</Label>
                <Input
                  disabled={viewMode}
                  value={form.landlineNo}
                  onChange={(e) =>
                    setForm({ ...form, landlineNo: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Website</Label>
                <Input
                  disabled={viewMode}
                  value={form.website}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label>IEC / CHA No</Label>
                <Input
                  disabled={viewMode}
                  value={form.iecChaNo}
                  onChange={(e) =>
                    setForm({ ...form, iecChaNo: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div className="col-span-2">
                <Label>Address</Label>
                <textarea
                  disabled={viewMode}
                  className="w-full border rounded-md p-2 mt-1"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>City</Label>
                <Input
                  disabled={viewMode}
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>State</Label>
                {viewMode ? (
                  <Input disabled value={form.state} className="mt-1" />
                ) : (
                  renderSelect(
                    form.state,
                    (v) => setForm({ ...form, state: v }),
                    stateList,
                    "Select State"
                  )
                )}
              </div>

              <div>
                <Label>Pincode</Label>
                <Input
                  disabled={viewMode}
                  value={form.pinCode}
                  onChange={(e) =>
                    setForm({ ...form, pinCode: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Contact Person</Label>
                <Input
                  disabled={viewMode}
                  value={form.contactPerson}
                  onChange={(e) =>
                    setForm({ ...form, contactPerson: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Designation</Label>
                <Input
                  disabled={viewMode}
                  value={form.designation}
                  onChange={(e) =>
                    setForm({ ...form, designation: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Lead Type</Label>
                {viewMode ? (
                  <Input disabled value={form.leadType} className="mt-1" />
                ) : (
                  renderSelect(
                    form.leadType,
                    (v) => setForm({ ...form, leadType: v }),
                    leadTypeList,
                    "Select Lead Type"
                  )
                )}
              </div>

              <div>
                <Label>Priority Rating</Label>
                {viewMode ? (
                  <Input
                    disabled
                    value={form.priorityRating}
                    className="mt-1"
                  />
                ) : (
                  renderSelect(
                    form.priorityRating,
                    (v) => setForm({ ...form, priorityRating: v }),
                    priorityRatingList,
                    "Select Priority"
                  )
                )}
              </div>

              <div>
                <Label>Lead Source</Label>
                {viewMode ? (
                  <Input disabled value={form.leadSource} className="mt-1" />
                ) : (
                  renderSelect(
                    form.leadSource,
                    (v) => setForm({ ...form, leadSource: v }),
                    leadSourceList,
                    "Select Lead Source"
                  )
                )}
              </div>

              <div>
                <Label>Lead Status</Label>
                {viewMode ? (
                  <Input disabled value={form.leadStatus} className="mt-1" />
                ) : (
                  renderSelect(
                    form.leadStatus,
                    (v) => setForm({ ...form, leadStatus: v }),
                    leadStatusList,
                    "Select Lead Status"
                  )
                )}
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                onClick={() => setActiveTab("business")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="business">
            <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto">
              {/* Industry */}
              <div>
                <Label>Industry</Label>
                {viewMode ? (
                  <Input disabled value={form.industry} className="mt-1" />
                ) : (
                  renderSelect(
                    form.industry,
                    (v) => {
                      const briefs = getBriefOptionsForIndustry(v);
                      const autoBrief = briefs.length === 1 ? briefs[0] : "";
                      setForm((prev) => ({
                        ...prev,
                        industry: v,
                        industryBrief: autoBrief,
                      }));
                    },
                    Object.keys(INDUSTRY_MAP),
                    "Select Industry"
                  )
                )}
              </div>

              {/* Industry Brief */}
              <div>
                <Label>Industry Brief</Label>
                {viewMode ? (
                  <Input disabled value={form.industryBrief} className="mt-1" />
                ) : (
                  (() => {
                    const options = getBriefOptionsForIndustry(form.industry);
                    const finalOptions = options.length
                      ? options
                      : form.industryBrief
                      ? [form.industryBrief]
                      : [];
                    return renderSelect(
                      form.industryBrief,
                      (v) => setForm((prev) => ({ ...prev, industryBrief: v })),
                      finalOptions,
                      finalOptions.length
                        ? "Select Brief"
                        : "No Briefs Available"
                    );
                  })()
                )}
              </div>

              <div>
                <Label>Turnover</Label>
                {viewMode ? (
                  <Input disabled value={form.turnover} className="mt-1" />
                ) : (
                  renderSelect(
                    form.turnover,
                    (v) => setForm({ ...form, turnover: v }),
                    turnoverList,
                    "Select Turnover"
                  )
                )}
              </div>

              <div>
                <Label>Employees</Label>
                <Input
                  disabled={viewMode}
                  value={form.employees}
                  onChange={(e) =>
                    setForm({ ...form, employees: e.target.value })
                  }
                  type="number"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Startup Category</Label>
                {viewMode ? (
                  <Input
                    disabled
                    value={form.startupCategory}
                    className="mt-1"
                  />
                ) : (
                  renderSelect(
                    form.startupCategory,
                    (v) => setForm({ ...form, startupCategory: v }),
                    startupCategoryList,
                    "Select Startup Category"
                  )
                )}
              </div>

              <div>
                <Label>AEO Status</Label>
                {viewMode ? (
                  <Input disabled value={form.AEOStatus} className="mt-1" />
                ) : (
                  renderSelect(
                    form.AEOStatus,
                    (v) => setForm({ ...form, AEOStatus: v }),
                    AEOStatusList,
                    "Select AEO Status"
                  )
                )}
              </div>

              {/* RCMC Panel */}
              <div>
                <Label>RCMC Panel</Label>
                {viewMode ? (
                  <Input disabled value={form.RCMCPanel} className="mt-1" />
                ) : (
                  renderSelect(
                    form.RCMCPanel,
                    (v) => {
                      // set selected panel
                      const types = getRCMCTypesForPanel(v);
                      // if exactly one matching type, auto-select it
                      const autoType = types.length === 1 ? types[0] : "";
                      setForm((prev) => ({
                        ...prev,
                        RCMCPanel: v,
                        RCMCType: autoType,
                      }));
                    },
                    // Use keys of map + keep any other values you might have in your list
                    [
                      ...new Set(
                        [...Object.keys(RCMC_MAP), form.RCMCPanel].filter(
                          Boolean
                        )
                      ),
                    ],
                    "Select RCMC Panel"
                  )
                )}
              </div>

              {/* RCMC Type */}
              <div>
                <Label>RCMC Type</Label>
                {viewMode ? (
                  <Input disabled value={form.RCMCType} className="mt-1" />
                ) : (
                  (() => {
                    const options = getRCMCTypesForPanel(form.RCMCPanel);
                    // fallback: if panel unknown but form has a saved value, show that value as single option
                    const finalOptions = options.length
                      ? options
                      : form.RCMCType
                      ? [form.RCMCType]
                      : [];
                    return renderSelect(
                      form.RCMCType,
                      (v) => setForm((prev) => ({ ...prev, RCMCType: v })),
                      finalOptions,
                      finalOptions.length
                        ? "Select RCMC Type"
                        : "No types available"
                    );
                  })()
                )}
              </div>

              <div>
                <Label>ID No (Auto)</Label>
                <Input
                  disabled
                  value={form.idNo || "Auto-generated"}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>ID Date (Auto)</Label>
                <Input
                  disabled
                  value={
                    form.idDate
                      ? new Date(form.idDate).toLocaleDateString()
                      : new Date().toLocaleDateString()
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveTab("basic")}>
                Back
              </Button>
              <Button
                onClick={() => setActiveTab("notes")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="notes">
            <div className="grid grid-cols-1 gap-4 max-h-[40vh] overflow-y-auto">
              <div>
                <Label>Notes</Label>
                <textarea
                  disabled={viewMode}
                  className="w-full border rounded-md p-2 mt-1"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div>
                <Label>Description</Label>
                <textarea
                  disabled={viewMode}
                  className="w-full border rounded-md p-2 mt-1"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
            </div>

            {!viewMode && (
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("business")}
                >
                  Back
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSave}
                >
                  {editLead ? "Update Lead" : "Save Lead"}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
