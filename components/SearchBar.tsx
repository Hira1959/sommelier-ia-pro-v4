
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WineGlassIcon } from './Icons';

interface SearchBarProps {
  onSearch: (dish: string) => void;
  isSearching: boolean;
  isDisabled: boolean;
  query: string;
  setQuery: (query: string) => void;
}

const MAX_LENGTH = 500;

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isSearching, isDisabled, query, setQuery }) => {
  const [error, setError] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [query]);

  const validateQuery = useCallback((currentQuery: string): boolean => {
    if (currentQuery.length > MAX_LENGTH) {
      setError(`Máximo de ${MAX_LENGTH} caracteres.`);
      return false;
    }
    setError(null);
    return true;
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (validateQuery(query) && !isDisabled && query.trim()) {
      onSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 -mt-10 relative z-30">
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-cabernet-900 mb-2">
                Descubra o Vinho Perfeito
            </h2>
            <p className="text-sm text-gray-500 mb-6 font-sans">
                Descreva seu prato com detalhes para nossa IA harmonizar.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                    <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    
                    <textarea
                        ref={textAreaRef}
                        rows={1}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ex: Picanha assada com batatas rústicas..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-11 pr-4 py-3.5 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-cabernet-100 focus:border-cabernet-800 transition-all outline-none resize-none overflow-hidden min-h-[56px]"
                        disabled={isDisabled}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isDisabled || !query.trim() || !!error}
                    className={`
                        w-full flex items-center justify-center gap-3 py-3 rounded-lg font-bold transition-all duration-300
                        ${isDisabled || !query.trim() || !!error 
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-inner' 
                            : 'bg-cabernet-900 text-white hover:bg-cabernet-800 shadow-lg transform hover:-translate-y-0.5 active:translate-y-0'}
                    `}
                >
                    {isSearching ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <WineGlassIcon className="w-4 h-4" />
                            <span className="text-sm">Encontrar Harmonizações</span>
                        </>
                    )}
                </button>

                {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
            </form>
        </div>
    </div>
  );
};

export default SearchBar;
