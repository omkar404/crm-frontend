import { useEffect, useState } from "react";
import api from "../api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get("/api/auth/dashboard-stats")
      .then((r) => setStats(r.data))
      .catch(() => setStats(null));
  }, []);

  // ----------- Stat Card (Today, Week, Month, Year, Total) -----------
  const StatCard = ({ label, value }) => (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  if (!stats)
    return (
      <div className="p-6 text-center text-gray-500">
        Loading dashboard...
      </div>
    );

  return (
    <div className="space-y-8 p-4">

      {/* ---------- TOP STATS ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Today" value={stats.today} />
        <StatCard label="This Week" value={stats.week} />
        <StatCard label="This Month" value={stats.month} />
        <StatCard label="This Year" value={stats.year} />
        <StatCard label="Total Leads" value={stats.total} />
      </div>

      {/* ---------- LEAD STATUS BREAKDOWN ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stats.byStatus?.length === 0 && (
            <div className="text-gray-500">No data available</div>
          )}

          {stats.byStatus?.map((s) => (
            <div
              key={s._id}
              className="flex justify-between border-b py-1 text-sm"
            >
              <span>{s._id || "Unknown"}</span>
              <strong>{s.count}</strong>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ---------- LEADS OVER TIME CHART ---------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Leads Over Time <Badge variant="secondary">Last 30 Days</Badge>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.last30days}>
                <defs>
                  <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis allowDecimals={false} />
                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#leadGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

