import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Calendar,
  CreditCard,
  Tag,
  Check
} from 'lucide-react';
import { Category, Transaction } from '../../types';
import { CategoryIcon } from '../ui/CategoryIcon';
import { useToast } from '../ui/Toast';
import { NLPQuickInput } from './NLPQuickInput';

interface QuickTransactionModalProps {
  categories: Category[];
  currencySymbol: string;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

const QUICK_AMOUNTS = [5, 10, 25, 50, 100, 250];

const PAYMENT_METHODS = [
  'Tarjeta de Débito',
  'Tarjeta de Crédito',
  'Efectivo',
  'Transferencia',
] as const;

export function QuickTransactionModal({
  categories,
  currencySymbol,
  onAddTransaction,
  isOpen,
  onClose,
  onOpen,
}: QuickTransactionModalProps) {
  const { showToast } = useToast();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<
    'Efectivo' | 'Tarjeta de Débito' | 'Tarjeta de Crédito' | 'Transferencia'
  >('Tarjeta de Débito');

  // Filter categories by selected type
  const availableCategories = categories.filter((c) => c.type === type);

  // Default first category
  useEffect(() => {
    if (availableCategories.length > 0) {
      setCategoryId(availableCategories[0].id);
    }
  }, [type, categories]);

  if (!isOpen) {
    return (
      <button
        onClick={onOpen}
        id="quick-add-fab"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-full shadow-2xl shadow-indigo-600/50 active:scale-95 transition-all duration-200 font-extrabold text-sm border border-indigo-400/30"
        title="Registrar nuevo movimiento"
      >
        <Plus className="w-5 h-5" />
        <span className="hidden sm:inline">Nuevo Registro</span>
      </button>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Por favor introduce un monto válido mayor a 0', 'error');
      return;
    }

    if (!description.trim()) {
      showToast('Por favor añade una breve descripción', 'error');
      return;
    }

    onAddTransaction({
      amount: numAmount,
      description: description.trim(),
      categoryId: categoryId || availableCategories[0]?.id || 'cat-general',
      date,
      type,
      paymentMethod,
    });

    showToast(
      `${type === 'expense' ? 'Gasto' : 'Ingreso'} de ${currencySymbol}${numAmount.toFixed(2)} guardado con éxito`,
      'success'
    );

    // Reset & close
    setAmount('');
    setDescription('');
    onClose();
  };

  const handleApplyNLP = (parsed: {
    amount: number;
    description: string;
    type: 'expense' | 'income';
    categoryId: string;
    paymentMethod: 'Efectivo' | 'Tarjeta de Débito' | 'Tarjeta de Crédito' | 'Transferencia';
  }) => {
    setType(parsed.type);
    setAmount(parsed.amount.toString());
    setDescription(parsed.description);
    setCategoryId(parsed.categoryId);
    setPaymentMethod(parsed.paymentMethod);
    showToast('¡Datos autocompletados desde texto!', 'info');
  };

  const handleQuickAmount = (val: number) => {
    const cur = parseFloat(amount) || 0;
    setAmount((cur + val).toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Nuevo Movimiento
              </h3>
              <p className="text-[11px] text-zinc-400">Registra un gasto o ingreso al instante</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NLP Natural Language Input Assistant */}
        <NLPQuickInput
          categories={categories}
          currencySymbol={currencySymbol}
          onApplyParsed={handleApplyNLP}
        />

        {/* Type Toggle: Gasto vs Ingreso */}
        <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              type === 'expense'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Registrar Gasto</span>
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Registrar Ingreso</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount field */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
              Monto ({currencySymbol})
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xl font-black text-zinc-400">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Quick amounts */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                >
                  +{currencySymbol}{val}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
              Descripción o Concepto
            </label>
            <input
              type="text"
              placeholder="ej. Supermercado semanal, Combustible, Almuerzo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Selector with visual chips */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5">
              Categoría
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
              {availableCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-left border transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} size={13} />
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" />
                Método de Pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 rounded-2xl text-white text-xs font-black shadow-lg transition-transform active:scale-95 ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              Confirmar {type === 'expense' ? 'Gasto' : 'Ingreso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
