import { Info } from "lucide-react";
import { ReactNode } from "react";

interface GlossaryTooltipProps {
  term: string;
  definition: ReactNode;
  example?: ReactNode;
}

export const GlossaryTooltip = ({
  term,
  definition,
  example,
}: GlossaryTooltipProps) => (
  <span className="group relative inline-flex cursor-help items-center gap-1 text-slate-300">
    <span>{term}</span>
    <Info size={14} className="text-slate-500 transition group-hover:text-teal-300" />
    <span className="pointer-events-none absolute left-0 top-full z-30 mt-2 hidden w-72 rounded-2xl bg-slate-900/95 p-4 text-xs text-slate-100 shadow-2xl ring-1 ring-white/10 group-hover:block">
      <p className="font-semibold text-teal-200">{term}</p>
      <p className="mt-2 leading-relaxed text-slate-100">{definition}</p>
      {example && (
        <p className="mt-2 text-slate-400">
          <span className="font-semibold text-slate-200">Ví dụ:</span> {example}
        </p>
      )}
    </span>
  </span>
);

