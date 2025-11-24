import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EquityPoint } from "../types";
import { formatCurrency } from "../utils/format";

interface EquityChartProps {
  data: EquityPoint[];
  currency: string;
}

export const EquityChart = ({ data, currency }: EquityChartProps) => (
  <div className="glass-panel h-80">
    <p className="card-title">Equity curve</p>
    <ResponsiveContainer width="100%" height="90%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" stroke="#94a3b8" />
        <YAxis
          stroke="#94a3b8"
          tickFormatter={(value) => formatCurrency(value, currency)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          formatter={(value: number) => formatCurrency(value, currency)}
        />
        <Area
          type="monotone"
          dataKey="balance"
          stroke="#2dd4bf"
          fill="url(#equityGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

