import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Settings, Sparkles, Moon, Sun } from 'lucide-react';
import { UserSettings } from '../../types';

interface HeaderProps {
  currentYear: number;
  currentMonth: number; // 0-indexed
  onMonthChange: (year: number, month: number) => void;
  settings: UserSettings;
  onToggleTheme: () => void;
  onOpenQuickAdd: () => void;
  onOpenSettings: () => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function Header({
  currentYear,
  currentMonth,
  onMonthChange,
  settings,
  onToggleTheme,
  onOpenQuickAdd,
  onOpenSettings,
}: HeaderProps) {
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      onMonthChange(currentYear - 1, 11);
    } else {
      onMonthChange(currentYear, currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      onMonthChange(currentYear + 1, 0);
    } else {
      onMonthChange(currentYear, currentMonth + 1);
    }
  };

  const handleResetToCurrentMonth = () => {
    const now = new Date();
    onMonthChange(now.getFullYear(), now.getMonth());
  };

  const isTodayMonth =
    new Date().getFullYear() === currentYear && new Date().getMonth() === currentMonth;

  const isDark = settings.theme === 'dark';

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: User Welcome and Month Selector */}
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="hidden sm:block">
          <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            {settings.userName || 'Mi Cuenta'}
          </h2>
          <span className="text-[11px] text-zinc-400 font-medium">Finanzas en tiempo real</span>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 shadow-2xs">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetToCurrentMonth}
            className="px-2.5 py-1 text-xs font-black text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 transition-colors tracking-tight"
          >
            {MONTH_NAMES[currentMonth]} {currentYear}
          </button>

          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {!isTodayMonth && (
          <button
            onClick={handleResetToCurrentMonth}
            className="hidden md:inline-block text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-500/20"
          >
            Ir al mes actual
          </button>
        )}
      </div>

      {/* Right: Quick actions and Theme toggle */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Dark / Light Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo Registro</span>
          <span className="sm:hidden">Nuevo</span>
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Ajustes y respaldo"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
