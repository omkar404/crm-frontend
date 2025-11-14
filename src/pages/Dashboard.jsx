import { useEffect, useMemo, useState } from "react";
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
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    api
      .get("/api/auth/list")
      .then((r) => {
        const arr = Array.isArray(r.data.leads) ? r.data.leads : [];
        setLeads(arr);
      })
      .catch(() => setLeads([]));
  }, []);

  const stats = useMemo(() => {
    const byStatus = {
      NEW: 0,
      CONTACTED: 0,
      QUALIFIED: 0,
      FAILED: 0,
      CONVERTED: 0,
    };

    leads.forEach((l) => {
      byStatus[l.status] = (byStatus[l.status] || 0) + 1;
    });

    return byStatus;
  }, [leads]);

  const chartData = useMemo(() => {
    const map = {};
    leads.forEach((l) => {
      if (!l.createdAt) return;
      const d = new Date(l.createdAt).toISOString().slice(0, 10);
      map[d] = (map[d] || 0) + 1;
    });

    return Object.entries(map)
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, count]) => ({ date, count }));
  }, [leads]);

  const Stat = ({ label, value }) => (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Stat label="New" value={stats.NEW} />
        <Stat label="Contacted" value={stats.CONTACTED} />
        <Stat label="Qualified" value={stats.QUALIFIED} />
        <Stat label="Failed" value={stats.FAILED} />
        <Stat label="Converted" value={stats.CONVERTED} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Leads Over Time <Badge variant="secondary">Daily</Badge>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-64 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#color)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
