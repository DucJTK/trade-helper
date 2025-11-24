import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { HistogramBucket } from "../types";

interface Props {
  data: HistogramBucket[];
}

export const HistogramChart = ({ data }: Props) => (
  <div className="glass-panel h-80">
    <p className="card-title">Histogram R multiple</p>
    <ResponsiveContainer width="100%" height="90%">
      <BarChart data={data}>
        <XAxis dataKey="range" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        />
        <Bar dataKey="count" fill="#f59e0b" radius={12} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

