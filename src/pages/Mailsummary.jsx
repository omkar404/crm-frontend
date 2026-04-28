import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowRight,
  Mail,
  MailCheck,
  Radar,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StackedBarChart from "../components/StackedBarChart";
import StatusPieChart from "../components/StatusPieChart";

const STATUS_CATEGORIES = ["sent", "draft", "failed", "scheduled"];
const PRIORITY_CATEGORIES = ["high", "normal", "low"];

export default function MailSummary() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [tagData, setTagData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    const fetchAllData = async () => {
      setLoading(true);
      setError("");
      try {
        const [summaryRes, dailyRes, tagsRes] = await Promise.all([
          api.get("/api/mail/summary"),
          api.get("/api/mail/summary/daily", { params: { days: 30 } }),
          api.get("/api/mail/summary/tags"),
        ]);

        if (!alive) return;

        if (summaryRes.data.success) {
          setSummary(summaryRes.data.data);
        } else {
          throw new Error(summaryRes.data.message || "Failed to fetch summary");
        }

        setDailyData(dailyRes.data?.data || []);
        setTagData(tagsRes.data?.data || []);
      } catch (err) {
        if (!alive) return;
        console.error("Mail summary fetch error:", err);
        setError("Unable to load mail summary.");
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    fetchAllData();
    return () => {
      alive = false;
    };
  }, []);

  const statusTableRows = useMemo(() => {
    if (!summary) return [];
    const row = { _id: "Counts" };
    STATUS_CATEGORIES.forEach((status) => {
      row[status] = summary.byStatus?.[status] || 0;
    });
    return [row];
  }, [summary]);

  const priorityTableRows = useMemo(() => {
    if (!summary) return [];
    const row = { _id: "Counts" };
    PRIORITY_CATEGORIES.forEach((priority) => {
      row[priority] = summary.byPriority?.[priority] || 0;
    });
    return [row];
  }, [summary]);

  const metrics = useMemo(
    () => [
      { label: "Total Mails", value: summary?.total || 0, icon: Mail },
      { label: "Unread Queue", value: summary?.unread || 0, icon: Sparkles },
      { label: "Sent", value: summary?.byStatus?.sent || 0, icon: MailCheck },
      { label: "Failed", value: summary?.byStatus?.failed || 0, icon: AlertTriangle },
    ],
    [summary]
  );

  const topTag = tagData[0]?.tag || "--";
  const topStatus = useMemo(
    () =>
      Object.entries(summary?.byStatus || {})
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "--",
    [summary]
  );

  if (loading) {
    return (
      <div className="crm-card flex min-h-[320px] items-center justify-center p-8 text-slate-500">
        Loading mail summary...
      </div>
    );
  }

  if (error) {
    return (
      <div className="crm-card flex min-h-[320px] flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-lg font-semibold text-slate-900">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="crm-card flex min-h-[320px] items-center justify-center p-8 text-slate-500">
        No mail summary data available.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="crm-card relative overflow-hidden border-white/80 p-6 md:p-8">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(29,78,216,0.10),rgba(14,165,233,0.08),rgba(245,158,11,0.08))]" />
        <div className="absolute inset-0 crm-mesh opacity-25" />
        <div className="relative">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-2xl">
              <Badge className="rounded-full bg-sky-100 px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-sky-800">
                Mail Summary
              </Badge>
              <h1 className="mt-4 text-3xl font-extrabold text-slate-950 md:text-4xl">
                Make delivery health and send volume feel instantly readable.
              </h1>
              <p className="mt-3 text-base text-slate-600 md:text-lg">
                A more professional view of mail performance, priority mix, daily throughput,
                and the signals that need attention first.
              </p>
            </div>

            <div className="rounded-[28px] bg-slate-950 px-6 py-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
              <p className="text-xs uppercase tracking-[0.26em] text-white/60">Mail Focus</p>
              <div className="mt-4 space-y-3">
                <QuickStat label="Top Status" value={topStatus} />
                <QuickStat label="Top Tag" value={topTag} />
                <QuickStat label="Unread Queue" value={summary.unread || 0} />
              </div>
              <Button
                className="mt-5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100"
                onClick={() => navigate("/mails")}
              >
                Open Mail Table
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="crm-fade-up rounded-[24px] border border-white/80 bg-white/85 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">{label}</p>
                    <p className="mt-3 text-3xl font-extrabold text-slate-900">{value}</p>
                  </div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 via-blue-100 to-amber-100 text-slate-800">
                    <Icon size={18} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="crm-card border-white/75 p-5 md:p-6">
        <Tabs defaultValue="status" className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Breakdowns</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Mail summary tables</h2>
            </div>

            <TabsList className="grid h-auto grid-cols-2 rounded-2xl bg-slate-100 p-1 md:grid-cols-4">
              <TabsTrigger value="status" className="rounded-2xl px-4 py-2">Status</TabsTrigger>
              <TabsTrigger value="priority" className="rounded-2xl px-4 py-2">Priority</TabsTrigger>
              <TabsTrigger value="tags" className="rounded-2xl px-4 py-2">Tags</TabsTrigger>
              <TabsTrigger value="daily" className="rounded-2xl px-4 py-2">Daily</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="status">
            <SimpleSummaryTable rows={statusTableRows} categories={STATUS_CATEGORIES} label="Status" />
          </TabsContent>

          <TabsContent value="priority">
            <SimpleSummaryTable rows={priorityTableRows} categories={PRIORITY_CATEGORIES} label="Priority" />
          </TabsContent>

          <TabsContent value="tags">
            <TagTable rows={tagData} />
          </TabsContent>

          <TabsContent value="daily">
            <DailyTable rows={dailyData} />
          </TabsContent>
        </Tabs>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <StackedBarChart
          data={[{ _id: "Mails", ...summary.byStatus }]}
          statuses={STATUS_CATEGORIES}
          title="Mail Status Distribution"
          description="See how mail volume is distributed across active delivery states."
        />

        <StackedBarChart
          data={[{ _id: "Mails", ...summary.byPriority }]}
          statuses={PRIORITY_CATEGORIES}
          title="Mail Priority Distribution"
          description="Compare the weight of high, normal, and low priority traffic."
        />

        <StatusPieChart
          title="Overall Mail Status Share"
          description="A fast visual split of current mail statuses."
          summary={summary.byStatus}
        />

        <div className="crm-card border-white/75 p-5 shadow-none">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">Mail health notes</h2>
            <p className="mt-1 text-sm text-slate-600">
              Use these signals to decide where to focus cleanup, retry, or send operations.
            </p>
          </div>
          <div className="space-y-3">
            <InsightRow label="Most common status" value={topStatus} />
            <InsightRow label="Highest-volume tag" value={topTag} />
            <InsightRow label="Unread queue" value={summary.unread || 0} />
            <InsightRow label="Daily records tracked" value={dailyData.length} />
          </div>
        </div>
      </section>
    </div>
  );
}

