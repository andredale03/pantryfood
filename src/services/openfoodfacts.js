export const searchProductOFF = async (query) => {
  try {
    // Search by name
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=1`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.products && data.products.length > 0) {
      const product = data.products[0];
      return {
        found: true,
        image_url: product.image_front_small_url,
        generic_name: product.generic_name || product.product_name,
        // OFF often doesn't have explicit "days to expiry", but we can try to guess category
        categories: product.categories_tags, 
      };
    }
    return { found: false };
  } catch (error) {
    console.error("Open Food Facts search error:", error);
    return { found: false, error };
  }
};
