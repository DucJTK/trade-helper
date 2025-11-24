import { FormEvent, useEffect, useState } from "react";
import { Settings, TradeDirection } from "../types";
import { formatCurrency } from "../utils/format";
import { GlossaryTooltip } from "./GlossaryTooltip";

interface Props {
  settings: Settings;
}

interface CalculationResult {
  targetRiskAmount: number;
  riskAmount: number;
  positionSize: number;
  riskPerUnit: number;
  notional: number;
  estimatedLoss: number;
  marginRequired: number;
  marginLimited: boolean;
}

export const RiskCalculatorCard = ({ settings }: Props) => {
  const [form, setForm] = useState({
    accountBalance: String(
      settings.currentAccountBalance || settings.initialAccountBalance,
    ),
    riskPercent: String(settings.defaultRiskPerTradePercent),
    entryPrice: "",
    stopLossPrice: "",
    positionType: "Long" as TradeDirection,
    leverage: "1",
  });
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      accountBalance: String(
        settings.currentAccountBalance || settings.initialAccountBalance,
      ),
      riskPercent: String(settings.defaultRiskPerTradePercent),
    }));
  }, [settings]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const parseNumber = (value: string) =>
    value.trim() === "" ? NaN : Number(value);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const {
      accountBalance: accountBalanceRaw,
      riskPercent: riskPercentRaw,
      entryPrice: entryRaw,
      stopLossPrice: stopRaw,
      positionType,
      leverage: leverageRaw,
    } = form;

    const accountBalance = parseNumber(accountBalanceRaw);
    const riskPercent = parseNumber(riskPercentRaw);
    const entryPrice = parseNumber(entryRaw);
    const stopLossPrice = parseNumber(stopRaw);
    const leverage = parseNumber(leverageRaw) || 1;

    if (!isFinite(accountBalance) || accountBalance <= 0) {
      setError("Account balance phải lớn hơn 0.");
      return;
    }
    if (!isFinite(riskPercent) || riskPercent <= 0) {
      setError("Risk % mỗi lệnh phải lớn hơn 0.");
      return;
    }
    if (!isFinite(entryPrice) || entryPrice <= 0) {
      setError("Entry price phải lớn hơn 0.");
      return;
    }
    if (!isFinite(stopLossPrice) || stopLossPrice <= 0) {
      setError("Stop loss phải lớn hơn 0.");
      return;
    }
    if (entryPrice === stopLossPrice) {
      setError("Entry và Stop phải khác nhau để có risk.");
      return;
    }
    if (!isFinite(leverage) || leverage <= 0) {
      setError("Leverage phải lớn hơn 0.");
      return;
    }

    const targetRiskAmount = accountBalance * (riskPercent / 100);
    const rawRiskPerUnit =
      positionType === "Long"
        ? entryPrice - stopLossPrice
        : stopLossPrice - entryPrice;
    if (rawRiskPerUnit <= 0) {
      setError("Khoảng cách SL phải cùng chiều với hướng lệnh.");
      return;
    }

    const positionSizeByRisk = targetRiskAmount / rawRiskPerUnit;
    const maxNotional = accountBalance * leverage;
    const positionSizeByMargin = maxNotional / entryPrice;
    const positionSize = Math.min(positionSizeByRisk, positionSizeByMargin);

    if (!isFinite(positionSize) || positionSize <= 0) {
      setError("Không thể tính size. Kiểm tra lại số liệu.");
      return;
    }

    const notional = positionSize * entryPrice;
    const estimatedLoss = positionSize * rawRiskPerUnit;
    const marginRequired = notional / leverage;

    setResult({
      targetRiskAmount,
      riskAmount: estimatedLoss,
      positionSize,
      riskPerUnit: rawRiskPerUnit,
      notional,
      estimatedLoss,
      marginRequired,
      marginLimited: positionSizeByMargin < positionSizeByRisk,
    });
    setError(null);
  };

  const warnings: string[] = [];
  const parsedRiskPercent = parseNumber(form.riskPercent);
  const parsedAccountBalance = parseNumber(form.accountBalance);

  if (result && Number.isFinite(parsedRiskPercent) && parsedRiskPercent > 3) {
    warnings.push("Bạn đang risk >3%/lệnh. Hãy cân nhắc giảm size.");
  }
  if (
    result &&
    Number.isFinite(parsedAccountBalance) &&
    parsedAccountBalance > 0 &&
    result.notional > parsedAccountBalance * 10
  ) {
    warnings.push(
      "Notional >10x account balance. Đòn bẩy cao có thể làm cháy tài khoản.",
    );
  }
  if (result?.marginLimited) {
    warnings.push(
      "Size đã bị giới hạn bởi leverage/margin. Tăng leverage hoặc giảm entry price nếu muốn đạt risk mục tiêu.",
    );
  }

  return (
    <section className="glass-panel">
      <div className="flex items-center justify-between">
        <div>
          <p className="card-title">Risk Calculator</p>
          <p className="text-sm text-slate-400">
            Tính size dựa trên % risk cố định.
          </p>
        </div>
      </div>
      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <NumberInput
          label="Account balance"
          value={form.accountBalance}
          onChange={(value) => handleChange("accountBalance", value)}
          suffix={settings.currency}
          glossary={{
            term: "Account balance",
            definition:
              "Số vốn có thể dùng làm margin hiện tại. Tất cả phép tính risk dựa vào con số này.",
            example: "Spot 5.000 USD hoặc futures 8.000 USDT.",
          }}
        />
        <NumberInput
          label="% risk per trade"
          value={form.riskPercent}
          onChange={(value) => handleChange("riskPercent", value)}
          suffix="%"
          glossary={{
            term: "% risk per trade",
            definition:
              "Tỷ lệ % vốn tối đa chấp nhận mất nếu lệnh hit stop loss.",
            example: "Risk 1% trên tài khoản 10.000 USD → mất tối đa 100 USD.",
          }}
        />
        <NumberInput
          label="Entry price"
          value={form.entryPrice}
          onChange={(value) => handleChange("entryPrice", value)}
          glossary={{
            term: "Entry price",
            definition: "Giá dự kiến khớp lệnh.",
          }}
        />
        <NumberInput
          label="Stop loss price"
          value={form.stopLossPrice}
          onChange={(value) => handleChange("stopLossPrice", value)}
          glossary={{
            term: "Stop loss price",
            definition:
              "Mức giá tự động thoát để giới hạn thua lỗ. Khoảng cách Entry-SL chính là risk per unit.",
          }}
        />
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <GlossaryTooltip
              term="Loại lệnh"
              definition="Long kiếm lời khi giá tăng, Short kiếm lời khi giá giảm."
              example="Short BTC: Entry 65k, SL 66k → risk 1k mỗi BTC."
            />
          </label>
          <select
            value={form.positionType}
            onChange={(event) =>
              handleChange("positionType", event.target.value as TradeDirection)
            }
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          >
            <option value="Long">Long</option>
            <option value="Short">Short</option>
          </select>
        </div>
        <NumberInput
          label="Leverage (optional)"
          value={form.leverage}
          onChange={(value) => handleChange("leverage", value)}
          min={1}
          glossary={{
            term: "Leverage",
            definition:
              "Đòn bẩy cho phép mở notional lớn hơn số vốn thật. Margin = notional / leverage.",
            example: "Balance 1.000 USD với 5x → mở được 5.000 USD notional.",
          }}
        />
        <button
          type="submit"
          className="md:col-span-2 rounded-2xl bg-teal-400/80 px-4 py-3 font-semibold text-slate-900 transition hover:bg-teal-300"
        >
          Tính size lệnh
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
      {result && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ResultTile
            label="Risk amount"
            value={formatCurrency(result.riskAmount, settings.currency)}
            glossary={{
              term: "Risk amount",
              definition:
                "Số tiền thực tế sẽ mất nếu giá chạm stop loss với size hiện tại.",
              example: "Size 2 ETH, SL cách 50 USD → risk = 100 USD.",
            }}
          />
          <ResultTile
            label="Target risk"
            value={formatCurrency(result.targetRiskAmount, settings.currency)}
            glossary={{
              term: "Target risk",
              definition:
                "Số tiền bạn dự tính risk dựa trên % đã đặt. Nếu lớn hơn risk actual, tức size bị giới hạn bởi leverage.",
            }}
          />
          <ResultTile
            label="Position size"
            value={`${result.positionSize.toFixed(4)} units`}
            glossary={{
              term: "Position size",
              definition: "Số lượng hợp đồng/coin cần vào để đạt risk mục tiêu.",
            }}
          />
          <ResultTile
            label="Notional"
            value={formatCurrency(result.notional, settings.currency)}
            glossary={{
              term: "Notional",
              definition: "Giá trị danh nghĩa của vị thế = size * entry.",
            }}
          />
          <ResultTile
            label="Ước tính lỗ nếu SL hit"
            value={formatCurrency(result.estimatedLoss, settings.currency)}
            glossary={{
              term: "Ước tính lỗ",
              definition: "Chính là risk amount – khoản lỗ sẽ trừ vào vốn.",
            }}
          />
          <ResultTile
            label="Margin required"
            value={formatCurrency(result.marginRequired, settings.currency)}
            glossary={{
              term: "Margin required",
              definition:
                "Số vốn thật phải ký quỹ = notional / leverage. Nếu vượt balance bạn không thể mở lệnh.",
            }}
          />
        </div>
      )}
      {warnings.length > 0 && (
        <div className="mt-4 space-y-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          {warnings.map((message) => (
            <p key={message}>⚠️ {message}</p>
          ))}
        </div>
      )}
    </section>
  );
};

interface NumberInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  min?: number;
  glossary?: {
    term: string;
    definition: string;
    example?: string;
  };
}

const NumberInput = ({
  label,
  value,
  onChange,
  suffix,
  min,
  glossary,
}: NumberInputProps) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm text-slate-400">
      {glossary ? (
        <GlossaryTooltip
          term={glossary.term}
          definition={glossary.definition}
          example={glossary.example}
        />
      ) : (
        label
      )}
    </label>
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <input
        type="number"
        min={min}
        className="w-full bg-transparent text-white outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        step="any"
        inputMode="decimal"
      />
      {suffix && <span className="text-xs text-slate-400">{suffix}</span>}
    </div>
  </div>
);

const ResultTile = ({
  label,
  value,
  glossary,
}: {
  label: string;
  value: string;
  glossary?: { term: string; definition: string; example?: string };
}) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
    <p className="text-xs uppercase tracking-wide text-slate-400">
      {glossary ? (
        <GlossaryTooltip
          term={glossary.term}
          definition={glossary.definition}
          example={glossary.example}
        />
      ) : (
        label
      )}
    </p>
    <p className="text-lg font-semibold text-white">{value}</p>
  </div>
);

