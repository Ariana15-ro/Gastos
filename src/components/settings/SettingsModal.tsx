import React, { useState } from 'react';
import { Settings, Download, Upload, RotateCcw, Trash2, Check, X, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { UserSettings, Category, Transaction, Budget } from '../../types';
import { exportBackupJSON, resetToDemoData, clearAllData } from '../../lib/storage';
import { useToast } from '../ui/Toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  onUpdateSettings: (newSettings: UserSettings) => void;
  onDataReload: (data: { categories: Category[]; transactions: Transaction[]; budgets: Budget[]; settings: UserSettings }) => void;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'Dólar Estadounidense ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano ($)' },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano ($)' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino ($)' },
  { code: 'CLP', symbol: '$', name: 'Peso Chileno ($)' },
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano (S/)' },
  { code: 'GBP', symbol: '£', name: 'Libra Esterlina (£)' },
];

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  categories,
  transactions,
  budgets,
  onUpdateSettings,
  onDataReload,
}: SettingsModalProps) {
  const { showToast } = useToast();
  const [currency, setCurrency] = useState(settings.currency);
  const [userName, setUserName] = useState(settings.userName);
  const [savingsGoal, setSavingsGoal] = useState(settings.monthlySavingsGoal.toString());
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const currObj = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
    const newSettings: UserSettings = {
      currency: currObj.code,
      currencySymbol: currObj.symbol,
      userName: userName.trim() || 'Usuario FinTrack',
      monthlySavingsGoal: parseFloat(savingsGoal) || 500,
      theme: settings.theme || 'dark',
    };
    onUpdateSettings(newSettings);
    showToast('Ajustes guardados correctamente', 'success');
    onClose();
  };

  const handleExportBackup = () => {
    exportBackupJSON({
      categories,
      transactions,
      budgets,
      settings,
    });
    showToast('Copia de seguridad descargada', 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.categories && parsed.transactions) {
          onDataReload({
            categories: parsed.categories,
            transactions: parsed.transactions,
            budgets: parsed.budgets || [],
            settings: parsed.settings || settings,
          });
          showToast('Datos restaurados con éxito desde la copia', 'success');
          onClose();
        } else {
          showToast('El archivo no contiene un formato de respaldo válido', 'error');
        }
      } catch (err) {
        showToast('Error al leer el archivo de respaldo', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    const restored = resetToDemoData();
    onDataReload(restored);
    showToast('Datos de demostración restaurados', 'success');
    setConfirmReset(false);
    onClose();
  };

  const handleClearData = () => {
    clearAllData();
    onDataReload({
      categories,
      transactions: [],
      budgets,
      settings,
    });
    showToast('Se han vaciado todas las transacciones', 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Ajustes y Respaldo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
              Nombre de Usuario o Perfil
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
              Moneda Principal
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
              Meta Mensual de Ahorro ({settings.currencySymbol})
            </label>
            <input
              type="number"
              value={savingsGoal}
              onChange={(e) => setSavingsGoal(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            Guardar Preferencias
          </button>
        </form>

        {/* Backup and Data Section */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Administración de Datos y Respaldo
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-2 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-200 transition-colors"
            >
              <Download className="w-4 h-4 text-indigo-500" />
              <span>Exportar JSON</span>
            </button>

            <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer">
              <Upload className="w-4 h-4 text-emerald-500" />
              <span>Importar JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {confirmReset ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
                <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
                  ¿Restaurar los datos de ejemplo iniciales? Se sobrescribirá la información actual.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetDemo}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                  >
                    Confirmar Restauración
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restaurar datos demo de prueba</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Seguro que deseas vaciar todas las transacciones?')) {
                  handleClearData();
                }
              }}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Vaciar todas las transacciones</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
