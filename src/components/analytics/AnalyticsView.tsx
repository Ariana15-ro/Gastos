import React, { useState, useMemo } from 'react';
import { BarChartComponent } from '../dashboard/BarChart';
import { ExpenseChart } from '../dashboard/ExpenseChart';
import { SmartInsight } from '../dashboard/SmartInsight';
import { Transaction, Category, Budget } from '../../types';
import { getMonthlyTrendData, getCategorySpending, getMonthlyStats } from '../../lib/storage';
import { TrendingUp, TrendingDown, DollarSign, Calendar, PieChart as PieIcon, Award, Activity } from 'lucide-react';

interface AnalyticsViewProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  currentYear: number;
  currentMonth: number;
  currencySymbol: string;
}

export function AnalyticsView({
  transactions,
  categories,
  budgets,
  currentYear,
  currentMonth,
  currencySymbol,
}: AnalyticsViewProps) {
  const [monthsCount, setMonthsCount] = useState<number>(6);

  // Trend data for the bar chart
  const trendData = useMemo(() => {
    return getMonthlyTrendData(transactions, monthsCount);
  }, [transactions, monthsCount]);

  // Current month category spending
  const currentMonthSpending = useMemo(() => {
    return getCategorySpending(transactions, categories, currentYear, currentMonth);
  }, [transactions, categories, currentYear, currentMonth]);

  // Current month stats
  const currentMonthStats = useMemo(() => {
    return getMonthlyStats(transactions, currentYear, currentMonth);
  }, [transactions, currentYear, currentMonth]);

  // Top 5 individual expense transactions
  const topExpenseTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const [y, m] = t.date.split('-').map(Number);
        return y === currentYear && m === currentMonth + 1 && t.type === 'expense';
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions, currentYear, currentMonth]);

  // Average daily expense
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dailyAverageExpense = currentMonthStats.totalExpense / (daysInMonth || 30);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Análisis Financiero
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Compara tus ingresos vs gastos y descubre patrones de consumo
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl shadow-xs self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-zinc-400 ml-2" />
          <button
            onClick={() => setMonthsCount(3)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              monthsCount === 3
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            3 Meses
          </button>
          <button
            onClick={() => setMonthsCount(6)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              monthsCount === 6
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            6 Meses
          </button>
          <button
            onClick={() => setMonthsCount(12)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              monthsCount === 12
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            12 Meses
          </button>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Tendency Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Tendencia Mensual: Ingresos vs Gastos
              </h3>
              <p className="text-xs text-zinc-400">
                Historial de balance en los últimos {monthsCount} meses
              </p>
            </div>
          </div>
          <BarChartComponent data={trendData} currencySymbol={currencySymbol} />
        </div>

        {/* AI Insight Box (1 col) */}
        <div className="flex flex-col gap-6">
          <SmartInsight
            transactions={transactions}
            categories={categories}
            budgets={budgets}
            monthlyIncome={currentMonthStats.totalIncome}
            monthlyExpense={currentMonthStats.totalExpense}
            savingsRate={currentMonthStats.savingsRate}
            currencySymbol={currencySymbol}
          />

          {/* Quick Stat Summary Box */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <Activity className="w-4 h-4 text-indigo-500" />
              <span>Métricas Clave del Mes</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/60">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">Gasto Diario Prom.</span>
                <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {currencySymbol}{(typeof dailyAverageExpense === 'number' && !isNaN(dailyAverageExpense) ? dailyAverageExpense : 0).toFixed(2)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/60">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">Tasa de Ahorro</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {currentMonthStats?.savingsRate ?? 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Row: Distribution Donut & Top Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Distribución por Categorías
              </h3>
              <p className="text-xs text-zinc-400">
                Porcentaje de gasto en cada rubro durante este mes
              </p>
            </div>
          </div>

          <ExpenseChart data={currentMonthSpending} currencySymbol={currencySymbol} />
        </div>

        {/* Top Expenses List */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-rose-500" />
                Mayores Gastos del Mes
              </h3>
              <p className="text-xs text-zinc-400">
                Las 5 compras individuales de mayor importe
              </p>
            </div>
          </div>

          {topExpenseTransactions.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs">
              No hay gastos registrados en el mes actual
            </div>
          ) : (
            <div className="space-y-3">
              {topExpenseTransactions.map((tx, idx) => {
                const cat = categories.find((c) => c.id === tx.categoryId);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-300">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block truncate">
                          {tx.description}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          {tx.date} • {cat?.name || 'General'}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-rose-600 dark:text-rose-400 ml-3">
                      -{currencySymbol}{(tx?.amount ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
