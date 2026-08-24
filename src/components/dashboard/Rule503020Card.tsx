import React from 'react';
import { Layers, ShieldCheck, Heart, Sparkles, TrendingUp } from 'lucide-react';
import { Rule503020Breakdown } from '../../types';

interface Rule503020CardProps {
  breakdown: Rule503020Breakdown;
  currencySymbol: string;
}

export function Rule503020Card({ breakdown, currencySymbol }: Rule503020CardProps) {
  const needs = breakdown?.needs || { spent: 0, target: 0, percentage: 0 };
  const wants = breakdown?.wants || { spent: 0, target: 0, percentage: 0 };
  const savings = breakdown?.savings || { spent: 0, target: 0, percentage: 0 };

  const items = [
    {
      title: '50% Necesidades',
      subtitle: 'Vivienda, Servicios, Comida, Salud',
      spent: typeof needs.spent === 'number' && !isNaN(needs.spent) ? needs.spent : 0,
      target: typeof needs.target === 'number' && !isNaN(needs.target) ? needs.target : 0,
      percentage: typeof needs.percentage === 'number' && !isNaN(needs.percentage) ? needs.percentage : 0,
      color: '#3b82f6', // blue
      bgLight: 'bg-blue-500',
    },
    {
      title: '30% Deseos / Ocio',
      subtitle: 'Restaurantes, Compras, Salidas',
      spent: typeof wants.spent === 'number' && !isNaN(wants.spent) ? wants.spent : 0,
      target: typeof wants.target === 'number' && !isNaN(wants.target) ? wants.target : 0,
      percentage: typeof wants.percentage === 'number' && !isNaN(wants.percentage) ? wants.percentage : 0,
      color: '#f59e0b', // amber
      bgLight: 'bg-amber-500',
    },
    {
      title: '20% Ahorro / Inversión',
      subtitle: 'Fondos, Metas, Deuda',
      spent: typeof savings.spent === 'number' && !isNaN(savings.spent) ? savings.spent : 0,
      target: typeof savings.target === 'number' && !isNaN(savings.target) ? savings.target : 0,
      percentage: typeof savings.percentage === 'number' && !isNaN(savings.percentage) ? savings.percentage : 0,
      color: '#10b981', // green
      bgLight: 'bg-emerald-500',
    },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-zinc-200/90 dark:border-zinc-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Estructura 50 / 30 / 20
            </h3>
            <p className="text-[11px] text-zinc-400">Distribución óptima de ingresos</p>
          </div>
        </div>
      </div>

      {/* Multi-segmented single visual bar */}
      <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full flex overflow-hidden gap-0.5">
        <div
          className="h-full bg-blue-500 transition-all duration-700"
          style={{ width: `${Math.min(items[0].percentage, 100)}%` }}
          title={`Necesidades: ${items[0].percentage}%`}
        />
        <div
          className="h-full bg-amber-500 transition-all duration-700"
          style={{ width: `${Math.min(items[1].percentage, 100)}%` }}
          title={`Deseos: ${items[1].percentage}%`}
        />
        <div
          className="h-full bg-emerald-500 transition-all duration-700"
          style={{ width: `${Math.min(items[2].percentage, 100)}%` }}
          title={`Ahorro: ${items[2].percentage}%`}
        />
      </div>

      {/* Detail breakdown items */}
      <div className="space-y-3 pt-1">
        {items.map((item, idx) => {
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.title}
                </span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100">
                  {currencySymbol}{item.spent.toFixed(0)}{' '}
                  <span className="text-[10px] text-zinc-400 font-normal">
                    / {currencySymbol}{item.target.toFixed(0)} ({item.percentage}%)
                  </span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: item.color,
                    width: `${Math.min((item.spent / (item.target || 1)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
