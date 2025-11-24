import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
  Legend,
} from "recharts";
import { SetupSlice } from "../types";

const COLORS = ["#2dd4bf", "#38bdf8", "#f472b6", "#fbbf24", "#a78bfa", "#fb7185"];

interface Props {
  data: SetupSlice[];
}

export const SetupPieChart = ({ data }: Props) => (
  <div className="glass-panel h-80">
    <p className="card-title">Setup distribution</p>
    {data.length === 0 ? (
      <p className="mt-6 text-sm text-slate-400">
        Chưa có dữ liệu setup để vẽ biểu đồ.
      </p>
    ) : (
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ name, percent = 0 }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )}
  </div>
);

