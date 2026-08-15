import React, { useRef, useEffect } from 'react';
import { Search, X, Table as TableIcon, Filter, Layers, Sparkles, RotateCcw } from 'lucide-react';
import { POPULAR_KEYWORDS } from '../data/regulationsData';
import { RegulationSection } from '../types';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  sectionFilter: string;
  onSectionFilterChange: (section: string) => void;
  onlyWithTables: boolean;
  onToggleOnlyWithTables: (checked: boolean) => void;
  onSearchSubmit: (customQuery?: string) => void;
  onClear: () => void;
  resultCount: number;
}

const SECTIONS: { label: string; value: string }[] = [
  { label: '全部編章', value: 'ALL' },
  { label: '總則編', value: '總則編' },
  { label: '建築設計施工編', value: '建築設計施工編' },
  { label: '建築構造編', value: '建築構造編' },
  { label: '建築設備編', value: '建築設備編' }
];

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  sectionFilter,
  onSectionFilterChange,
  onlyWithTables,
  onToggleOnlyWithTables,
  onSearchSubmit,
  onClear,
  resultCount
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    } else if (e.key === 'Escape') {
      onClear();
    }
  };

  const handleQuickKeyword = (kw: string) => {
    onQueryChange(kw);
    onSearchSubmit(kw);
  };

  return (
    <div id="search-bar-container" className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none">
          <Search className="w-5 h-5" />
        </div>
        <input
          id="regulation-search-input"
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="輸入關鍵字或條號（例：33、樓梯寬度、停車位、防火時效、無障礙、活載重）..."
          className="w-full pl-11 pr-32 py-3 bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 rounded-lg text-slate-900 text-sm sm:text-base outline-none transition-all placeholder:text-slate-400 font-normal"
        />

        <div className="absolute right-2 flex items-center gap-1.5">
          {/* Desktop shortcut hint */}
          {!query && (
            <span className="hidden sm:inline-flex items-center text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 pointer-events-none mr-1">
              Ctrl+K
            </span>
          )}

          {query && (
            <button
              id="clear-search-query-btn"
              type="button"
              onClick={onClear}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              title="清除輸入 (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            id="submit-search-btn"
            type="button"
            onClick={() => onSearchSubmit()}
            className="px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-medium text-xs sm:text-sm rounded-md transition-colors shadow-xs cursor-pointer"
          >
            檢索
          </button>
        </div>
      </div>

      {/* Filter Tabs & Table Filter */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        {/* Section Tabs */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            範疇：
          </span>
          {SECTIONS.map((sec) => {
            const isActive = sectionFilter === sec.value;
            return (
              <button
                key={sec.value}
                id={`filter-section-${sec.value}`}
                type="button"
                onClick={() => onSectionFilterChange(sec.value)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-800 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {sec.label}
              </button>
            );
          })}
        </div>

        {/* Toggle: Only with tables */}
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 select-none bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-md border border-amber-200 transition-colors">
            <input
              id="filter-only-tables-checkbox"
              type="checkbox"
              checked={onlyWithTables}
              onChange={(e) => onToggleOnlyWithTables(e.target.checked)}
              className="w-3.5 h-3.5 text-amber-600 rounded border-amber-300 focus:ring-amber-500 cursor-pointer"
            />
            <TableIcon className="w-3.5 h-3.5 text-amber-700" />
            <span>僅顯示含法定附表 (附表專區)</span>
          </label>

          <span className="text-xs text-slate-700 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 font-mono">
            結果：<strong className="text-sky-900">{resultCount}</strong> 筆
          </span>
        </div>
      </div>

      {/* Popular Quick Search Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2">
        <span className="text-[11px] text-slate-600 font-medium mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          實務常用：
        </span>
        {POPULAR_KEYWORDS.map((kw) => (
          <button
            key={kw}
            id={`quick-kw-${kw}`}
            type="button"
            onClick={() => handleQuickKeyword(kw)}
            className="px-2 py-0.5 text-xs bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-700 rounded border border-slate-200 hover:border-sky-200 transition-colors cursor-pointer"
          >
            {kw}
          </button>
        ))}
      </div>
    </div>
  );
};

