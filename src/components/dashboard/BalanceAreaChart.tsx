import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DailyTrendPoint } from '../../lib/storage';

interface BalanceAreaChartProps {
  data: DailyTrendPoint[];
  currencySymbol: string;
}

export function BalanceAreaChart({ data, currencySymbol }: BalanceAreaChartProps) {
  // Only show points that have passed or have activity up to current day
  const filteredData = data.filter((d) => d.day <= new Date().getDate() || d.income > 0 || d.expense > 0);
  const chartData = filteredData.length > 0 ? filteredData : data.slice(0, 15);

  const formatMoney = (val: number) => {
    const num = typeof val === 'number' && !isNaN(val) ? val : 0;
    if (Math.abs(num) >= 1000) {
      return `${currencySymbol}${(num / 1000).toFixed(1)}k`;
    }
    return `${currencySymbol}${num.toFixed(0)}`;
  };

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} vertical={false} />
          
          <XAxis
            dataKey="dateStr"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#71717a' }}
            interval={2}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#71717a' }}
            tickFormatter={formatMoney}
          />

          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as DailyTrendPoint;
                const safeIncome = typeof item?.income === 'number' && !isNaN(item.income) ? item.income : 0;
                const safeExpense = typeof item?.expense === 'number' && !isNaN(item.expense) ? item.expense : 0;
                const safeCumulative = typeof item?.cumulativeBalance === 'number' && !isNaN(item.cumulativeBalance) ? item.cumulativeBalance : 0;

                return (
                  <div className="bg-zinc-900 border border-zinc-700/80 p-3 rounded-2xl shadow-xl text-xs space-y-1.5 backdrop-blur-md">
                    <p className="font-extrabold text-zinc-200">Día {item?.day ?? 1} del mes</p>
                    <div className="flex items-center justify-between gap-4 text-emerald-400">
                      <span>Ingresos del día:</span>
                      <span className="font-mono font-bold">+{currencySymbol}{safeIncome.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-rose-400">
                      <span>Gastos del día:</span>
                      <span className="font-mono font-bold">-{currencySymbol}{safeExpense.toFixed(2)}</span>
                    </div>
                    <div className="pt-1 border-t border-zinc-800 flex items-center justify-between gap-4 text-indigo-300 font-bold">
                      <span>Balance Acumulado:</span>
                      <span className="font-mono font-extrabold">
                        {safeCumulative >= 0 ? '+' : ''}{currencySymbol}{safeCumulative.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />

          <Area
            type="monotone"
            dataKey="cumulativeBalance"
            stroke="#6366f1"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#balanceGrad)"
            name="Balance Acumulado"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
