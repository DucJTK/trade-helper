import { deriveOutcome } from "../utils/stats";
import { formatCurrency, formatPercent } from "../utils/format";
import { Trade, TradeFilters } from "../types";
import { GlossaryTooltip } from "./GlossaryTooltip";

interface TradesTableProps {
  trades: Trade[];
  filters: TradeFilters;
  onChangeFilters: (filters: TradeFilters) => void;
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  currency: string;
}

export const TradesTable = ({
  trades,
  filters,
  onChangeFilters,
  onEdit,
  onDelete,
  currency,
}: TradesTableProps) => {
  const columns = [
    { key: "date", label: "Ngày" },
    { key: "asset", label: "Asset" },
    { key: "type", label: "Type" },
    { key: "size", label: "Size" },
    { key: "entry", label: "Entry" },
    { key: "close", label: "Close" },
    {
      key: "pnl",
      label: "PnL",
      tooltip: {
        term: "PnL",
        definition: "Profit & Loss – kết quả lời/lỗ của lệnh.",
      },
    },
    {
      key: "r",
      label: "R",
      tooltip: {
        term: "R multiple",
        definition:
          "PnL chia cho tiền risk ban đầu. +1R nghĩa là lời đúng bằng risk đặt ra.",
        example: "Risk 100$, lời 250$ → R = +2.5.",
      },
    },
    { key: "setup", label: "Setup" },
    { key: "tags", label: "Tags" },
    { key: "actions", label: "Actions" },
  ];

  const filtered = trades
    .filter((trade) =>
      filters.asset
        ? trade.asset.toLowerCase().includes(filters.asset.toLowerCase())
        : true,
    )
    .filter((trade) =>
      filters.tag
        ? trade.tags.some((tag) =>
            tag.toLowerCase().includes(filters.tag.toLowerCase()),
          )
        : true,
    )
    .filter((trade) =>
      filters.outcome === "all"
        ? true
        : deriveOutcome(trade) === filters.outcome,
    )
    .sort((a, b) => {
      const direction = filters.sortDirection === "asc" ? 1 : -1;
      if (filters.sortBy === "date") {
        return (
          (new Date(a.timestamp).getTime() -
            new Date(b.timestamp).getTime()) * direction
        );
      }
      if (filters.sortBy === "pnl") {
        return (a.pnl - b.pnl) * direction;
      }
      return (a.rMultiple - b.rMultiple) * direction;
    });

  return (
    <section className="glass-panel space-y-4">
      <div className="flex flex-wrap gap-3 text-sm text-slate-300">
        <input
          placeholder="Filter asset"
          value={filters.asset}
          onChange={(event) =>
            onChangeFilters({ ...filters, asset: event.target.value })
          }
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 outline-none"
        />
        <input
          placeholder="Filter tag"
          value={filters.tag}
          onChange={(event) =>
            onChangeFilters({ ...filters, tag: event.target.value })
          }
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 outline-none"
        />
        <select
          value={filters.outcome}
          onChange={(event) =>
            onChangeFilters({
              ...filters,
              outcome: event.target.value as TradeFilters["outcome"],
            })
          }
          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 outline-none"
        >
          <option value="all">All results</option>
          <option value="win">Win</option>
          <option value="loss">Loss</option>
          <option value="breakeven">Breakeven</option>
        </select>
        <select
          value={filters.sortBy}
          onChange={(event) =>
            onChangeFilters({
              ...filters,
              sortBy: event.target.value as TradeFilters["sortBy"],
            })
          }
          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 outline-none"
        >
          <option value="date">Sort by date</option>
          <option value="pnl">Sort by PnL</option>
          <option value="rMultiple">Sort by R</option>
        </select>
        <select
          value={filters.sortDirection}
          onChange={(event) =>
            onChangeFilters({
              ...filters,
              sortDirection: event.target.value as TradeFilters["sortDirection"],
            })
          }
          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 outline-none"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase text-slate-400">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3">
                  {column.tooltip ? (
                    <GlossaryTooltip
                      term={column.label}
                      definition={column.tooltip.definition}
                      example={column.tooltip.example}
                    />
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((trade) => {
              const outcome = deriveOutcome(trade);
              const rowColor =
                outcome === "win"
                  ? "bg-emerald-400/5"
                  : outcome === "loss"
                    ? "bg-rose-400/5"
                    : "bg-white/0";
              return (
                <tr key={trade.id} className={`${rowColor} border-b border-white/5`}>
                  <td className="px-4 py-3 text-slate-300">
                    {new Date(trade.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">
                    {trade.asset}
                  </td>
                  <td className="px-4 py-3">{trade.direction}</td>
                  <td className="px-4 py-3">{trade.size.toFixed(2)}</td>
                  <td className="px-4 py-3">{trade.entryPrice.toFixed(2)}</td>
                  <td className="px-4 py-3">{trade.closePrice.toFixed(2)}</td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      trade.pnl >= 0 ? "text-emerald-300" : "text-rose-300"
                    }`}
                  >
                    {formatCurrency(trade.pnl, currency)} (
                    {formatPercent(trade.pnlPercent)})
                  </td>
                  <td className="px-4 py-3">{trade.rMultiple.toFixed(2)}R</td>
                  <td className="px-4 py-3">{trade.setup}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {trade.tags.join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        className="text-xs text-teal-300 underline"
                        onClick={() => onEdit(trade)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-xs text-rose-300 underline"
                        onClick={() => onDelete(trade.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-slate-400" colSpan={columns.length}>
                  Chưa có lệnh nào khớp với bộ lọc hiện tại.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

