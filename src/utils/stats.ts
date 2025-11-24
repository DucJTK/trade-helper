import { format, isSameDay, isSameWeek, parseISO, subMonths } from "date-fns";
import {
  EquityPoint,
  HistogramBucket,
  Settings,
  StatsSummary,
  Trade,
  TradeOutcome,
} from "../types";

export type StatsRange = "last20" | "last50" | "last3m" | "all";

const HISTOGRAM_BUCKETS = [
  { label: "≤ -3R", threshold: -3 },
  { label: "-3R – -1R", threshold: -1 },
  { label: "-1R – 0R", threshold: 0 },
  { label: "0R – 1R", threshold: 1 },
  { label: "1R – 2R", threshold: 2 },
  { label: "2R – 3R", threshold: 3 },
  { label: "≥ 3R", threshold: Infinity },
];

export const deriveOutcome = (trade: Trade): TradeOutcome => {
  if (trade.pnl > 0) return "win";
  if (trade.pnl < 0) return "loss";
  return "breakeven";
};

export const calculateStats = (
  trades: Trade[],
  settings: Settings,
): StatsSummary => {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  const startingBalance =
    settings.currentAccountBalance || settings.initialAccountBalance;
  let runningBalance = startingBalance;
  let peakBalance = startingBalance;
  let maxDrawdown = 0;
  let currentDrawdown = 0;
  let streakWins = 0;
  let streakLosses = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let totalR = 0;
  let wins = 0;

  const equityCurve: EquityPoint[] = [
    {
      label: "Start",
      balance: Number(startingBalance.toFixed(2)),
      timestamp: new Date().toISOString(),
    },
  ];

  let bestTrade: Trade | undefined;
  let worstTrade: Trade | undefined;

  sorted.forEach((trade) => {
    runningBalance += trade.pnl;
    peakBalance = Math.max(peakBalance, runningBalance);
    // drawdown = % tụt khỏi đỉnh equity gần nhất -> luôn dương để dễ đọc.
    const drawdownPercent =
      peakBalance === 0
        ? 0
        : ((peakBalance - runningBalance) / peakBalance) * 100;
    currentDrawdown = drawdownPercent;
    maxDrawdown = Math.max(maxDrawdown, drawdownPercent);
    totalR += trade.rMultiple;
    if (trade.pnl > 0) {
      wins += 1;
      streakWins += 1;
      streakLosses = 0;
    } else if (trade.pnl < 0) {
      streakLosses += 1;
      streakWins = 0;
    } else {
      streakLosses = 0;
      streakWins = 0;
    }
    maxWinStreak = Math.max(maxWinStreak, streakWins);
    maxLossStreak = Math.max(maxLossStreak, streakLosses);
    if (!bestTrade || trade.rMultiple > bestTrade.rMultiple) {
      bestTrade = trade;
    }
    if (!worstTrade || trade.rMultiple < worstTrade.rMultiple) {
      worstTrade = trade;
    }
    equityCurve.push({
      label: format(parseISO(trade.timestamp), "MMM d"),
      balance: Number(runningBalance.toFixed(2)),
      timestamp: trade.timestamp,
    });
  });

  const histogram = buildHistogram(sorted);
  const setupBreakdown = buildSetupSlices(sorted);
  const totalTrades = sorted.length || 1;

  return {
    winRate: (wins / totalTrades) * 100,
    averageR: totalR / totalTrades,
    bestTrade,
    worstTrade,
    maxConsecutiveWins: maxWinStreak,
    maxConsecutiveLosses: maxLossStreak,
    maxDrawdown,
    currentDrawdown,
    equityCurve,
    histogram,
    setupBreakdown,
  };
};

const buildHistogram = (trades: Trade[]): HistogramBucket[] => {
  const buckets = HISTOGRAM_BUCKETS.map((bucket) => ({
    range: bucket.label,
    count: 0,
  }));
  trades.forEach((trade) => {
    const r = trade.rMultiple;
    if (r <= -3) buckets[0].count += 1;
    else if (r <= -1) buckets[1].count += 1;
    else if (r <= 0) buckets[2].count += 1;
    else if (r <= 1) buckets[3].count += 1;
    else if (r <= 2) buckets[4].count += 1;
    else if (r <= 3) buckets[5].count += 1;
    else buckets[6].count += 1;
  });
  return buckets;
};

const buildSetupSlices = (trades: Trade[]) => {
  const map = new Map<string, number>();
  trades.forEach((trade) => {
    const key = trade.setup || "Unlabeled";
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries()).map(([name, value]) => ({
    name,
    value,
  }));
};

export const filterTradesByRange = (
  trades: Trade[],
  range: StatsRange,
): Trade[] => {
  if (range === "all") return trades;
  if (range === "last20") return trades.slice(-20);
  if (range === "last50") return trades.slice(-50);
  if (range === "last3m") {
    const threshold = subMonths(new Date(), 3);
    return trades.filter((trade) => parseISO(trade.timestamp) >= threshold);
  }
  return trades;
};

export const sumPnLForDay = (trades: Trade[], date: Date) =>
  trades
    .filter((trade) => isSameDay(parseISO(trade.timestamp), date))
    .reduce((acc, trade) => acc + trade.pnl, 0);

export const sumPnLForWeek = (trades: Trade[], date: Date) =>
  trades
    .filter((trade) =>
      isSameWeek(parseISO(trade.timestamp), date, { weekStartsOn: 1 }),
    )
    .reduce((acc, trade) => acc + trade.pnl, 0);

export const sumPnLForMonth = (trades: Trade[], date: Date) =>
  trades
    .filter(
      (trade) =>
        parseISO(trade.timestamp).getMonth() === date.getMonth() &&
        parseISO(trade.timestamp).getFullYear() === date.getFullYear(),
    )
    .reduce((acc, trade) => acc + trade.pnl, 0);

export const getDateRangeLabel = (range: StatsRange): string => {
  switch (range) {
    case "last20":
      return "Last 20 trades";
    case "last50":
      return "Last 50 trades";
    case "last3m":
      return "Last 3 months";
    default:
      return "All trades";
  }
};


