import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Bookmark, BookmarkCheck, FileText, ChevronDown, ChevronUp, ShieldCheck, Scale, Calendar } from 'lucide-react';
import { RegulationArticle, RegulationTable } from '../types';
import { BeautifiedTable } from './BeautifiedTable';
import { getHighlightedParts } from '../utils/searchEngine';
import { LAW_PCODE, LAW_TITLE } from '../data/regulationsData';

interface ArticleCardProps {
  article: RegulationArticle;
  searchQuery: string;
  fontSize: 'normal' | 'large' | 'xlarge';
  isBookmarked: boolean;
  onToggleBookmark: (articleId: string) => void;
  onExpandTableModal: (table: RegulationTable) => void;
  onArticleViewed?: (article: RegulationArticle) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  searchQuery,
  fontSize,
  isBookmarked,
  onToggleBookmark,
  onExpandTableModal,
  onArticleViewed
}) => {
  const [citationCopied, setCitationCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Generate standard legal citation string
  const handleCopyCitation = async () => {
    const citationText = `【法規佐證引用】
法規名稱：${LAW_TITLE}（全國法規資料庫 PCode: ${LAW_PCODE}）
編章條號：${article.section} ${article.chapter} ${article.articleNumber}${article.title ? ' (' + article.title + ')' : ''}
法規連結：${article.mojUrl}
條文內容摘要：
${article.content}
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

  return (
    <article
      id={`article-card-${article.id}`}
      className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs transition-all duration-200 overflow-hidden"
      onClick={() => onArticleViewed && onArticleViewed(article)}
    >
      {/* Top Meta Bar */}
      <div className="bg-slate-50/80 px-4 sm:px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getSectionBadgeColor(
              article.section
            )}`}
          >
            {article.section}
          </span>
          <span className="text-xs text-slate-700 font-medium">{article.chapter}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Bookmark Button */}
          <button
            id={`bookmark-btn-${article.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(article.id);
            }}
            className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
              isBookmarked
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title={isBookmarked ? '取消收藏' : '加入書籤收藏'}
          >
            {isBookmarked ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">已收藏</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">收藏</span>
              </>
            )}
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            title={isExpanded ? '收合條文' : '展開條文'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-6">
        {/* Title and Article Number */}
        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-baseline gap-2.5">
            <h3 className="text-lg sm:text-xl font-bold text-sky-950 tracking-tight font-serif">
              {article.articleNumber}
            </h3>
            {article.title && (
              <span className="text-sm sm:text-base font-semibold text-slate-700">
                {article.title}
              </span>
            )}
          </div>

          {article.lastAmended && (
            <div className="text-[11px] text-slate-600 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
              <Calendar className="w-3 h-3 text-slate-600" />
              <span>最後修正：{article.lastAmended}</span>
            </div>
          )}
        </div>

        {isExpanded && (
          <div>
            {/* Original Text */}
            <div className={`mt-2 ${fontClass}`}>
              {renderHighlightedContent(article.content)}
            </div>

            {/* Beautified Tables if available */}
            {article.tables && article.tables.length > 0 && (
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-900 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-sky-700" />
                  <span>法定規範附表（經排版美化）</span>
                </div>
                {article.tables.map((table) => (
                  <BeautifiedTable
                    key={table.id}
                    table={table}
                    searchQuery={searchQuery}
                    onExpandModal={onExpandTableModal}
                  />
                ))}
              </div>
            )}

            {/* Official Citation & Source Verification Footer */}
            <div className="mt-6 pt-4 border-t border-slate-200 bg-slate-50 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  法規來源：全國法規資料庫 (MOJ) ·{' '}
                  <strong className="font-mono text-slate-800">{LAW_PCODE}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Copy Citation Button */}
                <button
                  id={`copy-citation-btn-${article.id}`}
                  type="button"
                  onClick={handleCopyCitation}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg shadow-xs transition-colors"
                  title="複製標準格式之法規佐證引用文本"
                >
                  {citationCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">佐證已複製</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>複製法規佐證</span>
                    </>
                  )}
                </button>

                {/* Direct MOJ Article Link */}
                <a
                  id={`moj-single-link-${article.id}`}
                  href={article.mojUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-100/60 hover:bg-sky-200/70 border border-sky-300 rounded-lg transition-colors"
                  title="於全國法規資料庫查看本條原始官方發布頁"
                >
                  <span>官方條文 (MOJ)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
