import React, { useState, useEffect } from 'react';
import {
  Category,
  Transaction,
  Budget,
  Subscription,
  UserSettings,
  ActiveTab,
} from './types';
import {
  getStoredCategories,
  saveCategories,
  getStoredTransactions,
  saveTransactions,
  getStoredBudgets,
  saveBudgets,
  getStoredSubscriptions,
  saveSubscriptions,
  getStoredSettings,
  saveSettings,
  getMonthlyStats,
} from './lib/storage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionList } from './components/transactions/TransactionList';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { BudgetManager } from './components/budgets/BudgetManager';
import { SubscriptionManager } from './components/subscriptions/SubscriptionManager';
import { CategoryManager } from './components/categories/CategoryManager';
import { SettingsModal } from './components/settings/SettingsModal';
import { QuickTransactionModal } from './components/transactions/QuickTransactionModal';
import { TransactionDetailModal } from './components/transactions/TransactionDetailModal';
import { ToastProvider } from './components/ui/Toast';

export default function App() {
  const [categories, setCategories] = useState<Category[]>(() => getStoredCategories());
  const [transactions, setTransactions] = useState<Transaction[]>(() => getStoredTransactions());
  const [budgets, setBudgets] = useState<Budget[]>(() => getStoredBudgets());
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => getStoredSubscriptions());
  const [settings, setSettings] = useState<UserSettings>(() => getStoredSettings());

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Selected calendar month/year
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed

  // Modals state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Sync dark class on HTML root element
  useEffect(() => {
    const isDark = settings.theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Sync to localStorage
  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveBudgets(budgets);
  }, [budgets]);

  useEffect(() => {
    saveSubscriptions(subscriptions);
  }, [subscriptions]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Current month stats for sidebar savings pulse
  const currentMonthStats = getMonthlyStats(transactions, currentYear, currentMonth);

  // Toggle Dark/Light Theme
  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    setSettings((prev) => ({ ...prev, theme: nextTheme }));
  };

  // Add new transaction handler
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Update existing transaction
  const handleUpdateTransaction = (updated: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTransaction(null);
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setSelectedTransaction(null);
  };

  // Bulk data reload (for backup import or demo reset)
  const handleDataReload = (data: {
    categories: Category[];
    transactions: Transaction[];
    budgets: Budget[];
    subscriptions?: Subscription[];
    settings: UserSettings;
  }) => {
    setCategories(data.categories);
    setTransactions(data.transactions);
    setBudgets(data.budgets);
    if (data.subscriptions) setSubscriptions(data.subscriptions);
    setSettings(data.settings);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'settings') {
              setIsSettingsOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          savingsRate={currentMonthStats.savingsRate}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 md:pb-8">
          {/* Top Header */}
          <Header
            currentYear={currentYear}
            currentMonth={currentMonth}
            onMonthChange={(y, m) => {
              setCurrentYear(y);
              setCurrentMonth(m);
            }}
            settings={settings}
            onToggleTheme={handleToggleTheme}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          {/* View Controller */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
            {activeTab === 'dashboard' && (
              <DashboardView
                categories={categories}
                transactions={transactions}
                budgets={budgets}
                subscriptions={subscriptions}
                settings={settings}
                currentYear={currentYear}
                currentMonth={currentMonth}
                onNavigateToTransactions={() => setActiveTab('transactions')}
                onNavigateToBudgets={() => setActiveTab('budgets')}
                onNavigateToAnalytics={() => setActiveTab('analytics')}
                onNavigateToSubscriptions={() => setActiveTab('subscriptions')}
                onSelectTransaction={(tx) => setSelectedTransaction(tx)}
                onOpenQuickAdd={() => setIsQuickAddOpen(true)}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionList
                transactions={transactions}
                categories={categories}
                currencySymbol={settings.currencySymbol}
                onSelectTransaction={(tx) => setSelectedTransaction(tx)}
                onOpenQuickAdd={() => setIsQuickAddOpen(true)}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                transactions={transactions}
                categories={categories}
                budgets={budgets}
                currentYear={currentYear}
                currentMonth={currentMonth}
                currencySymbol={settings.currencySymbol}
              />
            )}

            {activeTab === 'budgets' && (
              <BudgetManager
                budgets={budgets}
                categories={categories}
                transactions={transactions}
                currentYear={currentYear}
                currentMonth={currentMonth}
                currencySymbol={settings.currencySymbol}
                onSaveBudgets={(newBudgets) => setBudgets(newBudgets)}
              />
            )}

            {activeTab === 'subscriptions' && (
              <SubscriptionManager
                subscriptions={subscriptions}
                categories={categories}
                currencySymbol={settings.currencySymbol}
                onSaveSubscriptions={(newSubs) => setSubscriptions(newSubs)}
              />
            )}

            {activeTab === 'categories' && (
              <CategoryManager
                categories={categories}
                onSaveCategories={(newCats) => setCategories(newCats)}
              />
            )}
          </main>
        </div>

        {/* Quick Transaction Floating Modal with Natural Language input */}
        <QuickTransactionModal
          categories={categories}
          currencySymbol={settings.currencySymbol}
          onAddTransaction={handleAddTransaction}
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          onOpen={() => setIsQuickAddOpen(true)}
        />

        {/* Transaction Detail & Edit Modal */}
        <TransactionDetailModal
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          transaction={selectedTransaction}
          categories={categories}
          currencySymbol={settings.currencySymbol}
          onSave={handleUpdateTransaction}
          onDelete={handleDeleteTransaction}
        />

        {/* Settings & Backup Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          categories={categories}
          transactions={transactions}
          budgets={budgets}
          onUpdateSettings={(newSettings) => setSettings(newSettings)}
          onDataReload={handleDataReload}
        />
      </div>
    </ToastProvider>
  );
}
