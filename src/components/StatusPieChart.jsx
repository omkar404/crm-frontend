import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function StatusPieChart({ summary, title }) {
  const COLORS = [
    "#6366F1",
    "#F59E0B",
    "#10B981",
    "#EF4444",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F97316",
    "#4B5563",
    "#84CC16",
    "#A855F7",
  ];

  const data = Object.keys(summary)
    .filter((key) => key !== "Total" && summary[key] > 0)
    .map((key) => ({ name: key, value: summary[key] }));

  return (
    <div className="p-4 bg-white rounded-xl border shadow">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>

      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              dataKey="value"
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={120}
              label
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
