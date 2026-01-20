import { useState, useEffect } from 'react';
import { getProducts, exportData, importData } from '../services/storage';
import { PieChart, Download, Upload, RefreshCw, AlertTriangle, CheckCircle, Database } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { GlassCard } from './ui/GlassCard';
import { clsx } from 'clsx';

export default function StatsPage() {
  const [stats, setStats] = useState({ consumed: 0, wasted: 0, active: 0 });
  const [importStatus, setImportStatus] = useState(null); 

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = async () => {
    const products = await getProducts();
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    let consumed = 0;
    let wasted = 0;
    let active = 0;

    products.forEach(p => {
      if (p.status === 'active' || !p.status) {
        active++;
      } else if (p.finishedAt) {
        const finishedDate = parseISO(p.finishedAt);
        if (isWithinInterval(finishedDate, { start: monthStart, end: monthEnd })) {
          if (p.status === 'consumed') consumed++;
          if (p.status === 'wasted') wasted++;
        }
      }
    });

    setStats({ consumed, wasted, active });
  };

  const handleExport = async () => {
    const data = await exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pantry-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const success = await importData(json);
        if (success) {
          setImportStatus('success');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setImportStatus('error');
        }
      } catch (err) {
        setImportStatus('error');
      }
    };
    reader.readAsText(file);
  };

  const total = stats.consumed + stats.wasted;
  const consumedPercent = total > 0 ? Math.round((stats.consumed / total) * 100) : 0;

  return (
    <div className="space-y-6 pb-24 pt-24">
      {/* Monthly Stats Card */}
      <GlassCard intensity="high" className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <PieChart className="text-blue-600" />
          Statistiche
        </h2>
        <p className="text-sm text-gray-500 mb-6 capitalize font-medium">
          {format(new Date(), 'MMMM yyyy', { locale: it })}
        </p>

        <div className="flex items-end justify-between mb-6">
           <div className="w-1/2">
             <div className="text-5xl font-bold text-gray-800 tracking-tighter">
               {consumedPercent}%
             </div>
             <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-1">Efficienza Consumo</p>
           </div>
           <div className="w-1/2 flex flex-col gap-2">
              <div className="p-3 bg-green-100/50 rounded-2xl flex justify-between items-center">
                 <span className="text-xs font-bold text-green-800 uppercase">Mangiati</span>
                 <span className="text-xl font-bold text-green-700">{stats.consumed}</span>
              </div>
              <div className="p-3 bg-red-100/50 rounded-2xl flex justify-between items-center">
                 <span className="text-xs font-bold text-red-800 uppercase">Buttati</span>
                 <span className="text-xl font-bold text-red-700">{stats.wasted}</span>
              </div>
           </div>
        </div>

        <div className="pt-4 border-t border-gray-200/50 text-center text-sm text-gray-500 font-medium">
          In dispensa ora: <span className="font-bold text-gray-800">{stats.active}</span> prodotti
        </div>
      </GlassCard>

      {/* Backup Card */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Database className="text-gray-600" />
          Backup Dati
        </h2>
        
        <div className="space-y-3">
          <button 
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 bg-white/50 hover:bg-white/80 border border-white/60 text-gray-800 py-3.5 rounded-2xl transition font-bold text-sm shadow-sm"
          >
            <Download size={18} />
            Esporta Backup JSON
          </button>

          <div className="relative group">
            <input 
              type="file" 
              accept=".json"
              onChange={handleImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <button className="w-full flex items-center justify-center gap-2 bg-blue-50/50 group-hover:bg-blue-100/50 border border-blue-100 text-blue-700 py-3.5 rounded-2xl transition font-bold text-sm">
              <Upload size={18} />
              Importa Backup JSON
            </button>
          </div>
        </div>

        {importStatus === 'success' && (
          <div className="mt-4 p-3 bg-green-100/80 text-green-800 rounded-xl flex items-center gap-2 text-sm font-medium animate-pulse">
            <CheckCircle size={16} /> Importazione riuscita!
          </div>
        )}
        {importStatus === 'error' && (
          <div className="mt-4 p-3 bg-red-100/80 text-red-800 rounded-xl flex items-center gap-2 text-sm font-medium">
            <AlertTriangle size={16} /> Errore nell'importazione.
          </div>
        )}
      </GlassCard>
    </div>
  );
}
