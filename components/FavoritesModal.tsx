
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Favorite, Wine } from '../types';
import { BookmarkIcon, TrashIcon, WineGlassIcon, ShopIcon, ChevronDownIcon, StarIcon, StarIconOutline, CloseIcon, DishIcon } from './Icons';

interface FavoritesPageProps {
  favorites: Favorite[];
  onRemoveFavorite: (favoriteId: string) => void;
  shoppingList: string[];
  onToggleShoppingList: (wineId: string) => void;
}

const FavoriteItem: React.FC<{ 
    fav: Favorite; 
    onRemove: () => void; 
    shoppingList: string[];
    onToggleShoppingList: (wineId: string) => void;
}> = ({ fav, onRemove, shoppingList, onToggleShoppingList }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

    useEffect(() => {
        setImageStatus('loading');
    }, [fav.dishImage]);

    return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-sm">
            <div className="flex items-start gap-3 sm:gap-4">
                {/* Container de Imagem Robusto */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-md flex-shrink-0 overflow-hidden bg-gray-200">
                    {imageStatus === 'loading' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse z-10">
                            <DishIcon className="h-6 w-6 text-gray-300" />
                        </div>
                    )}
                    
                    {imageStatus === 'error' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-300 z-10">
                             <WineGlassIcon className="h-8 w-8 text-gray-400 opacity-60" />
                        </div>
                    )}

                    <img 
                        src={fav.dishImage} 
                        alt={fav.query}
                        loading="lazy"
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                            imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => setImageStatus('loaded')}
                        onError={() => setImageStatus('error')}
                    />
                </div>

                <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-base sm:text-lg text-gray-800 break-words">{fav.query}</h4>
                    <p className="text-sm font-semibold text-cabernet-900 break-words">{fav.recommendation.suggestion.recommendedWineType}</p>
                    <p className="text-xs text-gray-500 mb-2 break-words">{fav.recommendation.suggestion.recommendedGrape}</p>
                    {/* Removido o line-clamp-2 para o texto ajustar para baixo livremente */}
                    <p className="text-sm text-gray-600 leading-relaxed break-words">{fav.recommendation.suggestion.reasoning}</p>
                </div>
                <button
                    onClick={onRemove}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors flex-shrink-0"
                    aria-label={`Remover ${fav.query} dos favoritos`}
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
            <div className="mt-3">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex justify-between items-center text-left text-sm font-semibold text-cabernet-900 hover:bg-cabernet-100/20 p-2 rounded-md transition-colors"
                    aria-expanded={isExpanded}
                >
                    <span>Ver vinhos sugeridos ({fav.recommendation.wines.length})</span>
                    <ChevronDownIcon className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isExpanded && (
                    <div className="mt-3 pl-4 border-l-2 border-cabernet-900/50 space-y-3 animate-fade-in">
                        {fav.recommendation.wines.map(wine => (
                            <div key={wine.id} className="pt-2 first:pt-0 border-t border-gray-200 first:border-t-0">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm text-gray-800 break-words">{wine.title}</p>
                                        <p className="text-xs text-gray-500 mb-2">{wine.brand} - <span className="font-semibold text-gray-700">{wine.price}</span></p>
                                    </div>
                                    <button
                                        onClick={() => onToggleShoppingList(wine.id)}
                                        aria-label={shoppingList.includes(wine.id) ? `Remover ${wine.title} da lista de compras` : `Adicionar ${wine.title} à lista de compras`}
                                        className="p-1.5 text-gray-400 hover:text-yellow-500 rounded-full transition-colors duration-200 flex-shrink-0"
                                    >
                                        {shoppingList.includes(wine.id) ? <StarIcon className="h-5 w-5 text-yellow-500"/> : <StarIconOutline className="h-5 w-5" />}
                                    </button>
                                </div>
                                <a
                                    href={wine.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 bg-cabernet-900 hover:bg-cabernet-800 text-white font-semibold py-1.5 px-3 rounded-md shadow-sm text-xs transition-all duration-300 transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cabernet-900"
                                    aria-label={`Onde Encontrar ${wine.title}`}
                                >
                                    <ShopIcon className="w-3 h-3" />
                                    <span>Onde Encontrar</span>
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ favorites, onRemoveFavorite, shoppingList, onToggleShoppingList }) => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-3xl w-full mx-auto -mt-16 animate-fade-in">
        <header className="flex justify-between items-center gap-3 pb-4 border-b border-gray-200 mb-6">
            <div className="flex items-center gap-3">
                <BookmarkIcon className="h-6 w-6 text-cabernet-900" />
                <h2 className="text-xl font-bold text-gray-800">Minhas Harmonizações Favoritas</h2>
            </div>
            <Link to="/" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-cabernet-900 font-semibold transition-colors" aria-label="Fechar e voltar para a página inicial">
                <CloseIcon className="h-4 w-4" />
                <span>Fechar</span>
            </Link>
        </header>

        <main className="space-y-4">
            {favorites.length === 0 ? (
            <div className="text-center py-12">
                <WineGlassIcon className="h-16 w-16 mx-auto text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-gray-700">Nenhum favorito ainda</h3>
                <p className="mt-1 text-gray-500">Clique no ícone de coração nos cartões para salvar suas harmonizações preferidas aqui.</p>
            </div>
            ) : (
            favorites.map(fav => (
                <FavoriteItem 
                    key={fav.id} 
                    fav={fav} 
                    onRemove={() => onRemoveFavorite(fav.id)}
                    shoppingList={shoppingList}
                    onToggleShoppingList={onToggleShoppingList}
                />
            ))
            )}
        </main>
    </div>
  );
};

export default FavoritesPage;
