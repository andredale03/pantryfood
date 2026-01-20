import React, { useState } from 'react';
import ReceiptUploader from './ReceiptUploader';
import ReceiptPreview from './ReceiptPreview';
import { supabaseApi } from '../../services/supabase';
import { Loader2 } from 'lucide-react';

export default function ScanReceipt({ onClose }) {
  const [step, setStep] = useState('upload');
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);

  // --- VERSIONE REALE (OpenAI) ---
  const handleScanComplete = async (rawText) => {
    setStep('parsing');
    setError(null);

    try {
      // Chiamiamo la nostra funzione backend
      const response = await fetch('/api/parse-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText })
      });

      if (!response.ok) {
        throw new Error(`Errore Server: ${response.statusText}`);
      }

      const data = await response.json();

      // Controllo di sicurezza se l'AI restituisce array vuoto
      if (!data.items || data.items.length === 0) {
        alert("Non sono riuscito a trovare prodotti. Riprova con una foto più nitida.");
        setStep('upload');
        return;
      }

      setParsedData(data);
      setStep('preview');

    } catch (err) {
      console.error(err);
      setError('Errore analisi IA. Verifica la connessione o riprova.');
      setStep('upload');
    }
  };

  const handleSave = async (confirmedData) => {
    setStep('saving');

    try {
      const productsToAdd = confirmedData.items.map(item => ({
        name: item.name,
        quantity: item.qty,
        price: item.price,
        expiry_date: item.expiry_estimate || confirmedData.date,
        category: 'Dispensa',
        status: 'active',
        pantry_id: 'default'
      }));

      for (const p of productsToAdd) {
        const { error } = await supabaseApi.addProduct(p);
        if (error) throw error;
      }

      alert('Prodotti salvati su Supabase!');
      if (onClose) onClose();
      else {
        setStep('upload');
        setParsedData(null);
      }

    } catch (e) {
      console.error(e);
      alert('Errore salvataggio: ' + e.message);
      setStep('preview');
    }
  };

  return (
    <div className="max-w-md mx-auto p-2">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-100">
          {error}
        </div>
      )}

      {step === 'upload' && (
        <ReceiptUploader onScanComplete={handleScanComplete} />
      )}

      {step === 'parsing' && (
        <div className="flex flex-col items-center justify-center py-12 bg-white/50 rounded-2xl border border-white/60 shadow-sm backdrop-blur-sm">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-800 font-bold text-lg">Sto leggendo i dati...</p>
          <p className="text-xs text-gray-500 mt-2">Potrebbe richiedere qualche secondo</p>
        </div>
      )}

      {step === 'preview' && parsedData && (
        <ReceiptPreview
          initialData={parsedData}
          onSave={handleSave}
          onCancel={() => setStep('upload')}
        />
      )}

      {step === 'saving' && (
        <div className="flex flex-col items-center justify-center py-12 bg-white/50 rounded-2xl border border-white/60 shadow-sm">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
          <p className="text-gray-800 font-bold text-lg">Salvataggio nel Cloud...</p>
        </div>
      )}
    </div>
  );
}