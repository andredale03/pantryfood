import { useState } from 'react';
import { Users, LogIn, ArrowRight } from 'lucide-react';
import { joinFamily, createFamily } from '../services/storage';

export default function WelcomeScreen({ onComplete, onCancel, isAdding }) {
  const [view, setView] = useState('welcome'); // welcome, join, create
  const [formData, setFormData] = useState({ name: '', pin: '', inviteCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (view === 'create') {
        result = await createFamily(formData.name, formData.pin);
      } else {
        result = await joinFamily(formData.inviteCode, formData.pin);
      }

      if (result.success) {
        onComplete(result.pantryId);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Errore imprevisto. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'welcome') {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 text-center animate-fade-in-up">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg mb-6">
          <Users size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pantry Family</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-xs mx-auto">
          Gestisci la dispensa insieme ai tuoi coinquilini o familiari.
        </p>

        <div className="w-full max-w-sm space-y-4">
          <button 
            onClick={() => setView('create')}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Users size={20} />
            Crea Nuova Famiglia
          </button>
          
          <button 
            onClick={() => setView('join')}
            className="w-full py-4 bg-white dark:bg-white/10 text-gray-800 dark:text-white font-bold rounded-2xl border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-3"
          >
            <LogIn size={20} />
            Unisciti ad una Famiglia
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col p-6 bg-white dark:bg-gray-900 animate-fade-in-up">
      <button 
        onClick={() => { setView('welcome'); setError(''); }}
        className="self-start p-2 -ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
      >
        ← Indietro
      </button>

      {onCancel && view === 'welcome' && (
        <button 
            onClick={onCancel}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold"
        >
            Annulla
        </button>
      )}

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {view === 'create' ? 'Crea Famiglia' : 'Unisciti alla Famiglia'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
                {view === 'create' 
                    ? 'Scegli un nome e un PIN segreto per il tuo gruppo.' 
                    : 'Inserisci il codice invito ricevuto e il PIN di sicurezza.'}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            {view === 'create' ? (
                <>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome Famiglia</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white font-medium"
                            placeholder="Es. Casa Mare"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Scegli PIN (4 cifre)</label>
                        <input 
                            type="tel" 
                            required
                            maxLength={4}
                            pattern="[0-9]{4}"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white font-medium tracking-widest text-center text-lg"
                            placeholder="0000"
                            value={formData.pin}
                            onChange={e => setFormData({...formData, pin: e.target.value})}
                        />
                    </div>
                </>
            ) : (
                <>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Codice Invito (UUID)</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white font-mono text-sm"
                            placeholder="xxxxxxxx-xxxx-..."
                            value={formData.inviteCode}
                            onChange={e => setFormData({...formData, inviteCode: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">PIN di Accesso</label>
                        <input 
                            type="tel" 
                            required
                            maxLength={4}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white font-medium tracking-widest text-center text-lg"
                            placeholder="••••"
                            value={formData.pin}
                            onChange={e => setFormData({...formData, pin: e.target.value})}
                        />
                    </div>
                </>
            )}

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl font-medium text-center animate-shake">
                    {error}
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                {loading ? 'Attendere...' : (view === 'create' ? 'Crea Gruppo' : 'Entra nel Gruppo')}
                {!loading && <ArrowRight size={20} />}
            </button>
        </form>
      </div>
    </div>
  );
}
