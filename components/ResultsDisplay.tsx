
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
      <div className="mb-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 leading-tight">
          Sugestões para: <span className="text-cabernet-800 italic">{query}</span>
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recommendations.map((rec, index) => {
            const id = generateFavoriteId(query, rec);
            const isFavorite = favorites.some(fav => fav.id === id);
            const PLACEHOLDERS = [
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=800&auto=format&fit=crop'
            ];
            const imageForCard = dishImages[index] || dishImages[0] || PLACEHOLDERS[index % 3];

            return (
                <SuggestionCard 
                    key={`${id}-${index}`} 
                    recommendation={rec} 
                    dishName={query} 
                    dishImage={imageForCard}
                    isFavorite={isFavorite}
                    onToggleFavorite={() => onToggleFavorite(query, rec, imageForCard)}
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
