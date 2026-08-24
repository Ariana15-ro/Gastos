export type TransactionType = 'income' | 'expense';

export type CategoryClassification = 'needs' | 'wants' | 'savings'; // 50/30/20 rule

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  classification?: CategoryClassification;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  paymentMethod?: 'Efectivo' | 'Tarjeta de Débito' | 'Tarjeta de Crédito' | 'Transferencia';
  notes?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  limit: number;
  period: 'monthly';
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  billingCycle: 'monthly' | 'yearly';
  billingDay: number; // 1 to 31
  icon: string;
  color: string;
  active: boolean;
}

export interface UserSettings {
  currency: string;
  currencySymbol: string;
  userName: string;
  monthlySavingsGoal: number;
  theme: 'light' | 'dark' | 'system';
}

export type ActiveTab = 'dashboard' | 'transactions' | 'analytics' | 'budgets' | 'subscriptions' | 'categories' | 'settings';

export interface MonthlyStats {
  monthKey: string; // YYYY-MM
  monthName: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
}

export interface HealthScoreResult {
  score: number; // 0 - 100
  label: 'Excelente' | 'Muy Bueno' | 'Estable' | 'En Riesgo' | 'Crítico';
  color: string;
  description: string;
  tips: string[];
}

export interface Rule503020Breakdown {
  needs: { spent: number; target: number; percentage: number };
  wants: { spent: number; target: number; percentage: number };
  savings: { spent: number; target: number; percentage: number };
}
