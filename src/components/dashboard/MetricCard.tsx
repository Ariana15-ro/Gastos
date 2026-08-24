import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  amount: number;
  currencySymbol: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'rose' | 'indigo' | 'amber';
  subtitle?: string;
  changePercentage?: number;
  isPositiveGood?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  amount,
  currencySymbol,
  icon: Icon,
  variant = 'indigo',
  subtitle,
  changePercentage,
  isPositiveGood = true,
}) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50/70 dark:bg-emerald-950/20',
      border: 'border-emerald-200/80 dark:border-emerald-800/40',
      iconBg: 'bg-emerald-500 text-white',
      accent: 'text-emerald-700 dark:text-emerald-400',
    },
    rose: {
      bg: 'bg-rose-50/70 dark:bg-rose-950/20',
      border: 'border-rose-200/80 dark:border-rose-800/40',
      iconBg: 'bg-rose-500 text-white',
      accent: 'text-rose-700 dark:text-rose-400',
    },
    indigo: {
      bg: 'bg-indigo-50/70 dark:bg-indigo-950/20',
      border: 'border-indigo-200/80 dark:border-indigo-800/40',
      iconBg: 'bg-indigo-600 text-white',
      accent: 'text-indigo-700 dark:text-indigo-400',
    },
    amber: {
      bg: 'bg-amber-50/70 dark:bg-amber-950/20',
      border: 'border-amber-200/80 dark:border-amber-800/40',
      iconBg: 'bg-amber-500 text-white',
      accent: 'text-amber-700 dark:text-amber-400',
    },
  };

  const scheme = colorMap[variant];

  return (
    <div
      className={`rounded-2xl border ${scheme.border} ${scheme.bg} p-5 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
          {currencySymbol !== '%' && currencySymbol}
          {(typeof amount === 'number' && !isNaN(amount) ? amount : 0).toLocaleString('es-ES', {
            minimumFractionDigits: currencySymbol === '%' ? 0 : 2,
            maximumFractionDigits: currencySymbol === '%' ? 0 : 2,
          })}
          {currencySymbol === '%' && '%'}
        </span>
      </div>

      {(subtitle || changePercentage !== undefined) && (
        <div className="mt-2.5 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          {subtitle && <span>{subtitle}</span>}
          {changePercentage !== undefined && (
            <div
              className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-xs ${
                (changePercentage >= 0 && isPositiveGood) || (changePercentage < 0 && !isPositiveGood)
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
              }`}
            >
              {changePercentage >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(changePercentage)}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
