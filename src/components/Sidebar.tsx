import { ElementType } from "react";
import {
  BarChart3,
  Calculator,
  LayoutDashboard,
  NotebookPen,
  Settings,
  X,
} from "lucide-react";
import { TabKey } from "../types";
import { clsx } from "clsx";

export const NAV_ITEMS: { key: TabKey; label: string; icon: ElementType }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "risk", label: "Risk Calculator", icon: Calculator },
  { key: "journal", label: "Trade Journal", icon: NotebookPen },
  { key: "stats", label: "Stats & Charts", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  selected: TabKey;
  onSelect: (tab: TabKey) => void;
  className?: string;
}

const SidebarNav = ({ selected, onSelect }: SidebarProps) => (
  <nav className="space-y-2">
    {NAV_ITEMS.map((item) => {
      const Icon = item.icon;
      const isActive = item.key === selected;
      return (
        <button
          key={item.key}
          onClick={() => onSelect(item.key)}
          className={clsx(
            "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition",
            isActive
              ? "bg-teal-500/10 text-teal-200 shadow-inner shadow-teal-500/20"
              : "text-slate-400 hover:bg-white/5 hover:text-white",
          )}
        >
          <Icon size={18} />
          <span className="font-medium">{item.label}</span>
        </button>
      );
    })}
  </nav>
);

export const Sidebar = ({ selected, onSelect, className }: SidebarProps) => (
  <aside
    className={clsx(
      "hidden w-64 flex-shrink-0 border-r border-white/5 bg-slate-950/90 p-6 md:block",
      className,
    )}
  >
    <SidebarNav selected={selected} onSelect={onSelect} />
  </aside>
);

interface MobileSidebarProps extends SidebarProps {
  onClose: () => void;
}

export const MobileSidebar = ({
  selected,
  onSelect,
  onClose,
}: MobileSidebarProps) => (
  <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden">
    <div className="absolute inset-y-0 left-0 w-72 bg-slate-950 p-6 shadow-2xl">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">
          Menu
        </p>
        <button
          onClick={onClose}
          aria-label="Đóng menu"
          className="rounded-full border border-white/10 p-2 text-slate-200"
        >
          <X size={16} />
        </button>
      </div>
      <SidebarNav
        selected={selected}
        onSelect={(tab) => {
          onSelect(tab);
          onClose();
        }}
      />
    </div>
  </div>
);

