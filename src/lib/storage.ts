import {
  Category,
  Transaction,
  Budget,
  Subscription,
  UserSettings,
  MonthlyStats,
  HealthScoreResult,
  Rule503020Breakdown,
} from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_BUDGETS,
  DEFAULT_SUBSCRIPTIONS,
  DEFAULT_SETTINGS,
  generateInitialTransactions,
} from './constants';

const KEYS = {
  CATEGORIES: 'fintrack_pro_categories_v2',
  TRANSACTIONS: 'fintrack_pro_transactions_v2',
  BUDGETS: 'fintrack_pro_budgets_v2',
  SUBSCRIPTIONS: 'fintrack_pro_subscriptions_v2',
  SETTINGS: 'fintrack_pro_settings_v2',
};

// CATEGORIES
export function getStoredCategories(): Category[] {
  try {
    const data = localStorage.getItem(KEYS.CATEGORIES);
    if (!data) {
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  try {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {}
}

// TRANSACTIONS
export function getStoredTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    if (!data) {
      const init = generateInitialTransactions();
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(init));
      return init;
    }
    return JSON.parse(data);
  } catch (e) {
    return generateInitialTransactions();
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {}
}

// BUDGETS
export function getStoredBudgets(): Budget[] {
  try {
    const data = localStorage.getItem(KEYS.BUDGETS);
    if (!data) {
      localStorage.setItem(KEYS.BUDGETS, JSON.stringify(DEFAULT_BUDGETS));
      return DEFAULT_BUDGETS;
    }
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_BUDGETS;
  }
}

export function saveBudgets(budgets: Budget[]): void {
  try {
    localStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
  } catch (e) {}
}

// SUBSCRIPTIONS
export function getStoredSubscriptions(): Subscription[] {
  try {
    const data = localStorage.getItem(KEYS.SUBSCRIPTIONS);
    if (!data) {
      localStorage.setItem(KEYS.SUBSCRIPTIONS, JSON.stringify(DEFAULT_SUBSCRIPTIONS));
      return DEFAULT_SUBSCRIPTIONS;
    }
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_SUBSCRIPTIONS;
  }
}

export function saveSubscriptions(subscriptions: Subscription[]): void {
  try {
    localStorage.setItem(KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
  } catch (e) {}
}

// SETTINGS
export function getStoredSettings(): UserSettings {
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    if (!data) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {}
}

// CALCULATE MONTHLY STATS
export function getMonthlyStats(
  transactions: Transaction[],
  year: number,
  month: number
): MonthlyStats {
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((tx) => {
    const [tYear, tMonth] = tx.date.split('-').map(Number);
    if (tYear === year && tMonth === month + 1) {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
      }
    }
  });

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netBalance / totalIncome) * 100) : 0;

  return {
    monthKey,
    monthName: `${monthNames[month]} ${year}`,
    totalIncome,
    totalExpense,
    netBalance,
    savingsRate: Math.max(0, savingsRate),
  };
}

// 50/30/20 RULE CALCULATION
export function calculate503020Rule(
  transactions: Transaction[],
  categories: Category[],
  year: number,
  month: number,
  totalIncome: number
): Rule503020Breakdown {
  const catMap = new Map(categories.map((c) => [c.id, c]));

  let needsSpent = 0;
  let wantsSpent = 0;
  let savingsSpent = 0;

  transactions.forEach((tx) => {
    const [tYear, tMonth] = tx.date.split('-').map(Number);
    if (tYear === year && tMonth === month + 1 && tx.type === 'expense') {
      const cat = catMap.get(tx.categoryId);
      const classification = cat?.classification || 'wants';

      if (classification === 'needs') {
        needsSpent += tx.amount;
      } else if (classification === 'savings') {
        savingsSpent += tx.amount;
      } else {
        wantsSpent += tx.amount;
      }
    }
  });

  const targetIncome = totalIncome > 0 ? totalIncome : (needsSpent + wantsSpent + savingsSpent) || 1000;
  const targetNeeds = targetIncome * 0.50;
  const targetWants = targetIncome * 0.30;
  const targetSavings = targetIncome * 0.20;

  return {
    needs: {
      spent: needsSpent,
      target: targetNeeds,
      percentage: totalIncome > 0 ? Math.round((needsSpent / totalIncome) * 100) : 0,
    },
    wants: {
      spent: wantsSpent,
      target: targetWants,
      percentage: totalIncome > 0 ? Math.round((wantsSpent / totalIncome) * 100) : 0,
    },
    savings: {
      spent: savingsSpent,
      target: targetSavings,
      percentage: totalIncome > 0 ? Math.round((savingsSpent / totalIncome) * 100) : 0,
    },
  };
}

