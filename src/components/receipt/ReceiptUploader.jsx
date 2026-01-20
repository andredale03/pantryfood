import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { Camera, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function ReceiptUploader({ onScanComplete }) {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setStatus('Initializing OCR...');

    try {
      // CORREZIONE: In Tesseract v5 passiamo lingua e logger direttamente qui
      // 'ita+eng' = lingue, 1 = OEM (LSTM default), { logger } = opzioni
      const worker = await Tesseract.createWorker('ita+eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
            setStatus(`Scanning... ${Math.round(m.progress * 100)}%`);
          } else {
            setStatus(m.status);
          }
        }
      });

      // NON serve più chiamare .loadLanguage() o .initialize() manualmente
      
      setStatus('Recognizing text...');
      const { data: { text } } = await worker.recognize(file);
      
      await worker.terminate();
      
      setStatus('Parsing locally...');
      onScanComplete(text);

    } catch (error) {
      console.error('OCR Error:', error);
      setStatus('Error scanning receipt');
      alert('Failed to scan receipt. Please try again.');
    } finally {
      setIsScanning(false);
      setProgress(0);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Scansiona Scontrino</h3>
      
      {isScanning ? (
        <div className="flex flex-col items-center justify-center py-6">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
          <p className="text-sm text-gray-500">{status}</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Camera className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 font-medium">Scatta foto o carica file</p>
            <p className="text-xs text-gray-400 mt-1">Supporta .jpg, .png</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            capture="environment"
            onChange={handleImageUpload} 
          />
        </label>
      )}
    </div>
  );
}