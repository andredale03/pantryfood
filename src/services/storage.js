import { get, set, update } from 'idb-keyval';
import { supabaseApi } from './supabase';
import { DateTime } from 'luxon';

const SHOPPING_LIST_KEY = 'pantry-shopping-list';
const CURRENT_PANTRY_KEY = 'pantry-current-id'; // Family ID

// --- Pantries Management (RIMANE LOCALE PER ORA) ---

// --- Pantries Management (Hybrid: Local Creds + Supabase) ---

export const getCurrentPantryId = async () => {
  const id = await get(CURRENT_PANTRY_KEY);
  if (id && typeof id === 'object' && id.id) return id.id;
  return typeof id === 'string' ? id : null;
};

export const getCurrentFamily = async () => {
    const id = await getCurrentPantryId();
    if (!id) return null;
    const saved = await get('pantry-saved-family-details');
    return saved || null; // Return null if not found, don't fake it
};

const saveFamilySession = async (pantry) => {
    await set(CURRENT_PANTRY_KEY, pantry.id);
    await set('pantry-saved-family-details', pantry);
};

export const logoutFamily = async () => {
    await set(CURRENT_PANTRY_KEY, null);
    await set('pantry-saved-family-details', null);
};

// export const addPantry = ... REMOVED
// export const deletePantry = ... REMOVED
// export const switchPantry = ... REMOVED (No switching families, just logout)
// --- LOCATIONS (SUB-PANTRIES) ---

export const getLocations = async (familyId) => {
  const { data, error } = await supabaseApi.getLocations(familyId);
  if (error) return [];
  
  if (data.length === 0) {
      const { data: newLoc } = await supabaseApi.createLocation(familyId, 'Dispensa Principale');
      return newLoc ? [newLoc[0]] : [];
  }
  
  return data;
};

export const addLocation = async (familyId, name) => {
    const { data, error } = await supabaseApi.createLocation(familyId, name);
    return { success: !error, location: data ? data[0] : null };
};

export const removeLocation = async (id) => {
    // Cascade delete products first to keep DB clean
    await supabaseApi.deleteProductsByLocation(id);
    await supabaseApi.deleteLocation(id);
};

// --- FAMILY CREATION / JOIN ---

export const createFamily = async (name, pin) => {
    const { data, error } = await supabaseApi.createPantry(name, pin);
    if (error) return { success: false, error: 'Errore creazione: ' + error.message };
    
    const pantry = data[0];
    await saveFamilySession(pantry);
    await addLocation(pantry.id, 'Cucina'); // Default location
    
    return { success: true, pantryId: pantry.id };
};

export const joinFamily = async (pantryId, pin) => {
    const { data, error } = await supabaseApi.verifyPantry(pantryId, pin);
    if (error || !data) return { success: false, error: 'Codice o PIN non validi.' };
    
    await saveFamilySession(data);
    
    return { success: true, pantryId: data.id };
};

// --- Pantry Products (ORA SU SUPABASE) ---

export const getProducts = async (pantryId) => {
  const targetPantryId = pantryId || await getCurrentPantryId();
  
  const { data, error } = await supabaseApi.getProducts(targetPantryId);
  
  if (error) {
    console.error("Errore recupero prodotti:", error);
    return [];
  }

  // Mappa i campi dal formato Database (snake_case) al formato App (camelCase)
  return data.map(p => ({
    ...p,
    id: p.id,
    name: p.name,
    expiryDate: p.expiry_date, // Importante: mappa expiry_date -> expiryDate
    category: p.category,
    status: p.status,
    pantryId: p.pantry_id,
    locationId: p.location_id, // New Field
    finishedAt: p.finished_at
  }));
};

export const addProduct = async (product, pantryId) => {
  const targetPantryId = pantryId || await getCurrentPantryId();
  
  // Prepara oggetto per Supabase
  const newProduct = {
    name: product.name,
    expiry_date: product.expiryDate, // App -> DB
    category: product.category || 'Dispensa',
    status: 'active',
    pantry_id: targetPantryId,
    location_id: product.locationId, // New Field
    created_at: new Date().toISOString(),
    quantity: product.quantity || 1,
    price: product.price || 0
  };

  const { data, error } = await supabaseApi.addProduct(newProduct);
  
  if (error) {
    console.error("Errore aggiunta prodotto:", error);
    return null;
  }
  
  // Ritorna il dato formattato per l'app
  const p = data[0];
  return {
    ...p,
    expiryDate: p.expiry_date
  };
};

