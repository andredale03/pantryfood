import { useState } from 'react';
import { X, ScanLine } from 'lucide-react';
import { clsx } from 'clsx';
import BarcodeScanner from './BarcodeScanner';
import { GlassCard } from './ui/GlassCard';

const CATEGORIES = [
  { id: 'Freschi', icon: '🥦', label: 'Freschi' },
  { id: 'Dispensa', icon: '🥫', label: 'Dispensa' },
  { id: 'Surgelati', icon: '❄️', label: 'Surgelati' },
  { id: 'Bevande', icon: '🥤', label: 'Bevande' },
  { id: 'Altro', icon: '📦', label: 'Altro' },
];

export default function AddProductForm({ onAdd, onClose, embedded = false }) {
  const [name, setName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState('Dispensa');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !expiryDate) return;
    // Convert price to number, default to 0 if empty
    const numPrice = price ? parseFloat(price) : 0;
    const qty = Number(quantity);

    // Create N products if quantity > 1 (each with quantity = 1)
    if (qty > 1) {
      for (let i = 0; i < qty; i++) {
        onAdd({ name, expiryDate, category, quantity: 1, price: numPrice });
      }
    } else {
      onAdd({ name, expiryDate, category, quantity: 1, price: numPrice });
    }

    if (onClose) onClose();
  };

  const handleScanFound = (productName) => {
    setName(productName);
    setIsScannerOpen(false);
  };

  // Form JSX
  const formContent = (
    <form onSubmit={handleSubmit} className={clsx("space-y-6", !embedded && "p-6")}>
      {/* Input Nome + Barcode */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Nome Prodotto</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-3.5 bg-gray-50 border border-gray-200 dark:bg-black dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 font-medium text-lg dark:text-white"
            placeholder="Es. Latte"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="flex-none w-[54px] h-[54px] flex items-center justify-center bg-gray-900 text-white dark:bg-white/10 dark:text-white rounded-2xl hover:scale-105 active:scale-95 transition-all"
            title="Scansiona Barcode"
          >
            <ScanLine size={24} />
          </button>
        </div>
      </div>

      {/* Quantità e Prezzo */}
      <div className="flex flex-col gap-4">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Quantità</label>
          <div className="flex items-center bg-gray-50 border border-gray-200 dark:bg-black dark:border-white/10 rounded-2xl px-4 py-3.5">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-full bg-white dark:bg-white/10 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold hover:scale-110 transition active:scale-95"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="flex-1 bg-transparent text-center font-bold text-lg outline-none dark:text-white"
            />
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-full bg-white dark:bg-white/10 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold hover:scale-110 transition active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Prezzo (€)</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 dark:bg-black dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 font-medium text-lg dark:text-white text-right"
          />
        </div>
      </div>

      {/* Categoria */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Categoria</label>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={clsx(
                "flex flex-col items-center justify-center py-3 rounded-2xl border transition-all duration-200",
                category === cat.id
                  ? "bg-gray-900 text-white border-transparent dark:bg-white dark:text-black shadow-md"
                  : "bg-gray-50 border-gray-100 text-gray-500 dark:bg-black dark:border-white/5 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
              )}
            >
              <span className="text-2xl mb-1 filter drop-shadow-sm">{cat.icon}</span>
              <span className="text-[10px] font-bold tracking-wide">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Scadenza */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Data di Scadenza</label>
        <input
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          min="2024-01-01"
          max="2030-12-31"
          className="w-full max-w-full box-border px-4 py-3.5 bg-gray-50 border border-gray-200 dark:bg-black dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-medium text-lg text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
          style={{ textAlign: 'left' }}
        />
      </div>

      <div className="pt-4 pb-2">
        <button
          type="submit"
          disabled={!name || !expiryDate}
          className="w-full bg-blue-600 text-white dark:bg-pantry-accent-blue py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          Salva in Dispensa
        </button>
      </div>

      {isScannerOpen && (
        <BarcodeScanner
          onFound={handleScanFound}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </form>
  );

  // Render Logic
  if (embedded) {
    return formContent;
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 animate-fade-in-up">
      <div className="w-full h-full sm:h-auto sm:max-w-md p-4 flex flex-col justify-end sm:justify-center">
        <GlassCard intensity="high" className="w-full max-h-[90vh] overflow-y-auto p-0 border-white/80 dark:border-white/10 shadow-none rounded-3xl sm:rounded-[32px]">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-pantry-bg-secondary/80 sticky top-0 z-10 backdrop-blur-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nuovo Prodotto</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-300" />
            </button>
          </div>

          {formContent}
        </GlassCard>
      </div>
    </div>
  );
}
