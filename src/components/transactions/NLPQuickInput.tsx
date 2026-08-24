import React, { useState } from 'react';
import { Sparkles, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Category } from '../../types';
import { parseNaturalLanguageInput } from '../../lib/storage';

interface NLPQuickInputProps {
  categories: Category[];
  currencySymbol: string;
  onApplyParsed: (parsed: {
    amount: number;
    description: string;
    type: 'expense' | 'income';
    categoryId: string;
    paymentMethod: 'Efectivo' | 'Tarjeta de Débito' | 'Tarjeta de Crédito' | 'Transferencia';
  }) => void;
}

export function NLPQuickInput({ categories, currencySymbol, onApplyParsed }: NLPQuickInputProps) {
  const [inputPrompt, setInputPrompt] = useState('');

  const handleParseAndApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;

    const result = parseNaturalLanguageInput(inputPrompt, categories);
    if (result.amount && result.amount > 0) {
      onApplyParsed({
        amount: result.amount,
        description: result.description,
        type: result.type,
        categoryId: result.categoryId || categories[0]?.id || '',
        paymentMethod: result.paymentMethod || 'Tarjeta de Débito',
      });
      setInputPrompt('');
    }
  };

  const samplePrompts = [
    'Almuerzo 15.50 con tarjeta de debito',
    'Carga de gasolina 40 credito',
    'Cobré sueldo freelance 350 transferencia',
  ];

  return (
    <div className="p-3.5 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-zinc-900 border border-indigo-500/25 rounded-2xl space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Autocompletar con Lenguaje Natural</span>
      </div>

      <form onSubmit={handleParseAndApply} className="relative flex items-center">
        <input
          type="text"
          placeholder="Escribe: 'Cena con amigos 45 credito'..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-zinc-900/90 border border-indigo-500/30 text-xs text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
        />
        <button
          type="submit"
          className="absolute right-1.5 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-transform active:scale-90"
          title="Autocompletar formulario"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Suggested prompt chips */}
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {samplePrompts.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInputPrompt(s)}
            className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-400 hover:text-zinc-200 border border-zinc-700/50 transition-colors"
          >
            "{s}"
          </button>
        ))}
      </div>
    </div>
  );
}
