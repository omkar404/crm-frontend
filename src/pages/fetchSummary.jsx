import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  ArrowRight,
  Building2,
  Gauge,
  Layers3,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
];

export default function LeadSummary() {
  const navigate = useNavigate();
  const [industryData, setIndustryData] = useState([]);
  const [leadTypeData, setLeadTypeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    const fetchSummary = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/api/auth/lead-summary");
        if (!alive) return;
        setIndustryData(res.data.industrySummary || []);
        setLeadTypeData(res.data.leadTypeSummary || []);
      } catch (err) {
        if (!alive) return;
        console.error(err);
        setError("Unable to load lead summary.");
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    fetchSummary();
    return () => {
      alive = false;
    };
  }, []);

  const totals = useMemo(() => {
    const statusTotals = STATUS_CATEGORIES.reduce((acc, status) => {
      acc[status] = industryData.reduce((sum, row) => sum + (row[status] || 0), 0);
      return acc;
    }, {});

    return {
      totalLeads: Object.values(statusTotals).reduce((sum, value) => sum + value, 0),
      industries: industryData.length,
      leadTypes: leadTypeData.length,
      hottestStatus:
        Object.entries(statusTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "--",
      statusSummary: statusTotals,
    };
  }, [industryData, leadTypeData]);

  const topIndustry = useMemo(
    () =>
      [...industryData]
        .sort((a, b) => (b.Total || 0) - (a.Total || 0))[0]?._id || "--",
    [industryData]
  );

  const topLeadType = useMemo(
    () =>
      [...leadTypeData]
        .sort((a, b) => (b.Total || 0) - (a.Total || 0))[0]?._id || "--",
    [leadTypeData]
  );

  const summaryCards = [
    { label: "Total Lead Signals", value: totals.totalLeads, icon: Activity },
    { label: "Industries Covered", value: totals.industries, icon: Building2 },
    { label: "Lead Types Active", value: totals.leadTypes, icon: Layers3 },
    { label: "Hottest Status", value: totals.hottestStatus, icon: Gauge, compact: true },
  ];

  if (loading) {
    return (
      <div className="crm-card flex min-h-[320px] items-center justify-center p-8 text-slate-500">
        Loading lead summary...
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

  return (
    <div className="space-y-5">
      <section className="crm-card relative overflow-hidden border-white/80 p-6 md:p-8">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,118,110,0.10),rgba(14,165,233,0.07),rgba(245,158,11,0.08))]" />
        <div className="absolute inset-0 crm-mesh opacity-25" />
        <div className="relative">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-2xl">
              <Badge className="rounded-full bg-teal-100 px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-teal-800">
                Lead Summary
              </Badge>
              <h1 className="mt-4 text-3xl font-extrabold text-slate-950 md:text-4xl">
                Make pipeline patterns obvious at first glance.
              </h1>
              <p className="mt-3 text-base text-slate-600 md:text-lg">
                A cleaner breakdown of lead status distribution across industries and lead types,
                designed for faster review and stronger decision-making.
              </p>
            </div>

            <div className="rounded-[28px] bg-slate-950 px-6 py-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
              <p className="text-xs uppercase tracking-[0.26em] text-white/60">Focus Signals</p>
              <div className="mt-4 space-y-3">
                <QuickStat label="Top Industry" value={topIndustry} />
                <QuickStat label="Top Lead Type" value={topLeadType} />
                <QuickStat label="Priority Direction" value={totals.hottestStatus} />
              </div>
              <Button
                className="mt-5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100"
                onClick={() => navigate("/leads")}
              >
                Open Lead Table
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map(({ label, value, icon: Icon, compact }) => (
              <div
                key={label}
                className="crm-fade-up rounded-[24px] border border-white/80 bg-white/85 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">{label}</p>
                    <p className={`mt-3 font-extrabold text-slate-900 ${compact ? "text-2xl" : "text-3xl"}`}>
                      {value}
                    </p>
                  </div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 via-cyan-100 to-amber-100 text-slate-800">
                    <Icon size={18} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="crm-card border-white/75 p-5 md:p-6">
        <Tabs defaultValue="industry" className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Breakdowns</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Lead summary tables</h2>
            </div>

            <TabsList className="grid h-auto grid-cols-2 rounded-2xl bg-slate-100 p-1">
              <TabsTrigger value="industry" className="rounded-2xl px-4 py-2">
                Industry
              </TabsTrigger>
              <TabsTrigger value="leadType" className="rounded-2xl px-4 py-2">
                Lead Type
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="industry">
            <SummaryTable
              rows={industryData}
              categories={STATUS_CATEGORIES}
              label="Industry"
            />
          </TabsContent>

          <TabsContent value="leadType">
            <SummaryTable
              rows={leadTypeData}
              categories={STATUS_CATEGORIES}
              label="Lead Type"
            />
          </TabsContent>
        </Tabs>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <StackedBarChart
          data={industryData}
          statuses={STATUS_CATEGORIES}
          title="Industry-wise Lead Status Overview"
          description="See which industries are carrying the largest lead loads across every stage."
        />

        <StackedBarChart
          data={leadTypeData}
          statuses={STATUS_CATEGORIES}
          title="Lead Type-wise Lead Status Overview"
          description="Compare how different lead types are moving through the funnel."
        />

        <StatusPieChart
          title="Overall Lead Status Distribution"
          description="A quick percentage-style read on the current balance of lead statuses."
          summary={totals.statusSummary}
        />

        <div className="crm-card border-white/75 p-5 shadow-none">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">Lead momentum notes</h2>
            <p className="mt-1 text-sm text-slate-600">
              Use these highlights to steer follow-up, segmentation, and campaign effort.
            </p>
          </div>
          <div className="space-y-3">
            <InsightRow label="Top industry by volume" value={topIndustry} />
            <InsightRow label="Top lead type by volume" value={topLeadType} />
            <InsightRow label="Most frequent current status" value={totals.hottestStatus} />
            <InsightRow label="Distinct industries tracked" value={totals.industries} />
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryTable({ rows, categories, label }) {
  const totalRow = useMemo(() => {
    if (!rows.length) return null;

    return categories.reduce(
      (acc, category) => {
        acc[category] = rows.reduce((sum, row) => sum + (row[category] || 0), 0);
        return acc;
      },
      { _id: "TOTAL" }
    );
  }, [rows, categories]);

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
            {rows.map((row, rowIndex) => (
              <tr key={row._id} className={rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{row._id}</td>
                {categories.map((category) => (
                  <td key={category} className="px-4 py-3 text-center text-slate-700">
                    {row[category] || 0}
                  </td>
                ))}
              </tr>
            ))}
            {totalRow && (
              <tr className="bg-gradient-to-r from-teal-50 via-cyan-50 to-amber-50 font-semibold">
                <td className="px-4 py-3 text-slate-900">{totalRow._id}</td>
                {categories.map((category) => (
                  <td key={category} className="px-4 py-3 text-center text-slate-900">
                    {totalRow[category]}
                  </td>
                ))}
              </tr>
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
