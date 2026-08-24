import { Category, Transaction, Budget, Subscription, UserSettings } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Gastos - Necesidades (50%)
  { id: 'cat-vivienda', name: 'Vivienda y Alquiler', type: 'expense', icon: 'Home', color: '#ef4444', classification: 'needs' },
  { id: 'cat-alimentacion', name: 'Alimentación y Super', type: 'expense', icon: 'Utensils', color: '#f59e0b', classification: 'needs' },
  { id: 'cat-servicios', name: 'Servicios (Luz, Agua, Net)', type: 'expense', icon: 'Zap', color: '#06b6d4', classification: 'needs' },
  { id: 'cat-transporte', name: 'Transporte y Movilidad', type: 'expense', icon: 'Car', color: '#3b82f6', classification: 'needs' },
  { id: 'cat-salud', name: 'Salud y Farmacia', type: 'expense', icon: 'HeartPulse', color: '#ec4899', classification: 'needs' },
  { id: 'cat-educacion', name: 'Educación y Cursos', type: 'expense', icon: 'GraduationCap', color: '#14b8a6', classification: 'needs' },
  
  // Gastos - Deseos / Ocio (30%)
  { id: 'cat-ocio', name: 'Ocio y Entretenimiento', type: 'expense', icon: 'Gamepad2', color: '#8b5cf6', classification: 'wants' },
  { id: 'cat-compras', name: 'Compras y Moda', type: 'expense', icon: 'ShoppingBag', color: '#f97316', classification: 'wants' },
  { id: 'cat-restaurantes', name: 'Restaurantes y Salidas', type: 'expense', icon: 'Coffee', color: '#d97706', classification: 'wants' },
  { id: 'cat-viajes', name: 'Viajes y Vacaciones', type: 'expense', icon: 'Plane', color: '#6366f1', classification: 'wants' },
  
  // Gastos - Ahorros / Inversión (20%)
  { id: 'cat-fondo-emergencia', name: 'Fondo de Emergencia', type: 'expense', icon: 'PiggyBank', color: '#10b981', classification: 'savings' },

  // Ingresos
  { id: 'cat-sueldo', name: 'Sueldo Principal', type: 'income', icon: 'Wallet', color: '#10b981' },
  { id: 'cat-freelance', name: 'Trabajos Freelance', type: 'income', icon: 'Briefcase', color: '#059669' },
  { id: 'cat-inversiones', name: 'Inversiones y Rendimientos', type: 'income', icon: 'TrendingUp', color: '#6366f1' },
  { id: 'cat-otros-ingresos', name: 'Otros Ingresos', type: 'income', icon: 'Coins', color: '#84cc16' },
];

export const DEFAULT_BUDGETS: Budget[] = [
  { id: 'b-vivienda', categoryId: 'cat-vivienda', limit: 1200, period: 'monthly' },
  { id: 'b-alimentacion', categoryId: 'cat-alimentacion', limit: 550, period: 'monthly' },
  { id: 'b-transporte', categoryId: 'cat-transporte', limit: 220, period: 'monthly' },
  { id: 'b-ocio', categoryId: 'cat-ocio', limit: 200, period: 'monthly' },
  { id: 'b-servicios', categoryId: 'cat-servicios', limit: 180, period: 'monthly' },
  { id: 'b-salud', categoryId: 'cat-salud', limit: 150, period: 'monthly' },
  { id: 'b-compras', categoryId: 'cat-compras', limit: 250, period: 'monthly' },
  { id: 'b-restaurantes', categoryId: 'cat-restaurantes', limit: 180, period: 'monthly' },
];

export const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub-1', name: 'Netflix Premium 4K', amount: 15.99, categoryId: 'cat-ocio', billingCycle: 'monthly', billingDay: 5, icon: 'Film', color: '#e50914', active: true },
  { id: 'sub-2', name: 'Spotify Familiar', amount: 10.99, categoryId: 'cat-ocio', billingCycle: 'monthly', billingDay: 12, icon: 'Music', color: '#1db954', active: true },
  { id: 'sub-3', name: 'Gimnasio Fitness', amount: 39.00, categoryId: 'cat-salud', billingCycle: 'monthly', billingDay: 1, icon: 'Dumbbell', color: '#0ea5e9', active: true },
  { id: 'sub-4', name: 'Cloud Storage Pro', amount: 9.99, categoryId: 'cat-servicios', billingCycle: 'monthly', billingDay: 20, icon: 'Cloud', color: '#6366f1', active: true },
  { id: 'sub-5', name: 'Fibra Óptica 500M', amount: 45.00, categoryId: 'cat-servicios', billingCycle: 'monthly', billingDay: 15, icon: 'Wifi', color: '#06b6d4', active: true },
];

export const DEFAULT_SETTINGS: UserSettings = {
  currency: 'USD',
  currencySymbol: '$',
  userName: 'Alex FinTrack',
  monthlySavingsGoal: 650,
  theme: 'dark',
};

