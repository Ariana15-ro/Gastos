import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Tv,
  Music,
  Dumbbell,
  Wifi,
  Cloud,
  Film,
  X
} from 'lucide-react';
import { Subscription, Category } from '../../types';
import { useToast } from '../ui/Toast';

interface SubscriptionManagerProps {
  subscriptions: Subscription[];
  categories: Category[];
  currencySymbol: string;
  onSaveSubscriptions: (subs: Subscription[]) => void;
  onAddTransactionDirectly?: (tx: {
    amount: number;
    description: string;
    categoryId: string;
    date: string;
    type: 'expense';
    paymentMethod: 'Tarjeta de Crédito';
  }) => void;
}

export function SubscriptionManager({
  subscriptions,
  categories,
  currencySymbol,
  onSaveSubscriptions,
  onAddTransactionDirectly,
}: SubscriptionManagerProps) {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [billingDay, setBillingDay] = useState(1);
  const [color, setColor] = useState('#6366f1');

  const totalMonthlyCost = subscriptions.reduce((acc, sub) => {
    if (!sub.active) return acc;
    return acc + (sub.billingCycle === 'monthly' ? sub.amount : sub.amount / 12);
  }, 0);

  const totalYearlyCost = totalMonthlyCost * 12;

  const handleAddSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount || parseFloat(amount) <= 0) {
      showToast('Por favor completa los datos de la suscripción', 'error');
      return;
    }

    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      amount: parseFloat(amount),
      categoryId: categoryId || categories[0]?.id || '',
      billingCycle,
      billingDay: Number(billingDay),
      icon: 'CreditCard',
      color,
      active: true,
    };

    onSaveSubscriptions([...subscriptions, newSub]);
    showToast('Suscripción agregada correctamente', 'success');
    setIsModalOpen(false);
    setName('');
    setAmount('');
  };

  const handleToggleActive = (id: string) => {
    const updated = subscriptions.map((s) =>
      s.id === id ? { ...s, active: !s.active } : s
    );
    onSaveSubscriptions(updated);
  };

  const handleDelete = (id: string) => {
    const updated = subscriptions.filter((s) => s.id !== id);
    onSaveSubscriptions(updated);
    showToast('Suscripción eliminada', 'info');
  };

  // Calculate days remaining until next billing
  const getDaysUntilBilling = (day: number) => {
    const today = new Date();
    const currentDay = today.getDate();
    if (day >= currentDay) {
      return day - currentDay;
    }
    const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return daysInCurrentMonth - currentDay + day;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-indigo-900/90 via-zinc-900 to-zinc-900 rounded-3xl p-6 sm:p-8 border border-indigo-500/20 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <CreditCard className="w-3.5 h-3.5" />
            Gestor de Gastos Fijos
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-100">
            Suscripciones y Servicios Recurrentes
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            Controla tus pagos automáticos mensuales para evitar sorpresas en tu estado de cuenta.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Suscripción</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block mb-1">
            Gasto Mensual Fijo
          </span>
          <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
            {currencySymbol}{(typeof totalMonthlyCost === 'number' && !isNaN(totalMonthlyCost) ? totalMonthlyCost : 0).toFixed(2)}
          </span>
          <span className="text-[11px] text-zinc-400 block mt-1">
            En {subscriptions.filter((s) => s.active).length} suscripciones activas
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block mb-1">
            Costo Proyectado Anual
          </span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {currencySymbol}{(typeof totalYearlyCost === 'number' && !isNaN(totalYearlyCost) ? totalYearlyCost : 0).toFixed(2)}
          </span>
          <span className="text-[11px] text-zinc-400 block mt-1">
            Impacto total acumulado en 12 meses
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block mb-1">
            Próximo Cargo Cercano
          </span>
          {subscriptions.length > 0 ? (
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-black text-amber-500">
                {subscriptions[0].name}
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                (Día {subscriptions[0].billingDay})
              </span>
            </div>
          ) : (
            <span className="text-sm font-bold text-zinc-400 mt-1 block">Ninguno</span>
          )}
          <span className="text-[11px] text-zinc-400 block mt-1">
            Recordatorio automático
          </span>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.map((sub) => {
          const daysLeft = getDaysUntilBilling(sub.billingDay);
          const cat = categories.find((c) => c.id === sub.categoryId);

          return (
            <div
              key={sub.id}
              className={`bg-white dark:bg-zinc-900 rounded-3xl p-5 border transition-all duration-200 shadow-xs space-y-4 ${
                sub.active
                  ? 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  : 'border-zinc-200/50 dark:border-zinc-800/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black shadow-md flex-shrink-0"
                    style={{ backgroundColor: sub.color }}
                  >
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                      {sub.name}
                    </h4>
                    <span className="text-[11px] text-zinc-400">
                      {cat?.name || 'Servicio'} • {sub.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(sub.id)}
                  className="text-zinc-400 hover:text-rose-500 p-1 transition-colors"
                  title="Eliminar suscripción"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Pricing & Days */}
              <div className="flex items-baseline justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <div>
                  <span className="text-xs text-zinc-400 block">Tarifa:</span>
                  <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 font-mono">
                    {currencySymbol}{(typeof sub.amount === 'number' && !isNaN(sub.amount) ? sub.amount : 0).toFixed(2)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-zinc-400 block">Renovación:</span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    En {daysLeft} {daysLeft === 1 ? 'día' : 'días'}
                  </span>
                </div>
              </div>

              {/* Status toggle button */}
              <button
                onClick={() => handleToggleActive(sub.id)}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                  sub.active
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                }`}
              >
                {sub.active ? 'Pausar Suscripción' : 'Reactivar Suscripción'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal Nueva Suscripción */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Nueva Suscripción / Pago Fijo
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubscription} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">
                  Nombre del Servicio (ej. Netflix, Spotify, Gimnasio)
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. YouTube Premium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">
                    Costo ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="12.99"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">
                    Día de Cobro (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={billingDay}
                    onChange={(e) => setBillingDay(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">
                  Categoría
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">
                  Color Identificador
                </label>
                <div className="flex gap-2">
                  {['#e50914', '#1db954', '#6366f1', '#0ea5e9', '#f59e0b', '#ec4899'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-indigo-500' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
