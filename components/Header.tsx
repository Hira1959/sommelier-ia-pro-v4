
import React from 'react';
import { Link } from 'react-router-dom';
import { GrapeDotsIcon, BookmarkIcon, ShoppingCartIcon } from './Icons';

interface HeaderProps {
    favoritesCount: number;
    shoppingListCount: number;
}

const Header: React.FC<HeaderProps> = ({ favoritesCount, shoppingListCount }) => {
    return (
        <header className="bg-cabernet-900 text-cream-50 pt-6 sm:pt-10 pb-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Container flex-col-reverse inverte a ordem no mobile: botões (fim do HTML) ficam no topo */}
                <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-6 sm:gap-4 mb-8">

                    {/* Spacer para manter o logo centralizado no desktop */}
                    <div className="hidden sm:block w-48"></div>

                    {/* Área do Logo - Sempre centralizada */}
                    <div className="flex flex-col items-center text-center w-full sm:w-auto">
                        <div className="mb-4">
                            <GrapeDotsIcon className="w-8 h-8 text-white opacity-95" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-sans font-normal text-white tracking-tight leading-none">
                            Sommelier IA
                        </h1>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-gold-500 font-bold mt-3 opacity-80">
                            Harmonizações de Excelência
                        </p>
                    </div>

                    {/* Área de Ações - Acima do logo no mobile e alinhada à direita */}
                    <div className="flex flex-wrap justify-end items-center gap-2 sm:gap-3 z-20 w-full sm:w-auto">
                        <Link
                            to="/shopping"
                            title="Ver Lista de compras"
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-[10px] font-bold uppercase tracking-widest shadow-sm hover:shadow-md whitespace-nowrap"
                        >
                            <ShoppingCartIcon className="h-4 w-4" />
                            <span className="hidden xs:inline">Lista de compras</span>
                            <span className="xs:hidden">Lista</span>
                            {shoppingListCount > 0 && (
                                <span className="bg-gold-500 text-cabernet-900 px-1.5 py-0.5 rounded-full text-[9px] font-black min-w-[1.4rem] text-center">
                                    {shoppingListCount}
                                </span>
                            )}
                        </Link>
                        <Link
                            to="/favorites"
                            title="Ver Favoritos"
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-[10px] font-bold uppercase tracking-widest shadow-sm hover:shadow-md whitespace-nowrap"
                        >
                            <BookmarkIcon className="h-4 w-4" />
                            <span className="hidden xs:inline">Favoritos</span>
                            <span className="xs:hidden">Favs</span>
                            {favoritesCount > 0 && (
                                <span className="bg-gold-500 text-cabernet-900 px-1.5 py-0.5 rounded-full text-[9px] font-black min-w-[1.4rem] text-center">
                                    {favoritesCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Gradiente de transição para o conteúdo */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full h-24 bg-gradient-to-t from-cream-50 to-transparent"></div>
        </header>
    );
};

export default Header;
