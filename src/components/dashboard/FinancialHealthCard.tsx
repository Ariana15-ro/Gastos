import React from 'react';
import { ShieldCheck, TrendingUp, AlertTriangle, HelpCircle, CheckCircle2 } from 'lucide-react';
import { HealthScoreResult } from '../../types';

interface FinancialHealthCardProps {
  health: HealthScoreResult;
}

export function FinancialHealthCard({ health }: FinancialHealthCardProps) {
  const safeScore = typeof health?.score === 'number' && !isNaN(health.score) ? Math.min(100, Math.max(0, health.score)) : 50;
  const safeColor = health?.color || '#6366f1';
  const safeLabel = health?.label || 'Estable';
  const safeDescription = health?.description || 'Continúa registrando tus finanzas para mejorar tu salud financiera.';
  const safeTips = Array.isArray(health?.tips) ? health.tips : [];

  // SVG circular gauge calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-zinc-200/90 dark:border-zinc-800 shadow-xs space-y-4 relative overflow-hidden">
      {/* Background glow subtle */}
      <div
        className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: safeColor }}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Salud Financiera
            </h3>
            <p className="text-[11px] text-zinc-400">Diagnóstico mensual automatizado</p>
          </div>
        </div>

        <span
          className="px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1"
          style={{ backgroundColor: `${safeColor}20`, color: safeColor }}
        >
          {safeLabel}
        </span>
      </div>

      <div className="flex items-center gap-5">
        {/* Radial Score Meter */}
        <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-zinc-100 dark:stroke-zinc-800"
              strokeWidth="9"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={safeColor}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {safeScore}
            </span>
            <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase">/ 100</span>
          </div>
        </div>

        {/* Text and Advice */}
        <div className="flex-1 space-y-2 min-w-0">
          <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium line-clamp-2">
            {safeDescription}
          </p>

          <div className="space-y-1">
            {safeTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
