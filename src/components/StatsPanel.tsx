import { StatsSummary } from "../types";
import { formatCurrency, formatPercent } from "../utils/format";
import { GlossaryTooltip } from "./GlossaryTooltip";

interface Props {
  stats: StatsSummary;
  currency: string;
}

export const StatsPanel = ({ stats, currency }: Props) => {
  const summaryItems = [
    {
      label: "Winrate",
      value: formatPercent(stats.winRate),
      definition:
        "Tỷ lệ % số lệnh có P&L dương. Cao nhưng R âm vẫn chưa chắc kiếm tiền.",
    },
    {
      label: "Average R",
      value: `${stats.averageR.toFixed(2)}R`,
      definition: "Trung bình mỗi lệnh kiếm được bao nhiêu đơn vị risk (R).",
      example: "Average R = 0.6 nghĩa là mỗi lệnh kiếm 0.6 lần risk.",
    },
    {
      label: "Max DD",
      value: formatPercent(stats.maxDrawdown),
      definition:
        "Drawdown lớn nhất tính từ đỉnh equity. Đây là worst-case tâm lý bạn từng trải qua.",
    },
    {
      label: "Max consecutive wins",
      value: stats.maxConsecutiveWins,
      definition: "Chuỗi lệnh thắng dài nhất. Hữu ích để thiết lập rule giảm hưng phấn.",
    },
    {
      label: "Max consecutive losses",
      value: stats.maxConsecutiveLosses,
      definition:
        "Chuỗi lệnh thua dài nhất. Dùng để đặt rule dừng trade sau X lệnh thua.",
    },
  ];

  return (
    <section className="glass-panel space-y-4">
      <p className="card-title">Hiệu suất tổng quan</p>
      <div className="grid gap-4 md:grid-cols-3">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <p className="text-xs uppercase text-slate-400">
              <GlossaryTooltip
                term={item.label}
                definition={item.definition}
                example={item.example}
              />
            </p>
            <p className="text-xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {stats.bestTrade && (
          <HighlightCard
            title="Best trade"
            subtitle={stats.bestTrade.asset}
            value={`${stats.bestTrade.rMultiple.toFixed(2)}R`}
            pnl={formatCurrency(stats.bestTrade.pnl, currency)}
          />
        )}
        {stats.worstTrade && (
          <HighlightCard
            title="Worst trade"
            subtitle={stats.worstTrade.asset}
            value={`${stats.worstTrade.rMultiple.toFixed(2)}R`}
            pnl={formatCurrency(stats.worstTrade.pnl, currency)}
          />
        )}
      </div>
      <p className="text-xs text-slate-500">
        Drawdown đo bằng % hụt so với đỉnh equity gần nhất – nhớ theo dõi con số
        này mỗi ngày để biết khi nào cần giảm size.
      </p>
    </section>
  );
};

const HighlightCard = ({
  title,
  subtitle,
  value,
  pnl,
}: {
  title: string;
  subtitle: string;
  value: string;
  pnl: string;
}) => (
  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent px-4 py-4">
    <p className="text-xs uppercase text-slate-400">{title}</p>
    <p className="text-lg font-semibold text-white">{subtitle}</p>
    <p className="text-3xl font-bold text-teal-200">{value}</p>
    <p className="text-sm text-slate-400">{pnl}</p>
  </div>
);

