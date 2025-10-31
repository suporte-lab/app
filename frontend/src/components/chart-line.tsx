import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function ChartLine({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <div className="aspect-16/6 w-full **:focus:outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          {/* light muted grid */}
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          {/* clean axis with muted labels */}
          <XAxis
            dataKey="name"
            tick={{
              fill: "var(--muted-foreground)",
              fontSize: 12,
              fontWeight: 500,
            }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          {/* tooltip styled like a shadcn card */}
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              boxShadow: "var(--shadow-sm)",
            }}
            labelStyle={{ color: "var(--muted-foreground)" }}
            itemStyle={{ color: "var(--foreground)" }}
          />
          {/* accent line */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{
              r: 4,
              fill: "var(--primary)",
              strokeWidth: 2,
              stroke: "white",
            }}
            activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
