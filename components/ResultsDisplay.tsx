
import React from 'react';
import { Favorite, Recommendation } from '../types';
import SuggestionCard from './WineCard'; 

interface ResultsDisplayProps {
  recommendations: Recommendation[];
  query: string;
  dishImages: string[];
  favorites: Favorite[];
  onToggleFavorite: (query: string, recommendation: Recommendation, dishImage: string) => void;
  generateFavoriteId: (query: string, recommendation: Recommendation) => string;
  shoppingList: string[];
  onToggleShoppingList: (wineId: string) => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  recommendations, 
  query, 
  dishImages, 
  favorites, 
  onToggleFavorite, 
  generateFavoriteId, 
  shoppingList, 
  onToggleShoppingList
}) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 animate-fade-in max-w-7xl mx-auto px-4 pb-20">
      {/* Hero Section */}
      {dishImages && dishImages[0] && (
        <div className="mb-12 relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden shadow-xl border border-white/20">
          <img 
            src={dishImages[0]} 
            alt={query} 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8">
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-white leading-tight uppercase tracking-tighter">
              Sugestões para <br/>
              <span className="text-gold-400 italic font-serif leading-normal">{query}</span>
            </h2>
          </div>
        </div>
      )}

      {!dishImages[0] && (
        <div className="mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 leading-tight">
            Sugestões para: <span className="text-cabernet-800 italic">{query}</span>
          </h2>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recommendations.map((rec, index) => {
            const id = generateFavoriteId(query, rec);
            const isFavorite = favorites.some(fav => fav.id === id);
            
            return (
                <SuggestionCard 
                    key={`${id}-${index}`} 
                    recommendation={rec} 
                    dishName={query} 
                    dishImage={dishImages[0] || ""}
                    isFavorite={isFavorite}
                    onToggleFavorite={() => onToggleFavorite(query, rec, dishImages[0] || "")}
                    shoppingList={shoppingList}
                    onToggleShoppingList={onToggleShoppingList}
                />
            );
        })}
      </div>
    </div>
  );
};

export default ResultsDisplay;
