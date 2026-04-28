import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
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
];

export default function StatusPieChart({
  summary,
  title,
  description = "Overall share of active statuses in the current summary dataset.",
}) {
  const data = Object.keys(summary || {})
    .filter((key) => key !== "Total" && summary[key] > 0)
    .map((key) => ({ name: key, value: summary[key] }));

  return (
    <div className="crm-card border-white/75 p-5 shadow-none">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>

      <div style={{ width: "100%", height: 360 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              dataKey="value"
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={118}
              paddingAngle={2}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid rgba(217,211,199,0.9)",
                boxShadow: "0 20px 45px rgba(15,23,42,0.10)",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
