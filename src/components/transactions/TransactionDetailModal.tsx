import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, CreditCard, Tag, AlignLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Category, Transaction, TransactionType } from '../../types';
import { CategoryIcon } from '../ui/CategoryIcon';
import { useToast } from '../ui/Toast';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  categories: Category[];
  currencySymbol: string;
  onSave: (updated: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionDetailModal({
  isOpen,
  onClose,
  transaction,
  categories,
  currencySymbol,
  onSave,
  onDelete,
}: TransactionDetailModalProps) {
  const { showToast } = useToast();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Tarjeta de Débito');
  const [notes, setNotes] = useState<string>('');
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setDescription(transaction.description);
      setCategoryId(transaction.categoryId);
      setDate(transaction.date);
      setPaymentMethod(transaction.paymentMethod || 'Tarjeta de Débito');
      setNotes(transaction.notes || '');
      setShowConfirmDelete(false);
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      showToast('Por favor introduce un monto válido', 'error');
      return;
    }
    if (!description.trim()) {
      showToast('Por favor añade una descripción', 'error');
      return;
    }

    onSave({
      ...transaction,
      amount: numAmount,
      description: description.trim(),
      categoryId: categoryId || filteredCategories[0]?.id || 'cat-general',
      date,
      type,
      paymentMethod: paymentMethod as any,
      notes: notes.trim(),
    });

    showToast('Transacción actualizada correctamente', 'success');
    onClose();
  };

  const handleDelete = () => {
    onDelete(transaction.id);
    showToast('Transacción eliminada', 'info');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-10 my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Editar Movimiento
              </h3>
              <span className="text-xs text-zinc-400">ID: {transaction.id}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  const firstMatch = categories.find((c) => c.type === 'expense')?.id || '';
                  setCategoryId(firstMatch);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Gasto
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  const firstMatch = categories.find((c) => c.type === 'income')?.id || '';
                  setCategoryId(firstMatch);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  type === 'income'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Ingreso
              </button>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                Monto
              </label>
              <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-zinc-400">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-lg font-bold bg-transparent text-zinc-900 dark:text-zinc-100 outline-none"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-900 dark:text-zinc-100 outline-none"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                Categoría
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-900 dark:text-zinc-100 outline-none"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Payment Method */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-xs text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                  Método
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-xs text-zinc-900 dark:text-zinc-100 outline-none"
                >
                  <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                Notas adicionales
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalles opcionales..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-xs text-zinc-900 dark:text-zinc-100 outline-none resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
              {showConfirmDelete ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
                  >
                    Confirmar Eliminar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(false)}
                    className="px-3 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs rounded-xl"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                  title="Eliminar movimiento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Guardar Cambios
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
