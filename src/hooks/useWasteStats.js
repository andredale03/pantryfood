import { useState, useEffect } from 'react';
import { supabaseApi } from '../services/supabase';
import { DateTime } from 'luxon';

export default function useWasteStats() {
  const [stats, setStats] = useState({
    month: DateTime.now().toFormat('yyyy-MM'),
    totalSpent: 0,
    totalWasted: 0,
    wastePct: 0,
    topCategories: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const currentMonth = DateTime.now().toFormat('yyyy-MM');
      
      // Attempt to fetch pre-calculated stats
      const { data: storedStats, error: statsError } = await supabaseApi.getStats(currentMonth);
      
      if (statsError && statsError.code !== 'PGRST116') { // Ignore "no rows" error
         console.warn("Failed to fetch stored stats", statsError);
      }

      // If we have stored stats, use them (or combine with real-time aggregation if needed)
      // For this MVP, let's assume we might need to aggregate local/remote products too if we want "Live" stats
      // independently of the stored monthly aggregate. 
      // User request: "Calcola valore economico totale del pantry corrente... Traccia prodotti scaduti"
      
      // Let's fetch ALL products to calc live stats for "Total Pantry Value" and "Wasted Items"
      const { data: products, error: productsError } = await supabaseApi.getProducts();
      
      if (productsError) throw productsError;

      // Use stored stats for historical data (since we delete items)
      const historicalWasted = storedStats?.total_wasted || 0;
      
      // Calculate Active Value (Live)
      const totalPantryValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      
      // Total Observed = Active + Historical Wasted
      const totalObserved = totalPantryValue + historicalWasted;
      const wastePct = totalObserved > 0 ? (historicalWasted / totalObserved) * 100 : 0;

      setStats({
        month: currentMonth,
        totalPantryValue: totalPantryValue,
        totalWasted: historicalWasted,
        wastePct: wastePct.toFixed(1),
        wasteItemsCount: 0 // We lose the count of items if we delete them, unless we track it in stats table. 
        // For now 0 is acceptable or we add a counter to stats table later.
      });

    } catch (err) {
      console.error(err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refreshStats: fetchStats };
}