// FINANCIAL HEALTH SCORE (0-100)
export function calculateHealthScore(
  monthlyIncome: number,
  monthlyExpense: number,
  budgets: Budget[],
  transactions: Transaction[],
  categories: Category[],
  year: number,
  month: number
): HealthScoreResult {
  if (monthlyIncome === 0 && monthlyExpense === 0) {
    return {
      score: 70,
      label: 'Estable',
      color: '#10b981',
      description: 'Sin movimientos suficientes registrados en este mes aún.',
      tips: ['Registra tus ingresos y gastos para calcular tu puntuación en tiempo real.'],
    };
  }

  let score = 50;
  const tips: string[] = [];

  // 1. Savings rate component (+/- 30 pts)
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : -100;
  if (savingsRate >= 30) {
    score += 30;
    tips.push('Excelente tasa de ahorro (+30%). Tu patrimonio mensual crece a buen ritmo.');
  } else if (savingsRate >= 20) {
    score += 22;
    tips.push('Cumples la meta de la regla 50/30/20 ahorrando al menos un 20%.');
  } else if (savingsRate >= 10) {
    score += 10;
    tips.push('Ahorro moderado (10-20%). Intenta recortar compras no esenciales.');
  } else if (savingsRate > 0) {
    score += 2;
    tips.push('Tu margen de ahorro es menor al 10%. Estás cerca de gastar todo lo que ingresas.');
  } else {
    score -= 25;
    tips.push('Déficit mensual: Tus gastos superan tus ingresos. Revisa tus gastos urgentes.');
  }

  // 2. Budget adherence component (+/- 20 pts)
  const spentMap = new Map<string, number>();
  transactions.forEach((tx) => {
    const [tY, tM] = tx.date.split('-').map(Number);
    if (tY === year && tM === month + 1 && tx.type === 'expense') {
      spentMap.set(tx.categoryId, (spentMap.get(tx.categoryId) || 0) + tx.amount);
    }
  });

  let overBudgetCount = 0;
  budgets.forEach((b) => {
    const spent = spentMap.get(b.categoryId) || 0;
    if (spent > b.limit) overBudgetCount++;
  });

  if (budgets.length > 0) {
    if (overBudgetCount === 0) {
      score += 20;
    } else if (overBudgetCount === 1) {
      score += 8;
      tips.push('Has sobrepasado 1 límite de presupuesto este mes.');
    } else {
      score -= 10;
      tips.push(`Has sobrepasado ${overBudgetCount} presupuestos activos.`);
    }
  }

  const finalScore = Math.max(5, Math.min(100, Math.round(score)));

  let label: HealthScoreResult['label'] = 'Estable';
  let color = '#3b82f6';

  if (finalScore >= 85) {
    label = 'Excelente';
    color = '#10b981'; // green
  } else if (finalScore >= 70) {
    label = 'Muy Bueno';
    color = '#06b6d4'; // cyan
  } else if (finalScore >= 50) {
    label = 'Estable';
    color = '#f59e0b'; // amber
  } else if (finalScore >= 35) {
    label = 'En Riesgo';
    color = '#f97316'; // orange
  } else {
    label = 'Crítico';
    color = '#ef4444'; // red
  }

  return {
    score: finalScore,
    label,
    color,
    description: `Puntuación basada en tu balance neto, tasa de ahorro (${Math.round(savingsRate)}%) y cumplimiento de presupuestos.`,
    tips: tips.slice(0, 3),
  };
}

