
import React, { useState } from 'react';
import { Recommendation, Wine } from '../types';
import { ShopIcon, StarIcon, StarIconOutline, HeartIcon, HeartIconSolid, ChevronDownIcon } from './Icons';

interface SuggestionCardProps {
  recommendation: Recommendation;
  dishName: string;
  dishImage: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  shoppingList: string[];
  onToggleShoppingList: (wineId: string) => void;
}

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center gap-2 mb-2">
    <div className="w-1.5 h-1.5 rounded-full bg-cabernet-800"></div>
    <h4 className="font-sans font-bold text-[11px] tracking-[0.15em] text-gray-800 uppercase">{title}</h4>
  </div>
);

const WineListItem: React.FC<{ wine: Wine, isStarred: boolean, onToggle: () => void }> = ({ wine, isStarred, onToggle }) => (
    <div className="py-4 border-t border-gray-100 last:pb-0 animate-fade-in">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-grow min-w-0">
          <p className="font-bold text-sm text-gray-900 leading-tight mb-1 break-words">{wine.title}</p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] text-gray-500 font-sans uppercase tracking-wider">
              {wine.brand}
            </span>
            <span className="text-[11px] font-sans text-gray-300">•</span>
            {wine.sale_price ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400 line-through">{wine.price}</span>
                <span className="text-[11px] font-bold text-cabernet-900">{wine.sale_price}</span>
                <span className="bg-green-100 text-green-700 text-[8px] px-1 rounded font-bold uppercase tracking-tighter">Oferta</span>
              </div>
            ) : (
              <span className="text-[11px] font-bold text-gray-700">{wine.price}</span>
            )}
          </div>
          <a
            href={wine.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-cabernet-900 hover:bg-cabernet-800 text-white font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-md transition-all shadow-sm"
          >
            <ShopIcon className="w-3 h-3" />
            <span>Onde Encontrar</span>
          </a>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 text-gray-300 hover:text-gold-500 transition-colors flex-shrink-0"
        >
          {isStarred ? <StarIcon className="h-5 w-5 text-gold-500"/> : <StarIconOutline className="h-5 w-5" />}
        </button>
      </div>
    </div>
);

const SuggestionCard: React.FC<SuggestionCardProps> = ({ recommendation, dishName, dishImage, isFavorite, onToggleFavorite, shoppingList, onToggleShoppingList }) => {
  const { wines, suggestion } = recommendation;
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <div className="bg-white rounded-lg shadow-soft overflow-hidden flex flex-col border border-gray-100 transition-all duration-300 hover:shadow-xl h-full">
      <div className="relative h-64 w-full overflow-hidden bg-gray-100 group flex-shrink-0">
        <img 
          src={dishImage} 
          alt={dishName}
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageStatus('loaded')}
          onError={() => setImageStatus('error')}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <button 
            onClick={onToggleFavorite}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full p-2 text-white transition-all border border-white/30 z-10"
        >
            {isFavorite ? <HeartIconSolid className="h-5 w-5 text-red-500" /> : <HeartIcon className="h-5 w-5" />}
        </button>
      </div>

      <div className="p-6 space-y-6 flex-grow flex flex-col">
        <div className="border-b border-gray-100 pb-4">
            <h3 className="text-xl font-display font-bold text-cabernet-900 leading-tight uppercase tracking-tight">
                {dishName}
            </h3>
        </div>

        <section>
          <SectionHeader title="O Prato" />
          <p className="text-sm text-gray-600 font-serif-text leading-relaxed">
            {suggestion.dishDescription}
          </p>
        </section>

        <section>
          <SectionHeader title="Estilo Sugerido" />
          <div>
            <p className="font-bold text-gray-900 text-base">{suggestion.recommendedWineType}</p>
            <p className="text-xs text-gray-500 font-medium italic mt-0.5">{suggestion.recommendedGrape}</p>
          </div>
        </section>

        <section>
          <SectionHeader title="Harmonização" />
          <p className="text-sm text-gray-600 font-serif-text leading-relaxed">
            {suggestion.reasoning}
          </p>
        </section>
        
        <section className="mt-6 pt-6 border-t border-gray-100">
          <SectionHeader title="Vinhos da Adega" />
          <div className="mt-4 space-y-2">
            {wines.map((wine) => (
              <WineListItem 
                key={wine.id}
                wine={wine}
                isStarred={shoppingList.includes(wine.id)}
                onToggle={() => onToggleShoppingList(wine.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SuggestionCard;
