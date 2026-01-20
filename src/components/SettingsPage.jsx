import { useState } from 'react';
import { Moon, Sun, Copy, LogOut, Users, Trash2 } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { clsx } from 'clsx';
import { logoutFamily } from '../services/storage';

export default function SettingsPage({ 
  currentTheme, 
  onThemeChange,
  currentFamily,
  locations = [],
  onRemoveLocation
}) {
  const handleLogout = async () => {
    if (confirm("Sei sicuro di voler uscire dalla famiglia?")) {
        await logoutFamily();
        window.location.reload();
    }
  };

  const handleDeleteLocation = async (id) => {
    if (locations.length <= 1) {
        alert("Devi avere almeno una dispensa.");
        return;
    }
    if (confirm("Sei sicuro? I prodotti in questa dispensa potrebbero essere persi.")) {
        await onRemoveLocation(id);
    }
  };


  const copyCode = (code) => {
     if (code) {
         navigator.clipboard.writeText(code);
         alert("Codice copiato negli appunti!");
     }
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white px-1">Impostazioni</h2>

      {/* Theme Section */}
      <GlassCard className="p-5">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Aspetto</h3>
        <div className="flex bg-gray-100 dark:bg-slate-800 p-1.5 rounded-xl">
          <button
            onClick={() => onThemeChange('light')}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all",
              currentTheme === 'light' 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            )}
          >
            <Sun size={18} /> Light
          </button>
          <button
            onClick={() => onThemeChange('dark')}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all",
              currentTheme === 'dark' 
                ? "bg-slate-700 text-white shadow-sm" 
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            )}
          >
            <Moon size={18} /> Dark
          </button>
        </div>
      </GlassCard>

      {/* Family Info Section */}
      {currentFamily && (
        <GlassCard className="p-5 border-blue-100 dark:border-blue-900">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Users size={20} className="text-blue-500" />
                La tua Famiglia
            </h3>
            
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nome Gruppo</label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{currentFamily.name}</p>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Codice Invito</label>
                    <div className="flex gap-2 mt-1">
                        <code className="flex-1 bg-gray-100 dark:bg-black/30 p-3 rounded-xl font-mono text-sm text-gray-600 dark:text-gray-300 break-all border border-gray-200 dark:border-white/10">
                            {currentFamily.id}
                        </code>
                        <button 
                            onClick={() => copyCode(currentFamily.id)}
                            className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 rounded-xl hover:bg-blue-200 transition-colors"
                            title="Copia Codice"
                        >
                            <Copy size={20} />
                        </button>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                    <button 
                        onClick={handleLogout}
                        className="w-full py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut size={18} />
                        Esci dalla Famiglia
                    </button>
                </div>
            </div>
        </GlassCard>
      )}

      {/* Locations Management */}
      <GlassCard className="p-5">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Gestione Dispense (Locations)</h3>
        <div className="space-y-2">
            {locations.map(loc => (
                <div key={loc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                    <span className="font-bold text-gray-800 dark:text-gray-200">{loc.name}</span>
                    {locations.length > 1 && (
                        <button 
                            onClick={() => handleDeleteLocation(loc.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            ))}
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center">
            Puoi aggiungere nuove dispense dalla Home Page.
        </p>
      </GlassCard>
      
      <div className="text-center pb-8 pt-4">
        <p className="text-xs text-gray-400 font-medium">Versione App v1.2.0 (Auto-Update)</p>
      </div>
    </div>
  );
}
