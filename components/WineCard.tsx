
import React, { useState, useEffect } from 'react';
import { Recommendation, Wine } from '../types';
import { ShopIcon, StarIcon, StarIconOutline, HeartIcon, HeartIconSolid, DishIcon, GrapeDotsIcon, ChefIcon, SparklesIcon } from './Icons';

interface SuggestionCardProps {
  recommendation: Recommendation;
  dishName: string;
  dishImage: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  shoppingList: string[];
  onToggleShoppingList: (wineId: string) => void;
}

const SectionHeader: React.FC<{ title: string, icon: React.ReactNode }> = ({ title, icon }) => (
  <div className="flex items-center gap-2 mb-2">
    <div className="w-4 h-4 text-cabernet-800 opacity-70">
      {icon}
    </div>
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
  const [currentSrc, setCurrentSrc] = useState(dishImage);

  // Mapeamento de "Vibe Visual" baseada no tipo de vinho
  const getWineVibe = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('tinto')) return 'from-cabernet-900 to-ruby-900';
    if (t.includes('branco')) return 'from-amber-100 to-gold-200';
    if (t.includes('rosé') || t.includes('rose')) return 'from-rose-100 to-salmon-200';
    if (t.includes('espumante') || t.includes('champagne')) return 'from-yellow-50 to-gold-100';
    return 'from-gray-50 to-gray-100';
  };

  const getWineTextSecondary = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('tinto')) return 'text-cabernet-100';
    if (t.includes('branco') || t.includes('espumante') || t.includes('rosé') || t.includes('rose')) return 'text-amber-900/60';
    return 'text-gray-500';
  };

  const vibeGradient = getWineVibe(suggestion.recommendedWineType);
  const textSecondary = getWineTextSecondary(suggestion.recommendedWineType);
  const isDarkVibe = suggestion.recommendedWineType.toLowerCase().includes('tinto');

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800';

  // Sincroniza o src quando a prop dishImage mudar (nova busca)
  useEffect(() => {
    setCurrentSrc(dishImage);
    setImageStatus('loading');

    // Timeout de segurança: se não carregar em 7s, força fallback
    const timer = setTimeout(() => {
      if (imageStatus === 'loading') {
        console.warn(`Timeout de 7s atingido para: ${dishImage}. Forçando fallback.`);
        handleImageError();
      }
    }, 7000);

    return () => clearTimeout(timer);
  }, [dishImage]);

  const handleImageError = () => {
    if (currentSrc !== FALLBACK_IMAGE) {
      console.warn(`Falha ao carregar imagem: ${currentSrc}. Tentando fallback...`);
      setCurrentSrc(FALLBACK_IMAGE);
    } else {
      setImageStatus('error');
    }
  };

  return (
    <div aria-label="Wine Suggestion Card" className={`rounded-lg shadow-soft overflow-hidden flex flex-col border border-gray-100 transition-all duration-300 hover:shadow-xl h-full bg-white`}>
      <div className={`p-6 pb-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-br ${vibeGradient}`}>
        <div className="flex flex-col">
          <span className={`text-[10px] uppercase tracking-[0.2em] font-bold mb-1 ${isDarkVibe ? 'text-white/60' : 'text-amber-900/40'}`}>
            Recomendação
          </span>
          <h3 className={`text-lg font-display font-bold leading-tight uppercase tracking-tight ${isDarkVibe ? 'text-white' : 'text-amber-900'}`}>
            {recommendation.suggestion.recommendedWineType}
          </h3>
        </div>
        <button 
            onClick={onToggleFavorite}
            className={`rounded-full p-2 transition-all border ${isDarkVibe ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white/40 hover:text-red-400' : 'bg-white hover:bg-gray-100 border-gray-200 text-gray-400 hover:text-red-500'}`}
        >
            {isFavorite ? <HeartIconSolid className="h-5 w-5 text-red-500" /> : <HeartIcon className="h-5 w-5" />}
        </button>
      </div>

      <div className="p-6 space-y-6 flex-grow flex flex-col">
        <section>
          <SectionHeader title="O Prato" icon={<DishIcon />} />
          <p className="text-sm text-gray-600 font-serif-text leading-relaxed">
            {suggestion.dishDescription}
          </p>
        </section>

        <section>
          <SectionHeader title="Varietal Sugerida" icon={<GrapeDotsIcon />} />
          <div className={`p-3 rounded-md border ${isDarkVibe ? 'bg-cabernet-50/50 border-cabernet-100' : 'bg-amber-50/50 border-amber-100'}`}>
            <p className="font-bold text-gray-900 text-base">{suggestion.recommendedGrape}</p>
          </div>
        </section>

        <section>
          <SectionHeader title="A Consultoria" icon={<SparklesIcon />} />
          <p className="text-sm text-gray-600 font-serif-text leading-relaxed">
            {suggestion.reasoning}
          </p>
        </section>
        
        <section className="mt-6 pt-6 border-t border-gray-100">
          <SectionHeader title="Vinhos da Adega" icon={<ChefIcon />} />
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
