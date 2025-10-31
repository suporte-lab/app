import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";

export function ChartBar({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <div className="aspect-16/6 w-full **:focus:outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 16, right: 0, left: 0, bottom: 0 }}
        >
          {/* light muted grid */}
          <CartesianGrid stroke="var(--color-blue-100)" strokeDasharray="3 3" />

          {/* clean axis with muted labels */}
          <XAxis
            dataKey="name"
            tick={{
              fill: "var(--color-blue-900)",
              fontSize: 12,
              fontWeight: 500,
            }}
            axisLine={{ stroke: "var(--color-blue-100)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--color-blue-900)", fontSize: 12 }}
            axisLine={{ stroke: "var(--color-blue-100)" }}
            tickLine={false}
          />

          {/* bar with number labels on top */}
          <Bar
            dataKey="value"
            fill="var(--color-blue-500)"
            radius={[12, 12, 0, 0]}
            maxBarSize={64}
          >
            <LabelList
              dataKey="value"
              position="top"
              style={{
                fill: "var(--color-blue-900)",
                fontSize: 14,
                fontWeight: 500,
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
