import { useState } from 'react';
import { Trash2, AlertCircle, ShoppingCart } from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';
import { it } from 'date-fns/locale';
import { updateProduct, addToShoppingList } from '../services/storage';
import { GlassCard } from './ui/GlassCard';
import { clsx } from 'clsx';

const CATEGORIES = {
  'Freschi': '🥦',
  'Dispensa': '🥫',
  'Surgelati': '❄️',
  'Bevande': '🥤',
  'Altro': '📦',
};

export default function ProductList({ products, onUpdate }) {
  const [filter, setFilter] = useState('Tutti');
  const [confirmDelete, setConfirmDelete] = useState(null); // ID prodotto
  const [showShopPrompt, setShowShopPrompt] = useState(null); // Oggetto prodotto

  // Action Handlers
  const handleInitialDelete = (id) => {
    setConfirmDelete(id);
  };

  const handleStatusUpdate = async (id, status) => {
    const product = products.find(p => p.id === id);
    if (product) {
       await import('../services/storage').then(mod => mod.finalizeProduct(product, status));
       // We don't save showShopPrompt here because the product is gone, 
       // but we captured 'product' variable above so we can still prompt.
       setConfirmDelete(null);
       setShowShopPrompt(product);
       onUpdate(); // Reload list (item will disappear)
    }
  };

  const handleAddToShoppingList = async (doAdd) => {
    if (doAdd && showShopPrompt) {
      await addToShoppingList({ name: showShopPrompt.name });
    }
    setShowShopPrompt(null);
  };

  // Filter Logic
  const activeProducts = products.filter(p => !p.status || p.status === 'active');
  const filteredProducts = activeProducts.filter(p => {
    if (filter === 'Tutti') return true;
    return p.category === filter;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => 
    new Date(a.expiryDate) - new Date(b.expiryDate)
  );

  if (activeProducts.length === 0 && filter === 'Tutti') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <div className="w-20 h-20 bg-white/30 backdrop-blur-xl rounded-[32px] flex items-center justify-center mb-4 shadow-lg border border-white/40">
           <span className="text-4xl">🍃</span>
        </div>
        <p className="text-lg font-medium">La dispensa è vuota.</p>
        <p className="text-sm opacity-70 mt-1">Premi + per iniziare</p>
      </div>
    );
  }

  return (
    <>
      {/* iOS-style Filter Chips */}
      <div className="flex gap-3 overflow-x-auto pb-6 -mx-5 pl-8 pr-5 no-scrollbar snap-x">
        <button 
          onClick={() => setFilter('Tutti')}
          className={clsx(
            "px-6 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 snap-start border",
            filter === 'Tutti' 
              ? "bg-gray-900 text-white border-transparent dark:bg-white dark:text-gray-900 shadow-md" 
              : "bg-white/40 text-gray-600 border-white/40 dark:bg-pantry-bg-secondary dark:text-white hover:bg-white/60 dark:hover:bg-white/10"
          )}
        >
          Tutti
        </button>
        {Object.entries(CATEGORIES).map(([key, icon]) => (
          <button 
            key={key}
            onClick={() => setFilter(key)}
            className={clsx(
              "px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 snap-start border",
              filter === key 
                ? "bg-gray-900 text-white border-transparent dark:bg-white dark:text-gray-900 shadow-md" 
                : "bg-white/40 text-gray-600 border-white/40 dark:bg-pantry-bg-secondary dark:text-white hover:bg-white/60 dark:hover:bg-white/10"
            )}
          >
            <span className="mr-1.5">{icon}</span> {key}
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 pb-24 auto-rows-fr">
        {sortedProducts.map(product => {
          const days = differenceInDays(parseISO(product.expiryDate), new Date());
          let itemStatusIcon = null;
          
          // Uniform Card Style (Monocolore)
          let statusStyle = ""; 
          let textColor = "text-gray-900 dark:text-pantry-text-primary";
          
          // Logic Colori Date: Red (<3), Yellow (3-5), Green (>5)
          let badgeStyle = "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400";
          itemStatusIcon = null; // Nessuna icona per green
          
          if (days < 3) {
            // < 3 Giorni o Scaduto: ROSSO
            badgeStyle = "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";
            itemStatusIcon = <AlertCircle size={14} className="text-red-600 dark:text-red-400" />;
          } else if (days <= 5) {
            // 3-5 Giorni: GIALLO
            badgeStyle = "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400";
            itemStatusIcon = <AlertCircle size={14} className="text-yellow-600 dark:text-yellow-400" />;
          }

          return (
            <GlassCard 
              key={product.id} 
              className={clsx("p-4 sm:p-5 md:p-6 lg:p-8 transition-all flex flex-col justify-center h-full", statusStyle)}
            >
              <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
                {/* Icona */}
                <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/60 shadow-sm flex items-center justify-center text-2xl md:text-4xl">
                  {CATEGORIES[product.category || 'Dispensa'] || '🥫'}
                </div>
                
                {/* Contenuto Destro: Header (Nome+Btn) e Badge sotto */}
                <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[48px]">
                  <div className="flex items-center justify-between gap-2">
                     <h3 className={clsx("font-bold text-lg md:text-xl lg:text-2xl leading-tight truncate pr-1", textColor)}>{product.name}</h3>
                     <button 
                        onClick={() => handleInitialDelete(product.id)}
                        className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all active:scale-90 -mr-1"
                      >
                        <Trash2 size={18} className="md:w-6 md:h-6" strokeWidth={2.5} />
                      </button>
                  </div>
                  
                  <div className={clsx("self-start inline-flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-bold mt-1 md:mt-2", badgeStyle)}>
                   {itemStatusIcon}
                    <span>
                      {days < 0 ? 'Scaduto il ' : 'Scade il '} 
                      {format(parseISO(product.expiryDate), 'd MMM yyyy', { locale: it }).toUpperCase()}
                    </span>
                    {days >= 0 && days <= 7 && <span className="opacity-80">({days}g)</span>}
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </ul>

      {/* Modal 1: Consume or Waste (Glass Style) */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in-up">
          <GlassCard intensity="high" className="w-full max-w-sm p-8 text-center border-white/80 shadow-2xl">
            <h3 className="text-2xl font-bold mb-8 text-gray-800">Cosa ne hai fatto?</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleStatusUpdate(confirmDelete, 'consumed')}
                className="flex flex-col items-center justify-center p-5 bg-green-50/50 hover:bg-green-100 border border-green-100 text-green-700 rounded-2xl transition hover:scale-105 active:scale-95 duration-200"
              >
                <span className="text-5xl mb-3 drop-shadow-sm">😋</span>
                <span className="font-bold">Mangiato</span>
              </button>
              <button
                onClick={() => handleStatusUpdate(confirmDelete, 'wasted')}
                className="flex flex-col items-center justify-center p-5 bg-red-50/50 hover:bg-red-100 border border-red-100 text-red-700 rounded-2xl transition hover:scale-105 active:scale-95 duration-200"
              >
                <span className="text-5xl mb-3 drop-shadow-sm">🗑️</span>
                <span className="font-bold">Buttato</span>
              </button>
            </div>
            <button 
              onClick={() => setConfirmDelete(null)}
              className="mt-8 text-gray-400 text-sm font-medium hover:text-gray-600"
            >
              Annulla
            </button>
          </GlassCard>
        </div>
      )}

      {/* Modal 2: Add to Shopping List (Glass Style) */}
      {showShopPrompt && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in-up">
          <GlassCard intensity="high" className="w-full max-w-sm p-8 text-center border-white/80 shadow-2xl">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <ShoppingCart size={36} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Lista Spesa?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              Vuoi aggiungere <span className="font-bold text-gray-900 dark:text-white">{showShopPrompt.name}</span> alla lista della spesa?
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => handleAddToShoppingList(false)}
                className="flex-1 py-3.5 border border-gray-200 bg-white text-gray-600 font-bold rounded-xl hover:bg-gray-50 dark:bg-white/10 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/20 transition"
              >
                No
              </button>
              <button
                onClick={() => handleAddToShoppingList(true)}
                className="flex-1 py-3.5 bg-gray-900 text-white dark:bg-white dark:text-black font-bold rounded-xl hover:bg-black shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
              >
                Sì, aggiungi
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
}
