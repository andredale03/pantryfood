import { useState, useEffect } from 'react';
import { Trash2, Check, ShoppingCart, Plus } from 'lucide-react';
import { getShoppingList, addToShoppingList, toggleShoppingItem, deleteShoppingItem } from '../services/storage';
import { GlassCard } from './ui/GlassCard';
import { clsx } from 'clsx';

export default function ShoppingList() {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');

  useEffect(() => {
    loadList();
  }, []);

  const loadList = async () => {
    const list = await getShoppingList();
    const sorted = list.sort((a, b) => Number(a.isBought) - Number(b.isBought));
    setItems(sorted);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    await addToShoppingList({ name: newItemName });
    setNewItemName('');
    await loadList();
  };

  const handleToggle = async (id, isBought) => {
    await toggleShoppingItem(id, isBought);
    await loadList();
  };

  const handleDelete = async (id) => {
    await deleteShoppingItem(id);
    await loadList();
  };

  const clearBought = async () => {
    const boughtItems = items.filter(i => i.isBought);
    for (const item of boughtItems) {
      await deleteShoppingItem(item.id);
    }
    await loadList();
  };

  return (
    <div className="pb-24">
      {/* Input Item */}
      <GlassCard className="p-2 mb-6 flex items-center shadow-lg border-white/60">
        <form onSubmit={handleAdd} className="flex gap-2 w-full">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Aggiungi alla lista..."
            className="flex-1 px-4 py-3 bg-transparent outline-none text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium"
          />
          <button 
            type="submit"
            className="p-3 bg-gray-900 text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            disabled={!newItemName.trim()}
          >
            <Plus size={24} />
          </button>
        </form>
      </GlassCard>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
           <div className="w-20 h-20 bg-white/30 backdrop-blur-xl rounded-[32px] flex items-center justify-center mb-4 shadow-lg border border-white/40">
             <ShoppingCart size={40} className="ml-1" />
           </div>
          <p className="text-lg font-medium">Tutto comprato!</p>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {items.map(item => (
              <GlassCard 
                key={item.id} 
                className={clsx(
                  "flex items-center justify-between p-4 transition-all duration-300",
                  item.isBought ? "opacity-60 grayscale bg-white/20" : "bg-white/50"
                )}
                onClick={() => handleToggle(item.id, item.isBought)}
              >
                <div className="flex items-center gap-4 flex-1 cursor-pointer">
                  <div className={clsx(
                    "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                    item.isBought ? "bg-green-500 border-green-500 text-white scale-110" : "border-gray-400 text-transparent"
                  )}>
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <span className={clsx(
                    "text-lg font-medium transition-all", 
                    item.isBought ? 'line-through text-gray-500' : 'text-gray-800'
                  )}>
                    {item.name}
                  </span>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </GlassCard>
            ))}
          </ul>

          {items.some(i => i.isBought) && (
            <div className="mt-8 text-center">
              <button 
                onClick={clearBought}
                className="px-6 py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition font-medium"
              >
                Rimuovi cancellati
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
