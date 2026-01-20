import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Loader } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

export default function BarcodeScanner({ onFound, onClose }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Dynamic import to avoid SSR issues if any, though standard import is fine for client-side
    import('html5-qrcode').then(({ Html5Qrcode }) => {
       const scanner = new Html5Qrcode("reader");
       scannerRef.current = scanner;

       const config = { fps: 10, qrbox: { width: 250, height: 250 } };
       
       // Prefer rear camera
       scanner.start(
         { facingMode: "environment" }, 
         config, 
         async (decodedText) => {
           // Success callback
           scanner.pause();
           setLoading(true);
           setError(null);

           try {
             // In a real app we might want to validate or fetch data here
             // For now we assume the scan is valid and try to fetch product info
             const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${decodedText}.json`);
             const data = await response.json();

             if (data.status === 1 && data.product && data.product.product_name) {
               onFound(data.product.product_name);
               // Cleanup will happen in return function when component unmounts
               // But we can also stop here if we want to be sure
             } else {
               setError("Prodotto non trovato nel database.");
               setTimeout(() => {
                 setError(null);
                 scanner.resume(); 
               }, 2000);
             }
           } catch (err) {
             setError("Errore di connessione.");
             setTimeout(() => {
                setError(null);
                scanner.resume();
             }, 2000);
           } finally {
             setLoading(false);
           }
         },
         (errorMessage) => {
           // Parse error, ignore mostly
         }
       ).then(() => {
         setLoading(false);
       }).catch(err => {
         console.error("Error starting scanner", err);
         setError("Impossibile avviare la fotocamera.");
         setLoading(false);
       });
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
            scannerRef.current.clear();
        }).catch(err => console.error("Failed to stop scanner", err));
      }
    };
  }, [onFound]); // Removed onClose from dependency to avoid re-triggering

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fade-in-up">
      <GlassCard intensity="high" className="w-full max-w-sm overflow-hidden p-0 bg-white shadow-2xl rounded-3xl">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-800">Scansiona Barcode</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 bg-black min-h-[300px] flex flex-col justify-center relative rounded-b-3xl overflow-hidden">
          <div id="reader" className="w-full h-full rounded-2xl overflow-hidden [&>video]:object-cover [&>video]:w-full [&>video]:h-full"></div>
          
          {loading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 text-white flex-col gap-3 font-medium">
              <Loader className="animate-spin text-blue-500" size={40} />
              <span>Avvio fotocamera...</span>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 p-4 text-center text-red-600 text-sm font-medium border-t border-red-100 animate-pulse">
            {error}
          </div>
        )}
        
        <div className="p-3 text-center text-[10px] text-gray-400 font-bold tracking-widest uppercase bg-gray-50/80">
          Powered by Open Food Facts
        </div>
      </GlassCard>
    </div>
  );
}
