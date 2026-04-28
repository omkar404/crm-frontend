import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

const CHART_COLORS = [
  "#0f766e",
  "#14b8a6",
  "#f59e0b",
  "#f97316",
  "#0ea5e9",
  "#2563eb",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#84cc16",
  "#475569",
  "#22c55e",
  "#c2410c",
];

export default function StackedBarChart({
  data,
  statuses,
  title,
  description = "Category split across the selected summary dimension.",
}) {
  return (
    <div className="crm-card border-white/75 p-5 shadow-none">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>

      <div style={{ width: "100%", height: 360 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 12 }}>
            <CartesianGrid stroke="rgba(94,106,115,0.10)" vertical={false} />
            <XAxis
              dataKey="_id"
              tick={{ fontSize: 11, fill: "#5E6A73" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#5E6A73" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid rgba(217,211,199,0.9)",
                boxShadow: "0 20px 45px rgba(15,23,42,0.10)",
              }}
            />
            <Legend />

            {statuses.map((status, index) => (
              <Bar
                key={status}
                dataKey={status}
                stackId="summary"
                radius={index === statuses.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
