import { FormEvent, useEffect, useState } from "react";
import { Settings } from "../types";
import { GlossaryTooltip } from "./GlossaryTooltip";

interface Props {
  settings: Settings;
  onSave: (settings: Settings) => void;
}

type SettingsFormState = {
  [K in keyof Settings]: K extends "currency" ? Settings[K] : string;
};

const settingsToState = (settings: Settings): SettingsFormState => ({
  initialAccountBalance: String(settings.initialAccountBalance),
  currentAccountBalance: String(settings.currentAccountBalance),
  defaultRiskPerTradePercent: String(settings.defaultRiskPerTradePercent),
  maxDailyLossPercent: String(settings.maxDailyLossPercent),
  maxWeeklyLossPercent: String(settings.maxWeeklyLossPercent),
  currency: settings.currency,
});

export const SettingsForm = ({ settings, onSave }: Props) => {
  const [form, setForm] = useState<SettingsFormState>(settingsToState(settings));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(settingsToState(settings));
  }, [settings]);

  const handleChange = (field: keyof SettingsFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setSaved(false);
  };

  const parseNumber = (value: string) =>
    value.trim() === "" ? NaN : Number(value);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const initial = parseNumber(form.initialAccountBalance);
    if (!Number.isFinite(initial) || initial <= 0) {
      nextErrors.initialAccountBalance = "Vốn ban đầu phải lớn hơn 0.";
    }
    const current = parseNumber(form.currentAccountBalance);
    if (!Number.isFinite(current) || current <= 0) {
      nextErrors.currentAccountBalance = "Vốn hiện tại phải lớn hơn 0.";
    }
    const defaultRisk = parseNumber(form.defaultRiskPerTradePercent);
    if (!Number.isFinite(defaultRisk) || defaultRisk <= 0) {
      nextErrors.defaultRiskPerTradePercent = "Risk mặc định phải > 0%.";
    }
    const daily = parseNumber(form.maxDailyLossPercent);
    if (!Number.isFinite(daily) || daily <= 0) {
      nextErrors.maxDailyLossPercent = "Thiết lập daily loss % hợp lệ.";
    }
    const weekly = parseNumber(form.maxWeeklyLossPercent);
    if (!Number.isFinite(weekly) || weekly <= 0) {
      nextErrors.maxWeeklyLossPercent = "Thiết lập weekly loss % hợp lệ.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    const payload: Settings = {
      initialAccountBalance: parseNumber(form.initialAccountBalance),
      currentAccountBalance: parseNumber(form.currentAccountBalance),
      defaultRiskPerTradePercent: parseNumber(form.defaultRiskPerTradePercent),
      maxDailyLossPercent: parseNumber(form.maxDailyLossPercent),
      maxWeeklyLossPercent: parseNumber(form.maxWeeklyLossPercent),
      currency: form.currency,
    };
    onSave(payload);
    setSaved(true);
  };

  return (
    <section className="glass-panel">
      <p className="card-title">Thiết lập quản lý vốn</p>
      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        {(
          [
            {
              label: "Initial account balance",
              field: "initialAccountBalance",
              suffix: form.currency,
            },
            {
              label: "Current account balance",
              field: "currentAccountBalance",
              suffix: form.currency,
            },
            {
              label: "Default % risk / trade",
              field: "defaultRiskPerTradePercent",
              suffix: "%",
            },
            {
              label: "Max daily loss %",
              field: "maxDailyLossPercent",
              suffix: "%",
            },
            {
              label: "Max weekly loss %",
              field: "maxWeeklyLossPercent",
              suffix: "%",
            },
          ] as const
        ).map((input) => (
          <div key={input.field}>
            <label className="text-sm text-slate-400">
              <GlossaryTooltip
                term={input.label}
                definition={
                  {
                    initialAccountBalance:
                      "Vốn ban đầu để tham chiếu drawdown dài hạn.",
                    currentAccountBalance:
                      "Vốn thực tại bạn đang có. Dashboard và risk tính từ đây.",
                    defaultRiskPerTradePercent:
                      "Risk % mặc định cho calculator và rule nhắc nhở.",
                    maxDailyLossPercent:
                      "Giới hạn % lỗ tối đa trong ngày để ép bạn dừng trade.",
                    maxWeeklyLossPercent:
                      "Giới hạn % lỗ tối đa trong tuần để bảo toàn equity.",
                  }[input.field] ?? ""
                }
              />
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <input
                type="number"
                step="any"
                className="w-full bg-transparent text-white outline-none"
                value={form[input.field] as string}
                onChange={(event) =>
                  handleChange(input.field, event.target.value)
                }
                inputMode="decimal"
              />
              <span className="text-xs text-slate-400">{input.suffix}</span>
            </div>
            {errors[input.field] && (
              <p className="mt-1 text-xs text-rose-400">
                {errors[input.field]}
              </p>
            )}
          </div>
        ))}
        <div className="flex flex-col">
          <label className="text-sm text-slate-400">Đơn vị tiền</label>
          <select
            value={form.currency}
            className="mt-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            onChange={(event) => handleChange("currency", event.target.value)}
          >
            {["USD", "USDT", "EUR", "VND"].map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="md:col-span-2 rounded-2xl bg-teal-400/80 px-4 py-3 font-semibold text-slate-900 transition hover:bg-teal-300"
        >
          Lưu thiết lập
        </button>
      </form>
      {saved && (
        <p className="mt-4 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Thiết lập đã được lưu vào trình duyệt (localStorage).
        </p>
      )}
    </section>
  );
};

