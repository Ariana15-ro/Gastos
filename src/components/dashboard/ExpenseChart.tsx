import React from 'react';
import { Cell, PieChart, Pie, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryIcon } from '../ui/CategoryIcon';

interface ExpenseItem {
  id?: string;
  categoryId?: string;
  name?: string;
  categoryName?: string;
  color: string;
  icon: string;
  value?: number;
  amount?: number;
  percentage?: number;
}

interface ExpenseChartProps {
  data: ExpenseItem[];
  currencySymbol?: string;
}

export function ExpenseChart({ data, currencySymbol = '$' }: ExpenseChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[280px] w-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 text-sm">
        <p className="font-medium">No hay gastos registrados en este período</p>
        <span className="text-xs text-zinc-400 mt-1">Registra un movimiento para ver el desglose</span>
      </div>
    );
  }

  const normalizedData = data.map((item, index) => {
    const rawAmount = typeof item.amount === 'number' ? item.amount : typeof item.value === 'number' ? item.value : 0;
    const catId = item.categoryId || item.id || `cat-${index}`;
    const catName = item.categoryName || item.name || 'General';
    return {
      ...item,
      categoryId: catId,
      categoryName: catName,
      amount: rawAmount,
      key: `${catId}-${index}`,
    };
  });

  const total = normalizedData.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
      {/* Chart container with center stats */}
      <div className="relative h-[240px] w-full max-w-[240px] flex-shrink-0 mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={normalizedData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              dataKey="amount"
              nameKey="categoryName"
            >
              {normalizedData.map((entry, index) => (
                <Cell key={entry.key || `cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [
                `${currencySymbol}${(Number(value) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
                'Gasto'
              ]}
              contentStyle={{
                backgroundColor: 'rgba(24, 24, 27, 0.95)',
                color: '#fff',
                borderRadius: '10px',
                border: 'none',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                fontSize: '12px',
                padding: '8px 12px',
              }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total in Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Total Gastos</span>
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {currencySymbol}{(typeof total === 'number' && !isNaN(total) ? total : 0) >= 1000
              ? `${((typeof total === 'number' && !isNaN(total) ? total : 0) / 1000).toFixed(1)}k`
              : (typeof total === 'number' && !isNaN(total) ? total : 0).toFixed(0)}
          </span>
        </div>
      </div>

      {/* Category breakdown list */}
      <div className="w-full flex-1 space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
        {normalizedData.slice(0, 5).map((item, index) => {
          const itemPercentage = typeof item.percentage === 'number' && !isNaN(item.percentage)
            ? item.percentage
            : total > 0
            ? (item.amount / total) * 100
            : 0;

          return (
            <div
              key={item.key || `item-${index}`}
              className="flex items-center justify-between p-2 rounded-lg bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-white flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                >
                  <CategoryIcon name={item.icon} size={12} />
                </div>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {item.categoryName}
                </span>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {currencySymbol}{(item?.amount ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-zinc-400 block">
                  {itemPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
