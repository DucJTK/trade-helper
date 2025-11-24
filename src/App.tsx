import { useEffect, useMemo, useState } from "react";
import {
  DashboardOverview,
} from "./components/DashboardOverview";
import { EquityChart } from "./components/EquityChart";
import { Header } from "./components/Header";
import { HistogramChart } from "./components/HistogramChart";
import { RiskCalculatorCard } from "./components/RiskCalculatorCard";
import { SettingsForm } from "./components/SettingsForm";
import { MobileSidebar, Sidebar } from "./components/Sidebar";
import { StatsPanel } from "./components/StatsPanel";
import { SetupPieChart } from "./components/SetupPieChart";
import { TradeForm, TradePayload } from "./components/TradeForm";
import { TradesTable } from "./components/TradesTable";
import { useLocalStorageState } from "./hooks/useLocalStorageState";
import {
  DEFAULT_SETTINGS,
  Settings,
  TabKey,
  ThemeMode,
  Trade,
  TradeFilters,
} from "./types";
import {
  calculateStats,
  filterTradesByRange,
  StatsRange,
  sumPnLForDay,
  sumPnLForMonth,
  sumPnLForWeek,
} from "./utils/stats";

const DEFAULT_FILTERS: TradeFilters = {
  asset: "",
  tag: "",
  outcome: "all",
  sortBy: "date",
  sortDirection: "desc",
};

const TAB_LABELS: Record<TabKey, string> = {
  dashboard: "Dashboard",
  risk: "Risk Calculator",
  journal: "Trade Journal",
  stats: "Stats & Charts",
  settings: "Settings",
};

const StatsRanges: { key: StatsRange; label: string }[] = [
  { key: "all", label: "All trades" },
  { key: "last50", label: "Last 50 trades" },
  { key: "last20", label: "Last 20 trades" },
  { key: "last3m", label: "Last 3 months" },
];

