import React from 'react';
import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { CategoryIcon } from '../ui/CategoryIcon';

export interface BudgetProgressProps {
  category: string;
  categoryIcon?: string;
  categoryColor?: string;
  spent: number;
  limit: number;
  currencySymbol?: string;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({
  category,
  categoryIcon = 'Tag',
  categoryColor = '#f59e0b',
  spent = 0,
  limit = 0,
  currencySymbol = '$',
}) => {
  const safeSpent = typeof spent === 'number' && !isNaN(spent) ? spent : 0;
  const safeLimit = typeof limit === 'number' && !isNaN(limit) ? limit : 0;
  const percentage = safeLimit > 0 ? (safeSpent / safeLimit) * 100 : 0;
  const isOverBudget = percentage >= 100;
  const isNearLimit = percentage >= 80 && percentage < 100;
  const remaining = Math.max(0, safeLimit - safeSpent);

  // Status color
  const progressColor = isOverBudget
    ? 'bg-rose-500'
    : isNearLimit
    ? 'bg-amber-500'
    : 'bg-emerald-500';

  const trackBg = isOverBudget
    ? 'bg-rose-100 dark:bg-rose-950/40'
    : isNearLimit
    ? 'bg-amber-100 dark:bg-amber-950/40'
    : 'bg-zinc-100 dark:bg-zinc-800';

  return (
    <div className="rounded-xl p-3.5 bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 transition-all hover:bg-zinc-100/70 dark:hover:bg-zinc-800/70">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-xs"
            style={{ backgroundColor: categoryColor }}
          >
            <CategoryIcon name={categoryIcon} size={14} />
          </div>
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {category}
          </span>
        </div>
        <div className="text-xs text-right">
          <span className="font-bold text-zinc-900 dark:text-zinc-100">
            {currencySymbol}{safeSpent.toFixed(0)}
          </span>
          <span className="text-zinc-500 dark:text-zinc-400"> / {currencySymbol}{safeLimit.toFixed(0)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`w-full h-2.5 rounded-full overflow-hidden ${trackBg}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2 text-[11px]">
        {isOverBudget ? (
          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            ¡Excedido por {currencySymbol}{(safeSpent - safeLimit).toFixed(0)}! ({percentage.toFixed(0)}%)
          </span>
        ) : isNearLimit ? (
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            {percentage.toFixed(0)}% usado — Quedan {currencySymbol}{remaining.toFixed(0)}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Quedan {currencySymbol}{remaining.toFixed(0)} ({percentage.toFixed(0)}% usado)
          </span>
        )}
        <span className="font-medium text-zinc-400 dark:text-zinc-500">
          {safeLimit > 0 ? `${Math.max(0, 100 - percentage).toFixed(0)}% libre` : 'Sin límite'}
        </span>
      </div>
    </div>
  );
};