function SimpleSummaryTable({ rows, categories, label }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white/90 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
      <div className="overflow-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">{label}</th>
              {categories.map((category) => (
                <th key={category} className="px-4 py-3 text-center font-semibold text-slate-700">
                  {category}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id} className="bg-white">
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{row._id}</td>
                {categories.map((category) => (
                  <td key={category} className="px-4 py-3 text-center text-slate-700">
                    {row[category] || 0}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TagTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white/90 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
      <div className="overflow-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Tag</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Count</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="2" className="px-4 py-6 text-center text-slate-500">
                  No tags found.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.tag} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{row.tag}</td>
                  <td className="px-4 py-3 text-center text-slate-700">{row.count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DailyTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white/90 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
      <div className="overflow-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Total</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Sent</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Draft</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Failed</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-slate-500">
                  No daily data available.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.date} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{row.date}</td>
                  <td className="px-4 py-3 text-center text-slate-700">{row.total}</td>
                  <td className="px-4 py-3 text-center text-slate-700">{row.sent}</td>
                  <td className="px-4 py-3 text-center text-slate-700">{row.draft}</td>
                  <td className="px-4 py-3 text-center text-slate-700">{row.failed}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuickStat({ label, value }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/10 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-white/55">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function InsightRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[18px] border border-slate-200 bg-white/85 px-4 py-3">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}
