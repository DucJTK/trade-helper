export type ThemeMode = "light" | "dark";

export interface Settings {
  initialAccountBalance: number;
  currentAccountBalance: number;
  defaultRiskPerTradePercent: number;
  maxDailyLossPercent: number;
  maxWeeklyLossPercent: number;
  currency: string;
}

export const DEFAULT_SETTINGS: Settings = {
  initialAccountBalance: 10000,
  currentAccountBalance: 10000,
  defaultRiskPerTradePercent: 1,
  maxDailyLossPercent: 3,
  maxWeeklyLossPercent: 6,
  currency: "USD",
};

export type TradeDirection = "Long" | "Short";
export type TradeOutcome = "win" | "loss" | "breakeven";

export interface Trade {
  id: string;
  timestamp: string;
  asset: string;
  direction: TradeDirection;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice?: number;
  size: number;
  closePrice: number;
  pnl: number;
  pnlPercent: number;
  riskAmount: number;
  rMultiple: number;
  setup: string;
  tags: string[];
  notes?: string;
}

export interface TradeFilters {
  asset: string;
  outcome: "all" | TradeOutcome;
  tag: string;
  sortBy: "date" | "pnl" | "rMultiple";
  sortDirection: "asc" | "desc";
}

export interface EquityPoint {
  label: string;
  balance: number;
  timestamp: string;
}

export interface HistogramBucket {
  range: string;
  count: number;
}

export interface SetupSlice {
  name: string;
  value: number;
}

export interface StatsSummary {
  winRate: number;
  averageR: number;
  bestTrade?: Trade;
  worstTrade?: Trade;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  maxDrawdown: number;
  currentDrawdown: number;
  equityCurve: EquityPoint[];
  histogram: HistogramBucket[];
  setupBreakdown: SetupSlice[];
}

export type TabKey =
  | "dashboard"
  | "risk"
  | "journal"
  | "stats"
  | "settings";

