import React, { useState, useEffect } from 'react';
import { X, Sparkles, ChefHat, Clock, Flame, Check } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

export default function ExpiringModal({ products, onClose }) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);

  // Stato per i prodotti selezionati (inizialmente tutti selezionati)
  const [selectedIds, setSelectedIds] = useState(new Set(products.map(p => p.id)));

  // Toggle selezione
  const toggleProduct = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const generateRecipe = async () => {
    // Filtriamo solo i prodotti selezionati
    const selectedProducts = products.filter(p => selectedIds.has(p.id));

    if (selectedProducts.length === 0) {
      alert("Seleziona almeno un ingrediente!");
      return;
    }

    setLoading(true);
    try {
      const names = selectedProducts.map(p => p.name);

      const response = await fetch('/api/suggest-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: names })
      });

      if (!response.ok) throw new Error("Errore API");

      const data = await response.json();
      setRecipe(data);
    } catch (error) {
      alert("Lo chef non risponde al momento. Riprova più tardi.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] animate-fade-in-up p-4">
      <GlassCard intensity="high" className="w-full max-w-lg max-h-[85vh] overflow-y-auto p-0 bg-white dark:bg-gray-900 rounded-3xl border border-white/20">

        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-white/10 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-2 text-red-500">
            <ChefHat size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sos Cena</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-white/10 rounded-full hover:opacity-80 transition-colors">
            <X size={20} className="text-gray-500 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!recipe ? (
            <>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200">
                    Seleziona ingredienti:
                  </h3>
                  <span className="text-xs text-gray-500">
                    {selectedIds.size} selezionati
                  </span>
                </div>

                <div className="bg-gray-50 dark:bg-black/20 rounded-2xl p-2 max-h-[40vh] overflow-y-auto border border-gray-100 dark:border-white/5">
                  {products.map(p => {
                    const isSelected = selectedIds.has(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleProduct(p.id)}
                        className={`flex items-center justify-between p-3 mb-2 rounded-xl cursor-pointer transition-all border ${isSelected
                          ? 'bg-white dark:bg-gray-800 border-red-200 dark:border-red-900 shadow-sm'
                          : 'bg-transparent border-transparent opacity-60 hover:opacity-100'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${isSelected ? 'bg-red-500 border-red-500 text-white' : 'border-gray-300 dark:border-gray-600'
                            }`}>
                            {isSelected && <Check size={14} strokeWidth={3} />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{p.name}</p>
                            <p className="text-xs text-red-500 font-medium">
                              Scade il {new Date(p.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={generateRecipe}
                disabled={loading || selectedIds.size === 0}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
              >
                {loading ? 'Lo Chef sta pensando...' : <><Sparkles size={20} /> Genera Ricetta con {selectedIds.size} prodotti</>}
              </button>
            </>
          ) : (
            <div className="space-y-4 animate-fade-in-up">
              {/* VISTA RICETTA - Identica a prima */}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{recipe.title}</h2>

              <div className="flex gap-3 text-sm font-medium text-gray-500">
                <span className="flex items-center gap-1 bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-lg">
                  <Clock size={14} /> {recipe.time}
                </span>
                <span className="flex items-center gap-1 bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-lg">
                  <Flame size={14} /> {recipe.difficulty || 'Media'}
                </span>
              </div>

              <div className="space-y-2 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl">
                <h4 className="font-bold text-xs uppercase tracking-wider text-blue-800 dark:text-blue-300 mb-2">Ingredienti Necessari</h4>
                <ul className="grid grid-cols-1 gap-2 text-sm text-gray-700 dark:text-gray-300">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" /> {ing}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400">Procedimento</h4>
                {recipe.steps.map((step, i) => (
                  <div key={i} className="flex gap-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    <span className="font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/40 w-6 h-6 flex items-center justify-center rounded-full shrink-0 text-xs mt-0.5">
                      {i + 1}
                    </span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setRecipe(null)}
                className="w-full py-3 mt-4 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
              >
                Torna alla selezione
              </button>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}