
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wine } from '../types';
import { ShoppingCartIcon, TrashIcon, ShopIcon, CloseIcon } from './Icons';

interface ShoppingListPageProps {
  wines: Wine[];
  shoppingList: string[];
  onRemoveFromShoppingList: (wineId: string) => void;
}

const parsePrice = (priceStr: string): number => {
  if (!priceStr) return 0;
  let cleaned = priceStr.replace(/[^\d,.]/g, '');
  const lastCommaIndex = cleaned.lastIndexOf(',');
  const lastDotIndex = cleaned.lastIndexOf('.');
  if (lastCommaIndex > lastDotIndex) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    cleaned = cleaned.replace(/,/g, '');
  }
  const price = parseFloat(cleaned);
  return isNaN(price) ? 0 : price;
};

const ShoppingListPage: React.FC<ShoppingListPageProps> = ({ wines, shoppingList, onRemoveFromShoppingList }) => {
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const selectedWines = wines.filter(wine => shoppingList.includes(wine.id));

  const filteredWines = selectedWines.filter(wine => {
    if (priceFilter === 'all') return true;
    const priceValue = wine.sale_price ? parsePrice(wine.sale_price) : parsePrice(wine.price);
    if (priceFilter === '0-50') return priceValue > 0 && priceValue <= 50;
    if (priceFilter === '50-100') return priceValue > 50 && priceValue <= 100;
    if (priceFilter === '100-200') return priceValue > 100 && priceValue <= 200;
    if (priceFilter === '200+') return priceValue > 200;
    return true;
  });

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-3xl w-full mx-auto -mt-16 animate-fade-in">
        <header className="flex justify-between items-center gap-3 pb-4 border-b border-gray-200 mb-6">
            <div className="flex items-center gap-3">
                <ShoppingCartIcon className="h-6 w-6 text-cabernet-900" />
                <h2 className="text-xl font-bold text-gray-800">Minha Lista de Compras</h2>
            </div>
            <Link to="/" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-cabernet-900 font-semibold transition-colors" aria-label="Fechar e voltar para a página inicial">
                <CloseIcon className="h-4 w-4" />
                <span>Fechar</span>
            </Link>
        </header>

        {selectedWines.length > 0 && (
             <div className="mb-6">
                <label htmlFor="price-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar por preço:
                </label>
                <select
                    id="price-filter"
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full sm:w-1/2 bg-gray-50 border-gray-300 rounded-md shadow-sm focus:ring-cabernet-900 focus:border-cabernet-900 transition"
                    aria-label="Filtrar vinhos por faixa de preço"
                >
                    <option value="all">Todos os preços</option>
                    <option value="0-50">Até R$50</option>
                    <option value="50-100">R$50 - R$100</option>
                    <option value="100-200">R$100 - R$200</option>
                    <option value="200+">Acima de R$200</option>
                </select>
            </div>
        )}

        <main className="space-y-4">
            {selectedWines.length === 0 ? (
                <div className="text-center py-12">
                    <ShoppingCartIcon className="h-16 w-16 mx-auto text-gray-300" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-700">Sua lista está vazia</h3>
                    <p className="mt-1 text-gray-500">Clique na estrela ao lado de um vinho para adicioná-lo aqui.</p>
                </div>
            ) : filteredWines.length === 0 ? (
                <div className="text-center py-12">
                     <h3 className="mt-4 text-lg font-semibold text-gray-700">Nenhum vinho encontrado</h3>
                     <p className="mt-1 text-gray-500">Não há vinhos na sua lista que correspondam a esta faixa de preço.</p>
                </div>
            ) : (
                filteredWines.map(wine => (
                    <div key={wine.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-start gap-3 sm:gap-4 transition-shadow hover:shadow-sm">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md flex-shrink-0 bg-white p-1">
                            <img
                                src={wine.image_link}
                                alt={wine.title}
                                loading="lazy"
                                className="w-full h-full object-contain rounded-sm"
                            />
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-bold text-base text-gray-800">{wine.title}</h4>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-gray-500">{wine.brand}</span>
                              <span className="text-xs text-gray-300">•</span>
                              {wine.sale_price ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400 line-through">{wine.price}</span>
                                  <span className="text-xs font-bold text-cabernet-900">{wine.sale_price}</span>
                                </div>
                              ) : (
                                <span className="text-xs font-bold text-gray-700">{wine.price}</span>
                              )}
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
                        <button
                            onClick={() => onRemoveFromShoppingList(wine.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors flex-shrink-0"
                            aria-label={`Remover ${wine.title} da lista de compras`}
                        >
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                ))
            )}
        </main>
    </div>
  );
};

export default ShoppingListPage;
