import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function StackedBarChart({ data, statuses, title }) {
  return (
    <div className="p-4 bg-white rounded-xl border shadow">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>

      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Legend />

            {statuses.map((s, index) => (
              <Bar
                key={s}
                dataKey={s}
                stackId="a"
                fill={`hsl(${(index * 35) % 360}, 60%, 55%)`}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
