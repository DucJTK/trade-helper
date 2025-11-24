import { Menu, Moon, Sun } from "lucide-react";
import { formatCurrency, formatPercent } from "../utils/format";
import { Settings, ThemeMode } from "../types";
import { GlossaryTooltip } from "./GlossaryTooltip";

interface HeaderProps {
  settings: Settings;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenMobileNav?: () => void;
  monthlyPnL: number;
  monthlyPercent: number;
  currentDrawdown: number;
}

export const Header = ({
  settings,
  theme,
  onToggleTheme,
  onOpenMobileNav,
  monthlyPnL,
  monthlyPercent,
  currentDrawdown,
}: HeaderProps) => {
  const balanceLabel = formatCurrency(
    settings.currentAccountBalance,
    settings.currency,
  );

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 bg-slate-900/70 px-6 py-4 backdrop-blur">
      <div className="flex w-full items-center justify-between gap-3 md:w-auto">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-teal-300">
            Pro Risk Manager
          </p>
          <h1 className="text-2xl font-semibold text-white">Control the risk.</h1>
          <p className="text-sm text-slate-400">
            Tuân thủ kỷ luật để tồn tại lâu hơn trên thị trường.
          </p>
        </div>
        <button
          type="button"
          className="rounded-2xl border border-white/10 p-2 text-white md:hidden"
          onClick={onOpenMobileNav}
          aria-label="Mở menu"
        >
          <Menu size={20} />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="rounded-2xl border border-white/10 px-4 py-2">
          <p className="text-slate-400">
            <GlossaryTooltip
              term="Tổng vốn hiện tại"
              definition="Equity bạn đang nắm – bao gồm cash + PnL chưa chốt. Đây là cơ sở để tính % risk."
              example="Ví dụ đang có 12.500 USDT trên sàn."
            />
          </p>
          <p className="text-lg font-semibold text-white">{balanceLabel}</p>
        </div>
        <div className="rounded-2xl border border-white/10 px-4 py-2">
          <p className="text-slate-400">
            <GlossaryTooltip
              term="% lãi/lỗ tháng"
              definition="Tổng P&L tháng này chia cho current balance. Cho biết tháng đó đang outperform hay drawdown."
            />
          </p>
          <p
            className={`text-lg font-semibold ${
              monthlyPnL >= 0 ? "text-emerald-300" : "text-rose-400"
            }`}
          >
            {formatPercent(monthlyPercent)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 px-4 py-2">
          <p className="text-slate-400">
            <GlossaryTooltip
              term="Drawdown hiện tại"
              definition="Mức giảm % so với đỉnh equity gần nhất. Quá cao → phải giảm size hoặc nghỉ."
              example="Balance từng đạt 20k, giờ còn 18k → DD = 10%."
            />
          </p>
          <p className="text-lg font-semibold text-rose-400">
            {formatPercent(currentDrawdown)}
          </p>
        </div>
        <button
          onClick={onToggleTheme}
          className="rounded-full border border-white/10 p-3 text-slate-200 transition hover:border-white/40"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
};

