import { Settings } from "../types";
import { formatCurrency, formatPercent } from "../utils/format";
import { GlossaryTooltip } from "./GlossaryTooltip";

interface DashboardOverviewProps {
  settings: Settings;
  dailyPnL: number;
  weeklyPnL: number;
  dailyLimitAmount: number;
  weeklyLimitAmount: number;
}

export const DashboardOverview = ({
  settings,
  dailyPnL,
  weeklyPnL,
  dailyLimitAmount,
  weeklyLimitAmount,
}: DashboardOverviewProps) => {
  const dailyUsage =
    dailyLimitAmount === 0 ? 0 : Math.min(Math.abs(dailyPnL) / dailyLimitAmount, 1);
  const weeklyUsage =
    weeklyLimitAmount === 0
      ? 0
      : Math.min(Math.abs(weeklyPnL) / weeklyLimitAmount, 1);
  const currency = settings.currency;

  const limitTriggered =
    Math.abs(dailyPnL) >= dailyLimitAmount && dailyLimitAmount > 0;

  return (
    <section className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-panel">
          <p className="card-title">
            <GlossaryTooltip
              term="P&L hôm nay"
              definition="Tổng lời/lỗ các lệnh đã đóng trong ngày hiện tại."
              example="Win 200$, lose 50$ → P&L = +150$."
            />
          </p>
          <p
            className={`mt-2 text-3xl font-semibold ${
              dailyPnL >= 0 ? "text-emerald-300" : "text-rose-400"
            }`}
          >
            {formatCurrency(dailyPnL, currency)}
          </p>
          <p className="text-sm text-slate-400">
            Đã sử dụng {formatPercent(dailyUsage * 100)} quota lỗ ngày (
            {settings.maxDailyLossPercent}% tối đa).
          </p>
          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-all ${
                limitTriggered ? "bg-rose-500" : "bg-teal-400"
              }`}
              style={{ width: `${dailyUsage * 100}%` }}
            />
          </div>
          {limitTriggered && (
            <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
              Bạn đã chạm max daily loss. Hãy dừng trade hôm nay.
            </div>
          )}
        </div>
        <div className="glass-panel">
          <p className="card-title">
            <GlossaryTooltip
              term="P&L tuần"
              definition="Tổng lời/lỗ các lệnh đóng trong tuần (Thứ 2 → Chủ nhật)."
            />
          </p>
          <p
            className={`mt-2 text-3xl font-semibold ${
              weeklyPnL >= 0 ? "text-emerald-300" : "text-rose-400"
            }`}
          >
            {formatCurrency(weeklyPnL, currency)}
          </p>
          <p className="text-sm text-slate-400">
            So với giới hạn tuần {settings.maxWeeklyLossPercent}% (
            {formatCurrency(weeklyLimitAmount, currency)}).
          </p>
          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-amber-300 transition-all"
              style={{ width: `${weeklyUsage * 100}%` }}
            />
          </div>
        </div>
      </div>
      <div className="glass-panel">
        <p className="card-title">
          <GlossaryTooltip
            term="Rule nhắc nhở"
            definition="Checklist kỷ luật bạn phải đọc lại mỗi ngày trước khi trade."
          />
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          <li>• Không risk &gt; {settings.defaultRiskPerTradePercent}% mỗi lệnh.</li>
          <li>• Không revenge trade kể cả khi lỗ chuỗi.</li>
          <li>• Dừng sau 3 lệnh thua liên tiếp để tránh tilt.</li>
        </ul>
      </div>
    </section>
  );
};