// DAILY CUMULATIVE BALANCE (for Spline Area Chart)
export interface DailyTrendPoint {
  day: number;
  dateStr: string;
  income: number;
  expense: number;
  cumulativeBalance: number;
}

export function getDailyTrends(
  transactions: Transaction[],
  year: number,
  month: number
): DailyTrendPoint[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const points: DailyTrendPoint[] = [];

  let runningBalance = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    let dayIncome = 0;
    let dayExpense = 0;

    transactions.forEach((tx) => {
      if (tx.date === dateStr) {
        if (tx.type === 'income') dayIncome += tx.amount;
        else dayExpense += tx.amount;
      }
    });

    runningBalance += (dayIncome - dayExpense);

    points.push({
      day: d,
      dateStr: `${d}`,
      income: dayIncome,
      expense: dayExpense,
      cumulativeBalance: runningBalance,
    });
  }

  return points;
}

// CATEGORY SPENDING
export interface CategorySpendingItem {
  id: string;
  categoryId: string;
  name: string;
  categoryName: string;
  value: number;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

export function getCategorySpending(
  transactions: Transaction[],
  categories: Category[],
  year: number,
  month: number
): CategorySpendingItem[] {
  const map = new Map<string, number>();

  transactions.forEach((tx) => {
    const [tYear, tMonth] = tx.date.split('-').map(Number);
    if (tYear === year && tMonth === month + 1 && tx.type === 'expense') {
      const current = map.get(tx.categoryId) || 0;
      map.set(tx.categoryId, current + tx.amount);
    }
  });

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const result: CategorySpendingItem[] = [];

  let totalExpense = 0;
  map.forEach((val) => {
    totalExpense += val;
  });

  map.forEach((amount, catId) => {
    const cat = catMap.get(catId);
    if (cat && amount > 0) {
      result.push({
        id: cat.id,
        categoryId: cat.id,
        name: cat.name,
        categoryName: cat.name,
        value: amount,
        amount: amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
        color: cat.color,
        icon: cat.icon,
      });
    }
  });

  return result.sort((a, b) => b.value - a.value);
}

// NATURAL LANGUAGE TRANSACTION PARSER
export interface ParsedNLPResult {
  amount?: number;
  description: string;
  type: 'expense' | 'income';
  categoryId?: string;
  paymentMethod?: 'Efectivo' | 'Tarjeta de Débito' | 'Tarjeta de Crédito' | 'Transferencia';
}

export function parseNaturalLanguageInput(
  text: string,
  categories: Category[]
): ParsedNLPResult {
  const lower = text.toLowerCase();
  let type: 'expense' | 'income' = 'expense';

  // Detect Income keywords
  if (
    lower.includes('cobré') ||
    lower.includes('cobre') ||
    lower.includes('sueldo') ||
    lower.includes('salario') ||
    lower.includes('ingreso') ||
    lower.includes('ganancia') ||
    lower.includes('recibí') ||
    lower.includes('recibi') ||
    lower.includes('pago de cliente')
  ) {
    type = 'income';
  }

  // Extract amount
  const numberMatch = text.match(/(?:[$€S/]\s*)?(\d+(?:[.,]\d{1,2})?)/);
  const amount = numberMatch ? parseFloat(numberMatch[1].replace(',', '.')) : undefined;

  // Detect Payment Method
  let paymentMethod: ParsedNLPResult['paymentMethod'] = 'Tarjeta de Débito';
  if (lower.includes('efectivo') || lower.includes('cash')) {
    paymentMethod = 'Efectivo';
  } else if (lower.includes('credito') || lower.includes('crédito') || lower.includes('tarjeta')) {
    paymentMethod = 'Tarjeta de Crédito';
  } else if (lower.includes('transferencia') || lower.includes('banco')) {
    paymentMethod = 'Transferencia';
  }

  // Detect Category match
  let categoryId: string | undefined;
  const filteredCats = categories.filter((c) => c.type === type);

  // Match keyword to category
  if (lower.includes('super') || lower.includes('comida') || lower.includes('almuerzo') || lower.includes('cena') || lower.includes('cafe') || lower.includes('café') || lower.includes('restaurante')) {
    const found = filteredCats.find((c) => c.id.includes('restaurante') || c.id.includes('alimentacion'));
    if (found) categoryId = found.id;
  } else if (lower.includes('taxi') || lower.includes('gasolina') || lower.includes('uber') || lower.includes('bus') || lower.includes('metro') || lower.includes('transporte')) {
    const found = filteredCats.find((c) => c.id.includes('transporte'));
    if (found) categoryId = found.id;
  } else if (lower.includes('alquiler') || lower.includes('renta') || lower.includes('casa') || lower.includes('depto')) {
    const found = filteredCats.find((c) => c.id.includes('vivienda'));
    if (found) categoryId = found.id;
  } else if (lower.includes('netflix') || lower.includes('cine') || lower.includes('spotify') || lower.includes('juego') || lower.includes('salida')) {
    const found = filteredCats.find((c) => c.id.includes('ocio'));
    if (found) categoryId = found.id;
  } else if (lower.includes('medico') || lower.includes('médico') || lower.includes('farmacia') || lower.includes('gym') || lower.includes('gimnasio')) {
    const found = filteredCats.find((c) => c.id.includes('salud'));
    if (found) categoryId = found.id;
  }

  if (!categoryId && filteredCats.length > 0) {
    categoryId = filteredCats[0].id;
  }

  // Clean description
  let description = text
    .replace(/(?:[$€S/]\s*)?\d+(?:[.,]\d{1,2})?/g, '')
    .replace(/(?:ayer|hoy|mañana|con tarjeta|en efectivo|por transferencia)/gi, '')
    .trim();

  if (!description) {
    description = type === 'income' ? 'Ingreso registrado' : 'Gasto registrado';
  }

  // Capitalize first letter
  description = description.charAt(0).toUpperCase() + description.slice(1);

  return {
    amount,
    description,
    type,
    categoryId,
    paymentMethod,
  };
}

// EXPORT TO CSV
export function exportToCSV(
  transactions: Transaction[],
  categories: Category[],
  currencySymbol: string
): void {
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const headers = ['ID', 'Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto', 'Moneda', 'Método de Pago', 'Notas'];

  const rows = transactions.map((t) => [
    t.id,
    t.date,
    t.type === 'income' ? 'Ingreso' : 'Gasto',
    catMap.get(t.categoryId) || 'General',
    `"${t.description.replace(/"/g, '""')}"`,
    (typeof t?.amount === 'number' && !isNaN(t.amount) ? t.amount : 0).toFixed(2),
    currencySymbol,
    t.paymentMethod || 'No especificado',
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `FinTrack_Movimientos_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const exportTransactionsToCSV = exportToCSV;

export function getMonthlyTrendData(transactions: Transaction[], monthsCount: number = 6) {
  const result = [];
  const today = new Date();
  const monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const stats = getMonthlyStats(transactions, y, m);

    result.push({
      name: `${monthNames[m]} ${y !== today.getFullYear() ? `'${String(y).slice(2)}` : ''}`,
      income: stats.totalIncome,
      expense: stats.totalExpense,
      net: stats.netBalance,
    });
  }

  return result;
}

// EXPORT TO JSON
export function exportBackupJSON(data: {
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  subscriptions?: Subscription[];
  settings: UserSettings;
}): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `FinTrack_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// RESET TO DEMO DATA
export function resetToDemoData() {
  const initTx = generateInitialTransactions();
  localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(initTx));
  localStorage.setItem(KEYS.BUDGETS, JSON.stringify(DEFAULT_BUDGETS));
  localStorage.setItem(KEYS.SUBSCRIPTIONS, JSON.stringify(DEFAULT_SUBSCRIPTIONS));
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));

  return {
    categories: DEFAULT_CATEGORIES,
    transactions: initTx,
    budgets: DEFAULT_BUDGETS,
    subscriptions: DEFAULT_SUBSCRIPTIONS,
    settings: DEFAULT_SETTINGS,
  };
}

export function clearAllData() {
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
}
