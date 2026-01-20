import React from 'react';
import useWasteStats from '../../hooks/useWasteStats';
import { Loader2, TrendingUp, TrendingDown, DollarSign, Leaf, AlertCircle } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

export default function WasteDashboard() {
  const { stats, loading, error } = useWasteStats();

  if (loading) return (
    <div className="flex justify-center py-10">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  if (error) return <div className="text-red-500 p-4 font-medium">{error}</div>;

  // Simple "Traffic Light" Logic
  const wasteHealth = stats.wastePct < 5 ? 'good' : stats.wastePct < 15 ? 'warning' : 'bad';
  const colorClass = wasteHealth === 'good' ? 'text-green-500' : wasteHealth === 'warning' ? 'text-yellow-500' : 'text-red-500';
  const bgClass = wasteHealth === 'good' ? 'bg-green-100 dark:bg-green-900/20' : wasteHealth === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-red-100 dark:bg-red-900/20';
  
  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
      <div className="text-center mb-6 md:col-span-2 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Riepilogo Sprechi</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">Analisi della tua efficienza</p>
      </div>
      
      {/* Main Score Card */}
      <GlassCard className="p-6 md:p-10 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
          <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center mb-3 md:mb-6 ${bgClass} transition-colors`}>
              {wasteHealth === 'good' && <Leaf size={40} className={`md:w-16 md:h-16 ${colorClass}`} />}
              {wasteHealth === 'warning' && <AlertCircle size={40} className={`md:w-16 md:h-16 ${colorClass}`} />}
              {wasteHealth === 'bad' && <TrendingDown size={40} className={`md:w-16 md:h-16 ${colorClass}`} />}
          </div>
          
          <h3 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-2">
             {100 - stats.wastePct}%
          </h3>
          <p className="text-gray-500 uppercase tracking-widest text-xs md:text-sm font-bold">Punteggio Efficienza</p>
          
          <div className="mt-4 md:mt-6 text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
             {wasteHealth === 'good' && "Ottimo lavoro! Stai sprecando pochissimo."}
             {wasteHealth === 'warning' && "Attenzione, qualche prodotto sta scadendo troppo spesso."}
             {wasteHealth === 'bad' && "C'è molto margine di miglioramento. Controlla le scadenze!"}
          </div>
      </GlassCard>

      {/* KPI GRID - Right column on larger screens */}
      <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-6 h-full">
          <GlassCard className="p-4 md:p-8 flex flex-col justify-center h-full">
             <div className="flex items-center gap-2 md:gap-3 mb-2 text-red-500">
               <TrendingDown size={16} className="md:w-6 md:h-6" />
               <span className="text-xs md:text-sm font-bold uppercase">Soldi Persi (Totale)</span>
             </div>
             <p className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">€{stats.totalWasted.toFixed(2)}</p>
             <p className="text-[10px] md:text-sm text-gray-400 mt-1">{stats.wasteItemsCount} prodotti buttati</p>
          </GlassCard>

          <GlassCard className="p-4 md:p-8 flex flex-col justify-center h-full">
             <div className="flex items-center gap-2 md:gap-3 mb-2 text-green-500">
               <DollarSign size={16} className="md:w-6 md:h-6" />
               <span className="text-xs md:text-sm font-bold uppercase">Valore in Dispensa</span>
             </div>
             <p className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">€{stats.totalPantryValue.toFixed(2)}</p>
             <p className="text-[10px] md:text-sm text-gray-400 mt-1">Prodotti attualmente disponibili</p>
          </GlassCard>
      </div>

    </div>
  );
}
