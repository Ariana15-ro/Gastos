import React, { useMemo } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  Target,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Receipt,
  Plus,
  Activity,
  Layers
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { BudgetProgress } from './BudgetProgress';
import { ExpenseChart } from './ExpenseChart';
import { SmartInsight } from './SmartInsight';
import { BalanceAreaChart } from './BalanceAreaChart';
import { FinancialHealthCard } from './FinancialHealthCard';
import { Rule503020Card } from './Rule503020Card';
import { CategoryIcon } from '../ui/CategoryIcon';
import { Category, Transaction, Budget, UserSettings, Subscription } from '../../types';
import {
  getMonthlyStats,
  getCategorySpending,
  getDailyTrends,
  calculateHealthScore,
  calculate503020Rule,
} from '../../lib/storage';

interface DashboardViewProps {
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  subscriptions?: Subscription[];
  settings: UserSettings;
  currentYear: number;
  currentMonth: number;
  onNavigateToTransactions: () => void;
  onNavigateToBudgets: () => void;
  onNavigateToAnalytics: () => void;
  onNavigateToSubscriptions?: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onOpenQuickAdd: () => void;
}

export function DashboardView({
  categories,
  transactions,
  budgets,
  subscriptions = [],
  settings,
  currentYear,
  currentMonth,
  onNavigateToTransactions,
  onNavigateToBudgets,
  onNavigateToAnalytics,
  onNavigateToSubscriptions,
  onSelectTransaction,
  onOpenQuickAdd,
}: DashboardViewProps) {
  // Current month stats
  const currentStats = useMemo(() => {
    return getMonthlyStats(transactions, currentYear, currentMonth);
  }, [transactions, currentYear, currentMonth]);

  // Previous month stats for comparison percentage
  const prevStats = useMemo(() => {
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    return getMonthlyStats(transactions, prevYear, prevMonth);
  }, [transactions, currentYear, currentMonth]);

  // Percentage changes
  const expenseChangePercent = useMemo(() => {
    if (prevStats.totalExpense === 0) return undefined;
    const diff = ((currentStats.totalExpense - prevStats.totalExpense) / prevStats.totalExpense) * 100;
    return Math.round(diff);
  }, [currentStats.totalExpense, prevStats.totalExpense]);

  const incomeChangePercent = useMemo(() => {
    if (prevStats.totalIncome === 0) return undefined;
    const diff = ((currentStats.totalIncome - prevStats.totalIncome) / prevStats.totalIncome) * 100;
    return Math.round(diff);
  }, [currentStats.totalIncome, prevStats.totalIncome]);

  // Category spending
  const categorySpending = useMemo(() => {
    return getCategorySpending(transactions, categories, currentYear, currentMonth);
  }, [transactions, categories, currentYear, currentMonth]);

  // Daily trends for Spline chart
  const dailyTrends = useMemo(() => {
    return getDailyTrends(transactions, currentYear, currentMonth);
  }, [transactions, currentYear, currentMonth]);

  // Financial health score
  const healthScore = useMemo(() => {
    return calculateHealthScore(
      currentStats.totalIncome,
      currentStats.totalExpense,
      budgets,
      transactions,
      categories,
      currentYear,
      currentMonth
    );
  }, [currentStats, budgets, transactions, categories, currentYear, currentMonth]);

  // 50/30/20 Rule Breakdown
  const ruleBreakdown = useMemo(() => {
    return calculate503020Rule(
      transactions,
      categories,
      currentYear,
      currentMonth,
      currentStats.totalIncome
    );
  }, [transactions, categories, currentYear, currentMonth, currentStats.totalIncome]);

  // Category spent map for budget progress
  const categorySpentMap = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach((tx) => {
      const [y, m] = tx.date.split('-').map(Number);
      if (y === currentYear && m === currentMonth + 1 && tx.type === 'expense') {
        const cur = map.get(tx.categoryId) || 0;
        map.set(tx.categoryId, cur + tx.amount);
      }
    });
    return map;
  }, [transactions, currentYear, currentMonth]);

  // Top 5 recent transactions of the current month
  const recentTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const [y, m] = t.date.split('-').map(Number);
        return y === currentYear && m === currentMonth + 1;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions, currentYear, currentMonth]);

  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  // Savings progress toward user monthly goal
  const savingsProgress = settings.monthlySavingsGoal > 0
    ? Math.min(100, Math.max(0, (currentStats.netBalance / settings.monthlySavingsGoal) * 100))
    : 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top 4 Metrics with Fintech Look */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Balance Neto del Mes"
          amount={currentStats.netBalance}
          currencySymbol={settings.currencySymbol}
          icon={Wallet}
          variant={currentStats.netBalance >= 0 ? 'indigo' : 'rose'}
          subtitle={currentStats.netBalance >= 0 ? 'Superávit disponible' : 'Déficit del mes'}
        />

        <MetricCard
          title="Total Ingresos"
          amount={currentStats.totalIncome}
          currencySymbol={settings.currencySymbol}
          icon={ArrowDownLeft}
          variant="emerald"
          changePercentage={incomeChangePercent}
          isPositiveGood={true}
        />

        <MetricCard
          title="Total Gastos"
          amount={currentStats.totalExpense}
          currencySymbol={settings.currencySymbol}
          icon={ArrowUpRight}
          variant="rose"
          changePercentage={expenseChangePercent}
          isPositiveGood={false}
        />

        <MetricCard
          title="Tasa de Ahorro"
          amount={currentStats?.savingsRate ?? 0}
          currencySymbol="%"
          icon={PiggyBank}
          variant="amber"
          subtitle={`Meta: ${settings?.currencySymbol ?? '$'}${typeof settings?.monthlySavingsGoal === 'number' ? settings.monthlySavingsGoal.toFixed(0) : '0'}`}
        />
      </div>

      {/* NEW: Financial Health & 50/30/20 Rule Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FinancialHealthCard health={healthScore} />
        <Rule503020Card breakdown={ruleBreakdown} currencySymbol={settings?.currencySymbol ?? '$'} />
      </div>

      {/* NEW: Spline Area Chart (Daily Balance Evolution) */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Evolución del Balance Diario
              </h3>
            </div>
            <p className="text-xs text-zinc-400">
              Curva de flujo acumulado día a día durante el período actual
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Flujo en vivo
            </span>
          </div>
        </div>

        <BalanceAreaChart data={dailyTrends} currencySymbol={settings.currencySymbol} />
      </div>

      {/* Main Grid: Left Column (Donut Chart & Transactions) + Right Column (Budgets & AI Insights) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Donut Chart: Gastos por Categoría */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Distribución de Gastos
                </h3>
                <p className="text-xs text-zinc-400">
                  Resumen de consumo por categorías en el mes
                </p>
              </div>
              <button
                onClick={onNavigateToAnalytics}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Ver Análisis</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <ExpenseChart data={categorySpending} currencySymbol={settings.currencySymbol} />
          </div>

          {/* Recent Movements */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-zinc-500" />
                  Últimos Movimientos
                </h3>
                <p className="text-xs text-zinc-400">Transacciones recientes de este período</p>
              </div>
              <button
                onClick={onNavigateToTransactions}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Ver Todos ({transactions.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-xs">
                <p className="font-semibold">No hay movimientos registrados en este mes</p>
                <button
                  onClick={onOpenQuickAdd}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Registrar primer movimiento</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {recentTransactions.map((tx) => {
                  const cat = categoryMap.get(tx.categoryId);
                  const isIncome = tx.type === 'income';

                  return (
                    <div
                      key={tx.id}
                      onClick={() => onSelectTransaction(tx)}
                      className="flex items-center justify-between py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-2 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-xs font-bold"
                          style={{ backgroundColor: cat?.color || '#71717a' }}
                        >
                          <CategoryIcon name={cat?.icon || 'Tag'} size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {tx.description}
                          </p>
                          <span className="text-[11px] text-zinc-400 block">
                            {tx.date} • {cat?.name || 'General'} {tx.paymentMethod ? `• ${tx.paymentMethod}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 ml-3">
                        <span
                          className={`text-xs sm:text-sm font-black font-mono ${
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isIncome ? '+' : '-'}{settings.currencySymbol}
                          {(tx?.amount ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Presupuestos Clave & Smart Insights */}
        <div className="space-y-6">
          {/* FinTrack Smart AI Insight */}
          <SmartInsight
            transactions={transactions}
            categories={categories}
            budgets={budgets}
            monthlyIncome={currentStats.totalIncome}
            monthlyExpense={currentStats.totalExpense}
            savingsRate={currentStats.savingsRate}
            currencySymbol={settings.currencySymbol}
          />

          {/* Presupuestos Clave */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Presupuestos Clave
                </h3>
                <p className="text-xs text-zinc-400">Control de límites del mes</p>
              </div>
              <button
                onClick={onNavigateToBudgets}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Ajustar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {budgets.length === 0 ? (
              <div className="py-6 text-center text-zinc-400 text-xs">
                No tienes presupuestos configurados.
              </div>
            ) : (
              <div className="space-y-3">
                {budgets.slice(0, 4).map((b) => {
                  const cat = categoryMap.get(b.categoryId);
                  if (!cat) return null;
                  const spent = categorySpentMap.get(b.categoryId) || 0;

                  return (
                    <BudgetProgress
                      key={b.id}
                      category={cat.name}
                      categoryIcon={cat.icon}
                      categoryColor={cat.color}
                      spent={spent}
                      limit={b.limit}
                      currencySymbol={settings.currencySymbol}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Monthly Savings Goal Card */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-3xl p-6 border border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <PiggyBank className="w-4 h-4 text-amber-400" />
                Meta de Ahorro Mensual
              </span>
              <span className="text-xs font-bold text-amber-400">
                {(typeof savingsProgress === 'number' && !isNaN(savingsProgress) ? savingsProgress : 0).toFixed(0)}%
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-white font-mono">
                {settings?.currencySymbol ?? '$'}{(typeof currentStats?.netBalance === 'number' && !isNaN(currentStats.netBalance) ? Math.max(0, currentStats.netBalance) : 0).toFixed(0)}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                de {settings?.currencySymbol ?? '$'}{(typeof settings?.monthlySavingsGoal === 'number' && !isNaN(settings.monthlySavingsGoal) ? settings.monthlySavingsGoal : 0).toFixed(0)}
              </span>
            </div>

            <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, typeof savingsProgress === 'number' && !isNaN(savingsProgress) ? savingsProgress : 0)}%` }}
              />
            </div>

            <p className="text-[11px] text-zinc-400">
              {(currentStats?.netBalance ?? 0) >= (settings?.monthlySavingsGoal ?? 0)
                ? '🎉 ¡Has alcanzado tu meta de ahorro para este mes!'
                : `Faltan ${settings?.currencySymbol ?? '$'}${Math.max(0, (settings?.monthlySavingsGoal ?? 0) - Math.max(0, currentStats?.netBalance ?? 0)).toFixed(0)} para cumplir tu objetivo.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
