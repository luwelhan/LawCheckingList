import React, { useState, useEffect, useRef } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  FileText,
  ShieldCheck,
  Calendar,
  Sparkles,
  Search,
  BookOpen,
  ArrowUpRight,
  Maximize2
} from 'lucide-react';
import { RegulationArticle, RegulationTable } from '../types';
import { BeautifiedTable } from './BeautifiedTable';
import { getHighlightedParts } from '../utils/searchEngine';
import { LAW_PCODE, LAW_TITLE } from '../data/regulationsData';

interface SplitPaneViewerProps {
  articles: RegulationArticle[];
  selectedArticleId: string | null;
  onSelectArticleId: (id: string) => void;
  searchQuery: string;
  fontSize: 'normal' | 'large' | 'xlarge';
  bookmarkedIds: Set<string>;
  onToggleBookmark: (articleId: string) => void;
  onExpandTableModal: (table: RegulationTable) => void;
  onArticleViewed?: (article: RegulationArticle) => void;
}

export const SplitPaneViewer: React.FC<SplitPaneViewerProps> = ({
  articles,
  selectedArticleId,
  onSelectArticleId,
  searchQuery,
  fontSize,
  bookmarkedIds,
  onToggleBookmark,
  onExpandTableModal,
  onArticleViewed
}) => {
  const [citationCopied, setCitationCopied] = useState(false);
  const detailScrollRef = useRef<HTMLDivElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);

  // Active selected article object
  const activeArticle = articles.find((a) => a.id === selectedArticleId) || articles[0] || null;
  const activeIndex = articles.findIndex((a) => a.id === (activeArticle?.id || ''));

  // Trigger viewed effect on active article change
  useEffect(() => {
    if (activeArticle && onArticleViewed) {
      onArticleViewed(activeArticle);
    }
    // Scroll detail to top when changing article
    if (detailScrollRef.current) {
      detailScrollRef.current.scrollTop = 0;
    }
  }, [activeArticle?.id]);

  // Navigate Prev / Next
  const handlePrev = () => {
    if (activeIndex > 0) {
      onSelectArticleId(articles[activeIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (activeIndex < articles.length - 1) {
      onSelectArticleId(articles[activeIndex + 1].id);
    }
  };

  // Generate standard legal citation string
  const handleCopyCitation = async () => {
    if (!activeArticle) return;
    const citationText = `【法規佐證引用】
法規名稱：${LAW_TITLE}（全國法規資料庫 PCode: ${LAW_PCODE}）
編章條號：${activeArticle.section} ${activeArticle.chapter} ${activeArticle.articleNumber}${activeArticle.title ? ' (' + activeArticle.title + ')' : ''}
法規連結：${activeArticle.mojUrl}
條文內容摘要：
${activeArticle.content}
（資料來源：中華民國全國法規資料庫）`;

    try {
      await navigator.clipboard.writeText(citationText);
      setCitationCopied(true);
      setTimeout(() => setCitationCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy citation:', err);
    }
  };

  const getSectionBadgeColor = (section: string) => {
    switch (section) {
      case '總則編':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case '建築設計施工編':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case '建築構造編':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '建築設備編':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const fontClass = {
    normal: 'text-sm leading-relaxed',
    large: 'text-base leading-loose',
    xlarge: 'text-lg leading-loose'
  }[fontSize];

  // Highlight keywords in text content
  const renderHighlightedContent = (rawText: string) => {
    const lines = rawText.split('\n');
    return (
      <div className="space-y-2 text-slate-800 font-sans">
        {lines.map((line, lIdx) => {
          const parts = getHighlightedParts(line, searchQuery);
          const isItemHeader = /^([一二三四五六七八九十]+、|\d+[\.、]|\([一二三四五六七八九十\d]+\))/.test(line);

          return (
            <p
              key={lIdx}
              className={`${line.trim() === '' ? 'h-2' : ''} ${
                isItemHeader ? 'pl-2 text-slate-900 font-medium' : ''
              }`}
            >
              {parts.map((p, pIdx) =>
                p.isMatch ? (
                  <mark
                    key={pIdx}
                    className="bg-amber-200 text-amber-950 font-semibold px-1 rounded-xs"
                  >
                    {p.text}
                  </mark>
                ) : (
                  <span key={pIdx}>{p.text}</span>
                )
              )}
            </p>
          );
        })}
      </div>
    );
  };

  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">未找到符合條件的法規條文</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          請嘗試縮短搜尋詞或切換編章條件。
        </p>
      </div>
    );
  }

  return (
    <div
      id="split-pane-container"
      className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row h-[calc(100vh-14rem)] min-h-[580px] overflow-hidden"
    >
      {/* LEFT PANE: List of Articles */}
      <div
        id="split-pane-list"
        ref={listScrollRef}
        className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0 h-48 md:h-full"
      >
        {/* Left Pane Header */}
        <div className="p-3 border-b border-slate-200 bg-white flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            條文索引清單 ({articles.length})
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {activeIndex + 1} / {articles.length}
          </span>
        </div>

        {/* Left Pane List Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
          {articles.map((art, idx) => {
            const isSelected = activeArticle?.id === art.id;
            const isBookmarked = bookmarkedIds.has(art.id);
            const hasTables = art.tables && art.tables.length > 0;

            return (
              <div
                key={art.id}
                id={`split-item-${art.id}`}
                onClick={() => onSelectArticleId(art.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-sky-50/90 border-sky-400 shadow-xs ring-1 ring-sky-300'
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-bold text-sm text-slate-900">
                      {art.articleNumber}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${getSectionBadgeColor(
                        art.section
                      )}`}
                    >
                      {art.section}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {hasTables && (
                      <span
                        className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200 flex items-center gap-0.5"
                        title="包含法定附表"
                      >
                        <FileText className="w-2.5 h-2.5" />
                        <span>{art.tables!.length}表</span>
                      </span>
                    )}
                    {isBookmarked && (
                      <BookmarkCheck className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    )}
                  </div>
                </div>

                {art.title && (
                  <p className="text-xs font-medium text-slate-700 line-clamp-1 mb-1">
                    {art.title}
                  </p>
                )}

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {art.content.replace(/\n/g, ' ')}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANE: Article Detail View */}
      {activeArticle ? (
        <div
          id="split-pane-detail"
          ref={detailScrollRef}
          className="flex-1 flex flex-col bg-white overflow-y-auto custom-scrollbar h-full"
        >
          {/* Sticky Detail Header */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getSectionBadgeColor(
                    activeArticle.section
                  )}`}
                >
                  {activeArticle.section}
                </span>
                <span className="text-xs text-slate-600 font-medium hidden sm:inline">
                  {activeArticle.chapter}
                </span>
              </div>
            </div>

            {/* Actions: Prev / Next / Bookmark / Moj / Copy */}
            <div className="flex items-center gap-1.5">
              {/* Prev / Next Navigation Buttons */}
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 mr-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={activeIndex === 0}
                  className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 rounded transition-colors cursor-pointer"
                  title="上一條法規 ([ 鍵)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono text-slate-500 px-1">
                  {activeIndex + 1}/{articles.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={activeIndex === articles.length - 1}
                  className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 rounded transition-colors cursor-pointer"
                  title="下一條法規 (] 鍵)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Bookmark Button */}
              <button
                type="button"
                onClick={() => onToggleBookmark(activeArticle.id)}
                className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                  bookmarkedIds.has(activeArticle.id)
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title={bookmarkedIds.has(activeArticle.id) ? '取消收藏' : '加入書籤收藏'}
              >
                {bookmarkedIds.has(activeArticle.id) ? (
                  <BookmarkCheck className="w-4 h-4 text-amber-600" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>

              {/* Copy Citation */}
              <button
                type="button"
                onClick={handleCopyCitation}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg shadow-xs transition-colors cursor-pointer"
                title="複製法規佐證引用文本"
              >
                {citationCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold hidden sm:inline">已複製</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">佐證</span>
                  </>
                )}
              </button>

              {/* MOJ Link */}
              <a
                href={activeArticle.mojUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors"
                title="前往全國法規資料庫官方頁面"
              >
                <span>MOJ</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Article Detail Body */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Title block */}
            <div className="border-b border-slate-100 pb-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-2xl font-bold font-serif text-sky-950 tracking-tight">
                    {activeArticle.articleNumber}
                  </h2>
                  {activeArticle.title && (
                    <h3 className="text-lg font-bold text-slate-800">
                      {activeArticle.title}
                    </h3>
                  )}
                </div>

                {activeArticle.lastAmended && (
                  <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                    <Calendar className="w-3 h-3" />
                    最後修正：{activeArticle.lastAmended}
                  </span>
                )}
              </div>
            </div>

            {/* Regulation Full Text */}
            <div className={`text-slate-800 ${fontClass}`}>
              {renderHighlightedContent(activeArticle.content)}
            </div>

            {/* Tables if available */}
            {activeArticle.tables && activeArticle.tables.length > 0 && (
              <div className="mt-8 space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-900 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-sky-700" />
                  <span>法定規範附表（經排版美化）</span>
                </div>
                {activeArticle.tables.map((table) => (
                  <BeautifiedTable
                    key={table.id}
                    table={table}
                    searchQuery={searchQuery}
                    onExpandModal={onExpandTableModal}
                  />
                ))}
              </div>
            )}

            {/* Verification Footer */}
            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>法規資料來源：中華民國全國法規資料庫 (MOJ) PCode: {LAW_PCODE}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyCitation}
                className="text-sky-700 hover:text-sky-900 font-medium underline flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>複製本條法規佐證引用</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-12 text-slate-400">
          請從左側點選法規條文以檢視詳情
        </div>
      )}
    </div>
  );
};
