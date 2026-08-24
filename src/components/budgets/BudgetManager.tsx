import React, { useState } from 'react';
import { Wallet, Plus, Edit2, AlertCircle, CheckCircle2, DollarSign, Target, TrendingDown } from 'lucide-react';
import { Budget, Category, Transaction } from '../../types';
import { BudgetProgress } from '../dashboard/BudgetProgress';
import { useToast } from '../ui/Toast';
import confetti from 'canvas-confetti';

interface BudgetManagerProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  currentYear: number;
  currentMonth: number; // 0-indexed
  currencySymbol: string;
  onSaveBudgets: (newBudgets: Budget[]) => void;
}

export function BudgetManager({
  budgets,
  categories,
  transactions,
  currentYear,
  currentMonth,
  currencySymbol,
  onSaveBudgets,
}: BudgetManagerProps) {
  const { showToast } = useToast();
  const [editingBudget, setEditingBudget] = useState<{ categoryId: string; limit: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  // Compute spent amount per category for current month
  const categorySpentMap = new Map<string, number>();
  transactions.forEach((tx) => {
    const [y, m] = tx.date.split('-').map(Number);
    if (y === currentYear && m === currentMonth + 1 && tx.type === 'expense') {
      const current = categorySpentMap.get(tx.categoryId) || 0;
      categorySpentMap.set(tx.categoryId, current + tx.amount);
    }
  });

  // Calculate totals
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpentInBudgets = budgets.reduce((sum, b) => {
    return sum + (categorySpentMap.get(b.categoryId) || 0);
  }, 0);

  const overallPercentage = totalBudgetLimit > 0 ? (totalSpentInBudgets / totalBudgetLimit) * 100 : 0;
  const totalRemaining = Math.max(0, totalBudgetLimit - totalSpentInBudgets);
  const isOverallOver = totalSpentInBudgets > totalBudgetLimit && totalBudgetLimit > 0;

  const handleOpenEdit = (categoryId: string) => {
    const existing = budgets.find((b) => b.categoryId === categoryId);
    setEditingBudget({
      categoryId,
      limit: existing ? existing.limit : 200,
    });
    setIsModalOpen(true);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget) return;

    const limitVal = Number(editingBudget.limit);
    if (isNaN(limitVal) || limitVal < 0) {
      showToast('Por favor introduce un límite válido', 'error');
      return;
    }

    const existingIndex = budgets.findIndex((b) => b.categoryId === editingBudget.categoryId);
    let updatedBudgets: Budget[];

    if (existingIndex >= 0) {
      if (limitVal === 0) {
        // remove budget if limit is 0
        updatedBudgets = budgets.filter((b) => b.categoryId !== editingBudget.categoryId);
      } else {
        updatedBudgets = [...budgets];
        updatedBudgets[existingIndex] = {
          ...updatedBudgets[existingIndex],
          limit: limitVal,
        };
      }
    } else {
      updatedBudgets = [
        ...budgets,
        {
          id: `b-${editingBudget.categoryId}-${Date.now()}`,
          categoryId: editingBudget.categoryId,
          limit: limitVal,
          period: 'monthly',
        },
      ];
    }

    onSaveBudgets(updatedBudgets);
    showToast('Límite de presupuesto actualizado', 'success');
    setIsModalOpen(false);
    setEditingBudget(null);
  };

  const triggerGoodBudgetCelebration = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
    showToast('¡Felicidades! Mantener tus presupuestos impulsa tu patrimonio 🎉', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Presupuestos Mensuales
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Planifica tus límites de gasto por categoría para no entrar en números rojos
          </p>
        </div>

        {!isOverallOver && totalBudgetLimit > 0 && (
          <button
            onClick={triggerGoodBudgetCelebration}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors self-start sm:self-auto"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Presupuesto Saludable</span>
          </button>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Budgeted */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Presupuesto Asignado
          </span>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">
            {currencySymbol}{(totalBudgetLimit ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-zinc-500 mt-1 block">
            Distribuido en {budgets.length} categorías
          </span>
        </div>

        {/* Total Spent */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Gastado este Mes
          </span>
          <div className={`text-2xl font-black mt-1 ${isOverallOver ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-zinc-50'}`}>
            {currencySymbol}{(totalSpentInBudgets ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-zinc-500 mt-1 block">
            {(overallPercentage ?? 0).toFixed(1)}% del límite total
          </span>
        </div>

        {/* Remaining / Available */}
        <div className={`p-5 rounded-2xl border shadow-xs ${isOverallOver ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800' : 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'}`}>
          <span className={`text-xs font-bold uppercase tracking-wider ${isOverallOver ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
            {isOverallOver ? 'Exceso Total' : 'Disponible para Gastar'}
          </span>
          <div className={`text-2xl font-black mt-1 ${isOverallOver ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-800 dark:text-emerald-200'}`}>
            {currencySymbol}{Math.abs((totalBudgetLimit ?? 0) - (totalSpentInBudgets ?? 0)).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-zinc-500 mt-1 block">
            {isOverallOver ? '¡Has superado el límite general!' : 'Dentro del rango de seguridad'}
          </span>
        </div>
      </div>

      {/* Main Budget Progress Grid */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Progreso de Presupuestos por Categoría
          </h3>
          <span className="text-xs text-zinc-400">
            Haz clic en "Ajustar" para modificar límites
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {expenseCategories.map((cat) => {
            const budget = budgets.find((b) => b.categoryId === cat.id);
            const spent = categorySpentMap.get(cat.id) || 0;
            const limit = budget ? budget.limit : 0;

            return (
              <div
                key={cat.id}
                className="relative rounded-2xl border border-zinc-200/70 dark:border-zinc-800 p-4 bg-zinc-50/40 dark:bg-zinc-850/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all flex flex-col justify-between gap-3"
              >
                {limit > 0 ? (
                  <BudgetProgress
                    category={cat.name}
                    categoryIcon={cat.icon}
                    categoryColor={cat.color}
                    spent={spent}
                    limit={limit}
                    currencySymbol={currencySymbol}
                  />
                ) : (
                  <div className="flex items-center justify-between p-2 text-zinc-500 text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: cat.color }}
                      >
                        <Wallet className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{cat.name}</span>
                    </div>
                    <span className="italic text-zinc-400">Sin límite fijado (Gastado: {currencySymbol}{(typeof spent === 'number' && !isNaN(spent) ? spent : 0).toFixed(0)})</span>
                  </div>
                )}

                <div className="flex justify-end pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                  <button
                    onClick={() => handleOpenEdit(cat.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{limit > 0 ? 'Ajustar Límite' : 'Fijar Presupuesto'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Budget Modal */}
      {isModalOpen && editingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Límite para {categories.find((c) => c.id === editingBudget.categoryId)?.name}
            </h3>
            <p className="text-xs text-zinc-500">
              Define el monto máximo mensual que planeas gastar en esta categoría.
            </p>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                  Monto Máximo Mensual ({currencySymbol})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-zinc-400">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    value={editingBudget.limit}
                    onChange={(e) =>
                      setEditingBudget({
                        ...editingBudget,
                        limit: parseFloat(e.target.value) || 0,
                      })
                    }
                    autoFocus
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-lg font-bold text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  Coloca 0 si deseas desactivar el presupuesto de esta categoría.
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                >
                  Guardar Presupuesto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
