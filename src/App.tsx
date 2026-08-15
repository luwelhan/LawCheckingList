import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { SearchBar } from './components/SearchBar';
import { ArticleCard } from './components/ArticleCard';
import { HistoryDrawer } from './components/HistoryDrawer';
import { TableModal } from './components/TableModal';
import {
  REGULATIONS_DATABASE,
  MOJ_MAIN_URL,
  LAW_PCODE,
  LAW_TITLE
} from './data/regulationsData';
import { searchRegulations } from './utils/searchEngine';
import {
  RegulationArticle,
  RegulationTable,
  SearchHistoryItem,
  ViewedArticleItem
} from './types';
import {
  BookOpen,
  Search,
  ExternalLink,
  ShieldCheck,
  Filter,
  Bookmark,
  Sparkles,
  Info,
  RefreshCw
} from 'lucide-react';

export default function App() {
  // Search parameters
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [onlyWithTables, setOnlyWithTables] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Bookmarks & History State (Pure in-memory client state as per "不要用 firebase，資料不需要持久化")
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [viewedArticles, setViewedArticles] = useState<ViewedArticleItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Table zoom modal
  const [activeModalTable, setActiveModalTable] = useState<RegulationTable | null>(null);

  // Debounced/instant query execution
  const searchResults = useMemo(() => {
    let results = searchRegulations(REGULATIONS_DATABASE, {
      query: activeQuery,
      sectionFilter,
      onlyWithTables
    });

    if (showBookmarksOnly) {
      results = results.filter((res) => bookmarkedIds.has(res.article.id));
    }

    return results;
  }, [activeQuery, sectionFilter, onlyWithTables, showBookmarksOnly, bookmarkedIds]);

  // Execute Search & Record History
  const handleSearchSubmit = (customQuery?: string) => {
    const termToSearch = (customQuery !== undefined ? customQuery : query).trim();
    setActiveQuery(termToSearch);

    // Add to in-memory search history if not duplicate of the latest
    if (termToSearch.length > 0) {
      const results = searchRegulations(REGULATIONS_DATABASE, {
        query: termToSearch,
        sectionFilter,
        onlyWithTables
      });

      const newHistoryItem: SearchHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        query: termToSearch,
        sectionFilter,
        onlyWithTables,
        timestamp: Date.now(),
        resultCount: results.length
      };

      setSearchHistory((prev) => [
        newHistoryItem,
        ...prev.filter((item) => item.query !== termToSearch).slice(0, 19)
      ]);
    }
  };

  const handleClear = () => {
    setQuery('');
    setActiveQuery('');
  };

  const handleSelectHistory = (item: SearchHistoryItem) => {
    setQuery(item.query);
    setActiveQuery(item.query);
    setSectionFilter(item.sectionFilter);
    setOnlyWithTables(item.onlyWithTables);
    setShowBookmarksOnly(false);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setSearchHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllHistory = () => {
    setSearchHistory([]);
  };

  const handleToggleBookmark = (articleId: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(articleId)) {
        next.delete(articleId);
      } else {
        next.add(articleId);
      }
      return next;
    });
  };

  const handleArticleViewed = (article: RegulationArticle) => {
    setViewedArticles((prev) => [
      {
        articleId: article.id,
        articleNumber: article.articleNumber,
        section: article.section,
        title: article.title,
        timestamp: Date.now()
      },
      ...prev.filter((item) => item.articleId !== article.id).slice(0, 9)
    ]);
  };

  const handleSelectArticleById = (articleId: string) => {
    const art = REGULATIONS_DATABASE.find((a) => a.id === articleId);
    if (art) {
      setQuery(art.articleNumber.replace(/[^\d]/g, ''));
      setActiveQuery(art.articleNumber.replace(/[^\d]/g, ''));
      setSectionFilter(art.section);
      setOnlyWithTables(false);
      setShowBookmarksOnly(false);

      // Scroll into view
      setTimeout(() => {
        const el = document.getElementById(`article-card-${articleId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        historyCount={searchHistory.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        totalArticlesCount={REGULATIONS_DATABASE.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Verification & Information Banner */}
        <div className="bg-sky-900 text-white rounded-xl p-4 sm:p-5 shadow-xs border border-sky-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-sky-700 p-1.5 rounded-md">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                中華民國《建築技術規則》全文法規與附表檢索系統
              </h2>
            </div>
            <p className="text-xs text-sky-200 leading-relaxed max-w-3xl">
              提供建築設計施工、建築構造與建築設備編章之關鍵字全文精準檢索。內含<strong>法定附表美化排版</strong>、<strong>一鍵法規佐證引用產生器</strong>與<strong>全國法規資料庫官方直連</strong>。本系統採本機演算法執行，絕無語言模型虛構幻覺。
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={MOJ_MAIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-sky-800 hover:bg-sky-700 text-white font-medium text-xs rounded-lg border border-sky-600 transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <span>全國法規資料庫</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Search & Filter Component */}
        <SearchBar
          query={query}
          onQueryChange={(val) => {
            setQuery(val);
            // Instant filter if clearing or single character
            if (val === '') {
              setActiveQuery('');
            }
          }}
          sectionFilter={sectionFilter}
          onSectionFilterChange={setSectionFilter}
          onlyWithTables={onlyWithTables}
          onToggleOnlyWithTables={setOnlyWithTables}
          onSearchSubmit={handleSearchSubmit}
          onClear={handleClear}
          resultCount={searchResults.length}
        />

        {/* Action Controls & Bookmarks Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <button
              id="filter-bookmarks-btn"
              type="button"
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                showBookmarksOnly
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>已收藏條文 ({bookmarkedIds.size})</span>
            </button>

            {activeQuery && (
              <span className="text-xs text-slate-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                檢索關鍵字：<strong className="text-sky-900">「{activeQuery}」</strong>
              </span>
            )}
          </div>

          <div className="text-xs text-slate-700 font-mono">
            顯示 {searchResults.length} 條規範（總庫 {REGULATIONS_DATABASE.length} 條）
          </div>
        </div>

        {/* Regulation Articles List */}
        <section id="regulation-results-section" className="space-y-4">
          {searchResults.length > 0 ? (
            searchResults.map(({ article }) => (
              <ArticleCard
                key={article.id}
                article={article}
                searchQuery={activeQuery}
                fontSize={fontSize}
                isBookmarked={bookmarkedIds.has(article.id)}
                onToggleBookmark={handleToggleBookmark}
                onExpandTableModal={setActiveModalTable}
                onArticleViewed={handleArticleViewed}
              />
            ))
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">未找到符合條件的法規條文</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                未找到包含「{activeQuery}」的條文。您可以嘗試縮短搜尋詞、檢查條號輸入，或切換「全部編章」後重新檢索。
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setActiveQuery('');
                  setSectionFilter('ALL');
                  setOnlyWithTables(false);
                  setShowBookmarksOnly(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors mt-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>重設所有搜尋條件</span>
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-700 space-y-2">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            法規資料權利歸屬中華民國全國法規資料庫 (MOJ) · 規範編號 PCode:{' '}
            <span className="font-mono text-slate-800 font-medium">{LAW_PCODE}</span>
          </p>
          <p className="text-[11px] text-slate-600">
            純前端程式碼檢索架構 · 不使用外部 AI 生成 · 零外部持久化儲存
          </p>
        </div>
      </footer>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        searchHistory={searchHistory}
        viewedArticles={viewedArticles}
        onSelectHistory={handleSelectHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onClearAllHistory={handleClearAllHistory}
        onSelectArticleById={handleSelectArticleById}
      />

      {/* Enlarged Table Modal */}
      <TableModal
        table={activeModalTable}
        onClose={() => setActiveModalTable(null)}
      />
    </div>
  );
}
