// MailSummary.jsx – Complete Frontend Component
import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios"; // adjust the import path to your axios instance
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"; // adjust import based on your UI library
import StackedBarChart from "../components/StackedBarChart";
import StatusPieChart from "../components/StatusPieChart";

// Mail-specific categories
const STATUS_CATEGORIES = ["sent", "draft", "failed", "scheduled"];
const PRIORITY_CATEGORIES = ["high", "normal", "low"];

export default function MailSummary() {
  const [summary, setSummary] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [tagData, setTagData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Transform summary data into table rows (one row for status, one for priority)
  const statusTableRows = useMemo(() => {
    if (!summary) return [];
    const row = { _id: "Counts" };
    STATUS_CATEGORIES.forEach((s) => (row[s] = summary.byStatus?.[s] || 0));
    return [row];
  }, [summary]);

  const priorityTableRows = useMemo(() => {
    if (!summary) return [];
    const row = { _id: "Counts" };
    PRIORITY_CATEGORIES.forEach((p) => (row[p] = summary.byPriority?.[p] || 0));
    return [row];
  }, [summary]);

  // Helper to compute total row (same as LeadSummary)
  const computeTotalRow = (rows) => {
    if (!rows.length) return null;
    const totals = {};
    Object.keys(rows[0]).forEach((key) => {
      if (key !== "_id") {
        totals[key] = rows.reduce((sum, row) => sum + (row[key] || 0), 0);
      }
    });
    return { _id: "TOTAL", ...totals };
  };

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, dailyRes, tagsRes] = await Promise.all([
        api.get("/api/mail/summary"),
        api.get("/api/mail/summary/daily?days=7"),
        api.get("/api/mail/summary/tags"),
      ]);

      if (summaryRes.data.success) {
        setSummary(summaryRes.data.data);
      } else {
        throw new Error(summaryRes.data.message || "Failed to fetch summary");
      }

      if (dailyRes.data.success) {
        setDailyData(dailyRes.data.data);
      }

      if (tagsRes.data.success) {
        setTagData(tagsRes.data.data);
      }
    } catch (err) {
      console.error("Mail summary fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reusable table renderer
  const renderTable = (rows, categories, totalRowObj) => (
    <div className="overflow-auto max-h-[75vh] border rounded-lg shadow bg-white">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-gray-200 sticky top-0 z-10">
          <tr>
            <th className="border p-2 font-semibold">Category</th>
            {categories.map((cat) => (
              <th key={cat} className="border p-2 text-center font-semibold">
                {cat}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id}>
              <td className="border p-2 font-semibold">{row._id}</td>
              {categories.map((cat) => (
                <td key={cat} className="border p-2 text-center">
                  {row[cat] || 0}
                </td>
              ))}
            </tr>
          ))}
          {totalRowObj && (
            <tr className="bg-blue-100 font-semibold">
              <td className="border p-2">TOTAL</td>
              {categories.map((cat) => (
                <td key={cat} className="border p-2 text-center">
                  {totalRowObj[cat]}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // Loading & error states
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Loading Mail Summary...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!summary) {
    return (
      <div className="p-6 text-gray-500">No mail summary data available.</div>
    );
  }

  // Prepare chart data
  const statusStackData = [{ _id: "Mails", ...summary.byStatus }];
  const priorityStackData = [{ _id: "Mails", ...summary.byPriority }];
  const pieData = { ...summary.byStatus };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Mail Summary Dashboard</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white p-3 rounded shadow text-center">
          <p className="text-sm text-gray-500">Total Mails</p>
          <p className="text-2xl font-bold">{summary.total || 0}</p>
        </div>
        <div className="bg-white p-3 rounded shadow text-center">
          <p className="text-sm text-gray-500">Unread</p>
          <p className="text-2xl font-bold">{summary.unread || 0}</p>
        </div>
        <div className="bg-white p-3 rounded shadow text-center">
          <p className="text-sm text-gray-500">Sent</p>
          <p className="text-2xl font-bold text-green-600">
            {summary.byStatus?.sent || 0}
          </p>
        </div>
        <div className="bg-white p-3 rounded shadow text-center">
          <p className="text-sm text-gray-500">Failed</p>
          <p className="text-2xl font-bold text-red-500">
            {summary.byStatus?.failed || 0}
          </p>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="status">
        <TabsList>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="priority">Priority</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="daily">Daily Trend</TabsTrigger>
        </TabsList>

        {/* Status Tab */}
        <TabsContent value="status">
          {renderTable(
            statusTableRows,
            STATUS_CATEGORIES,
            computeTotalRow(statusTableRows)
          )}
        </TabsContent>

        {/* Priority Tab */}
        <TabsContent value="priority">
          {renderTable(
            priorityTableRows,
            PRIORITY_CATEGORIES,
            computeTotalRow(priorityTableRows)
          )}
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags">
          <div className="overflow-auto max-h-[75vh] border rounded-lg shadow bg-white">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-gray-200 sticky top-0">
                <tr>
                  <th className="border p-2 font-semibold">Tag</th>
                  <th className="border p-2 font-semibold">Count</th>
                </tr>
              </thead>
              <tbody>
                {tagData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="2"
                      className="border p-2 text-center text-gray-400"
                    >
                      No tags found
                    </td>
                  </tr>
                ) : (
                  tagData.map((tagObj) => (
                    <tr key={tagObj.tag}>
                      <td className="border p-2">{tagObj.tag}</td>
                      <td className="border p-2 text-center">{tagObj.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Daily Trend Tab */}
        <TabsContent value="daily">
          <div className="overflow-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Total</th>
                  <th className="border p-2">Sent</th>
                  <th className="border p-2">Draft</th>
                  <th className="border p-2">Failed</th>
                </tr>
              </thead>
              <tbody>
                {dailyData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="border p-2 text-center text-gray-400"
                    >
                      No daily data available
                    </td>
                  </tr>
                ) : (
                  dailyData.map((day) => (
                    <tr key={day.date}>
                      <td className="border p-2">{day.date}</td>
                      <td className="border p-2 text-center">{day.total}</td>
                      <td className="border p-2 text-center">{day.sent}</td>
                      <td className="border p-2 text-center">{day.draft}</td>
                      <td className="border p-2 text-center">{day.failed}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <StackedBarChart
          data={statusStackData}
          statuses={STATUS_CATEGORIES}
          title="Mail Status Distribution"
        />
        <StackedBarChart
          data={priorityStackData}
          statuses={PRIORITY_CATEGORIES}
          title="Mail Priority Distribution"
        />
        <StatusPieChart
          title="Overall Mail Status Share"
          summary={pieData}
        />
      </div>
    </div>
  );
}