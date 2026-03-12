
export interface Wine {
  id: string;
  title: string;
  description: string;
  link: string;
  image_link: string;
  price: string;
  sale_price?: string; // Preço em oferta
  brand: string;
}

// Data structure returned by the Gemini API for each suggestion
export interface PairingSuggestion {
  wineIds: string[];
  dishDescription: string;
  recommendedWineType: string;
  recommendedGrape: string;
  reasoning: string;
}

// The final, enriched data structure used for rendering in the app
export interface Recommendation {
  wines: Wine[];
  suggestion: Omit<PairingSuggestion, 'wineIds'>;
  isLoadingMore?: boolean;
  hasLoadedMore?: boolean;
}

// Estrutura de dados para uma harmonização favoritada
export interface Favorite {
  id: string;
  query: string;
  recommendation: Recommendation;
  dishImage: string;
}