export const generateInitialTransactions = (): Transaction[] => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const formatDate = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  return [
    {
      id: 'tx-1',
      amount: 3600,
      description: 'Salario Mensual',
      categoryId: 'cat-sueldo',
      date: formatDate(year, month, 1),
      type: 'income',
      paymentMethod: 'Transferencia',
      createdAt: new Date(year, month, 1).toISOString(),
    },
    {
      id: 'tx-2',
      amount: 550,
      description: 'Proyecto Web Freelance',
      categoryId: 'cat-freelance',
      date: formatDate(year, month, 5),
      type: 'income',
      paymentMethod: 'Transferencia',
      createdAt: new Date(year, month, 5).toISOString(),
    },
    {
      id: 'tx-3',
      amount: 950,
      description: 'Alquiler Departamento',
      categoryId: 'cat-vivienda',
      date: formatDate(year, month, 2),
      type: 'expense',
      paymentMethod: 'Transferencia',
      createdAt: new Date(year, month, 2).toISOString(),
    },
    {
      id: 'tx-4',
      amount: 145.50,
      description: 'Supermercado compra mensual',
      categoryId: 'cat-alimentacion',
      date: formatDate(year, month, 4),
      type: 'expense',
      paymentMethod: 'Tarjeta de Débito',
      createdAt: new Date(year, month, 4).toISOString(),
    },
    {
      id: 'tx-5',
      amount: 45.00,
      description: 'Gasolina',
      categoryId: 'cat-transporte',
      date: formatDate(year, month, 6),
      type: 'expense',
      paymentMethod: 'Tarjeta de Crédito',
      createdAt: new Date(year, month, 6).toISOString(),
    },
    {
      id: 'tx-6',
      amount: 39.00,
      description: 'Gimnasio Fitness',
      categoryId: 'cat-salud',
      date: formatDate(year, month, 1),
      type: 'expense',
      paymentMethod: 'Tarjeta de Débito',
      createdAt: new Date(year, month, 1).toISOString(),
    },
    {
      id: 'tx-7',
      amount: 68.00,
      description: 'Cena Restaurante',
      categoryId: 'cat-restaurantes',
      date: formatDate(year, month, 9),
      type: 'expense',
      paymentMethod: 'Tarjeta de Crédito',
      createdAt: new Date(year, month, 9).toISOString(),
    },
    {
      id: 'tx-8',
      amount: 15.99,
      description: 'Netflix 4K',
      categoryId: 'cat-ocio',
      date: formatDate(year, month, 5),
      type: 'expense',
      paymentMethod: 'Tarjeta de Crédito',
      createdAt: new Date(year, month, 5).toISOString(),
    },
    {
      id: 'tx-9',
      amount: 120.00,
      description: 'Ropa Deportiva',
      categoryId: 'cat-compras',
      date: formatDate(year, month, 12),
      type: 'expense',
      paymentMethod: 'Tarjeta de Crédito',
      createdAt: new Date(year, month, 12).toISOString(),
    },
    {
      id: 'tx-10',
      amount: 250.00,
      description: 'Aporte Fondo Emergencia',
      categoryId: 'cat-fondo-emergencia',
      date: formatDate(year, month, 15),
      type: 'expense',
      paymentMethod: 'Transferencia',
      createdAt: new Date(year, month, 15).toISOString(),
    },
    // Mes anterior
    {
      id: 'tx-11',
      amount: 3600,
      description: 'Salario Mensual',
      categoryId: 'cat-sueldo',
      date: formatDate(month === 0 ? year - 1 : year, (month + 11) % 12, 1),
      type: 'income',
      paymentMethod: 'Transferencia',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-12',
      amount: 950,
      description: 'Alquiler Departamento',
      categoryId: 'cat-vivienda',
      date: formatDate(month === 0 ? year - 1 : year, (month + 11) % 12, 2),
      type: 'expense',
      paymentMethod: 'Transferencia',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-13',
      amount: 420,
      description: 'Alimentación Total',
      categoryId: 'cat-alimentacion',
      date: formatDate(month === 0 ? year - 1 : year, (month + 11) % 12, 15),
      type: 'expense',
      paymentMethod: 'Tarjeta de Débito',
      createdAt: new Date().toISOString(),
    },
  ];
};

export const AVAILABLE_ICONS = [
  'Utensils', 'Home', 'Car', 'Gamepad2', 'Zap', 'HeartPulse',
  'ShoppingBag', 'GraduationCap', 'Wallet', 'Briefcase', 'TrendingUp',
  'Coins', 'Plane', 'Coffee', 'Gift', 'Smartphone', 'Film', 'Dumbbell',
  'PiggyBank', 'DollarSign', 'CreditCard', 'Fuel', 'BookOpen', 'Music', 'Cloud', 'Wifi'
];

export const AVAILABLE_COLORS = [
  '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4',
  '#ec4899', '#f97316', '#14b8a6', '#10b981', '#059669',
  '#6366f1', '#84cc16', '#e11d48', '#d97706', '#2563eb'
];