const App = () => {
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [theme, setTheme] = useLocalStorageState<ThemeMode>("prm-theme", "dark");
  const [settings, setSettings] = useLocalStorageState<Settings>(
    "prm-settings",
    DEFAULT_SETTINGS,
  );
  const [trades, setTrades] = useLocalStorageState<Trade[]>("prm-trades", []);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [filters, setFilters] = useState<TradeFilters>(DEFAULT_FILTERS);
  const [statsRange, setStatsRange] = useState<StatsRange>("all");
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const stats = useMemo(() => calculateStats(trades, settings), [trades, settings]);

  const rangeTrades = useMemo(
    () => filterTradesByRange(trades, statsRange),
    [trades, statsRange],
  );
  const rangeStats = useMemo(
    () => calculateStats(rangeTrades, settings),
    [rangeTrades, settings],
  );

  const todayPnL = useMemo(() => sumPnLForDay(trades, new Date()), [trades]);
  const weeklyPnL = useMemo(() => sumPnLForWeek(trades, new Date()), [trades]);
  const monthlyPnL = useMemo(() => sumPnLForMonth(trades, new Date()), [trades]);
  const monthlyPercent =
    settings.currentAccountBalance === 0
      ? 0
      : (monthlyPnL / settings.currentAccountBalance) * 100;

  const dailyLimitAmount =
    settings.currentAccountBalance * (settings.maxDailyLossPercent / 100);
  const weeklyLimitAmount =
    settings.currentAccountBalance * (settings.maxWeeklyLossPercent / 100);

  const handleSaveSettings = (nextSettings: Settings) => {
    setSettings(nextSettings);
  };

  const handleTradeSubmit = (payload: TradePayload, id?: string) => {
    const parsedTags = payload.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const timestampISO = new Date(payload.timestamp).toISOString();
    const riskPerUnit =
      payload.direction === "Long"
        ? payload.entryPrice - payload.stopLossPrice
        : payload.stopLossPrice - payload.entryPrice;
    const pnlPerUnit =
      payload.direction === "Long"
        ? payload.closePrice - payload.entryPrice
        : payload.entryPrice - payload.closePrice;
    const riskAmount = Math.abs(riskPerUnit) * payload.size;
    const pnl = pnlPerUnit * payload.size;
    const pnlPercent =
      payload.entryPrice === 0
        ? 0
        : (pnl / (payload.entryPrice * payload.size)) * 100;
    // R multiple tells us bao nhiêu lần risk đã đạt được.
    const rMultiple = riskAmount === 0 ? 0 : pnl / riskAmount;

    const newTrade: Trade = {
      id: id || crypto.randomUUID(),
      timestamp: timestampISO,
      asset: payload.asset,
      direction: payload.direction,
      entryPrice: payload.entryPrice,
      stopLossPrice: payload.stopLossPrice,
      takeProfitPrice: payload.takeProfitPrice,
      size: payload.size,
      closePrice: payload.closePrice,
      pnl,
      pnlPercent,
      riskAmount,
      rMultiple,
      setup: payload.setup || "General",
      tags: parsedTags,
      notes: payload.notes,
    };

    setTrades((prev) => {
      if (id) {
        return prev.map((trade) => (trade.id === id ? newTrade : trade));
      }
      return [...prev, newTrade];
    });
    setEditingTrade(null);
  };

  const handleDeleteTrade = (id: string) => {
    setTrades((prev) => prev.filter((trade) => trade.id !== id));
    if (editingTrade?.id === id) setEditingTrade(null);
  };

  const renderTabContent = () => {
    switch (tab) {
      case "dashboard":
        return (
          <DashboardOverview
            settings={settings}
            dailyPnL={todayPnL}
            weeklyPnL={weeklyPnL}
            dailyLimitAmount={dailyLimitAmount}
            weeklyLimitAmount={weeklyLimitAmount}
          />
        );
      case "risk":
        return <RiskCalculatorCard settings={settings} />;
      case "journal":
        return (
          <div className="space-y-6">
            <TradeForm
              editingTrade={editingTrade}
              onSubmit={handleTradeSubmit}
              onCancelEdit={() => setEditingTrade(null)}
            />
            <TradesTable
              trades={trades}
              filters={filters}
              onChangeFilters={setFilters}
              onEdit={setEditingTrade}
              onDelete={handleDeleteTrade}
              currency={settings.currency}
            />
          </div>
        );
      case "stats":
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="card-title">Khoảng thống kê</p>
              <select
                value={statsRange}
                onChange={(event) =>
                  setStatsRange(event.target.value as StatsRange)
                }
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white outline-none"
              >
                {StatsRanges.map((range) => (
                  <option key={range.key} value={range.key}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
            <StatsPanel stats={rangeStats} currency={settings.currency} />
            <div className="grid gap-6 lg:grid-cols-2">
              <EquityChart
                data={rangeStats.equityCurve}
                currency={settings.currency}
              />
              <HistogramChart data={rangeStats.histogram} />
            </div>
            <SetupPieChart data={rangeStats.setupBreakdown} />
          </div>
        );
      case "settings":
        return <SettingsForm settings={settings} onSave={handleSaveSettings} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="flex">
        <Sidebar selected={tab} onSelect={setTab} />
        {isMobileNavOpen && (
          <MobileSidebar
            selected={tab}
            onSelect={setTab}
            onClose={() => setMobileNavOpen(false)}
          />
        )}
        <div className="flex-1">
          <Header
            settings={settings}
            theme={theme}
            onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
            onOpenMobileNav={() => setMobileNavOpen(true)}
            monthlyPnL={monthlyPnL}
            monthlyPercent={monthlyPercent}
            currentDrawdown={stats.currentDrawdown}
          />
          <main className="space-y-6 px-4 py-6 sm:px-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-200">
                {TAB_LABELS[tab]}
              </h2>
              <p className="text-xs text-slate-500">
                Dữ liệu lưu cục bộ trên trình duyệt (localStorage).
              </p>
            </div>
            {renderTabContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;

