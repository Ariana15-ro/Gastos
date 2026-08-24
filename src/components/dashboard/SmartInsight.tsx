import React from 'react';
import { Sparkles, Lightbulb, TrendingDown, Target, ShieldCheck } from 'lucide-react';
import { Transaction, Category, Budget } from '../../types';

interface SmartInsightProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  monthlyIncome: number;
  monthlyExpense: number;
  savingsRate: number;
  currencySymbol: string;
}

export function SmartInsight({
  transactions,
  categories,
  budgets,
  monthlyIncome,
  monthlyExpense,
  savingsRate,
  currencySymbol,
}: SmartInsightProps) {
  // Generate customized insights based on data
  const generateInsightContent = () => {
    const safeIncome = typeof monthlyIncome === 'number' && !isNaN(monthlyIncome) ? monthlyIncome : 0;
    const safeExpense = typeof monthlyExpense === 'number' && !isNaN(monthlyExpense) ? monthlyExpense : 0;
    const safeSavingsRate = typeof savingsRate === 'number' && !isNaN(savingsRate) ? savingsRate : 0;
    const netBalance = safeIncome - safeExpense;
    
    // Check if expense is zero or low
    if (safeIncome === 0 && safeExpense === 0) {
      return {
        title: 'Comienza tu viaje financiero 🚀',
        text: 'Aún no tienes registros este mes. Agrega tus ingresos y tus primeros gastos para desbloquear recomendaciones personalizadas.',
        type: 'start',
      };
    }

    // Over spending
    if (safeExpense > safeIncome && safeIncome > 0) {
      const deficit = safeExpense - safeIncome;
      return {
        title: 'Alerta de Balance Negativo ⚠️',
        text: `Tus gastos superan tus ingresos por ${currencySymbol}${deficit.toFixed(0)}. Te recomendamos revisar las categorías con mayor consumo y ajustar tus compras discrecionales.`,
        type: 'warning',
      };
    }

    // High savings
    if (safeSavingsRate >= 30) {
      const projectedYearly = (netBalance * 12).toFixed(0);
      return {
        title: '¡Excelente ritmo de ahorro! 🌟',
        text: `Estás ahorrando el ${safeSavingsRate}% de tus ingresos este mes. Si mantienes esta constancia, acumularás un fondo estimado de ${currencySymbol}${projectedYearly} al año.`,
        type: 'success',
      };
    }

    // Normal positive balance
    if (netBalance > 0) {
      return {
        title: 'Insight Financiero FinTrack 💡',
        text: `Has mantenido tus finanzas en positivo con un margen de ahorro de ${currencySymbol}${netBalance.toFixed(0)} (${safeSavingsRate}%). Destinar al menos el 10% a un fondo de emergencia acelerará tu libertad financiera.`,
        type: 'info',
      };
    }

    return {
      title: 'Control Activo de Gastos 📊',
      text: 'Recuerda registrar cada compra pequeña (café, estacionamiento, snacks). Esos microgastos suelen representar hasta el 15% del presupuesto mensual.',
      type: 'tip',
    };
  };

  const insight = generateInsightContent();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-5 text-white shadow-lg border border-indigo-800/60">
      {/* Subtle backdrop glow */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>FinTrack AI Advisor</span>
        </div>

        <h4 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
          {insight.title}
        </h4>

        <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
          {insight.text}
        </p>

        <div className="mt-4 pt-3 border-t border-indigo-800/60 flex items-center justify-between text-xs text-indigo-300/80">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Análisis en tiempo real
          </span>
          <span className="font-medium">
            Tasa de ahorro: <strong className="text-emerald-400">{savingsRate}%</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
