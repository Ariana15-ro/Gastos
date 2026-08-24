import React, { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, Check, X, ShieldAlert } from 'lucide-react';
import { Category, TransactionType } from '../../types';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from '../../lib/constants';
import { CategoryIcon } from '../ui/CategoryIcon';
import { useToast } from '../ui/Toast';

interface CategoryManagerProps {
  categories: Category[];
  onSaveCategories: (categories: Category[]) => void;
}

export function CategoryManager({ categories, onSaveCategories }: CategoryManagerProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState('#3b82f6');

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setType(activeTab);
    setIcon(activeTab === 'expense' ? 'ShoppingBag' : 'Wallet');
    setColor(activeTab === 'expense' ? '#f59e0b' : '#10b981');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setIcon(cat.icon);
    setColor(cat.color);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Por favor introduce un nombre para la categoría', 'error');
      return;
    }

    if (editingCategory) {
      // Update
      const updated = categories.map((c) =>
        c.id === editingCategory.id ? { ...c, name: name.trim(), type, icon, color } : c
      );
      onSaveCategories(updated);
      showToast('Categoría actualizada', 'success');
    } else {
      // Create
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: name.trim(),
        type,
        icon,
        color,
      };
      onSaveCategories([...categories, newCat]);
      showToast('Nueva categoría creada', 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (categories.length <= 2) {
      showToast('Debes mantener al menos 2 categorías', 'error');
      return;
    }
    const updated = categories.filter((c) => c.id !== id);
    onSaveCategories(updated);
    showToast('Categoría eliminada', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Categorías Personalizadas
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Organiza tus finanzas a tu medida con colores e iconos intuitivos
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Tabs for Gastos vs Ingresos */}
      <div className="flex gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'expense'
              ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          Categorías de Gasto ({categories.filter((c) => c.type === 'expense').length})
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'income'
              ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          Categorías de Ingreso ({categories.filter((c) => c.type === 'income').length})
        </button>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              >
                <CategoryIcon name={cat.icon} size={20} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {cat.name}
                </h4>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                  {cat.type === 'expense' ? 'Gasto' : 'Ingreso'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleOpenEdit(cat)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Editar categoría"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Eliminar categoría"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Category Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    type === 'expense' ? 'bg-rose-500 text-white' : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    type === 'income' ? 'bg-emerald-500 text-white' : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Ingreso
                </button>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                  Nombre de la Categoría
                </label>
                <input
                  type="text"
                  placeholder="Ej: Mascotas, Suscripciones, Gimnasio..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Color selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Color Identificador
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                        color === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Icono
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50">
                  {AVAILABLE_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                        icon === ic
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <CategoryIcon name={ic} size={18} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview chip */}
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Vista Previa:</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: color }}
                  >
                    <CategoryIcon name={icon} size={14} />
                  </div>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {name || 'Mi Categoría'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                >
                  {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
