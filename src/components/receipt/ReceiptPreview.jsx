import React, { useState } from 'react';
import { Trash2, Save, Search, RefreshCw, Plus } from 'lucide-react';
import { searchProductOFF } from '../../services/openfoodfacts';

export default function ReceiptPreview({ initialData, onSave, onCancel }) {
  const [items, setItems] = useState(initialData.items || []);
  const [store, setStore] = useState(initialData.store || '');
  const [date, setDate] = useState(initialData.date || new Date().toISOString().split('T')[0]);
  const [loadingOFF, setLoadingOFF] = useState(null); // id of item being searched

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setItems([...items, { name: '', qty: 1, price: 0, expiry_estimate: '' }]);
  };

  const enrichItem = async (index) => {
    const item = items[index];
    if (!item.name) return;
    
    setLoadingOFF(index);
    const result = await searchProductOFF(item.name);
    setLoadingOFF(null);
    
    if (result.found) {
        // Update with found data (e.g. correct name, maybe category hints for expiry)
        // Note: OFF doesn't always have simple expiry, so we stick to generic logic or categories
        const newItems = [...items];
        newItems[index] = { 
            ...item, 
            name: result.generic_name || item.name,
            // Could add image or barcode if we had a place for it in UI
        };
        setItems(newItems);
        alert(`Found: ${result.generic_name}`);
    } else {
        alert('Product not found in Open Food Facts');
    }
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.price) * Number(item.qty)), 0).toFixed(2);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Review Receipt</h3>
        <span className="text-sm font-medium text-gray-500">Total: {getTotal()}€</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Store</label>
          <input 
            type="text" 
            value={store} 
            onChange={(e) => setStore(e.target.value)}
            className="w-full text-sm p-2 border rounded" 
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-sm p-2 border rounded" 
          />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2 p-2 border rounded bg-gray-50">
            <div className="flex-1 min-w-0">
              <input 
                type="text" 
                value={item.name} 
                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                placeholder="Product Name"
                className="w-full text-base font-medium bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-blue-500 mb-2 py-1 placeholder:text-gray-400"
              />
              <div className="flex flex-wrap gap-2 mt-1">
                 <div className="relative w-20 shrink-0">
                    <input 
                        type="number" 
                        value={item.qty} 
                        onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                        className="w-full text-sm p-2 border rounded-lg bg-white bg-opacity-50"
                        placeholder="Qt"
                    />
                    <span className="absolute top-0 right-1 text-[10px] text-gray-400 h-full flex items-center pointer-events-none">pz</span>
                 </div>
                  <div className="relative w-24 shrink-0">
                    <input 
                        type="number" 
                        step="0.01"
                        value={item.price} 
                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                        className="w-full text-sm p-2 border rounded-lg bg-white bg-opacity-50 pl-5"
                        placeholder="0.00"
                    />
                    <span className="absolute top-0 left-2 text-sm text-gray-400 h-full flex items-center pointer-events-none">€</span>
                  </div>
                  <input 
                    type="date" 
                    value={item.expiry_estimate || ''} 
                    onChange={(e) => handleItemChange(index, 'expiry_estimate', e.target.value)}
                    className="flex-1 min-w-[120px] text-sm p-2 border rounded-lg text-gray-600 bg-white bg-opacity-50"
                  />
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
                <button 
                  onClick={() => enrichItem(index)}
                  disabled={loadingOFF === index}
                  className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                  title="Search Open Food Facts"
                >
                   {loadingOFF === index ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Search className="w-4 h-4"/>}
                </button>
                <button 
                  onClick={() => removeItem(index)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <button 
            onClick={addItem}
            className="flex-1 flex items-center justify-center gap-2 text-sm text-blue-600 font-bold px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
        >
            <Plus className="w-5 h-5" /> Add Item manually
        </button>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button 
          onClick={onCancel}
          className="flex-1 py-3.5 text-gray-600 font-bold bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition-all text-sm"
        >
          Cancel
        </button>
        <button 
          onClick={() => onSave({ items, store, date })}
          className="flex-[2] py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200"
        >
          <Save className="w-5 h-5" /> Confirm & Save
        </button>
      </div>
    </div>
  );
}
