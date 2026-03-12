
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, useSearchParams } from 'react-router-dom';
import { fetchWines } from './services/wineService';
import { getWinePairing, generateDishImages } from './services/geminiService';
import { Wine, Recommendation, Favorite } from './types';
import useLocalStorage from './hooks/useLocalStorage';

import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ResultsDisplay from './components/ResultsDisplay';
import Loader from './components/Loader';
import FavoritesPage from './components/FavoritesModal';
import ShoppingListPage from './components/ShoppingList';
import { LogoWineGlassIcon } from './components/Icons';

type Status = 'loading-wines' | 'ready' | 'searching' | 'error';

const App = () => {
  const [wines, setWines] = useState<Wine[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [query, setQuery] = useState<string>('');
  const [dishImages, setDishImages] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>('loading-wines');
  const [error, setError] = useState<string | null>(null);

  const [favorites, setFavorites] = useLocalStorage<Favorite[]>('sommelier-favorites', []);
  const [shoppingList, setShoppingList] = useLocalStorage<string[]>('sommelier-shopping-list', []);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialQueryLoadAttempted = useRef(false);

  useEffect(() => {
    const loadWines = async () => {
      try {
        setStatus('loading-wines');
        const wineList = await fetchWines();
        setWines(wineList);
        setStatus('ready');
      } catch (err) {
        setError('Falha ao carregar a adega.');
        setStatus('error');
      }
    };
    loadWines();
  }, []);

  const handleSearch = useCallback(async (dish: string) => {
    const normalizedDish = dish.trim();
    if (status === 'searching' || wines.length === 0 || !normalizedDish) return;

    setQuery(dish);
    setSearchParams({ q: normalizedDish });
    setStatus('searching');
    setError(null);
    setRecommendations(null);
    setDishImages([]);

    try {
      // Dispara as duas requisições em paralelo para máxima performance
      const pairingPromise = getWinePairing(normalizedDish, wines);
      const imagesPromise = generateDishImages(normalizedDish, 3);

      const [pairingSuggestions, images] = await Promise.all([
        pairingPromise,
        imagesPromise
      ]);

      if (!pairingSuggestions || pairingSuggestions.length === 0) {
        throw new Error("Não conseguimos encontrar sugestões para este prato. Tente descrever melhor.");
      }

      const enriched: Recommendation[] = pairingSuggestions.map(suggestion => ({
        wines: suggestion.wineIds
          .map(id => wines.find(w => w.id === id))
          .filter((w): w is Wine => w !== undefined),
        suggestion: {
          dishDescription: suggestion.dishDescription,
          recommendedGrape: suggestion.recommendedGrape,
          recommendedWineType: suggestion.recommendedWineType,
          reasoning: suggestion.reasoning
        },
        hasLoadedMore: false
      }));

      setRecommendations(enriched);
      setDishImages(images);
      setStatus('ready');
    } catch (err) {
      console.error("Search Error:", err);
      const msg = err instanceof Error ? err.message : 'Erro ao buscar harmonização.';
      setError(msg);
      setStatus('error');
    }
  }, [status, wines, setSearchParams]);

  useEffect(() => {
    if (status === 'ready' && wines.length > 0 && !initialQueryLoadAttempted.current) {
      const q = searchParams.get('q');
      if (q) {
        initialQueryLoadAttempted.current = true;
        handleSearch(q);
      }
    }
  }, [status, wines, searchParams, handleSearch]);

  const generateFavoriteId = useCallback((query: string, recommendation: Recommendation): string => {
    return `${query.toLowerCase().replace(/\s+/g, '-')}-${recommendation.suggestion.recommendedWineType.toLowerCase().replace(/\s+/g, '-')}`;
  }, []);

  const handleToggleFavorite = (query: string, recommendation: Recommendation, dishImage: string) => {
    const id = generateFavoriteId(query, recommendation);
    setFavorites(prev => {
      const isFavorite = prev.some(fav => fav.id === id);
      if (isFavorite) return prev.filter(fav => fav.id !== id);
      return [...prev, { id, query, recommendation, dishImage }];
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-cream-50">
      <Header favoritesCount={favorites.length} shoppingListCount={shoppingList.length} />
      <main className="flex-grow w-full">
        <Routes>
          <Route path="/" element={
            <div className="pb-20">
              <SearchBar
                onSearch={handleSearch}
                isSearching={status === 'searching'}
                isDisabled={status === 'loading-wines' || status === 'searching'}
                query={query}
                setQuery={setQuery}
              />
              {status === 'loading-wines' ? (
                <div className="text-center py-20 animate-fade-in"><Loader /><p className="mt-6 text-cabernet-900 font-display">Carregando adega...</p></div>
              ) : status === 'error' && !recommendations ? (
                <div className="text-center py-16 bg-white/60 max-w-2xl mx-auto mt-8 p-10 rounded-2xl border border-cabernet-100 animate-fade-in">
                  <h3 className="font-display font-bold text-2xl text-cabernet-900 mb-3">Ops!</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={() => handleSearch(query)}
                    className="text-sm font-bold text-cabernet-900 underline uppercase tracking-widest"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : !recommendations && status !== 'searching' ? (
                <div className="max-w-4xl mx-auto px-4 mt-8 animate-fade-in">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
                    <LogoWineGlassIcon className="w-14 h-14 mx-auto mb-6" stroke="#4A0E1C" fillSecondary="#C5A059" />
                    <h3 className="text-xl font-bold text-cabernet-900 mb-4">Descubra a Combinação Ideal</h3>
                    <p className="max-w-md mx-auto text-gray-500 text-sm">Digite sua refeição acima para receber sugestões exclusivas.</p>
                  </div>
                </div>
              ) : (
                <div className="px-4">
                  {status === 'searching' && <div className="text-center py-20 animate-fade-in"><Loader /><p className="mt-6 text-xl text-cabernet-900 font-display">Sommelier está analisando...</p></div>}
                  {recommendations && (
                    <ResultsDisplay
                      recommendations={recommendations}
                      query={query}
                      dishImages={dishImages}
                      favorites={favorites}
                      onToggleFavorite={handleToggleFavorite}
                      generateFavoriteId={generateFavoriteId}
                      shoppingList={shoppingList}
                      onToggleShoppingList={(id) => setShoppingList(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                    />
                  )}
                </div>
              )}
            </div>
          } />
          <Route path="/favorites" element={<div className="max-w-4xl mx-auto px-4 pt-12"><FavoritesPage favorites={favorites} onRemoveFavorite={(id) => setFavorites(p => p.filter(f => f.id !== id))} shoppingList={shoppingList} onToggleShoppingList={(id) => setShoppingList(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id])} /></div>} />
          <Route path="/shopping" element={<div className="max-w-4xl mx-auto px-4 pt-12"><ShoppingListPage wines={wines} shoppingList={shoppingList} onRemoveFromShoppingList={(id) => setShoppingList(p => p.filter(i => i !== id))} /></div>} />
        </Routes>
      </main>
      <footer className="py-8 text-center text-[10px] text-cabernet-900/60 uppercase tracking-[0.2em]">Sommelier IA - Harmonização com Inteligência</footer>
    </div>
  );
};

export default App;
