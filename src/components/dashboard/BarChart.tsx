import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MonthlyDataPoint {
  name: string;
  key: string;
  ingresos: number;
  gastos: number;
  balance: number;
}

interface BarChartComponentProps {
  data: MonthlyDataPoint[];
  currencySymbol?: string;
}

export function BarChartComponent({ data, currencySymbol = '$' }: BarChartComponentProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-zinc-400">
        No hay datos para mostrar
      </div>
    );
  }

  return (
    <div className="h-[320px] w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.15)" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tick={{ fill: '#71717a' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            fontSize={11}
            tick={{ fill: '#71717a' }}
            tickFormatter={(value) => {
              const num = Number(value) || 0;
              return `${currencySymbol}${num >= 1000 ? `${(num / 1000).toFixed(0)}k` : num}`;
            }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(100, 100, 100, 0.06)' }}
            formatter={(value: any, name: any) => [
              `${currencySymbol}${(Number(value) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
              name === 'ingresos' ? 'Ingresos' : name === 'gastos' ? 'Gastos' : 'Balance',
            ]}
            contentStyle={{
              backgroundColor: 'rgba(24, 24, 27, 0.95)',
              color: '#fff',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
              fontSize: '12px',
              padding: '10px 14px',
            }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend
            iconType="circle"
            verticalAlign="top"
            align="right"
            height={36}
            formatter={(value) => (
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 mr-2">
                {value === 'ingresos' ? 'Ingresos' : 'Gastos'}
              </span>
            )}
          />
          <Bar dataKey="ingresos" fill="#10b981" radius={[6, 6, 0, 0]} name="ingresos" maxBarSize={36} />
          <Bar dataKey="gastos" fill="#ef4444" radius={[6, 6, 0, 0]} name="gastos" maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
