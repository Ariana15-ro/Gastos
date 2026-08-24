import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Wallet,
  Tag,
  Settings,
  CreditCard,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { ActiveTab } from '../../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  savingsRate: number;
}

export function Sidebar({ activeTab, onSelectTab, savingsRate }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as ActiveTab, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'transactions' as ActiveTab, icon: Receipt, label: 'Transacciones' },
    { id: 'analytics' as ActiveTab, icon: PieChart, label: 'Análisis' },
    { id: 'budgets' as ActiveTab, icon: Wallet, label: 'Presupuestos' },
    { id: 'subscriptions' as ActiveTab, icon: CreditCard, label: 'Suscripciones' },
    { id: 'categories' as ActiveTab, icon: Tag, label: 'Categorías' },
  ];

  return (
    <>
      {/* Desktop Sidebar (Left) */}
      <aside className="w-64 border-r border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col h-screen sticky top-0 max-md:hidden select-none z-30">
        {/* Brand Logo & Name */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white flex-shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                FinTrack
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">Finanzas Inteligentes</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 space-y-1.5 pt-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl transition-all text-sm font-bold w-full text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mini Savings Pulse widget in sidebar */}
        <div className="p-4 mx-4 mb-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-xs space-y-2">
          <div className="flex items-center justify-between font-bold text-zinc-800 dark:text-zinc-200">
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              Tasa de Ahorro
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold font-mono">{savingsRate}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(savingsRate, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-400">
            Objetivo: Mantener más de 20%
          </p>
        </div>

        {/* Footer Settings & Info */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <button
            onClick={() => onSelectTab('settings')}
            className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Ajustes & Respaldo</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-2 py-1.5 flex justify-around items-center">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-colors text-[10px] font-bold ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="truncate max-w-[48px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
