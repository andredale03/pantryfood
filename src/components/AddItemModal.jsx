import React, { useState } from 'react';
import { X, Camera, PenLine } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import AddProductForm from './AddProductForm';
import ScanReceipt from './receipt/ScanReceipt';

export default function AddItemModal({ onAdd, onClose }) {
  const [mode, setMode] = useState('selection'); // selection, manual, scan

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 animate-fade-in-up">
      {/* Modal Container */}
      <div className="w-full h-full sm:h-auto sm:max-w-md p-4 flex flex-col justify-end sm:justify-center">
        <GlassCard intensity="high" className="w-full max-h-[90vh] overflow-y-auto p-0 border-white/80 dark:border-white/10 shadow-none rounded-3xl sm:rounded-[32px]">
          
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-pantry-bg-secondary/80 sticky top-0 z-10 backdrop-blur-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {mode === 'selection' && 'Aggiungi Prodotto'}
                {mode === 'manual' && 'Nuovo Prodotto'}
                {mode === 'scan' && 'Scansiona Scontrino'}
            </h2>
            <button 
              onClick={onClose} 
              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-300" />
            </button>
          </div>
          
          <div className="p-6">
            {mode === 'selection' && (
                <div className="grid grid-cols-1 gap-4">
                    <button 
                        onClick={() => setMode('scan')}
                        className="flex items-center gap-4 p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg hover:scale-[1.02] active:scale-98 transition-all"
                    >
                        <div className="p-3 bg-white/20 rounded-full">
                            <Camera size={32} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold">Scansiona Scontrino</h3>
                            <p className="text-blue-100 text-xs text-opacity-80">Rilevamento automatico con AI</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => setMode('manual')}
                        className="flex items-center gap-4 p-5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white rounded-2xl shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                    >
                        <div className="p-3 bg-gray-100 dark:bg-white/10 rounded-full text-gray-600 dark:text-gray-300">
                             <PenLine size={32} />
                        </div>
                         <div className="text-left">
                            <h3 className="text-lg font-bold">Inserimento Manuale</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Digita dettagli prodotto</p>
                        </div>
                    </button>
                </div>
            )}

            {mode === 'manual' && (
                <AddProductForm 
                    onAdd={onAdd} 
                    onClose={onClose} 
                    embedded={true} 
                />
            )}

            {mode === 'scan' && (
                <ScanReceipt onClose={onClose} />
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
