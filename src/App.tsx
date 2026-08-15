import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { SearchBar } from './components/SearchBar';
import { ArticleCard } from './components/ArticleCard';
import { HistoryDrawer } from './components/HistoryDrawer';
import { TableModal } from './components/TableModal';
import { DesktopSidebar } from './components/DesktopSidebar';
import { SplitPaneViewer } from './components/SplitPaneViewer';
import { DenseTableView } from './components/DenseTableView';
import { BatchExportModal } from './components/BatchExportModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
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
  ViewedArticleItem,
  ViewMode
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
  RefreshCw,
  Columns2,
  LayoutGrid,
  List,
  FileDown,
  Printer
} from 'lucide-react';

export default function App() {
  // Desktop layout & View modes
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  // Search parameters
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [onlyWithTables, setOnlyWithTables] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Bookmarks & History State (Pure in-memory client state)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [viewedArticles, setViewedArticles] = useState<ViewedArticleItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Modals state
  const [activeModalTable, setActiveModalTable] = useState<RegulationTable | null>(null);
  const [isBatchExportOpen, setIsBatchExportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Execute search filter
  const searchResults = useMemo(() => {
    let results = searchRegulations(REGULATIONS_DATABASE, {
      query: activeQuery,
      sectionFilter,
      onlyWithTables
    });

    if (selectedChapter) {
      results = results.filter((res) => res.article.chapter.includes(selectedChapter));
    }

    if (showBookmarksOnly) {
      results = results.filter((res) => bookmarkedIds.has(res.article.id));
    }

    return results;
  }, [activeQuery, sectionFilter, selectedChapter, onlyWithTables, showBookmarksOnly, bookmarkedIds]);

  const rawArticleList = useMemo(() => {
    return searchResults.map((r) => r.article);
  }, [searchResults]);

  // Keep selectedArticleId valid
  useEffect(() => {
    if (rawArticleList.length > 0) {
      if (!selectedArticleId || !rawArticleList.some((a) => a.id === selectedArticleId)) {
        setSelectedArticleId(rawArticleList[0].id);
      }
    } else {
      setSelectedArticleId(null);
    }
  }, [rawArticleList]);

  // Execute Search & Record History
  const handleSearchSubmit = (customQuery?: string) => {
    const termToSearch = (customQuery !== undefined ? customQuery : query).trim();
    setActiveQuery(termToSearch);

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
    setSelectedChapter(null);
  };

  const handleResetAllFilters = () => {
    setQuery('');
    setActiveQuery('');
    setSectionFilter('ALL');
    setSelectedChapter(null);
    setOnlyWithTables(false);
    setShowBookmarksOnly(false);
  };

  const handleSelectHistory = (item: SearchHistoryItem) => {
    setQuery(item.query);
    setActiveQuery(item.query);
    setSectionFilter(item.sectionFilter);
    setSelectedChapter(null);
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
      setSelectedChapter(null);
      setOnlyWithTables(false);
      setShowBookmarksOnly(false);
      setSelectedArticleId(articleId);

      if (viewMode === 'cards') {
        setTimeout(() => {
          const el = document.getElementById(`article-card-${articleId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  };

  // Keyboard Shortcuts Listener for Desktop Experience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA';

      // 1. Focus Search (Ctrl+K or '/')
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = document.getElementById('regulation-search-input');
        input?.focus();
        return;
      }
      if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        const input = document.getElementById('regulation-search-input');
        input?.focus();
        return;
      }

      // 2. Toggle Sidebar (Ctrl+B)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
        return;
      }

      // 3. View mode switches (Ctrl+1, Ctrl+2, Ctrl+3)
      if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        setViewMode('split');
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '2') {
        e.preventDefault();
        setViewMode('cards');
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '3') {
        e.preventDefault();
        setViewMode('dense');
        return;
      }

      // 4. Navigate previous / next article in split view ([ / ])
      if (!isInputFocused && viewMode === 'split' && rawArticleList.length > 0) {
        const curIdx = rawArticleList.findIndex((a) => a.id === selectedArticleId);
        if (e.key === '[' || e.key === 'k') {
          if (curIdx > 0) {
            setSelectedArticleId(rawArticleList[curIdx - 1].id);
          }
        } else if (e.key === ']' || e.key === 'j') {
          if (curIdx < rawArticleList.length - 1) {
            setSelectedArticleId(rawArticleList[curIdx + 1].id);
          }
        }
      }

      // 5. Help modal (?)
      if (e.key === '?' && !isInputFocused) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      // 6. Escape to close modals
      if (e.key === 'Escape') {
        if (activeModalTable) setActiveModalTable(null);
        if (isBatchExportOpen) setIsBatchExportOpen(false);
        if (isShortcutsOpen) setIsShortcutsOpen(false);
        if (isHistoryOpen) setIsHistoryOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedArticleId, rawArticleList, viewMode, activeModalTable, isBatchExportOpen, isShortcutsOpen, isHistoryOpen]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        historyCount={searchHistory.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        totalArticlesCount={REGULATIONS_DATABASE.length}
        onOpenBatchExport={() => setIsBatchExportOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main App Body with Sidebar & Content */}
      <div className="flex-1 flex max-w-[1700px] w-full mx-auto">
        {/* Left Desktop Sidebar */}
        <DesktopSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          articles={REGULATIONS_DATABASE}
          selectedSection={sectionFilter}
          onSelectSection={(sec) => {
            setSectionFilter(sec);
            setSelectedChapter(null);
          }}
          selectedChapter={selectedChapter}
          onSelectChapter={setSelectedChapter}
          onlyWithTables={onlyWithTables}
          onToggleOnlyWithTables={setOnlyWithTables}
          showBookmarksOnly={showBookmarksOnly}
          onToggleShowBookmarksOnly={setShowBookmarksOnly}
          bookmarkedCount={bookmarkedIds.size}
          onSelectKeyword={(kw) => {
            setQuery(kw);
            handleSearchSubmit(kw);
          }}
          activeQuery={activeQuery}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Verification Banner */}
          <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-xs border border-sky-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-sky-700/80 p-1.5 rounded-md">
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  中華民國《建築技術規則》全文法規與法定附表檢索系統
                </h2>
              </div>
              <p className="text-xs text-sky-200 leading-relaxed max-w-3xl">
                支援<strong>雙欄對照閱讀</strong>、<strong>法定附表美化</strong>、<strong>實務條號快搜</strong>與<strong>法規佐證引用產生</strong>。純本機即時演算，零語言模型幻覺。
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsBatchExportOpen(true)}
                className="px-3 py-2 bg-sky-800 hover:bg-sky-700 text-white font-medium text-xs rounded-lg border border-sky-600 transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>佐證匯出 / 列印</span>
              </button>

              <a
                href={MOJ_MAIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-slate-800/90 hover:bg-slate-800 text-slate-200 font-medium text-xs rounded-lg border border-slate-600 transition-colors inline-flex items-center gap-1.5 shadow-2xs"
              >
                <span>全國法規資料庫</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <SearchBar
            query={query}
            onQueryChange={(val) => {
              setQuery(val);
              if (val === '') {
                setActiveQuery('');
              }
            }}
            sectionFilter={sectionFilter}
            onSectionFilterChange={(sec) => {
              setSectionFilter(sec);
              setSelectedChapter(null);
            }}
            onlyWithTables={onlyWithTables}
            onToggleOnlyWithTables={setOnlyWithTables}
            onSearchSubmit={handleSearchSubmit}
            onClear={handleClear}
            resultCount={searchResults.length}
          />

          {/* Active Filter Chips & View Mode switch for mobile/tablet */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="filter-bookmarks-btn"
                type="button"
                onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  showBookmarksOnly
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>已收藏條文 ({bookmarkedIds.size})</span>
              </button>

              {activeQuery && (
                <span className="text-xs text-slate-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200 flex items-center gap-1.5">
                  <span>關鍵字：<strong className="text-sky-900">「{activeQuery}」</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setActiveQuery('');
                    }}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedChapter && (
                <span className="text-xs text-sky-800 bg-sky-100/70 px-2.5 py-1 rounded-md border border-sky-300 flex items-center gap-1.5">
                  <span>章節：<strong>{selectedChapter}</strong></span>
                  <button
                    type="button"
                    onClick={() => setSelectedChapter(null)}
                    className="text-sky-600 hover:text-sky-900 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}

              {(activeQuery || sectionFilter !== 'ALL' || selectedChapter || onlyWithTables || showBookmarksOnly) && (
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="text-xs text-slate-500 hover:text-slate-800 underline ml-1 cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>清除全部篩選</span>
                </button>
              )}
            </div>

            {/* Mobile View Mode switch */}
            <div className="flex md:hidden items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`p-1.5 rounded ${viewMode === 'split' ? 'bg-sky-800 text-white' : 'text-slate-600'}`}
                title="雙欄模式"
              >
                <Columns2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded ${viewMode === 'cards' ? 'bg-sky-800 text-white' : 'text-slate-600'}`}
                title="卡片模式"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('dense')}
                className={`p-1.5 rounded ${viewMode === 'dense' ? 'bg-sky-800 text-white' : 'text-slate-600'}`}
                title="清單模式"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: SPLIT DUAL-PANE (Default Recommended for Desktop) */}
          {viewMode === 'split' && (
            <SplitPaneViewer
              articles={rawArticleList}
              selectedArticleId={selectedArticleId}
              onSelectArticleId={setSelectedArticleId}
              searchQuery={activeQuery}
              fontSize={fontSize}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={handleToggleBookmark}
              onExpandTableModal={setActiveModalTable}
              onArticleViewed={handleArticleViewed}
            />
          )}

          {/* VIEW MODE 2: CARDS STREAM */}
          {viewMode === 'cards' && (
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
                    未找到包含「{activeQuery}」的條文。您可以嘗試縮短搜尋詞或重設條件。
                  </p>
                  <button
                    type="button"
                    onClick={handleResetAllFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors mt-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>重設所有搜尋條件</span>
                  </button>
                </div>
              )}
            </section>
          )}

          {/* VIEW MODE 3: DENSE TABLE VIEW */}
          {viewMode === 'dense' && (
            <DenseTableView
              articles={rawArticleList}
              searchQuery={activeQuery}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={handleToggleBookmark}
              onOpenArticleDetail={(id) => {
                setSelectedArticleId(id);
                setViewMode('split');
              }}
              onExpandTableModal={setActiveModalTable}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto text-center text-xs text-slate-600 select-none">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            法規資料權利歸屬中華民國全國法規資料庫 (MOJ) · 規範編號 PCode:{' '}
            <span className="font-mono text-slate-800 font-medium">{LAW_PCODE}</span>
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>純前端本機檢索 · 零外部 AI 幻覺</span>
            <button
              type="button"
              onClick={() => setIsShortcutsOpen(true)}
              className="text-sky-700 hover:underline cursor-pointer"
            >
              快捷鍵說明 (?)
            </button>
          </div>
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

      {/* Batch Export & Print Modal */}
      <BatchExportModal
        isOpen={isBatchExportOpen}
        onClose={() => setIsBatchExportOpen(false)}
        searchResults={rawArticleList}
        allArticles={REGULATIONS_DATABASE}
        bookmarkedIds={bookmarkedIds}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
