import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Loader, AlertCircle } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center p-4 z-[60] animate-fade-in-up">
      <GlassCard intensity="high" className="w-full max-w-lg overflow-hidden p-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl rounded-3xl md:rounded-[32px] border border-gray-200/50 dark:border-white/10">

        {/* Header - Clean and Minimal */}
        <div className="relative p-6 border-b border-gray-200/50 dark:border-white/10">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                Scansiona Barcode
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Punta la fotocamera sul codice
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 rounded-xl transition-all active:scale-90"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scanner Area - Minimal Glass */}
        <div className="relative p-8 bg-gray-50/50 dark:bg-black/30 min-h-[420px] flex flex-col justify-center backdrop-blur-sm">

          {/* Scanner Frame */}
          <div className="relative mx-auto w-full max-w-sm aspect-square">

            {/* Clean Corner Indicators */}
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* Top Left */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-3 border-l-3 border-gray-400 dark:border-gray-500 rounded-tl-2xl"></div>
              {/* Top Right */}
              <div className="absolute top-0 right-0 w-12 h-12 border-t-3 border-r-3 border-gray-400 dark:border-gray-500 rounded-tr-2xl"></div>
              {/* Bottom Left */}
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-3 border-l-3 border-gray-400 dark:border-gray-500 rounded-bl-2xl"></div>
              {/* Bottom Right */}
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-3 border-r-3 border-gray-400 dark:border-gray-500 rounded-br-2xl"></div>

              {/* Subtle Scanning Line */}
              {!loading && !error && (
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-gray-400 dark:via-gray-500 to-transparent animate-scan-line opacity-60"></div>
              )}
            </div>

            {/* Video Element */}
            <div
              id="reader"
              className="w-full h-full rounded-2xl overflow-hidden shadow-lg [&>video]:object-cover [&>video]:w-full [&>video]:h-full"
            ></div>

            {/* Loading Overlay - Minimal */}
            {loading && (
              <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4">
                    <Loader className="w-16 h-16 text-gray-600 dark:text-gray-400 animate-spin" strokeWidth={2} />
                  </div>
                  <p className="text-gray-900 dark:text-white text-base font-semibold">Avvio fotocamera...</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Attendere</p>
                </div>
              </div>
            )}
          </div>

          {/* Instructions - Clean */}
          {!loading && !error && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-white/10 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Camera attiva</span>
              </div>
            </div>
          )}
        </div>

        {/* Error Message - Minimal */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 text-center border-t border-red-100 dark:border-red-900/30">
            <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle size={20} />
              <span className="font-medium text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Footer - Subtle */}
        <div className="p-3 text-center bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200/50 dark:border-white/10">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Powered by Open Food Facts</span>
        </div>
      </GlassCard>

      {/* Custom CSS for scan line animation */}
      <style jsx>{`
        @keyframes scan-line {
          0% {
            top: 0%;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
        .animate-scan-line {
          animation: scan-line 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
