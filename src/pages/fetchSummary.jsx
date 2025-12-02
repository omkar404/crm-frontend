import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import StackedBarChart from "../components/StackedBarChart";
import StatusPieChart from "../components/StatusPieChart";

const STATUS_CATEGORIES = [
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
  "Total",
];

export default function LeadSummary() {
  const [industryData, setIndustryData] = useState([]);
  const [leadTypeData, setLeadTypeData] = useState([]);

  // Compute Total Row for Industry
  const industryTotalRow = React.useMemo(() => {
    if (!industryData.length) return null;

    const totals = {};
    STATUS_CATEGORIES.forEach((s) => {
      totals[s] = industryData.reduce((sum, row) => sum + (row[s] || 0), 0);
    });

    return { _id: "TOTAL", ...totals };
  }, [industryData]);

  // Compute Total Row for LeadType
  const leadTypeTotalRow = React.useMemo(() => {
    if (!leadTypeData.length) return null;

    const totals = {};
    STATUS_CATEGORIES.forEach((s) => {
      totals[s] = leadTypeData.reduce((sum, row) => sum + (row[s] || 0), 0);
    });

    return { _id: "TOTAL", ...totals };
  }, [leadTypeData]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.get("api/auth/lead-summary");
      setIndustryData(res.data.industrySummary);
      setLeadTypeData(res.data.leadTypeSummary);
    } catch (err) {
      console.error(err);
    }
  };

  const renderTable = (rows, totalRow) => (
    <div className="overflow-auto max-h-[75vh] border rounded-lg shadow bg-white">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-gray-200 sticky top-0 z-10">
          <tr>
            <th className="border p-2 font-semibold">Category</th>
            {STATUS_CATEGORIES.map((s) => (
              <th key={s} className="border p-2 text-center font-semibold">
                {s}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row._id}>
              <td className="border p-2 font-semibold">{row._id}</td>
              {STATUS_CATEGORIES.map((s) => (
                <td key={s} className="border p-2 text-center">
                  {row[s] || 0}
                </td>
              ))}
            </tr>
          ))}

          {/* TOTAL ROW */}
          {totalRow && (
            <tr className="bg-blue-100 font-semibold">
              <td className="border p-2">TOTAL</td>
              {STATUS_CATEGORIES.map((s) => (
                <td key={s} className="border p-2 text-center">
                  {totalRow[s]}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Lead Summary Dashboard</h1>

      <Tabs defaultValue="industry">
        <TabsList>
          <TabsTrigger value="industry">Industry</TabsTrigger>
          <TabsTrigger value="leadType">Lead Type</TabsTrigger>
        </TabsList>

        <TabsContent value="industry">
          {renderTable(industryData, industryTotalRow)}
        </TabsContent>

        <TabsContent value="leadType">
          {renderTable(leadTypeData, leadTypeTotalRow)}
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Industry Stacked Chart */}
        <StackedBarChart
          data={industryData}
          statuses={STATUS_CATEGORIES.filter((s) => s !== "Total")}
          title="Industry-wise Lead Status Overview"
        />

        {/* Lead Type Stacked Chart */}
        <StackedBarChart
          data={leadTypeData}
          statuses={STATUS_CATEGORIES.filter((s) => s !== "Total")}
          title="Lead Type-wise Lead Status Overview"
        />

        {/* Overall Pie Chart */}
        <StatusPieChart
          title="Overall Lead Status Distribution"
          summary={industryData.reduce((acc, row) => {
            STATUS_CATEGORIES.forEach((s) => {
              if (s !== "Total") acc[s] = (acc[s] || 0) + (row[s] || 0);
            });
            return acc;
          }, {})}
        />
      </div>
    </div>
  );
}