export const updateProduct = async (id, updates) => {
  // Traduci i campi per Supabase
  const dbUpdates = {};
  
  if (updates.expiryDate) dbUpdates.expiry_date = updates.expiryDate;
  if (updates.pantryId) dbUpdates.pantry_id = updates.pantryId;
  if (updates.finishedAt) dbUpdates.finished_at = updates.finishedAt;
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.locationId) dbUpdates.location_id = updates.locationId;
  if (updates.locationId) dbUpdates.location_id = updates.locationId;
  
  await supabaseApi.updateProduct(id, dbUpdates);
};

export const deleteProduct = async (id) => {
  await supabaseApi.deleteProduct(id);
};

export const finalizeProduct = async (product, status) => {
    // 1. Update Persistent Stats first (so we don't lose data)
    const currentMonth = DateTime.now().toFormat('yyyy-MM');
    const { data: currentStats } = await supabaseApi.getStats(currentMonth);
    
    const val = (product.price || 0) * (product.quantity || 1);
    
    const newStats = {
        total_spent: (currentStats?.total_spent || 0), // Already tracked? Or add now? Assuming we track flow here.
        total_wasted: (currentStats?.total_wasted || 0),
        waste_items: (currentStats?.waste_items || 0) + 1 // Add distinct count field if possible or just ignore
    };

    // Logic: If status is 'wasted', we add to total_wasted AND total_spent (money gone).
    // If 'consumed', we arguably add to total_spent (money used effectively).
    // For this specific 'Waste Dashboard', we care mostly about Wasted.
    
    if (status === 'wasted') {
        newStats.total_wasted += val;
        // Optionally add to total_spent if not tracked on entry
    }
    
    await supabaseApi.updateStats(currentMonth, newStats);

    // 2. Delete the product to keep DB clean
    await supabaseApi.deleteProduct(product.id);
};

// --- Shopping List (ORA SU SUPABASE) ---

export const getShoppingList = async () => {
  const pantryId = await getCurrentPantryId();
  if (!pantryId) return [];

  const { data, error } = await supabaseApi.getProducts(pantryId);
  if (error) return [];
  
  // Filtra solo item della lista spesa
  return data
    .filter(p => p.status === 'shopping_list' || p.status === 'shopping_bought')
    .map(p => ({
      id: p.id,
      name: p.name,
      isBought: p.status === 'shopping_bought',
      // Manteniamo compatibilità UI
    }));
};

export const addToShoppingList = async (item) => {
  const pantryId = await getCurrentPantryId();
  if (!pantryId) return;

  const newProduct = {
    name: item.name,
    status: 'shopping_list', // Stato speciale per lista
    pantry_id: pantryId,
    quantity: 1,
    created_at: new Date().toISOString()
  };

  await supabaseApi.addProduct(newProduct);
};

export const toggleShoppingItem = async (id, currentIsBought) => {
  // Ottimizzazione: Usiamo lo stato passato dalla UI invece di fare fetch
  const newStatus = currentIsBought ? 'shopping_list' : 'shopping_bought';
  await supabaseApi.updateProduct(id, { status: newStatus });
};

export const deleteShoppingItem = async (id) => {
  // Cancella fisicamente dal DB come richiesto
  await supabaseApi.deleteProduct(id);
};

// --- Backup / Restore (Disabilitati o parziali con Supabase) ---
// Nota: Export/Import funzionano ancora ma solo per la parte locale (Shopping list/Pantries)
// o richiederebbero logica complessa per scaricare tutto da Supabase.
// Li lascio invariati per non rompere l'interfaccia, ma esporteranno meno dati (o dati vecchi locali).

export const exportData = async () => {
  // Per ora esporta solo dati locali per evitare confusione
  const shoppingList = await getShoppingList();
  const pantries = await get(PANTRIES_KEY);
  
  return {
    products: [], // I prodotti sono nel cloud ora
    shoppingList,
    pantries,
    exportedAt: new Date().toISOString(),
    version: 3 // Bump version
  };
};

export const importData = async (jsonData) => {
  // Implementazione semplificata per Shopping List
  if (jsonData.shoppingList) {
    await set(SHOPPING_LIST_KEY, jsonData.shoppingList);
  }
  return true;
};