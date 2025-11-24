import { FormEvent, useEffect, useState } from "react";
import { Trade, TradeDirection } from "../types";

export interface TradePayload {
  timestamp: string;
  asset: string;
  direction: TradeDirection;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice?: number;
  size: number;
  closePrice: number;
  setup: string;
  tags: string;
  notes: string;
}

interface TradeFormProps {
  editingTrade: Trade | null;
  onSubmit: (payload: TradePayload, editingId?: string) => void;
  onCancelEdit: () => void;
}

interface TradeFormState {
  timestamp: string;
  asset: string;
  direction: TradeDirection;
  entryPrice: string;
  stopLossPrice: string;
  takeProfitPrice: string;
  size: string;
  closePrice: string;
  setup: string;
  tags: string;
  notes: string;
}

const emptyForm: TradeFormState = {
  timestamp: new Date().toISOString().slice(0, 16),
  asset: "",
  direction: "Long",
  entryPrice: "",
  stopLossPrice: "",
  takeProfitPrice: "",
  size: "",
  closePrice: "",
  setup: "",
  tags: "",
  notes: "",
};

export const TradeForm = ({
  editingTrade,
  onSubmit,
  onCancelEdit,
}: TradeFormProps) => {
  const [form, setForm] = useState<TradeFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTrade) {
      setForm({
        timestamp: editingTrade.timestamp.slice(0, 16),
        asset: editingTrade.asset,
        direction: editingTrade.direction,
        entryPrice: String(editingTrade.entryPrice),
        stopLossPrice: String(editingTrade.stopLossPrice),
        takeProfitPrice: editingTrade.takeProfitPrice
          ? String(editingTrade.takeProfitPrice)
          : "",
        size: String(editingTrade.size),
        closePrice: String(editingTrade.closePrice),
        setup: editingTrade.setup,
        tags: editingTrade.tags.join(", "),
        notes: editingTrade.notes || "",
      });
    } else {
      setForm({ ...emptyForm, timestamp: new Date().toISOString().slice(0, 16) });
    }
  }, [editingTrade]);

  const handleChange = (field: keyof TradeFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const parseNumber = (value: string) =>
    value.trim() === "" ? NaN : Number(value);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const entryPrice = parseNumber(form.entryPrice);
    const stopLossPrice = parseNumber(form.stopLossPrice);
    const size = parseNumber(form.size);
    const closePrice = parseNumber(form.closePrice);
    const takeProfitPrice = parseNumber(form.takeProfitPrice);

    if (
      !form.asset ||
      isNaN(entryPrice) ||
      isNaN(stopLossPrice) ||
      isNaN(size) ||
      isNaN(closePrice)
    ) {
      setError("Asset, Entry, Stop, Size và Close là bắt buộc.");
      return;
    }
    if (entryPrice <= 0 || stopLossPrice <= 0 || size <= 0) {
      setError("Entry, Stop và Size phải lớn hơn 0.");
      return;
    }
    if (
      (form.direction === "Long" && stopLossPrice >= entryPrice) ||
      (form.direction === "Short" && stopLossPrice <= entryPrice)
    ) {
      setError("Stop loss phải đúng chiều để tính risk hợp lý.");
      return;
    }

    const payload: TradePayload = {
      timestamp: form.timestamp,
      asset: form.asset,
      direction: form.direction,
      entryPrice,
      stopLossPrice,
      takeProfitPrice: isNaN(takeProfitPrice) ? undefined : takeProfitPrice,
      size,
      closePrice,
      setup: form.setup,
      tags: form.tags,
      notes: form.notes,
    };

    const isEditing = Boolean(editingTrade);
    onSubmit(payload, editingTrade?.id);
    if (!isEditing) {
      setForm({ ...emptyForm, timestamp: new Date().toISOString().slice(0, 16) });
    }
  };

  return (
    <section className="glass-panel">
      <div className="flex items-center justify-between">
        <p className="card-title">
          {editingTrade ? "Chỉnh sửa lệnh" : "Log lệnh mới"}
        </p>
        {editingTrade && (
          <button
            className="text-xs text-slate-400 underline"
            onClick={onCancelEdit}
          >
            Hủy chỉnh sửa
          </button>
        )}
      </div>
      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <label className="text-sm text-slate-400">Ngày/giờ vào lệnh</label>
          <input
            type="datetime-local"
            value={form.timestamp}
            onChange={(event) => handleChange("timestamp", event.target.value)}
            className="mt-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          />
        </div>
        <TextInput
          label="Asset"
          value={form.asset}
          onChange={(value) => handleChange("asset", value.toUpperCase())}
        />
        <div className="flex flex-col">
          <label className="text-sm text-slate-400">Long/Short</label>
          <select
            value={form.direction}
            onChange={(event) =>
              handleChange("direction", event.target.value as TradeDirection)
            }
            className="mt-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          >
            <option value="Long">Long</option>
            <option value="Short">Short</option>
          </select>
        </div>
        <NumberField
          label="Entry"
          value={form.entryPrice}
          onChange={(value) => handleChange("entryPrice", value)}
        />
        <NumberField
          label="Stop loss"
          value={form.stopLossPrice}
          onChange={(value) => handleChange("stopLossPrice", value)}
        />
        <NumberField
          label="Take profit"
          value={form.takeProfitPrice}
          onChange={(value) => handleChange("takeProfitPrice", value)}
        />
        <NumberField
          label="Size (units/contracts)"
          value={form.size}
          onChange={(value) => handleChange("size", value)}
        />
        <NumberField
          label="Đóng lệnh tại"
          value={form.closePrice}
          onChange={(value) => handleChange("closePrice", value)}
        />
        <TextInput
          label="Tag/Setup"
          value={form.setup}
          onChange={(value) => handleChange("setup", value)}
        />
        <TextInput
          label="Tags (phân tách bởi dấu phẩy)"
          value={form.tags}
          onChange={(value) => handleChange("tags", value)}
        />
        <div className="md:col-span-2 flex flex-col">
          <label className="text-sm text-slate-400">Note</label>
          <textarea
            value={form.notes}
            onChange={(event) => handleChange("notes", event.target.value)}
            className="mt-2 min-h-[100px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          />
        </div>
        <button
          type="submit"
          className="md:col-span-2 rounded-2xl bg-emerald-400/80 px-4 py-3 font-semibold text-slate-900 transition hover:bg-emerald-300"
        >
          {editingTrade ? "Cập nhật lệnh" : "Thêm lệnh"}
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
    </section>
  );
};

const TextInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="flex flex-col">
    <label className="text-sm text-slate-400">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
    />
  </div>
);

const NumberField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="flex flex-col">
    <label className="text-sm text-slate-400">{label}</label>
    <input
      type="number"
      step="any"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
      inputMode="decimal"
    />
  </div>
);

