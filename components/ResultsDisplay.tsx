import React, { useState, useEffect } from 'react';
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

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1200';

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
  const [heroSrc, setHeroSrc] = useState(dishImages[0] || FALLBACK_IMAGE);

  // Sincroniza o Hero quando a prop dishImages mudar (nova busca)
  useEffect(() => {
    setHeroSrc(dishImages[0] || FALLBACK_IMAGE);
  }, [dishImages]);

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const handleHeroError = () => {
    if (heroSrc !== FALLBACK_IMAGE) {
        setHeroSrc(FALLBACK_IMAGE);
    }
  };

  return (
    <div aria-label="Results Display Section" className="mt-16 animate-fade-in max-w-7xl mx-auto px-4 pb-20">
      {/* Hero Section */}
      <div className="mb-12 relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden shadow-xl border border-white/20">
        <img 
          src={heroSrc} 
          alt={query} 
          onError={handleHeroError}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        />
        {/* Filtro global estético + Gradiente forte para o texto */}
        <div className="absolute inset-0 bg-cabernet-900/20 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 p-8 z-10 w-full">
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white leading-tight uppercase tracking-tighter drop-shadow-md">
            Sugestões para <br/>
            <span className="text-gold-400 italic font-serif leading-normal drop-shadow-lg">{query}</span>
          </h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recommendations.map((rec, index) => {
            const id = generateFavoriteId(query, rec);
            const isFavorite = favorites.some(fav => fav.id === id);
            // Usa uma imagem diferente para cada card (se disponível)
            const cardImage = dishImages[index] || dishImages[0] || FALLBACK_IMAGE;
            
            return (
                <SuggestionCard 
                    key={`${id}-${index}`} 
                    recommendation={rec} 
                    dishName={query} 
                    dishImage={cardImage}
                    isFavorite={isFavorite}
                    onToggleFavorite={() => onToggleFavorite(query, rec, cardImage)}
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
