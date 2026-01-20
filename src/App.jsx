import { useState, useEffect } from 'react';
import { Plus, Bell, Home, ChevronDown, AlertTriangle } from 'lucide-react';
import { getProducts, addProduct, getCurrentPantryId, getCurrentFamily, getLocations, addLocation, removeLocation } from './services/storage';
import { requestNotificationPermission, checkExpirations, sendNotification } from './services/notifications';
import ProductList from './components/ProductList';
import WelcomeScreen from './components/WelcomeScreen';
import AddProductForm from './components/AddProductForm';
import ShoppingList from './components/ShoppingList';
import AddItemModal from './components/AddItemModal';
import StatsPage from './components/StatsPage';
import SettingsPage from './components/SettingsPage';
import Navigation from './components/Navigation';
import { GlassCard } from './components/ui/GlassCard';
import WasteDashboard from './components/stats/WasteDashboard';
import ExpiringModal from './components/ExpiringModal';
import { differenceInDays, parseISO } from 'date-fns';

function App() {
  const [showExpiringModal, setShowExpiringModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [activeTab, setActiveTab] = useState('pantry'); // pantry, shopping, stats, settings

  // Theme State
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });


  // Auth/Family State
  const [currentPantryId, setCurrentPantryId] = useState(null); // This is FAMILY ID
  const [currentFamily, setCurrentFamily] = useState(null);

  // Location (Dispensa) State
  const [locations, setLocations] = useState([]);
  const [activeLocation, setActiveLocation] = useState(null);
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [showNewLocationInput, setShowNewLocationInput] = useState(false);


  const [expiringItems, setExpiringItems] = useState([]); // Track expiring items for UI alert
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    initApp();
  }, []);

  useEffect(() => {
    // Apply theme
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const initApp = async () => {
    try {
      const familyId = await getCurrentPantryId();

      if (familyId) {
        // Verify if family actually exists
        const family = await getCurrentFamily();
        if (!family) {
          // Invalid session, force logout
          await setCurrentPantryId(null);
          await setCurrentFamily(null);
        } else {
          setCurrentPantryId(familyId);
          setCurrentFamily(family);

          // Load Locations
          const locs = await getLocations(familyId);
          setLocations(locs);
          if (locs.length > 0) {
            setActiveLocation(locs[0]);
          }

          await loadProducts(familyId);
        }
      }
    } catch (error) {
      console.error("Init error:", error);
    } finally {
      setInitializing(false);
    }
  };

  const loadProducts = async (pantryId) => {
    const id = pantryId || currentPantryId;
    if (!id) return;
    const data = await getProducts(id);
    setProducts(data);
    checkAndNotify(data);
  };

  const handleSwitchLocation = (location) => {
    setActiveLocation(location);
    setIsLocationSelectorOpen(false);
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!newLocationName.trim()) return;

    const { success, location } = await addLocation(currentPantryId, newLocationName);
    if (success && location) {
      const newLocs = [...locations, location];
      setLocations(newLocs);
      setActiveLocation(location);
      setNewLocationName('');
      setShowNewLocationInput(false);
      setIsLocationSelectorOpen(false);
    }
  };

  const handleRemoveLocation = async (id) => {
    await removeLocation(id);
    // Reload locations
    const locs = await getLocations(currentPantryId);
    setLocations(locs);
    if (activeLocation?.id === id) {
      setActiveLocation(locs[0] || null);
    }
  };

  const checkAndNotify = (data) => {
    const today = new Date();

    // 1. CALCOLO LISTA COMPLETA (Per il Banner e la Modale)
    // Prende tutto ciò che scade tra oggi e 3 giorni
    const allExpiring = data.filter(p => {
      if (p.status !== 'active') return false;
      const days = differenceInDays(parseISO(p.expiryDate), today);
      return days <= 3 && days >= -1; // Include anche scaduti da 1 giorno per sicurezza
    });

    setExpiringItems(allExpiring); // Aggiorna lo stato per la UI

    // 2. GESTIONE NOTIFICHE PUSH (Per il telefono)
    // Usa la vecchia funzione che filtra quelli già notificati per non spammare
    const newForPush = checkExpirations(data);
    if (newForPush.length > 0 && Notification.permission === 'granted') {
      sendNotification('Attenzione Sprechi', `${newForPush.length} prodotti in scadenza!`);
    }
  };

  const handleAddProduct = async (product) => {
    // Add location info to product
    const productWithLoc = { ...product, locationId: activeLocation?.id };
    await addProduct(productWithLoc, currentPantryId);
    await loadProducts();
  };

  const handleUpdate = async () => {
    await loadProducts();
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(granted ? 'granted' : 'denied');
    if (granted) {
      checkAndNotify(products);
    }
  };

  const handleLoginComplete = async (pantryId) => {
    setInitializing(true);
    await initApp();
  };

  if (initializing) return null; // Or a loading spinner

  // Show Welcome Screen if not logged in (no current pantry)
  if (!currentPantryId) {
    return (
      <WelcomeScreen onComplete={handleLoginComplete} />
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden text-gray-800 font-sans transition-colors duration-500 bg-gradient-to-br from-teal-50 via-orange-50 to-rose-50 dark:from-pantry-bg-dark dark:to-pantry-bg-secondary">

      {/* HEADER - Fixed at top */}
      <header className="px-6 py-5 pt-[calc(1.25rem+env(safe-area-inset-top))] flex justify-between items-center z-30 shrink-0">
        <div>
          {/* Location Switcher Header */}
          <div className="relative">
            <button
              onClick={() => setIsLocationSelectorOpen(!isLocationSelectorOpen)}
              disabled={activeTab === 'settings'}
              className={`flex items-center gap-2 text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-pantry-text-secondary bg-clip-text text-transparent hover:opacity-80 transition-opacity ${activeTab === 'settings' ? 'pointer-events-none' : ''}`}
            >
              {activeTab === 'pantry' ? (activeLocation?.name || 'Caricamento...') :
                activeTab === 'shopping' ? 'Spesa' :
                  activeTab === 'stats' ? 'Rifiuti' : 'Impostazioni'}
              {activeTab === 'pantry' && <ChevronDown size={24} className={`text-gray-600 dark:text-pantry-text-secondary transition-transform duration-300 ${isLocationSelectorOpen ? 'rotate-180' : ''}`} />}
            </button>

            {/* Dropdown Menu */}
            {isLocationSelectorOpen && activeTab === 'pantry' && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsLocationSelectorOpen(false)} />
                <div className="absolute top-full left-0 mt-3 w-72 bg-white/90 dark:bg-pantry-bg-secondary rounded-3xl shadow-2xl border border-gray-200/50 dark:border-white/5 overflow-hidden z-50 animate-fade-in-up origin-top-left p-2">
                  <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {currentFamily?.name || 'Famiglia'}
                  </div>

                  <div className="max-h-60 overflow-y-auto no-scrollbar">
                    {locations.map(loc => (
                      <button
                        key={loc.id}
                        onClick={() => handleSwitchLocation(loc)}
                        className={`w-full text-left px-4 py-3.5 rounded-2xl mb-1 flex items-center justify-between transition-all ${activeLocation?.id === loc.id
                          ? 'bg-gray-900 dark:bg-pantry-glass-high text-white dark:text-pantry-text-primary font-bold shadow-md transform scale-[1.02]'
                          : 'hover:bg-gray-100 dark:hover:bg-pantry-glass-low text-gray-600 dark:text-pantry-text-secondary'
                          }`}
                      >
                        <span className="truncate">{loc.name}</span>
                        {activeLocation?.id === loc.id && <div className="w-2 h-2 rounded-full bg-pantry-accent-green" />}
                      </button>
                    ))}
                  </div>

                  <div className="h-px bg-gray-200/50 dark:bg-white/5 my-2 mx-2"></div>

                  {!showNewLocationInput ? (
                    <button
                      onClick={() => setShowNewLocationInput(true)}
                      className="w-full text-left px-4 py-3.5 rounded-2xl text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-500/10 transition flex items-center gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                        <Plus size={14} />
                      </div>
                      Nuova Dispensa
                    </button>
                  ) : (
                    <form onSubmit={handleAddLocation} className="p-2 animate-fade-in-up">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Es. Cantina..."
                        value={newLocationName}
                        onChange={(e) => setNewLocationName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-pantry-bg-dark border border-gray-200 dark:border-white/5 mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-pantry-text-primary dark:placeholder-pantry-text-secondary/50 transition-all font-medium"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={!newLocationName.trim()}
                          className="flex-1 bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                        >
                          Crea
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowNewLocationInput(false)}
                          className="flex-1 bg-gray-100 dark:bg-pantry-glass-low text-gray-600 dark:text-pantry-text-secondary text-xs font-bold py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-pantry-glass-medium transition"
                        >
                          Annulla
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </>
            )}
          </div>

          <p className="text-gray-500 dark:text-pantry-text-secondary text-sm font-medium mt-0.5 tracking-wide">
            {activeTab === 'pantry' && 'La tua dispensa digitale'}
            {activeTab === 'shopping' && 'Lista della spesa'}
            {activeTab === 'stats' && 'Statistiche Sprechi'}
            {activeTab === 'settings' && 'Personalizza esperienza'}
          </p>

          {/* RED ALERT BANNER */}
          {expiringItems.length > 0 && activeTab === 'pantry' && (
            <div onClick={() => setShowExpiringModal(true)} className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-pulse">
              <div className="p-2 bg-red-500 text-white rounded-full">
                <AlertTriangle size={18} fill="currentColor" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">Attenzione!</p>
                <p className="text-xs text-red-500/80 font-medium">
                  {expiringItems.length === 1
                    ? "1 prodotto sta scadendo"
                    : `${expiringItems.length} prodotti in scadenza`}
                </p>
              </div>
            </div>
          )}
        </div>

        {notificationPermission === 'default' && (
          <button
            onClick={handleEnableNotifications}
            className="w-12 h-12 flex items-center justify-center text-gray-700 dark:text-pantry-text-primary bg-white/50 dark:bg-pantry-glass-low backdrop-blur-md border border-white/60 dark:border-white/5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
            title="Attiva Notifiche"
          >
            <Bell size={20} strokeWidth={2.5} className={expiringItems.length > 0 ? "text-red-500 animate-bounce" : ""} />
          </button>
        )}
      </header>

      {/* MAIN CONTENT - Scrollable Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-2 scroll-smooth no-scrollbar">
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto h-full">
          {activeTab === 'pantry' && (
            <ProductList
              products={
                activeLocation
                  ? products.filter(p => p.locationId === activeLocation.id)
                  : products
              }
              onUpdate={handleUpdate}
            />
          )}

          {activeTab === 'shopping' && (
            <ShoppingList />
          )}

          {activeTab === 'stats' && (
            <div className="h-full">
              <WasteDashboard />
            </div>
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              currentTheme={theme}
              onThemeChange={setTheme}
              currentFamily={currentFamily}
              locations={locations}
              onAddLocation={handleAddLocation}
              onRemoveLocation={handleRemoveLocation}
            />
          )}
        </div>
      </main>

      {/* Floating Action Button - Glass Style */}
      {activeTab === 'pantry' && (
        <button
          onClick={() => setIsFormOpen(true)}
          className="fixed bottom-32 right-6 w-16 h-16 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[24px] shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-30 border border-white/20 dark:border-black/10"
        >
          <Plus size={32} strokeWidth={2.5} />
        </button>
      )}

      {isFormOpen && (
        <AddItemModal
          onAdd={handleAddProduct}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {showExpiringModal && (
        <ExpiringModal
          products={expiringItems}
          onClose={() => setShowExpiringModal(false)}
        />
      )}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
