import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import api from "../api/axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import {
  ArrowRight,
  CalendarRange,
  Mail,
  MailCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const VIEW_CONFIG = {
  lead: {
    label: "Lead View",
    eyebrow: "Pipeline Focus",
    headline: "Track outreach momentum before it slips.",
    description:
      "Keep lead creation, stage movement, and category pressure visible in one glance.",
    accent: "from-teal-600 via-cyan-600 to-orange-400",
    softAccent: "from-teal-50 via-cyan-50 to-orange-50",
    badgeClass: "bg-teal-100 text-teal-800",
    buttonClass: "bg-[#16202A] hover:bg-[#22303c] text-white",
    stroke: "#0f766e",
    fillStart: "#0f766e",
    fillEnd: "#f59e0b",
    chipClass: "bg-teal-600 text-white shadow-[0_18px_36px_rgba(15,118,110,0.28)]",
    ghostChipClass: "bg-white/70 text-slate-700 hover:bg-white",
  },
  mail: {
    label: "Mail View",
    eyebrow: "Campaign Pulse",
    headline: "Surface delivery health with a sharper mail lens.",
    description:
      "Watch send volume, unread backlog, and failure pockets without leaving the dashboard.",
    accent: "from-sky-700 via-blue-700 to-amber-400",
    softAccent: "from-sky-50 via-blue-50 to-amber-50",
    badgeClass: "bg-sky-100 text-sky-800",
    buttonClass: "bg-sky-700 hover:bg-sky-800 text-white",
    stroke: "#1d4ed8",
    fillStart: "#1d4ed8",
    fillEnd: "#f59e0b",
    chipClass: "bg-sky-700 text-white shadow-[0_18px_36px_rgba(29,78,216,0.26)]",
    ghostChipClass: "bg-white/70 text-slate-700 hover:bg-white",
  },
};

const leadStatusToneMap = {
  Interested: "bg-emerald-100 text-emerald-800",
  "In Process": "bg-amber-100 text-amber-800",
  "Email Sent": "bg-sky-100 text-sky-800",
  "Not Contacted": "bg-slate-200 text-slate-700",
  "Visit Scheduled": "bg-rose-100 text-rose-800",
};

const mailStatusToneMap = {
  sent: "bg-emerald-100 text-emerald-800",
  draft: "bg-slate-200 text-slate-700",
  failed: "bg-rose-100 text-rose-800",
  scheduled: "bg-amber-100 text-amber-800",
};

const formatCompactDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState(() => localStorage.getItem("crm-dashboard-view") || "lead");
  const [leadStats, setLeadStats] = useState(null);
  const [mailStats, setMailStats] = useState(null);
  const [mailDaily, setMailDaily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("crm-dashboard-view", activeView);
  }, [activeView]);

  useEffect(() => {
    let alive = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [leadResponse, mailResponse, mailDailyResponse] = await Promise.all([
          api.get("/api/auth/dashboard-stats"),
          api.get("/api/mail/summary"),
          api.get("/api/mail/summary/daily", { params: { days: 30 } }),
        ]);

        if (!alive) {
          return;
        }

        setLeadStats(leadResponse.data);
        setMailStats(mailResponse.data?.data || null);
        setMailDaily(mailDailyResponse.data?.data || []);
      } catch (requestError) {
        if (!alive) {
          return;
        }

        console.error("Dashboard load failed", requestError);
        setError("Unable to load dashboard insights right now.");
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      alive = false;
    };
  }, []);

  const viewTheme = VIEW_CONFIG[activeView];

  const leadMetrics = useMemo(
    () => [
      { label: "Today", value: leadStats?.today || 0, icon: CalendarRange },
      { label: "This Week", value: leadStats?.week || 0, icon: TrendingUp },
      { label: "This Month", value: leadStats?.month || 0, icon: Target },
      { label: "This Year", value: leadStats?.year || 0, icon: Users },
    ],
    [leadStats]
  );

  const leadTrend = useMemo(
    () =>
      (leadStats?.last30days || []).map((item) => ({
        label: formatCompactDate(item._id),
        value: item.count || 0,
      })),
    [leadStats]
  );

  const leadStatuses = useMemo(
    () =>
      [...(leadStats?.byStatus || [])]
        .sort((a, b) => (b.count || 0) - (a.count || 0))
        .slice(0, 5)
        .map((item) => ({
          label: item._id || "Unknown",
          value: item.count || 0,
        })),
    [leadStats]
  );

  const mailMetrics = useMemo(
    () => [
      { label: "Total Mails", value: mailStats?.total || 0, icon: Mail },
      { label: "Unread", value: mailStats?.unread || 0, icon: Sparkles },
      { label: "Sent", value: mailStats?.byStatus?.sent || 0, icon: MailCheck },
      { label: "Failed", value: mailStats?.byStatus?.failed || 0, icon: Target },
    ],
    [mailStats]
  );

  const mailStatuses = useMemo(() => {
    if (!mailStats?.byStatus) {
      return [];
    }

    return Object.entries(mailStats.byStatus)
      .map(([label, value]) => ({ label, value: value || 0 }))
      .sort((a, b) => b.value - a.value);
  }, [mailStats]);

  const mailTrend = useMemo(
    () =>
      (mailDaily || []).map((item) => ({
        label: formatCompactDate(item.date),
        value: item.total || 0,
      })),
    [mailDaily]
  );

  const activeMetrics = activeView === "lead" ? leadMetrics : mailMetrics;
  const activeTrend = activeView === "lead" ? leadTrend : mailTrend;
  const activeStatuses = activeView === "lead" ? leadStatuses : mailStatuses;
  const totalCount = activeView === "lead" ? leadStats?.total || 0 : mailStats?.total || 0;
  const statusToneMap = activeView === "lead" ? leadStatusToneMap : mailStatusToneMap;

  const headlineStats =
    activeView === "lead"
      ? [
          { label: "Total Leads", value: totalCount },
          { label: "Top Status", value: leadStatuses[0]?.label || "--" },
        ]
      : [
          { label: "Total Mails", value: totalCount },
          { label: "Unread Queue", value: mailStats?.unread || 0 },
        ];

  if (loading) {
    return (
      <div className="crm-card flex min-h-[340px] items-center justify-center p-8 text-center text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="crm-card flex min-h-[340px] flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-lg font-semibold text-slate-900">{error}</p>
        <Button type="button" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="crm-card relative overflow-hidden border-white/80 p-6 md:p-8">
        <div className={`absolute inset-0 bg-gradient-to-br ${viewTheme.softAccent} opacity-90`} />
        <div className="absolute inset-0 crm-mesh opacity-25" />
        <div className="crm-float absolute -right-10 top-10 h-40 w-40 rounded-full bg-white/50 blur-3xl" />
        <div className="crm-float-delayed absolute bottom-0 left-8 h-28 w-28 rounded-full bg-white/40 blur-3xl" />

        <div className="relative space-y-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-2xl">
              <Badge className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.26em] ${viewTheme.badgeClass}`}>
                {viewTheme.eyebrow}
              </Badge>
              <h3 className="mt-4 max-w-xl text-3xl font-extrabold leading-tight text-slate-950 md:text-4xl">
                {viewTheme.headline}
              </h3>
              <p className="mt-3 max-w-xl text-base text-slate-600 md:text-lg">
                {viewTheme.description}
              </p>
            </div>

            <div className="crm-fade-up rounded-[28px] border border-white/80 bg-white/80 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="grid gap-2 sm:grid-cols-2">
                <ViewButton
                  active={activeView === "lead"}
                  activeClassName={VIEW_CONFIG.lead.chipClass}
                  inactiveClassName={VIEW_CONFIG.lead.ghostChipClass}
                  title="Lead View"
                  subtitle="Pipeline velocity"
                  onClick={() => setActiveView("lead")}
                />
                <ViewButton
                  active={activeView === "mail"}
                  activeClassName={VIEW_CONFIG.mail.chipClass}
                  inactiveClassName={VIEW_CONFIG.mail.ghostChipClass}
                  title="Mail View"
                  subtitle="Delivery performance"
                  onClick={() => setActiveView("mail")}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className={`crm-fade-up rounded-[28px] bg-gradient-to-r ${viewTheme.accent} p-[1px] shadow-[0_26px_60px_rgba(15,23,42,0.14)]`}>
              <div className="rounded-[27px] bg-[#0f1720]/88 px-6 py-6 text-white backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-white/65">
                      {viewTheme.label}
                    </p>
                    <p className="mt-3 text-4xl font-extrabold">{totalCount}</p>
                    <p className="mt-2 max-w-md text-sm text-white/72">
                      {activeView === "lead"
                        ? "A compact picture of lead flow, from fresh entries to current engagement bands."
                        : "A fast snapshot of mail throughput, unread pressure, and send reliability."}
                    </p>
                  </div>

                  <Button
                    type="button"
                    className={`rounded-2xl px-5 ${viewTheme.buttonClass}`}
                    onClick={() => navigate(activeView === "lead" ? "/leads" : "/mails")}
                  >
                    Open {activeView === "lead" ? "Leads" : "Mail"}
                    <ArrowRight size={16} />
                  </Button>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {headlineStats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[20px] border border-white/12 bg-white/10 px-4 py-4 transition-transform duration-300 hover:-translate-y-1"
                    >
                      <p className="text-xs uppercase tracking-[0.22em] text-white/60">{item.label}</p>
                      <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {activeMetrics.map(({ label, value, icon: Icon }, index) => (
                <Card
                  key={label}
                  className="crm-fade-up crm-card border-white/70 bg-white/85 shadow-none transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(15,23,42,0.08)]"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <CardContent className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-sm font-semibold text-slate-600">{label}</p>
                      <p className="mt-3 text-3xl font-extrabold text-slate-900">{value}</p>
                    </div>
                    <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${viewTheme.softAccent} text-slate-800`}>
                      <Icon size={18} />
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
        <Card className="crm-card border-white/75 shadow-none">
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Trendline</p>
                <h4 className="mt-1 text-xl font-bold text-slate-900">
                  {activeView === "lead" ? "Lead activity trend" : "Mail volume trend"}
                </h4>
              </div>
              <Badge variant="secondary" className={`rounded-full ${viewTheme.badgeClass}`}>
                Last 30 Days
              </Badge>
            </div>

            <MeasuredChart className="h-[290px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeTrend}>
                  <defs>
                    <linearGradient id="dashboardGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={viewTheme.fillStart} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={viewTheme.fillEnd} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(94,106,115,0.12)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fill: "#5E6A73", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "#5E6A73", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid rgba(217,211,199,0.9)",
                      boxShadow: "0 20px 50px rgba(15,23,42,0.12)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={viewTheme.stroke}
                    strokeWidth={3}
                    fill="url(#dashboardGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </MeasuredChart>
          </CardContent>
        </Card>

        <Card className="crm-card border-white/75 shadow-none">
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Distribution</p>
                <h4 className="mt-1 text-xl font-bold text-slate-900">
                  {activeView === "lead" ? "Top lead statuses" : "Mail status mix"}
                </h4>
              </div>
              <Sparkles className="text-slate-400" size={18} />
            </div>

            {activeStatuses.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                No data available for this view yet.
              </div>
            ) : (
              <div className="space-y-4">
                <MeasuredChart className="h-[210px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeStatuses}>
                      <CartesianGrid stroke="rgba(94,106,115,0.08)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: "#5E6A73", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fill: "#5E6A73", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "16px",
                          border: "1px solid rgba(217,211,199,0.9)",
                        }}
                      />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]} fill={viewTheme.stroke} />
                    </BarChart>
                  </ResponsiveContainer>
                </MeasuredChart>

                <div className="space-y-3">
                  {activeStatuses.slice(0, 4).map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-[18px] border border-slate-200 bg-white/90 px-4 py-3 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${statusToneMap[item.label] || "bg-slate-100 text-slate-700"}`}>
                        {item.label}
                      </span>
                      <strong className="text-slate-900">{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function ViewButton({ active, activeClassName, inactiveClassName, title, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-[22px] px-4 py-4 text-left transition-all duration-300",
        active ? activeClassName : inactiveClassName,
      ].join(" ")}
    >
      <div className="text-sm font-semibold">{title}</div>
      <div className={`mt-1 text-xs ${active ? "text-white/72" : "text-slate-500"}`}>{subtitle}</div>
    </button>
  );
}

function MeasuredChart({ className, children }) {
  const containerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return undefined;
    }

    const updateSize = () => {
      const hasSize = node.clientWidth > 0 && node.clientHeight > 0;
      setIsReady(hasSize);
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {isReady ? children : null}
    </div>
  );
}
