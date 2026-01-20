import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export const supabaseApi = {
  // --- PANTRIES (AUTH) ---
  async createPantry(name, pin) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { data, error } = await supabase
      .from('pantries')
      .insert([{ name, pin }])
      .select();
    return { data, error };
  },

  async verifyPantry(id, pin) {
     if (!supabase) return { error: 'Supabase not configured' };
     // Cerca solo se ID match e PIN match
     // Nota: RLS è pubblico per ora, quindi si può fare select. 
     // In prod vera, si farebbe via funzione RPC per non esporre PIN nelle select.
     const { data, error } = await supabase
       .from('pantries')
       .select('*')
       .eq('id', id)
       .eq('pin', pin)
       .single();
     return { data, error };
  },

  // --- LOCATIONS (DISPENSE) ---
  async getLocations(pantryId) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('pantry_id', pantryId)
      .order('created_at', { ascending: true });
    return { data, error };
  },

  async createLocation(pantryId, name) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { data, error } = await supabase
      .from('locations')
      .insert([{ pantry_id: pantryId, name }])
      .select();
    return { data, error };
  },

  async deleteLocation(id) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);
    return { error };
  },

  // --- LOCATIONS (DISPENSE) ---
  async getLocations(pantryId) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('pantry_id', pantryId)
      .order('created_at', { ascending: true });
    return { data, error };
  },

  async createLocation(pantryId, name) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { data, error } = await supabase
      .from('locations')
      .insert([{ pantry_id: pantryId, name }])
      .select();
    return { data, error };
  },

  async deleteLocation(id) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);
    return { error };
  },

  // --- PRODUCTS ---
  
  async addProduct(product) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select();
    return { data, error };
  },

  async getProducts(pantryId) {
    if (!supabase) return { error: 'Supabase not configured' };
    
    let query = supabase
      .from('products')
      .select('*')
      .order('expiry_date', { ascending: true });

    // Filtra per dispensa se specificato
    if (pantryId) {
      query = query.eq('pantry_id', pantryId);
    }

    const { data, error } = await query;
    return { data, error };
  },

  async updateProduct(id, updates) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  },

  async deleteProduct(id) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    return { error };
  },

  async deleteProductsByLocation(locationId) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('location_id', locationId);
    return { error };
  },

  // --- STATS ---
  async getStats(month) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { data, error } = await supabase
      .from('stats')
      .select('*')
      .eq('month', month)
      .single();
    return { data, error };
  },
  
  async updateStats(month, statsData) {
     if (!supabase) return { error: 'Supabase not configured' };
     const { data, error } = await supabase
        .from('stats')
        .upsert({ month, ...statsData }, { onConflict: 'month' })
        .select();
     return { data, error };
  }
};

export default supabase;