import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, ArrowUpRight, ArrowDownLeft, Plus, Calendar, Tag } from 'lucide-react';
import { Transaction, Category } from '../../types';
import { CategoryIcon } from '../ui/CategoryIcon';
import { exportTransactionsToCSV } from '../../lib/storage';
import { useToast } from '../ui/Toast';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  currencySymbol: string;
  onSelectTransaction: (transaction: Transaction) => void;
  onOpenQuickAdd: () => void;
}

export function TransactionList({
  transactions,
  categories,
  currencySymbol,
  onSelectTransaction,
  onOpenQuickAdd,
}: TransactionListProps) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'all' or 'YYYY-MM'

  // Map categories for fast lookup
  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  // Extract unique months from transactions for filter dropdown
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.date) {
        monthsSet.add(tx.date.substring(0, 7));
      }
    });
    return Array.from(monthsSet).sort().reverse();
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (filterType !== 'all' && tx.type !== filterType) return false;

      // Category filter
      if (selectedCategoryId !== 'all' && tx.categoryId !== selectedCategoryId) return false;

      // Month filter
      if (selectedMonth !== 'all' && !tx.date.startsWith(selectedMonth)) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const catName = (categoryMap.get(tx.categoryId)?.name || '').toLowerCase();
        const desc = tx.description.toLowerCase();
        const payment = (tx.paymentMethod || '').toLowerCase();
        if (!desc.includes(q) && !catName.includes(q) && !payment.includes(q)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, selectedCategoryId, selectedMonth, searchQuery, categoryMap]);

  // Total summary of filtered view
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  const handleExport = () => {
    exportTransactionsToCSV(filteredTransactions, categories, currencySymbol);
    showToast('Exportación CSV completada', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Transacciones
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Historial completo de movimientos, auditoría y exportación
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-xs transition-colors"
            title="Exportar registros a archivo CSV"
          >
            <Download className="w-4 h-4 text-zinc-500" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por descripción, categoría, método..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Type tabs */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Todos ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Gastos
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'income'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Ingresos
            </button>
          </div>
        </div>

        {/* Second row filters: Category & Month */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-zinc-500 dark:text-zinc-400">Categoría:</span>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.type === 'income' ? 'Ingreso' : 'Gasto'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-zinc-500 dark:text-zinc-400">Mes:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value="all">Todo el histórico</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Quick active filters count */}
          <div className="ml-auto text-zinc-400 text-xs">
            Mostrando <strong>{filteredTransactions.length}</strong> movimientos
          </div>
        </div>
      </div>

      {/* Filtered Mini Summary */}
      <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200/80 dark:border-zinc-800 text-xs">
        <div>
          <span className="text-zinc-500 dark:text-zinc-400 font-medium block">Total Ingresos</span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            +{currencySymbol}{(summary?.income ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div>
          <span className="text-zinc-500 dark:text-zinc-400 font-medium block">Total Gastos</span>
          <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
            -{currencySymbol}{(summary?.expense ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div>
          <span className="text-zinc-500 dark:text-zinc-400 font-medium block">Balance del Filtro</span>
          <span className={`text-sm font-bold ${(summary?.balance ?? 0) >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {(summary?.balance ?? 0) >= 0 ? '+' : ''}{currencySymbol}{(summary?.balance ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Transactions List / Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <Filter className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-300">
              No se encontraron movimientos
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Intenta cambiar los filtros o registra un nuevo ingreso o gasto.
            </p>
            <button
              onClick={onOpenQuickAdd}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar ahora</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredTransactions.map((tx) => {
              const cat = categoryMap.get(tx.categoryId);
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Category Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-xs"
                      style={{ backgroundColor: cat?.color || '#71717a' }}
                    >
                      <CategoryIcon name={cat?.icon || 'Tag'} size={18} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {tx.description}
                        </p>
                        {tx.paymentMethod && (
                          <span className="hidden sm:inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                            {tx.paymentMethod}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span className="font-medium text-zinc-600 dark:text-zinc-300">
                          {cat?.name || 'General'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-4">
                    <div
                      className={`text-sm sm:text-base font-extrabold flex items-center justify-end gap-1 ${
                        isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                      <span>
                        {isIncome ? '+' : '-'}{currencySymbol}{(tx?.amount ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 block group-hover:text-indigo-500 transition-colors">
                      Clic para editar
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
